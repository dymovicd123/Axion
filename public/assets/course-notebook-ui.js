(function () {
    const lesson = document.body.dataset.lesson;
    const mode = new URLSearchParams(location.search).get('mode') || 'study';
    if (!lesson)
        return;
    const make = (tag, text, cls) => {
        const e = document.createElement(tag);
        if (text !== undefined)
            e.textContent = text;
        if (cls)
            e.className = cls;
        return e;
    };
    async function api(path, data) {
        const r = await fetch('/api/course/' + lesson + path, data === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await r.json();
        if (!r.ok)
            throw Error(result.error || 'Request failed.');
        return result;
    }
    function button(text, fn, cls = 'secondary') {
        const b = make('button', text, cls);
        b.type = 'button';
        b.addEventListener('click', fn);
        return b;
    }
    function render(task, section) {
        const key = 'axion-notebook-' + task.id;
        let saved;
        try {
            saved = JSON.parse((window.AxionStorage || localStorage).getItem(key) || 'null');
        }
        catch { }
        saved ||= task.latest || {};
        const card = make('div', undefined, 'notebook');
        const heading = make('div', undefined, 'notebook-heading');
        const title = make('h3', task.title), state = make('span', task.solved ? 'Solved ✓' : '', 'notebook-state');
        heading.append(title, state);
        const problem = make('div', undefined, 'notebook-problem');
        if (task.type === 'limit')
            problem.append(make('span', 'lim x → ' + task.at, 'limit-label'));
        problem.append(MathField.display(task.start));
        const instructions = make('p', task.goal);
        const guide = make(
            'p',
            task.type === 'equation' ? 'Write an equivalent equation on each line, including the equals sign. Enter the two roots below.' : 'Write one equivalent expression on each line. Use the buttons in the math field for fractions, powers and roots.',
            'small');
        const rows = make('div', undefined, 'notebook-rows'), result = make('p', '', 'feedback');
        result.setAttribute('role', 'status');
        const entries = [], answers = [];
        let busy = false;
        function data(finish = false, upto = entries.length) {
            return {
                id: task.id,
                rows: entries.slice(0, upto).map(e => e.input.value),
                answer: task.type === 'equation' ? answers.map(e => e.value) : task.type === 'limit' ? answers[0].value : null,
                finish
            };
        }
        function save() {
            try {
                (window.AxionStorage || localStorage).setItem(key, JSON.stringify(data()));
            }
            catch { }
        }
        function invalidate(index = 0) {
            entries.slice(index).forEach(e => {
                e.feedback.textContent = '';
                e.feedback.className = 'notebook-line-feedback';
            });
            result.textContent = '';
            result.className = 'feedback';
        }
        function renumber() {
            entries.forEach((e, i) => {
                e.number.textContent = String(i + 1);
                e.remove.disabled = busy;
                e.check.disabled = busy;
            });
            add.disabled = entries.length >= 12 || busy;
            submit.disabled = !entries.length || busy;
            empty.hidden = entries.length > 0;
        }
        function addRow(value = '', focus = false) {
            if (entries.length >= 12)
                return;
            const line = make('div', undefined, 'notebook-line'), number = make('span', String(entries.length + 1), 'notebook-number');
            const field = make('input');
            field.type = 'text';
            field.value = value;
            field.setAttribute('aria-label', 'Solution step');
            const body = make('div', undefined, 'notebook-line-body'), feedback = make('p', '', 'notebook-line-feedback');
            feedback.setAttribute('role', 'status');
            const actions = make('div', undefined, 'notebook-line-actions');
            const entry = { line, number, input: field, feedback };
            const check = button('Check line', () => verify(false, entries.indexOf(entry) + 1));
            const remove = button(
                'Remove',
                () => {
                    if (busy)
                        return;
                    const i = entries.indexOf(entry);
                    if (i < 0)
                        return;
                    entries.splice(i, 1);
                    line.remove();
                    invalidate(i);
                    renumber();
                    save();
                    if (!entries.length)
                        add.focus();
                });
            entry.remove = remove;
            entry.check = check;
            actions.append(check, remove);
            body.append(field, feedback);
            line.append(number, body, actions);
            rows.append(line);
            entries.push(entry);
            const editor = MathField.mount(field);
            field.addEventListener('input', () => {
                invalidate(entries.indexOf(entry));
                save();
            });
            renumber();
            if (focus)
                editor.focus();
        }
        function answerField(label, value) {
            const wrap = make('label', label), field = make('input');
            field.type = 'text';
            field.value = value || '';
            field.setAttribute('aria-label', label);
            wrap.append(field);
            answers.push(field);
            field.addEventListener('input', () => {
                result.textContent = '';
                save();
            });
            return wrap;
        }
        const final = make('div', undefined, 'notebook-final');
        if (task.type === 'equation')
            final.append(answerField('First root', saved.answer?.[0]), answerField('Second root', saved.answer?.[1]));
        if (task.type === 'limit')
            final.append(answerField('Limit', saved.answer));
        const empty = make('p', 'No solution lines. Add a line to begin.', 'notebook-empty small');
        const add = button('＋ Add a line', () => {
            addRow('', true);
            save();
        });
        const submit = button('Check solution', () => verify(true), 'primary');
        async function verify(finish, upto = entries.length) {
            if (busy || !entries.length)
                return;
            const payload = data(finish, upto);
            const blank = payload.rows.findIndex(v => !v.trim());
            if (blank !== -1) {
                result.textContent = 'Write an expression on line ' + (blank + 1) + '.';
                result.className = 'feedback bad';
                entries[blank].input.focus();
                return;
            }
            if (finish && answers.some(a => !a.value.trim())) {
                result.textContent = 'Enter the final answer.';
                result.className = 'feedback bad';
                answers.find(a => !a.value.trim()).focus();
                return;
            }
            busy = true;
            renumber();
            const snapshot = JSON.stringify(payload);
            try {
                const response = await api('/notebook', payload);
                if (snapshot !== JSON.stringify(data(finish, upto)))
                    return;
                response.steps.forEach((step, i) => {
                    const f = entries[i].feedback;
                    f.textContent = (step.correct ? '✓ ' : '') + step.message;
                    f.className = 'notebook-line-feedback ' + (step.correct ? 'good' : 'bad');
                });
                if (finish) {
                    result.textContent = response.message;
                    result.className = 'feedback ' + (response.complete ? 'good' : 'bad');
                    if (response.complete)
                        state.textContent = 'Solved ✓';
                }
                else {
                    result.textContent = response.steps.every(r => r.correct) ? 'All checked lines are equivalent. Continue or check your final solution.' : 'Review the marked lines.';
                    result.className = 'feedback ' + (response.steps.every(r => r.correct) ? 'good' : 'bad');
                }
                if (response.status)
                    document.dispatchEvent(new CustomEvent('notebook-status', { detail: response.status }));
            }
            catch (e) {
                result.textContent = e.message;
                result.className = 'feedback bad';
            }
            finally {
                busy = false;
                renumber();
            }
        }
        const solution = make('details', undefined, 'optional-solution notebook-solution');
        solution.append(make('summary', 'Worked solution'));
        solution.addEventListener(
            'toggle',
            async () => {
                if (!solution.open || solution.dataset.loaded)
                    return;
                solution.dataset.loaded = 'true';
                try {
                    const worked = await api('/notebook/' + task.id + '/solution');
                    for (const line of worked.rows) {
                        const p = make('p');
                        p.append(MathField.display(line));
                        solution.append(p);
                    }
                    if (worked.answer !== null) {
                        const p = make('p', task.type === 'equation' ? 'Roots: ' : 'Limit: ');
                        const vals = Array.isArray(worked.answer) ? worked.answer : [worked.answer];
                        vals.forEach((v, i) => {
                            if (i)
                                p.append(document.createTextNode(', '));
                            p.append(MathField.display(v));
                        });
                        solution.append(p);
                    }
                }
                catch (e) {
                    delete solution.dataset.loaded;
                    solution.append(make('p', e.message));
                }
            });
        const controls = make('div', undefined, 'exercise-actions');
        controls.append(submit);
        card.append(heading, instructions, problem, guide, rows, empty, add, final, controls, result, solution);
        section.append(card);
        answers.forEach(MathField.mount);
        const restored = Array.isArray(saved.rows) ? saved.rows.filter(v => typeof v === 'string').slice(0, 12) : [];
        (Array.isArray(saved.rows) ? restored : ['']).forEach(v => addRow(v));
        renumber();
    }
    async function bind() {
        try {
            const tasks = await api('/notebooks');
            for (const task of tasks) {
                if (mode === 'labs' || (task.practiceOnly && mode !== 'practice'))
                    continue;
                const section = document.getElementById(task.section);
                if (section)
                    render(task, section);
            }
        }
        catch (e) {
            const marker = document.getElementById('connection-status');
            if (marker)
                marker.textContent = 'Could not load the mathematical notebooks. ' + e.message;
        }
    }
    window.CourseNotebookUI = { bind };
})();
