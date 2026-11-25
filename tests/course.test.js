const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { checkPractice, checkAssessment, lesson } = require('../course-bank');
const { createStore } = require('../store');

const correct = {
    shape: { direction: 'down', h: -2, k: 3 },
    calculate: { h: 3, k: -4, intercept: 14 },
    symmetry: { otherX: -5 },
    range: { relation: 'le', bound: 6 },
    build: { a: 3, h: 2, k: -1 }
};
const practice = {
    classify: { quadratic: 'yes' },
    table: { left: 1, center: -1, right: 1 },
    features: { h: 2, k: -3, intercept: 5 },
    standard: { h: 2, k: 1 },
    construct: { h: -1, k: 2, a: -2 }
};

test('quadratic exercise keys and alternative numeric formats', () => {
    for (const [id, answer] of Object.entries(practice)) assert.equal(checkPractice(id, answer).correct, true);
    assert.equal(checkPractice('table', { left: '2/2', center: '−1', right: '1,0' }).correct, true);
    assert.equal(checkPractice('construct', { h: '-1', k: '2', a: '0' }).correct, false);
    assert.equal(checkPractice('construct', { h: '-1', k: '2', a: '-4/2' }).correct, true);
    assert.equal(checkPractice('table', { left: '1/0', center: '-1', right: '1' }).correct, false);
    assert.throws(() => checkPractice('standard', { h: '2', k: '' }));
    assert.throws(() => checkPractice('__proto__', {}));
});

test('assessment requires every field and grades individual questions', () => {
    assert.equal(checkAssessment(correct).passed, true);
    const wrong = structuredClone(correct);
    wrong.shape.h = 2;
    wrong.range.relation = 'ge';
    const result = checkAssessment(wrong);
    assert.equal(result.score, 3);
    assert.equal(result.passed, false);
    assert.equal(result.results[0].fields.h, false);
    assert.throws(() => checkAssessment({ shape: correct.shape }));
});

test('quadratic results and completion persist without modifying old progress', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'axion-course-'));
    try {
        const file = path.join(dir, 'db.json');
        await fs.writeFile(file, JSON.stringify({ progress: [{ activity: 'lesson:limits-basics' }] }));
        const store = createStore(file);
        assert.equal((await store.courseStatus()).solved, 0);
        const wrong = await store.coursePractice({ id: 'classify', answer: { quadratic: 'no' } });
        assert.equal(wrong.correct, false);
        await store.courseAssessment({ answers: correct });
        assert.equal((await store.courseStatus()).completed, false);
        await Promise.all(Object.entries(practice).map(([id, answer]) => store.coursePractice({ id, answer })));
        const restarted = createStore(file);
        const status = await restarted.courseStatus();
        assert.equal(status.solved, 5);
        assert.equal(status.completed, true);
        assert.equal(status.practice.classify.attempts, 2);
        assert.equal(status.assessmentAttempts, 1);
        assert.equal((await restarted.progress())[0].activity, 'lesson:limits-basics');
    } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('assessment and exercise identifiers are distinct', () => {
    assert.equal(Object.keys(lesson.practice).length, 5);
    assert.equal(Object.keys(lesson.assessment).length, 5);
    assert.equal(new Set([...Object.keys(lesson.practice), ...Object.keys(lesson.assessment)]).size, 10);
});
