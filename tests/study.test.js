const test = require('node:test');
const assert = require('node:assert/strict');
const { bank, publicQuestion, check } = require('../practice-bank');
const { createStore } = require('../store');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const correctResponses = {
    c1: 1,
    c2: 5,
    c3: 1,
    c4: [0, 1, 2],
    s1: 3,
    s2: 5,
    s3: 2,
    s4: [1, 0, 2],
    t1: 1,
    t2: 9,
    t3: 1,
    t4: [2, 0, 1],
    a1: 2,
    a2: 10,
    a3: 1,
    a4: 2,
    d1: 10,
    d2: 1,
    d3: 12,
    d4: 2,
    i1: 24,
    i2: 0,
    i3: 12,
    i4: 2
};
test('question bank has 24 distinct questions, four per topic', () => {
    assert.equal(bank.length, 24);
    assert.equal(new Set(bank.map(q => q.id)).size, 24);
    for (const key of ['concept', 'sides', 'continuity', 'algebra', 'derivatives', 'integrals'])
        assert.equal(bank.filter(q => q.skill === key).length, 4);
});
test('public questions never expose the answer or worked explanation', () => {
    for (const q of bank) {
        const pub = publicQuestion(q);
        assert.ok(!('correct' in pub));
        assert.ok(!('explanation' in pub));
        if (q.kind === 'steps')
            assert.ok(pub.steps.every(s => !('correct' in s)));
        if (q.kind === 'match')
            assert.ok(pub.rows.every(r => typeof r === 'string'));
    }
});
test('all bank answer keys work, wrong answers fail', () => {
    for (const q of bank) {
        let value = correctResponses[q.id];
        if (q.kind === 'steps') {
            for (let i = 0; i < q.steps.length; i++) {
                assert.equal(check(q, q.steps[i].correct, i).correct, true, q.id + ':' + i);
                assert.equal(check(q, 99, i).correct, false, q.id + ':' + i);
            }
            assert.equal(check(q, value, q.steps.length - 1).finished, true);
        }
        else {
            assert.equal(check(q, value).correct, true, q.id);
            assert.equal(check(q, 'not a number').correct, false, q.id);
        }
    }
});
test('fractions and decimals accepted but division by zero rejected', () => {
    const q = bank.find(q => q.id === 'a2');
    assert.equal(check(q, '20/2').correct, true);
    assert.equal(check(q, '10,0').correct, true);
    assert.equal(check(q, '0/0').correct, false);
    assert.equal(check(q, 'Infinity').correct, false);
});
test('storage persists lessons, practice, and labs across store instances', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'axion-studio-'));
    try {
        const file = path.join(dir, 'db.json');
        await fs.copyFile(path.join(__dirname, 'fixtures/empty-db.json'), file);
        const st = createStore(file);
        await st.finish('lesson:limits-basics');
        await st.finish('lesson:limits-sides');
        const practice = await st.checkPractice({ id: 'a1', answer: 1, stepIndex: 0 });
        assert.equal(practice.correct, true);
        assert.equal(practice.finished, false);
        const bad = await st.checkPractice({ id: 'a1', answer: 0, stepIndex: 2 });
        assert.equal(bad.correct, false);
        const good = await st.checkPractice({ id: 'a1', answer: 2, stepIndex: 2 });
        assert.equal(good.finished, true);
        assert.equal((await st.checkLab({ kind: 'studio', challenge: 'hole', config: { prediction: 'DNE' } })).correct, false);
        assert.equal((await st.checkLab({ kind: 'studio', challenge: 'hole', config: { prediction: '4' } })).correct, true);
        assert.equal((await st.checkLab({ kind: 'studio', challenge: 'hole', config: { prediction: '4' } })).correct, true);
        assert.equal((await st.checkLab({ kind: 'builder', challenge: 'misleading', config: { left: 4, right: 4, point: 9 } })).correct, true);
        assert.equal((await st.checkLab({ kind: 'slope', challenge: 'tangent', config: { h: 0.05, prediction: '2' } })).correct, true);
        assert.equal((await st.checkLab({ kind: 'area', challenge: 'estimate', config: { n: 16, method: 'left' } })).correct, true);
        const after = createStore(file), data = await after.read();
        assert.ok(data.progress.some(p => p.activity === 'lesson:limits-sides'));
        assert.equal(data.labResults.length, 4);
        assert.ok(data.studyAttempts.some(a => a.questionId === 'a1' && a.correct));
        assert.equal((await st.checkLesson('limits-continuity', 2)).correct, true);
        assert.equal((await st.checkLesson('limits-algebra', 0)).correct, false);
        assert.ok((await after.progress()).some(p => p.activity === 'lesson:limits-continuity'));
        await after.resetStudy();
        assert.equal((await after.studyStatus()).labs.length, 0);
        assert.equal((await after.studyStatus()).attempts.length, 0);
    }
    finally {
        await fs.rm(dir, { recursive: true, force: true });
    }
});
test('every local page reference points to a file and scripts parse', () => {
    const pub = path.join(__dirname, '../public');
    const pages = require('node:fs').readdirSync(pub).filter(p => p.endsWith('.html'));
    assert.ok(pages.includes('index.html'));
    assert.ok(pages.includes('quadratic.html'));
    for (const page of pages) {
        const html = require('node:fs').readFileSync(path.join(pub, page), 'utf8');
        for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
            const link = match[1];
            if (!link.startsWith('http') && !link.startsWith('mailto:') && !link.includes('?'))
                assert.ok(require('node:fs').existsSync(path.join(pub, link)), page + ' -> ' + link);
        }
    }
    const names = ['server.js', 'store.js', 'practice-bank.js', 'lesson-checks.js', 'expression.js', 'studio-check.js'];
    names.push(...require('node:fs').readdirSync(path.join(pub, 'assets')).filter(x => x.endsWith('.js') && x !== 'mathjax.js').map(x => 'public/assets/' + x));
    for (const name of names) {
        const result = spawnSync(process.execPath, ['--check', path.join(__dirname, '..', name)], { encoding: 'utf8' });
        assert.equal(result.status, 0, name + ' ' + result.stderr);
    }
});
