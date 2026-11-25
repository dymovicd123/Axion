const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const Course = require('../course-bank');
const Intervals = require('../course-intervals');
const Model = require('../public/assets/course-model');
const { createStore } = require('../store');
const answers = {
    'quadratic-4': {
        practice: {
            signs: { solution: '(-inf,-2) U (3,inf)' },
            downward: { solution: '[-1,5]' },
            rearrange: { solution: '(-3,2)' },
            special: { solution: '{2}' },
            combined: { solution: '[1,3)' }
        },
        assessment: {
            outside: { solution: '(-inf,-4] U [2,inf)' },
            inside: { solution: '(-2,5)' },
            irrational: { solution: '[-sqrt(3),sqrt(3)]' },
            noRoots: { solution: 'empty' },
            intersection: { solution: '(0,2]' }
        }
    },
    'quadratic-5': {
        practice: {
            model: { expression: 'x(25-x)' },
            maximum: { x: 6, area: 36 },
            height: { time: 2, height: 23 },
            threshold: { solution: '[1,3]' },
            trajectory: { a: '-1/5', b: '69/40', c: 2 }
        },
        assessment: {
            area: { x: 9, area: 81 }, revenue: { x: 20, revenue: 800 }, landing: { time: 4 }, width: { solution: '[4,8]' }, design: { a: -1, b: 6, c: 7 }
        }
    },
    'quadratic-final': {
        practice: {},
        assessment: {
            vertex: { h: -2, k: 3 },
            range: { solution: '(-inf,5]' },
            square: { h: '-7/2', k: '-9/4' },
            factor: { expression: '(x-4)(x+3)' },
            roots: { r1: '2-sqrt(3)', r2: '2+sqrt(3)' },
            parameter: { m: 9 },
            inequality: { solution: '(5,inf) U (-inf,-1)' },
            repeated: { solution: 'all' },
            area: { x: 7, area: 49 },
            threshold: { solution: '[2,6]' }
        }
    }
};
test(
    'all thirty questions in the last two lessons and final exam accept correct answers',
    () => {
        for (const [lesson, group] of Object.entries(answers)) {
            for (const [id, answer] of Object.entries(group.practice)) {
                assert.equal(Course.checkPractice(id, answer, lesson).correct, true, lesson + ':' + id);
            }
            assert.equal(Course.checkAssessment(group.assessment, lesson).passed, true, lesson);
        }
    });
test(
    'interval grading preserves endpoints, merges equivalent unions, supports exact radicals',
    () => {
        assert.equal(Intervals.equivalent('(3,∞) ∪ (−∞,−2)', '(-inf,-2) U (3,inf)'), true);
        assert.equal(Intervals.equivalent('[-1,1) U [1,4]', '[-1,4]'), true);
        assert.equal(Intervals.equivalent('[-1,1) U (1,4]', '[-1,4]'), false);
        assert.equal(Intervals.equivalent('[2,2]', '{2}'), true);
        assert.equal(Intervals.equivalent('(-inf,inf)', 'all'), true);
        assert.equal(Intervals.equivalent('∅', 'empty'), true);
        assert.equal(Intervals.equivalent('[-sqrt(3),sqrt(3)]', '[-sqrt(3),sqrt(3)]'), true);
        assert.equal(Intervals.equivalent('[-1.73,1.73]', '[-sqrt(3),sqrt(3)]'), false);
        for (const wrong of ['[-inf,5]', '[5,2]', '[2,2)', '(-inf,5)', '5', 'hello'])
            assert.equal(Intervals.equivalent(wrong, '(-inf,5]'), false);
    });
test(
    'trajectory verifies multiple models and rejects violations independently',
    () => {
        assert.equal(Model.analyse(-.2, 1.725, 2).correct, true);
        assert.equal(Model.analyse(-.15, 1.325, 2).correct, true);
        assert.equal(Model.analyse(-.05, .525, 2).checks.clearance, false);
        assert.equal(Model.analyse(-.3, 2.525, 2).checks.ceiling, false);
        assert.equal(Model.analyse(-.2, 1.725, 3).checks.launch, false);
        assert.equal(Model.analyse(-.2, 1.6, 2).checks.hoop, false);
        assert.equal(Model.analyse(-.01, .205, 2).checks.descending, false);
        assert.equal(Model.analyse(0, 1, 2), null);
        assert.equal(Model.analyse(NaN, 1, 2), null);
        assert.equal(Model.number('69/40'), 1.725);
        assert.equal(Model.number('1/0'), NaN);
        assert.equal(Course.checkPractice('trajectory', { a: '-.3', b: '2.525', c: '2' }, 'quadratic-5').correct, false);
    });
test(
    'final exam returns question-level feedback and rejects partial submissions',
    () => {
        const correct = answers['quadratic-final'].assessment;
        const wrong = structuredClone(correct);
        wrong.inequality.solution = '(-inf,-1] U [5,inf)';
        wrong.roots.r1 = wrong.roots.r2;
        const outcome = Course.checkAssessment(wrong, 'quadratic-final');
        assert.equal(outcome.score, 8);
        assert.equal(outcome.passed, false);
        assert.equal(outcome.results.find(r => r.id === 'inequality').correct, false);
        assert.throws(() => Course.checkAssessment({}, 'quadratic-final'));
    });
test(
    'last lessons and final exam persist independently without deleting earlier progress',
    async () => {
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'axion-final-'));
        try {
            const file = path.join(dir, 'db.json');
            await fs.writeFile(file, JSON.stringify({ courseAttempts: [{ kind: 'practice', exercise: 'classify', correct: true }] }));
            const store = createStore(file);
            for (const [lesson, group] of Object.entries(answers)) {
                for (const [id, answer] of Object.entries(group.practice))
                    await store.coursePractice({ id, answer }, lesson);
                await store.courseAssessment({ answers: group.assessment }, lesson);
            }
            const restarted = createStore(file);
            assert.equal((await restarted.courseStatus()).solved, 1);
            for (const id of Object.keys(answers))
                assert.equal((await restarted.courseStatus(id)).completed, true);
            assert.equal((await restarted.courseStatus('quadratic-final')).latestAssessment.score, 10);
        }
        finally {
            await fs.rm(dir, { recursive: true, force: true });
        }
    });
