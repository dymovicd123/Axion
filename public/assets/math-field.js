(function () {
    const nativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    const instances = new WeakMap();
    function make(tag, cls, text) {
        const el = document.createElement(tag);
        if (cls)
            el.className = cls;
        if (text !== undefined)
            el.textContent = text;
        return el;
    }
    function grouped(value) {
        return /^(?:[a-zA-Z]+|[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/.test(value) ? value : '(' + value + ')';
    }
    function serialize(slot) {
        return Array.from(slot.children).map(el => {
            if (el.classList.contains('math-run'))
                return el.value;
            const parts = Array.from(el.querySelectorAll(':scope > .math-slot'));
            if (el.dataset.kind === 'fraction') {
                const fraction = grouped(serialize(parts[0])) + '/' + grouped(serialize(parts[1]));
                const following = el.nextElementSibling;
                const preceding = el.previousElementSibling;
                const attached = (following?.classList.contains('math-run') && /^[a-zA-Z0-9.(]/.test(following.value)) || (preceding?.classList.contains('math-run') && /[a-zA-Z0-9.)]$/.test(preceding.value)) || following?.classList.contains('math-power');
                return attached ? '(' + fraction + ')' : fraction;
            }
            if (el.dataset.kind === 'power')
                return '^(' + serialize(parts[0]) + ')';
            if (el.dataset.kind === 'root')
                return 'sqrt(' + serialize(parts[0]) + ')';
            return '';
        }).join('').replace(
            /−/g,
            '-').replace(
                /×/g,
                '*').replace(
                    /÷/g,
                    '/');
    }
    function structure(kind, slots) {
        const box = make('span', 'math-structure math-' + kind);
        box.dataset.kind = kind;
        if (kind === 'root')
            box.append(make('span', 'radical-sign', '√'));
        box.append(...slots);
        return box;
    }
    function slot() {
        return make('span', 'math-slot');
    }
    function precedence(n) {
        if (n.type === 'binary')
            return { '+': 1, '-': 1, '*': 2, '/': 2, '^': 4 }[n.op];
        if (n.type === 'unary')
            return 3;
        return 5;
    }
    function astPieces(n, parent = 0) {
        if (n.type === 'number' || n.type === 'name')
            return [String(n.value)];
        if (n.type === 'call') {
            if (n.name === 'sqrt')
                return [{ kind: 'root', parts: [astPieces(n.argument)] }];
            return [n.name + '(', ...astPieces(n.argument), ')'];
        }
        const p = precedence(n);
        let pieces;
        if (n.type === 'unary')
            pieces = [n.op, ...astPieces(n.child, p)];
        else if (n.op === '/')
            pieces = [{ kind: 'fraction', parts: [astPieces(n.left), astPieces(n.right)] }];
        else if (n.op === '^')
            pieces = [...astPieces(n.left, p + 1), { kind: 'power', parts: [astPieces(n.right)] }];
        else
            pieces = [...astPieces(n.left, p), n.op, ...astPieces(n.right, p + 1)];
        return p < parent && n.op !== '/' ? ['(', ...pieces, ')'] : pieces;
    }
    function pieces(value) {
        try {
            if (!value)
                return [''];
            const sides = value.split('=');
            return sides.flatMap((s, i) => [...(i ? ['='] : []), ...astPieces(window.AxionExpression.parse(s))]);
        }
        catch {
            return [value];
        }
    }
    function mount(original) {
        if (instances.has(original))
            return instances.get(original);
        const outer = make('div', 'math-editor');
        const surface = make('div', 'math-surface');
        const root = slot();
        const toolbar = make('div', 'math-toolbar');
        const label = original.getAttribute('aria-label') || original.closest('label')?.textContent.trim() || 'Math expression';
        surface.append(root);
        outer.append(surface, toolbar);
        original.after(outer);
        original.classList.add('math-original');
        original.tabIndex = -1;
        original.setAttribute('aria-hidden', 'true');
        let active = null;
        let raw = false;
        function fit(run) {
            run.style.width = Math.max(.75, Math.min(60, run.value.length * .58 + .35)) + 'em';
        }
        function sync() {
            nativeValue.set.call(original, serialize(root));
            original.dispatchEvent(new Event('input', { bubbles: true }));
        }
        function focus(run, end = true) {
            run.focus();
            run.setSelectionRange(end ? run.value.length : 0, end ? run.value.length : 0);
        }
        function runs() {
            return Array.from(root.querySelectorAll('.math-run'));
        }
        function newRun(value = '') {
            const run = make('input', 'math-run');
            run.type = 'text';
            run.autocomplete = 'off';
            run.spellcheck = false;
            run.setAttribute('aria-label', label);
            run.value = value;
            fit(run);
            run.addEventListener('focus', () => {
                active = run;
            });
            run.addEventListener('input', event => {
                event.stopPropagation();
                fit(run);
                sync();
            });
            run.addEventListener(
                'keydown',
                event => {
                    if (!raw && ['/', '^'].includes(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
                        event.preventDefault();
                        insert(event.key === '/' ? 'fraction' : 'power');
                        return;
                    }
                    if (!raw && event.key === '√') {
                        event.preventDefault();
                        insert('root');
                        return;
                    }
                    if (event.key === 'ArrowLeft' && run.selectionStart === 0 && run.selectionEnd === 0 || event.key === 'ArrowRight' && run.selectionStart === run.value.length && run.selectionEnd === run.value.length) {
                        const all = runs(), i = all.indexOf(run), right = event.key === 'ArrowRight', next = all[i + (right ? 1 : -1)];
                        if (next) {
                            event.preventDefault();
                            focus(next, !right);
                        }
                    }
                    if (['Backspace', 'Delete'].includes(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
                        const a = run.selectionStart ?? 0, b = run.selectionEnd ?? a;
                        const back = event.key === 'Backspace';
                        const from = a !== b ? a : back ? Math.max(0, a - 1) : a;
                        const to = a !== b ? b : back ? a : Math.min(run.value.length, a + 1);
                        event.preventDefault();
                        if (from !== to) {
                            run.setRangeText('', from, to, 'start');
                            fit(run);
                            sync();
                            return;
                        }
                        const all = runs(), index = all.indexOf(run);
                        const neighbour = all[index + (back ? -1 : 1)];
                        const node = back ? run.previousElementSibling : run.nextElementSibling;
                        if (node?.classList.contains('math-structure')) {
                            const nested = Array.from(node.querySelectorAll('.math-run'));
                            if (nested.every(r => !r.value)) {
                                node.remove();
                                sync();
                                return;
                            }
                        }
                        const enclosing = run.closest('.math-structure');
                        if (enclosing && Array.from(enclosing.querySelectorAll('.math-run')).every(r => !r.value)) {
                            const replacement = newRun();
                            enclosing.replaceWith(replacement);
                            focus(replacement);
                            sync();
                            return;
                        }
                        if (neighbour)
                            focus(neighbour, back);
                    }
                });
            run.addEventListener(
                'paste',
                event => {
                    const text = event.clipboardData?.getData('text/plain');
                    if (!raw && text && (text.includes('/') || text.includes('^') || text.includes('sqrt(')) && !run.value && root.children.length === 1) {
                        event.preventDefault();
                        render(text);
                        focus(runs().at(-1));
                        sync();
                    }
                });
            return run;
        }
        function fillSlot(target, list) {
            let buffer = '';
            for (const p of list) {
                if (typeof p === 'string') {
                    buffer += p;
                    continue;
                }
                target.append(newRun(buffer));
                buffer = '';
                const slots = p.parts.map(part => {
                    const s = slot();
                    fillSlot(s, part);
                    return s;
                });
                target.append(structure(p.kind, slots));
            }
            target.append(newRun(buffer));
        }
        function render(value) {
            root.replaceChildren();
            fillSlot(root, raw ? [value] : pieces(value));
            active = null;
        }
        function insert(kind) {
            if (raw) {
                raw = false;
                render(nativeValue.get.call(original));
            }
            const run = active && root.contains(active) ? active : runs().at(-1);
            const a = run.selectionStart ?? run.value.length, b = run.selectionEnd ?? a;
            let left = run.value.slice(0, a), selected = run.value.slice(a, b), right = run.value.slice(b);
            const parts = [];
            if (kind === 'fraction') {
                if (!selected) {
                    let depth = 0, start = 0;
                    for (let i = left.length - 1; i >= 0; i--) {
                        const ch = left[i];
                        if (ch === ')')
                            depth++;
                        else if (ch === '(')
                            depth--;
                        else if (depth === 0 && '+-*/='.includes(ch)) {
                            start = i + 1;
                            break;
                        }
                    }
                    selected = left.slice(start);
                    left = left.slice(0, start);
                }
                for (const value of [selected, '']) {
                    const s = slot();
                    s.append(newRun(value));
                    parts.push(s);
                }
            }
            else {
                const s = slot();
                s.append(newRun(selected));
                parts.push(s);
            }
            run.value = left;
            fit(run);
            const node = structure(kind, parts), tail = newRun(right);
            run.after(node, tail);
            focus(parts.at(-1).querySelector('.math-run'));
            sync();
        }
        function button(text, title, fn) {
            const b = make('button', 'math-key', text);
            b.type = 'button';
            b.title = title;
            b.setAttribute('aria-label', title);
            b.addEventListener('pointerdown', e => e.preventDefault());
            b.addEventListener('click', fn);
            toolbar.append(b);
            return b;
        }
        button('a/b', 'Insert fraction', () => insert('fraction'));
        button('xⁿ', 'Insert exponent', () => insert('power'));
        button('√', 'Insert square root', () => insert('root'));
        button(
            'x',
            'Insert x',
            () => {
                const r = active && root.contains(active) ? active : runs().at(-1);
                const i = r.selectionStart ?? r.value.length, j = r.selectionEnd ?? i;
                r.setRangeText('x', i, j, 'end');
                fit(r);
                focus(r);
                sync();
            });
        const toggle = button(
            'Text',
            'Switch between visual and text entry',
            () => {
                raw = !raw;
                render(nativeValue.get.call(original));
                toggle.textContent = raw ? 'Math' : 'Text';
                focus(runs().at(-1));
            });
        button('Clear', 'Clear expression', () => {
            render('');
            sync();
            focus(runs()[0]);
        });
        surface.addEventListener('click', e => {
            if (e.target === surface || e.target === root)
                focus(runs().at(-1));
        });
        original.addEventListener('focus', () => focus(runs()[0]));
        Object.defineProperty(
            original,
            'value',
            {
                configurable: true,
                get() {
                    return nativeValue.get.call(this);
                },
                set(value) {
                    nativeValue.set.call(this, value);
                    render(String(value));
                }
            });
        render(nativeValue.get.call(original));
        const api = {
            focus: () => focus(runs()[0]),
            get value() {
                return original.value;
            },
            set value(v) {
                original.value = v;
            },
            element: outer
        };
        instances.set(original, api);
        return api;
    }
    function bind() {
        document.querySelectorAll('[data-exercise] input[name], [data-assessment] input[name]').forEach(input => {
            if (input.type !== 'text' || input.name === 'solution')
                return;
            const form = input.closest('[data-exercise]');
            const activity = form?.querySelector('[data-activity]')?.dataset.activity;
            if (form?.classList.contains('construction') || form?.querySelector('#trajectory-graph') || ['precision', 'construct', 'asymptote'].includes(activity))
                return;
            mount(input);
        });
    }
    function display(value) {
        const root = make('span', 'math-display');
        function draw(target, list) {
            for (const p of list) {
                if (typeof p === 'string') {
                    target.append(document.createTextNode(p.replace(/\*/g, '·').replace(/-/g, '−')));
                    continue;
                }
                const slots = p.parts.map(part => {
                    const s = slot();
                    draw(s, part);
                    return s;
                });
                target.append(structure(p.kind, slots));
            }
        }
        draw(root, pieces(value));
        return root;
    }
    window.MathField = { mount, bind, display };
})();
