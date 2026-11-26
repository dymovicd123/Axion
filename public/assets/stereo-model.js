(function (root) {
    const M = typeof module === 'object' && module.exports ? require('./project-math') : root.ProjectMath;
    const line = (a, b, color = '#718397', width = 1.5) => ({ points: [a, b], color, width });
    const face = (points, color = 'rgba(65,145,190,.20)') => ({ points, color, stroke: '#718397' });
    function cuboid(a = 2, b = 2, c = 2) {
        const scale = p => [p[0] * a / 2, p[1] * c / 2, p[2] * b / 2];
        return {
            faces: [0, 1, 2].flatMap(axis => [-1, 1].map(s => face([[-1, -1], [1, -1], [1, 1], [-1, 1]].map(pair => {
                const p = pair.slice();
                p.splice(axis, 0, s);
                return scale(p);
            })))),
            lines: M.edges.map(([p, q]) => line(scale(p), scale(q))),
            points: [],
            extent: Math.max(a, b, c) * 1.85
        };
    }
    function section(normal, offset) {
        const length = M.norm(normal);
        if (!length)
            throw Error('The normal cannot be zero.');
        const n = M.scale(normal, 1 / length), d = offset / length, hits = [];
        const add = p => {
            if (!hits.some(q => M.distance(p, q) < 1e-7))
                hits.push(p);
        };
        for (const [a, b] of M.edges) {
            const x = M.dot(n, a) - d, y = M.dot(n, b) - d;
            if (Math.abs(x) < 1e-8)
                add(a);
            if (Math.abs(y) < 1e-8)
                add(b);
            if (x * y < 0)
                add(M.add(a, M.scale(M.sub(b, a), x / (x - y))));
        }
        if (hits.length < 3)
            return { polygon: hits, area: 0 };
        const center = M.scale(hits.reduce((a, b) => M.add(a, b)), 1 / hits.length),
            u = M.unit(M.sub(hits[0], center)),
            v = M.cross(n, u);
        hits.sort((a, b) => Math.atan2(M.dot(M.sub(a, center), v), M.dot(M.sub(a, center), u)) - Math.atan2(M.dot(M.sub(b, center), v), M.dot(M.sub(b, center), u)));
        return { polygon: hits, area: hits.reduce((sum, p, i) => sum + M.norm(M.cross(M.sub(p, center), M.sub(hits[(i + 1) % hits.length], center))) / 2, 0) };
    }
    function solid(type, a, b, c) {
        if (type === 'cuboid')
            return { scene: cuboid(a, b, c), area: 2 * (a * b + b * c + c * a), volume: a * b * c };
        const faces = [],
            lines = [],
            r = a,
            h = c,
            N = 48,
            ring = (y, radius) => Array.from({ length: N }, (_, i) => [radius * Math.cos(i * 2 * Math.PI / N), y, radius * Math.sin(i * 2 * Math.PI / N)]);
        const band = (lo, hi) => {
            for (let i = 0; i < N; i++) {
                let j = (i + 1) % N;
                faces.push(face([lo[i], lo[j], hi[j], hi[i]], 'rgba(70,145,183,.38)'));
            }
        };
        let area, volume;
        if (type === 'sphere') {
            for (let i = 0; i < 24; i++) {
                const t = i * Math.PI / 24, s = (i + 1) * Math.PI / 24;
                band(ring(r * Math.cos(t), r * Math.sin(t)), ring(r * Math.cos(s), r * Math.sin(s)));
            }
            area = 4 * Math.PI * r * r;
            volume = 4 * Math.PI * r ** 3 / 3;
        }
        else if (type === 'pyramid') {
            const base = [[-a / 2, -h / 2, -a / 2], [a / 2, -h / 2, -a / 2], [a / 2, -h / 2, a / 2], [-a / 2, -h / 2, a / 2]], top = [0, h / 2, 0];
            faces.push(face(base));
            base.forEach((p, i) => faces.push(face([p, base[(i + 1) % 4], top])));
            area = a * a + 2 * a * Math.hypot(h, a / 2);
            volume = a * a * h / 3;
        }
        else {
            const lo = ring(-h / 2, r), hi = ring(h / 2, type === 'cone' ? 0 : r);
            band(lo, hi);
            faces.push(face(lo));
            if (type === 'cylinder')
                faces.push(face(hi));
            area = type === 'cone' ? Math.PI * r * (r + Math.hypot(r, h)) : 2 * Math.PI * r * (r + h);
            volume = Math.PI * r * r * h / (type === 'cone' ? 3 : 1);
        }
        return { scene: { faces, lines, points: [], extent: Math.max(2 * r, type === 'sphere' ? 0 : h) * 1.85 }, area, volume };
    }
    const api = { cuboid, section, solid, line, face };
    if (typeof module === 'object' && module.exports)
        module.exports = api;
    else
        root.StereoModel = api;
})(typeof window === 'undefined' ? globalThis : window);
