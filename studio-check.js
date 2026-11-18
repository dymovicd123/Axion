const Expression = require('./expression');

const challenges = [
    { id: 'hole', title: 'A removable hole', task: 'Build a function whose limit at x = 2 is 4 from both sides, but which is undefined exactly at x = 2.', a: 2, left: 4, right: 4, point: null },
    { id: 'changed', title: 'A misleading point', task: 'Build a function with a two-sided limit of 4 at x = 2, but set f(2) = 9.', a: 2, left: 4, right: 4, point: 9 },
    { id: 'jump', title: 'Two different approaches', task: 'At x = 1, make the left-hand limit 2 and the right-hand limit 5. Set f(1) = 8.', a: 1, left: 2, right: 5, point: 8 },
    { id: 'continuous', title: 'Make it continuous', task: 'Create a function with limit 6 at x = 3, and set f(3) = 6.', a: 3, left: 6, right: 6, point: 6 }
];

function validateSetup(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Invalid setup.');
    const mode = input.mode;
    if (typeof input.left !== 'string' || (mode === 'piecewise' && typeof input.right !== 'string')) throw Error('Enter a formula.');
    const config = {
        mode, left: input.left, right: mode === 'piecewise' ? input.right : input.left,
        a: input.a, pointMode: input.pointMode, pointValue: input.pointValue
    };
    const model = Expression.build(config);
    return { config: { ...config, a: model.a }, model };
}

function checkChallenge(id, input) {
    const challenge = challenges.find(c => c.id === id);
    if (!challenge) throw Error('Unknown challenge.');
    const { config, model } = validateSetup(input);
    if (Math.abs(model.a - challenge.a) > 1e-9) return { correct: false, message: `This task uses x = ${challenge.a}. Change the target point first.` };
    const actualPoint = model.at(model.a);
    const pointOk = challenge.point === null ? Number.isNaN(actualPoint) : Number.isFinite(actualPoint) && Math.abs(actualPoint - challenge.point) < .00001;
    const distances = [.08, .02, .005, .001, .0002];
    const probes = distances.map(d => Expression.sample(model, d));
    const closeTo = (key, target) => probes.every((row, i) => Number.isFinite(row[key]) && Math.abs(row[key] - target) < (i === 0 ? 4 : i === 1 ? 2 : i === 2 ? .7 : i === 3 ? .2 : .05));
    const leftOk = closeTo('left', challenge.left), rightOk = closeTo('right', challenge.right);
    const correct = pointOk && leftOk && rightOk;
    let message;
    if (correct) message = 'Your function matches the requested behavior at all the tested distances. This is a numerical check, not a formal proof.';
    else if (!leftOk) message = `The values approaching from the left do not converge to ${challenge.left} in these tests.`;
    else if (!rightOk) message = `The values approaching from the right do not converge to ${challenge.right} in these tests.`;
    else message = challenge.point === null ? `Check the value at x = ${challenge.a}. It must be undefined.` : `The function needs f(${challenge.a}) = ${challenge.point}.`;
    return { correct, message, challenge: id, testedDistances: distances, a: config.a };
}

module.exports = { challenges, validateSetup, checkChallenge };
