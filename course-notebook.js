const { parse } = require('./expression');
const { polynomial, constant, close } = require('./course-algebra');
const tasks = [
    {
        id: 'vertex-form',
        lesson: 'quadratic-1',
        section: 'standard-form',
        title: 'Rewrite a quadratic',
        type: 'square',
        start: 'x^2-6x+2',
        goal: 'Write the expression in vertex form a(x−h)²+k.',
        solution: ['x^2-6x+9-7', '(x-3)^2-7']
    },
    {
        id: 'square-monic',
        lesson: 'quadratic-2',
        section: 'balance',
        title: 'Complete the square',
        type: 'square',
        start: 'x^2-10x+7',
        goal: 'Rewrite the expression as a completed square plus a constant.',
        solution: ['x^2-10x+25-18', '(x-5)^2-18']
    },
    {
        id: 'square-leading',
        lesson: 'quadratic-2',
        section: 'leading',
        title: 'Complete the square with a leading coefficient',
        type: 'square',
        start: '3x^2+18x+11',
        goal: 'Write the expression in vertex form.',
        solution: ['3(x^2+6x)+11', '3(x^2+6x+9)-16', '3(x+3)^2-16']
    },
    {
        id: 'equation-factors',
        lesson: 'quadratic-3',
        section: 'factor',
        title: 'Solve a quadratic equation',
        type: 'equation',
        start: '2x^2-8x+6=0',
        roots: [1, 3],
        goal: 'Transform the equation, then enter all its real roots.',
        solution: ['x^2-4x+3=0', '(x-1)(x-3)=0']
    },
    {
        id: 'equation-zero',
        lesson: 'quadratic-3',
        section: 'zero',
        title: 'Keep both roots',
        type: 'equation',
        start: '3x^2=12x',
        roots: [0, 4],
        goal: 'Find all real roots without losing a solution.',
        solution: ['3x^2-12x=0', '3x(x-4)=0']
    },
    {
        id: 'equation-irrational',
        lesson: 'quadratic-3',
        section: 'square',
        title: 'Solve with exact roots',
        type: 'equation',
        start: 'x^2+6x+2=0',
        roots: [-3 - Math.sqrt(7), -3 + Math.sqrt(7)],
        goal: 'Find both real roots. Use exact square roots.',
        solution: ['x^2+6x=-2', 'x^2+6x+9=7', '(x+3)^2=7']
    },
    {
        id: 'limit-cancel',
        lesson: 'limits-3',
        section: 'factor',
        title: 'Simplify before taking a limit',
        type: 'limit',
        start: '(x^2-9)/(x-3)',
        at: 3,
        answer: 6,
        goal: 'Rewrite the fraction until direct substitution is possible, then find the limit.',
        solution: ['((x-3)(x+3))/(x-3)', 'x+3']
    },
    {
        id: 'limit-factors',
        lesson: 'limits-3',
        section: 'factor',
        title: 'Factor a different numerator',
        type: 'limit',
        start: '(x^2+x-6)/(x-2)',
        at: 2,
        answer: 5,
        goal: 'Simplify the expression for x near, but not equal to, 2. Find its limit.',
        solution: ['((x-2)(x+3))/(x-2)', 'x+3']
    },
    {
        id: 'limit-common',
        lesson: 'limits-3',
        section: 'method',
        title: 'Combine the fractions',
        type: 'limit',
        start: '(1/(x+2)-1/2)/x',
        at: 0,
        answer: -0.25,
        goal: 'Remove the indeterminate form using algebra. Then find the limit.',
        solution: ['((2-(x+2))/(2(x+2)))/x', '(-x)/(2(x+2)x)', '-1/(2(x+2))']
    },
    {
        id: 'practice-vertex-negative',
        lesson: 'quadratic-1',
        section: 'standard-form',
        practiceOnly: true,
        title: 'A downward parabola',
        type: 'square',
        start: '-2x^2+12x-11',
        goal: 'Rewrite in vertex form.',
        solution: ['-2(x^2-6x)-11', '-2(x-3)^2+7']
    },
    {
        id: 'practice-square-fraction',
        lesson: 'quadratic-2',
        section: 'balance',
        practiceOnly: true,
        title: 'A fractional vertex',
        type: 'square',
        start: 'x^2+5x-4',
        goal: 'Complete the square. Keep the coefficients exact.',
        solution: ['x^2+5x+25/4-41/4', '(x+5/2)^2-41/4']
    },
    {
        id: 'practice-square-negative',
        lesson: 'quadratic-2',
        section: 'leading',
        practiceOnly: true,
        title: 'Factor out a negative coefficient',
        type: 'square',
        start: '-3x^2-12x+1',
        goal: 'Rewrite in vertex form.',
        solution: ['-3(x^2+4x)+1', '-3(x+2)^2+13']
    },
    {
        id: 'practice-roots-fractions',
        lesson: 'quadratic-3',
        section: 'factor',
        practiceOnly: true,
        title: 'A quadratic with a fractional root',
        type: 'equation',
        start: '6x^2+x-2=0',
        roots: [-2 / 3, 1 / 2],
        goal: 'Transform the equation and enter both real roots.',
        solution: ['(3x+2)(2x-1)=0']
    },
    {
        id: 'practice-roots-both-sides',
        lesson: 'quadratic-3',
        section: 'zero',
        practiceOnly: true,
        title: 'Terms on both sides',
        type: 'equation',
        start: '2x^2+3x=5x+12',
        roots: [-2, 3],
        goal: 'Solve the equation without losing either root.',
        solution: ['2x^2-2x-12=0', 'x^2-x-6=0', '(x-3)(x+2)=0']
    },
    {
        id: 'practice-limit-negative',
        lesson: 'limits-3',
        section: 'factor',
        practiceOnly: true,
        title: 'A limit at a negative input',
        type: 'limit',
        start: '(x^2-16)/(x+4)',
        at: -4,
        answer: -8,
        goal: 'Simplify before evaluating the limit.',
        solution: ['((x+4)(x-4))/(x+4)', 'x-4']
    },
    {
        id: 'practice-limit-cubic',
        lesson: 'limits-3',
        section: 'factor',
        practiceOnly: true,
        title: 'A difference of cubes',
        type: 'limit',
        start: '(x^3-8)/(x-2)',
        at: 2,
        answer: 12,
        goal: 'Factor the numerator and find the limit.',
        solution: ['((x-2)(x^2+2x+4))/(x-2)', 'x^2+2x+4']
    },
    {
        id: 'practice-limit-rational',
        lesson: 'limits-3',
        section: 'method',
        practiceOnly: true,
        title: 'A reciprocal difference',
        type: 'limit',
        start: '(1/(x+3)-1/3)/x',
        at: 0,
        answer: -1 / 9,
        goal: 'Combine fractions, simplify and enter the limit.',
        solution: ['((3-(x+3))/(3(x+3)))/x', '-1/(3(x+3))']
    }
];
function trim(p) {
    while (p.length > 1 && p.at(-1) === 0)
        p.pop();
    if (p.length > 13 || p.some(n => !Number.isFinite(n) || Math.abs(n) > 1e12))
        throw Error('Expression is too large.');
    return p;
}
function add(a, b, s = 1) {
    return trim(Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] || 0) + s * (b[i] || 0)));
}
function mul(a, b) {
    const p = Array(a.length + b.length - 1).fill(0);
    a.forEach((v, i) => b.forEach((w, j) => p[i + j] += v * w));
    return trim(p);
}
function same(a, b) {
    if (a.length !== b.length)
        return false;
    const scale = Math.max(...a.map(Math.abs), ...b.map(Math.abs));
    return scale === 0 || a.every((n, i) => Math.abs(n / scale - b[i] / scale) < 1e-10);
}
function zero(p) {
    return p.every(n => n === 0);
}
function proportional(a, b) {
    if (a.length !== b.length || zero(a) || zero(b))
        return false;
    const sa = a.at(-1), sb = b.at(-1);
    return a.every((n, i) => close(n / sa, b[i] / sb));
}
function source(value) {
    if (typeof value !== 'string' || !value.trim() || value.length > 140)
        throw Error('Enter a mathematical expression (up to 140 characters).');
    return value.replace(/²/g, '^2').replace(/³/g, '^3').replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/');
}
function expr(value) {
    return parse(source(value));
}
function equation(value) {
    const sides = source(value).split('=');
    if (sides.length !== 2)
        throw Error('Write a complete equation with an equals sign.');
    return add(polynomial(expr(sides[0])), polynomial(expr(sides[1])), -1);
}
function rational(n) {
    if (n.type === 'unary') {
        const [p, q] = rational(n.child);
        return [n.op === '-' ? p.map(x => -x) : p, q];
    }
    if (n.type !== 'binary')
        return [polynomial(n), [1]];
    if (n.op === '^') {
        const e = polynomial(n.right);
        if (e.length !== 1 || !Number.isInteger(e[0]) || Math.abs(e[0]) > 6)
            throw Error('Use integer powers from −6 to 6.');
        const [p, q] = rational(n.left);
        if (e[0] <= 0 && zero(p))
            throw Error('A zero base cannot be used with this exponent.');
        let a = [1], b = [1];
        for (let i = 0; i < Math.abs(e[0]); i++) {
            a = mul(a, p);
            b = mul(b, q);
        }
        return e[0] < 0 ? [b, a] : [a, b];
    }
    const [a, b] = rational(n.left), [c, d] = rational(n.right);
    if (n.op === '+' || n.op === '-')
        return [add(mul(a, d), mul(c, b), n.op === '-' ? -1 : 1), mul(b, d)];
    if (n.op === '*')
        return [mul(a, c), mul(b, d)];
    if (n.op === '/' && !zero(c))
        return [mul(a, d), mul(b, c)];
    throw Error('Division by an identically zero expression is not allowed.');
}
function equivalentRational(a, b) {
    const [p, q] = rational(a), [r, s] = rational(b);
    return !zero(q) && !zero(s) && same(mul(p, s), mul(r, q));
}
function vertexForm(n) {
    function isSquare(node) {
        if (node.type === 'unary')
            return isSquare(node.child);
        if (node.type === 'binary' && node.op === '*')
            return (polynomial(node.left).length === 1 && isSquare(node.right)) || (polynomial(node.right).length === 1 && isSquare(node.left));
        if (node.type === 'binary' && node.op === '/')
            return polynomial(node.right).length === 1 && isSquare(node.left);
        return node.type === 'binary' && node.op === '^' && polynomial(node.left).length === 2 && same(polynomial(node.right), [2]);
    }
    if (isSquare(n))
        return true;
    return n.type === 'binary' && ['+', '-'].includes(n.op) && ((isSquare(n.left) && polynomial(n.right).length === 1) || (isSquare(n.right) && polynomial(n.left).length === 1));
}
function evaluateAt(n, x) {
    if (n.type === 'number')
        return n.value;
    if (n.type === 'name' && n.value === 'x')
        return x;
    if (n.type === 'unary')
        return (n.op === '-' ? -1 : 1) * evaluateAt(n.child, x);
    if (n.type === 'call' && n.name === 'sqrt')
        return Math.sqrt(evaluateAt(n.argument, x));
    if (n.type === 'binary') {
        const a = evaluateAt(n.left, x), b = evaluateAt(n.right, x);
        if (!Number.isFinite(a) || !Number.isFinite(b))
            return NaN;
        if (n.op === '/')
            return b === 0 ? NaN : a / b;
        if (n.op === '+')
            return a + b;
        if (n.op === '-')
            return a - b;
        if (n.op === '*')
            return a * b;
        if (n.op === '^')
            return a === 0 && b <= 0 ? NaN : a ** b;
    }
    return NaN;
}
function getTask(lesson, id) {
    const task = tasks.find(t => t.lesson === lesson && t.id === id);
    if (!task)
        throw Error('Unknown notebook exercise.');
    return task;
}
function checkRows(task, rows) {
    if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12)
        throw Error('Enter between 1 and 12 steps.');
    let previous = task.start;
    return rows.map(value => {
        if (typeof value !== 'string' || value.length > 140)
            return { correct: false, message: 'Enter a shorter mathematical expression.' };
        try {
            let ok;
            if (task.type === 'equation')
                ok = proportional(equation(value), equation(task.start));
            else if (task.type === 'limit')
                ok = equivalentRational(expr(value), expr(task.start));
            else
                ok = same(polynomial(expr(value)), polynomial(expr(task.start)));
            if (!ok)
                return {
                    correct: false,
                    message: task.type === 'equation' ? 'This equation does not preserve the original quadratic. Check the terms and both sides.' : 'This expression is not equivalent to the original. Check the signs and operations.'
                };
            if (source(value).replace(/\s/g, '') === source(previous).replace(/\s/g, ''))
                return { correct: false, message: 'Write a new transformation, rather than copying the previous line.' };
            previous = value;
            return {
                correct: true,
                message: task.type === 'limit' ? 'Equivalent near the limit point.' : task.type === 'equation' ? 'Equivalent equation.' : 'Equivalent expression.'
            };
        }
        catch (e) {
            return { correct: false, message: e.message };
        }
    });
}
function check(lesson, input) {
    const task = getTask(lesson, input.id);
    const steps = checkRows(task, input.rows);
    if (!input.finish)
        return { steps, complete: false };
    if (steps.some(r => !r.correct))
        return { steps, complete: false, message: 'Correct the marked lines before submitting your solution.' };
    const last = input.rows.at(-1);
    let complete = false, message = '';
    if (task.type === 'square') {
        complete = vertexForm(expr(last));
        message = complete ? 'The final line is in vertex form.' : 'The expression is equivalent, but the final line must be in vertex form.';
    }
    else if (task.type === 'equation') {
        const roots = Array.isArray(input.answer) && input.answer.length === 2 && input.answer.every(v => typeof v === 'string' && v.length <= 140) ? input.answer.map(constant) : [];
        complete = roots.length === 2 && roots.slice().sort((a, b) => a - b).every((r, i) => close(r, task.roots.slice().sort((a, b) => a - b)[i]));
        message = complete ? 'Both roots are correct.' : 'Enter both distinct real roots. Check them in the original equation.';
    }
    else {
        const direct = evaluateAt(expr(last), task.at);
        complete = close(direct, task.answer) && typeof input.answer === 'string' && input.answer.length <= 140 && close(constant(input.answer), task.answer);
        message = complete ? 'The simplified expression and limit are correct.' : !Number.isFinite(direct) ? 'The final expression still cannot be evaluated at the limit point. Simplify further.' : 'Check the value of the simplified expression at the limit point.';
    }
    return { steps, complete, message };
}
function list(lesson, attempts = []) {
    return tasks.filter(t => t.lesson === lesson).map(({ roots, answer, solution, ...task }) => ({
        ...task,
        solved: attempts.some(a => a.lesson === lesson && a.id === task.id && a.complete),
        latest: attempts.filter(a => a.lesson === lesson && a.id === task.id).at(-1) || null
    }));
}
function worked(lesson, id) {
    const t = getTask(lesson, id);
    return {
        rows: t.solution,
        answer: t.type === 'equation' ? (t.id === 'equation-irrational' ? ['-3-sqrt(7)', '-3+sqrt(7)'] : t.roots.map(String)) : t.type === 'limit' ? String(t.answer) : null
    };
}
module.exports = { tasks, check, list, worked };
