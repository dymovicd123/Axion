(function (root) {
    const seg = (...ids) => ({ type: 'segment', ids }),
        plane = (...ids) => ({ type: 'polygon', ids }),
        extract = (...ids) => ({ type: 'extract', ids }),
        mid = (...ids) => ({ type: 'midpoint', ids }),
        section = (normal, offset) => ({ type: 'section', normal, offset });
    const ans = (label, value, hint, tol) => ({ label, value, hint, tol });
    const task = (id, title, dims, prompt, build, answers, solution, extra = {}) => ({ id, title, dims, prompt, build, answers, solution, ...extra });
    const diagonal = (id, a, b, h) => task(
        id,
        'From space to a right triangle',
        [a, b, h],
        `A cuboid has AB = ${a} cm, BC = ${b} cm and CG = ${h} cm. Find AG and the angle between AG and the base ABCD. Round the angle to two decimal places.`,
        [seg('A', 'C'), seg('A', 'G'), extract('A', 'B', 'C'), extract('A', 'C', 'G')],
        [
            ans('Base diagonal AC (cm)', Math.hypot(a, b), 'Apply Pythagoras in ABC.'),
            ans('Space diagonal AG (cm)', Math.hypot(a, b, h), 'Use right triangle ACG.'),
            ans('Angle with base (degrees)', Math.atan2(h, Math.hypot(a, b)) * 180 / Math.PI, 'The angle is CAG; tan θ = CG / AC.', .025)
        ],
        'AC² = AB² + BC². AG² = AC² + CG². The projection of AG onto ABCD is AC; tan ∠CAG = CG/AC.');
    const practice = [
        [
            task(
                'p11',
                'Intersection of two planes',
                [4, 3, 2],
                'The base ABCD and the diagonal plane ACG are given. Construct both planar polygons (use A, C, G, E for the diagonal plane) and their common line segment. Find the length of the common segment.',
                [plane('A', 'B', 'C', 'D'), plane('A', 'C', 'G', 'E'), seg('A', 'C')],
                [ans('Common segment length', 5, 'Use the right triangle ABC.')],
                'Both planes contain A and C, so they intersect along AC. AC = √(4²+3²) = 5.'),
            task(
                'p12',
                'Midpoint in a face',
                [6, 4, 3],
                'Construct the midpoint M of AB. Draw MC and extract triangle MBC. Find MB and MC.',
                [mid('A', 'B')],
                [ans('MB', 3, 'A midpoint divides a segment in half.'), ans('MC', 5, 'MB is perpendicular to BC.')],
                'MB = AB/2 = 3. MC = √(3²+4²) = 5.',
                { dynamic: 'midTriangle' })
        ],
        [
            task(
                'p21',
                'Parallel and perpendicular directions',
                [4, 3, 6],
                'Draw a base diagonal AC and a segment through E parallel to AC, using the top vertices. Construct the normal to the base through C. Find the angle between that normal and AC.',
                [seg('A', 'C'), seg('E', 'G'), seg('C', 'G')],
                [ans('Angle (degrees)', 90, 'A normal is perpendicular to every line in the plane through its foot.')],
                'EG and AC have the same direction; CG is perpendicular to ABCD, hence to AC.'),
            task(
                'p22',
                'A diagonal plane',
                [4, 3, 6],
                'Construct the diagonal plane ACGE and the base. Extract the right triangle ACG. Find the angle between the two planes and the area of ACGE.',
                [plane('A', 'C', 'G', 'E'), plane('A', 'B', 'C', 'D'), extract('A', 'C', 'G')],
                [ans('Dihedral angle (degrees)', 90, 'CG belongs to ACGE and is normal to ABCD.'), ans('Area', 30, 'Use AC as the width of the rectangle.')],
                'AC = 5. CG is normal to the base, so ACGE is perpendicular to it. The area is 5 × 6 = 30.')
        ],
        [diagonal('p31', 3, 4, 12), diagonal('p32', 6, 8, 24)],
        [
            task(
                'p41',
                'A triangular cut',
                [2, 2, 2],
                'Cut a cube of side 2 through the midpoints of AB, BC and BF (three edges meeting at B). Construct these midpoints, join them in a polygon, and extract the section in 2D. Find its side and area.',
                [],
                [ans('Side length', Math.sqrt(2), 'The two half-edges are perpendicular.'), ans('Area', Math.sqrt(3) / 2, 'The section is equilateral.')],
                'Each side is √(1²+1²). Area = √3/4 × 2 = √3/2.',
                { sectionKind: 'triangle' }),
            task(
                'p42',
                'A diagonal rectangular cut',
                [2, 2, 2],
                'Construct and extract the section through A, C and G. Find its perimeter and area.',
                [plane('A', 'C', 'G', 'E'), extract('A', 'C', 'G', 'E')],
                [ans('Perimeter', 4 + 4 * Math.sqrt(2), 'The sides are AC and CG.'), ans('Area', 4 * Math.sqrt(2), 'AC = 2√2, CG = 2.')],
                'The plane also meets E. The section is a rectangle with sides 2√2 and 2.')
        ],
        [
            task(
                'p51',
                'A box with a missing height',
                [3, 4, 12],
                'The base of a closed rectangular box is 3 cm by 4 cm. Its space diagonal is 13 cm. Construct and extract the triangle needed to find the height, then calculate the volume and total surface area.',
                [seg('A', 'C'), seg('A', 'G'), extract('A', 'C', 'G')],
                [
                    ans('Height (cm)', 12, 'Subtract the squared base diagonal from 13².'),
                    ans('Volume (cm³)', 144, 'Multiply base area by height.'),
                    ans('Surface area (cm²)', 192, 'Add the areas of all six faces.')
                ],
                'AC = 5; CG = √(169−25) = 12. V = 3×4×12 = 144; S = 2(12+36+48) = 192.'),
            task(
                'p52',
                'A square pyramid',
                [6, 6, 4],
                'A right square pyramid has base side 6 cm and height 4 cm. Build the midpoint M of BC, connect it to the apex T, and extract the triangle formed by T, the base centre O and M. Find the slant height, total surface area and volume.',
                [mid('B', 'C')],
                [
                    ans('Slant height (cm)', 5, 'OM = 3 and OT = 4.'),
                    ans('Total area (cm²)', 96, 'Add four triangles and the square base.'),
                    ans('Volume (cm³)', 48, 'One third of base area times height.')
                ],
                'TM = √(3²+4²) = 5; S = 36+4×6×5/2 = 96; V = 36×4/3 = 48.',
                { shape: 'pyramid', dynamic: 'pyramidTriangle' })
        ]
    ];
    const labs = [
        task(
            'l1',
            'Two planes sharing an edge',
            [3, 3, 3],
            'Build two different planes using cube vertices that both contain AB. Construct their shared segment. Investigate how the planes change when you choose different third points.',
            [seg('A', 'B')],
            [],
            'Any two distinct planes containing A and B share line AB.',
            { experiment: 'shared' }),
        task(
            'l2',
            'A family of perpendicular constructions',
            [3, 3, 3],
            'Construct two different diagonal planes perpendicular to the base ABCD. Both must be vertical; use the two base diagonals.',
            [plane('A', 'C', 'G', 'E'), plane('B', 'D', 'H', 'F')],
            [],
            'Each contains a vertical edge perpendicular to the base.'),
        task(
            'l3',
            'Shortest distance to a plane',
            [6, 8, 5],
            'From G, construct its orthogonal projection onto the base, and a longer oblique segment to A. Extract a triangle containing both. Calculate the distance to the base and compare with the oblique segment.',
            [seg('C', 'G'), seg('A', 'G'), extract('A', 'C', 'G')],
            [ans('Distance to base', 5, 'Use the normal.'), ans('Oblique length', Math.sqrt(125), 'Apply Pythagoras twice.')],
            'The perpendicular CG = 5 is the shortest distance. AG = √125.'),
        task(
            'l4',
            'Construct a regular hexagon',
            [2, 2, 2],
            'Construct a regular hexagonal section through the centre of the cube. Use midpoints of edges, connect six points in boundary order, then extract the polygon to calculate area. The section must lie in a plane through the cube centre.',
            [],
            [ans('Area', 3 * Math.sqrt(3), 'Split into six equilateral triangles of side √2.')],
            'A plane with normal (±1,±1,±1) through the centre cuts six edge midpoints. The hexagon has area 3√3.',
            { sectionKind: 'hexagon' }),
        task(
            'l5',
            'Compare prism and pyramid',
            [6, 6, 4],
            'A right square pyramid and a cuboid have identical square bases and height 4. In the pyramid, construct and extract the vertical triangle T–O–M (M midpoint of BC). Compare their volumes and calculate the lateral area of the pyramid.',
            [mid('B', 'C')],
            [
                ans('Pyramid volume', 48, 'Use V = Bh/3.'), ans('Cuboid volume', 144, 'Use V = Bh.'), ans('Pyramid lateral area', 60, 'Find the slant height first.')
            ],
            'The pyramid occupies one third of the matching prism volume. Slant height = 5; lateral area = 4×6×5/2 = 60.',
            { shape: 'pyramid', dynamic: 'pyramidTriangle' })
    ];
    const final = [
        task(
            'f1',
            'Plane intersection',
            [5, 12, 3],
            'Construct planes ABCD and BDFH, and their common segment. Find its length.',
            [plane('A', 'B', 'C', 'D'), plane('B', 'D', 'H', 'F'), seg('B', 'D')],
            [ans('Length', 13)],
            'Both planes contain B and D. BD = 13.'),
        task(
            'f2',
            'Perpendicular plane',
            [8, 6, 3],
            'Construct a diagonal plane through B, D and H that is perpendicular to the base; draw its intersection with the base. Find the area of this plane inside the cuboid.',
            [plane('B', 'D', 'H', 'F'), seg('B', 'D')],
            [ans('Area', 30)],
            'BD = 10; DH = 3; area = 30.'),
        diagonal('f3', 5, 12, 9),
        task(
            'f4',
            'Section of a cube',
            [2, 2, 2],
            'The cutting plane passes through D, B and F. Construct the full section, extract it and find its area.',
            [plane('B', 'D', 'H', 'F'), extract('B', 'D', 'H', 'F')],
            [ans('Area', 4 * Math.sqrt(2))],
            'BD = 2√2; BF = 2.'),
        task(
            'f5',
            'Pyramid calculation',
            [8, 8, 3],
            'A right square pyramid has base side 8 and vertical height 3. Construct the midpoint of BC and extract the triangle needed for its slant height. Find total surface area and volume.',
            [mid('B', 'C')],
            [ans('Total surface area', 144), ans('Volume', 64)],
            'Slant height = 5; S = 64+4×8×5/2 = 144; V = 64×3/3 = 64.',
            { shape: 'pyramid', dynamic: 'pyramidTriangle' })
    ];
    const api = { practice, labs, final };
    if (typeof module === 'object' && module.exports)
        module.exports = api;
    else
        root.StereoTasks = api;
})(typeof window === 'undefined' ? globalThis : window);
