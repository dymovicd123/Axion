const { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } = require('node:crypto');
const { promisify } = require('node:util');
const { createDatabase, open, transaction } = require('./database');
const derive = promisify(scrypt);
const SESSION_SECONDS = 7 * 24 * 60 * 60;
const COOKIE = 'axion_session';
const draftKey = /^axion-(?:(?:quadratic|limits)-(?:[1-5]|final)-draft|notebook-[a-z0-9_-]+|project-[a-z0-9_-]+|stereo-(?:progress-v2|work-v2|generator-current|generator-recent))$/i;
const fail = (message, status = 400) => Object.assign(new Error(message), { status });
const digest = token => createHash('sha256').update(token).digest('hex');
const cookieToken = header => (header || '').split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
function cookie(token, secure = false) {
    return `${COOKIE}=${token || ''}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${token ? SESSION_SECONDS : 0}${secure ? '; Secure' : ''}`;
}
async function hashPassword(password, salt = randomBytes(16).toString('hex')) {
    const hash = await derive(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    return `${salt}:${hash.toString('hex')}`;
}
async function matches(password, stored) {
    const candidate = await hashPassword(password, stored.split(':')[0]);
    return timingSafeEqual(Buffer.from(candidate), Buffer.from(stored));
}
function credentials(body, registering) {
    const username = typeof body?.username === 'string' ? body.username.trim().toLowerCase() : '';
    const password = body?.password;
    const displayName = typeof body?.displayName === 'string' ? body.displayName.trim() : '';
    if (!/^[a-z0-9_]{3,32}$/.test(username))
        throw fail('Use 3–32 letters, numbers or underscores for your username.');
    if (typeof password !== 'string' || password.length > 128 || password.length < (registering ? 8 : 1))
        throw fail('Password must contain 8–128 characters.');
    if (registering && (!displayName || displayName.length > 60))
        throw fail('Enter a name (1–60 characters).');
    return { username, password, displayName };
}
function createAuth(file) {
    const filename = createDatabase(file).filename;
    function use(fn, write = false) {
        const db = open(filename);
        try {
            return write ? transaction(db, 'IMMEDIATE', () => fn(db)) : fn(db);
        }
        finally {
            db.close();
        }
    }
    use(
        db => {
            if (db.prepare('PRAGMA user_version').get().user_version === 2)
                return;
            db.exec(`CREATE TABLE users (id TEXT PRIMARY KEY, profile_id TEXT UNIQUE NOT NULL REFERENCES profiles(id), username TEXT UNIQUE NOT NULL COLLATE NOCASE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
            CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);
            CREATE INDEX sessions_expiry ON sessions(expires_at);
            CREATE TABLE drafts (profile_id TEXT NOT NULL REFERENCES profiles(id), key TEXT NOT NULL, value TEXT NOT NULL CHECK(json_valid(value)), updated_at TEXT NOT NULL, PRIMARY KEY(profile_id,key));
            PRAGMA user_version = 2;`);
            db.prepare('INSERT INTO migrations VALUES (?,?,?,?)').run(2, new Date().toISOString(), 'accounts and drafts', '{}');
        },
        true);
    const publicUser = row => ({
        id: row.id, profileId: row.profile_id, username: row.username, displayName: row.display_name, legacy: row.profile_id === 'local'
    });
    function session(db, userId) {
        const token = randomBytes(32).toString('hex');
        db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
        db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(digest(token), userId, Date.now() + SESSION_SECONDS * 1000);
        return token;
    }
    const userQuery = 'SELECT u.*, p.display_name FROM users u JOIN profiles p ON p.id=u.profile_id';
    function authenticate(header) {
        const token = cookieToken(header);
        if (!token || !/^[a-f0-9]{64}$/.test(token))
            return null;
        return use(db => {
            const row = db.prepare(userQuery + ' JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at>?').get(digest(token), Date.now());
            return row ? publicUser(row) : null;
        });
    }
    function checkedDraft(key, value) {
        if (typeof key !== 'string' || key.length > 120 || !draftKey.test(key) || typeof value !== 'string' || Buffer.byteLength(value) > 1024 * 1024)
            throw fail('Invalid or oversized draft.');
        try {
            JSON.parse(value);
        }
        catch {
            throw fail('Invalid draft data.');
        }
    }
    return {
        authenticate,
        setupNeeded: () => use(db => !db.prepare('SELECT 1 FROM users LIMIT 1').get()),
        async register(body, oldCookie) {
            const { username, password, displayName } = credentials(body, true);
            const passwordHash = await hashPassword(password);
            return use(
                db => {
                    if (db.prepare('SELECT 1 FROM users WHERE username=?').get(username))
                        throw fail('Username is already taken.', 409);
                    const id = randomUUID(), now = new Date().toISOString();
                    const profile = db.prepare('SELECT 1 FROM users LIMIT 1').get() ? randomUUID() : 'local';
                    if (profile === 'local')
                        db.prepare('UPDATE profiles SET display_name=? WHERE id=?').run(displayName, profile);
                    else
                        db.prepare('INSERT INTO profiles VALUES (?,?,?)').run(profile, displayName, now);
                    db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').run(id, profile, username, passwordHash, now);
                    const old = cookieToken(oldCookie);
                    if (old)
                        db.prepare('DELETE FROM sessions WHERE token_hash=?').run(digest(old));
                    return { user: publicUser(db.prepare(userQuery + ' WHERE u.id=?').get(id)), token: session(db, id) };
                },
                true);
        },
        async login(body, oldCookie) {
            const { username, password } = credentials(body, false);
            const row = use(db => db.prepare(userQuery + ' WHERE u.username=?').get(username));
            const valid = await matches(password, row?.password_hash || `${'0'.repeat(32)}:${'0'.repeat(128)}`);
            if (!row || !valid)
                throw fail('Incorrect username or password.', 401);
            return use(
                db => {
                    const old = cookieToken(oldCookie);
                    if (old)
                        db.prepare('DELETE FROM sessions WHERE token_hash=?').run(digest(old));
                    return { user: publicUser(row), token: session(db, row.id) };
                },
                true);
        },
        logout(header) {
            const token = cookieToken(header);
            if (token)
                use(db => db.prepare('DELETE FROM sessions WHERE token_hash=?').run(digest(token)), true);
        },
        drafts(user) {
            return use(db => Object.fromEntries(db.prepare('SELECT key,value FROM drafts WHERE profile_id=?').all(user.profileId).map(row => [row.key, row.value])));
        },
        saveDraft(user, key, value) {
            checkedDraft(key, value);
            use(db => db.prepare('INSERT INTO drafts VALUES (?,?,?,?) ON CONFLICT(profile_id,key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at').run(user.profileId, key, value, new Date().toISOString()), true);
        },
        importDrafts(user, items) {
            if (!user.legacy)
                throw fail('Only the original profile can import old browser drafts.', 403);
            if (!items || typeof items !== 'object' || Array.isArray(items) || Object.keys(items).length > 100)
                throw fail('Invalid draft collection.');
            for (const [key, value] of Object.entries(items))
                checkedDraft(key, value);
            return use(
                db => {
                    let imported = 0;
                    const insert = db.prepare('INSERT OR IGNORE INTO drafts VALUES (?,?,?,?)');
                    for (const [key, value] of Object.entries(items))
                        imported += Number(insert.run(user.profileId, key, value, new Date().toISOString()).changes);
                    return imported;
                },
                true);
        }
    };
}
module.exports = { createAuth, cookie, draftKey };
