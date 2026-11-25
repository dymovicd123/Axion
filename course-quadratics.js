const square = (keys, answer, feedback, hint) => ({ keys, answer, feedback, hint });
const poly = (coefficients, factored = false) => ({ type: 'polynomial', coefficients, factored, expanded: !factored });
const roots = values => ({ type: 'roots', values });
const completing = {
    id: 'quadratic-2',
    title: 'Completing the square',
    practice: {
        identity: square(['half', 'missing'], [5, 25], 'Half of 10 is 5, and 5² = 25. The completed square is (x + 5)².', 'Compare the coefficient of x with the middle term of (x + p)².'),
        balance: square(['h', 'k'], [4, -9], 'x² − 8x + 7 = (x − 4)² − 16 + 7 = (x − 4)² − 9.', 'Half the linear coefficient is −4. Remember to subtract the square you add.'),
        leading: square(['a', 'h', 'k'], [3, 2, -7], '3x² − 12x + 5 = 3(x² − 4x) + 5 = 3(x − 2)² − 12 + 5.', 'Factor out 3 from the x² and x terms first. The correction inside the brackets is also multiplied by 3.'),
        rewrite: square(['expression'], [poly([6, 4, -2])], '−2(x − 1)² + 8 = −2(x² − 2x + 1) + 8 = −2x² + 4x + 6.', 'Expand the square, distribute the negative coefficient to all three terms, then combine constants.'),
        minimum: square(
            ['a', 'h', 'k', 'other'],
            [2, -3, -13, -1],
            '2x² + 12x + 5 = 2(x + 3)² − 13. At y = −5, (x + 3)² = 4, giving x = −5 or −1.',
            'Complete the square first. Points at the same height are equally far from the axis of symmetry.')
    },
    assessment: {
        monic: square(['h', 'k'], [-6, -25], 'x² + 12x + 11 = (x + 6)² − 25.'),
        fractional: square(['h', 'k'], [-2.5, -0.25], 'x² + 5x + 6 = (x + 5/2)² − 1/4.'),
        negative: square(['a', 'h', 'k'], [-3, 3, 19], '−3x² + 18x − 8 = −3(x − 3)² + 19.'),
        compare: square(['expression'], [poly([-5, -12, 2])], '2(x − 3)² − 23 = 2x² − 12x + 18 − 23 = 2x² − 12x − 5.'),
        level: square(['a', 'h', 'k', 'other'], [4, 2, -3, 3], '4x² − 16x + 13 = 4(x − 2)² − 3. The reflection of x = 1 across x = 2 is x = 3.')
    }
};
const equations = {
    id: 'quadratic-3',
    title: 'Quadratic equations',
    practice: {
        factor: square(
            ['expression', 'r1', 'r2'],
            [poly([-10, 3, 1], true), roots([-5, 2]), roots([-5, 2])],
            'x² + 3x − 10 = (x + 5)(x − 2), so x = −5 or x = 2.',
            'Find two numbers with product −10 and sum 3. Then set each factor equal to zero.'),
        zero: square(['r1', 'r2'], [roots([0, 4]), roots([0, 4])], '3x² − 12x = 3x(x − 4) = 0. Either x = 0 or x = 4.', 'Do not divide by x: you might lose a solution. Factor out the common factor instead.'),
        square: square(
            ['r1', 'r2'],
            [roots([-2 - Math.sqrt(7), -2 + Math.sqrt(7)]), roots([-2 - Math.sqrt(7), -2 + Math.sqrt(7)])],
            'x² + 4x − 3 = (x + 2)² − 7 = 0, so x = −2 ± √7.',
            'Complete the square and take both the positive and negative square roots.'),
        formula: square(['d', 'r1', 'r2'], [49, roots([-3, 0.5]), roots([-3, 0.5])], 'D = 5² − 4·2·(−3) = 49. Then x = (−5 ± 7)/4, giving −3 and 1/2.', 'Keep the signs of b and c when calculating D. Divide the entire numerator by 2a.'),
        discriminant: square(['d', 'count', 'm'], [-8, 0, 9], 'For x² − 6x + 11, D = 36 − 44 = −8, so there are no real roots. For x² − 6x + m, D = 36 − 4m = 0 when m = 9.', 'No real roots means D < 0; a repeated root requires D = 0.')
    },
    assessment: {
        factor: square(['expression', 'r1', 'r2'], [poly([6, -5, 1], true), roots([2, 3]), roots([2, 3])], 'x² − 5x + 6 = (x − 2)(x − 3); the roots are 2 and 3.'),
        zero: square(['r1', 'r2'], [roots([0, -2]), roots([0, -2])], '5x² + 10x = 5x(x + 2) = 0, so x = 0 or x = −2.'),
        formula: square(['d', 'r1', 'r2'], [25, roots([-2, 0.5]), roots([-2, 0.5])], 'D = 9 + 16 = 25. x = (−3 ± 5)/4 gives −2 and 1/2.'),
        irrational: square(['r1', 'r2'], [roots([1 - Math.sqrt(5), 1 + Math.sqrt(5)]), roots([1 - Math.sqrt(5), 1 + Math.sqrt(5)])], '(x − 1)² = 5, so x = 1 ± √5.'),
        parameter: square(['m', 'root'], [4, -2], 'D = 16 − 4m = 0 gives m = 4, and the repeated root is −4/2 = −2.')
    }
};
module.exports = { completing, equations };
