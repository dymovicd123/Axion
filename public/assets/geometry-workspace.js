(function () {
    const M = ProjectMath;
    const tools = [
        ['point', 'Point'],
        ['line', 'Line'],
        ['segment', 'Segment'],
        ['circle', 'Circle'],
        ['midpoint', 'Midpoint'],
        ['bisector', 'Perpendicular bisector'],
        ['intersection', 'Intersection'],
        ['reflect', 'Reflect'],
        ['measure', 'Measure']
    ];
    const instructions = {
        point: 'Click the grid or enter coordinates.',
        line: 'Select two points.',
        segment: 'Select two points.',
        circle: 'Select the center, then a point on the circle.',
        midpoint: 'Select two points.',
        bisector: 'Select two points.',
        intersection: 'Select two lines or circles.',
        reflect: 'Select a point, then a line.',
        measure: 'Select two points to measure their distance.'
    };
    class GeometryWorkspace {
        constructor(root, id, model, onChange) {
            this.root = root;
            this.id = id;
            this.onChange = onChange;
            this.objects = [...M.given(id), ...(model?.objects || []).filter(o => !o.fixed)];
            this.history = [];
            this.selected = [];
            this.tool = 'point';
            this.serial = 1;
            this.measurements = [];
            root.innerHTML = `<div class="geometry-toolbar" role="group" aria-label="Construction tools">${tools.map(([id, name]) => `<button type="button" class="tool-button" data-tool="${id}">${name}</button>`).join('')}</div>
                <div class="workspace-caption" id="geo-instruction"></div>
                <div class="geo-layout"><canvas id="geometry-canvas" class="geometry-canvas" aria-label="Coordinate construction canvas"></canvas><div class="object-panel"><h3>Objects</h3><div id="object-list"></div></div></div>
                <div class="construction-controls"><label>X <input type="number" id="point-x" step="any" value="0"></label><label>Y <input type="number" id="point-y" step="any" value="0"></label><button type="button" class="btn ghost" id="add-point">Add point</button><button type="button" class="btn ghost" id="geo-undo">Undo</button><button type="button" class="btn ghost" id="geo-delete">Delete last</button><button type="button" class="btn ghost" id="geo-reset">Reset construction</button></div>
                <div id="geo-measurements" class="measurement-log"></div><p class="feedback" id="geo-message" role="status"></p>`;
            this.canvas = root.querySelector('canvas');
            this.ctx = this.canvas.getContext('2d');
            root.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => this.setTool(b.dataset.tool)));
            root.querySelector('#add-point').addEventListener(
                'click',
                () => {
                    const inputs = ['point-x', 'point-y'].map(k => root.querySelector('#' + k));
                    if (inputs.some(i => i.value.trim() === ''))
                        return this.message('Enter both coordinates.');
                    const p = inputs.map(i => Number(i.value));
                    if (p.some(v => !Number.isFinite(v) || Math.abs(v) > 100))
                        return this.message('Coordinates must be between −100 and 100.');
                    this.add([M.point(this.nextId('P'), p)]);
                });
            root.querySelector('#geo-undo').addEventListener(
                'click',
                () => {
                    if (this.history.length) {
                        this.objects = this.history.pop();
                        this.selected = [];
                        this.changed();
                    }
                });
            root.querySelector('#geo-delete').addEventListener(
                'click',
                () => {
                    const last = this.objects.findLastIndex(o => !o.fixed);
                    if (last >= 0) {
                        this.snapshot();
                        this.objects.splice(last, 1);
                        this.selected = [];
                        this.changed();
                    }
                });
            root.querySelector('#geo-reset').addEventListener(
                'click',
                () => {
                    if (confirm('Reset this construction?')) {
                        this.snapshot();
                        this.objects = M.given(id);
                        this.measurements = [];
                        this.selected = [];
                        this.changed();
                    }
                });
            root.querySelector('#object-list').addEventListener(
                'click',
                e => {
                    const b = e.target.closest('[data-object]');
                    if (b) {
                        const obj = this.objects.find(o => o.id === b.dataset.object);
                        if (obj)
                            this.choose(obj);
                    }
                });
            this.canvas.addEventListener('click', e => this.click(e));
            new ResizeObserver(() => this.draw()).observe(this.canvas);
            document.addEventListener('axion-theme', () => this.draw());
            this.setTool('point');
            this.changed(false);
        }
        nextId(prefix) {
            let id;
            do {
                id = prefix + this.serial++;
            } while (this.objects.some(o => o.id === id));
            return id;
        }
        message(text) {
            this.root.querySelector('#geo-message').textContent = text;
        }
        setTool(tool) {
            this.tool = tool;
            this.selected = [];
            this.message('');
            this.root.querySelectorAll('[data-tool]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tool === tool)));
            this.root.querySelector('#geo-instruction').textContent = instructions[tool];
            this.draw();
            this.list();
        }
        snapshot() {
            this.history.push(structuredClone(this.objects));
            if (this.history.length > 50)
                this.history.shift();
        }
        add(items) {
            if (this.objects.length + items.length > 100)
                return this.message('Construction is limited to 100 objects.');
            this.snapshot();
            this.objects.push(...items);
            this.selected = [];
            this.message('');
            this.changed();
        }
        model() {
            return { objects: this.objects.filter(o => !o.fixed) };
        }
        changed(notify = true) {
            this.list();
            this.draw();
            this.root.querySelector('#geo-undo').disabled = !this.history.length;
            this.root.querySelector('#geo-delete').disabled = !this.objects.some(o => !o.fixed);
            this.root.querySelector('#geo-measurements').textContent = this.measurements.slice(-4).join('  ·  ');
            if (notify)
                this.onChange(this.model());
        }
        list() {
            this.root.querySelector('#object-list').innerHTML = this.objects.map(o => `<button type="button" class="object-button ${this.selected.includes(o) ? 'selected' : ''}" data-object="${Axion.escape(o.id)}"><b>${Axion.escape(o.id)}</b><span>${o.type === 'point' ? o.p.map(x => Number(x.toFixed(3))).join(', ') : o.type === 'circle' ? 'Circle · r=' + o.r.toFixed(3) : o.type === 'segment' ? 'Length ' + M.distance(o.a, o.b).toFixed(3) : 'Line'}</span></button>`).join('');
        }
        expected() {
            if (this.tool === 'intersection')
                return 'curve';
            if (this.tool === 'reflect' && this.selected.length === 1)
                return 'line';
            return 'point';
        }
        choose(o) {
            if (this.tool === 'point') {
                if (o.type === 'point')
                    this.message(`${o.id} = (${o.p.map(x => x.toFixed(3)).join(', ')})`);
                return;
            }
            const type = this.expected();
            if (type === 'point' && o.type !== 'point' || type === 'curve' && o.type === 'point' || type === 'line' && !['line', 'segment'].includes(o.type))
                return this.message('Select a ' + type + '.');
            if (this.selected.includes(o))
                return this.message('Select a different object.');
            this.selected.push(o);
            this.message('');
            this.list();
            this.draw();
            if (this.selected.length < 2)
                return;
            const [a, b] = this.selected;
            let created = [];
            try {
                if (this.tool === 'intersection') {
                    created = M.intersect(a, b).filter(p => p.every(v => Math.abs(v) <= 100)).map(p => M.point(this.nextId('P'), p));
                    if (!created.length)
                        throw Error('No unique intersection in the supported range.');
                }
                else if (this.tool === 'reflect')
                    created = [M.point(this.nextId('P'), M.reflect(a.p, b.a, b.b))];
                else {
                    if (M.distance(a.p, b.p) < 1e-7)
                        throw Error('The points must be different.');
                    if (this.tool === 'line' || this.tool === 'segment')
                        created = [{ id: this.nextId(this.tool === 'line' ? 'L' : 'S'), type: this.tool, a: a.p, b: b.p }];
                    if (this.tool === 'circle')
                        created = [M.circle(this.nextId('C'), a.p, M.distance(a.p, b.p))];
                    if (this.tool === 'midpoint')
                        created = [M.point(this.nextId('P'), M.scale(M.add(a.p, b.p), .5))];
                    if (this.tool === 'bisector') {
                        const mid = M.scale(M.add(a.p, b.p), .5), v = M.unit(M.sub(b.p, a.p));
                        created = [M.line(this.nextId('L'), mid, M.add(mid, [-v[1], v[0]]))];
                    }
                    if (this.tool === 'measure')
                        this.measurements.push(`${a.id}${b.id} = ${M.distance(a.p, b.p).toFixed(4)}`);
                }
                if (created.some(o => o.type === 'point' && o.p.some(v => Math.abs(v) > 100)))
                    throw Error('Constructed point is outside the supported range.');
                if (created.length)
                    this.add(created);
                else {
                    this.selected = [];
                    this.changed(false);
                }
            }
            catch (e) {
                this.selected = [];
                this.message(e.message);
                this.list();
                this.draw();
            }
        }
        project(p) {
            return [this.w / 2 + p[0] * this.scale, this.h / 2 - p[1] * this.scale];
        }
        unproject(p) {
            return [(p[0] - this.w / 2) / this.scale, (this.h / 2 - p[1]) / this.scale];
        }
        click(e) {
            const rect = this.canvas.getBoundingClientRect(),
                p = [e.clientX - rect.left, e.clientY - rect.top],
                world = this.unproject(p),
                expected = this.expected();
            const candidates = this.objects.filter(o => this.tool === 'point' || expected === 'point' ? o.type === 'point' : expected === 'curve' ? o.type !== 'point' : ['line', 'segment'].includes(o.type));
            let closest = null, best = 13;
            for (const o of candidates) {
                let d;
                if (o.type === 'point')
                    d = M.distance(p, this.project(o.p));
                else if (o.type === 'circle')
                    d = Math.abs(M.distance(world, o.c) - o.r) * this.scale;
                else {
                    const v = M.sub(o.b, o.a), t = M.dot(M.sub(world, o.a), v) / M.dot(v, v);
                    d = M.distance(world, M.add(o.a, M.scale(v, o.type === 'segment' ? M.clamp(t, 0, 1) : t))) * this.scale;
                }
                if (d < best) {
                    best = d;
                    closest = o;
                }
            }
            if (closest)
                return this.choose(closest);
            if (this.tool === 'point') {
                const snapped = world.map(v => Math.round(v * 10) / 10);
                this.add([M.point(this.nextId('P'), snapped)]);
            }
            else
                this.message('Select an existing object on the grid or in the list.');
        }
        draw() {
            const c = this.canvas, ctx = this.ctx;
            this.w = c.clientWidth;
            this.h = c.clientHeight;
            if (!this.w || !this.h)
                return;
            this.scale = Math.min(this.w / 13, this.h / 10);
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            c.width = this.w * dpr;
            c.height = this.h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const theme = getComputedStyle(document.documentElement),
                ink = theme.getPropertyValue('--ink'),
                grid = theme.getPropertyValue('--line'),
                bg = theme.getPropertyValue('--surface');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, this.w, this.h);
            ctx.font = '11px system-ui';
            const draw = (a, b, color, width = 1, dash = []) => {
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = width;
                ctx.setLineDash(dash);
                ctx.moveTo(...this.project(a));
                ctx.lineTo(...this.project(b));
                ctx.stroke();
                ctx.setLineDash([]);
            };
            const xmax = Math.ceil(this.w / 2 / this.scale), ymax = Math.ceil(this.h / 2 / this.scale);
            for (let x = -xmax; x <= xmax; x++) {
                draw([x, -ymax], [x, ymax], x === 0 ? '#8597a6' : grid);
                if (x) {
                    ctx.fillStyle = ink;
                    ctx.fillText(String(x), this.project([x, 0])[0] + 3, this.h / 2 + 14);
                }
            }
            for (let y = -ymax; y <= ymax; y++) {
                draw([-xmax, y], [xmax, y], y === 0 ? '#8597a6' : grid);
                if (y) {
                    ctx.fillStyle = ink;
                    ctx.fillText(String(y), this.w / 2 + 4, this.project([0, y])[1] - 3);
                }
            }
            for (const o of this.objects.filter(o => o.type !== 'point')) {
                const color = this.selected.includes(o) ? '#d48b36' : o.fixed ? '#8195a5' : o.type === 'circle' ? '#418a86' : '#457fa6';
                if (o.type === 'circle') {
                    ctx.beginPath();
                    ctx.arc(...this.project(o.c), o.r * this.scale, 0, Math.PI * 2);
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                else {
                    let a = o.a, b = o.b;
                    if (o.type === 'line') {
                        const v = M.unit(M.sub(b, a));
                        a = M.sub(a, M.scale(v, 250));
                        b = M.add(b, M.scale(v, 250));
                    }
                    draw(a, b, color, o.type === 'segment' ? 3 : 1.8, o.id === 'Boundary' ? [6, 4] : []);
                }
            }
            for (const o of this.objects.filter(o => o.type === 'point')) {
                const p = this.project(o.p);
                ctx.fillStyle = this.selected.includes(o) ? '#d48b36' : o.fixed ? '#b15c42' : '#2d7eaa';
                ctx.beginPath();
                ctx.arc(...p, 4.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.font = 'bold 12px system-ui';
                ctx.fillStyle = ink;
                ctx.fillText(o.id, p[0] + 7, p[1] - 7);
            }
        }
    }
    window.GeometryWorkspace = GeometryWorkspace;
})();
