(function () {
    const graph = window.CourseGraph;
    const find = id => document.getElementById(id);
    function draw(id, models, points = [], bounds) {
        const el = find(id);
        if (el) graph.render(el, models, points, undefined, bounds);
    }
    function bind() {
        const toggle = find('square-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const shown = toggle.getAttribute('aria-pressed') !== 'true';
                toggle.setAttribute('aria-pressed', shown);
                toggle.textContent = shown ? 'Remove missing square' : 'Add missing square';
                find('missing-square').setAttribute('fill', shown ? 'var(--accent-soft)' : 'none');
                find('missing-label').textContent = shown ? '9' : '?';
                find('area-label').textContent = shown ? 'x² + 6x + 9' : 'x² + 6x';
                find('area-result').textContent = shown ? '= (x + 3)²' : '';
            });
            draw('square-compare', [{ a: 2, h: 1, k: 9, reference: true }, { a: 2, h: 1, k: 7 }], [], { xmin: -3, xmax: 5, ymin: -2, ymax: 16 });
            draw('square-level', [{ a: 1, h: 3, k: -4 }], [{ x: 0, y: 5 }, { x: 6, y: 5 }], { xmin: -1, xmax: 7, ymin: -6, ymax: 10 });
        }
        draw('roots-example', [{ a: 1, h: -1, k: -9 }], [{ x: -4, y: 0 }, { x: 2, y: 0 }], { xmin: -5, xmax: 5, ymin: -12, ymax: 8 });
        const buttons = find('discriminant-buttons');
        if (buttons) {
            function update(c) {
                const roots = c < 0 ? [{ x: -2, y: 0 }, { x: 2, y: 0 }] : c === 0 ? [{ x: 0, y: 0 }] : [];
                draw('discriminant-graph', [{ a: 1, h: 0, k: c }], roots);
                const count = c < 0 ? 'two distinct real roots' : c === 0 ? 'one repeated root' : 'no real roots';
                find('discriminant-caption').textContent = `c = ${c}; D = ${-4 * c}. The equation has ${count}.`;
                buttons.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', Number(b.dataset.c) === c));
            }
            buttons.addEventListener('click', event => {
                const button = event.target.closest('button[data-c]');
                if (button) update(Number(button.dataset.c));
            });
            update(-4);
        }
    }
    window.CourseAlgebraUI = { bind };
})();
