(function () {
    const width = 620;
    const height = 360;
    const plot = { left: 42, right: 600, top: 18, bottom: 325 };
    const defaultBounds = { xmin: -5, xmax: 5, ymin: -8, ymax: 8 };
    let graphCount = 0;
    function tag(name, attrs = {}, text) {
        const node = document.createElementNS('http://www.w3.org/2000/svg', name);
        for (const [key, value] of Object.entries(attrs))
            node.setAttribute(key, value);
        if (text !== undefined)
            node.textContent = text;
        return node;
    }
    function render(el, models, points = [], onPoint, bounds = defaultBounds) {
        function px(x) {
            return plot.left + (x - bounds.xmin) / (bounds.xmax - bounds.xmin) * (plot.right - plot.left);
        }
        function py(y) {
            return plot.bottom - (y - bounds.ymin) / (bounds.ymax - bounds.ymin) * (plot.bottom - plot.top);
        }
        function line(x1, y1, x2, y2, attrs = {}) {
            return tag('line', { x1: px(x1), y1: py(y1), x2: px(x2), y2: py(y2), ...attrs });
        }
        const svg = tag('svg', { viewBox: `0 0 ${width} ${height}`, role: onPoint ? 'presentation' : 'img', 'aria-label': el.getAttribute('aria-label') || 'Coordinate graph' });
        const clipId = `graph-clip-${++graphCount}`;
        const defs = tag('defs');
        const clip = tag('clipPath', { id: clipId });
        clip.append(tag('rect', { x: plot.left, y: plot.top, width: plot.right - plot.left, height: plot.bottom - plot.top }));
        defs.append(clip);
        svg.append(defs);
        for (let x = bounds.xmin; x <= bounds.xmax; x += bounds.xstep || 1) {
            svg.append(line(x, bounds.ymin, x, bounds.ymax, { stroke: x === 0 ? 'var(--axis)' : 'var(--grid)', 'stroke-width': x === 0 ? 1.5 : 1 }));
            svg.append(tag('text', { x: px(x), y: plot.bottom + 20, 'text-anchor': 'middle' }, x));
        }
        for (let y = bounds.ymin; y <= bounds.ymax; y += bounds.ystep || 2) {
            svg.append(line(bounds.xmin, y, bounds.xmax, y, { stroke: y === 0 ? 'var(--axis)' : 'var(--grid)', 'stroke-width': y === 0 ? 1.5 : 1 }));
            svg.append(tag('text', { x: plot.left - 10, y: py(y) + 4, 'text-anchor': 'end' }, y));
        }
        svg.append(tag('text', { x: plot.right, y: py(0) - 8, 'text-anchor': 'end' }, 'x'));
        svg.append(tag('text', { x: px(0) + 8, y: plot.top + 12 }, 'y'));
        const curves = tag('g', { 'clip-path': `url(#${clipId})` });
        for (const { a, h, k, reference } of models) {
            if (![a, h, k].every(Number.isFinite) || a === 0)
                continue;
            let path = '';
            for (let i = 0; i <= 240; i++) {
                const x = bounds.xmin + (bounds.xmax - bounds.xmin) * i / 240;
                const y = a * (x - h) ** 2 + k;
                if (!Number.isFinite(y))
                    continue;
                path += `${i === 0 ? 'M' : 'L'}${px(x).toFixed(2)} ${py(Math.max(-1000, Math.min(1000, y))).toFixed(2)} `;
            }
            curves.append(tag('path', {
                d: path,
                fill: 'none',
                stroke: reference ? 'var(--graph-secondary)' : 'var(--accent)',
                'stroke-width': reference ? 1.7 : 2.8,
                'stroke-dasharray': reference ? '5 5' : 'none'
            }));
            if (!reference) {
                curves.append(line(h, bounds.ymin, h, bounds.ymax, { stroke: 'var(--accent)', 'stroke-dasharray': '4 5', opacity: .6 }));
                curves.append(tag('circle', { cx: px(h), cy: py(k), r: 5, fill: 'var(--accent)', stroke: 'var(--paper)', 'stroke-width': 1.5 }));
            }
        }
        for (const point of points) {
            curves.append(tag('circle', { cx: px(point.x), cy: py(point.y), r: 5.5, fill: 'var(--accent)', stroke: 'var(--paper)', 'stroke-width': 2 }));
            curves.append(tag('text', { x: px(point.x) + 8, y: py(point.y) - 9 }, point.label || `(${point.x}, ${point.y})`));
        }
        svg.append(curves);
        if (onPoint)
            svg.addEventListener(
                'click',
                event => {
                    const rect = svg.getBoundingClientRect();
                    const sx = (event.clientX - rect.left) / rect.width * width;
                    const sy = (event.clientY - rect.top) / rect.height * height;
                    if (sx < plot.left || sx > plot.right || sy < plot.top || sy > plot.bottom)
                        return;
                    const x = Math.round(bounds.xmin + (sx - plot.left) / (plot.right - plot.left) * (bounds.xmax - bounds.xmin));
                    const y = Math.round(bounds.ymin + (plot.bottom - sy) / (plot.bottom - plot.top) * (bounds.ymax - bounds.ymin));
                    onPoint(x, y);
                });
        el.replaceChildren(svg);
    }
    window.CourseGraph = { render };
})();
