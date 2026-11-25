const checks = {
    'limits-basics': {
        activity: 'lesson:limits-basics',
        correct: 1,
        explanation: 'The function may have a limit even when it is undefined at the exact point.'
    },
    'limits-sides': {
        activity: 'lesson:limits-sides',
        correct: 3,
        explanation: 'Different one-sided limits mean that the two-sided limit does not exist.'
    },
    'limits-continuity': {
        activity: 'lesson:limits-continuity',
        correct: 2,
        explanation: 'Continuity requires the function value to equal the common limit.'
    },
    'limits-algebra': {
        activity: 'lesson:limits-algebra',
        correct: 1,
        explanation: 'Factoring helps remove the indeterminate form before evaluation.'
    },
    'derivatives': {
        activity: 'lesson:derivatives',
        correct: 1,
        explanation: 'The derivative of t² is 2t, so the instantaneous velocity at 4 seconds is 8 m/s.'
    },
    'integrals': {
        activity: 'lesson:integrals',
        correct: 2,
        explanation: 'The accumulated volume is 3 litres/second × 5 seconds = 15 litres.'
    }
};
module.exports = { checks };
