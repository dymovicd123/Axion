const test = require('node:test'), assert = require('node:assert/strict');
const W = require('../public/assets/stereo-workspace-model'),
    G = require('../public/assets/stereo-generator'),
    P = require('../public/assets/project-math'),
    R = require('../stereo-results');
const { createStore } = require('../store');
const fs = require('node:fs/promises'), os = require('node:os'), path = require('node:path');
function completed(t) {
    const p = W.points(...t.dims), s = { id: t.id, points: p, segments: [], polys: [], extracted: [], answers: t.answers.map(a => String(a.value)) };
    if (t.shape === 'pyramid') {
        for (const k of ['E', 'F', 'G', 'H'])
            delete p[k];
        p.O = [0, -t.dims[2] / 2, 0];
        p.T = [0, t.dims[2] / 2, 0];
    }
    ;
    for (const r of t.build) {
        if (r.type === 'midpoint')
            p.M1 = W.midpoint(...r.ids.map(id => p[id]));
        else
            s[{ segment: 'segments', polygon: 'polys', extract: 'extracted' }[r.type]].push(r.ids);
    }
    if (t.dynamic === 'pyramidTriangle') {
        s.segments.push(['T', 'M1']);
        s.extracted.push(['T', 'O', 'M1']);
    }
    if (t.sectionKind === 'triangle') {
        [['A', 'B'], ['B', 'C'], ['B', 'F']].forEach((ids, i) => p['M' + (i + 1)] = W.midpoint(...ids.map(id => p[id])));
        s.polys.push(['M1', 'M2', 'M3']);
        s.extracted.push(['M1', 'M2', 'M3']);
    }
    return s;
}
test(
    'all generator topics and difficulties produce reproducible, solvable tasks',
    () => {
        for (let topic = 0; topic < 5; topic++)
            for (let level = 0; level < 3; level++)
                for (const seed of [0, 42, 213123451, 4294967295]) {
                    const t = G.generate(topic, level, seed);
                    assert.deepEqual(G.generate(topic, level, seed), t);
                    const s = completed(t);
                    assert.equal(R.validate(s).correct, true, t.id);
                    assert.ok(t.answers.every(a => Number.isFinite(a.value)));
                    assert.ok(t.dims.every(d => d > 0));
                    if (level === 2)
                        assert.ok(t.answers.every(a => !a.hint));
                }
        assert.throws(() => G.generate(7, 1, 2));
        assert.notDeepEqual(G.generate(2, 0, 42), G.generate(2, 2, 42));
    });
test(
    'planar workspace preserves distances and includes only coplanar in-bound vertices',
    () => {
        const p = W.points(3, 4, 12);
        p.M1 = W.midpoint(p.A, p.B);
        const q = W.planarPoints(['A', 'B', 'C', 'D'], p);
        assert.ok(q.M1);
        assert.equal(q.G, undefined);
        assert.ok(Math.abs(Math.hypot(...q.B.map((x, i) => x - q.M1[i])) - 1.5) < 1e-7);
        assert.equal(W.angle(p.A, p.B, p.C), 90);
    });
test(
    'server rejects incorrect or modified geometry, stores accepted results once',
    async () => {
        const t = G.generate(2, 1, 123), s = completed(t);
        assert.equal(R.validate({ ...s, answers: s.answers.map(() => '0') }).correct, false);
        assert.equal(R.validate({ ...s, segments: [] }).correct, false);
        assert.throws(() => R.validate({ ...s, points: { ...s.points, A: [0, 0, 0] } }));
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'axion-geo-'));
        try {
            const file = path.join(dir, 'db.json');
            await fs.writeFile(file, '{}');
            const store = createStore(file);
            await store.stereoSubmit(s);
            await store.stereoSubmit(s);
            const result = await createStore(file).stereoResults();
            assert.equal(result.length, 1);
            assert.equal(result[0].id, t.id);
            assert.equal(result[0].correct, true);
            assert.ok(result[0].completedAt);
        }
        finally {
            await fs.rm(dir, { recursive: true, force: true });
        }
    });
