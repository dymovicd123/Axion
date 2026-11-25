const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const Course = require('../course-bank');
const Algebra = require('../course-algebra');
const { createStore } = require('../store');
const answers = {
    'quadratic-2': {
        practice: {
            identity: { half: 5, missing: 25 },
            balance: { h: 4, k: -9 },
            leading: { a: 3, h: 2, k: -7 },
            rewrite: { expression: '6+4x-2x^2' },
            minimum: { a: 2, h: -3, k: -13, other: -1 }
        },
        assessment: {
            monic: { h: -6, k: -25 },
            fractional: { h: '-5/2', k: '-1/4' },
            negative: { a: -3, h: 3, k: 19 },
            compare: { expression: '2x^2-12x-5' },
            level: { a: 4, h: 2, k: -3, other: 3 }
        }
    },
    'quadratic-3': {
        practice: {
            factor: { expression: '(x+5)(x-2)', r1: 2, r2: -5 },
            zero: { r1: 4, r2: 0 },
            square: { r1: '-2+sqrt(7)', r2: '-2-sqrt(7)' },
            formula: { d: 49, r1: '1/2', r2: -3 },
            discriminant: { d: -8, count: 0, m: 9 }
        },
        assessment: {
            factor: { expression: '(x-3)(x-2)', r1: 2, r2: 3 },
            zero: { r1: -2, r2: 0 },
            formula: { d: 25, r1: -2, r2: '1/2' },
            irrational: { r1: '1+sqrt(5)', r2: '1-sqrt(5)' },
            parameter: { m: 4, root: -2 }
        }
    }
};
test(
    'all twenty new practice and assessment keys accept valid solutions',
    () => {
        for (const [lesson, group] of Object.entries(answers)) {
            for (const [id, answer] of Object.entries(group.practice))
                assert.equal(Course.checkPractice(id, answer, lesson).correct, true, lesson + ':' + id);
            assert.equal(Course.checkAssessment(group.assessment, lesson).passed, true);
        }
    });
test(
    'polynomial comparison checks coefficients and requested form, not graph samples',
    () => {
        assert.equal(Algebra.equivalent('(2x+10)(x-2)/2', [-10, 3, 1], true), true);
        assert.equal(Algebra.equivalent('x^2+3x-10', [-10, 3, 1], true), false);
        assert.equal(Algebra.equivalent('(x+5)(x-3)', [-10, 3, 1], true), false);
        assert.equal(Algebra.equivalent('6+4x-2x²', [6, 4, -2], false, true), true);
        assert.equal(Algebra.equivalent('-2(x-1)^2+8', [6, 4, -2], false, true), false);
        assert.equal(Algebra.equivalent('x^2+3x-10+(x^2-1)/(x-1)-(x+1)', [-10, 3, 1]), false);
        assert.equal(Algebra.equivalent('alert(1)', [1]), false);
        assert.equal(Algebra.equivalent('1/0', [1]), false);
        assert.equal(Algebra.equivalent('x^100000', [1]), false);
    });
test(
    'roots must be complete and distinct; alternative exact expressions accepted',
    () => {
        const check = a => Course.checkPractice('square', a, 'quadratic-3');
        assert.equal(check({ r1: '-2+√7', r2: '-2-sqrt(7)' }).correct, true);
        assert.equal(check({ r1: '-2+sqrt(7)', r2: '-2+sqrt(7)' }).correct, false);
        assert.equal(check({ r1: 'x', r2: '-2-sqrt(7)' }).correct, false);
        assert.throws(() => check({ r1: '1', r2: '' }));
        assert.throws(() => Course.checkPractice('factor', {}, 'quadratic-99'));
    });
test(
    'old attempts migrate implicitly and three lessons persist independently',
    async () => {
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'axion-course-extension-'));
        try {
            const file = path.join(dir, 'db.json');
            await fs.writeFile(file, JSON.stringify({ courseAttempts: [{ kind: 'practice', exercise: 'classify', correct: true }] }));
            const store = createStore(file);
            for (const [lesson, group] of Object.entries(answers)) {
                await store.courseAssessment({ answers: group.assessment }, lesson);
                assert.equal((await store.courseStatus(lesson)).completed, false);
                for (const [id, answer] of Object.entries(group.practice))
                    await store.coursePractice({ id, answer }, lesson);
            }
            const restarted = createStore(file);
            assert.equal((await restarted.courseStatus()).solved, 1);
            assert.equal((await restarted.courseStatus('quadratic-2')).completed, true);
            assert.equal((await restarted.courseStatus('quadratic-3')).completed, true);
            await assert.rejects(() => restarted.courseStatus('unknown'), { status: 400 });
        }
        finally {
            await fs.rm(dir, { recursive: true, force: true });
        }
    });
