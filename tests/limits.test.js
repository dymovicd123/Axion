const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const Course = require('../course-bank');
const { createStore } = require('../store');
const answers = require('./limits-answers.json');

test('all 40 limits questions accept their reference solutions', () => {
    let count = 0;
    for (const [lesson, group] of Object.entries(answers)) {
        for (const [id, answer] of Object.entries(group.practice)) {
            assert.equal(Course.checkPractice(id, answer, lesson).correct, true, lesson + ':' + id);
            count++;
        }
        const assessment = Course.checkAssessment(group.assessment, lesson);
        assert.equal(assessment.passed, true, lesson);
        count += assessment.total;
    }
    assert.equal(count, 40);
});

test('accuracy experiment verifies the whole interval, not a few samples', () => {
    const check = delta => Course.checkPractice('precision', { delta }, 'limits-1').correct;
    for (const v of [.03, .04, .049, Math.sqrt(4.2) - 2, '1/25']) assert.equal(check(v), true);
    for (const v of [.01, .05, .1, -1, 'abc', '1/0']) assert.equal(check(v), false);
});

test('piecewise construction accepts alternatives and rejects constant or incorrect branches', () => {
    const check = model => Course.checkPractice('construct', model, 'limits-2').correct;
    assert.equal(check({ m1: -3, b1: 5, m2: 4, b2: -5, value: 4 }), true);
    assert.equal(check({ m1: '1/2', b1: '3/2', m2: '-1/3', b2: '-2/3', value: 4 }), true);
    assert.equal(check({ m1: 0, b1: 2, m2: 1, b2: -2, value: 4 }), false);
    assert.equal(check({ m1: 1, b1: 1, m2: 1, b2: -2, value: 2 }), false);
    assert.equal(check({ m1: 1, b1: 1, m2: 1, b2: -1, value: 4 }), false);
});

test('algebraic transformations require the correct factorisation and simplified expression', () => {
    const check = answer => Course.checkPractice('steps', answer, 'limits-3');
    assert.equal(check({ factor: '(x-3)(x-4)', simplify: '-3+x', limit: 1 }).correct, true);
    const wrong = check({ factor: 'x^2-7x+12', simplify: 'x-3', limit: 1 });
    assert.equal(wrong.correct, false);
    assert.equal(wrong.fields.factor, false);
    assert.equal(check({ factor: '(x-3)(x-4)', simplify: 'x-4', limit: 1 }).correct, false);
});

test('asymptote model checks all constraints and allows an interval of coefficients', () => {
    const check = model => Course.checkPractice('design', model, 'limits-4').correct;
    for (const A of [2, 3, 5, 6]) assert.equal(check({ A, h: -2, k: 3 }), true);
    for (const A of [0, -4, 1.99, 6.01]) assert.equal(check({ A, h: -2, k: 3 }), false);
    assert.equal(check({ A: 4, h: 2, k: 3 }), false);
    assert.equal(check({ A: 4, h: -2, k: 4 }), false);
});

test('limits assessments identify errors and preserve both courses on disk', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'axion-limits-'));
    try {
        const file = path.join(dir, 'db.json');
        await fs.writeFile(file, JSON.stringify({ courseAttempts: [{ kind: 'practice', exercise: 'classify', correct: true }] }));
        const store = createStore(file);
        const wrong = structuredClone(answers['limits-final'].assessment);
        wrong.asymptote.right = '-inf';
        assert.equal((await store.courseAssessment({ answers: wrong }, 'limits-final')).score, 7);
        for (const [lesson, group] of Object.entries(answers)) {
            for (const [id, answer] of Object.entries(group.practice)) await store.coursePractice({ id, answer }, lesson);
            await store.courseAssessment({ answers: group.assessment }, lesson);
        }
        const restarted = createStore(file);
        for (const id of Object.keys(answers)) assert.equal((await restarted.courseStatus(id)).completed, true, id);
        assert.equal((await restarted.courseStatus('quadratic-1')).solved, 1);
        assert.equal((await restarted.courseStatus('limits-final')).assessmentAttempts, 2);
    } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('individual algebra steps give feedback without requiring the other fields', () => {
    const check = (key, value) => Course.checkPracticeStep('steps', key, value, 'limits-3');
    assert.equal(check('factor', '(x-3)(x-4)').correct, true);
    assert.equal(check('factor', 'x^2-7x+12').correct, false);
    assert.equal(check('simplify', 'x-3').correct, true);
    assert.equal(check('limit', 1).correct, true);
    assert.equal(check('limit', 4).correct, false);
    assert.throws(() => check('unknown', '1'));
    assert.throws(() => Course.checkPracticeStep('steps', 'limit', 1, 'quadratic-1'));
});
