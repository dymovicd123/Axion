const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { createDatabase } = require('../database');
const { createStore } = require('../store');

const sample = {
    progress: [{ id: 'old-p', activity: 'lesson:limits-basics', completedAt: '2026-11-01T00:00:00Z' }],
    studyAttempts: [{ id: 's', questionId: 'q', correct: false }],
    labResults: [{ id: 'l', kind: 'studio', challenge: 'line' }],
    lessonChecks: [{ id: 'c', lesson: 'limits-basics', correct: true }],
    experiments: [{ id: 'e', config: { a: 2 }, note: 'saved' }],
    projectAttempts: [{ id: 'p', project: 'container', correct: true, model: { formula: 'x' } }],
    courseAttempts: [{ kind: 'practice', exercise: 'classify', correct: true }, { kind: 'assessment', lesson: 'limits-1', score: 4 }],
    notebookAttempts: [{ lesson: 'limits-3', id: 'limit-cancel', rows: ['x+3'], correct: true }],
    stereoResults: [{ id: 'gen-2-1-123', generated: true, correct: true }]
};

function temporary(run) {
    return async () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'axion-sql-'));
        try { await run(dir); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
    };
}

test('SQLite imports all nine collections exactly once, preserving legacy bytes and ordering', temporary(async dir => {
    const json = path.join(dir, 'db.json'), filename = path.join(dir, 'db.sqlite');
    const source = JSON.stringify(sample, null, 2);
    fs.writeFileSync(json, source);
    const db = createDatabase(filename);
    assert.deepEqual(await db.read(), sample);
    assert.equal(fs.readFileSync(json, 'utf8'), source);
    assert.equal(fs.readFileSync(filename).subarray(0, 16).toString(), 'SQLite format 3\0');
    await db.edit(data => data.courseAttempts.push({ kind: 'practice', exercise: 'new', lesson: 'quadratic-2', correct: true }));
    fs.writeFileSync(json, '{}');
    const reopened = createDatabase(json);
    assert.equal((await reopened.read()).courseAttempts.length, 3);
    assert.deepEqual((await reopened.read()).stereoResults, sample.stereoResults);
    const sql = new DatabaseSync(filename);
    try {
        const row = sql.prepare('SELECT lesson_id, exercise_id, correct FROM course_attempts WHERE exercise_id = ?').get('new');
        assert.deepEqual({ ...row }, { lesson_id: 'quadratic-2', exercise_id: 'new', correct: 1 });
        const migration = sql.prepare('SELECT * FROM migrations').all();
        assert.equal(migration.length, 1);
        assert.equal(JSON.parse(migration[0].imported_counts).courseAttempts, 2);
        assert.equal(sql.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
        assert.equal(sql.prepare('PRAGMA foreign_key_check').all().length, 0);
    } finally { sql.close(); }
}));

test('invalid legacy data does not mark migration complete; valid source can be retried', temporary(async dir => {
    const json = path.join(dir, 'db.json');
    fs.writeFileSync(json, '{"courseAttempts":null}');
    assert.throws(() => createDatabase(json), /Invalid legacy collection/);
    assert.equal(fs.readFileSync(json, 'utf8'), '{"courseAttempts":null}');
    fs.writeFileSync(json, JSON.stringify(sample));
    assert.deepEqual(await createDatabase(json).read(), sample);
}));

test('transaction rolls back on failure and independent store instances do not lose writes', temporary(async dir => {
    const filename = path.join(dir, 'db.sqlite');
    const first = createDatabase(filename), second = createDatabase(filename);
    await assert.rejects(first.edit(data => { data.progress.push({ activity: 'bad' }); throw Error('rollback'); }), /rollback/);
    assert.deepEqual((await second.read()).progress, []);
    const a = createStore(filename), b = createStore(filename);
    await Promise.all(Array.from({length: 20}, (_, i) => (i % 2 ? a : b).coursePractice({ id: 'standard', answer: { h: 2, k: 1 } })));
    assert.equal((await createStore(filename).read()).courseAttempts.length, 20);
}));

test('profile foreign key and profile-scoped reads preserve a separate profile', temporary(async dir => {
    const filename = path.join(dir, 'db.sqlite');
    const store = createDatabase(filename);
    const sql = new DatabaseSync(filename);
    try {
        sql.exec('PRAGMA foreign_keys=ON');
        assert.throws(() => sql.prepare('INSERT INTO progress(profile_id,payload) VALUES (?,?)').run('missing', '{}'), /FOREIGN KEY/);
        sql.prepare('INSERT INTO profiles VALUES (?,?,?)').run('future', 'Another learner', '2026-11-25');
        sql.prepare('INSERT INTO progress(profile_id,payload) VALUES (?,?)').run('future', '{"activity":"private"}');
        assert.deepEqual((await store.read()).progress, []);
        await store.edit(data => { data.progress.push({ activity: 'own' }); });
        await store.edit(data => { data.progress = []; });
        assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM progress WHERE profile_id=?').get('future').n, 1);
    } finally { sql.close(); }
}));
