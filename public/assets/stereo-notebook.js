(function (root) {
    const kinds = ['Construction', 'Theorem / reasoning', 'Calculation', 'Conclusion'];
    function normalize(state) {
        if (!Array.isArray(state.steps))
            state.steps = state.notes?.trim() ? [{ kind: kinds[1], title: 'Previous reasoning', text: state.notes, math: '', figure: null }] : [];
        return state.steps;
    }
    function mount(host, getState, changed, diagram) {
        const el = (tag, txt, cls) => {
            const e = document.createElement(tag);
            if (txt !== undefined)
                e.textContent = txt;
            if (cls)
                e.className = cls;
            return e;
        };
        const btn = (txt, action, cls = 'secondary') => {
            const b = el('button', txt, cls);
            b.type = 'button';
            b.onclick = action;
            return b;
        };
        let steps = normalize(getState());
        host.replaceChildren();
        const toolbar = el('div', undefined, 'stereo-toolbar');
        const rows = el('div', undefined, 'geo-notebook-rows');
        const empty = el('p', 'Start with a construction, theorem or calculation. You choose the order.', 'small');
        function add(kind) {
            if (steps.length >= 30)
                return;
            steps.push({ kind, title: '', text: '', math: '', figure: null });
            changed();
            render();
            rows.lastElementChild?.querySelector('input')?.focus();
        }
        for (const kind of kinds)
            toolbar.append(btn('+ ' + kind, () => add(kind)));
        function render() {
            rows.replaceChildren();
            empty.hidden = steps.length > 0;
            steps.forEach((step, i) => {
                const row = el('article', undefined, 'geo-notebook-step'),
                    head = el('div', undefined, 'geo-step-head'),
                    label = el('strong', `${i + 1}. ${step.kind}`),
                    actions = el('div', undefined, 'stereo-toolbar');
                const move = dir => {
                    const j = i + dir;
                    if (j < 0 || j >= steps.length)
                        return;
                    [steps[i], steps[j]] = [steps[j], steps[i]];
                    changed();
                    render();
                };
                const up = btn('↑', () => move(-1)), down = btn('↓', () => move(1));
                up.disabled = i === 0;
                down.disabled = i === steps.length - 1;
                up.setAttribute('aria-label', 'Move step up');
                down.setAttribute('aria-label', 'Move step down');
                actions.append(up, down, btn('Remove', () => {
                    steps.splice(i, 1);
                    changed();
                    render();
                }));
                head.append(label, actions);
                row.append(head);
                const title = el('input');
                title.type = 'text';
                title.placeholder = 'Step title (optional)';
                title.value = step.title || '';
                title.setAttribute('aria-label', 'Step title');
                title.oninput = () => {
                    step.title = title.value;
                    changed();
                };
                row.append(title);
                if (step.kind === 'Theorem / reasoning' || step.kind === 'Calculation') {
                    const select = el('select');
                    select.setAttribute('aria-label', 'Insert theorem');
                    [
                        'Insert theorem…',
                        'Pythagorean theorem',
                        'Triangle similarity',
                        'Triangle congruence',
                        'Trigonometric ratios',
                        'Line perpendicular to a plane',
                        'Theorem of three perpendiculars',
                        'Parallel planes',
                        'Area / volume formula'
                    ].forEach((s, j) => {
                        const o = el('option', s);
                        o.value = j ? s : '';
                        select.append(o);
                    });
                    select.onchange = () => {
                        if (!select.value)
                            return;
                        step.title = select.value;
                        title.value = step.title;
                        select.value = '';
                        changed();
                    };
                    row.append(select);
                }
                const text = el('textarea');
                text.rows = 2;
                text.placeholder = step.kind === 'Construction' ? 'Describe what you constructed and why…' : 'Explain your reasoning…';
                text.value = step.text || '';
                text.setAttribute('aria-label', 'Step reasoning');
                text.oninput = () => {
                    step.text = text.value;
                    changed();
                };
                row.append(text);
                const math = el('input');
                math.type = 'text';
                math.value = step.math || '';
                math.placeholder = 'Equation or expression';
                math.setAttribute('aria-label', 'Step equation');
                math.oninput = () => {
                    step.math = math.value;
                    changed();
                };
                row.append(math);
                if (root.MathField)
                    root.MathField.mount(math);
                const attach = el('div', undefined, 'geo-attach'), select = el('select');
                select.setAttribute('aria-label', 'Choose extracted figure');
                const placeholder = el('option', 'Attach extracted figure…');
                placeholder.value = '';
                select.append(placeholder);
                getState().extracted.forEach((ids, j) => {
                    const o = el('option', ids.join('–'));
                    o.value = String(j);
                    select.append(o);
                });
                const addFig = btn(
                    'Attach',
                    () => {
                        if (select.value === '')
                            return;
                        const state = getState(), ids = state.extracted[Number(select.value)];
                        if (!ids)
                            return;
                        step.figure = { ids: [...ids], points: ids.map(id => [...state.points[id]]) };
                        changed();
                        render();
                    });
                attach.append(select, addFig);
                if (step.figure)
                    attach.append(btn('Detach', () => {
                        step.figure = null;
                        changed();
                        render();
                    }));
                row.append(attach);
                if (step.figure) {
                    const fig = el('div', undefined, 'geo-notebook-figure');
                    try {
                        fig.innerHTML = diagram(step.figure);
                    }
                    catch {
                        fig.textContent = 'Figure unavailable.';
                    }
                    row.append(fig);
                }
                rows.append(row);
            });
        }
        function updateFigures() {
            for (const s of host.querySelectorAll('.geo-attach select')) {
                const value = s.value;
                s.replaceChildren();
                const o = el('option', 'Attach extracted figure…');
                o.value = '';
                s.append(o);
                getState().extracted.forEach((ids, j) => {
                    const o = el('option', ids.join('–'));
                    o.value = String(j);
                    s.append(o);
                });
                s.value = [...s.options].some(o => o.value === value) ? value : '';
            }
            host.querySelectorAll('.geo-notebook-step').forEach((row, i) => {
                const fig = row.querySelector('.geo-notebook-figure');
                if (fig && steps[i]?.figure) {
                    try {
                        fig.innerHTML = diagram(steps[i].figure);
                    }
                    catch { }
                }
            });
        }
        host.append(toolbar, empty, rows);
        render();
        return {
            updateFigures, reset() {
                steps = normalize(getState());
                render();
            }
        };
    }
    root.StereoNotebook = { mount, normalize };
})(window);
