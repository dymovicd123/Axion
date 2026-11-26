const test = require('node:test'), assert = require('node:assert/strict');
const W = require('../public/assets/stereo-workspace-model'),
    P = require('../public/assets/project-math'),
    S = require('../public/assets/stereo-model'),
    T = require('../public/assets/stereo-tasks');
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
test(
    '3D to 2D preserves each pairwise distance and rejects nonplanar/collinear points',
    () => {
        const p = W.points(3, 4, 12), ids = ['A', 'C', 'G'], q = ids.map(id => p[id]), flat = W.flatten(q);
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                near(P.distance(q[i], q[j]), Math.hypot(flat[i][0] - flat[j][0], flat[i][1] - flat[j][1]));
        near(W.area(flat), 30);
        assert.throws(() => W.flatten([p.A, p.B, p.C, p.G]));
        assert.throws(() => W.flatten([p.A, W.midpoint(p.A, p.B), p.B]));
    });
test('polygon must use boundary order, not crossing edges', () => {
    assert.equal(W.validPolygon([[0, 0], [3, 0], [3, 4], [0, 4]]), true);
    assert.equal(W.validPolygon([[0, 0], [3, 4], [3, 0], [0, 4]]), false);
});
test(
    'section through B-adjacent edge midpoints and regular hexagon',
    () => {
        const p = W.points(2, 2, 2), tri = [['A', 'B'], ['B', 'C'], ['B', 'F']].map(ids => W.midpoint(...ids.map(id => p[id])));
        assert.ok(W.sectionCheck(tri, S.section([1, -1, -1], 2).polygon));
        near(W.area(W.flatten(tri)), Math.sqrt(3) / 2);
        const hex = S.section([1, 1, 1], 0).polygon;
        assert.ok(W.sectionCheck(hex, hex));
        assert.ok(W.sectionCheck([...hex].reverse(), hex));
        assert.equal(W.sectionCheck([hex[0], hex[2], hex[1], ...hex.slice(3)], hex), false);
        near(W.area(W.flatten(hex)), 3 * Math.sqrt(3));
    });
test(
    'numeric expressions and exact roots accepted; invalid or blank rejected',
    () => {
        assert.ok(W.correct('sqrt(3^2+4^2)', 5));
        assert.ok(W.correct('√3/2', Math.sqrt(3) / 2));
        assert.ok(W.correct('4*pi', 4 * Math.PI));
        assert.ok(W.correct('67.38°', 67.380135, .025));
        assert.equal(W.correct('', 0), false);
        assert.equal(W.correct('1/0', 0), false);
        assert.equal(W.correct('x+5', 5), false);
    });
test(
    'tasks cover each module, unique ids, known vertex requirements and solvable numeric answers',
    () => {
        assert.equal(T.practice.length, 5);
        assert.equal(T.labs.length, 5);
        assert.equal(T.final.length, 5);
        const all = [...T.practice.flat(), ...T.labs, ...T.final];
        assert.equal(new Set(all.map(t => t.id)).size, 20);
        for (const t of all) {
            assert.ok(t.prompt && t.solution);
            for (const r of t.build)
                assert.ok(r.ids.every(id => 'ABCDEFGHOT'.includes(id)));
            for (const a of t.answers)
                assert.ok(W.correct(String(a.value), a.value));
        }
    });
test(
    'given lengths do not disclose missing box height or diagonals to solve',
    () => {
        const t = T.practice[4][0];
        assert.equal(W.lengthInfo(t, {}, ['A', 'G']).value, 13);
        assert.equal(W.lengthInfo(t, {}, ['C', 'G']), null);
        assert.equal(W.lengthInfo(t, {}, ['A', 'C']), null);
        assert.equal(W.lengthInfo(t, {}, ['B', 'A']).value, 3);
        assert.equal(W.lengthInfo(t, { 'C|G': 12 }, ['G', 'C']).source, 'recorded');
        assert.equal(W.lengthInfo(t, { 'A|B': 99 }, ['B', 'A']).value, 3);
    });
test(
    'schematic view only changes display geometry; original distances and right angles survive',
    () => {
        const dims = [3, 4, 12], p = W.points(...dims);
        const d = W.schematicPoint(p.G, dims, true);
        assert.notDeepEqual(d, p.G);
        assert.deepEqual(W.schematicPoint(p.G, dims, false), p.G);
        near(P.distance(p.A, p.G), 13);
        assert.deepEqual(W.rightAngles(W.flatten([p.A, p.B, p.C])), [false, true, false]);
    });
test(
    'given summaries are finite for all twenty tasks',
    () => {
        for (const t of [...T.practice.flat(), ...T.labs, ...T.final]) {
            const ids = t.shape === 'pyramid' ? ['AB', 'OT'] : t.id === 'p51' ? ['AB', 'BC', 'AG'] : ['AB', 'BC', 'CG'];
            for (const id of ids)
                assert.ok(Number.isFinite(W.lengthInfo(t, {}, id.split('')).value));
        }
    });
