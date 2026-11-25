const interval = value => ({ type: 'interval', value });
const constant = value => ({ type: 'constant', value });
const roots = (...values) => ({ type: 'roots', values });
const polynomial = (...coefficients) => ({ type: 'polynomial', coefficients });
const q = (keys, answer, feedback, hint) => ({ keys, answer, feedback, hint });
const inequalities = {
    id: 'quadratic-4',
    title: 'Quadratic inequalities',
    practice: {
        signs: q(['solution'], [interval('(-inf,-2) U (3,inf)')], 'The roots are −2 and 3. The upward parabola is positive outside them; the strict inequality excludes both roots.', 'Locate the roots and test the sign on each interval.'),
        downward: q(['solution'], [interval('[-1,5]')], 'Factor −2(x + 1)(x − 5). The downward parabola is non-negative between its roots −1 and 5, including the endpoints.', 'Check the sign between the roots and the equality symbol.'),
        rearrange: q(['solution'], [interval('(-3,2)')], 'Move all terms to one side: x² + x − 6 < 0. Factor (x + 3)(x − 2). The product is negative between −3 and 2.', 'Rewrite the inequality with zero on the right.'),
        special: q(['solution'], [interval('{2}')], 'A square is always non-negative. (x − 2)² ≤ 0 is true only at x = 2.', 'When can a square be zero?'),
        combined: q(['solution'], [interval('[1,3)')], 'x² − 4x + 3 ≤ 0 gives [1,3]. Intersect with x < 3 to obtain [1,3).', 'Find the overlap of the two solution sets.')
    },
    assessment: {
        outside: q(['solution'], [interval('(-inf,-4] U [2,inf)')], 'Factor (x + 4)(x − 2). The product is non-negative outside the roots, including them.'),
        inside: q(['solution'], [interval('(-2,5)')], '−(x + 2)(x − 5) is positive between the roots. Both endpoints are excluded.'),
        irrational: q(['solution'], [interval('[-sqrt(3),sqrt(3)]')], 'x² ≤ 3 gives −√3 ≤ x ≤ √3.'),
        noRoots: q(['solution'], [interval('empty')], 'x² − 4x + 5 = (x − 2)² + 1, which is strictly positive for every real x.'),
        intersection: q(['solution'], [interval('(0,2]')], 'x² − 4 ≤ 0 gives [−2,2]. Intersect with x > 0 to obtain (0,2].')
    }
};
const applications = {
    id: 'quadratic-5',
    title: 'Applications',
    practice: {
        model: q(['expression'], [polynomial(0, 25, -1)], 'The other side is 25 − x, so the area is x(25 − x) = −x² + 25x.', 'Use the perimeter to find the other side before multiplying.'),
        maximum: q(['x', 'area'], [6, 36], 'A(x) = x(12 − x) = −(x − 6)² + 36. Its maximum is 36 at x = 6.', 'Complete the square or use the vertex formula.'),
        height: q(['time', 'height'], [2, 23], 'h(t) = −5(t − 2)² + 23. The peak is 23 m at 2 s.', 'Find the vertex, not the time at which the object reaches the ground.'),
        threshold: q(['solution'], [interval('[1,3]')], '−5t² + 20t + 3 ≥ 18 is equivalent to −5(t − 1)(t − 3) ≥ 0. The time interval is [1,3].', 'Set the height equal to 18 to find the boundary times.'),
        trajectory: {
            keys: ['a', 'b', 'c'],
            model: true,
            feedback: 'Your trajectory meets every design condition.',
            hint: 'Check the launch, hoop, obstacle, ceiling and direction at the hoop.'
        }
    },
    assessment: {
        area: q(['x', 'area'], [9, 81], 'A(x) = x(18 − x) = −(x − 9)² + 81.'),
        revenue: q(['x', 'revenue'], [20, 800], 'R(x) = −2x² + 80x = −2(x − 20)² + 800.'),
        landing: q(['time'], [constant(4)], '−5t² + 15t + 20 = −5(t − 4)(t + 1). Only t = 4 is in the physical domain t ≥ 0.'),
        width: q(['solution'], [interval('[4,8]')], 'x(12 − x) ≥ 32 gives (x − 4)(x − 8) ≤ 0, hence [4,8].'),
        design: q(['a', 'b', 'c'], [-1, 6, 7], 'The vertex is (3,16). Using f(0) = 7 gives a = −1. Expanding −(x − 3)² + 16 gives −x² + 6x + 7.')
    }
};
const final = {
    id: 'quadratic-final',
    title: 'Final assessment',
    practice: {},
    assessment: {
        vertex: q(['h', 'k'], [-2, 3], 'For 2x² + 8x + 11, h = −8/4 = −2 and f(−2) = 3.'),
        range: q(['solution'], [interval('(-inf,5]')], 'The maximum is 5 and the parabola opens down, so its range is (−∞,5].'),
        square: q(['h', 'k'], [constant(-3.5), constant(-2.25)], 'x² + 7x + 10 = (x + 7/2)² − 9/4.'),
        factor: q(['expression'], [{ type: 'polynomial', coefficients: [-12, -1, 1], factored: true }], 'x² − x − 12 = (x − 4)(x + 3).'),
        roots: q(['r1', 'r2'], [roots(2 + Math.sqrt(3), 2 - Math.sqrt(3)), roots(2 + Math.sqrt(3), 2 - Math.sqrt(3))], '(x − 2)² = 3, so x = 2 ± √3.'),
        parameter: q(['m'], [9], 'D = 36 − 4m. A repeated root requires D = 0, hence m = 9.'),
        inequality: q(['solution'], [interval('(-inf,-1) U (5,inf)')], '(x + 1)(x − 5) > 0 holds outside the roots.'),
        repeated: q(['solution'], [interval('all')], '(x + 3)² ≥ 0 for every real x.'),
        area: q(['x', 'area'], [7, 49], 'A(x) = x(14 − x) = −(x − 7)² + 49.'),
        threshold: q(['solution'], [interval('[2,6]')], '−x² + 8x ≥ 12 is equivalent to (x − 2)(x − 6) ≤ 0, so x ∈ [2,6].')
    }
};
module.exports = { inequalities, applications, final };
