(function () {
    const $ = (root, selector) => root.querySelector(selector);
    const fmt = n => Number.isFinite(n) ? String(Number(n.toPrecision(8))) : 'undefined';
    const number = raw => {
        const text = String(raw ?? '').trim().replace(/−/g, '-').replace(',', '.');
        if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text))
            return Number(text);
        const pair = text.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
        return pair && Number(pair[2]) !== 0 ? Number(pair[1]) / Number(pair[2]) : NaN;
    };
    function chart(root, config) {
        const { xmin = -4, xmax = 6, ymin = -4, ymax = 8, curves = [], points = [], lines = [], band, interval } = config;
        const W = 640, H = 310, l = 44, r = 16, t = 18, b = 30;
        const X = x => l + (x - xmin) / (xmax - xmin) * (W - l - r);
        const Y = y => H - b - (y - ymin) / (ymax - ymin) * (H - t - b);
        const elements = [];
        const clip = 'limits-' + (root.dataset.chartId ||= String(chart.count++));
        const ln = (x1, y1, x2, y2, style = '') => `<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" ${style}/>`;
        if (band)
            elements.push(`<rect x="${l}" y="${Y(band[1])}" width="${W - l - r}" height="${Y(band[0]) - Y(band[1])}" fill="var(--good)" opacity=".13"/>`);
        if (interval)
            elements.push(`<rect x="${X(interval[0])}" y="${t}" width="${X(interval[1]) - X(interval[0])}" height="${H - t - b}" fill="var(--accent)" opacity=".15"/>`);
        const stepX = (xmax - xmin) < 1 ? .05 : (xmax - xmin) <= 12 ? 1 : (xmax - xmin) <= 30 ? 2 : 10;
        const stepY = (ymax - ymin) < 2 ? .2 : (ymax - ymin) <= 15 ? 1 : (ymax - ymin) <= 30 ? 2 : 5;
        const labels = [];
        for (let x = Math.ceil(xmin / stepX) * stepX; x <= xmax + 1e-9; x += stepX) {
            elements.push(ln(x, ymin, x, ymax, 'stroke="var(--grid)"'));
            labels.push(`<text x="${X(x)}" y="${H - 9}" text-anchor="middle">${fmt(x)}</text>`);
        }
        for (let y = Math.ceil(ymin / stepY) * stepY; y <= ymax + 1e-9; y += stepY) {
            elements.push(ln(xmin, y, xmax, y, 'stroke="var(--grid)"'));
            labels.push(`<text x="${l - 6}" y="${Y(y) + 4}" text-anchor="end">${fmt(y)}</text>`);
        }
        if (xmin <= 0 && xmax >= 0)
            elements.push(ln(0, ymin, 0, ymax, 'stroke="var(--axis)"'));
        if (ymin <= 0 && ymax >= 0)
            elements.push(ln(xmin, 0, xmax, 0, 'stroke="var(--axis)"'));
        for (const line of lines)
            elements.push(line.axis === 'x' ? ln(line.value, ymin, line.value, ymax, 'stroke="var(--axis)" stroke-dasharray="5 5" stroke-width="2"') : ln(xmin, line.value, xmax, line.value, 'stroke="var(--axis)" stroke-dasharray="5 5" stroke-width="2"'));
        for (const curve of curves) {
            let d = '', previous = null;
            const lo = Math.max(xmin, curve.lo ?? xmin), hi = Math.min(xmax, curve.hi ?? xmax);
            if (hi <= lo)
                continue;
            for (let i = 0; i <= 320; i++) {
                const x = lo + (hi - lo) * i / 320, y = curve.fn(x);
                if (!Number.isFinite(y) || Math.abs(y - ymin) > (ymax - ymin) * 30) {
                    previous = null;
                    continue;
                }
                const px = X(x), py = Y(y);
                d += `${previous === null || Math.abs(py - previous) > H * 2 ? 'M' : 'L'}${px.toFixed(2)} ${py.toFixed(2)} `;
                previous = py;
            }
            elements.push(`<path d="${d}" fill="none" stroke="${curve.color || 'var(--accent)'}" stroke-width="2.7" stroke-linecap="round"/>`);
        }
        for (const point of points) {
            if (!Number.isFinite(point.x) || !Number.isFinite(point.y))
                continue;
            elements.push(`<circle cx="${X(point.x)}" cy="${Y(point.y)}" r="${point.open ? 5.5 : 4.5}" fill="${point.open ? 'var(--paper)' : point.color || 'var(--accent)'}" stroke="${point.color || 'var(--accent)'}" stroke-width="2"/>`);
        }
        root._coordinates = { xmin, xmax, ymin, ymax, l, r, t, b, W, H };
        root.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${config.label || 'Function graph'}"><defs><clipPath id="${clip}"><rect x="${l}" y="${t}" width="${W - l - r}" height="${H - t - b}"/></clipPath></defs><g clip-path="url(#${clip})">${elements.join('')}</g>${labels.join('')}<text x="${W - 9}" y="${H - 24}" text-anchor="end">x</text><text x="15" y="15">y</text></svg>`;
    }
    chart.count = 0;
    function output(root, text) {
        $(root, '.reading').textContent = text;
    }
    function setup(root, html) {
        root.innerHTML = html;
    }
    function probe(root) {
        setup(
            root,
            `<h4 class="instrument-title">Measurement table</h4><div class="activity-controls">
            <label>Input x (1 to 3)<input data-probe-input value="1.9" inputmode="decimal"></label>
            <button type="button" class="secondary" data-read>Measure f(x)</button>
            <button type="button" class="secondary" data-closer>10× closer to 2</button>
            <button type="button" class="secondary" data-clear>Clear table</button>
        </div>
        <div class="probe-shortcuts"><span>Sample input:</span><button type="button" data-sample="1.9">Left: 1.9</button><button type="button" data-sample="2.1">Right: 2.1</button><button type="button" data-sample="2">At 2</button></div><p class="reading" aria-live="polite">No readings yet.</p>
        <p class="small" data-evidence aria-live="polite">Collect readings on both sides of 2, and one at 2 itself.</p>
        <div class="measurements"><table class="lesson-table"><thead><tr><th>Side</th><th>x</th><th>f(x)</th><th>Distance from 2</th></tr></thead><tbody></tbody></table></div>`);
        root.classList.add('measurement-workspace');
        const rows = [];
        const tbody = $(root, 'tbody');
        const input = $(root, '[data-probe-input]');
        function render() {
            const ordered = [...rows].sort((a, b) => a.x - b.x);
            tbody.replaceChildren(...ordered.map(({ x, y }) => {
                const tr = document.createElement('tr');
                const side = x < 2 ? 'Left' : x > 2 ? 'Right' : 'At 2';
                if (x === 2)
                    tr.className = 'target-reading';
                for (const v of [side, String(x), fmt(y), fmt(Math.abs(x - 2))]) {
                    const td = document.createElement('td');
                    td.textContent = v;
                    tr.append(td);
                }
                return tr;
            }));
            const left = rows.filter(r => r.x < 2).length;
            const right = rows.filter(r => r.x > 2).length;
            const target = rows.some(r => r.x === 2);
            $(root, '[data-evidence]').textContent = `Readings: ${left} left · ${right} right · ${target ? 'value at 2 measured' : 'value at 2 not measured'}. ` +
                (left < 2 || right < 2 ? 'Try at least two different distances on each side.' : target ? 'Compare the closest readings on both sides with the reading at 2.' : 'Now measure the function at exactly 2.');
        }
        function read() {
            const x = number(input.value);
            if (!Number.isFinite(x) || x < 1 || x > 3) {
                output(root, 'Enter an input between 1 and 3.');
                return;
            }
            const y = x === 2 ? 9 : 4 + (x - 2) ** 2 + (x - 2) / 2;
            if (!rows.some(r => r.x === x)) {
                rows.unshift({ x, y });
                if (rows.length > 40)
                    rows.pop();
            }
            render();
            output(root, `f(${x}) = ${fmt(y)}`);
        }
        $(root, '[data-read]').addEventListener('click', read);
        root.querySelectorAll('[data-sample]').forEach(button => button.addEventListener('click', () => {
            input.value = button.dataset.sample;
            read();
        }));
        $(root, '[data-closer]').addEventListener(
            'click',
            () => {
                const x = number(input.value);
                if (!Number.isFinite(x) || x < 1 || x > 3 || x === 2 || Math.abs(x - 2) < 1e-7) {
                    output(root, 'Enter a value on either side of 2 before moving closer.');
                    return;
                }
                input.value = String(Number((2 + (x - 2) / 10).toFixed(10)));
                read();
            });
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                read();
            }
        });
        $(root, '[data-clear]').addEventListener('click', () => {
            rows.length = 0;
            render();
            output(root, 'No readings yet.');
        });
    }
    function holes(root, repair = false) {
        setup(
            root,
            `<div class="activity-controls">${(repair ? ['Missing point', 'Wrong value', 'Continuous'] : ['Undefined at 2', 'Assigned 7 at 2', 'Assigned 4 at 2']).map((s, i) => `<button type="button" class="secondary" data-value="${i}">${s}</button>`).join('')}</div><div class="graph"></div><p class="reading" aria-live="polite"></p>`);
        function draw(i) {
            const y = [NaN, 7, 4][i];
            chart(
                $(root, '.graph'),
                {
                    curves: [{ fn: x => x + 2 }],
                    points: [{ x: 2, y: 4, open: i !== 2 }, ...(i === 0 ? [] : [{ x: 2, y }])],
                    lines: [{ axis: 'x', value: 2 }],
                    label: 'Graph of x plus two with an independent function value at x equals two'
                });
            output(root, `Limit at 2: 4. f(2): ${fmt(y)}. ${i === 2 ? 'Continuous at 2.' : 'Not continuous at 2.'}`);
            root.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.value === i)));
        }
        root.querySelectorAll('button').forEach(b => b.addEventListener('click', () => draw(+b.dataset.value)));
        draw(0);
    }
    function jump(root) {
        setup(
            root,
            `<div class="activity-controls"><label>Distance from x = 1<input value="0.2" inputmode="decimal"></label><button type="button" class="secondary" data-update>Compare</button></div><div class="graph"></div><p class="reading" aria-live="polite"></p>`);
        function draw() {
            const d = number($(root, 'input').value);
            if (!(d > 0 && d <= 3)) {
                output(root, 'Choose a distance greater than 0 and at most 3.');
                return;
            }
            chart(
                $(root, '.graph'),
                {
                    curves: [{ fn: x => 2 * x + 1, hi: 1 }, { fn: x => x - 1, lo: 1, color: 'var(--good)' }],
                    points: [{ x: 1, y: 3, open: true }, { x: 1, y: 0, open: true, color: 'var(--good)' }, { x: 1 - d, y: 3 - 2 * d }, { x: 1 + d, y: d, color: 'var(--good)' }],
                    lines: [{ axis: 'x', value: 1 }]
                });
            output(root, `At x = ${fmt(1 - d)}: ${fmt(3 - 2 * d)}. At x = ${fmt(1 + d)}: ${fmt(d)}. The difference is ${fmt(Math.abs(3 - 3 * d))}.`);
        }
        $(root, '[data-update]').addEventListener('click', draw);
        draw();
    }
    function formModel(root, kind) {
        const drawing = kind === 'construct' ? '<div class="activity-controls"><button type="button" class="secondary" data-draw="left">Draw left branch</button><button type="button" class="secondary" data-draw="right">Draw right branch</button><button type="button" class="secondary" data-draw="point">Set f(1)</button><button type="button" class="secondary" data-draw="stop">Cancel drawing</button></div><p class="small" data-draw-status>Enter coefficients, or draw each branch using two grid points.</p>' : '';
        setup(root, drawing + '<div class="graph"></div><p class="reading" aria-live="polite"></p><ul class="model-conditions" aria-label="Model requirements"></ul>');
        const form = root.closest('form');
        const read = key => number(form.elements.namedItem(key).value);
        const graph = $(root, '.graph');
        const fields = form.querySelector('.fields');
        const editor = document.createElement('div');
        editor.className = 'model-editor';
        const title = document.createElement('h4');
        title.textContent = kind === 'construct' ? 'Equation editor' : kind === 'precision' ? 'Input radius' : 'Function parameters';
        editor.append(title);
        const formula = form.querySelector('.model-formula');
        if (formula)
            editor.append(formula);
        editor.append(fields);
        root.prepend(editor);
        if (kind === 'construct') {
            const groups = [['Left branch (x < 1)', ['m1', 'b1']], ['Right branch (x > 1)', ['m2', 'b2']], ['Value at x = 1', ['value']]];
            for (const [heading, keys] of groups) {
                const group = document.createElement('fieldset');
                group.className = 'branch-fields';
                const legend = document.createElement('legend');
                legend.textContent = heading;
                group.append(legend);
                for (const key of keys)
                    group.append(form.elements.namedItem(key).closest('label'));
                fields.append(group);
            }
        }
        const preview = document.createElement('div');
        preview.className = 'model-preview';
        const previewTitle = document.createElement('h4');
        previewTitle.textContent = 'Graph and measurements';
        preview.append(previewTitle, graph, $(root, '.reading'));
        root.append(preview);
        const requirements = document.createElement('div');
        requirements.className = 'requirements-panel';
        const reqTitle = document.createElement('h4');
        reqTitle.textContent = 'Requirements';
        requirements.append(reqTitle, $(root, '.model-conditions'));
        root.append(requirements);
        root.classList.add('model-workspace');
        root.dataset.modelKind = kind;
        function conditions(items) {
            const list = $(root, '.model-conditions');
            list.replaceChildren(...items.map(([text, passed]) => {
                const li = document.createElement('li');
                li.dataset.state = passed == null ? 'pending' : passed ? 'met' : 'unmet';
                li.textContent = (passed == null ? 'Not set: ' : passed ? 'Met: ' : 'Not met: ') + text;
                return li;
            }));
        }
        const near = (x, y) => Math.abs(x - y) < 1e-8;
        let mode = null, first = null;
        function set(key, value) {
            const input = form.elements.namedItem(key);
            input.value = fmt(value);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (kind === 'construct') {
            graph.classList.add('interactive-graph');
            graph.tabIndex = 0;
            graph.setAttribute('aria-label', 'Piecewise construction graph. Use the coefficient fields for keyboard entry.');
            const status = $(root, '[data-draw-status]');
            root.querySelectorAll('[data-draw]').forEach(button => button.addEventListener(
                'click',
                () => {
                    mode = button.dataset.draw === 'stop' ? null : button.dataset.draw;
                    first = null;
                    root.querySelectorAll('[data-draw]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.draw === mode)));
                    status.textContent = mode === 'point' ? 'Click a height to set the value at x = 1.' : mode ? 'Click two different grid points on the ' + mode + ' side of x = 1.' : 'Drawing cancelled. Coefficients can still be edited.';
                }));
            graph.addEventListener(
                'click',
                event => {
                    if (!mode)
                        return;
                    const svg = graph.querySelector('svg');
                    const c = graph._coordinates;
                    if (!svg || !c)
                        return;
                    const point = svg.createSVGPoint();
                    point.x = event.clientX;
                    point.y = event.clientY;
                    const pos = point.matrixTransform(svg.getScreenCTM().inverse());
                    if (pos.x < c.l || pos.x > c.W - c.r || pos.y < c.t || pos.y > c.H - c.b)
                        return;
                    const x = Math.round(c.xmin + (pos.x - c.l) / (c.W - c.l - c.r) * (c.xmax - c.xmin));
                    const y = Math.round(c.ymax - (pos.y - c.t) / (c.H - c.t - c.b) * (c.ymax - c.ymin));
                    if (mode === 'point') {
                        set('value', y);
                        status.textContent = `Assigned f(1) = ${y}.`;
                        return;
                    }
                    if ((mode === 'left' && x >= 1) || (mode === 'right' && x <= 1)) {
                        status.textContent = 'Choose a point strictly on the ' + mode + ' side.';
                        return;
                    }
                    if (!first) {
                        first = { x, y };
                        status.textContent = `First point: (${x}, ${y}). Choose a second point with a different x.`;
                        draw();
                        return;
                    }
                    if (x === first.x) {
                        status.textContent = 'The second point must have a different x-coordinate.';
                        return;
                    }
                    const m = (y - first.y) / (x - first.x), b = first.y - m * first.x;
                    const suffix = mode === 'left' ? '1' : '2';
                    const exact = (n, d) => {
                        if (d < 0) {
                            n = -n;
                            d = -d;
                        }
                        let a = Math.abs(n), b = d;
                        while (b) {
                            const r = a % b;
                            a = b;
                            b = r;
                        }
                        n /= a;
                        d /= a;
                        return d === 1 ? String(n) : `${n}/${d}`;
                    };
                    const dx = x - first.x, dy = y - first.y;
                    form.elements.namedItem('m' + suffix).value = exact(dy, dx);
                    form.elements.namedItem('b' + suffix).value = exact(first.y * dx - dy * first.x, dx);
                    first = null;
                    form.elements.namedItem('b' + suffix).dispatchEvent(new Event('input', { bubbles: true }));
                    status.textContent = `Branch updated: slope ${fmt(m)}, intercept ${fmt(b)}. Draw again or edit the coefficients.`;
                });
        }
        function draw() {
            if (kind === 'precision') {
                const d = read('delta');
                const valid = d > 0 && d <= .1;
                chart(
                    $(root, '.graph'),
                    {
                        xmin: 1.89,
                        xmax: 2.11,
                        ymin: 3.5,
                        ymax: 4.5,
                        curves: [{ fn: x => x * x }],
                        band: [3.8, 4.2],
                        interval: valid ? [2 - d, 2 + d] : null,
                        lines: [{ axis: 'y', value: 4 }, { axis: 'x', value: 2 }],
                        points: valid ? [{ x: 2 - d, y: (2 - d) ** 2, open: true }, { x: 2 + d, y: (2 + d) ** 2, open: true }] : []
                    });
                conditions([
                    ['Radius is between 0.03 and 0.1', Number.isFinite(d) ? d >= .03 && d <= .1 : null],
                    ['All outputs stay in the required band', valid ? (2 - d) ** 2 >= 3.8 - 1e-12 && (2 + d) ** 2 <= 4.2 + 1e-12 : null]
                ]);
                output(
                    root,
                    valid ? `Endpoint output range: ${fmt((2 - d) ** 2)} to ${fmt((2 + d) ** 2)}. Largest absolute endpoint error: ${fmt(Math.max(4 - (2 - d) ** 2, (2 + d) ** 2 - 4))}.` : 'Enter an input radius greater than 0 and at most 0.1.');
            }
            else if (kind === 'construct') {
                const m1 = read('m1'), b1 = read('b1'), m2 = read('m2'), b2 = read('b2'), value = read('value');
                const left = Number.isFinite(m1) && Number.isFinite(b1) && Math.abs(m1) <= 10000 && Math.abs(b1) <= 10000;
                const right = Number.isFinite(m2) && Number.isFinite(b2) && Math.abs(m2) <= 10000 && Math.abs(b2) <= 10000;
                chart(
                    graph,
                    {
                        curves: [...(left ? [{ fn: x => m1 * x + b1, hi: 1 }] : []), ...(right ? [{ fn: x => m2 * x + b2, lo: 1, color: 'var(--good)' }] : [])],
                        points: [
                            ...(left ? [{ x: 1, y: m1 + b1, open: true }] : []),
                            ...(right ? [{ x: 1, y: m2 + b2, open: true, color: 'var(--good)' }] : []),
                            ...(Number.isFinite(value) ? [{ x: 1, y: value }] : []),
                            ...(first ? [{ ...first, color: 'var(--graph-secondary)' }] : [])
                        ],
                        lines: [{ axis: 'x', value: 1 }]
                    });
                output(root, `Left limit: ${left ? fmt(m1 + b1) : '—'}. Right limit: ${right ? fmt(m2 + b2) : '—'}. f(1): ${Number.isFinite(value) ? fmt(value) : '—'}.`);
                conditions([
                    ['Left branch approaches 2', left ? near(m1 + b1, 2) : null],
                    ['Right branch approaches −1', right ? near(m2 + b2, -1) : null],
                    ['Assigned point has height 4', Number.isFinite(value) ? near(value, 4) : null],
                    ['Both branches are nonconstant', left && right ? Math.abs(m1) > 1e-8 && Math.abs(m2) > 1e-8 : null]
                ]);
            }
            else {
                const A = read('A'), h = read('h'), k = read('k');
                if (![A, h, k].every(v => Number.isFinite(v) && Math.abs(v) <= 10000)) {
                    chart($(root, '.graph'), {});
                    output(root, 'Enter A, h and k to preview the curve.');
                    conditions([
                        ['Vertical asymptote x = −2', null],
                        ['Horizontal asymptote y = 3', null],
                        ['Right-hand limit +∞', null],
                        ['Height at x = 2 between 3.5 and 4.5', null]
                    ]);
                    return;
                }
                const fn = x => A / (x - h) + k;
                chart(
                    $(root, '.graph'),
                    {
                        xmin: -8,
                        xmax: 8,
                        ymin: -6,
                        ymax: 10,
                        curves: A === 0 ? [{ fn: x => k }] : [{ fn, hi: h }, { fn, lo: h }],
                        lines: A === 0 ? [] : [{ axis: 'x', value: h }, { axis: 'y', value: k }],
                        points: [{ x: 2, y: fn(2) }]
                    });
                output(root, A === 0 ? 'A = 0 does not produce a vertical asymptote.' : `f(2) = ${fmt(fn(2))}. Right-hand behaviour: ${A > 0 ? '+∞' : '−∞'}.`);
                conditions([
                    ['Vertical asymptote x = −2', A !== 0 && near(h, -2)],
                    ['Horizontal asymptote y = 3', near(k, 3)],
                    ['Right-hand limit +∞ at −2', A > 0 && near(h, -2)],
                    ['Height at x = 2 between 3.5 and 4.5', Number.isFinite(fn(2)) && fn(2) >= 3.5 && fn(2) <= 4.5]
                ]);
            }
        }
        form.addEventListener('input', draw);
        draw();
    }
    function vertical(root) {
        setup(
            root,
            '<div class="activity-controls"><button type="button" class="secondary" data-mode="odd">1/(x − 2)</button><button type="button" class="secondary" data-mode="even">1/(x − 2)²</button></div><div class="graph"></div><p class="reading"></p>');
        function draw(mode) {
            const fn = x => mode === 'odd' ? 1 / (x - 2) : 1 / (x - 2) ** 2;
            chart($(root, '.graph'), { xmin: -2, xmax: 6, ymin: -8, ymax: 8, curves: [{ fn, hi: 2 }, { fn, lo: 2 }], lines: [{ axis: 'x', value: 2 }, { axis: 'y', value: 0 }] });
            output(root, mode === 'odd' ? 'Left side tends to −∞; right side tends to +∞.' : 'Both sides tend to +∞.');
            root.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
        }
        root.querySelectorAll('button').forEach(b => b.addEventListener('click', () => draw(b.dataset.mode)));
        draw('odd');
    }
    function far(root) {
        setup(
            root,
            '<div class="activity-controls"><label>Positive input x<input value="10" inputmode="decimal"></label><button type="button" class="secondary" data-measure>Measure</button><button type="button" class="secondary" data-grow>Multiply x by 10</button></div><div class="graph"></div><p class="reading" aria-live="polite"></p>');
        function draw() {
            const x = number($(root, 'input').value);
            if (!(x >= 1 && x <= 1e9)) {
                output(root, 'Enter an input from 1 to 1,000,000,000.');
                return;
            }
            chart($(root, '.graph'), {
                xmin: 0,
                xmax: 100,
                ymin: 2,
                ymax: 6,
                curves: [{ fn: t => 3 + 2 / t, lo: 1 }],
                lines: [{ axis: 'y', value: 3 }],
                points: x <= 100 ? [{ x, y: 3 + 2 / x }] : []
            });
            output(root, `At x = ${fmt(x)}, f(x) = ${fmt(3 + 2 / x)}; absolute error = ${fmt(2 / x)}.${x > 100 ? ' This measurement is beyond the displayed graph.' : ''}`);
        }
        $(root, '[data-measure]').addEventListener('click', draw);
        $(root, '[data-grow]').addEventListener(
            'click',
            () => {
                const input = $(root, 'input');
                const x = number(input.value);
                if (x >= 1 && x <= 1e8)
                    input.value = String(x * 10);
                draw();
            });
        draw();
    }
    function steps(root) {
        setup(root, '<p class="small">Expression format: (x+1)(x-2) or (x+1)*(x-2). Keep x = 4 excluded from the original quotient.</p>');
        const form = root.closest('form');
        const fields = $(form, '.fields');
        fields.classList.add('algebra-steps');
        for (const key of ['factor', 'simplify', 'limit']) {
            const input = form.elements.namedItem(key);
            const label = input.closest('label');
            const row = document.createElement('div');
            row.className = 'step-row';
            label.before(row);
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'secondary';
            button.textContent = 'Check step';
            const message = document.createElement('p');
            message.className = 'feedback';
            message.setAttribute('role', 'status');
            row.append(label, button, message);
            input.addEventListener('input', () => {
                message.textContent = '';
                message.className = 'feedback';
            });
            button.addEventListener(
                'click',
                async () => {
                    if (!input.value.trim()) {
                        message.textContent = 'Enter your expression first.';
                        message.className = 'feedback bad';
                        return;
                    }
                    button.disabled = true;
                    try {
                        const response = await fetch('/api/course/limits-3/practice-step', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'steps', key, value: input.value }) });
                        const result = await response.json();
                        if (!response.ok)
                            throw Error(result.error || 'Request failed.');
                        message.textContent = result.message;
                        message.className = 'feedback ' + (result.correct ? 'good' : 'bad');
                    }
                    catch (error) {
                        message.textContent = error.message;
                        message.className = 'feedback bad';
                    }
                    finally {
                        button.disabled = false;
                    }
                });
        }
    }
    function bind() {
        for (const root of document.querySelectorAll('[data-activity]')) {
            const kind = root.dataset.activity;
            if (kind === 'probe')
                probe(root);
            else if (kind === 'holes' || kind === 'repair')
                holes(root, kind === 'repair');
            else if (kind === 'jump')
                jump(root);
            else if (['precision', 'construct', 'asymptote'].includes(kind))
                formModel(root, kind);
            else if (kind === 'vertical')
                vertical(root);
            else if (kind === 'far')
                far(root);
            else if (kind === 'steps')
                steps(root);
        }
    }
    window.LimitsUI = { bind };
})();
