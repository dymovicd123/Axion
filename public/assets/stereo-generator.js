(function (root) {
    const topics = ['Plane intersections', 'Parallel and perpendicular planes', 'Angles and distances', 'Cross-sections', 'Surface area and volume'];
    const levels = ['Basic', 'Intermediate', 'Advanced'];
    function generate(topic, level, seed) {
        if (!Number.isInteger(topic) || topic < 0 || topic >= topics.length || !Number.isInteger(level) || level < 0 || level > 2 || !Number.isInteger(seed) || seed < 0 || seed > 4294967295)
            throw Error('Invalid generator settings.');
        let s = seed >>> 0;
        const next = () => {
            s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
            return s / 4294967296;
        };
        const pick = a => a[Math.floor(next() * a.length)];
        const triples = [[3, 4], [5, 12], [6, 8], [8, 15], [7, 24], [9, 12], [12, 16]];
        const [a, b] = pick(triples.slice(0, level === 0 ? 3 : triples.length));
        const h = pick([3, 4, 5, 6, 8, 9, 10, 12, 15]);
        const d = Math.hypot(a, b), g = Math.hypot(d, h);
        const n = pick([3, 4, 5, 6, 7, 8, 9, 10, 12]);
        const r = (type, ...ids) => ({ type, ids }),
            ans = (label, value, hint, tol) => ({ label, value, hint: level === 2 ? undefined : hint, tol }),
            t = {
                id: `gen-${topic}-${level}-${seed}`,
                dims: [a, b, h],
                build: [],
                answers: [],
                solution: '',
                title: topics[topic],
                prompt: '',
                generated: true,
                difficulty: levels[level]
            };
        const box = `A cuboid has AB = ${a} cm, BC = ${b} cm and CG = ${h} cm. `;
        if (topic === 0) {
            const ids = level === 2 ? ['B', 'D', 'H', 'F'] : ['A', 'C', 'G', 'E'], ends = ids.slice(0, 2);
            t.prompt = box + `Construct the base and diagonal plane ${ids.join('')}. Draw their intersection inside the cuboid. Find its length.${level ? ' Also find the area of the diagonal rectangle.' : ''}`;
            t.build = [r('polygon', 'A', 'B', 'C', 'D'), r('polygon', ...ids), r('segment', ...ends)];
            t.answers = [ans('Intersection length (cm)', d, 'Use Pythagoras in the base.')];
            t.answerSegments = [ends];
            if (level)
                t.answers.push(ans('Rectangle area (cm²)', d * h, 'Multiply the base diagonal by the height.'));
            t.solution = `The two planes share ${ends.join('')}. Its length is sqrt(${a}² + ${b}²) = ${d}. The diagonal rectangle has height ${h}. Its area is ${d * h}.`;
        }
        if (topic === 1) {
            t.prompt = box + 'Construct a diagonal plane perpendicular to the base through A and C. Draw a normal through C and extract ACG. Find the angle between the planes.' + (level ? ' Find the area of the diagonal plane inside the solid.' : '') + (level === 2 ? ' Also find the length AG.' : '');
            t.build = [r('polygon', 'A', 'C', 'G', 'E'), r('segment', 'C', 'G'), r('extract', 'A', 'C', 'G')];
            t.answers = [ans('Angle between planes (degrees)', 90, 'CG is a normal contained in the diagonal plane.')];
            t.answerSegments = [];
            if (level)
                t.answers.push(ans('Area (cm²)', d * h, 'The rectangle has width AC.'));
            if (level === 2) {
                t.answers.push(ans('AG (cm)', g));
                t.answerSegments[2] = ['A', 'G'];
            }
            t.solution = `CG is normal to the base, so ACGE is perpendicular to it. AC = ${d}; area = ${d * h}; AG = sqrt(${d * d}+${h * h}) ≈ ${g.toFixed(3)}.`;
        }
        if (topic === 2) {
            t.prompt = box + 'Construct AC and AG, extract the triangles ABC and ACG, and find AG.' + (level ? ' Find the angle between AG and the base. Round to two decimal places.' : '') + (level === 2 ? ' Also find the area of triangle ACG.' : '');
            t.build = [r('segment', 'A', 'C'), r('segment', 'A', 'G'), r('extract', 'A', 'B', 'C'), r('extract', 'A', 'C', 'G')];
            t.answers = [ans('AC (cm)', d, 'Use Pythagoras in ABC.'), ans('AG (cm)', g, 'Use right triangle ACG.')];
            t.answerSegments = [['A', 'C'], ['A', 'G']];
            if (level)
                t.answers.push(ans('Angle (degrees)', Math.atan2(h, d) * 180 / Math.PI, 'Use tan θ = CG / AC.', .025));
            if (level === 2)
                t.answers.push(ans('Triangle area (cm²)', d * h / 2));
            t.solution = `AC = sqrt(${a}² + ${b}²) = ${d}; AG = sqrt(${d}² + ${h}²) ≈ ${g.toFixed(3)}. θ = arctan(${h}/${d}) ≈ ${(Math.atan2(h, d) * 180 / Math.PI).toFixed(2)}°. Area = ${d * h / 2}.`;
        }
        if (topic === 3) {
            t.dims = [n, n, n];
            if (level === 2) {
                t.prompt = `A cube has edge ${n} cm. Construct the triangular section through the midpoints of AB, BC and BF, extract it, and find its perimeter and area.`;
                t.sectionKind = 'triangle';
                t.answers = [ans('Perimeter (cm)', 3 * n / Math.sqrt(2)), ans('Area (cm²)', Math.sqrt(3) * n * n / 8)];
                t.solution = `Each side is sqrt((${n}/2)²+(${n}/2)²) = ${n}/sqrt(2). Multiply by three for the perimeter; area = sqrt(3)/4 × side².`;
            }
            else {
                t.prompt = `A cube has edge ${n} cm. Construct and extract the entire section through A, C and G. Find its area${level ? ' and perimeter' : ''}.`;
                t.build = [r('polygon', 'A', 'C', 'G', 'E'), r('extract', 'A', 'C', 'G', 'E')];
                t.answers = [ans('Area (cm²)', n * n * Math.sqrt(2), 'The section is a rectangle; find AC.')];
                if (level)
                    t.answers.push(ans('Perimeter (cm)', 2 * n * (1 + Math.sqrt(2)), 'Add all four sides.'));
                t.solution = `AC = ${n}sqrt(2); CG = ${n}. Area = ${n * n}sqrt(2); perimeter = ${2 * n}(1+sqrt(2)).`;
            }
        }
        if (topic === 4) {
            if (level === 0) {
                t.prompt = box + 'Extract the base and find the volume and total surface area.';
                t.build = [r('extract', 'A', 'B', 'C', 'D')];
                t.answers = [ans('Volume (cm³)', a * b * h, 'Multiply the three dimensions.'), ans('Total area (cm²)', 2 * (a * b + a * h + b * h), 'Add the six face areas.')];
                t.solution = `V = ${a}×${b}×${h} = ${a * b * h}; S = 2(${a * b}+${a * h}+${b * h}) = ${2 * (a * b + a * h + b * h)}.`;
            }
            else {
                t.dims = [n, n, h];
                t.shape = 'pyramid';
                t.dynamic = 'pyramidTriangle';
                const l = Math.hypot(n / 2, h);
                t.prompt = `A right square pyramid has base side ${n} cm and height ${h} cm. Mark the midpoint M of BC, draw TM and extract triangle TOM. Find the slant height, total surface area and volume.` + (level === 2 ? ' Also calculate the angle between the slant height and the base.' : '');
                t.build = [r('midpoint', 'B', 'C')];
                t.answers = [
                    ans('Slant height (cm)', l, 'Use the right triangle TOM.'),
                    ans('Total surface area (cm²)', n * n + 2 * n * l, 'Add the square base and four triangles.'),
                    ans('Volume (cm³)', n * n * h / 3, 'One third of base area times height.')
                ];
                if (level === 2)
                    t.answers.push(ans('Angle (degrees)', Math.atan2(h, n / 2) * 180 / Math.PI, undefined, .025));
                t.solution = `OM = ${n}/2; TM = sqrt(OM²+${h}²) ≈ ${l.toFixed(3)}. S = ${n}² + 2×${n}×TM; V = ${n}²×${h}/3. The angle is arctan(${h}/OM).`;
            }
        }
        return t;
    }
    const api = { topics, levels, generate };
    if (typeof module === 'object' && module.exports)
        module.exports = api;
    else
        root.StereoGenerator = api;
})(typeof window === 'undefined' ? globalThis : window);
