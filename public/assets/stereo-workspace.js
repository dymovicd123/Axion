(function () {
    const W = StereoWorkspaceModel, P = ProjectMath, S = StereoModel;
    const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fmt = n => Number.isInteger(n) ? String(n) : String(Number(n.toFixed(3)));
    const svg = (points, ids, selected = -1, info = () => null, marks = true, overlay = null) => {
        const xs = points.map(p => p[0]),
            ys = points.map(p => p[1]),
            minX = Math.min(...xs),
            minY = Math.min(...ys),
            w = Math.max(...xs) - minX,
            h = Math.max(...ys) - minY,
            k = Math.min(210 / (w || 1), 138 / (h || 1)),
            p = points.map(([x, y]) => [160 + (x - minX - w / 2) * k, 112 - (y - minY - h / 2) * k]);
        const center = p.reduce((a, q) => [a[0] + q[0] / p.length, a[1] + q[1] / p.length], [0, 0]);
        const right = W.rightAngles(points), screen = ([x, y]) => [160 + (x - minX - w / 2) * k, 112 - (y - minY - h / 2) * k];
        const extra = overlay ? Object.fromEntries(Object.entries(overlay.points).map(([id, q]) => [id, screen(q)])) : {};
        const overlaySvg = () => {
            if (!overlay)
                return '';
            const chosen = overlay.selected || [];
            return (overlay.segments || []).filter(pair => pair.every(id => extra[id])).map(pair => {
                const [a, b] = pair.map(id => extra[id]), v = info(pair);
                return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#d97828" stroke-width="2" stroke-dasharray="5 2"/><text class="diagram-label" x="${(a[0] + b[0]) / 2 + 7}" y="${(a[1] + b[1]) / 2 - 7}" fill="var(--ink)" font-size="11">${v ? fmt(v.value) : '?'}</text>`;
            }).join('') + (overlay.angles || []).filter(m => m.ids.every(id => extra[id])).map(m => {
                const [a, b, c] = m.ids.map(id => extra[id]),
                    u = [a[0] - b[0], a[1] - b[1]],
                    v = [c[0] - b[0], c[1] - b[1]],
                    l = Math.hypot(...u),
                    r = Math.hypot(...v);
                if (!l || !r)
                    return '';
                const t = Math.min(21, l / 3, r / 3),
                    x = [b[0] + u[0] / l * t, b[1] + u[1] / l * t],
                    y = [b[0] + v[0] / r * t, b[1] + v[1] / r * t],
                    cross = u[0] * v[1] - u[1] * v[0],
                    label = [b[0] + (u[0] / l + v[0] / r) * (t + 10), b[1] + (u[1] / l + v[1] / r) * (t + 10)];
                return `<path d="M${x.join(' ')} A${t} ${t} 0 0 ${cross >= 0 ? 1 : 0} ${y.join(' ')}" fill="none" stroke="#d97828" stroke-width="2"/><text class="diagram-label" x="${label[0]}" y="${label[1]}" font-size="11" fill="var(--ink)">${m.value == null ? '?' : fmt(m.value) + '°'}</text>`;
            }).join('') + (overlay.equal || []).flatMap((group, i) => group.filter(pair => pair.every(id => extra[id])).map(pair => {
                const [a, b] = pair.map(id => extra[id]), d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(...d);
                if (!l)
                    return '';
                return Array.from(
                    { length: i % 3 + 1 },
                    (_, j) => {
                        const t = (j - i % 3 / 2) * 5, m = [(a[0] + b[0]) / 2 + t * d[0] / l, (a[1] + b[1]) / 2 + t * d[1] / l];
                        return `<line x1="${m[0] - 5 * d[1] / l}" y1="${m[1] + 5 * d[0] / l}" x2="${m[0] + 5 * d[1] / l}" y2="${m[1] - 5 * d[0] / l}" stroke="#d97828" stroke-width="2"/>`;
                    }).join('');
            })).join('') + Object.entries(extra).map(([id, q]) => `<circle class="flat-vertex" data-vertex="${escape(id)}" cx="${q[0]}" cy="${q[1]}" r="${chosen.includes(id) ? 6 : 5}" fill="${chosen.includes(id) ? '#d97828' : 'var(--ink)'}" stroke="var(--paper)" stroke-width="1.5"/>${ids.includes(id) ? '' : `<text class="diagram-label" x="${q[0] + 8}" y="${q[1] - 8}" fill="var(--ink)" font-size="11">${escape(id)}</text>`}`).join('');
        };
        return `<svg viewBox="0 0 320 224" role="img" aria-label="True-scale planar figure"><polygon points="${p.map(q => q.join(',')).join(' ')}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5"/>${p.map((q, i) => {
            const r = p[(i + 1) % p.length],
                prev = p[(i + p.length - 1) % p.length],
                m = [(q[0] + r[0]) / 2, (q[1] + r[1]) / 2],
                d = [r[0] - q[0], r[1] - q[1]],
                len = Math.hypot(...d),
                n = [-d[1] / len, d[0] / len],
                sign = (m[0] - center[0]) * n[0] + (m[1] - center[1]) * n[1] > 0 ? 1 : -1,
                pos = [m[0] + n[0] * sign * 15, m[1] + n[1] * sign * 15],
                v = info([ids[i], ids[(i + 1) % ids.length]]),
                unit = (a, b) => {
                    const l = Math.hypot(a[0] - b[0], a[1] - b[1]);
                    return [(a[0] - b[0]) / l, (a[1] - b[1]) / l];
                },
                u = unit(prev, q),
                z = unit(r, q),
                size = Math.min(10, len / 4, Math.hypot(prev[0] - q[0], prev[1] - q[1]) / 4),
                a = [q[0] + u[0] * size, q[1] + u[1] * size],
                b = [a[0] + z[0] * size, a[1] + z[1] * size],
                c = [q[0] + z[0] * size, q[1] + z[1] * size];
            return `<line x1="${q[0]}" y1="${q[1]}" x2="${r[0]}" y2="${r[1]}" stroke="${selected === i ? '#d97828' : 'var(--accent)'}" stroke-width="${selected === i ? 4 : 2}"/><line class="flat-side" data-side="${i}" x1="${q[0]}" y1="${q[1]}" x2="${r[0]}" y2="${r[1]}" stroke="transparent" stroke-width="16"/>${marks && right[i] ? `<polyline points="${a.join(',')} ${b.join(',')} ${c.join(',')}" fill="none" stroke="var(--ink)" stroke-width="1.2"/>` : ''}<circle cx="${q[0]}" cy="${q[1]}" r="3" fill="var(--ink)"/><text class="diagram-label" x="${q[0] + (q[0] < center[0] ? -11 : 11)}" y="${q[1] + (q[1] < center[1] ? -9 : 16)}" text-anchor="middle" fill="var(--ink)" font-size="12">${escape(ids[i])}</text><text class="diagram-label flat-side" data-side="${i}" x="${pos[0]}" y="${pos[1] + 4}" text-anchor="middle" fill="${v?.source === 'recorded' ? 'var(--accent)' : 'var(--ink)'}" font-size="12">${v ? fmt(v.value) : '?'}</text>`;
        }).join('')}${overlaySvg()}</svg>`;
    };
    function study(index) {
        const items = [
            [
                'Why three points matter',
                'A, B and C determine the base plane. D lies on it; E does not. The diagonal AC is common to the base and the vertical plane ACGE.',
                ['A', 'B', 'C', 'D'],
                [[0, 0], [4, 0], [4, 3], [0, 3]]
            ],
            [
                'A perpendicular line and plane',
                'If a line is perpendicular to two intersecting lines in a plane at their common point, it is perpendicular to the plane. A plane containing a normal to another plane is perpendicular to it. In ACG, CG is normal to the base.',
                ['A', 'C', 'G'],
                [[0, 0], [5, 0], [5, 4]]
            ],
            [
                'Reduce the problem to two triangles',
                'First use ABC to find AC. Then use ACG. The angle between a line and a plane is the angle between the line and its orthogonal projection (unless the line is perpendicular, when it is 90°). The theorem of three perpendiculars: a line in the plane through the foot of an oblique segment is perpendicular to its projection if and only if it is perpendicular to the oblique segment.',
                ['A', 'C', 'G'],
                [[0, 0], [5, 0], [5, 12]]
            ],
            [
                'How to construct a section',
                'Mark the intersection points on the edges. Connect points lying on the same face. Extend lines on faces as needed to find additional intersection points; parallel faces have parallel section lines. The result is a closed polygon in one plane. For a side-2 cube cut through three adjacent edge midpoints, each section edge is √2.',
                ['M', 'N', 'P'],
                [[0, 0], [Math.sqrt(2), 0], [Math.sqrt(2) / 2, Math.sqrt(6) / 2]]
            ],
            [
                'Find the slant height first',
                'For a right square pyramid, the apex lies above the base centre O. The midpoint M of a base edge gives the altitude of a lateral face. In right triangle TOM, OM = a/2, OT = h, and TM = √(h²+(a/2)²). The total area is a²+2a·TM.',
                ['O', 'M', 'T'],
                [[0, 0], [3, 0], [0, 4]]
            ]
        ];
        const [title, desc, ids, pts] = items[index];
        return `<section class="lesson-section"><h2>${title}</h2><div class="stereo-study-example"><div>${svg(pts, ids, -1, pair => ({ value: Math.hypot(...pts[ids.indexOf(pair[0])].map((v, i) => v - pts[ids.indexOf(pair[1])][i])), source: 'given' }))}</div><p>${desc}</p></div></section>`;
    }
    function mount(root, tasks, mode, onDone) {
        const assessment = mode === 'final', progressKey = 'axion-stereo-work-v2';
        let saved = {};
        try {
            saved = JSON.parse((window.AxionStorage || localStorage).getItem(progressKey) || '{}') || {};
        }
        catch { }
        ;
        let current = 0,
            view,
            state,
            selection = [],
            tool = 'select',
            history = [],
            activeFlat = -1,
            flatSide = -1,
            activeTask,
            schematic = false,
            showLabels = true,
            flatSize = false,
            notebook,
            flatTool = 'inspect',
            flatSelected = [];
        const write = () => {
            try {
                (window.AxionStorage || localStorage).setItem(progressKey, JSON.stringify(saved));
            }
            catch { }
        };
        root.innerHTML = `<section class="stereo-task-shell"><div class="stereo-task-nav" id="task-nav"></div><div id="task-content"></div></section>`;
        const nav = root.querySelector('#task-nav'), content = root.querySelector('#task-content');
        function drawNav() {
            nav.innerHTML = tasks.map((t, i) => `<button type="button" class="secondary ${i === current ? 'active' : ''}" data-task="${i}">${mode === 'labs' ? 'Investigation' : `Problem ${i + 1}`}${saved[t.id]?.complete ? ' ✓' : ''}</button>`).join('') + `<span class="small">${tasks.filter(t => saved[t.id]?.complete).length}/${tasks.length} completed</span>`;
            nav.querySelectorAll('button').forEach(b => b.onclick = () => open(Number(b.dataset.task)));
        }
        function initial(t) {
            const p = W.points(...t.dims);
            if (t.shape === 'pyramid') {
                delete p.E;
                delete p.F;
                delete p.G;
                delete p.H;
                p.O = [0, -t.dims[2] / 2, 0];
                p.T = [0, t.dims[2] / 2, 0];
            }
            return {
                points: p,
                segments: [],
                polys: [],
                extracted: [],
                notes: '',
                steps: [],
                angles: [],
                equal: [],
                annotations: {},
                answers: t.answers.map(() => ''),
                complete: false
            };
        }
        function save() {
            saved[activeTask.id] = state;
            write();
            drawNav();
            onDone(tasks.every(t => saved[t.id]?.complete));
        }
        function snapshot() {
            history.push(JSON.stringify(state));
            if (history.length > 40)
                history.shift();
        }
        function invalidate() {
            state.complete = false;
            const result = content.querySelector('#task-result');
            if (result)
                result.textContent = '';
            const status = content.querySelector('#server-save');
            if (status)
                status.textContent = '';
            save();
        }
        function open(i) {
            if (view?.dispose)
                view.dispose();
            current = i;
            activeTask = tasks[i];
            const t = activeTask;
            state = saved[t.id] || initial(t);
            state.annotations = state.annotations || {};
            state.angles = state.angles || [];
            state.equal = state.equal || [];
            flatTool = 'inspect';
            flatSelected = [];
            schematic = Math.max(...t.dims) / Math.min(...t.dims) > 2;
            showLabels = true;
            flatSize = false;
            selection = [];
            tool = 'select';
            history = [];
            activeFlat = state.extracted.length - 1;
            flatSide = -1;
            drawNav();
            content.innerHTML = `<header class="stereo-task-heading"><h2>${escape(t.title)}</h2><p>${escape(t.prompt)}</p><div class="stereo-givens"><strong>Given · ${t.shape === 'pyramid' ? 'right square pyramid' : t.dims.every(v => v === t.dims[0]) ? 'cube' : 'cuboid'}</strong> ${givenSummary(t).map(([id, value]) => `<span>${id} = ${fmt(value)}${unit(t)}</span>`).join('')}</div></header><div class="stereo-work-grid"><section class="stereo-board"><div class="stereo-board-heading"><h3>1. Spatial construction</h3><span class="small">Drag to rotate · Scroll to zoom</span></div><div class="stereo-toolbar" aria-label="Construction tools">${[['select', 'Inspect'], ['segment', 'Draw segment'], ['midpoint', 'Mark midpoint'], ['polygon', 'Draw polygon'], ['extract', 'Extract to 2D']].map(([id, label]) => `<button class="secondary" data-tool="${id}">${label}</button>`).join('')}<button class="secondary" id="undo">Undo</button><button class="secondary" id="reset-work">Reset</button></div><p id="tool-help" class="small" aria-live="polite"></p><div class="stereo-scene" id="scene-host"><canvas aria-label="Interactive solid; use vertex buttons for keyboard selection"></canvas></div><div class="stereo-toolbar stereo-camera"><button class="secondary" data-camera="orbit">Orbit</button><button class="secondary" data-camera="front">Front</button><button class="secondary" data-camera="top">Top</button><button class="secondary" id="zoom-plus">+</button><button class="secondary" id="zoom-minus">−</button><button class="secondary" id="scale-mode"></button><button class="secondary" id="labels-mode">Labels: on</button><span id="renderer-status" class="small">3D view</span></div><p class="small stereo-scale-note" id="scale-note"></p><div class="small stereo-point-label">Choose vertices</div><div class="stereo-pointbar" id="points"></div><div class="stereo-toolbar"><button class="primary" id="apply-tool">Construct</button><button class="secondary" id="clear-selection">Clear selection</button><span id="selection" class="small"></span></div><p id="construct-error" class="stereo-feedback" role="status"></p><div id="spatial-inspector"></div></section><aside class="stereo-flat"><div class="stereo-board-heading"><h3>2. Planar workspace</h3><button class="secondary" id="flat-size">Enlarge</button></div><p class="small">Choose Extract to 2D, select the boundary vertices, then extract. Click a side to inspect it or record its length.</p><div id="flat-tabs" class="stereo-toolbar"></div><div id="flat-figure"></div><div id="flat-detail" class="small"></div><div id="flat-inspector"></div><div id="flat-tools"></div><details class="stereo-log"><summary>Construction history</summary><ul id="construction-log"></ul></details></aside></div><section class="stereo-solution"><h3>3. Solution notebook</h3><p class="small">Build your solution in your own order. Add mathematical expressions, reasoning and extracted diagrams. Construction and final calculations are checked; written proofs are not automatically graded.</p><div id="geometry-notebook"></div><h4>Required results</h4><p id="server-save" class="small" role="status"></p>${t.answers.map((a, i) => `<div class="stereo-answer"><label for="answer-${i}">${escape(a.label)}</label><div><input id="answer-${i}" type="text" autocomplete="off" placeholder="Enter expression" value="${escape(state.answers[i] || '')}">${!assessment ? `<button class="secondary" data-check-answer="${i}">Check</button>${a.hint ? `<button class="secondary" data-hint="${i}">Hint</button>` : ''}` : ''}</div><p class="small" id="answer-feedback-${i}" role="status"></p></div>`).join('')}<div class="stereo-toolbar"><button class="primary" id="check-task">${assessment ? 'Submit problem' : 'Check solution'}</button>${!assessment ? '<button class="secondary" id="show-solution">Worked solution</button>' : ''}</div><div id="task-result" role="status"></div><div id="worked-solution"></div></section>`;
            const host = content.querySelector('#scene-host'),
                canvas = host.querySelector('canvas'),
                fallback = new AxionSolid.SolidView(canvas);
            fallback.onClick = (x, y) => {
                let best = 18, id = null;
                for (const [name, p] of Object.entries(state.points)) {
                    const q = fallback.project(W.schematicPoint(p, activeTask.dims, schematic)), d = Math.hypot(q[0] - x, q[1] - y);
                    if (d < best) {
                        best = d;
                        id = name;
                    }
                }
                if (id)
                    pick(id);
            };
            view = {
                set: s => fallback.set(s),
                reset: m => fallback.reset(m),
                zoomBy: f => {
                    fallback.zoom = P.clamp(fallback.zoom * f, .45, 3);
                    fallback.draw();
                },
                dispose: () => fallback.dispose?.()
            };
            if (window.createStereoView)
                window.createStereoView(host, pick).then(v => {
                    if (!host.isConnected) {
                        v.dispose?.();
                        return;
                    }
                    view = v;
                    fallback.dispose?.();
                    content.querySelector('#renderer-status').textContent = 'WebGL · Three.js';
                    drawScene();
                }).catch(() => {
                    if (host.isConnected)
                        content.querySelector('#renderer-status').textContent = 'Canvas fallback';
                });
            content.querySelectorAll('[data-tool]').forEach(b => b.onclick = () => {
                tool = b.dataset.tool;
                selection = [];
                content.querySelector('#construct-error').textContent = '';
                refresh();
            });
            content.querySelectorAll('[data-camera]').forEach(b => b.onclick = () => view.reset(b.dataset.camera));
            content.querySelector('#zoom-plus').onclick = () => view.zoomBy(1.2);
            content.querySelector('#zoom-minus').onclick = () => view.zoomBy(1 / 1.2);
            content.querySelector('#clear-selection').onclick = () => {
                selection = [];
                refresh();
            };
            content.querySelector('#apply-tool').onclick = apply;
            content.querySelector('#scale-mode').onclick = () => {
                schematic = !schematic;
                drawScene();
                updateViewControls();
            };
            content.querySelector('#labels-mode').onclick = () => {
                showLabels = !showLabels;
                drawScene();
                updateViewControls();
            };
            content.querySelector('#flat-size').onclick = () => {
                flatSize = !flatSize;
                content.querySelector('.stereo-work-grid').classList.toggle('flat-expanded', flatSize);
                content.querySelector('#flat-size').textContent = flatSize ? 'Side by side' : 'Enlarge';
            };
            content.querySelector('#undo').onclick = () => {
                if (!history.length)
                    return;
                flatSide = -1;
                const notes = state.notes, answers = state.answers, steps = state.steps;
                state = JSON.parse(history.pop());
                state.notes = notes;
                state.answers = answers;
                state.steps = steps;
                state.angles ||= [];
                state.equal ||= [];
                selection = [];
                activeFlat = state.extracted.length - 1;
                invalidate();
                refresh();
            };
            content.querySelector('#reset-work').onclick = () => {
                if (!confirm('Reset this problem and its saved solution?'))
                    return;
                snapshot();
                state = initial(t);
                selection = [];
                activeFlat = -1;
                flatSide = -1;
                invalidate();
                refresh();
                notebook.reset();
                t.answers.forEach((_, i) => content.querySelector('#answer-' + i).value = '');
            };
            notebook = StereoNotebook.mount(content.querySelector('#geometry-notebook'), () => state, invalidate, fig => svg(W.flatten(fig.points), fig.ids, -1, pair => info(pair), !assessment));
            t.answers.forEach((a, i) => {
                content.querySelector('#answer-' + i).oninput = e => {
                    state.answers[i] = e.target.value;
                    content.querySelector('#answer-feedback-' + i).textContent = '';
                    invalidate();
                };
            });
            content.querySelectorAll('[data-hint]').forEach(b => b.onclick = () => content.querySelector('#answer-feedback-' + b.dataset.hint).textContent = t.answers[b.dataset.hint].hint);
            content.querySelectorAll('[data-check-answer]').forEach(b => b.onclick = () => {
                const i = Number(b.dataset.checkAnswer),
                    a = t.answers[i],
                    ok = W.correct(state.answers[i] || '', a.value, a.tol),
                    out = content.querySelector('#answer-feedback-' + i);
                out.textContent = ok ? 'Correct.' : 'Not correct yet. Check your calculation.';
                out.className = 'small ' + (ok ? 'correct' : 'incorrect');
                if (ok) {
                    syncAnswer(i);
                    save();
                    drawScene();
                    drawFlat();
                    notebook?.updateFigures();
                }
            });
            content.querySelector('#check-task').onclick = check;
            const worked = content.querySelector('#show-solution');
            if (worked)
                worked.onclick = () => {
                    content.querySelector('#worked-solution').textContent = t.solution;
                };
            refresh();
        }
        function pick(id) {
            if (!Object.hasOwn(state.points, id))
                return;
            selection = selection.includes(id) ? selection.filter(x => x !== id) : [...selection, id];
            if (['select', 'segment', 'midpoint'].includes(tool) && selection.length > 2)
                selection = selection.slice(-2);
            refresh();
        }
        function unit(t) {
            return /\bcm\b/.test(t.prompt) ? ' cm' : '';
        }
        function givenSummary(t) {
            const ids = t.shape === 'pyramid' ? ['AB', 'OT'] : t.id === 'p51' ? ['AB', 'BC', 'AG'] : ['AB', 'BC', 'CG'];
            return ids.map(id => [id, W.givenLengths(t)[W.key(id.split(''))]]);
        }
        function info(ids) {
            return W.lengthInfo(activeTask, state.annotations, ids);
        }
        function syncAnswer(i) {
            const t = activeTask,
                p = state.points,
                known = {
                    p11: [['A', 'C']],
                    p31: [['A', 'C'], ['A', 'G']],
                    p32: [['A', 'C'], ['A', 'G']],
                    p51: [['C', 'G']],
                    l3: [['C', 'G'], ['A', 'G']],
                    f1: [['B', 'D']],
                    f3: [['A', 'C'], ['A', 'G']]
                };
            let ids = t.answerSegments?.[i] || known[t.id]?.[i];
            if (t.id === 'p12') {
                const m = Object.keys(p).find(id => /^M\d+$/.test(id) && P.distance(p[id], W.midpoint(p.A, p.B)) < 1e-7);
                if (m)
                    ids = i === 0 ? [m, 'B'] : i === 1 ? [m, 'C'] : null;
            }
            if ((t.id === 'p52' || t.generated && t.dynamic === 'pyramidTriangle') && i === 0) {
                const m = Object.keys(p).find(id => /^M\d+$/.test(id) && P.distance(p[id], W.midpoint(p.B, p.C)) < 1e-7);
                if (m)
                    ids = ['T', m];
            }
            if (!ids || !ids.every(id => p[id]) || !W.correct(state.answers[i] || '', P.distance(...ids.map(id => p[id]))))
                return;
            state.annotations[W.key(ids)] = W.number(state.answers[i]);
        }
        function updateViewControls() {
            const b = content.querySelector('#scale-mode');
            b.textContent = schematic ? 'View: schematic' : 'View: true scale';
            b.setAttribute('aria-pressed', String(schematic));
            content.querySelector('#labels-mode').textContent = 'Labels: ' + (showLabels ? 'on' : 'off');
            content.querySelector('#scale-note').textContent = schematic ? 'Schematic view: proportions adjusted for clarity. Values and the 2D diagram use actual dimensions.' : 'True-scale view: dimensions are proportional. Rotate to inspect hidden edges.';
        }
        function inspector(el, ids) {
            el.innerHTML = '';
            if (!ids || ids.length !== 2)
                return;
            const name = ids.join(''), known = info(ids), u = unit(activeTask);
            el.innerHTML = `<div class="stereo-inspector"><div><strong>${escape(name)}</strong> <span class="small">${known ? `${fmt(known.value)}${u} · ${known.source === 'given' ? 'Given / equal edge' : 'Your recorded value'}` : 'Length not recorded'}</span></div>${known?.source === 'given' ? '' : `<div class="stereo-record"><input aria-label="Length of ${escape(name)}" placeholder="Enter calculated length" value="${known ? fmt(known.value) : ''}"><button class="secondary" data-record>Record</button>${!assessment ? '<button class="secondary" data-measure>Measure</button>' : ''}${known ? '<button class="secondary" data-remove>Clear</button>' : ''}</div><p class="small" data-inspect-feedback></p>`}</div>`;
            const feedback = el.querySelector('[data-inspect-feedback]');
            const record = el.querySelector('[data-record]');
            if (record)
                record.onclick = () => {
                    const raw = el.querySelector('input').value, v = W.number(raw);
                    if (!Number.isFinite(v) || v <= 0) {
                        feedback.textContent = 'Enter a positive number or expression.';
                        return;
                    }
                    if (!assessment && !W.correct(raw, P.distance(...ids.map(id => state.points[id])))) {
                        feedback.textContent = 'That length does not match the construction.';
                        return;
                    }
                    snapshot();
                    state.annotations[W.key(ids)] = v;
                    save();
                    refresh();
                };
            const measure = el.querySelector('[data-measure]');
            if (measure)
                measure.onclick = () => {
                    feedback.textContent = `Measured length ≈ ${fmt(P.distance(...ids.map(id => state.points[id])))}${u}. Use this to check, not replace, your calculation.`;
                };
            const remove = el.querySelector('[data-remove]');
            if (remove)
                remove.onclick = () => {
                    snapshot();
                    delete state.annotations[W.key(ids)];
                    save();
                    refresh();
                };
        }
        function drawScene() {
            const t = activeTask, p = state.points;
            let scene;
            const base = t.shape === 'pyramid' ? [...W.edges.filter(e => e.every(id => p[id])), ...['A', 'B', 'C', 'D'].map(id => [id, 'T'])] : W.edges;
            if (t.shape === 'pyramid') {
                scene = {
                    faces: [W.faces[0], ['A', 'B', 'T'], ['B', 'C', 'T'], ['C', 'D', 'T'], ['D', 'A', 'T']].map(ids => S.face(ids.map(id => p[id]))),
                    lines: base.map(ids => S.line(...ids.map(id => p[id]))),
                    extent: Math.max(...t.dims) * 1.85
                };
            }
            else
                scene = S.cuboid(...t.dims);
            scene.faces = scene.faces.map(f => ({ ...f, color: 'rgba(65,145,190,.075)' }));
            state.polys.forEach(ids => {
                scene.faces.push(S.face(ids.map(id => p[id]), 'rgba(25,155,132,.22)'));
                scene.lines.push({ points: [...ids, ids[0]].map(id => p[id]), color: '#169b84', width: 2.7 });
            });
            state.segments.forEach(ids => scene.lines.push(S.line(...ids.map(id => p[id]), '#e38b38', 3)));
            const flat = state.extracted[activeFlat], side = flat && flatSide >= 0 && flatSide < flat.length ? [flat[flatSide], flat[(flatSide + 1) % flat.length]] : null;
            if (flat) {
                scene.faces.push(S.face(flat.map(id => p[id]), 'rgba(25,155,132,.11)'));
                scene.lines.push({ points: [...flat, flat[0]].map(id => p[id]), color: '#169b84', width: 1.8 });
            }
            if (side)
                scene.lines.push(S.line(...side.map(id => p[id]), '#169b84', 4));
            if (selection.length === 2)
                scene.lines.push(S.line(...selection.map(id => p[id]), '#169b84', 3));
            scene.points = Object.entries(p).map(([label, p]) => ({ label, p, color: selection.includes(label) ? '#159e8e' : '#d98c3f' }));
            const displayIds = [
                ...givenSummary(t).map(([id]) => id.split('')),
                ...state.segments,
                ...Object.keys(state.annotations).map(k => k.split('|')),
                ...(side ? [side] : []),
                ...(selection.length === 2 ? [selection] : [])
            ];
            scene.annotations = showLabels ? displayIds.filter((ids, i, arr) => arr.findIndex(q => W.key(q) === W.key(ids)) === i && ids.every(id => p[id])).map(ids => {
                const v = info(ids);
                return { points: ids.map(id => p[id]), label: `${ids.join('')} = ${v ? fmt(v.value) : '?'}`, color: v?.source === 'recorded' ? '#168976' : null };
            }) : [];
            if (schematic) {
                const transform = q => W.schematicPoint(q, t.dims, true);
                scene.faces = scene.faces.map(f => ({ ...f, points: f.points.map(transform) }));
                scene.lines = scene.lines.map(l => ({ ...l, points: l.points.map(transform) }));
                scene.points = scene.points.map(q => ({ ...q, p: transform(q.p) }));
                scene.annotations = scene.annotations.map(a => ({ ...a, points: a.points.map(transform) }));
            }
            scene.fit = true;
            scene.extent = Math.max(...scene.points.map(q => P.norm(q.p))) * 2;
            view.set(scene);
            updateViewControls();
        }
        function refresh() {
            const help = {
                select: assessment ? 'Select two vertices to inspect their segment or record a calculated length.' : 'Select two vertices to inspect their segment, measure or record a length.',
                segment: 'Choose two points, then Draw segment.',
                midpoint: 'Choose two endpoints, then Create midpoint.',
                polygon: 'Choose at least three coplanar points in boundary order, then Create polygon.',
                extract: 'Choose the boundary vertices in order, then Extract figure.'
            };
            content.querySelector('#tool-help').textContent = help[tool];
            content.querySelectorAll('[data-tool]').forEach(b => {
                b.classList.toggle('active', b.dataset.tool === tool);
                b.setAttribute('aria-pressed', String(b.dataset.tool === tool));
            });
            content.querySelector('#selection').textContent = selection.length ? selection.join(' → ') : 'No points selected';
            const applyButton = content.querySelector('#apply-tool');
            applyButton.textContent = ({ select: 'Inspect points', segment: 'Draw segment', midpoint: 'Create midpoint', polygon: 'Create polygon', extract: 'Extract figure' })[tool];
            applyButton.hidden = tool === 'select';
            applyButton.disabled = tool === 'select' || selection.length < (tool === 'segment' || tool === 'midpoint' ? 2 : 3);
            const bar = content.querySelector('#points');
            bar.innerHTML = Object.keys(state.points).map(id => `<button class="secondary ${selection.includes(id) ? 'active' : ''}" data-point="${id}" aria-pressed="${selection.includes(id)}">${id}</button>`).join('');
            bar.querySelectorAll('button').forEach(b => b.onclick = () => pick(b.dataset.point));
            content.querySelector('#construction-log').innerHTML = [
                ...state.segments.map(ids => 'Segment ' + ids.join('–')),
                ...state.polys.map(ids => 'Polygon ' + ids.join('–')),
                ...Object.keys(state.points).filter(id => /^M\d+$/.test(id)).map(id => 'Midpoint ' + id),
                ...state.extracted.map(ids => '2D: ' + ids.join('–'))
            ].map(x => `<li>${x}</li>`).join('') || '<li class="small">No constructions yet.</li>';
            drawScene();
            drawFlat();
            notebook?.updateFigures();
            inspector(content.querySelector('#spatial-inspector'), selection.length === 2 ? selection : null);
        }
        function drawFlat() {
            const tabs = content.querySelector('#flat-tabs'),
                figure = content.querySelector('#flat-figure'),
                detail = content.querySelector('#flat-detail');
            tabs.innerHTML = state.extracted.map((ids, i) => `<button class="secondary ${i === activeFlat ? 'active' : ''}" data-flat="${i}">${ids.join('–')}</button>`).join('');
            tabs.querySelectorAll('button').forEach(b => b.onclick = () => {
                activeFlat = Number(b.dataset.flat);
                flatSide = -1;
                flatSelected = [];
                drawFlat();
                drawScene();
            });
            const ids = state.extracted[activeFlat];
            if (!ids) {
                figure.innerHTML = '<div class="flat-empty">Your extracted figures will appear here.</div>';
                detail.textContent = '';
                inspector(content.querySelector('#flat-inspector'), null);
                content.querySelector('#flat-tools').innerHTML = '';
                return;
            }
            const planar = W.planarPoints(ids, state.points);
            flatSelected = flatSelected.filter(id => planar[id]);
            figure.innerHTML = svg(
                W.flatten(ids.map(id => state.points[id])),
                ids,
                flatSide,
                info,
                !assessment,
                {
                    points: planar,
                    selected: flatSelected,
                    segments: state.segments.filter(pair => !ids.some((id, i) => W.key([id, ids[(i + 1) % ids.length]]) === W.key(pair))),
                    angles: state.angles,
                    equal: state.equal
                });
            figure.querySelectorAll('[data-vertex]').forEach(v => v.onclick = () => flatPick(v.dataset.vertex));
            figure.querySelectorAll('[data-side]').forEach(l => l.onclick = () => {
                flatSide = Number(l.dataset.side);
                drawFlat();
                drawScene();
            });
            detail.textContent = 'True scale · ? = unknown · colored value = recorded';
            inspector(content.querySelector('#flat-inspector'), flatSide < 0 ? null : [ids[flatSide], ids[(flatSide + 1) % ids.length]]);
            flatControls(planar);
        }
        function flatPick(id) {
            flatSelected = flatSelected.includes(id) ? flatSelected.filter(x => x !== id) : [...flatSelected, id];
            const limit = flatTool === 'equal' ? 4 : flatTool === 'angle' ? 3 : 2;
            if (flatSelected.length > limit)
                flatSelected = flatSelected.slice(-limit);
            drawFlat();
        }
        function flatControls(planar) {
            const el = content.querySelector('#flat-tools');
            const need = flatTool === 'equal' ? 4 : flatTool === 'angle' ? 3 : 2;
            el.innerHTML = `<div class="geo-flat-tools"><strong>Construct in 2D</strong><div class="stereo-toolbar">${[['inspect', 'Select'], ['segment', 'Draw segment'], ['midpoint', 'Midpoint'], ['angle', 'Mark angle'], ['equal', 'Equal sides']].map(([id, label]) => `<button class="secondary ${flatTool === id ? 'active' : ''}" data-flat-tool="${id}">${label}</button>`).join('')}</div><p class="small">${flatTool === 'equal' ? 'Select endpoints of two equal segments (shared vertices may be repeated using the second pair menu below).' : flatTool === 'angle' ? 'Choose three vertices in angle order; middle point is the vertex.' : flatTool === 'inspect' ? 'Select two vertices to inspect a length.' : 'Choose two endpoints on the planar drawing.'}</p><div class="stereo-toolbar">${Object.keys(planar).map(id => `<button class="secondary ${flatSelected.includes(id) ? 'active' : ''}" data-flat-pick="${escape(id)}">${escape(id)}</button>`).join('')}</div><p class="small">${flatSelected.join(' → ') || 'No vertices selected'}</p>${flatTool === 'angle' ? '<input id="geo-angle-value" placeholder="Angle in degrees (optional)">' : ''}${flatTool === 'equal' ? `<label class="small">Second segment <select id="geo-equal-pair"><option value="">Use third and fourth selection</option>${Object.keys(planar).flatMap((a, i, all) => all.slice(i + 1).map(b => `<option value="${escape(a + '|' + b)}">${escape(a + '–' + b)}</option>`)).join('')}</select></label>` : ''}<div class="stereo-toolbar"><button class="primary" id="flat-apply" ${flatSelected.length < (flatTool === 'equal' ? 2 : need) ? 'disabled' : ''}>${flatTool === 'inspect' ? 'Inspect length' : 'Apply'}</button><button class="secondary" id="flat-clear">Clear selection</button></div><p id="flat-error" class="small" role="status"></p></div>`;
            el.querySelectorAll('[data-flat-tool]').forEach(b => b.onclick = () => {
                flatTool = b.dataset.flatTool;
                flatSelected = [];
                drawFlat();
            });
            el.querySelectorAll('[data-flat-pick]').forEach(b => b.onclick = () => flatPick(b.dataset.flatPick));
            el.querySelector('#flat-clear').onclick = () => {
                flatSelected = [];
                drawFlat();
            };
            el.querySelector('#flat-apply').onclick = () => {
                const ids = [...flatSelected], p = state.points, err = el.querySelector('#flat-error');
                try {
                    if (flatTool === 'inspect') {
                        inspector(content.querySelector('#flat-inspector'), ids);
                        return;
                    }
                    if (flatTool === 'segment') {
                        if (state.segments.some(q => W.key(q) === W.key(ids)))
                            throw Error('Segment already exists.');
                        snapshot();
                        state.segments.push(ids);
                    }
                    else if (flatTool === 'midpoint') {
                        const point = W.midpoint(...ids.map(id => p[id]));
                        if (Object.values(p).some(q => P.distance(q, point) < 1e-7))
                            throw Error('Point already exists.');
                        snapshot();
                        let n = 1;
                        while (p['M' + n])
                            n++;
                        p['M' + n] = point;
                    }
                    else if (flatTool === 'angle') {
                        const value = el.querySelector('#geo-angle-value').value.trim(),
                            num = value ? W.number(value) : null,
                            actual = W.angle(...ids.map(id => p[id]));
                        if (!Number.isFinite(actual) || actual < 1e-6 || actual > 179.999)
                            throw Error('Choose a non-straight angle.');
                        if (value && (!Number.isFinite(num) || num <= 0 || num >= 180 || !assessment && Math.abs(num - actual) > .05))
                            throw Error('Check your angle value.');
                        snapshot();
                        state.angles = state.angles.filter(m => m.ids[1] !== ids[1] || W.key(m.ids) !== W.key(ids));
                        state.angles.push({ ids, value: num });
                    }
                    else if (flatTool === 'equal') {
                        const choice = el.querySelector('#geo-equal-pair').value,
                            first = ids.slice(0, 2),
                            second = choice ? choice.split('|') : ids.slice(2);
                        if (second.length !== 2 || W.key(first) === W.key(second))
                            throw Error('Choose two different segments.');
                        if (!assessment && Math.abs(P.distance(...first.map(id => p[id])) - P.distance(...second.map(id => p[id]))) > 1e-7)
                            throw Error('These segments are not equal.');
                        if (state.equal.length >= 3)
                            throw Error('Up to three equal-side groups; undo a previous group first.');
                        snapshot();
                        state.equal.push([first, second]);
                    }
                    flatSelected = [];
                    invalidate();
                    refresh();
                }
                catch (e) {
                    err.textContent = e.message;
                }
            };
        }
        function apply() {
            const err = content.querySelector('#construct-error');
            err.textContent = '';
            try {
                const ids = [...selection], pts = ids.map(id => state.points[id]);
                if (tool === 'segment' || tool === 'midpoint') {
                    if (ids.length !== 2)
                        throw Error('Select exactly two points.');
                    if (tool === 'midpoint') {
                        const p = W.midpoint(...pts);
                        if (Object.values(state.points).some(q => P.distance(p, q) < 1e-7))
                            throw Error('This point already exists.');
                        snapshot();
                        let n = 1;
                        while (state.points['M' + n])
                            n++;
                        state.points['M' + n] = p;
                    }
                    else {
                        if (state.segments.some(q => W.key(q) === W.key(ids)))
                            throw Error('This segment already exists.');
                        snapshot();
                        state.segments.push(ids);
                    }
                }
                else if (tool === 'polygon' || tool === 'extract') {
                    const flat = W.flatten(pts);
                    if (!W.validPolygon(flat))
                        throw Error('Choose points in boundary order, forming a polygon with nonzero area.');
                    const list = tool === 'polygon' ? state.polys : state.extracted;
                    if (list.some(q => W.key(q) === W.key(ids)))
                        throw Error('This figure already exists.');
                    snapshot();
                    list.push(ids);
                    if (tool === 'extract') {
                        activeFlat = list.length - 1;
                        flatSide = -1;
                    }
                }
                else
                    return;
                if (tool === 'segment') {
                    tool = 'select';
                    selection = ids;
                }
                else
                    selection = [];
                invalidate();
                refresh();
            }
            catch (e) {
                err.textContent = e.message;
            }
        }
        function check() {
            const t = activeTask, build = W.constructionOK(t, state);
            let correct = 0;
            t.answers.forEach((a, i) => {
                const ok = W.correct(state.answers[i] || '', a.value, a.tol);
                correct += Number(ok);
                const f = content.querySelector('#answer-feedback-' + i);
                f.textContent = assessment ? '' : ok ? 'Correct.' : 'Not correct yet. Check your calculation.';
                f.className = 'small ' + (ok ? 'correct' : 'incorrect');
            });
            state.complete = build && correct === t.answers.length;
            if (!assessment || state.complete) {
                t.answers.forEach((a, i) => {
                    if (W.correct(state.answers[i] || '', a.value, a.tol))
                        syncAnswer(i);
                });
                drawScene();
                drawFlat();
                notebook?.updateFigures();
            }
            const out = content.querySelector('#task-result');
            out.textContent = state.complete ? 'Solution accepted. Progress saved.' : assessment ? 'Submission not accepted. Review your construction and calculations.' : `${build ? 'Construction accepted.' : 'Construction is incomplete or incorrect. Re-read the requested objects.'} ${correct}/${t.answers.length} calculations correct.`;
            out.className = state.complete ? 'correct' : 'incorrect';
            save();
            if (state.complete) {
                const payload = { id: t.id, points: state.points, segments: state.segments, polys: state.polys, extracted: state.extracted, answers: state.answers };
                const msg = content.querySelector('#server-save');
                msg.textContent = 'Saving completed result to server…';
                fetch('/api/stereo/results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(async (r) => {
                    if (!r.ok)
                        throw Error('Server rejected result');
                    const result = await r.json();
                    if (!result.correct)
                        throw Error('Server rejected result');
                    msg.textContent = 'Completed result saved to server.';
                }).catch(() => {
                    msg.textContent = 'Result saved locally. Server unavailable; submit again to sync.';
                });
            }
        }
        open(0);
        return () => {
            view?.dispose?.();
            root.replaceChildren();
        };
    }
    window.StereoWorkspace = { mount, study };
})();
