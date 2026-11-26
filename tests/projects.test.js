const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const M = require('../public/assets/project-math');
const { createStore } = require('../store');
const close = (a, b, tolerance = 1e-5) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
const correct = {
    container: { formula: '2+2.46*sin(pi*x/12)' },
    box: { cut: M.optimalCut, derivative: 0 },
    section: { points: [[1, -1, 0], [0, 1, -1], [-1, 0, 1]], area: 5.2 },
    circumcircle: { objects: [M.circle('C1', [0, -.3], Math.hypot(3, 1.7))] },
    path: { objects: [{ id: 'S1', type: 'segment', a: [-4, 3], b: [.2, 0] }, { id: 'S2', type: 'segment', a: [.2, 0], b: [3, 2] }] },
    tangent: { objects: [M.line('L1', [5, 0], [1.8, 2.4]), M.line('L2', [5, 0], [1.8, -2.4])] }
};
test('vessel volume and exterior area agree with a cylinder and cone frustum', () => {
    const cylinder = M.vessel('2');
    close(cylinder.volume, 48 * Math.PI);
    close(cylinder.area, 52 * Math.PI);
    const frustum = M.vessel('2+x/12');
    close(frustum.volume, Math.PI * 12 * (4 + 6 + 9) / 3);
    close(frustum.area, Math.PI * 5 * Math.sqrt(145) + 4 * Math.PI);
    assert.throws(() => M.vessel('sqrt(x-1)'));
    assert.throws(() => M.vessel('-2'));
    assert.throws(() => M.vessel('alert(1)'));
});
test('box derivative and global maximum are correct', () => {
    close(M.boxDerivative(M.optimalCut), 0);
    const optimum = M.boxVolume(M.optimalCut);
    for (let x = 0; x <= 9; x += .01)
        assert.ok(M.boxVolume(x) <= optimum + 1e-8);
    const x = 3;
    close((M.boxVolume(x + .0001) - M.boxVolume(x - .0001)) / .0002, M.boxDerivative(x));
    assert.throws(() => M.box(''));
    assert.throws(() => M.box(9));
    assert.equal(M.check('box', { cut: M.optimalCut, derivative: 10 }).correct, false);
});
test('plane intersections form correct square, face, triangle and regular hexagon', () => {
    const square = M.section([[-1, -1, 0], [1, -1, 0], [-1, 1, 0]]);
    assert.equal(square.polygon.length, 4);
    close(square.area, 4);
    const face = M.section([[-1, -1, 1], [1, -1, 1], [-1, 1, 1]]);
    assert.equal(face.polygon.length, 4);
    close(face.area, 4);
    const tri = M.section([[1, 1, 0], [1, 0, 1], [0, 1, 1]]);
    assert.equal(tri.polygon.length, 3);
    close(tri.area, Math.sqrt(3) / 2);
    const hex = M.section(correct.section.points);
    assert.equal(hex.polygon.length, 6);
    assert.equal(hex.regular, true);
    close(hex.area, 3 * Math.sqrt(3));
    assert.throws(() => M.section([[1, 1, 1], [1, 1, 0], [1, 1, -1]]));
    assert.throws(() => M.section([[0, 0, 0], [1, 1, 0], [0, 1, 1]]));
});
test('intersection and reflection tools give correct mathematical constructions', () => {
    const cross = M.intersect(M.line('1', [0, 0], [2, 2]), M.line('2', [0, 2], [2, 0]));
    assert.deepEqual(cross, [[1, 1]]);
    const points = M.intersect(M.circle('1', [0, 0], 3), M.circle('2', [2.5, 0], 2.5));
    assert.equal(points.length, 2);
    for (const p of points) {
        close(p[0], 1.8);
        close(Math.abs(p[1]), 2.4);
    }
    assert.deepEqual(M.reflect([3, 2], [-1, 0], [1, 0]), [3, -2]);
    const l = M.intersect(M.line('l', [-4, 3], [3, -2]), M.line('b', [-1, 0], [1, 0]));
    close(l[0][0], .2);
    close(l[0][1], 0);
    assert.equal(M.intersect(M.line('a', [0, 0], [1, 0]), M.line('b', [0, 1], [1, 1])).length, 0);
    assert.equal(M.intersect({ id: 'a', type: 'segment', a: [0, 0], b: [1, 0] }, M.line('b', [2, 0], [2, 1])).length, 0);
});
test('all six projects accept mathematically correct models and reject incomplete or wrong models', () => {
    assert.equal(M.projects.length, 6);
    for (const [id, model] of Object.entries(correct))
        assert.equal(M.check(id, model).correct, true, id);
    assert.equal(M.check('container', { formula: '2' }).correct, false);
    assert.equal(M.check('box', { cut: 2, derivative: 144 }).correct, false);
    assert.equal(M.check('section', { points: [[-1, -1, 0], [1, -1, 0], [-1, 1, 0]], area: 4 }).correct, false);
    for (const id of ['circumcircle', 'path', 'tangent'])
        assert.equal(M.check(id, { objects: [] }).correct, false);
    assert.equal(M.check('tangent', { objects: [correct.tangent.objects[0], correct.tangent.objects[0]] }).correct, false);
    assert.throws(() => M.check('circumcircle', { objects: [{ id: 'a', type: 'circle', c: [0, 0], r: -1 }] }));
    assert.throws(() => M.check('unknown', {}));
});
test('submissions persist actual construction, results, notes and reset with study progress', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'axion-project-'));
    try {
        const file = path.join(dir, 'db.json');
        await fs.writeFile(file, JSON.stringify({ progress: [] }));
        const store = createStore(file);
        const rows = await Promise.all(Object.entries(correct).map(([id, model]) => store.checkProject({ id, model, note: 'Trial' })));
        assert.ok(rows.every(r => r.correct));
        await store.checkProject({ id: 'container', model: { formula: '2' }, note: 'Wrong volume' });
        const next = createStore(file), saved = await next.projectStatus();
        assert.equal(saved.length, 7);
        assert.equal(saved.filter(r => r.correct).length, 6);
        assert.deepEqual(saved.find(r => r.project === 'section').model, correct.section);
        await assert.rejects(() => next.checkProject({ id: 'box', model: { cut: 0, derivative: 0 } }), /cut must/);
        await next.resetStudy();
        assert.equal((await next.projectStatus()).length, 0);
    }
    finally {
        await fs.rm(dir, { recursive: true, force: true });
    }
});
test('shared 3D scene generator constructs real mesh surfaces and polygon edges', () => {
    const vm = require('node:vm');
    const source = require('node:fs').readFileSync(path.join(__dirname, '../public/assets/solid-view.js'), 'utf8');
    const sandbox = { ProjectMath: M, window: {} };
    vm.runInNewContext(source, sandbox);
    const { vesselScene, boxScene, cubeScene } = sandbox.window.AxionSolid;
    const v = vesselScene(M.vessel('2').profile, 6);
    assert.ok(v.faces.length > 2000);
    assert.ok(v.faces.every(f => f.points.every(p => p.length === 3 && p.every(Number.isFinite))));
    const unfolded = boxScene(3, 0), folded = boxScene(3, 1);
    assert.equal(folded.faces.length, 5);
    const heights = scene => scene.faces.flatMap(f => f.points.map(p => p[1]));
    close(Math.max(...heights(unfolded)) - Math.min(...heights(unfolded)), 0);
    close(Math.max(...heights(folded)) - Math.min(...heights(folded)), 3);
    const hex = M.section(correct.section.points), c = cubeScene(hex, correct.section.points);
    assert.equal(c.faces.length, 1);
    assert.equal(c.faces[0].points.length, 6);
    assert.equal(c.lines.length, 13);
});
