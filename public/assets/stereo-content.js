(function (root) {
    const lessons = [
        {
            title: 'Points, lines and planes', intro: 'Learn the basic objects of solid geometry and how they determine one another.', sections: [
                [
                    "Points, lines, planes and solids",
                    ("<p>Imagine the corner of a room, the edge where two walls meet, and the surface of the floor. These are useful models of the three basic objects " +
                        "of solid geometry (stereometry): a point, a line and a plane. A point has position but no length, a line extends infinitely in both directions, " +
                        "and a plane extends infinitely in two independent directions.</p>" +
                        "<p>A segment AB is only the finite part of the line through A and B. A face of a cube is a bounded square, not an entire plane. We often name the " +
                        "plane containing that square by three of its non-collinear vertices: plane ABC.</p><div class=\"worked\"><h3>Reading the Axion cuboid</h3>" +
                        "<figure class=\"stereo-theory-figure\"><svg viewBox=\"0 0 320 230\" role=\"img\" aria-label=\"Cuboid ABCDEFGH. ABCD is the base; EFGH is the top.\">" +
                        "<polygon points=\"53,189 211,189 211,85 53,85\" class=\"theory-face\"/><polygon points=\"211,189 264,134 264,30 211,85\" class=\"theory-face\"/>" +
                        "<polygon points=\"53,85 211,85 264,30 106,30\" class=\"theory-face\"/><polyline points=\"53,189 211,189\" class=\"theory-edge\"/>" +
                        "<polyline points=\"211,189 264,134\" class=\"theory-edge\"/><polyline points=\"264,134 264,30\" class=\"theory-edge\"/>" +
                        "<polyline points=\"264,30 211,85\" class=\"theory-edge\"/><polyline points=\"211,85 53,85\" class=\"theory-edge\"/>" +
                        "<polyline points=\"53,85 53,189\" class=\"theory-edge\"/><polyline points=\"211,189 211,85\" class=\"theory-edge\"/>" +
                        "<polyline points=\"264,30 106,30\" class=\"theory-edge\"/><polyline points=\"106,30 53,85\" class=\"theory-edge\"/>" +
                        "<polyline points=\"53,189 106,134\" class=\"theory-hidden\"/><polyline points=\"106,134 264,134\" class=\"theory-hidden\"/>" +
                        "<polyline points=\"106,134 106,30\" class=\"theory-hidden\"/><circle cx=\"53\" cy=\"189\" r=\"2.8\" class=\"theory-point\"/><text x=\"38\" y=\"203\">A</text>" +
                        "<circle cx=\"211\" cy=\"189\" r=\"2.8\" class=\"theory-point\"/><text x=\"214\" y=\"204\">B</text><circle cx=\"264\" cy=\"134\" r=\"2.8\" class=\"theory-point\"/>" +
                        "<text x=\"273\" y=\"141\">C</text><circle cx=\"106\" cy=\"134\" r=\"2.8\" class=\"theory-point\"/><text x=\"89\" y=\"128\">D</text>" +
                        "<circle cx=\"53\" cy=\"85\" r=\"2.8\" class=\"theory-point\"/><text x=\"38\" y=\"80\">E</text><circle cx=\"211\" cy=\"85\" r=\"2.8\" class=\"theory-point\"/>" +
                        "<text x=\"214\" y=\"80\">F</text><circle cx=\"264\" cy=\"30\" r=\"2.8\" class=\"theory-point\"/><text x=\"272\" y=\"33\">G</text>" +
                        "<circle cx=\"106\" cy=\"30\" r=\"2.8\" class=\"theory-point\"/><text x=\"91\" y=\"25\">H</text></svg>" +
                        "<figcaption>Cuboid ABCDEFGH. ABCD is the base; EFGH is the top.</figcaption></figure>" +
                        "<p>ABCD is the lower face and EFGH is the upper face. AE, BF, CG and DH join corresponding vertices. A cuboid has 8 vertices, 12 edges and 6 " +
                        "faces. Dashed lines represent edges hidden by the solid; they are not shorter or less real than solid lines.</p></div>" +
                        "<p>A perspective sketch may make equal lengths look different or a right angle look acute. Always use the information in the problem, not the " +
                        "apparent proportions of the drawing.</p>")
                ],
                [
                    "Incidence: which objects belong together?",
                    ("<p>Incidence describes whether a point lies on a line or in a plane. Write A ∈ α when A belongs to plane α. A ∉ α means that A is outside the " +
                        "plane. The following basic statements are axioms: they are starting rules of Euclidean geometry.</p><ol>" +
                        "<li>Two distinct points determine exactly one line.</li><li>Three non-collinear points determine exactly one plane.</li>" +
                        "<li>If two distinct points of a line lie in a plane, the entire line lies in that plane.</li>" +
                        "<li>If two distinct planes share a point, their intersection is a line.</li></ol><div class=\"worked\"><h3>Example: prove that AC lies in ABCD</h3>" +
                        "<p>Both A and C are vertices of the lower face. Therefore A and C belong to its plane. By axiom 3, the entire line AC belongs to that plane, " +
                        "including the diagonal segment inside the face.</p></div>" +
                        "<p>Three points are non-collinear if they cannot all lie on a single line. Four points are coplanar only if one plane contains all four. A, B, C " +
                        "and D are coplanar, but A, B, C and E are not.</p><details class=\"stereo-self-check\"><summary>Check your understanding</summary>" +
                        "<p>Can a plane contain A and C but not the midpoint of AC? No: the whole line belongs to the plane.</p></details>")
                ],
                [
                    "Four ways to determine a plane",
                    ("<p>To specify a unique plane, you need information that fixes two independent directions. There are four standard ways to do this.</p>" +
                        "<div class=\"math-table-scroll\"><table class=\"lesson-table\"><thead><tr><th>Given</th><th>Why the plane is unique</th></tr></thead><tbody><tr>" +
                        "<td>Three non-collinear points</td><td>Directly from the plane axiom.</td></tr><tr><td>A line and a point outside it</td>" +
                        "<td>Choose two points on the line and add the outside point.</td></tr><tr><td>Two distinct intersecting lines</td>" +
                        "<td>Use their intersection and one further point on each line.</td></tr><tr><td>Two distinct parallel lines</td>" +
                        "<td>Parallel lines are coplanar; use two points on one and one on the other.</td></tr></tbody></table></div>" +
                        "<p>Two points, one line, or three collinear points do not determine a unique plane. Imagine opening a book: each page can rotate about the same " +
                        "spine.</p><div class=\"worked\"><h3>Example: the plane ACGE</h3>" +
                        "<p>The lower diagonal AC and the vertical edge CG intersect at C. They determine plane ACG. E also lies in this plane because AE and CG are " +
                        "parallel and the parallel lines AC and EG bound the same rectangle. The quadrilateral ACGE is a diagonal face-like slice, not an exterior " +
                        "face.</p></div><details class=\"stereo-self-check\"><summary>Try a proof</summary>" +
                        "<p>Why do AB and EF determine a plane? They are distinct parallel lines, and their plane is ABFE.</p></details>")
                ],
                [
                    "Finding the intersection of planes",
                    ("<p>When two different planes intersect, they share an entire line. To locate it on a diagram, find two distinct points that belong to both planes " +
                        "and connect them. Do not connect arbitrary points from different planes.</p><div class=\"worked\"><h3>Worked construction: ABCD and ACGE</h3>" +
                        "<figure class=\"stereo-theory-figure\"><svg viewBox=\"0 0 320 230\" role=\"img\" aria-label=\"The diagonal plane ACGE intersects the base along AC.\">" +
                        "<polygon points=\"53,189 211,189 211,85 53,85\" class=\"theory-face\"/><polygon points=\"211,189 264,134 264,30 211,85\" class=\"theory-face\"/>" +
                        "<polygon points=\"53,85 211,85 264,30 106,30\" class=\"theory-face\"/><polygon points=\"53,189 264,134 264,30 53,85\" class=\"theory-highlight\"/>" +
                        "<polyline points=\"53,189 211,189\" class=\"theory-edge\"/><polyline points=\"211,189 264,134\" class=\"theory-edge\"/>" +
                        "<polyline points=\"264,134 264,30\" class=\"theory-edge\"/><polyline points=\"264,30 211,85\" class=\"theory-edge\"/>" +
                        "<polyline points=\"211,85 53,85\" class=\"theory-edge\"/><polyline points=\"53,85 53,189\" class=\"theory-edge\"/>" +
                        "<polyline points=\"211,189 211,85\" class=\"theory-edge\"/><polyline points=\"264,30 106,30\" class=\"theory-edge\"/>" +
                        "<polyline points=\"106,30 53,85\" class=\"theory-edge\"/><polyline points=\"53,189 106,134\" class=\"theory-hidden\"/>" +
                        "<polyline points=\"106,134 264,134\" class=\"theory-hidden\"/><polyline points=\"106,134 106,30\" class=\"theory-hidden\"/>" +
                        "<polyline points=\"53,189 264,134\" class=\"theory-accent\"/><circle cx=\"53\" cy=\"189\" r=\"2.8\" class=\"theory-point\"/><text x=\"38\" y=\"203\">A</text>" +
                        "<circle cx=\"211\" cy=\"189\" r=\"2.8\" class=\"theory-point\"/><text x=\"214\" y=\"204\">B</text><circle cx=\"264\" cy=\"134\" r=\"2.8\" class=\"theory-point\"/>" +
                        "<text x=\"273\" y=\"141\">C</text><circle cx=\"106\" cy=\"134\" r=\"2.8\" class=\"theory-point\"/><text x=\"89\" y=\"128\">D</text>" +
                        "<circle cx=\"53\" cy=\"85\" r=\"2.8\" class=\"theory-point\"/><text x=\"38\" y=\"80\">E</text><circle cx=\"211\" cy=\"85\" r=\"2.8\" class=\"theory-point\"/>" +
                        "<text x=\"214\" y=\"80\">F</text><circle cx=\"264\" cy=\"30\" r=\"2.8\" class=\"theory-point\"/><text x=\"272\" y=\"33\">G</text>" +
                        "<circle cx=\"106\" cy=\"30\" r=\"2.8\" class=\"theory-point\"/><text x=\"91\" y=\"25\">H</text></svg>" +
                        "<figcaption>The diagonal plane ACGE intersects the base along AC.</figcaption></figure><ol>" +
                        "<li>Identify the common points: A belongs to both planes, and C does too.</li>" +
                        "<li>Draw AC. Both planes contain the whole line through A and C.</li>" +
                        "<li>Conclude that the intersection of the infinite planes is line AC. Inside the cuboid the common part is segment AC.</li></ol>" +
                        "<p>If AB = 4 cm and BC = 3 cm, the triangle ABC is right at B, so AC² = 4² + 3² = 25. Thus AC = 5 cm.</p></div>" +
                        "<p>This is the same strategy used later for cross-sections: find common points, identify the plane, then extract the useful 2D figure before " +
                        "calculating.</p>")
                ],
                [
                    "Coordinates as a second method",
                    ("<p>Spatial coordinates provide another way to justify a construction. Choose three mutually perpendicular axes. In Axion the y-axis is vertical, " +
                        "while x and z span the horizontal plane. A point P(x,y,z) records its position on all three axes.</p>" +
                        "<p>The vector AB = B − A records movement from A to B. Its components are found by subtracting coordinates. For A(0,0,0) and B(4,0,3), AB = " +
                        "(4,0,3). All points on the line through A in direction u have the form A + tu, where t is any real number.</p>" +
                        "<p>A normal vector n is perpendicular to the plane. If A lies in it, a point X lies in the plane exactly when:</p>" +
                        "<div class=\"equation\">n · (X − A) = 0</div><p>The dot product u · v = uₓvₓ + uᵧvᵧ + u𝓏v𝓏 measures how directions align. For nonzero vectors, a " +
                        "zero dot product means orthogonal directions.</p><div class=\"worked\"><h3>Worked example</h3>" +
                        "<p>A(0,0,0), B(2,0,0), C(0,0,3) are non-collinear and all satisfy y = 0. They determine that plane. D(1,0,1) satisfies y = 0, so belongs to it. " +
                        "E(1,2,1) does not. The normal is n = (0,1,0).</p></div><p>" +
                        "<strong>Takeaway:</strong> use incidence and simple planar reasoning first. Use coordinates when a construction is difficult to justify or when " +
                        "exact calculations are easier with algebra.</p>")
                ]
            ], questions: [['How many planes contain a given line?', ['One', 'Infinitely many', 'None'], 1, 'A plane can rotate around the line.'], ['Which points determine a unique plane?', ['Three distinct collinear points', 'Two distinct points', 'Three non-collinear points'], 2, 'Non-collinearity is necessary.'], ['Which point belongs to y = 0?', ['(2,0,3)', '(0,2,3)', '(0,1,0)'], 0, 'The second coordinate must be zero.'], ['A and B lie in a plane. What about line AB?', ['Only the segment lies in it', 'The entire line lies in it', 'It intersects at one point'], 1, 'The incidence axiom applies to the entire line.']]
        },
        {
            title: 'Parallelism and perpendicularity', intro: 'Distinguish intersecting, parallel and skew objects in three dimensions.', sections: [
                [
                    "Relative positions of two lines",
                    ("<p>In a flat plane two distinct lines either intersect or are parallel. Space introduces a third possibility: skew lines. They have no common " +
                        "point and do not lie in the same plane. Merely not meeting is therefore insufficient to prove parallelism.</p><div class=\"math-table-scroll\">" +
                        "<table class=\"lesson-table\"><thead><tr><th>Relation</th><th>Coplanar?</th><th>Example in a cuboid</th></tr></thead><tbody><tr>" +
                        "<td>Intersecting</td><td>Yes</td><td>AB and BC meet at B.</td></tr><tr><td>Parallel</td><td>Yes</td><td>AB and DC have the same direction.</td>" +
                        "</tr><tr><td>Skew</td><td>No</td><td>AB and CG do not meet and have different directions.</td></tr><tr><td>Coincident</td><td>Yes</td>" +
                        "<td>AB and BA describe the same infinite line.</td></tr></tbody></table></div><figure class=\"stereo-theory-figure\">" +
                        "<svg viewBox=\"0 0 320 230\" role=\"img\" aria-label=\"AB and CG are skew: their lines do not meet and are not coplanar.\">" +
                        "<polygon points=\"53,189 211,189 211,85 53,85\" class=\"theory-face\"/><polygon points=\"211,189 264,134 264,30 211,85\" class=\"theory-face\"/>" +
                        "<polygon points=\"53,85 211,85 264,30 106,30\" class=\"theory-face\"/><polyline points=\"53,189 211,189\" class=\"theory-edge\"/>" +
                        "<polyline points=\"211,189 264,134\" class=\"theory-edge\"/><polyline points=\"264,134 264,30\" class=\"theory-edge\"/>" +
                        "<polyline points=\"264,30 211,85\" class=\"theory-edge\"/><polyline points=\"211,85 53,85\" class=\"theory-edge\"/>" +
                        "<polyline points=\"53,85 53,189\" class=\"theory-edge\"/><polyline points=\"211,189 211,85\" class=\"theory-edge\"/>" +
                        "<polyline points=\"264,30 106,30\" class=\"theory-edge\"/><polyline points=\"106,30 53,85\" class=\"theory-edge\"/>" +
                        "<polyline points=\"53,189 106,134\" class=\"theory-hidden\"/><polyline points=\"106,134 264,134\" class=\"theory-hidden\"/>" +
                        "<polyline points=\"106,134 106,30\" class=\"theory-hidden\"/><polyline points=\"53,189 211,189\" class=\"theory-accent\"/>" +
                        "<polyline points=\"264,134 264,30\" class=\"theory-second\"/><circle cx=\"53\" cy=\"189\" r=\"2.8\" class=\"theory-point\"/><text x=\"38\" y=\"203\">A</text>" +
                        "<circle cx=\"211\" cy=\"189\" r=\"2.8\" class=\"theory-point\"/><text x=\"214\" y=\"204\">B</text><circle cx=\"264\" cy=\"134\" r=\"2.8\" class=\"theory-point\"/>" +
                        "<text x=\"273\" y=\"141\">C</text><circle cx=\"106\" cy=\"134\" r=\"2.8\" class=\"theory-point\"/><text x=\"89\" y=\"128\">D</text>" +
                        "<circle cx=\"53\" cy=\"85\" r=\"2.8\" class=\"theory-point\"/><text x=\"38\" y=\"80\">E</text><circle cx=\"211\" cy=\"85\" r=\"2.8\" class=\"theory-point\"/>" +
                        "<text x=\"214\" y=\"80\">F</text><circle cx=\"264\" cy=\"30\" r=\"2.8\" class=\"theory-point\"/><text x=\"272\" y=\"33\">G</text>" +
                        "<circle cx=\"106\" cy=\"30\" r=\"2.8\" class=\"theory-point\"/><text x=\"91\" y=\"25\">H</text></svg>" +
                        "<figcaption>AB and CG are skew: their lines do not meet and are not coplanar.</figcaption></figure>" +
                        "<p>In a cuboid, opposite edges of each face are parallel. Edges from different faces are not automatically parallel. A useful criterion: if two " +
                        "distinct lines are parallel to the same line, then they are parallel to each other.</p><details class=\"stereo-self-check\">" +
                        "<summary>Check: are AB and FG parallel?</summary><p>No. Their directions differ and the lines lie at different heights; they are skew.</p>" +
                        "</details>")
                ],
                [
                    "Line and plane: containment, intersection and parallelism",
                    ("<p>There are three possibilities: a line lies entirely in a plane, intersects it at one point, or is strictly parallel to it. A line parallel to " +
                        "a line in a plane is parallel to that plane provided it does not lie in the plane itself.</p><div class=\"worked\">" +
                        "<h3>Example: prove EG ∥ plane ABCD</h3><p>The upper diagonal EG is parallel to the lower diagonal AC. AC lies in plane ABCD. E lies outside ABCD " +
                        "because it is above the base. Therefore EG is strictly parallel to ABCD.</p></div>" +
                        "<p>A line perpendicular to a plane is a special case of an intersecting line, not a fourth disjoint relation. It meets the plane at a right " +
                        "angle.</p><h3>Coordinate check</h3><p>Let u be the line direction and n the plane normal. If u · n = 0, the line direction is parallel to the " +
                        "plane. Substitute one point of the line into the plane equation to distinguish containment from strict parallelism. Otherwise the line meets the " +
                        "plane at one point.</p>")
                ],
                [
                    "Parallel and intersecting planes",
                    ("<p>Two distinct planes are either parallel (they have no common points) or intersect along a line. The top and bottom faces of a cuboid lie in " +
                        "parallel planes. Adjacent face planes intersect along a common edge.</p><p>" +
                        "<strong>Parallel-plane criterion:</strong> if two intersecting lines in one plane are respectively parallel to two intersecting lines in a " +
                        "different plane, the planes are parallel. Two non-parallel directions are needed to fix their orientation.</p><div class=\"worked\">" +
                        "<h3>Example: prove ABCD ∥ EFGH</h3><p>AB ∥ EF and BC ∥ FG. AB and BC meet at B; EF and FG meet at F. The planes are distinct, so the " +
                        "parallel-plane criterion applies.</p></div><p><strong>Useful theorem for sections:</strong> when a third plane intersects two parallel planes in " +
                        "lines, those two intersection lines are parallel. For example, plane ACGE cuts the parallel top and bottom planes in EG and AC.</p>" +
                        "<p>In coordinates, parallel plane normals are proportional. Check a point to exclude coincident planes. Perpendicular plane normals instead " +
                        "indicate perpendicular planes.</p>")
                ],
                [
                    "Perpendicular lines and the normal to a plane",
                    ("<p>Two intersecting lines are perpendicular if they meet at 90°. In space, two directions can also be orthogonal even when their lines are skew. " +
                        "State whether you mean intersecting lines or their direction vectors.</p><p>" +
                        "<strong>Line–plane perpendicularity criterion:</strong> a line through P is perpendicular to a plane if it is perpendicular to two distinct " +
                        "intersecting lines of that plane through P. Once proved, it is perpendicular to every line of the plane passing through P.</p>" +
                        "<figure class=\"stereo-theory-figure\"><svg viewBox=\"0 0 320 230\" role=\"img\" aria-label=\"CG is perpendicular to both CB and CD, which meet at C in " +
                        "the base.\"><polygon points=\"53,189 211,189 211,85 53,85\" class=\"theory-face\"/>" +
                        "<polygon points=\"211,189 264,134 264,30 211,85\" class=\"theory-face\"/><polygon points=\"53,85 211,85 264,30 106,30\" class=\"theory-face\"/>" +
                        "<polygon points=\"53,189 211,189 264,134 106,134\" class=\"theory-highlight\"/><polyline points=\"53,189 211,189\" class=\"theory-edge\"/>" +
                        "<polyline points=\"211,189 264,134\" class=\"theory-edge\"/><polyline points=\"264,134 264,30\" class=\"theory-edge\"/>" +
                        "<polyline points=\"264,30 211,85\" class=\"theory-edge\"/><polyline points=\"211,85 53,85\" class=\"theory-edge\"/>" +
                        "<polyline points=\"53,85 53,189\" class=\"theory-edge\"/><polyline points=\"211,189 211,85\" class=\"theory-edge\"/>" +
                        "<polyline points=\"264,30 106,30\" class=\"theory-edge\"/><polyline points=\"106,30 53,85\" class=\"theory-edge\"/>" +
                        "<polyline points=\"53,189 106,134\" class=\"theory-hidden\"/><polyline points=\"106,134 264,134\" class=\"theory-hidden\"/>" +
                        "<polyline points=\"106,134 106,30\" class=\"theory-hidden\"/><polyline points=\"264,134 264,30\" class=\"theory-accent\"/>" +
                        "<polyline points=\"264,134 211,189\" class=\"theory-second\"/><polyline points=\"264,134 106,134\" class=\"theory-second\"/>" +
                        "<circle cx=\"53\" cy=\"189\" r=\"2.8\" class=\"theory-point\"/><text x=\"38\" y=\"203\">A</text><circle cx=\"211\" cy=\"189\" r=\"2.8\" class=\"theory-point\"/>" +
                        "<text x=\"214\" y=\"204\">B</text><circle cx=\"264\" cy=\"134\" r=\"2.8\" class=\"theory-point\"/><text x=\"273\" y=\"141\">C</text>" +
                        "<circle cx=\"106\" cy=\"134\" r=\"2.8\" class=\"theory-point\"/><text x=\"89\" y=\"128\">D</text><circle cx=\"53\" cy=\"85\" r=\"2.8\" class=\"theory-point\"/>" +
                        "<text x=\"38\" y=\"80\">E</text><circle cx=\"211\" cy=\"85\" r=\"2.8\" class=\"theory-point\"/><text x=\"214\" y=\"80\">F</text>" +
                        "<circle cx=\"264\" cy=\"30\" r=\"2.8\" class=\"theory-point\"/><text x=\"272\" y=\"33\">G</text><circle cx=\"106\" cy=\"30\" r=\"2.8\" class=\"theory-point\"/>" +
                        "<text x=\"91\" y=\"25\">H</text></svg><figcaption>CG is perpendicular to both CB and CD, which meet at C in the base.</figcaption></figure>" +
                        "<div class=\"worked\"><h3>Example: prove CG ⟂ ABCD</h3><ol><li>CG ⟂ CB because BCGF is a rectangle.</li>" +
                        "<li>CG ⟂ CD because CDHG is a rectangle.</li><li>CB and CD are two distinct lines of ABCD meeting at C. Therefore CG ⟂ ABCD, and in particular CG " +
                        "⟂ CA.</li></ol></div><p>Being perpendicular to just one line of a plane is not enough. For instance BC is perpendicular to AB, but BC lies in the " +
                        "base rather than being normal to it.</p>")
                ],
                [
                    "Perpendicular planes and the angle between skew lines",
                    ("<p>If one plane contains a line perpendicular to a second plane, the two planes are perpendicular. For example, ACGE contains CG, which is normal " +
                        "to ABCD; hence ACGE ⟂ ABCD.</p><p>A plane-plane angle can be constructed by taking one line in each plane perpendicular to their intersection at " +
                        "the same point. Their angle is a linear angle of the dihedral angle. The smaller angle between the planes lies between 0° and 90°.</p>" +
                        "<div class=\"worked\"><h3>Example: ACGE and ABCD</h3><p>The common line is AC. In the diagonal plane, CG is perpendicular to AC. In the base, take " +
                        "a line through C perpendicular to AC. Because CG is normal to the base, these two lines form a 90° angle.</p></div>" +
                        "<p>To find the angle between skew lines, translate one of the lines parallel to itself until both directions pass through a common point. The " +
                        "smaller angle between those intersecting lines is the desired angle. For example, AB and CG are skew, but CG ∥ BF and AB ⟂ BF, so their " +
                        "directions form 90°.</p><p>With direction vectors u and v, perpendicular directions satisfy u · v = 0. Parallel directions satisfy u = kv for " +
                        "some nonzero k. These are useful independent checks, not replacements for a geometric explanation.</p>")
                ]
            ], questions: [['Non-coplanar lines that never intersect are…', ['Parallel', 'Skew', 'Coincident'], 1, 'Parallel lines must be coplanar.'], ['A line has direction (0,1,0). What is its relation to y = 0?', ['Parallel', 'Contained', 'Perpendicular'], 2, 'Its direction is parallel to the normal.'], ['The normals of two distinct planes are proportional. The planes are…', ['Parallel', 'Perpendicular', 'Skew'], 0, 'Distinct planes with proportional normals cannot intersect.'], ['Which dot product indicates orthogonal directions?', ['1', '0', '−1'], 1, 'u · v = 0 for nonzero orthogonal vectors.']]
        },
        {
            title: 'Angles and distances', intro: 'Use vectors, orthogonal projections and right triangles to measure space.', sections: [
                [
                    "Distances: reduce space to right triangles",
                    ("<p>The distance between two points is the length of the straight segment joining them. In a cuboid, do not add the three edge lengths to find a " +
                        "diagonal: those edges describe a longer broken path.</p>" +
                        "<p>If AB = a, BC = b and CG = h, triangle ABC is right at B. CG is normal to the base, so triangle ACG is right at C. Pythagoras applies " +
                        "twice:</p><div class=\"equation\">AC² = a² + b²<br>AG² = AC² + h² = a² + b² + h²</div><figure class=\"stereo-theory-figure\">" +
                        "<svg viewBox=\"0 0 320 230\" role=\"img\" aria-label=\"The spatial diagonal AG and its projection AC form right triangle ACG.\">" +
                        "<polygon points=\"53,189 211,189 211,85 53,85\" class=\"theory-face\"/><polygon points=\"211,189 264,134 264,30 211,85\" class=\"theory-face\"/>" +
                        "<polygon points=\"53,85 211,85 264,30 106,30\" class=\"theory-face\"/><polygon points=\"53,189 264,134 264,30\" class=\"theory-highlight\"/>" +
                        "<polyline points=\"53,189 211,189\" class=\"theory-edge\"/><polyline points=\"211,189 264,134\" class=\"theory-edge\"/>" +
                        "<polyline points=\"264,134 264,30\" class=\"theory-edge\"/><polyline points=\"264,30 211,85\" class=\"theory-edge\"/>" +
                        "<polyline points=\"211,85 53,85\" class=\"theory-edge\"/><polyline points=\"53,85 53,189\" class=\"theory-edge\"/>" +
                        "<polyline points=\"211,189 211,85\" class=\"theory-edge\"/><polyline points=\"264,30 106,30\" class=\"theory-edge\"/>" +
                        "<polyline points=\"106,30 53,85\" class=\"theory-edge\"/><polyline points=\"53,189 106,134\" class=\"theory-hidden\"/>" +
                        "<polyline points=\"106,134 264,134\" class=\"theory-hidden\"/><polyline points=\"106,134 106,30\" class=\"theory-hidden\"/>" +
                        "<polyline points=\"53,189 264,134\" class=\"theory-second\"/><polyline points=\"53,189 264,30\" class=\"theory-accent\"/>" +
                        "<polyline points=\"264,134 264,30\" class=\"theory-second\"/><circle cx=\"53\" cy=\"189\" r=\"2.8\" class=\"theory-point\"/><text x=\"38\" y=\"203\">A</text>" +
                        "<circle cx=\"211\" cy=\"189\" r=\"2.8\" class=\"theory-point\"/><text x=\"214\" y=\"204\">B</text><circle cx=\"264\" cy=\"134\" r=\"2.8\" class=\"theory-point\"/>" +
                        "<text x=\"273\" y=\"141\">C</text><circle cx=\"106\" cy=\"134\" r=\"2.8\" class=\"theory-point\"/><text x=\"89\" y=\"128\">D</text>" +
                        "<circle cx=\"53\" cy=\"85\" r=\"2.8\" class=\"theory-point\"/><text x=\"38\" y=\"80\">E</text><circle cx=\"211\" cy=\"85\" r=\"2.8\" class=\"theory-point\"/>" +
                        "<text x=\"214\" y=\"80\">F</text><circle cx=\"264\" cy=\"30\" r=\"2.8\" class=\"theory-point\"/><text x=\"272\" y=\"33\">G</text>" +
                        "<circle cx=\"106\" cy=\"30\" r=\"2.8\" class=\"theory-point\"/><text x=\"91\" y=\"25\">H</text></svg>" +
                        "<figcaption>The spatial diagonal AG and its projection AC form right triangle ACG.</figcaption></figure>" +
                        "<p>Hence AG = √(a²+b²+h²). A cube of edge a has face diagonal a√2 and space diagonal a√3. These two diagonals are different.</p>" +
                        "<p>In coordinates, AB = √((x₂−x₁)²+(y₂−y₁)²+(z₂−z₁)²). The formula is the same double application of Pythagoras.</p>")
                ],
                [
                    "Angles between lines",
                    ("<p>For two intersecting lines, identify their common point and choose the smaller of the angles formed by their directions. If the lines are " +
                        "skew, replace one by a parallel line through a point on the other. The angle between unoriented lines is always between 0° and 90°, even though a " +
                        "triangle may contain an obtuse interior angle.</p><div class=\"worked\"><h3>Example: angle between AC and AB</h3>" +
                        "<p>Let AB = 4 and BC = 3. In right triangle ABC, ∠BAC has opposite side BC and adjacent side AB.</p>" +
                        "<div class=\"equation\">tan ∠BAC = 3/4<br>∠BAC = arctan(3/4) ≈ 36.87°</div><p>Since EG ∥ AC, the smaller angle between EG and AB is also 36.87°.</p>" +
                        "</div><p>For nonzero direction vectors u and v, the smaller angle θ satisfies cos θ = |u · v|/(|u||v|), where |u| = √(u · u). The absolute value " +
                        "removes dependence on which direction along each line was chosen.</p><details class=\"stereo-self-check\">" +
                        "<summary>Which trigonometric ratio should I use?</summary>" +
                        "<p>Use sin for opposite/hypotenuse, cos for adjacent/hypotenuse, tan for opposite/adjacent. Use the inverse function to find an angle, and check " +
                        "that the calculator is in degree mode when the problem requests degrees.</p></details>")
                ],
                [
                    "Orthogonal projection and line–plane angles",
                    ("<p>The orthogonal projection of P onto plane α is the point H in α for which PH is perpendicular to α. H is called the foot of the perpendicular. " +
                        "The projection of an oblique segment AP, where A belongs to α, is AH.</p>" +
                        "<p>The angle between a line and a plane is the smaller angle between that line and its orthogonal projection onto the plane. A line parallel to " +
                        "the plane (including one lying in it) makes 0°; a perpendicular line makes 90° even though its projection degenerates to a point.</p>" +
                        "<div class=\"worked\"><h3>Why the perpendicular gives the shortest distance</h3>" +
                        "<p>For any other point Q in α, PH ⟂ HQ. Therefore PQ² = PH² + HQ² ≥ PH², with equality only at Q = H. Thus the distance from P to α is PH, not " +
                        "the slanted distance PQ.</p></div><p><strong>Theorem of three perpendiculars:</strong> a line in α through H perpendicular to the projection AH " +
                        "is perpendicular in direction to the oblique segment AP, and conversely. Equivalently, using a line through A perpendicular to AH, that line is " +
                        "perpendicular to AP at A. This follows because AP is the sum of the horizontal projection and a normal component.</p>" +
                        "<p>For plane n · X = d, the distance from P is |n · P − d|/|n|. The foot is H = P − ((n · P − d)/(n · n))n. For line direction u, sin φ = |u · " +
                        "n|/(|u||n|). Use sine here because the normal makes the complementary angle to the plane.</p>")
                ],
                [
                    "Distances to lines and angles between planes",
                    ("<p>The distance from a point to a line is the length of the perpendicular segment from the point to that line. It is not necessarily the distance " +
                        "to the nearest endpoint of a drawn edge, since the mathematical line is infinite.</p>" +
                        "<p>Parallel planes have a constant separation measured along a normal. Two skew lines have a common perpendicular segment; its length is their " +
                        "shortest distance. Intersecting lines have distance zero.</p><h3>Dihedral angles</h3>" +
                        "<p>Two intersecting planes form dihedral angles along their common line. Draw a line in each plane perpendicular to this common line at the same " +
                        "point. The angle between these lines measures the corresponding dihedral angle. The smaller angle between the planes is at most 90°.</p>" +
                        "<div class=\"worked\"><h3>Example: angle between the base and diagonal plane</h3>" +
                        "<p>ACGE contains the normal CG to ABCD. Hence the planes are perpendicular. No trigonometry is necessary: the perpendicular-plane criterion " +
                        "already gives 90°.</p></div><h3>Optional coordinate formulas</h3>" +
                        "<p>For point P and line A + tu, distance = |(P−A) × u|/|u|. The cross product × gives a vector perpendicular to both inputs. For skew lines with " +
                        "directions u and v through A and B, distance = |(B−A) · (u × v)|/|u × v|. This latter formula requires non-parallel directions. The smaller " +
                        "plane-plane angle is the smaller angle between their normal directions.</p>")
                ],
                [
                    "Worked problem: space diagonal and angle with the base",
                    ("<p><strong>Given:</strong> AB = 3 cm, BC = 4 cm and CG = 12 cm in cuboid ABCDEFGH. <strong>Find:</strong> AG and the angle between AG and plane " +
                        "ABCD.</p><div class=\"worked\"><h3>Step 1. Find the projection</h3>" +
                        "<p>G projects vertically onto C because CG is perpendicular to the base. A already belongs to the base. Therefore the projection of AG is AC, and " +
                        "the angle sought is ∠CAG.</p><h3>Step 2. Extract triangle ABC</h3><p>AB ⟂ BC, so AC² = AB² + BC² = 9 + 16 = 25. Therefore AC = 5 cm.</p>" +
                        "<h3>Step 3. Extract triangle ACG</h3><p>CG ⟂ AC, so AG² = 5² + 12² = 169 and AG = 13 cm.</p><figure class=\"stereo-theory-figure\">" +
                        "<svg viewBox=\"0 0 320 190\" role=\"img\" aria-label=\"Two right triangles: first ABC, then ACG. The shared calculated length is AC = 5.\">" +
                        "<path d=\"M20 120H86V32Z M155 158H215V14Z\" class=\"theory-highlight\"/><path d=\"M75 120V109H86 M204 158V147H215\" class=\"theory-edge\"/><g>" +
                        "<text x=\"8\" y=\"136\">A</text><text x=\"90\" y=\"136\">B</text><text x=\"90\" y=\"29\">C</text><text x=\"48\" y=\"137\">3</text><text x=\"92\" y=\"78\">4</text>" +
                        "<text x=\"38\" y=\"65\">5</text><text x=\"143\" y=\"174\">A</text><text x=\"220\" y=\"174\">C</text><text x=\"220\" y=\"15\">G</text>" +
                        "<text x=\"182\" y=\"174\">5</text><text x=\"222\" y=\"86\">12</text><text x=\"165\" y=\"78\">13</text></g></svg>" +
                        "<figcaption>Two right triangles: first ABC, then ACG. The shared calculated length is AC = 5.</figcaption></figure>" +
                        "<h3>Step 4. Calculate the angle</h3><div class=\"equation\">tan ∠CAG = CG/AC = 12/5<br>∠CAG ≈ 67.38°</div><p>" +
                        "<strong>Answer:</strong> AG = 13 cm; the line–plane angle is about 67.38°. The distance from G to the base is CG = 12 cm.</p></div>" +
                        "<p>The two extracted triangles are the essential solution, not a screenshot of the solid. In Practice, build AC and AG, extract both triangles, " +
                        "record AC and then use it in the second calculation. Check units, and round only the final angle.</p>")
                ]
            ], questions: [['Space diagonal of a 2 × 3 × 6 cuboid?', ['7', '11', '√13'], 0, '√(4+9+36) = 7.'], ['Distance from (2,−3,4) to y = 0?', ['2', '4', '3'], 2, 'The perpendicular changes only the y coordinate.'], ['A line is perpendicular to a plane. Their angle is…', ['0°', '90°', '45°'], 1, 'The line is parallel to the plane normal.'], ['The shortest segment from a point to a plane is…', ['Perpendicular to the plane', 'Parallel to the plane', 'Any segment to the plane'], 0, 'Any oblique segment forms the hypotenuse of a right triangle.']]
        },
        {
            title: 'Cross-sections', intro: 'Construct and analyse the polygon formed when a plane cuts a solid.', sections: [
                [
                    "What is a cross-section?",
                    ("<p>A cross-section is the set of points common to a solid and a cutting plane. Imagine slicing a block of cheese with a flat knife: the exposed " +
                        "flat surface is the section. In a convex polyhedron such as a cube, a proper section through the interior is a convex polygon.</p>" +
                        "<p>The cutting plane is infinite, but the section stops at the boundary of the solid. A tangent plane may meet only a vertex or an edge. A plane " +
                        "containing a face produces that face as its intersection with the solid.</p><figure class=\"stereo-theory-figure\">" +
                        "<svg viewBox=\"0 0 320 230\" role=\"img\" aria-label=\"The cutting plane through A, C and G forms rectangle ACGE.\">" +
                        "<polygon points=\"53,189 211,189 211,85 53,85\" class=\"theory-face\"/><polygon points=\"211,189 264,134 264,30 211,85\" class=\"theory-face\"/>" +
                        "<polygon points=\"53,85 211,85 264,30 106,30\" class=\"theory-face\"/><polygon points=\"53,189 264,134 264,30 53,85\" class=\"theory-highlight\"/>" +
                        "<polyline points=\"53,189 211,189\" class=\"theory-edge\"/><polyline points=\"211,189 264,134\" class=\"theory-edge\"/>" +
                        "<polyline points=\"264,134 264,30\" class=\"theory-edge\"/><polyline points=\"264,30 211,85\" class=\"theory-edge\"/>" +
                        "<polyline points=\"211,85 53,85\" class=\"theory-edge\"/><polyline points=\"53,85 53,189\" class=\"theory-edge\"/>" +
                        "<polyline points=\"211,189 211,85\" class=\"theory-edge\"/><polyline points=\"264,30 106,30\" class=\"theory-edge\"/>" +
                        "<polyline points=\"106,30 53,85\" class=\"theory-edge\"/><polyline points=\"53,189 106,134\" class=\"theory-hidden\"/>" +
                        "<polyline points=\"106,134 264,134\" class=\"theory-hidden\"/><polyline points=\"106,134 106,30\" class=\"theory-hidden\"/>" +
                        "<polyline points=\"53,189 264,134\" class=\"theory-accent\"/><polyline points=\"264,30 53,85\" class=\"theory-accent\"/>" +
                        "<circle cx=\"53\" cy=\"189\" r=\"2.8\" class=\"theory-point\"/><text x=\"38\" y=\"203\">A</text><circle cx=\"211\" cy=\"189\" r=\"2.8\" class=\"theory-point\"/>" +
                        "<text x=\"214\" y=\"204\">B</text><circle cx=\"264\" cy=\"134\" r=\"2.8\" class=\"theory-point\"/><text x=\"273\" y=\"141\">C</text>" +
                        "<circle cx=\"106\" cy=\"134\" r=\"2.8\" class=\"theory-point\"/><text x=\"89\" y=\"128\">D</text><circle cx=\"53\" cy=\"85\" r=\"2.8\" class=\"theory-point\"/>" +
                        "<text x=\"38\" y=\"80\">E</text><circle cx=\"211\" cy=\"85\" r=\"2.8\" class=\"theory-point\"/><text x=\"214\" y=\"80\">F</text>" +
                        "<circle cx=\"264\" cy=\"30\" r=\"2.8\" class=\"theory-point\"/><text x=\"272\" y=\"33\">G</text><circle cx=\"106\" cy=\"30\" r=\"2.8\" class=\"theory-point\"/>" +
                        "<text x=\"91\" y=\"25\">H</text></svg><figcaption>The cutting plane through A, C and G forms rectangle ACGE.</figcaption></figure>" +
                        "<p>Every vertex of a polygonal section is on the solid boundary, usually on an edge. Every side lies in a face of the solid. All section vertices " +
                        "must be coplanar. Connecting points merely because they appear close in the 3D view may give an invalid section.</p>")
                ],
                [
                    "How to construct a section by hand",
                    ("<p>Three non-collinear points determine a unique cutting plane. You must identify where that plane intersects the solid; the three given points " +
                        "need not be all the vertices of the final section.</p><ol><li>Mark the given points on their correct edges or faces.</li>" +
                        "<li>Join two known section points lying in the same face. The joining line is the intersection of that face plane with the cutting plane.</li>" +
                        "<li>Extend this line to the boundaries of the face if necessary. When an intersection falls on a shared edge, the point also belongs to the " +
                        "adjacent face.</li><li>For parallel faces, use the theorem that their section lines are parallel. Continue across adjacent faces until the " +
                        "polygon closes.</li><li>Check coplanarity, the boundary order and that all sides lie on faces. Extract the resulting figure in 2D before " +
                        "measuring.</li></ol><div class=\"worked\"><h3>Example: diagonal section ACGE</h3>" +
                        "<p>Given A, C and G in a cuboid, connect A to C on the base, and C to G on the side face. On the parallel top face the intersection through G " +
                        "must be parallel to AC, which leads to E. Connect E to A on their side face. The section is rectangle ACGE.</p></div>" +
                        "<p>Do not draw a line through the interior and assume it is an edge of the section. Such a line may be a useful diagonal, but the section " +
                        "boundary must lie on the surface of the solid.</p>")
                ],
                [
                    "Typical sections of a cube",
                    ("<p>A proper polygonal section through a cube can have three, four, five or six sides. A convex section intersects each face in at most one " +
                        "boundary segment, so six faces give an upper bound of six sides. A plane parallel to a face gives a square; not every four-sided section is a " +
                        "square or even a rectangle.</p><div class=\"math-table-scroll\"><table class=\"lesson-table\"><thead><tr><th>Cut</th><th>Section</th>" +
                        "<th>Dimensions for edge a</th></tr></thead><tbody><tr><td>Parallel to a face</td><td>Square</td><td>Side a</td></tr><tr>" +
                        "<td>Through opposite vertical edges</td><td>Rectangle</td><td>a and a√2</td></tr><tr><td>Through three midpoints at one vertex</td>" +
                        "<td>Equilateral triangle</td><td>Side a/√2</td></tr><tr><td>Through centre, normal to a body diagonal</td><td>Regular hexagon</td>" +
                        "<td>Side a/√2</td></tr></tbody></table></div><div class=\"worked\"><h3>Example: diagonal rectangular cut</h3>" +
                        "<p>In a cube of side 4, AC = 4√2 and CG = 4. The section ACGE is a rectangle, so area = 4√2 × 4 = 16√2 and perimeter = 2(4√2 + 4) = 8√2 + 8.</p>" +
                        "</div><p>Five-sided sections occur for suitable oblique cuts. Their shape and side lengths depend on the cutting plane; there is no universal " +
                        "regular pentagon formula for them.</p>")
                ],
                [
                    "Coordinate method for finding section vertices",
                    ("<p>If a diagram alone is difficult, write the cutting plane as n · X = d. Every edge is a segment between endpoints A and B, so any point on it " +
                        "has the form X = A + t(B−A), where 0 ≤ t ≤ 1.</p><p>Evaluate sA = n · A − d and sB = n · B − d. If the signs differ, the plane crosses the " +
                        "segment. Solving for t gives:</p><div class=\"equation\">t = sA/(sA−sB)<br>X = A + t(B−A)</div>" +
                        "<p>If one signed value is zero, include that endpoint. If both are zero, the entire edge lies in the plane and its endpoints belong to the " +
                        "section. If both have the same nonzero sign, the segment does not cross.</p><div class=\"worked\"><h3>Example: cut an edge</h3>" +
                        "<p>For A(0,0,0), B(4,0,0) and plane x = 1, sA = −1, sB = 3. Thus t = −1/(−4) = 1/4. The section point is (1,0,0), a quarter of the way from A to " +
                        "B.</p></div><p>Repeat for all edges, remove duplicate points, then order the section vertices around their centre within the cutting plane. " +
                        "Axion's 2D extraction uses perpendicular unit directions in that plane, which preserves lengths and angles.</p>")
                ],
                [
                    "Worked problems: triangle and hexagon areas",
                    ("<p><strong>Problem 1.</strong> A cube has edge 2 cm. Cut through the midpoints M, N and P of AB, BC and BF, the three edges meeting at B.</p>" +
                        "<div class=\"worked\"><h3>Construct and analyse the triangle</h3>" +
                        "<p>BM = BN = BP = 1. The three edges meet pairwise at right angles, so MN = NP = PM = √(1²+1²) = √2. The section is an equilateral triangle.</p>" +
                        "<figure class=\"stereo-theory-figure\"><svg viewBox=\"0 0 320 190\" role=\"img\" aria-label=\"The extracted equilateral section MNP, each side √2 cm.\">" +
                        "<polygon points=\"75,150 245,150 160,2.78\" class=\"theory-highlight\"/><g><text x=\"59\" y=\"165\">M</text><text x=\"249\" y=\"165\">N</text>" +
                        "<text x=\"160\" y=\"16\">P</text><text x=\"147\" y=\"169\">√2</text><text x=\"95\" y=\"70\">√2</text><text x=\"218\" y=\"70\">√2</text></g></svg>" +
                        "<figcaption>The extracted equilateral section MNP, each side √2 cm.</figcaption></figure><div class=\"equation\">S = (√3/4)(√2)² = √3/2 cm²</div>" +
                        "<p>Its perimeter is 3√2 cm. The calculation uses the extracted triangle, not the apparent shape in the perspective drawing.</p></div><p>" +
                        "<strong>Problem 2.</strong> Consider a cube with coordinates −1 ≤ x,y,z ≤ 1. The central plane x+y+z = 0 meets six edges at the six permutations " +
                        "of (1,0,−1). These vertices form a regular hexagon; consecutive vertices differ by 1 in two coordinates, so each side is √2.</p>" +
                        "<div class=\"worked\"><h3>Divide the hexagon into six equilateral triangles</h3>" +
                        "<div class=\"equation\">S = 6 × (√3/4)(√2)² = 3√3 ≈ 5.196 square units</div>" +
                        "<p>Each triangle has side √2. The same method scales to other cubes; multiplying all lengths by k multiplies the area by k².</p></div>" +
                        "<p>For irregular sections, split the extracted polygon into triangles and use their heights or Heron's formula when all three sides are known. Do " +
                        "not apply a regular-polygon formula unless regularity is proved.</p>")
                ]
            ], questions: [['Maximum number of sides of a cube section?', ['4', '6', '8'], 1, 'There are six faces, each contributing at most one side.'], ['A plane parallel to a cube face cuts the interior. Shape?', ['Square', 'Triangle', 'Circle'], 0, 'The section is congruent to the parallel face.'], ['Three collinear points define…', ['A unique cutting plane', 'No unique plane', 'A hexagon'], 1, 'A third non-collinear point is needed.'], ['Area of a regular hexagon of side √2?', ['6', '2√3', '3√3'], 2, 'Six equilateral triangles each have area √3/2.']]
        },
        {
            title: 'Surface area and volume', intro: 'Connect dimensions, nets, area and volume for common solids.', sections: [
                [
                    "Prisms, cuboids and the meaning of volume",
                    ("<p>Volume measures the space occupied by a solid, in cubic units. Surface area measures the exposed boundary, in square units. These are " +
                        "different quantities. A net unfolds flat faces so their areas can be added without counting any face twice.</p>" +
                        "<p>A prism has two congruent parallel bases and a constant cross-sectional area B between them. Its volume is V = Bh, where h is the " +
                        "perpendicular distance between the bases. For a right prism, lateral faces are rectangles and their combined area equals Ph, where P is the base " +
                        "perimeter.</p><div class=\"equation\">V = Bh<br>S = 2B + Ph (right prism)</div>" +
                        "<p>For a cuboid of dimensions a, b, h, V = abh and S = 2(ab+ah+bh). A cube of side a gives V = a³ and S = 6a².</p><div class=\"worked\">" +
                        "<h3>Worked example: a closed box</h3><p>A 4 × 3 × 2 cm box has base area 12 cm² and height 2 cm. V = 24 cm³. The top and bottom contribute 24 " +
                        "cm², the two 4 × 2 faces contribute 16 cm², and the two 3 × 2 faces contribute 12 cm². Total surface area = 52 cm². An open-top box would have " +
                        "area 40 cm².</p></div><p>The lateral-area formula Ph assumes a right prism; the volume formula uses perpendicular height even for an oblique " +
                        "prism.</p>")
                ],
                [
                    "Pyramids: perpendicular and slant heights",
                    ("<p>A pyramid has one polygonal base and triangular lateral faces meeting at the apex. Its volume is one third of the volume of a prism with the " +
                        "same base area and perpendicular height.</p><div class=\"equation\">V = Bh/3</div>" +
                        "<p>For a regular right pyramid, the apex T lies above the base centre O. Let M be the midpoint of a base edge. TM is the slant height (the " +
                        "altitude of a lateral triangular face), while OT is the perpendicular height. The lateral surface area is Pl/2, where l = TM.</p>" +
                        "<figure class=\"stereo-theory-figure\"><svg viewBox=\"0 0 320 190\" role=\"img\" aria-label=\"In a regular square pyramid, triangle TOM is right at O; " +
                        "TM is the slant height.\"><polygon points=\"30,143 180,143 270,92 120,92\" class=\"theory-face\"/>" +
                        "<path d=\"M30 143L150 18L180 143L270 92L150 18L120 92\" class=\"theory-edge\"/><path d=\"M120 92L30 143\" class=\"theory-hidden\"/>" +
                        "<polygon points=\"150,18 150,117.5 105,143\" class=\"theory-highlight\"/><path d=\"M150 18V117.5L105 143\" class=\"theory-second\"/>" +
                        "<path d=\"M150 18L105 143\" class=\"theory-accent\"/><text x=\"153\" y=\"14\">T</text><text x=\"154\" y=\"132\">O</text><text x=\"96\" y=\"159\">M</text>" +
                        "<text x=\"153\" y=\"72\">h</text><text x=\"119\" y=\"73\">l</text><text x=\"129\" y=\"142\">a/2</text></svg>" +
                        "<figcaption>In a regular square pyramid, triangle TOM is right at O; TM is the slant height.</figcaption></figure><div class=\"worked\">" +
                        "<h3>Worked example: square pyramid</h3><p>Base edge a = 6 cm and vertical height h = 4 cm. OM = a/2 = 3 cm. Because OT is perpendicular to the " +
                        "base, triangle TOM is right at O. TM = √(3²+4²) = 5 cm.</p>" +
                        "<p>Each side face has area 6 × 5/2 = 15 cm². Therefore S = 36 + 4 × 15 = 96 cm². Volume = 36 × 4/3 = 48 cm³.</p></div>" +
                        "<p>The slant height is not a lateral edge joining the apex to a base vertex. For a non-regular pyramid, compute the individual lateral triangle " +
                        "areas rather than assuming a common slant height.</p>")
                ],
                [
                    "Cylinders and cones",
                    ("<p>A right circular cylinder has two circular bases of radius r. Unrolling the curved surface creates a rectangle of height h and width equal to " +
                        "the circumference 2πr. Its base area is πr².</p><div class=\"equation\">V = πr²h<br>S = 2πr² + 2πrh (closed cylinder)</div>" +
                        "<p>A right circular cone has one circular base and an apex above its centre. A central cross-section contains a right triangle with legs r and h; " +
                        "its hypotenuse is the slant height l = √(r²+h²). The curved surface unfolds into a sector of radius l and arc length 2πr. Its area is πrl.</p>" +
                        "<div class=\"equation\">V = πr²h/3<br>S = πr² + πrl (closed cone)</div><div class=\"worked\"><h3>Example: compare a cylinder and a cone</h3>" +
                        "<p>Both have r = 3 and h = 4. The cylinder has volume 36π and area 18π + 24π = 42π. The cone has l = 5, volume 12π and area 9π + 15π = 24π. Their " +
                        "volume ratio is 3:1, but their area ratio is not.</p></div>" +
                        "<p>Use radius, not diameter, in formulas. If diameter is 6, radius is 3. If a container is open, omit the missing circular face from its surface " +
                        "area.</p>")
                ],
                [
                    "Spheres, similarity and scaling",
                    ("<p>A sphere consists of all points at a fixed distance r from its centre; the enclosed solid is a ball. Every plane through the centre cuts a " +
                        "circle of radius r. A plane at distance d from the centre (0 ≤ d ≤ r) cuts a circle of radius √(r²−d²), by Pythagoras. Unlike a polyhedron, the " +
                        "sphere cannot be flattened into an exact undistorted net.</p><div class=\"equation\">S = 4πr²<br>V = 4πr³/3</div>" +
                        "<p>If all lengths of a solid are multiplied by k > 0, corresponding angles stay unchanged, areas multiply by k², and volumes multiply by k³. This " +
                        "applies to similar solids, not to arbitrary changes of one dimension.</p><div class=\"worked\"><h3>Worked example: scale a sphere</h3>" +
                        "<p>A sphere with r = 3 has S = 36π and V = 36π. Doubling the radius to 6 gives S = 144π (four times larger) and V = 288π (eight times larger). " +
                        "The two original numerical values happen to match but have different units.</p></div><details class=\"stereo-self-check\">" +
                        "<summary>What if only one dimension doubles?</summary><p>Doubling only the height of a cuboid doubles its volume, not multiplies it by eight. The " +
                        "k³ rule requires every linear dimension to scale by the same factor.</p></details>")
                ],
                [
                    "Multi-step problems: missing lengths and composite solids",
                    ("<p>Start by deciding which quantity is required. Identify the relevant solid, label the known dimensions, and determine whether the height is " +
                        "perpendicular or slanted. If a length is unknown, extract a right triangle and find it before substituting into a volume or area formula.</p>" +
                        "<div class=\"worked\"><h3>Problem 1: find a missing height</h3>" +
                        "<p>A cuboid has AB = 3, BC = 4 and space diagonal AG = 13 cm. Find the height and volume.</p><ol><li>Base diagonal AC = √(3²+4²) = 5.</li>" +
                        "<li>In triangle ACG, CG² = AG² − AC² = 169 − 25 = 144, so CG = 12 cm.</li><li>Volume = 3 × 4 × 12 = 144 cm³.</li></ol></div><div class=\"worked\">" +
                        "<h3>Problem 2: combine solids</h3><p>A square prism of base edge 6 cm and height 4 cm has a regular square pyramid of height 4 cm attached to its " +
                        "top. The pyramid has slant height 5 cm.</p><p>Combined volume = 36 × 4 + 36 × 4/3 = 192 cm³. Exposed area = bottom 36 + prism sides 4 × 6 × 4 + " +
                        "pyramid sides 4 × 6 × 5/2 = 192 cm². The shared square is internal and must not be counted.</p></div>" +
                        "<p>For a hole or removed solid, subtract the removed volume. Surface area requires separate reasoning: newly exposed inner faces may need to be " +
                        "added. Always verify units and whether the problem asks for total or lateral surface area.</p>")
                ]
            ], questions: [['Volume of a pyramid with B = 18 and h = 5?', ['90', '30', '45'], 1, 'V = Bh/3 = 30.'], ['Surface area of a cube with edge 3?', ['27', '36', '54'], 2, '6 × 3² = 54.'], ['All lengths double. Volume changes by…', ['8 times', '4 times', '2 times'], 0, 'Volume scales with the cube of length.'], ['Slant height of a right cone with r = 3 and h = 4?', ['7', '5', '12'], 1, '√(3²+4²) = 5.']]
        }
    ];
    if (typeof module === 'object' && module.exports)
        module.exports = lessons;
    else
        root.StereoLessons = lessons;
})(typeof window === 'undefined' ? globalThis : window);
