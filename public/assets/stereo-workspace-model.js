(function (root) {
    const P = typeof module === 'object' && module.exports ? require('./project-math') : root.ProjectMath;
    const E = typeof module === 'object' && module.exports ? require('./expression') : root.AxionExpression;
    const S = typeof module === 'object' && module.exports ? require('./stereo-model') : root.StereoModel;
    const faces = [['A', 'B', 'C', 'D'], ['E', 'F', 'G', 'H'], ['A', 'B', 'F', 'E'], ['B', 'C', 'G', 'F'], ['C', 'D', 'H', 'G'], ['D', 'A', 'E', 'H']];
    const edges = faces.flatMap(f => f.map((v, i) => [v, f[(i + 1) % f.length]])).filter((e, i, a) => a.findIndex(q => key(q) === key(e)) === i);
    function key(ids) {
        return [...ids].sort().join('|');
    }
    function points(a, b, h) {
        return {
            A: [-a / 2, -h / 2, -b / 2],
            B: [a / 2, -h / 2, -b / 2],
            C: [a / 2, -h / 2, b / 2],
            D: [-a / 2, -h / 2, b / 2],
            E: [-a / 2, h / 2, -b / 2],
            F: [a / 2, h / 2, -b / 2],
            G: [a / 2, h / 2, b / 2],
            H: [-a / 2, h / 2, b / 2]
        };
    }
    function midpoint(a, b) {
        return P.scale(P.add(a, b), .5);
    }
    function flatten(pts) {
        if (pts.length < 3)
            throw Error('Choose at least three points.');
        const o = pts[0], u = P.unit(P.sub(pts[1], o));
        if (P.norm(P.sub(pts[1], o)) < 1e-8)
            throw Error('Choose distinct points.');
        let n;
        for (const p of pts.slice(2)) {
            const c = P.cross(u, P.sub(p, o));
            if (P.norm(c) > 1e-7) {
                n = P.unit(c);
                break;
            }
        }
        if (!n)
            throw Error('The points are collinear.');
        if (pts.some(p => Math.abs(P.dot(P.sub(p, o), n)) > 1e-7))
            throw Error('These points are not in one plane.');
        const v = P.cross(n, u);
        return pts.map(p => [P.dot(P.sub(p, o), u), P.dot(P.sub(p, o), v)]);
    }
    function validPolygon(poly) {
        if (poly.length < 3)
            return false;
        const eps = 1e-8,
            orient = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]),
            on = (a, b, c) => Math.abs(orient(a, b, c)) < eps && c[0] >= Math.min(a[0], b[0]) - eps && c[0] <= Math.max(a[0], b[0]) + eps && c[1] >= Math.min(a[1], b[1]) - eps && c[1] <= Math.max(a[1], b[1]) + eps;
        for (let i = 0; i < poly.length; i++) {
            const a = poly[i], b = poly[(i + 1) % poly.length];
            if (Math.hypot(a[0] - b[0], a[1] - b[1]) < eps)
                return false;
            for (let j = i + 2; j < poly.length; j++) {
                if (i === 0 && j === poly.length - 1)
                    continue;
                const c = poly[j], d = poly[(j + 1) % poly.length];
                if (orient(a, b, c) * orient(a, b, d) < -eps && orient(c, d, a) * orient(c, d, b) < -eps || on(a, b, c) || on(a, b, d) || on(c, d, a) || on(c, d, b))
                    return false;
            }
        }
        return area(poly) > eps;
    }
    function area(poly) {
        return Math.abs(poly.reduce((s, p, i) => {
            const q = poly[(i + 1) % poly.length];
            return s + p[0] * q[1] - p[1] * q[0];
        }, 0)) / 2;
    }
    function sectionCheck(pts, reference) {
        if (pts.length !== reference.length)
            return false;
        return pts.every((p, i) => {
            const k = reference.findIndex(q => P.distance(p, q) < 1e-7);
            if (k < 0)
                return false;
            const next = pts[(i + 1) % pts.length];
            return [reference[(k + 1) % pts.length], reference[(k + pts.length - 1) % pts.length]].some(q => P.distance(q, next) < 1e-7);
        }) && new Set(pts.map(p => reference.findIndex(q => P.distance(p, q) < 1e-7))).size === reference.length;
    }
    function number(raw) {
        const t = raw.trim().replace(/°$/, '').replace(/√\s*\(/g, 'sqrt(').replace(/√\s*(\d+(?:\.\d+)?)/g, 'sqrt($1)').replace(/²/g, '^2').replace(/³/g, '^3');
        if (!t || /\bx\b/i.test(t))
            return NaN;
        try {
            return E.compile(t)(0);
        }
        catch {
            return NaN;
        }
    }
    function correct(raw, target, tol = .011) {
        const x = number(raw);
        return Number.isFinite(x) && Math.abs(x - target) <= tol;
    }
    function requirement(state, r) {
        if (r.type === 'section') {
            const ref = S.section(r.normal, r.offset).polygon;
            return state.polys.some(ids => sectionCheck(ids.map(id => state.points[id]), ref));
        }
        if (r.type === 'midpoint')
            return Object.entries(state.points).some(([id, p]) => !Object.hasOwn(points(2, 2, 2), id) && P.distance(p, midpoint(...r.ids.map(id => state.points[id]))) < 1e-7);
        const arr = r.type === 'segment' ? state.segments : r.type === 'extract' ? state.extracted : state.polys;
        return arr.some(ids => key(ids) === key(r.ids));
    }
    function givenLengths(task) {
        const [a, b, h] = task.dims, out = {};
        const put = (ids, value) => out[key(ids)] = value;
        if (task.shape === 'pyramid') {
            for (const ids of [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']])
                put(ids, a);
            put(['O', 'T'], h);
        }
        else {
            for (const ids of edges) {
                const q = points(a, b, h);
                if (task.id === 'p51' && Math.abs(q[ids[0]][1] - q[ids[1]][1]) > 1e-8)
                    continue;
                put(ids, P.distance(q[ids[0]], q[ids[1]]));
            }
            if (task.id === 'p51')
                put(['A', 'G'], 13);
        }
        return out;
    }
    function lengthInfo(task, annotations, ids) {
        const k = key(ids), given = givenLengths(task);
        if (Object.hasOwn(given, k))
            return { value: given[k], source: 'given' };
        if (Object.hasOwn(annotations || {}, k))
            return { value: annotations[k], source: 'recorded' };
        return null;
    }
    function schematicPoint(p, dims, enabled) {
        if (!enabled)
            return [...p];
        const d = [dims[0], dims[2], dims[1]], m = Math.min(...d);
        return p.map((v, i) => v * Math.min(1, m * 1.55 / d[i]));
    }
    function rightAngles(pts) {
        return pts.map((p, i) => {
            const a = P.sub(pts[(i + pts.length - 1) % pts.length], p), b = P.sub(pts[(i + 1) % pts.length], p);
            return Math.abs(P.dot(a, b)) <= 1e-8 * P.norm(a) * P.norm(b);
        });
    }
    function planarPoints(ids, all) {
        const pts = ids.map(id => all[id]), flat = flatten(pts), o = pts[0], u = P.unit(P.sub(pts[1], o));
        let n;
        for (const p of pts.slice(2)) {
            const c = P.cross(u, P.sub(p, o));
            if (P.norm(c) > 1e-7) {
                n = P.unit(c);
                break;
            }
        }
        const v = P.cross(n, u), result = {};
        for (const [id, p] of Object.entries(all)) {
            const d = P.sub(p, o);
            if (Math.abs(P.dot(d, n)) > 1e-7)
                continue;
            const q = [P.dot(d, u), P.dot(d, v)];
            let inside = false, on = false;
            for (let i = 0, j = flat.length - 1; i < flat.length; j = i++) {
                const a = flat[j], b = flat[i], cross = (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]);
                if (Math.abs(cross) < 1e-7 && q[0] >= Math.min(a[0], b[0]) - 1e-7 && q[0] <= Math.max(a[0], b[0]) + 1e-7 && q[1] >= Math.min(a[1], b[1]) - 1e-7 && q[1] <= Math.max(a[1], b[1]) + 1e-7)
                    on = true;
                if ((a[1] > q[1]) !== (b[1] > q[1]) && q[0] < (b[0] - a[0]) * (q[1] - a[1]) / (b[1] - a[1]) + a[0])
                    inside = !inside;
            }
            if (on || inside)
                result[id] = q;
        }
        return result;
    }
    function angle(a, b, c) {
        const u = P.sub(a, b), v = P.sub(c, b), d = P.norm(u) * P.norm(v);
        return d > 1e-10 ? Math.acos(Math.max(-1, Math.min(1, P.dot(u, v) / d))) * 180 / Math.PI : NaN;
    }
    function constructionOK(t, state) {
        const p = state.points;
        let build = t.build.every(r => requirement(state, r));
        if (t.dynamic) {
            const ends = t.dynamic === 'midTriangle' ? ['A', 'B'] : ['B', 'C'];
            const m = Object.keys(p).find(id => P.distance(p[id], midpoint(...ends.map(x => p[x]))) < 1e-7);
            if (!m)
                build = false;
            else {
                const ids = t.dynamic === 'midTriangle' ? [m, 'B', 'C'] : ['T', 'O', m], seg = t.dynamic === 'midTriangle' ? [m, 'C'] : [m, 'T'];
                build = build && requirement(state, { type: 'segment', ids: seg }) && requirement(state, { type: 'extract', ids });
            }
        }
        if (t.sectionKind) {
            const normals = t.sectionKind === 'triangle' ? [[1, -1, -1]] : [-1, 1].flatMap(x => [-1, 1].map(z => [1, x, z]));
            const offset = t.sectionKind === 'triangle' ? t.dims[0] : 0;
            build = state.polys.some(ids => normals.some(n => sectionCheck(ids.map(id => p[id]), S.section(n, offset * 2 / t.dims[0]).polygon.map(p => P.scale(p, t.dims[0] / 2)))) && state.extracted.some(q => key(q) === key(ids) && normals.some(n => sectionCheck(q.map(id => p[id]), S.section(n, offset * 2 / t.dims[0]).polygon.map(p => P.scale(p, t.dims[0] / 2))))));
        }
        if (t.experiment === 'shared') {
            const planes = state.polys.filter(ids => ids.includes('A') && ids.includes('B')).map(ids => {
                const a = p.A, b = p.B, c = ids.map(id => p[id]).find(q => P.norm(P.cross(P.sub(b, a), P.sub(q, a))) > 1e-7);
                return c && P.unit(P.cross(P.sub(b, a), P.sub(c, a)));
            }).filter(Boolean);
            build = build && planes.some((n, i) => planes.slice(i + 1).some(m => P.norm(P.cross(n, m)) > 1e-7));
        }
        return build;
    }
    const api = {
        constructionOK,
        planarPoints,
        angle,
        faces,
        edges,
        key,
        points,
        midpoint,
        flatten,
        area,
        validPolygon,
        sectionCheck,
        number,
        correct,
        requirement,
        givenLengths,
        lengthInfo,
        schematicPoint,
        rightAngles
    };
    if (typeof module === 'object' && module.exports)
        module.exports = api;
    else
        root.StereoWorkspaceModel = api;
})(typeof window === 'undefined' ? globalThis : window);
