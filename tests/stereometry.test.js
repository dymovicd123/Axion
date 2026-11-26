const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../public/assets/stereo-model');
const L = require('../public/assets/stereo-content');
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
test(
    'solid geometry course has five lessons with valid questions',
    () => {
        assert.equal(L.length, 5);
        for (const l of L) {
            assert.equal(l.sections.length, 5);
            assert.equal(l.questions.length, 4);
            for (const [, choices, correct] of l.questions)
                assert.ok(correct >= 0 && correct < choices.length);
        }
    });
test(
    'cube sections: triangle, square, pentagon, hexagon and outside',
    () => {
        for (const [n, d, k] of [[[1, 1, 1], 2, 3], [[0, 1, 0], 0, 4], [[1, .75, .5], .3, 5], [[1, 1, 1], 0, 6], [[1, 0, 0], 2, 0]]) {
            const s = M.section(n, d);
            assert.equal(s.polygon.length, k);
            for (const p of s.polygon)
                near(p.reduce((sum, x, i) => sum + x * n[i], 0), d);
        }
        near(M.section([1, 1, 1], 0).area, 3 * Math.sqrt(3));
        near(M.section([0, 1, 0], 0).area, 4);
        assert.throws(() => M.section([0, 0, 0], 0));
    });
test(
    'surface areas and volumes of five solids',
    () => {
        for (const [type, a, b, c, S, V] of [
            ['cuboid', 2, 3, 4, 52, 24],
            ['pyramid', 6, 1, 4, 96, 48],
            ['cylinder', 3, 1, 4, 42 * Math.PI, 36 * Math.PI],
            ['cone', 3, 1, 4, 24 * Math.PI, 12 * Math.PI],
            ['sphere', 3, 1, 4, 36 * Math.PI, 36 * Math.PI]
        ]) {
            const r = M.solid(type, a, b, c);
            near(r.area, S);
            near(r.volume, V);
            assert.ok(r.scene.faces.length > 0);
        }
    });
