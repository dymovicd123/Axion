(function () {
    const find = id => document.getElementById(id);
    const graph = window.CourseGraph;
    const model = window.CourseModel;
    function bindSigns() {
        const el = find('sign-graph');
        if (!el)
            return;
        function update(x) {
            const y = x * x - x - 6;
            const points = [{ x: -2, y: 0 }, { x: 3, y: 0 }];
            if (x !== -2 && x !== 3)
                points.push({ x, y, label: `f(${x}) = ${y}` });
            graph.render(el, [{ a: 1, h: .5, k: -6.25 }], points, update, { xmin: -4, xmax: 5, ymin: -8, ymax: 14 });
            find('sign-caption').textContent = `f(${x}) = ${y}. The value is ${y > 0 ? 'positive' : y < 0 ? 'negative' : 'zero'}.`;
        }
        find('sign-samples').addEventListener('click', event => {
            const button = event.target.closest('[data-x]');
            if (button)
                update(Number(button.dataset.x));
        });
        update(0);
        graph.render(find('downward-graph'), [{ a: -1, h: 1.5, k: 6.25 }], [{ x: -1, y: 0 }, { x: 4, y: 0 }]);
    }
    function bindTrajectory() {
        const el = find('trajectory-graph');
        if (!el)
            return;
        const form = el.closest('form');
        const button = find('run-trajectory');
        let frame = 0;
        const px = x => 44 + x * 66;
        const py = y => 290 - y * 37;
        const fmt = n => Number(n.toFixed(3)).toString();
        function coefficients() {
            return ['a', 'b', 'c'].map(key => model.number(form.elements[key].value));
        }
        function draw() {
            cancelAnimationFrame(frame);
            const [a, b, c] = coefficients();
            const result = model.analyse(a, b, c);
            let grid = '';
            for (let x = 0; x <= 8; x++) {
                grid += `<path d="M${px(x)} 31V290" stroke="var(--grid)"/><text x="${px(x)}" y="312" text-anchor="middle">${x}</text>`;
            }
            for (let y = 0; y <= 7; y++) {
                grid += `<path d="M44 ${py(y)}H572" stroke="var(--grid)"/><text x="35" y="${py(y) + 4}" text-anchor="end">${y}</text>`;
            }
            const at = x => a * x * x + b * x + c;
            let curve = '';
            if (result)
                for (let i = 0; i <= 160; i++) {
                    const x = i / 20;
                    curve += `${i ? 'L' : 'M'}${px(x)} ${py(at(x))} `;
                }
            el.innerHTML = `<svg viewBox="0 0 620 338" role="img" aria-label="Trajectory preview in metres"><defs><clipPath id="flight-clip"><rect x="44" y="31" width="528" height="259"/></clipPath></defs>${grid}
                <path d="M44 ${py(0)}H572" stroke="var(--axis)" stroke-width="2"/>
                <path d="M44 ${py(6)}H572" stroke="var(--bad)" stroke-dasharray="5 4" opacity=".8"/>
                <text x="50" y="${py(6) - 7}">6 m limit</text>
                <path d="M${px(4)} 290V${py(4.5)}" stroke="var(--graph-secondary)" stroke-width="7"/>
                <text x="${px(4) + 9}" y="${py(4.5) + 17}">Obstacle</text>
                <path d="M${px(8) - 14} ${py(3)}h28m-7 0v14m-14-14v14" stroke="var(--ink)" stroke-width="2" fill="none"/>
                <circle cx="${px(0)}" cy="${py(2)}" r="5" fill="var(--graph-secondary)"/>
                <text x="50" y="${py(2) - 10}">Start</text><text x="${px(8) - 10}" y="${py(3) - 12}" text-anchor="end">Hoop</text>
                <g clip-path="url(#flight-clip)"><path d="${curve}" fill="none" stroke="var(--accent)" stroke-width="3"/><circle id="flight-ball" r="7" fill="#d88732" visibility="hidden"/></g>
                <text x="580" y="312">x (m)</text><text x="45" y="18">y (m)</text></svg>`;
            const metrics = find('trajectory-measurements');
            metrics.replaceChildren();
            if (result) {
                for (const [name, value, passed] of [
                    ['Start height (2 m)', c, result.checks.launch],
                    ['Obstacle (at least 4.5 m)', result.middle, result.checks.clearance],
                    ['Peak (at most 6 m)', result.highest, result.checks.ceiling],
                    ['Hoop height (3 m)', result.end, result.checks.hoop],
                    ['Descending at hoop', result.checks.descending ? 'Yes' : 'No', result.checks.descending]
                ]) {
                    const row = document.createElement('div');
                    const label = document.createElement('span');
                    label.textContent = name;
                    const number = document.createElement('strong');
                    number.textContent = typeof value === 'number' ? fmt(value) + ' m' : value;
                    row.dataset.state = passed ? 'met' : 'unmet';
                    const check = document.createElement('small');
                    check.textContent = passed ? 'Requirement met' : 'Not met';
                    row.append(label, number, check);
                    metrics.append(row);
                }
            }
            else
                metrics.textContent = 'Enter finite coefficients (|a|, |b|, |c| ≤ 100) with a < 0.';
            find('trajectory-result').textContent = '';
            button.disabled = !result;
            return result;
        }
        button.addEventListener(
            'click',
            () => {
                const result = draw();
                if (!result)
                    return;
                const [a, b, c] = coefficients();
                const ball = find('flight-ball');
                const start = performance.now();
                const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 1800;
                let stop = 8;
                if (c < 0)
                    stop = 0;
                else {
                    const d = b * b - 4 * a * c;
                    if (d >= 0) {
                        const landing = (-b - Math.sqrt(d)) / (2 * a);
                        if (landing >= 0 && landing < stop)
                            stop = landing;
                    }
                    if (stop >= 4 && a * 16 + b * 4 + c < 4.5)
                        stop = 4;
                }
                function tick(now) {
                    const fraction = Math.min(1, (now - start) / duration);
                    const x = fraction * stop;
                    ball.setAttribute('cx', px(x));
                    ball.setAttribute('cy', py(a * x * x + b * x + c));
                    ball.setAttribute('visibility', 'visible');
                    if (fraction < 1)
                        frame = requestAnimationFrame(tick);
                    else
                        find('trajectory-result').textContent = stop < 8 ? 'The simulated flight stopped before the hoop.' : 'The trace reached x = 8. Submit to check all the design requirements.';
                }
                frame = requestAnimationFrame(tick);
            });
        form.addEventListener('input', draw);
        draw();
    }
    function bind() {
        bindSigns();
        const area = find('area-optimum');
        if (area)
            graph.render(area, [{ a: -1, h: 8, k: 64 }], [], undefined, { xmin: 0, xmax: 16, ymin: 0, ymax: 70, xstep: 2, ystep: 10 });
        bindTrajectory();
    }
    window.CourseApplicationsUI = { bind };
})();
