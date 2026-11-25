const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PROFILE = 'local';
const schema = {
    progress: ['progress', { activity: ['TEXT', 'activity'], completed_at: ['TEXT', 'completedAt'] }],
    studyAttempts: ['study_attempts', { question_id: ['TEXT', 'questionId'], skill: ['TEXT', 'skill'], correct: ['INTEGER', 'correct'], attempted_at: ['TEXT', 'at'] }],
    labResults: ['lab_results', { kind: ['TEXT', 'kind'], challenge: ['TEXT', 'challenge'], completed_at: ['TEXT', 'completedAt'] }],
    lessonChecks: ['lesson_checks', { lesson_id: ['TEXT', 'lesson'], correct: ['INTEGER', 'correct'], attempted_at: ['TEXT', 'at'] }],
    experiments: ['experiments', { experiment_id: ['TEXT', 'id'], saved_at: ['TEXT', 'savedAt'] }],
    projectAttempts: ['project_attempts', { project_id: ['TEXT', 'project'], correct: ['INTEGER', 'correct'], attempted_at: ['TEXT', 'at'] }],
    courseAttempts: ['course_attempts', { lesson_id: ['TEXT', 'lesson'], kind: ['TEXT', 'kind'], exercise_id: ['TEXT', 'exercise'], correct: ['INTEGER', 'correct'], attempted_at: ['TEXT', 'at'] }],
    notebookAttempts: ['notebook_attempts', { lesson_id: ['TEXT', 'lesson'], task_id: ['TEXT', 'id'], correct: ['INTEGER', 'correct'], attempted_at: ['TEXT', 'at'] }],
    stereoResults: ['stereo_results', { task_id: ['TEXT', 'id'], generated: ['INTEGER', 'generated'], correct: ['INTEGER', 'correct'], completed_at: ['TEXT', 'completedAt'] }]
};

function paths(file) {
    const target = path.resolve(file);
    return /\.json$/i.test(target)
        ? { database: target.replace(/\.json$/i, '.sqlite'), legacy: target }
        : { database: target, legacy: target.replace(/(?:\.[^./\\]+)?$/, '.json') };
}

function open(filename) {
    const db = new DatabaseSync(filename);
    db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
    return db;
}

function transaction(db, mode, operation) {
    db.exec(`BEGIN ${mode}`);
    try {
        const result = operation();
        db.exec('COMMIT');
        return result;
    } catch (error) {
        db.exec('ROLLBACK');
        throw error;
    }
}

function legacyData(file) {
    if (!fs.existsSync(file)) return {};
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error('Invalid legacy JSON database.');
    for (const key of Object.keys(schema)) {
        if (Object.hasOwn(data, key) && (!Array.isArray(data[key]) || data[key].some(row => !row || typeof row !== 'object' || Array.isArray(row))))
            throw Error(`Invalid legacy collection: ${key}. Original JSON was not changed.`);
    }
    return data;
}

function initialize(filename, legacy) {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    const db = open(filename);
    try {
        transaction(db, 'IMMEDIATE', () => {
            const version = db.prepare('PRAGMA user_version').get().user_version;
            if (version === 1 || version === 2) return;
            if (version !== 0) throw Error(`Unsupported Axion database version ${version}.`);
            const data = legacyData(legacy);
            db.exec(`CREATE TABLE profiles (id TEXT PRIMARY KEY, display_name TEXT NOT NULL, created_at TEXT NOT NULL);
                CREATE TABLE migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL, source TEXT NOT NULL, imported_counts TEXT NOT NULL CHECK(json_valid(imported_counts)));`);
            const now = new Date().toISOString();
            db.prepare('INSERT INTO profiles VALUES (?, ?, ?)').run(PROFILE, 'Local learner', now);
            const counts = {};
            for (const [key, [table, columns]] of Object.entries(schema)) {
                const fields = Object.entries(columns).map(([name, [type, field]]) => `${name} ${type} GENERATED ALWAYS AS (json_extract(payload, '$.${field}')) STORED`);
                db.exec(`CREATE TABLE ${table} (
                    row_id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id),
                    payload TEXT NOT NULL CHECK(json_valid(payload) AND json_type(payload) = 'object'),
                    ${fields.join(', ')}
                ); CREATE INDEX ${table}_profile ON ${table}(profile_id, row_id);`);
                const first = Object.keys(columns)[0];
                db.exec(`CREATE INDEX ${table}_lookup ON ${table}(profile_id, ${first});`);
                const insert = db.prepare(`INSERT INTO ${table}(profile_id,payload) VALUES (?,?)`);
                const rows = data[key] || [];
                for (const row of rows) insert.run(PROFILE, JSON.stringify(row));
                counts[key] = rows.length;
            }
            db.prepare('INSERT INTO migrations VALUES (?, ?, ?, ?)').run(1, now, fs.existsSync(legacy) ? path.basename(legacy) : 'new database', JSON.stringify(counts));
            db.exec('PRAGMA user_version = 1');
        });
    } finally { db.close(); }
}

function snapshot(db, profile) {
    const data = {}, records = {};
    for (const [key, [table]] of Object.entries(schema)) {
        records[key] = db.prepare(`SELECT row_id, payload FROM ${table} WHERE profile_id = ? ORDER BY row_id`).all(profile);
        data[key] = records[key].map(row => JSON.parse(row.payload));
    }
    return { data, records };
}

function persist(db, records, data, profile) {
    for (const [key, [table]] of Object.entries(schema)) {
        const previous = records[key];
        const next = data[key].map(row => JSON.stringify(row));
        let prefix = 0;
        while (prefix < previous.length && prefix < next.length && previous[prefix].payload === next[prefix]) prefix++;
        if (prefix === previous.length && prefix === next.length) continue;
        if (prefix < previous.length) db.prepare(`DELETE FROM ${table} WHERE profile_id = ? AND row_id >= ?`).run(profile, previous[prefix].row_id);
        const insert = db.prepare(`INSERT INTO ${table}(profile_id,payload) VALUES (?,?)`);
        for (const payload of next.slice(prefix)) insert.run(profile, payload);
    }
}

function createDatabase(file, profile = PROFILE) {
    const { database, legacy } = paths(file);
    initialize(database, legacy);
    function use(mode, operation) {
        const db = open(database);
        try { return transaction(db, mode, () => operation(db)); }
        finally { db.close(); }
    }
    return {
        filename: database,
        async read() { return use('DEFERRED', db => snapshot(db, profile).data); },
        async edit(change) {
            return use('IMMEDIATE', db => {
                const { data, records } = snapshot(db, profile);
                const result = change(data);
                if (result && typeof result.then === 'function') throw Error('Store changes must be synchronous.');
                persist(db, records, data, profile);
                return result;
            });
        }
    };
}
module.exports = { createDatabase, paths, open, transaction };
