const Algebra = require('./course-algebra');
const Intervals = require('./course-intervals');
const Model = require('./public/assets/course-model');
const { inequalities, applications, final } = require('./course-final');
const limits = require('./course-limits.json');
const { completing, equations } = require('./course-quadratics');
const lesson = {
    id: 'quadratic-1',
    title: 'Quadratic functions',
    practice: {
        classify: {
            keys: ['quadratic'],
            answer: ['yes'],
            feedback: 'Expanding (x + 2)² − x gives x² + 3x + 4, so it is quadratic. In (x + 2)² − x², the squared terms cancel, leaving 4x + 4.'
        },
        table: {
            keys: ['left', 'center', 'right'],
            answer: [1, -1, 1],
            feedback: 'Substitute each x into 2(x − 1)² − 1. The two points at the same distance from x = 1 have the same height.'
        },
        features: {
            keys: ['h', 'k', 'intercept'], answer: [2, -3, 5], feedback: 'In 2(x − 2)² − 3, the vertex is (2, −3). Set x = 0 to get the y-intercept: 2·4 − 3 = 5.'
        },
        standard: { keys: ['h', 'k'], answer: [2, 1], feedback: 'For −x² + 4x − 3, use h = −b/(2a) = 2, then f(2) = −4 + 8 − 3 = 1.' },
        construct: {
            keys: ['h', 'k', 'a'], answer: [-1, 2, -2], feedback: 'The maximum fixes the vertex (−1, 2). Substituting (1, −6) gives −6 = 4a + 2, so a = −2.'
        }
    },
    assessment: {
        shape: {
            keys: ['direction', 'h', 'k'],
            answer: ['down', -2, 3],
            feedback: 'The negative coefficient makes the graph open down. In −3(x + 2)² + 3, the vertex is (−2, 3).'
        },
        calculate: {
            keys: ['h', 'k', 'intercept'], answer: [3, -4, 14], feedback: 'For 2x² − 12x + 14, h = 12/4 = 3, f(3) = −4 and f(0) = 14.'
        },
        symmetry: {
            keys: ['otherX'], answer: [-5], feedback: 'The axis is x = −1. The given point at x = 3 is four units to the right, so its mirror is x = −5.'
        },
        range: {
            keys: ['bound', 'relation'],
            answer: [6, 'le'],
            feedback: 'The coefficient is negative and the vertex height is 6, so the function takes exactly the values y ≤ 6.'
        },
        build: {
            keys: ['a', 'h', 'k'], answer: [3, 2, -1], feedback: 'The minimum fixes (2, −1). Using (0, 11), 11 = 4a − 1, giving a = 3.'
        }
    }
};
function numeric(value) {
    if (typeof value === 'number')
        return Number.isFinite(value) ? value : NaN;
    if (typeof value !== 'string' || value.length > 60)
        return NaN;
    const s = value.trim().replace(/−/g, '-').replace(/,/g, '.');
    if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))
        return Number(s);
    const fraction = s.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
    if (fraction && Number(fraction[2]) !== 0)
        return Number(fraction[1]) / Number(fraction[2]);
    return Algebra.constant(s);
}
const lessons = Object.fromEntries([lesson, completing, equations, inequalities, applications, final, ...limits].map(item => [item.id, item]));
function getLesson(id = lesson.id) {
    if (!Object.hasOwn(lessons, id))
        throw Error('Unknown lesson.');
    return lessons[id];
}
function grade(question, submitted) {
    if (!submitted || typeof submitted !== 'object' || Array.isArray(submitted))
        throw Error('Enter an answer.');
    if (question.limitModel) {
        const values = Object.fromEntries(question.keys.map(key => [key, numeric(submitted[key])]));
        if (Object.values(values).some(v => !Number.isFinite(v) || Math.abs(v) > 10000)) {
            return {
                correct: false,
                fields: {},
                feedback: question.feedback,
                hint: question.hint,
                diagnostic: 'Enter finite numerical coefficients or fractions in all required fields.'
            };
        }
        const { delta, m1, b1, m2, b2, value, A, h, k } = values;
        let correct = false;
        let failed = [];
        if (question.limitModel === 'precision') {
            if (delta < .03 || delta > .1)
                failed.push('The radius must be between 0.03 and 0.1.');
            if (delta >= .03 && delta <= .1 && ((2 + delta) ** 2 > 4.2 + 1e-12 || (2 - delta) ** 2 < 3.8 - 1e-12))
                failed.push('The input interval extends beyond the permitted output band.');
        }
        else if (question.limitModel === 'piecewise') {
            if (Math.abs(m1) <= 1e-8 || Math.abs(m2) <= 1e-8)
                failed.push('Both branches must have a nonzero slope.');
            if (!Algebra.close(m1 + b1, 2))
                failed.push('The left branch does not approach the required height.');
            if (!Algebra.close(m2 + b2, -1))
                failed.push('The right branch does not approach the required height.');
            if (!Algebra.close(value, 4))
                failed.push('The assigned value at the boundary is incorrect.');
        }
        else if (question.limitModel === 'asymptote') {
            if (!Algebra.close(h, -2) || A === 0)
                failed.push('The vertical asymptote is incorrect or missing.');
            if (!Algebra.close(k, 3))
                failed.push('The horizontal asymptote is incorrect.');
            if (A <= 0)
                failed.push('The right branch must tend to positive infinity.');
            if (A < 2 || A > 6)
                failed.push('The curve does not meet the required height constraint with the required asymptotes.');
        }
        correct = failed.length === 0;
        return { correct, fields: {}, feedback: question.feedback, hint: question.hint, diagnostic: correct ? null : failed.join(' ') };
    }
    if (question.model) {
        const model = Model.analyse(...question.keys.map(key => Model.number(submitted[key])));
        if (!model)
            return {
                correct: false,
                fields: {},
                feedback: 'Use finite coefficients and a negative leading coefficient.',
                hint: 'The parabola must open downwards.',
                diagnostic: 'Enter finite coefficients with a negative leading coefficient.'
            };
        const labels = {
            launch: 'Launch height must be 2 m.',
            hoop: 'The curve must pass through (8, 3).',
            clearance: 'At x = 4 the height must be at least 4.5 m.',
            ceiling: 'The highest point of the flight must not exceed 6 m.',
            descending: 'The ball must be descending at the hoop.'
        };
        const failed = Object.keys(model.checks).filter(key => !model.checks[key]).map(key => labels[key]);
        return {
            correct: model.correct,
            fields: {},
            feedback: model.correct ? question.feedback : failed.join(' '),
            diagnostic: model.correct ? null : failed.join(' '),
            hint: model.correct ? null : 'Check the measurements in your model and revise the coefficients.'
        };
    }
    const fields = {};
    for (let i = 0; i < question.keys.length; i++) {
        const key = question.keys[i];
        const expected = question.answer[i];
        const value = submitted[key];
        if (typeof value !== 'string' && typeof value !== 'number')
            throw Error('Complete all answer fields.');
        if (typeof value === 'string' && (!value.trim() || value.length > 60))
            throw Error('Complete all answer fields.');
        if (expected?.type === 'polynomial') {
            fields[key] = Algebra.equivalent(value, expected.coefficients, expected.factored, expected.expanded);
        }
        else if (expected?.type === 'interval') {
            fields[key] = Intervals.equivalent(value, expected.value);
        }
        else if (expected?.type === 'constant') {
            fields[key] = Algebra.close(Algebra.constant(value), expected.value);
        }
        else if (expected?.type === 'roots') {
            const actual = [Algebra.constant(submitted.r1), Algebra.constant(submitted.r2)];
            const other = expected.values;
            fields[key] = (Algebra.close(actual[0], other[0]) && Algebra.close(actual[1], other[1])) ||
                (Algebra.close(actual[0], other[1]) && Algebra.close(actual[1], other[0]));
        }
        else {
            fields[key] = typeof expected === 'number' ? Algebra.close(numeric(value), expected) : value === expected;
        }
    }
    return { correct: Object.values(fields).every(Boolean), fields, feedback: question.feedback, hint: question.hint || null };
}
function checkPractice(id, answer, lessonId) {
    const lesson = getLesson(lessonId);
    if (!Object.hasOwn(lesson.practice, id))
        throw Error('Unknown exercise.');
    return grade(lesson.practice[id], answer);
}
function checkPracticeStep(id, key, value, lessonId) {
    if (lessonId !== 'limits-3' || id !== 'steps')
        throw Error('Unknown step exercise.');
    const question = getLesson(lessonId).practice[id];
    const index = question.keys.indexOf(key);
    if (index < 0)
        throw Error('Unknown step.');
    const result = grade({ keys: [key], answer: [question.answer[index]] }, { [key]: value });
    const messages = {
        factor: [
            'The product expands to the original numerator.', 'The expression must be a product of two linear factors whose sum of constants is −7 and product is 12.'
        ],
        simplify: ['This is the simplified expression for x ≠ 4.', 'Cancel only a common nonzero factor. What remains after removing x − 4?'],
        limit: ['The simplified expression approaches this value.', 'Evaluate your simplified expression at x = 4.']
    };
    return { correct: result.correct, message: messages[key][result.correct ? 0 : 1] };
}
function checkAssessment(answers, lessonId) {
    const lesson = getLesson(lessonId);
    if (!answers || typeof answers !== 'object' || Array.isArray(answers))
        throw Error('Complete the assessment.');
    const results = Object.entries(lesson.assessment).map(([id, q]) => ({ id, ...grade(q, answers[id]) }));
    const score = results.filter(r => r.correct).length;
    return { results, score, total: results.length, passed: score === results.length };
}
function status(attempts, lessonId) {
    const lesson = getLesson(lessonId);
    attempts = attempts.filter(a => (a.lesson || "quadratic-1") === lesson.id);
    const practice = {};
    for (const id of Object.keys(lesson.practice)) {
        const rows = attempts.filter(a => a.kind === 'practice' && a.exercise === id);
        practice[id] = { attempts: rows.length, solved: rows.some(a => a.correct), latest: rows.at(-1) || null };
    }
    const assessments = attempts.filter(a => a.kind === 'assessment');
    const solved = Object.values(practice).filter(p => p.solved).length;
    return {
        practice,
        solved,
        practiceTotal: Object.keys(practice).length,
        latestAssessment: assessments.at(-1) || null,
        assessmentAttempts: assessments.length,
        completed: solved === Object.keys(practice).length && assessments.some(a => a.passed)
    };
}
module.exports = { lesson, lessons, getLesson, checkPractice, checkPracticeStep, checkAssessment, status };
