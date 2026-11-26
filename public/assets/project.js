Axion.init('Projects');
const M = ProjectMath, app = document.getElementById('app');
const id = new URLSearchParams(location.search).get('id');
const project = M.projects.find(p => p.id === id);
const escapeText = Axion.escape;
const fmt = (n, d = 2) => Number(n.toFixed(d)).toString();
const icons = {
    container: '<ellipse cx="50" cy="15" rx="18" ry="5"/><path d="M32 15C32 33 18 36 27 60S32 78 32 83M68 15C68 33 82 36 73 60S68 78 68 83"/><ellipse cx="50" cy="83" rx="18" ry="5"/><path d="M50 10V90" stroke-dasharray="3 4"/>',
    box: '<path d="M16 34L50 15 84 34 50 53ZM16 34V70L50 89 84 70V34M50 53V89M29 42L50 30 71 42"/>',
    section: '<path d="M15 28L58 13 85 32V73L42 88 15 69ZM15 28L42 47 85 32M42 47V88M58 13V55L15 69M58 55L85 73" stroke-opacity=".6"/><path d="M15 48L36 21 71 22 85 53 64 80 29 79Z" fill="currentColor" fill-opacity=".19"/>',
    circumcircle: '<circle cx="50" cy="50" r="36"/><path d="M19 31L75 24 53 86Z M50 14V86M14 50H86" stroke-dasharray="3 3"/><circle cx="50" cy="50" r="3" fill="currentColor"/>',
    path: '<path d="M8 62H92" stroke-dasharray="4 3"/><path d="M18 20L53 62 84 27"/><path d="M53 62L84 97" stroke-dasharray="4 3"/><circle cx="18" cy="20" r="3"/><circle cx="84" cy="27" r="3"/><circle cx="53" cy="62" r="3"/>',
    tangent: '<circle cx="38" cy="50" r="27"/><path d="M86 50L47 24M86 50L47 76M38 50L47 24M38 50L47 76"/><circle cx="86" cy="50" r="3" fill="currentColor"/>'
};
function projectCard(p, done = false) {
    return `<a class="project-link" href="project.html?id=${p.id}"><svg class="project-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">${icons[p.id]}</svg><div><span class="project-index-label" data-project-status="${p.id}">${done ? 'Completed' : p.level}</span><h3>${p.title}</h3><p>${p.description}</p><div class="project-tags">${p.topics.map(t => `<span>${t}</span>`).join('')}</div></div></a>`;
}
if (!project) {
    app.innerHTML = `<div class="project-crumb"><a href="index.html">Home</a> / Projects</div><h1 class="page-heading">Mathematical projects</h1><p class="lead">Construct a solution, investigate a model and submit your work. Use the related lessons when you need them.</p><div class="section-heading"><h2>Geometry</h2></div><div class="project-index">${M.projects.filter(p => p.type === 'geometry').map(p => projectCard(p)).join('')}</div><div class="section-heading"><h2>Spatial modeling</h2></div><div class="project-index">${M.projects.filter(p => p.type === 'solid').map(p => projectCard(p)).join('')}</div>`;
    Axion.api('/projects/status').then(rows => {
        for (const p of M.projects) {
            if (rows.some(r => r.project === p.id && r.correct))
                document.querySelector(`[data-project-status="${p.id}"]`).textContent = 'Completed';
        }
    }).catch(() => { });
}
else {
    runProject();
}
function runProject() {
    const defaults = {
        container: { formula: '2+1.5*sin(pi*x/12)' },
        box: { cut: 2, derivative: '' },
        section: { points: [[-1, -1, 0], [1, -1, 0], [-1, 1, 0]], area: '' },
        circumcircle: { objects: [] },
        path: { objects: [] },
        tangent: { objects: [] }
    };
    const draftKey = 'axion-project-' + id;
    let draft;
    try {
        draft = JSON.parse((window.AxionStorage || localStorage).getItem(draftKey) || 'null');
    }
    catch (e) { }
    let model = draft?.model || structuredClone(defaults[id]),
        trials = Array.isArray(draft?.trials) ? draft.trials : [],
        note = draft?.note || '';
    const importedFormula = new URLSearchParams(location.search).get('formula');
    if (id === 'container' && importedFormula && importedFormula.length <= 180) {
        model.formula = importedFormula;
        history.replaceState(null, '', 'project.html?id=container');
    }
    let view, geom, currentResult = null, sectionHeight = 6, fold = 1, foldFrame = 0;
    let savedRows = [];
    document.title = project.title + ' · Axion';
    app.innerHTML = `<div class="project-crumb"><a href="index.html">Home</a> / <a href="project.html">Projects</a> / ${project.title}</div><h1 class="page-heading">${project.title}</h1><p class="lead brief">${project.description}</p><div class="project-tags">${project.topics.map(t => `<span>${t}</span>`).join('')}</div>
        <div class="project-layout"><section class="project-panel project-brief-panel"><h2>Requirements</h2><ul>${project.requirements.map(t => `<li>${t}</li>`).join('')}</ul></section><div class="project-main">
            <section class="project-panel"><h2>${project.type === 'geometry' ? 'Construction' : 'Model'}</h2><div id="workspace"></div></section>
            ${project.type === 'solid' ? '<section class="project-panel"><h2>Trials</h2><p class="workspace-caption">Record measurements to compare designs. A recorded model can be reopened.</p><div class="model-toolbar"><button class="btn ghost" id="record-trial">Record current model</button><button class="btn ghost" id="clear-trials">Clear trials</button></div><div class="trial-table" id="trial-table"></div></section>' : ''}
            <section class="project-panel"><h2>Solution notes</h2><label for="solution-note" class="workspace-caption">Optional: record your calculations or construction method.</label><textarea id="solution-note" maxlength="2000" placeholder=""></textarea><div class="model-toolbar"><button class="btn" id="submit-project">Check and save solution</button><span id="submit-status" class="feedback" role="status"></span></div><div id="criteria" class="criteria-list"></div><details><summary>Worked solution</summary><p>${project.solution}</p></details></section>
        </div><aside class="project-side"><section class="project-panel"><h2>Reference</h2><details><summary>Relevant mathematics</summary><p>${project.theory}</p></details>${project.lessons.map(k => `<p><a href="learn.html?lesson=${k}">${escapeText(Axion.lessons.find(l => l[0] === k)?.[1] || k)} →</a></p>`).join('')}${project.skill ? `<p><a href="practice.html?skill=${project.skill}">Related practice →</a></p>` : ''}${project.id === 'container' ? '<p><a href="function-studio.html">Explore functions →</a></p>' : ''}</section><section class="project-panel"><h2>Saved solutions</h2><div id="saved-projects" class="workspace-caption">Loading…</div></section><section class="project-panel"><h2>Other projects</h2>${M.projects.filter(p => p.id !== id).map(p => `<p><a href="project.html?id=${p.id}">${p.title} →</a></p>`).join('')}</section></aside></div>`;
    const root = document.getElementById('workspace'),
        noteEl = document.getElementById('solution-note'),
        status = document.getElementById('submit-status'),
        criteria = document.getElementById('criteria');
    noteEl.value = note;
    function saveDraft() {
        try {
            (window.AxionStorage || localStorage).setItem(draftKey, JSON.stringify({ model, note: noteEl.value, trials }));
        }
        catch (e) { }
    }
    function changed() {
        saveDraft();
        criteria.innerHTML = '';
        status.textContent = '';
    }
    noteEl.addEventListener('input', saveDraft);
    const metrics = values => `<div class="metric-grid">${values.map(([label, value]) => `<div class="metric-cell"><strong>${escapeText(value)}</strong><span>${escapeText(label)}</span></div>`).join('')}</div>`;
    const cameraButtons = `<div class="model-toolbar"><button class="tool-button" data-camera="orbit">Reset view</button><button class="tool-button" data-camera="front">Front</button><button class="tool-button" data-camera="top">Top</button></div>`;
    function createView() {
        view = new AxionSolid.SolidView(root.querySelector('#model-canvas'));
        root.querySelectorAll('[data-camera]').forEach(b => b.addEventListener('click', () => view.reset(b.dataset.camera)));
    }
    function plot(canvas, fn, xmax, ymax, marker, labels) {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h)
            return;
        const dpr = Math.min(devicePixelRatio || 1, 2);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const css = getComputedStyle(document.documentElement),
            ink = css.getPropertyValue('--ink'),
            line = css.getPropertyValue('--line'),
            accent = css.getPropertyValue('--accent');
        const left = 39,
            right = w - 13,
            top = 15,
            bottom = h - 31,
            px = x => left + x / xmax * (right - left),
            py = y => bottom - y / ymax * (bottom - top);
        ctx.font = '11px system-ui';
        ctx.fillStyle = ink;
        for (let i = 0; i <= 4; i++) {
            const x = xmax * i / 4, y = ymax * i / 4;
            ctx.strokeStyle = line;
            ctx.beginPath();
            ctx.moveTo(px(x), top);
            ctx.lineTo(px(x), bottom);
            ctx.moveTo(left, py(y));
            ctx.lineTo(right, py(y));
            ctx.stroke();
            ctx.fillText(fmt(x, 1), px(x) - 5, bottom + 15);
            ctx.fillText(fmt(y, 1), 3, py(y) + 4);
        }
        ctx.fillText(labels[0], right - 24, bottom + 28);
        ctx.fillText(labels[1], left + 4, 11);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= 240; i++) {
            const x = xmax * i / 240, y = fn(x);
            if (i)
                ctx.lineTo(px(x), py(y));
            else
                ctx.moveTo(px(x), py(y));
        }
        ctx.stroke();
        if (marker !== undefined) {
            ctx.strokeStyle = '#d48b36';
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.moveTo(px(marker), bottom);
            ctx.lineTo(px(marker), py(fn(marker)));
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#d48b36';
            ctx.beginPath();
            ctx.arc(px(marker), py(fn(marker)), 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    function buildVessel() {
        root.innerHTML = `<div class="formula-editor"><label for="radius-function">r(x) =</label><input id="radius-function" type="text" maxlength="180" spellcheck="false" aria-label="Radius function"><button class="btn" id="build-model">Build model</button><button class="btn ghost" id="explore-profile">Explore graph</button></div><p class="workspace-caption">x is height in cm, from 0 to 12. Use *, /, ^, sin, cos, sqrt, pi and parentheses.</p><div class="solid-layout"><div><canvas id="model-canvas" class="model-view" aria-label="Rotatable three-dimensional vessel"></canvas>${cameraButtons}</div><div><h3>Radius profile</h3><canvas id="project-plot" class="plot-view" aria-label="Graph of radius against height"></canvas><div class="model-toolbar"><label>Inspect cross-section at x = <input type="number" id="section-height" min="0" max="12" step="0.2" value="6"> cm</label></div><p id="section-reading" class="workspace-caption"></p></div></div><div id="metrics"></div><p id="model-error" class="feedback" role="status"></p>`;
        createView();
        const input = root.querySelector('#radius-function');
        input.value = model.formula;
        function render() {
            try {
                currentResult = M.vessel(model.formula);
                const { profile, volume, area, min, max, base, opening } = currentResult;
                view.set(AxionSolid.vesselScene(profile, sectionHeight));
                const fn = AxionExpression.compile(model.formula), r = fn(sectionHeight);
                let partial = 0;
                const step = sectionHeight / 400;
                for (let i = 0; i <= 400; i++)
                    partial += (i === 0 || i === 400 ? 1 : i % 2 ? 4 : 2) * fn(i * step) ** 2;
                const volumeBelow = Math.PI * step * partial / 3;
                root.querySelector('#section-reading').textContent = `Radius: ${fmt(r, 3)} cm · Disk area: ${fmt(Math.PI * r * r, 3)} cm² · Volume below: ${fmt(volumeBelow)} mL`;
                plot(root.querySelector('#project-plot'), fn, 12, Math.max(5, max * 1.12), sectionHeight, ['x', 'r(x)']);
                root.querySelector('#metrics').innerHTML = metrics([
                    ['Capacity', fmt(volume) + ' mL'],
                    ['Exterior area', fmt(area) + ' cm²'],
                    ['Minimum radius', fmt(min, 3) + ' cm'],
                    ['Maximum radius', fmt(max, 3) + ' cm'],
                    ['Base / opening', fmt(base, 2) + ' / ' + fmt(opening, 2) + ' cm']
                ]);
                root.querySelector('#model-error').textContent = '';
            }
            catch (e) {
                currentResult = null;
                view.set({ faces: [], lines: [], extent: 15 });
                root.querySelector('#metrics').innerHTML = '';
                root.querySelector('#section-reading').textContent = '';
                root.querySelector('#model-error').textContent = e.message;
                const chart = root.querySelector('#project-plot');
                if (chart)
                    chart.getContext('2d').clearRect(0, 0, chart.width, chart.height);
            }
        }
        function build() {
            model.formula = input.value.trim();
            changed();
            render();
        }
        root.querySelector('#explore-profile').addEventListener('click', () => {
            saveDraft();
            location.href = 'function-studio.html?formula=' + encodeURIComponent(input.value);
        });
        root.querySelector('#build-model').addEventListener('click', build);
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter')
                build();
        });
        input.addEventListener(
            'input',
            () => {
                model.formula = input.value;
                currentResult = null;
                changed();
                root.querySelector('#model-error').textContent = 'Build the updated formula to refresh measurements.';
            });
        root.querySelector('#section-height').addEventListener(
            'input',
            e => {
                if (e.target.value !== '' && Number.isFinite(Number(e.target.value))) {
                    sectionHeight = M.clamp(Number(e.target.value), 0, 12);
                    if (currentResult)
                        render();
                }
            });
        new ResizeObserver(() => {
            if (currentResult)
                plot(root.querySelector('#project-plot'), AxionExpression.compile(model.formula), 12, Math.max(5, currentResult.max * 1.12), sectionHeight, ['x', 'r(x)']);
        }).observe(root.querySelector('#project-plot'));
        document.addEventListener('axion-theme', () => {
            if (currentResult)
                render();
        });
        render();
    }
    function buildBox() {
        root.innerHTML = `<div class="solid-layout"><div><h3>24 × 18 cm sheet</h3><svg id="box-net" class="net-view" viewBox="0 0 300 240" role="img" aria-label="Box net with draggable corner cut"></svg><p class="workspace-caption">Drag the orange corner handle or enter the cut size.</p><div class="model-toolbar"><label>Cut size <input id="box-cut" type="number" min="0.01" max="8.99" step="0.01"> cm</label></div></div><div><h3>Folded model</h3><canvas id="model-canvas" class="model-view" aria-label="Rotatable folding box"></canvas>${cameraButtons}<div class="model-toolbar"><button id="fold-box" class="btn ghost">Unfold</button></div></div></div><div id="metrics"></div><h3>Volume vs. cut size</h3><canvas id="project-plot" class="plot-view" aria-label="Volume curve"></canvas><div class="model-toolbar"><label>V′(x) at chosen cut size <input id="box-derivative" type="number" step="any"></label></div><p id="model-error" class="feedback" role="status"></p>`;
        createView();
        const cut = root.querySelector('#box-cut'),
            derivative = root.querySelector('#box-derivative'),
            net = root.querySelector('#box-net');
        cut.value = model.cut;
        derivative.value = model.derivative;
        function netDraw(x) {
            const l = 30, t = 30, W = 240, H = 180, k = x * 10;
            net.innerHTML = `<rect x="${l}" y="${t}" width="${W}" height="${H}" fill="var(--accent-soft)" stroke="var(--accent)"/><rect x="${l + k}" y="${t + k}" width="${W - 2 * k}" height="${H - 2 * k}" fill="var(--surface)" stroke="var(--accent)" stroke-dasharray="4 4"/>${[[l, t], [l + W - k, t], [l, t + H - k], [l + W - k, t + H - k]].map(([a, b]) => `<rect x="${a}" y="${b}" width="${k}" height="${k}" fill="var(--surface)" stroke="#d48b36" stroke-dasharray="4 3"/>`).join('')}<circle cx="${l + k}" cy="${t + k}" r="6" fill="#d48b36" data-handle="1"/><text x="150" y="20" text-anchor="middle" font-size="12" fill="var(--ink)">24 cm</text><text x="15" y="120" transform="rotate(-90 15 120)" text-anchor="middle" font-size="12" fill="var(--ink)">18 cm</text>`;
        }
        function render() {
            try {
                currentResult = M.box(model.cut);
                const m = currentResult;
                netDraw(m.cut);
                view.set(AxionSolid.boxScene(m.cut, fold));
                plot(root.querySelector('#project-plot'), M.boxVolume, 9, Math.ceil(M.boxVolume(M.optimalCut) / 100) * 100, m.cut, ['x', 'V']);
                root.querySelector('#metrics').innerHTML = metrics([['Base width', fmt(m.width) + ' cm'], ['Base depth', fmt(m.depth) + ' cm'], ['Height', fmt(m.cut, 4) + ' cm'], ['Volume', fmt(m.volume) + ' cm³']]);
                root.querySelector('#model-error').textContent = '';
            }
            catch (e) {
                currentResult = null;
                root.querySelector('#metrics').innerHTML = '';
                view.set({ faces: [], lines: [], extent: 29 });
                root.querySelector('#model-error').textContent = e.message;
                const chart = root.querySelector('#project-plot');
                if (chart)
                    chart.getContext('2d').clearRect(0, 0, chart.width, chart.height);
            }
        }
        function setCut(value) {
            model.cut = value;
            model.derivative = '';
            derivative.value = '';
            changed();
            render();
        }
        cut.addEventListener('input', () => setCut(cut.value));
        derivative.addEventListener('input', () => {
            model.derivative = derivative.value;
            changed();
        });
        let dragging = false;
        net.addEventListener('pointerdown', e => {
            if (!e.target.hasAttribute('data-handle'))
                return;
            dragging = true;
            net.setPointerCapture(e.pointerId);
        });
        net.addEventListener(
            'pointermove',
            e => {
                if (!dragging)
                    return;
                const p = net.createSVGPoint();
                p.x = e.clientX;
                p.y = e.clientY;
                const q = p.matrixTransform(net.getScreenCTM().inverse());
                const x = Math.round(M.clamp(((q.x - 30) + (q.y - 30)) / 20, .01, 8.99) * 100) / 100;
                cut.value = x;
                setCut(x);
            });
        net.addEventListener('pointerup', () => {
            dragging = false;
        });
        net.addEventListener('pointercancel', () => {
            dragging = false;
        });
        root.querySelector('#fold-box').addEventListener(
            'click',
            () => {
                if (!currentResult)
                    return;
                cancelAnimationFrame(foldFrame);
                const from = fold, to = fold > .5 ? 0 : 1, start = performance.now();
                const animate = t => {
                    const f = M.clamp((t - start) / 600, 0, 1);
                    fold = from + (to - from) * f;
                    if (currentResult)
                        view.set(AxionSolid.boxScene(currentResult.cut, fold));
                    if (f < 1)
                        foldFrame = requestAnimationFrame(animate);
                };
                foldFrame = requestAnimationFrame(animate);
                root.querySelector('#fold-box').textContent = to ? 'Unfold' : 'Fold';
            });
        new ResizeObserver(() => {
            if (currentResult)
                plot(root.querySelector('#project-plot'), M.boxVolume, 9, Math.ceil(M.boxVolume(M.optimalCut) / 100) * 100, currentResult.cut, ['x', 'V']);
        }).observe(root.querySelector('#project-plot'));
        document.addEventListener('axion-theme', () => {
            if (currentResult)
                render();
        });
        render();
    }
    function buildSection() {
        root.innerHTML = `<div class="solid-layout"><div><canvas id="model-canvas" class="model-view" aria-label="Rotatable cube and cross-section"></canvas>${cameraButtons}<p class="workspace-caption">Rotate the cube to inspect the cutting plane. Select P1, P2 or P3 and click an edge to place that point.</p></div><div><h3>Plane through three points</h3><div class="point-row"><span></span><span>x</span><span>y</span><span>z</span></div><div id="plane-inputs"></div><div class="model-toolbar"><button class="btn" id="apply-plane">Apply coordinates</button><label>Place <select id="plane-pick"><option value="0">P1</option><option value="1">P2</option><option value="2">P3</option></select></label></div><div class="model-toolbar"><label>Area you calculated <input id="section-area" type="number" step="any"></label></div><p class="workspace-caption">Square units, rounded to two decimals.</p><div id="plane-equation" class="workspace-caption"></div></div></div><div id="metrics"></div><div id="section-sides" class="workspace-caption"></div><p id="model-error" class="feedback" role="status"></p>`;
        createView();
        const inputs = root.querySelector('#plane-inputs'), answer = root.querySelector('#section-area');
        answer.value = model.area;
        function writePoints() {
            inputs.innerHTML = model.points.map((p, i) => `<div class="point-row"><b>P${i + 1}</b>${p.map((v, j) => `<input aria-label="P${i + 1} ${['x', 'y', 'z'][j]}" type="number" min="-1" max="1" step="any" data-p="${i}" data-axis="${j}" value="${Number.isFinite(v) ? fmt(v, 5) : ''}">`).join('')}</div>`).join('');
        }
        function render() {
            try {
                currentResult = M.section(model.points);
                const m = currentResult;
                view.set(AxionSolid.cubeScene(m, model.points));
                root.querySelector('#metrics').innerHTML = metrics([['Vertices', String(m.polygon.length)], ['Regular hexagon', m.regular ? 'Yes' : 'No']]);
                root.querySelector('#section-sides').textContent = 'Side lengths: ' + m.sides.map(v => fmt(v, 4)).join(', ');
                root.querySelector('#plane-equation').textContent = `Plane: ${m.normal.map((v, i) => `${fmt(v, 4)} ${['x', 'y', 'z'][i]}`).join(' + ')} = ${fmt(m.offset, 4)}`;
                root.querySelector('#model-error').textContent = '';
            }
            catch (e) {
                currentResult = null;
                view.set(AxionSolid.cubeScene({ polygon: [] }, []));
                root.querySelector('#metrics').innerHTML = '';
                root.querySelector('#section-sides').textContent = '';
                root.querySelector('#plane-equation').textContent = '';
                root.querySelector('#model-error').textContent = e.message;
                const chart = root.querySelector('#project-plot');
                if (chart)
                    chart.getContext('2d').clearRect(0, 0, chart.width, chart.height);
            }
        }
        function apply() {
            model.points = [0, 1, 2].map(i => [0, 1, 2].map(j => {
                const el = inputs.querySelector(`[data-p="${i}"][data-axis="${j}"]`);
                return el.value === '' ? null : Number(el.value);
            }));
            model.area = '';
            answer.value = '';
            changed();
            render();
        }
        root.querySelector('#apply-plane').addEventListener('click', apply);
        inputs.addEventListener('input', () => {
            currentResult = null;
            root.querySelector('#model-error').textContent = 'Apply coordinates to update the plane.';
        });
        answer.addEventListener('input', () => {
            model.area = answer.value;
            changed();
        });
        view.onClick = (x, y) => {
            const p = view.pickEdge(M.edges, x, y);
            if (!p)
                return;
            const i = Number(root.querySelector('#plane-pick').value);
            model.points[i] = p.map(v => Math.round(v * 10000) / 10000);
            model.area = '';
            answer.value = '';
            writePoints();
            changed();
            render();
        };
        writePoints();
        render();
    }
    function mount() {
        if (project.type === 'geometry')
            geom = new GeometryWorkspace(root, id, model, next => {
                model = next;
                changed();
            });
        else if (id === 'container')
            buildVessel();
        else if (id === 'box')
            buildBox();
        else
            buildSection();
    }
    function renderTrials() {
        const el = document.getElementById('trial-table');
        if (!el)
            return;
        el.innerHTML = trials.length ? `<table><thead><tr><th>Model</th><th>${id === 'section' ? 'Shape' : 'Volume'}</th><th></th></tr></thead><tbody>${trials.map((t, i) => `<tr><td>${escapeText(t.label)}</td><td>${escapeText(t.value)}</td><td><button data-trial="${i}">Open</button></td></tr>`).join('')}</tbody></table>` : '<p class="workspace-caption">No recorded trials.</p>';
        el.querySelectorAll('[data-trial]').forEach(b => b.addEventListener('click', () => loadModel(trials[Number(b.dataset.trial)].model)));
    }
    function loadModel(next) {
        model = structuredClone(next);
        currentResult = null;
        root.innerHTML = '';
        mount();
        changed();
    }
    document.getElementById('record-trial')?.addEventListener(
        'click',
        () => {
            if (!currentResult) {
                status.textContent = 'Build a valid model first.';
                return;
            }
            const label = id === 'container' ? model.formula : id === 'box' ? 'Cut ' + fmt(currentResult.cut, 4) + ' cm' : currentResult.polygon.length + ' vertices';
            const value = id === 'section' ? currentResult.polygon.length + ' sides' : fmt(currentResult.volume, 3) + (id === 'container' ? ' mL' : ' cm³');
            trials.unshift({ model: structuredClone(model), label, value });
            trials = trials.slice(0, 12);
            saveDraft();
            renderTrials();
        });
    document.getElementById('clear-trials')?.addEventListener('click', () => {
        trials = [];
        saveDraft();
        renderTrials();
    });
    function showResult(r) {
        criteria.innerHTML = r.criteria.map(c => `<div class="criterion-row ${c.pass ? 'pass' : ''}"><span>${c.pass ? '✓' : '×'}</span><div><b>${escapeText(c.label)}</b><small>${escapeText(c.detail)}</small></div></div>`).join('');
        Axion.fb(status, r.correct ? 'All requirements met. Solution saved.' : 'Solution saved. Some requirements are not met.', r.correct ? 'ok' : 'bad');
    }
    async function loadSaved() {
        const el = document.getElementById('saved-projects');
        try {
            const rows = await Axion.api('/projects/status');
            savedRows = rows.filter(r => r.project === id).reverse();
            el.innerHTML = savedRows.length ? savedRows.slice(0, 8).map((r, i) => `<p><button class="tool-button" data-saved="${i}">${r.correct ? 'Completed' : 'Attempt'} · ${new Date(r.at).toLocaleDateString()}</button></p>`).join('') : 'No submitted solutions.';
            el.querySelectorAll('[data-saved]').forEach(b => b.addEventListener(
                'click',
                () => {
                    const r = savedRows[Number(b.dataset.saved)];
                    loadModel(r.model);
                    noteEl.value = r.note;
                    saveDraft();
                    showResult(r);
                }));
        }
        catch (e) {
            el.textContent = 'Could not load saved solutions: ' + e.message;
        }
    }
    document.getElementById('submit-project').addEventListener(
        'click',
        async (e) => {
            if (project.type === 'solid' && !currentResult) {
                Axion.fb(status, 'Build a valid model before submitting.', 'bad');
                return;
            }
            const b = e.currentTarget;
            b.disabled = true;
            try {
                const sent = JSON.stringify(model);
                const r = await Axion.api('/projects/check', { method: 'POST', body: JSON.stringify({ id, model, note: noteEl.value }) });
                if (sent === JSON.stringify(model))
                    showResult(r);
                await loadSaved();
            }
            catch (e) {
                Axion.fb(status, e.message, 'bad');
            }
            finally {
                b.disabled = false;
            }
        });
    mount();
    renderTrials();
    saveDraft();
    loadSaved();
}
