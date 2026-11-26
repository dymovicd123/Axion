(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./expression'));
    }
    else {
        root.ProjectMath = factory(root.AxionExpression);
    }
})(
    globalThis,
    function (Expression) {
        const projects = [
            {
                id: 'container',
                title: 'Design a 500 mL vessel',
                type: 'solid',
                level: 'Intermediate',
                description: 'Create a vessel from a radius function. Its capacity and dimensions must meet a design brief.',
                topics: ['Functions', 'Integrals', 'Geometry'],
                lessons: ['integrals', 'limits-continuity'],
                skill: 'integrals',
                requirements: [
                    'Height: 12 cm. Base radius: 2 cm (±0.03 cm).',
                    'Capacity: 500 ± 5 mL.',
                    'Radius stays between 0.5 and 4.5 cm; opening radius no more than 3 cm. Use a continuous, reasonably smooth radius function (the sampled radius change per 0.01 cm must not exceed 0.1 cm).'
                ],
                theory: 'A cross-section at height x is a disk of area πr(x)². Integrating these areas over the height gives the capacity. The outside area is estimated from thin conical bands; the base is included, the open top is not.',
                solution: 'For example, try a smooth bulging profile r(x) = 2 + 2.46 sin(πx/12). Its two ends have radius 2 cm. Its peak radius is 4.46 cm. Integrating πr² from 0 to 12 gives approximately 500 mL. Many other profiles work.'
            },
            {
                id: 'box',
                title: 'Maximum-volume box',
                type: 'solid',
                level: 'Intermediate',
                description: 'Cut a sheet, fold it into an open box and determine the cut size that maximizes its volume.',
                topics: ['Geometry', 'Functions', 'Derivatives'],
                lessons: ['derivatives'],
                skill: 'derivatives',
                requirements: [
                    'Use a 24 × 18 cm sheet. Remove equal squares from the four corners.',
                    'Find the cut size to within 0.03 cm of the true maximum.',
                    'Enter the derivative of the volume function at your chosen cut size, rounded to 2 decimal places.'
                ],
                theory: 'With cut size x, the base is (24 − 2x) by (18 − 2x), and the height is x. A maximum in the interior occurs where the derivative is zero. Compare it with the endpoints.',
                solution: 'V(x) = x(24−2x)(18−2x) = 432x−84x²+4x³. V′(x) = 432−168x+12x². The roots are 7 ± √13; only 7−√13 ≈ 3.3944 belongs to (0,9). Both endpoint volumes are zero.'
            },
            {
                id: 'section',
                title: 'A hexagon inside a cube',
                type: 'solid',
                level: 'Advanced',
                description: 'Define a cutting plane using three points. Construct a regular hexagonal cross-section of a cube.',
                topics: ['3D Geometry', 'Vectors', 'Area'],
                lessons: ['integrals'],
                skill: 'integrals',
                requirements: [
                    'The cube has side length 2 and center (0, 0, 0).',
                    'Choose three non-collinear points on its faces.',
                    'The cross-section must be a regular hexagon. Calculate its area to within 0.03 square units.'
                ],
                theory: 'Three non-collinear points determine a plane. Each edge of the cube either misses the plane, intersects it, or lies in it. The intersection points form a planar polygon. A regular hexagon has equal sides and equal angles.',
                solution: 'The plane x+y+z=0 intersects the cube at permutations of (1,0,−1). The six sides have length √2. Dividing into six equilateral triangles gives area 3√3 ≈ 5.196.'
            },
            {
                id: 'circumcircle',
                title: 'Circle through three points',
                type: 'geometry',
                level: 'Foundation',
                description: 'Use geometric construction tools to find a circle passing through three given points.',
                topics: ['Geometry', 'Coordinates'],
                lessons: [],
                skill: null,
                requirements: ['The circle must pass through A, B and C.', 'Construct its center and draw the circle.'],
                theory: 'Points equidistant from the endpoints of a segment lie on its perpendicular bisector. The center of a circle through three non-collinear points lies on two such bisectors.',
                solution: 'Construct perpendicular bisectors of AB and AC. Intersect them to obtain O. Draw a circle centered at O through A; it also passes through B and C.'
            },
            {
                id: 'path',
                title: 'Shortest route via a boundary',
                type: 'geometry',
                level: 'Intermediate',
                description: 'Find the shortest broken path from A to B touching the horizontal boundary.',
                topics: ['Geometry', 'Optimization'],
                lessons: ['derivatives'],
                skill: 'derivatives',
                requirements: ['Choose a point P on the horizontal boundary.', 'Construct the segments AP and PB.', 'The combined distance must be minimal.'],
                theory: 'Reflect one endpoint in the boundary. The reflected route has the same length, and the straight segment to the reflected point is the shortest possible route.',
                solution: 'Reflect B=(3,2) across y=0 to B′=(3,−2). Draw AB′; its intersection with the boundary is P=(0.2,0). The shortest distance is √74 ≈ 8.602.'
            },
            {
                id: 'tangent',
                title: 'Two tangents to a circle',
                type: 'geometry',
                level: 'Advanced',
                description: 'Construct both tangent lines from an external point to a given circle.',
                topics: ['Geometry', 'Angles', 'Circles'],
                lessons: ['derivatives'],
                skill: 'derivatives',
                requirements: ['Both straight lines must pass through P.', 'Each must touch the given circle at exactly one point.', 'The two tangents must be distinct.'],
                theory: 'A tangent is perpendicular to the radius at its point of contact. A point on the circle with diameter OP forms a right angle with O and P (Thales’ theorem).',
                solution: 'Construct the midpoint of OP. Draw a circle centered at that midpoint through O. Its intersections with the given circle are the tangent points. Draw a line from P through each intersection.'
            }
        ];
        const finite = x => typeof x === 'number' && Number.isFinite(x);
        const close = (a, b, tolerance = 1e-6) => Math.abs(a - b) <= tolerance;
        const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
        const add = (a, b) => a.map((x, i) => x + b[i]);
        const sub = (a, b) => a.map((x, i) => x - b[i]);
        const scale = (a, k) => a.map(x => x * k);
        const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
        const norm = a => Math.hypot(...a);
        const distance = (a, b) => norm(sub(a, b));
        const unit = a => scale(a, 1 / norm(a));
        const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
        const cross2 = (a, b) => a[0] * b[1] - a[1] * b[0];
        function numeric(value, label) {
            if (value === '' || value === null || typeof value === 'boolean' || !['number', 'string'].includes(typeof value) || !Number.isFinite(Number(value))) {
                throw Error('Enter a valid ' + label + '.');
            }
            return Number(value);
        }
        function vessel(formula) {
            if (typeof formula !== 'string' || !formula.trim() || formula.length > 180)
                throw Error('Enter a radius function of x.');
            const fn = Expression.compile(formula);
            const n = 1200, h = 12 / n;
            const samples = Array.from({ length: n + 1 }, (_, i) => fn(i * h));
            if (samples.some(v => !finite(v) || Math.abs(v) > 1000))
                throw Error('The radius must be finite over the entire sampled height.');
            if (samples.some(v => v < 0))
                throw Error('Radius cannot be negative.');
            let volume = 0, area = Math.PI * samples[0] ** 2;
            for (let i = 0; i <= n; i++) {
                volume += (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) * samples[i] ** 2;
                if (i)
                    area += Math.PI * (samples[i] + samples[i - 1]) * Math.hypot(h, samples[i] - samples[i - 1]);
            }
            const profile = samples.filter((_, i) => i % 20 === 0).map((r, i) => [i * 12 / 60, r]);
            const min = Math.min(...samples), max = Math.max(...samples);
            const maxStep = samples.slice(1).reduce((largest, r, i) => Math.max(largest, Math.abs(r - samples[i])), 0);
            return { volume: Math.PI * h * volume / 3, area, min, max, maxStep, base: samples[0], opening: samples[n], profile };
        }
        const boxVolume = x => x * (24 - 2 * x) * (18 - 2 * x);
        const boxDerivative = x => 432 - 168 * x + 12 * x * x;
        const optimalCut = 7 - Math.sqrt(13);
        function box(cut) {
            const x = numeric(cut, 'cut size');
            if (x <= 0 || x >= 9)
                throw Error('The cut must be greater than 0 and less than 9 cm.');
            return { cut: x, width: 24 - 2 * x, depth: 18 - 2 * x, volume: boxVolume(x), derivative: boxDerivative(x) };
        }
        const vertices = [-1, 1].flatMap(x => [-1, 1].flatMap(y => [-1, 1].map(z => [x, y, z])));
        const edges = vertices.flatMap((a, i) => vertices.slice(i + 1).filter(b => distance(a, b) === 2).map(b => [a, b]));
        function section(points) {
            if (!Array.isArray(points) || points.length !== 3 || points.some(p => !Array.isArray(p) || p.length !== 3 || p.some(v => !finite(v) || Math.abs(v) > 1.000001)))
                throw Error('Enter three points inside the cube.');
            if (points.some(p => !p.some(v => close(Math.abs(v), 1))))
                throw Error('Each defining point must lie on a cube face.');
            const raw = cross(sub(points[1], points[0]), sub(points[2], points[0]));
            if (norm(raw) < 1e-7)
                throw Error('The three points must not lie on one line.');
            const normal = unit(raw), offset = dot(normal, points[0]);
            const hits = [];
            function push(p) {
                if (!hits.some(q => distance(p, q) < 1e-6))
                    hits.push(p);
            }
            for (const [a, b] of edges) {
                const da = dot(normal, a) - offset, db = dot(normal, b) - offset;
                if (Math.abs(da) < 1e-8)
                    push(a);
                if (Math.abs(db) < 1e-8)
                    push(b);
                if (da * db < 0)
                    push(add(a, scale(sub(b, a), da / (da - db))));
            }
            if (hits.length < 3)
                return { polygon: hits, normal, offset, area: 0, sides: [], regular: false };
            const center = scale(hits.reduce(add), 1 / hits.length);
            const u = unit(sub(hits[0], center)), v = cross(normal, u);
            hits.sort((a, b) => Math.atan2(dot(sub(a, center), v), dot(sub(a, center), u)) - Math.atan2(dot(sub(b, center), v), dot(sub(b, center), u)));
            let area = 0;
            const sides = hits.map((p, i) => {
                const next = hits[(i + 1) % hits.length];
                area += norm(cross(sub(p, center), sub(next, center))) / 2;
                return distance(p, next);
            });
            const regular = hits.length === 6 && Math.max(...sides) - Math.min(...sides) < 0.015 && hits.every((p, i) => {
                const a = unit(sub(hits[(i + 5) % 6], p)), b = unit(sub(hits[(i + 1) % 6], p));
                return close(dot(a, b), -0.5, 0.015);
            });
            return { polygon: hits, normal, offset, area, sides, regular };
        }
        const point = (id, p, fixed = false) => ({ id, type: 'point', p, fixed });
        const line = (id, a, b, fixed = false) => ({ id, type: 'line', a, b, fixed });
        const circle = (id, c, r, fixed = false) => ({ id, type: 'circle', c, r, fixed });
        function given(id) {
            if (id === 'circumcircle')
                return [point('A', [-3, -2], true), point('B', [3, -2], true), point('C', [1, 3], true)];
            if (id === 'path')
                return [point('A', [-4, 3], true), point('B', [3, 2], true), line('Boundary', [-1, 0], [1, 0], true)];
            if (id === 'tangent')
                return [point('O', [0, 0], true), point('P', [5, 0], true), circle('Given circle', [0, 0], 3, true)];
            return [];
        }
        const lineDistance = (p, a, b) => Math.abs(cross2(sub(p, a), sub(b, a))) / distance(a, b);
        function reflect(p, a, b) {
            const v = sub(b, a), foot = add(a, scale(v, dot(sub(p, a), v) / dot(v, v)));
            return sub(scale(foot, 2), p);
        }
        function intersect(a, b) {
            const isLine = o => ['line', 'segment'].includes(o.type);
            if (a.type === 'point' || b.type === 'point')
                return [];
            let out = [];
            if (isLine(a) && isLine(b)) {
                const v = sub(a.b, a.a), w = sub(b.b, b.a), d = cross2(v, w);
                if (Math.abs(d) > 1e-10)
                    out = [add(a.a, scale(v, cross2(sub(b.a, a.a), w) / d))];
            }
            else if (isLine(a) || isLine(b)) {
                const l = isLine(a) ? a : b, c = isLine(a) ? b : a, v = unit(sub(l.b, l.a));
                const foot = add(l.a, scale(v, dot(sub(c.c, l.a), v)));
                const delta = c.r * c.r - distance(foot, c.c) ** 2;
                if (delta >= -1e-9) {
                    out = [add(foot, scale(v, Math.sqrt(Math.max(0, delta))))];
                    if (delta > 1e-9)
                        out.push(sub(foot, scale(v, Math.sqrt(delta))));
                }
            }
            else {
                const d = distance(a.c, b.c);
                if (d < 1e-10 || d > a.r + b.r + 1e-8 || d < Math.abs(a.r - b.r) - 1e-8)
                    return [];
                const u = unit(sub(b.c, a.c)), k = (a.r * a.r - b.r * b.r + d * d) / (2 * d);
                const mid = add(a.c, scale(u, k)), h = Math.sqrt(Math.max(0, a.r * a.r - k * k)), n = [-u[1], u[0]];
                out = [add(mid, scale(n, h))];
                if (h > 1e-7)
                    out.push(sub(mid, scale(n, h)));
            }
            return out.filter(p => [a, b].every(o => o.type !== 'segment' || dot(sub(p, o.a), sub(p, o.b)) <= 1e-7));
        }
        function validateObjects(objects) {
            const validPoint = p => Array.isArray(p) && p.length === 2 && p.every(v => finite(v) && Math.abs(v) <= 100);
            if (!Array.isArray(objects) || objects.length > 150)
                throw Error('Invalid construction.');
            for (const o of objects) {
                if (!o || typeof o.id !== 'string' || o.id.length > 40)
                    throw Error('Invalid object.');
                if (o.type === 'point' && validPoint(o.p))
                    continue;
                if (['line', 'segment'].includes(o.type) && validPoint(o.a) && validPoint(o.b) && distance(o.a, o.b) > 1e-7)
                    continue;
                if (o.type === 'circle' && validPoint(o.c) && finite(o.r) && o.r > 1e-7 && o.r <= 200)
                    continue;
                throw Error('Invalid construction object.');
            }
            return objects;
        }
        function check(id, model) {
            if (!model || typeof model !== 'object')
                throw Error('Missing project model.');
            const results = [];
            const criterion = (label, pass, detail) => results.push({ label, pass: Boolean(pass), detail });
            let metrics = {};
            if (id === 'container') {
                const m = vessel(model.formula);
                criterion('Capacity', close(m.volume, 500, 5), m.volume.toFixed(2) + ' mL');
                criterion('Base radius', close(m.base, 2, .03), m.base.toFixed(3) + ' cm');
                criterion('Radius range', m.min >= .5 - 1e-9 && m.max <= 4.5 + 1e-9, `${m.min.toFixed(3)} – ${m.max.toFixed(3)} cm`);
                criterion('Opening radius', m.opening <= 3 + 1e-9, m.opening.toFixed(3) + ' cm');
                criterion('Smooth sampled profile', m.maxStep <= .1, 'Largest sampled radius change: ' + m.maxStep.toFixed(4) + ' cm');
                metrics = { volume: m.volume, area: m.area };
            }
            else if (id === 'box') {
                const m = box(model.cut), derivative = numeric(model.derivative, 'derivative');
                criterion('Cut size', close(m.cut, optimalCut, .03), m.cut.toFixed(4) + ' cm');
                criterion('Derivative at your cut', close(derivative, m.derivative, .02), String(derivative));
                metrics = { volume: m.volume, cut: m.cut };
            }
            else if (id === 'section') {
                const m = section(model.points), answer = numeric(model.area, 'area');
                criterion('Six sides', m.polygon.length === 6, m.polygon.length + ' vertices');
                criterion('Regular hexagon', m.regular, m.regular ? 'Equal sides and angles' : 'Not regular');
                criterion('Calculated area', close(answer, m.area, .03), String(answer));
                metrics = { area: m.area, vertices: m.polygon.length };
            }
            else if (['circumcircle', 'path', 'tangent'].includes(id)) {
                const objects = validateObjects(model.objects).filter(o => !given(id).some(g => g.id === o.id));
                if (id === 'circumcircle') {
                    const pts = given(id).map(o => o.p);
                    const candidate = objects.find(o => o.type === 'circle' && pts.every(p => close(distance(p, o.c), o.r, .025)));
                    criterion('Circle through A, B, C', candidate !== undefined, candidate ? 'All three points lie on the circle' : 'No matching circle');
                    if (candidate)
                        metrics = { radius: candidate.r, center: candidate.c };
                }
                else if (id === 'path') {
                    const [a, b] = given(id).map(o => o.p);
                    const target = [.2, 0];
                    const segs = objects.filter(o => o.type === 'segment');
                    const endpoint = (s, p) => distance(s.a, p) < .025 ? s.b : distance(s.b, p) < .025 ? s.a : null;
                    const left = segs.map(s => endpoint(s, a)).filter(Boolean), right = segs.map(s => endpoint(s, b)).filter(Boolean);
                    const touch = left.find(p => Math.abs(p[1]) < .02 && right.some(q => distance(p, q) < .025));
                    criterion('Two joined segments on boundary', !!touch, touch ? `P = (${touch.map(v => v.toFixed(3)).join(', ')})` : 'Construct AP and PB');
                    criterion('Shortest route', !!touch && distance(touch, target) < .035, touch ? (distance(a, touch) + distance(b, touch)).toFixed(4) : 'No route');
                    if (touch)
                        metrics = { length: distance(a, touch) + distance(b, touch) };
                }
                else {
                    const p = [5, 0], c = [0, 0];
                    const lines = objects.filter(o => o.type === 'line' && lineDistance(p, o.a, o.b) < .025 && close(lineDistance(c, o.a, o.b), 3, .025));
                    const distinct = lines.some(a => lines.some(b => Math.abs(cross2(unit(sub(a.b, a.a)), unit(sub(b.b, b.a)))) > .1));
                    criterion('Tangent through P', lines.length > 0, lines.length + ' matching lines');
                    criterion('Two distinct tangents', distinct, distinct ? 'Both found' : 'Find both tangent lines');
                }
            }
            else
                throw Error('Unknown project.');
            return { correct: results.every(r => r.pass), criteria: results, metrics };
        }
        return {
            projects,
            vessel,
            box,
            boxVolume,
            boxDerivative,
            optimalCut,
            section,
            vertices,
            edges,
            given,
            point,
            line,
            circle,
            reflect,
            intersect,
            check,
            distance,
            sub,
            add,
            scale,
            dot,
            norm,
            unit,
            cross,
            clamp
        };
    });
