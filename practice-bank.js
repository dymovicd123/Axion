const bank = [
    {
        id: 'c1',
        skill: 'concept',
        kind: 'choice',
        title: 'What a limit asks',
        prompt: 'A function has a hole at x = 2 but approaches 5 from both sides. What is the limit?',
        options: ['0', '5', 'Does not exist'],
        correct: 1,
        hints: ['Think about the outputs near x=2, not the value at x=2.', 'A hole alone does not remove a limit.'],
        explanation: 'Both sides approach 5. The function can be undefined at the target and still have a limit of 5.'
    },
    {
        id: 'c2',
        skill: 'concept',
        kind: 'numeric',
        title: 'Reading a table',
        prompt: 'For f(x)=3x−1, what value is approached as x approaches 2?',
        formula: '\\lim_{x\\to2}(3x-1)',
        correct: 5,
        hints: ['This is a continuous linear function.', 'Substitute x=2.'],
        explanation: 'A linear function is continuous, so the limit equals 3(2)−1=5.'
    },
    {
        id: 'c3',
        skill: 'concept',
        kind: 'error',
        title: 'Find the mistake',
        prompt: 'A student evaluates the limit of (x²−4)/(x−2). Which statement is the error?',
        options: ['Substitution produces 0/0.', 'Therefore the limit must be 0.', 'Factoring may simplify the expression.'],
        correct: 1,
        hints: ['An indeterminate expression is not a limit value.', '0/0 means we need another method.'],
        explanation: '0/0 is an indeterminate form, not the limit. Factoring shows the nearby expression is x+2 and the limit is 4.'
    },
    {
        id: 'c4',
        skill: 'concept',
        kind: 'match',
        title: 'Match the statements',
        prompt: 'Match each situation to its conclusion.',
        rows: [['The output approaches 4 from both sides', 'Limit is 4'],
            ['Outputs approach different heights', 'DNE'],
            ['Function value at the point is missing but sides agree', 'Limit may exist']],
        options: ['Limit is 4', 'DNE', 'Limit may exist'],
        hints: ['Focus on the approach from both sides.', 'A missing function value alone is not decisive.'],
        explanation: 'A two-sided limit needs agreement from both sides; the exact value at the target is not necessary.'
    },
    {
        id: 's1',
        skill: 'sides',
        kind: 'choice',
        title: 'Conflicting sides',
        prompt: 'At x=2, the left side approaches 1 and the right side approaches 4. The two-sided limit is…',
        options: ['1', '4', '2.5', 'DNE'],
        correct: 3,
        hints: ['The two-sided limit requires both one-sided limits to agree.', '1 and 4 do not agree.'],
        explanation: 'Since the sides approach different numbers, there is no two-sided limit.'
    },
    {
        id: 's2',
        skill: 'sides',
        kind: 'numeric',
        title: 'From the left',
        prompt: 'For f(x)=x+3 when x<2 and f(x)=7 when x≥2, find the left-hand limit as x approaches 2.',
        formula: '\\lim_{x\\to2^-}f(x)',
        correct: 5,
        hints: ['Use only the branch for x<2.', 'For x<2, f(x)=x+3.'],
        explanation: 'Approaching from the left follows x+3, which tends to 5.'
    },
    {
        id: 's3',
        skill: 'sides',
        kind: 'error',
        title: 'Point values are not limits',
        prompt: 'A function approaches 2 from the left and 7 from the right; f(3)=2. Which claim is wrong?',
        options: ['The left limit is 2.', 'The right limit is 7.', 'The two-sided limit is 2 because f(3)=2.'],
        correct: 2,
        hints: ['The function value is separate from both one-sided limits.', 'Different one-sided limits mean DNE.'],
        explanation: 'The exact value f(3) cannot make unequal one-sided limits agree.'
    },
    {
        id: 's4',
        skill: 'sides',
        kind: 'match',
        title: 'Read the sides',
        prompt: 'Match the evidence to the conclusion.',
        rows: [['Left 2, right 2', 'Limit 2'], ['Left 2, right 5', 'DNE'], ['Left −1, right −1', 'Limit −1']],
        options: ['DNE', 'Limit 2', 'Limit −1'],
        hints: ['Only the pair of one-sided limits matters.', 'The sides must approach the same value.'],
        explanation: 'Equal side limits give that common value; unequal sides give DNE.'
    },
    {
        id: 't1',
        skill: 'continuity',
        kind: 'choice',
        title: 'Continuity test',
        prompt: 'The limit exists and equals 3, but f(1)=9. Is f continuous at x=1?',
        options: ['Yes', 'No'],
        correct: 1,
        hints: ['Continuity requires the limit and the function value to match.', '3 is not 9.'],
        explanation: 'No. The limit and actual function value must agree for continuity.'
    },
    {
        id: 't2',
        skill: 'continuity',
        kind: 'numeric',
        title: 'Repair the hole',
        prompt: 'For f(x)=x² when x≠3, what value should f(3) have to make f continuous at 3?',
        correct: 9,
        hints: ['Find the limit of x² as x approaches 3.', 'Continuity means f(3) equals that limit.'],
        explanation: 'The limit is 3²=9; choosing f(3)=9 fills the hole.'
    },
    {
        id: 't3',
        skill: 'continuity',
        kind: 'error',
        title: 'A jump is not removable',
        prompt: 'A function approaches 2 from the left and 5 from the right. Which statement is incorrect?',
        options: ['The two-sided limit does not exist.', 'Choosing f(a)=2 will make the function continuous.', 'A jump is different from a hole.'],
        correct: 1,
        hints: ['Changing a single point cannot change the trends on the two sides.', 'The sides still disagree after the point value is changed.'],
        explanation: 'A point value cannot repair a jump because the one-sided limits remain unequal.'
    },
    {
        id: 't4',
        skill: 'continuity',
        kind: 'match',
        title: 'Classify each graph',
        prompt: 'Match each description to a discontinuity type.',
        rows: [['One missing point, same limit on both sides', 'Removable'], ['Left and right approach different numbers', 'Jump'], ['Values grow without bound near the target', 'Infinite']],
        options: ['Jump', 'Infinite', 'Removable'],
        hints: ['A hole can be repaired with one point.', 'A vertical asymptote is an infinite discontinuity.'],
        explanation: 'A hole is removable, different side limits indicate a jump, and unbounded growth indicates an infinite discontinuity.'
    },
    {
        id: 'a1',
        skill: 'algebra',
        kind: 'steps',
        title: 'Factor to find the limit',
        prompt: 'Work through this limit one transformation at a time.',
        formula: '\\lim_{x\\to3}\\frac{x^2-9}{x-3}',
        steps: [{
                label: 'Choose the first useful step',
                options: ['Answer 0 because substitution is 0/0', 'Factor x²−9 into (x−3)(x+3)', 'Multiply both sides by x'],
                correct: 1,
                explanation: 'Factoring the difference of squares reveals a common factor.'
            },
            {
                label: 'Now simplify',
                options: ['Cancel x−3 for x≠3', 'Cancel x+3', 'Set x equal to 3 in the original expression'],
                correct: 0,
                explanation: 'For nearby x not equal to 3, the common x−3 factor cancels.'
            },
            {
                label: 'Finish',
                options: ['The limit is 0', 'The limit is 3', 'The limit is 6'],
                correct: 2,
                explanation: 'The simplified expression x+3 tends to 6 at x=3.'
            }],
        hints: ['Try direct substitution. If you see 0/0, look for a common factor.', 'Use the identity a²−b²=(a−b)(a+b).'],
        explanation: 'First factor, then cancel for x≠3, then substitute into x+3 to obtain 6.'
    },
    {
        id: 'a2',
        skill: 'algebra',
        kind: 'numeric',
        title: 'A related factorization',
        prompt: 'Calculate this limit. A fractional answer such as 1/4 is accepted.',
        formula: '\\lim_{x\\to5}\\frac{x^2-25}{x-5}',
        correct: 10,
        hints: ['Factor x²−25 as a difference of squares.', 'Cancel x−5 for x≠5 and use x+5.'],
        explanation: 'The expression equals x+5 for x≠5, so the limit is 10.'
    },
    {
        id: 'a3',
        skill: 'algebra',
        kind: 'steps',
        title: 'Rationalize a root',
        prompt: 'Use a conjugate to remove the 0/0 form.',
        formula: '\\lim_{x\\to4}\\frac{\\sqrt{x}-2}{x-4}',
        steps: [{
                label: 'Choose the method',
                options: ['Multiply by (√x+2)/(√x+2)', 'Cancel √x−2 immediately', 'Answer 0'],
                correct: 0,
                explanation: 'The conjugate turns the numerator into x−4.'
            },
            {
                label: 'Simplify',
                options: ['The result is 1/(√x+2)', 'The result is √x+2', 'The result is 1/(x−4)'],
                correct: 0,
                explanation: 'Cancel x−4 for x≠4 after rationalizing.'
            },
            {
                label: 'Evaluate',
                options: ['0', '1/4', '4'],
                correct: 1,
                explanation: 'Substitute x=4 into 1/(√x+2) to get 1/4.'
            }],
        hints: ['Roots often suggest multiplying by a conjugate.', 'Use (a−b)(a+b)=a²−b².'],
        explanation: 'Multiply by the conjugate, cancel x−4, then evaluate to obtain 1/4.'
    },
    {
        id: 'a4',
        skill: 'algebra',
        kind: 'error',
        title: 'Illegal cancellation',
        prompt: 'Which algebraic move is wrong when simplifying (x²−9)/(x−3)?',
        options: ['Factor x²−9 as (x−3)(x+3).', 'Cancel the factor x−3 for x≠3.', 'Cancel the number 3 from x²−9 and x−3.'],
        correct: 2,
        hints: ['You can cancel factors, not isolated terms inside sums.', 'x²−9 is not a product until you factor it.'],
        explanation: 'Cancellation only applies to common factors, not to a term inside an addition or subtraction.'
    },
    {
        id: 'd1',
        skill: 'derivatives',
        kind: 'numeric',
        title: 'Instantaneous velocity',
        prompt: 'A car has position s(t)=t² metres. What is its instantaneous velocity at t=5?',
        correct: 10,
        hints: ['Differentiate s(t) to get the velocity.', 'The derivative of t² is 2t.'],
        explanation: 'v(t)=2t, so v(5)=10 m/s.'
    },
    {
        id: 'd2',
        skill: 'derivatives',
        kind: 'choice',
        title: 'Average vs instantaneous',
        prompt: 'Which statement best describes a derivative?',
        options: ['The total distance', 'The instantaneous rate of change', 'The average of all function values'],
        correct: 1,
        hints: ['Think of what happens to the secant slope as the points move together.', 'The tangent slope is an instantaneous rate.'],
        explanation: 'A derivative is the instantaneous rate of change of a function.'
    },
    {
        id: 'd3',
        skill: 'derivatives',
        kind: 'numeric',
        title: 'Slope of a tangent',
        prompt: 'What is the derivative of f(x)=3x² at x=2?',
        correct: 12,
        hints: ['The derivative of 3x² is 6x.', 'Evaluate 6x at x=2.'],
        explanation: 'f′(x)=6x, so f′(2)=12.'
    },
    {
        id: 'd4',
        skill: 'derivatives',
        kind: 'error',
        title: 'Difference quotient',
        prompt: 'Which explanation is wrong?',
        options: ['Average change uses two points.', 'A derivative is the limit of average change over shorter intervals.', 'You can always divide by h after substituting h=0.'],
        correct: 2,
        hints: ['In the derivative formula, h approaches 0 but is not set to zero in the quotient.', 'Dividing by zero is undefined.'],
        explanation: 'First simplify the difference quotient while h≠0, then take the limit as h approaches 0.'
    },
    {
        id: 'i1',
        skill: 'integrals',
        kind: 'numeric',
        title: 'Constant flow',
        prompt: 'A pipe delivers 4 litres per second for 6 seconds. How many litres arrive?',
        correct: 24,
        hints: ['Multiply rate by time.', '4 × 6 = ?'],
        explanation: 'The amount is the area of a rectangle of height 4 and width 6, so 24 litres.'
    },
    {
        id: 'i2',
        skill: 'integrals',
        kind: 'choice',
        title: 'What does the integral measure?',
        prompt: 'If r(t) measures litres per second, what does the integral of r(t) over time represent?',
        options: ['Total litres delivered', 'Instantaneous speed', 'A time in seconds'],
        correct: 0,
        hints: ['Adding a small amount r(t)·dt gives volume.', 'The units are (litres/second)×seconds.'],
        explanation: 'An integral accumulates many small contributions and gives the total litres.'
    },
    {
        id: 'i3',
        skill: 'integrals',
        kind: 'numeric',
        title: 'Growing inflow',
        prompt: 'If r(t)=1+t L/s, find the volume delivered from t=0 to t=4.',
        formula: '\\int_0^4(1+t)\\,dt',
        correct: 12,
        hints: ['An antiderivative is t+t²/2.', 'Evaluate 4+4²/2.'],
        explanation: 'The integral equals [t+t²/2]₀⁴ = 4+8 = 12 litres.'
    },
    {
        id: 'i4',
        skill: 'integrals',
        kind: 'error',
        title: 'Rectangles and approximation',
        prompt: 'Which claim about Riemann sums is incorrect?',
        options: ['Narrower rectangles often give better estimates.',
            'A left-endpoint sum can underestimate an increasing function.',
            'Any sum with one rectangle always equals the exact integral.'],
        correct: 2,
        hints: ['Think of a changing function across the interval.', 'A rectangle usually misses some curved area.'],
        explanation: 'A finite sum of rectangles may only approximate the integral; more rectangles can improve accuracy.'
    }
];
const publicQuestion = q => {
    const { correct, steps, rows, explanation, ...rest } = q;
    return {
        ...rest,
        ...(rows ? { rows: rows.map(r => r[0]) } : {}),
        ...(steps ? { steps: steps.map(s => ({ label: s.label, options: s.options })) } : {})
    };
};
function numberValue(value) {
    if (typeof value === 'number')
        return Number.isFinite(value) ? value : NaN;
    const s = String(value ?? '').trim().replace(',', '.');
    if (/^[-+]?\d+(?:\.\d+)?\s*\/\s*[-+]?\d+(?:\.\d+)?$/.test(s)) {
        const [a, b] = s.split('/').map(Number);
        return b ? a / b : NaN;
    }
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s) ? Number(s) : NaN;
}
function check(q, answer, stepIndex) {
    if (q.kind === 'numeric') {
        const n = numberValue(answer);
        return { correct: Number.isFinite(n) && Math.abs(n - q.correct) < 1e-7, finished: true };
    }
    if (q.kind === 'match') {
        const ok = Array.isArray(answer) && answer.length === q.rows.length && q.rows.every((r, i) => answer[i] === q.options.indexOf(r[1]));
        return { correct: ok, finished: true };
    }
    if (q.kind === 'steps') {
        const i = Number(stepIndex);
        if (!Number.isInteger(i) || i < 0 || i >= q.steps.length)
            return null;
        const step = q.steps[i];
        const ok = Number(answer) === step.correct;
        return { correct: ok, finished: ok && i === q.steps.length - 1, stepExplanation: step.explanation };
    }
    return { correct: Number(answer) === q.correct, finished: true };
}
module.exports = { bank, publicQuestion, check };
