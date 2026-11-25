(function () {
    const page = document.body.dataset.page;
    const reviewMode = new URLSearchParams(location.search).get('view') === 'review';
    const themeKey = 'axion-theme';
    const lessonId = document.body.dataset.lesson || 'quadratic-1';
    const draftKey = 'axion-' + lessonId + '-draft';
    const firstSections = {
        classify: ['Recognising a quadratic', 'definition'],
        table: ['Values and symmetry', 'parabola'],
        features: ['Vertex form and intercepts', 'vertex-form'],
        standard: ['Finding a vertex', 'standard-form'],
        construct: ['Constructing a parabola', 'construction']
    };
    const firstAssessment = {
        shape: ['Vertex form', 'vertex-form'],
        calculate: ['Standard form', 'standard-form'],
        symmetry: ['Symmetry', 'parabola'],
        range: ['Range of a quadratic', 'vertex-form'],
        build: ['Finding the function', 'construction']
    };
    const quadraticLessons = [
        {
            id: 'quadratic-1', title: 'Quadratic functions', url: 'quadratic.html', sections: firstSections, assessment: firstAssessment
        },
        {
            id: 'quadratic-2',
            title: 'Completing the square',
            url: 'completing-square.html',
            sections: {
                identity: ['Completing a square', 'identity'],
                balance: ['Balancing a transformation', 'balance'],
                leading: ['Leading coefficient', 'leading'],
                rewrite: ['Expanding and checking', 'rewrite'],
                minimum: ['Using vertex form', 'minimum']
            },
            assessment: {
                monic: ['Completing the square', 'balance'],
                fractional: ['Fractional coefficients', 'balance'],
                negative: ['Negative leading coefficient', 'leading'],
                compare: ['Expanding expressions', 'rewrite'],
                level: ['Symmetry', 'minimum']
            }
        },
        {
            id: 'quadratic-3',
            title: 'Quadratic equations',
            url: 'quadratic-equations.html',
            sections: {
                factor: ['Factorisation', 'factor'],
                zero: ['Missing terms', 'zero'],
                square: ['Completing the square', 'square'],
                formula: ['Quadratic formula', 'formula'],
                discriminant: ['Discriminant', 'discriminant']
            },
            assessment: {
                factor: ['Factorisation', 'factor'],
                zero: ['Missing terms', 'zero'],
                formula: ['Quadratic formula', 'formula'],
                irrational: ['Irrational roots', 'square'],
                parameter: ['Repeated roots', 'discriminant']
            }
        },
        {
            id: 'quadratic-4',
            title: 'Quadratic inequalities',
            url: 'quadratic-inequalities.html',
            sections: {
                signs: ['Signs and roots', 'signs'],
                downward: ['Negative leading coefficient', 'downward'],
                rearrange: ['Rearranging', 'rearrange'],
                special: ['Repeated roots', 'special'],
                combined: ['Intersecting conditions', 'combined']
            },
            assessment: {
                outside: ['Sign intervals', 'signs'],
                inside: ['Negative leading coefficient', 'downward'],
                irrational: ['Exact endpoints', 'rearrange'],
                noRoots: ['No real roots', 'special'],
                intersection: ['Intersection', 'combined']
            }
        },
        {
            id: 'quadratic-5',
            title: 'Applications',
            url: 'applications.html',
            sections: {
                model: ['Building models', 'model'],
                maximum: ['Finding an optimum', 'maximum'],
                height: ['Height and time', 'height'],
                threshold: ['Model constraints', 'threshold'],
                trajectory: ['Trajectory design', 'trajectory']
            },
            assessment: {
                area: ['Optimisation', 'maximum'],
                revenue: ['Optimisation', 'maximum'],
                landing: ['Physical domain', 'height'],
                width: ['Model constraints', 'threshold'],
                design: ['Reconstructing a model', 'trajectory']
            }
        },
        {
            id: 'quadratic-final',
            title: 'Final assessment',
            url: 'quadratic-final.html',
            sections: {},
            assessment: {
                vertex: ['Vertex', 'standard-form', 'quadratic-1'],
                range: ['Range', 'vertex-form', 'quadratic-1'],
                square: ['Completing the square', 'balance', 'quadratic-2'],
                factor: ['Factorisation', 'factor', 'quadratic-3'],
                roots: ['Roots', 'formula', 'quadratic-3'],
                parameter: ['Discriminant', 'discriminant', 'quadratic-3'],
                inequality: ['Sign intervals', 'signs', 'quadratic-4'],
                repeated: ['Repeated roots', 'special', 'quadratic-4'],
                area: ['Optimisation', 'maximum', 'quadratic-5'],
                threshold: ['Model constraints', 'threshold', 'quadratic-5']
            }
        }
    ];
    const limitsLessons = window.LimitsLessons || [];
    const groups = [
        { title: 'Quadratic functions and equations', items: quadraticLessons },
        { title: 'Limits and continuity', items: limitsLessons }
    ].filter(group => group.items.length);
    const lessons = [...quadraticLessons, ...limitsLessons];
    const current = lessons.find(item => item.id === lessonId) || lessons[0];
    const requestedMode = new URLSearchParams(location.search).get('mode');
    const mode = ['practice', 'labs'].includes(requestedMode) && !lessonId.endsWith('-final') ? requestedMode : 'study';
    const labExercises = {
        'quadratic-1': ['construct'], 'quadratic-5': ['trajectory'],
        'limits-1': ['probe', 'precision'], 'limits-2': ['construct'], 'limits-4': ['design']
    };
    const group = groups.find(g => g.items.some(l => l.id === lessonId));
    function moduleUrl(item, kind) {
        return item.url + (kind === 'study' ? '' : '?mode=' + kind);
    }
    function initModules() {
        const header = $('.lesson-header');
        if (!header || !group)
            return;
        const ordinary = group.items.filter(item => !item.id.endsWith('-final'));
        const labs = ordinary.filter(item => labExercises[item.id]);
        const tabs = make('nav', undefined, 'course-module-tabs');
        tabs.setAttribute('aria-label', 'Course modules');
        for (const [kind, label, item] of [
            ['study', 'Study', current],
            ['practice', 'Practice', ordinary.find(l => l.id === lessonId) || ordinary[0]],
            ['labs', 'Labs', labs.find(l => l.id === lessonId) || labs[0]]
        ]) {
            const a = make('a', label);
            a.href = moduleUrl(item, kind);
            if (mode === kind)
                a.setAttribute('aria-current', 'page');
            tabs.append(a);
        }
        header.before(tabs);
        if (mode === 'study')
            return;
        document.body.dataset.module = mode;
        const title = $('h1', header);
        title.textContent = (mode === 'practice' ? 'Practice: ' : 'Labs: ') + current.title;
        document.title = title.textContent + ' | Axion';
        const lead = $('.lead', header);
        if (lead)
            lead.textContent = mode === 'practice' ? 'Work through the problems and write your own solution. Results are shared with the lesson.' : 'Complete the investigations and check your mathematical model. Results are shared with the lesson.';
        const chooser = make('div', undefined, 'module-picker');
        const label = make('label', mode === 'practice' ? 'Practice topic' : 'Investigation topic');
        const select = make('select');
        select.setAttribute('aria-label', label.textContent);
        for (const item of mode === 'practice' ? ordinary : labs) {
            const opt = make('option', item.title);
            opt.value = moduleUrl(item, mode);
            opt.selected = item.id === lessonId;
            select.append(opt);
        }
        select.addEventListener('change', () => {
            location.href = select.value;
        });
        label.append(select);
        chooser.append(label);
        const back = make('a', 'Read the lesson →');
        back.href = current.url;
        chooser.append(back);
        header.after(chooser);
        const outline = $('.outline-lessons');
        outline.replaceChildren(...(mode === 'practice' ? ordinary : labs).map(item => {
            const li = make('li');
            const a = make('a', item.title);
            a.href = moduleUrl(item, mode);
            if (item.id === lessonId)
                li.className = 'current';
            li.append(a);
            return li;
        }));
        for (const form of $$('[data-exercise]')) {
            const isLab = (labExercises[lessonId] || []).includes(form.dataset.exercise);
            if (isLab === (mode === 'labs'))
                form.classList.add('module-visible');
        }
        const end = make('div', undefined, 'module-end');
        const sequence = mode === 'practice' ? ordinary : labs;
        const index = sequence.findIndex(item => item.id === lessonId);
        for (const [item, label] of [[sequence[index - 1], '← Previous topic'], [sequence[index + 1], 'Next topic →']]) {
            if (item) {
                const a = make('a', label, 'secondary');
                a.href = moduleUrl(item, mode);
                end.append(a);
            }
        }
        const study = make('a', 'Return to lesson', 'primary');
        study.href = current.url;
        end.append(study);
        $('.lesson-main').append(end);
    }
    let allStatuses = {};
    let status = null;
    let draft = {};
    try {
        draft = JSON.parse((window.AxionStorage || localStorage).getItem(draftKey) || '{}') || {};
    }
    catch { }
    function $(selector, root = document) {
        return root.querySelector(selector);
    }
    function $$(selector, root = document) {
        return [...root.querySelectorAll(selector)];
    }
    function setText(selector, text) {
        const el = $(selector);
        if (el)
            el.textContent = text;
    }
    function readTheme() {
        try {
            return (window.AxionStorage || localStorage).getItem(themeKey) === 'dark' ? 'dark' : 'light';
        }
        catch {
            return 'light';
        }
    }
    function initHeader() {
        document.documentElement.dataset.theme = readTheme();
        const nav = page === 'progress' ? (reviewMode ? 'review' : 'progress') : 'courses';
        const links = [['courses', 'index.html', 'Courses'], ['review', 'course-progress.html?view=review', 'Review'], ['progress', 'course-progress.html', 'Progress']];
        $('#course-header').className = 'site-header';
        $('#course-header').innerHTML = `<div class="header-inner"><a class="brand" href="index.html"><span class="brand-mark">A</span>Axion</a><nav class="main-nav" aria-label="Main navigation">${links.map(([key, url, label]) => `<a href="${url}"${nav === key ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav><button class="theme-toggle" id="course-theme" type="button"></button></div>`;
        const button = $('#course-theme');
        function label() {
            button.textContent = document.documentElement.dataset.theme === 'dark' ? 'Light mode' : 'Dark mode';
        }
        label();
        button.addEventListener(
            'click',
            () => {
                const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
                document.documentElement.dataset.theme = next;
                try {
                    (window.AxionStorage || localStorage).setItem(themeKey, next);
                }
                catch { }
                label();
            });
    }
    async function api(suffix = '', data, id = lessonId) {
        const options = data === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
        const response = await fetch('/api/course/' + id + suffix, options);
        const result = await response.json();
        if (!response.ok)
            throw Error(result.error || 'The request failed.');
        return result;
    }
    function saveDraft() {
        try {
            (window.AxionStorage || localStorage).setItem(draftKey, JSON.stringify(draft));
        }
        catch { }
    }
    function values(root) {
        const answer = {};
        $$('input[name], select[name]', root).forEach(el => {
            if (el.type !== 'radio' || el.checked)
                answer[el.name] = el.value;
        });
        return answer;
    }
    function restore(root, key) {
        const saved = draft[key] || {};
        $$('input[name], select[name]', root).forEach(el => {
            if (!Object.hasOwn(saved, el.name))
                return;
            if (el.type === 'radio')
                el.checked = el.value === saved[el.name];
            else
                el.value = saved[el.name];
        });
    }
    function track(root, key) {
        restore(root, key);
        root.addEventListener(
            'input',
            e => {
                draft[key] = values(root);
                saveDraft();
                e.target.removeAttribute('aria-invalid');
                if (e.target.type === 'radio')
                    $$('input[type=radio]', root).filter(el => el.name === e.target.name).forEach(el => el.removeAttribute('aria-invalid'));
            });
    }
    function message(el, text, kind = '') {
        el.textContent = text;
        el.className = 'feedback' + (kind ? ' ' + kind : '');
    }
    function markFields(root, fields) {
        $$('input[name], select[name]', root).forEach(el => {
            if (el.type === 'radio')
                return;
            if (Object.hasOwn(fields, el.name)) {
                if (fields[el.name])
                    el.removeAttribute('aria-invalid');
                else
                    el.setAttribute('aria-invalid', 'true');
            }
        });
    }
    function resumeUrl(lesson = current, data = status) {
        if (!data || data.completed)
            return lesson.url;
        const next = Object.keys(lesson.sections).find(id => !data.practice[id].solved);
        return lesson.url + '#' + (next ? lesson.sections[next][1] : 'assessment');
    }
    function applyHome() {
        for (const group of groups) {
            const key = group.items[0].id.startsWith('limits') ? 'limits' : 'quadratic';
            const ordinary = group.items.slice(0, -1);
            const completed = ordinary.filter(item => allStatuses[item.id].completed).length;
            const next = group.items.find(item => !allStatuses[item.id].completed);
            const attempted = group.items.some(item => Object.values(allStatuses[item.id].practice).some(p => p.attempts) || allStatuses[item.id].assessmentAttempts);
            const link = $(`[data-resume="${key}"]`);
            const status = $(`[data-summary="${key}"]`);
            if (status)
                status.textContent = next ? `${completed} of ${ordinary.length} lessons completed. Next: ${next.title}.` : 'Course completed, including the final assessment.';
            if (link) {
                const target = next || group.items[0];
                link.href = attempted ? resumeUrl(target, allStatuses[target.id]) : target.url;
                link.textContent = next ? (attempted ? 'Continue course →' : 'Start course →') : 'Review course →';
            }
            for (const lesson of group.items) {
                const row = $(`[data-course-lesson="${lesson.id}"]`);
                const data = allStatuses[lesson.id];
                if (row)
                    row.textContent = data.completed ? 'Completed' : data.practiceTotal ? `${data.solved}/${data.practiceTotal} exercises solved` : data.latestAssessment ? `Latest score: ${data.latestAssessment.score}/${data.latestAssessment.total}` : 'Final assessment';
            }
        }
    }
    function applyStatus(data) {
        status = data;
        setText('#connection-status', '');
        setText('#sidebar-status', status.practiceTotal ? `${status.solved} of ${status.practiceTotal} exercises solved` : 'Course assessment');
        setText('#sidebar-assessment', status.latestAssessment ? `Latest assessment: ${status.latestAssessment.score}/${status.latestAssessment.total}` : 'Assessment not completed');
        $('#lesson-progress').value = status.solved + (status.completed || status.latestAssessment?.passed ? 1 : 0);
        for (const form of $$('[data-exercise]')) {
            const record = status.practice[form.dataset.exercise];
            $('.exercise-state', form).textContent = record.solved ? 'Solved ✓' : record.attempts ? `${record.attempts} attempt${record.attempts === 1 ? '' : 's'}` : '';
        }
        setText(
            '#lesson-completion',
            lessonId.endsWith('-final') ? (status.completed ? 'Final assessment passed. Course completion also requires all lessons.' : 'Your assessment results are saved automatically.') : status.completed ? 'Lesson completed. All exercises and the assessment have been passed.' : `Progress saved: ${status.solved}/${status.practiceTotal} exercises solved${status.latestAssessment ? ` · latest assessment ${status.latestAssessment.score}/${status.latestAssessment.total}` : ''}.`);
    }
    function unanswered(root) {
        return $$('input[name], select[name]', root).find(el => {
            if (el.type === 'radio')
                return !$$('input[type="radio"]', root).some(r => r.name === el.name && r.checked);
            return el.required && !el.value.trim();
        });
    }
    function bindIntervalEditors() {
        for (const input of $$('input[name="solution"]')) {
            const editor = make('details', undefined, 'interval-editor');
            editor.append(make('summary', 'Build an interval instead of typing notation'));
            const rows = make('div', undefined, 'interval-rows');
            const note = make('p', 'Choose endpoints and whether they are included. Add another interval for a union.', 'small');
            const controls = make('div', undefined, 'interval-controls');
            const result = make('p', '', 'small');
            result.setAttribute('role', 'status');
            function button(text, action) {
                const b = make('button', text, 'secondary');
                b.type = 'button';
                b.addEventListener('click', action);
                return b;
            }
            function setAnswer(value) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                result.textContent = 'Answer updated: ' + value;
            }
            function addRow() {
                const row = make('div', undefined, 'interval-row');
                for (const side of ['Left', 'Right']) {
                    const group = make('label', side + ' endpoint');
                    const endpoint = make('input');
                    endpoint.placeholder = side === 'Left' ? 'e.g. -inf' : 'e.g. 4';
                    endpoint.setAttribute('aria-label', side + ' endpoint');
                    const boundary = make('select');
                    boundary.setAttribute('aria-label', side + ' endpoint inclusion');
                    for (const [value, text] of [['open', 'Open'], ['closed', 'Included']]) {
                        const option = make('option', text);
                        option.value = value;
                        boundary.append(option);
                    }
                    group.append(endpoint, boundary);
                    row.append(group);
                }
                const remove = button('Remove', () => {
                    row.remove();
                    if (!rows.children.length)
                        addRow();
                });
                row.append(remove);
                rows.append(row);
            }
            controls.append(
                button('Add interval', addRow),
                button(
                    'Use intervals',
                    () => {
                        const pieces = [];
                        for (const row of rows.children) {
                            const [lo, hi] = $$('input', row).map(el => el.value.trim());
                            const [left, right] = $$('select', row).map(el => el.value);
                            if (!lo || !hi) {
                                result.textContent = 'Enter both endpoints in each interval.';
                                return;
                            }
                            pieces.push((left === 'closed' && !/inf|∞/i.test(lo) ? '[' : '(') + lo + ', ' + hi + (right === 'closed' && !/inf|∞/i.test(hi) ? ']' : ')'));
                        }
                        const value = pieces.join(' U ');
                        if (value.length > input.maxLength) {
                            result.textContent = 'The answer is too long. Simplify your intervals.';
                            return;
                        }
                        setAnswer(value);
                    }),
                button('All real numbers', () => setAnswer('all')),
                button('Empty set', () => setAnswer('empty')));
            editor.append(note, rows, controls, result);
            input.closest('.fields').after(editor);
            addRow();
            editor.addEventListener('keydown', event => {
                if (event.key === 'Enter' && event.target.tagName === 'INPUT')
                    event.preventDefault();
            });
        }
    }
    function preparePractice(form) {
        const id = form.dataset.exercise;
        const activity = $('[data-activity]', form);
        const model = ['precision', 'construct', 'asymptote'].includes(activity?.dataset.activity);
        const workspace = model || form.classList.contains('construction') || !!$('#trajectory-graph', form);
        const fields = $('.fields, .input-table, .radio-option', form);
        if (!workspace && fields && activity?.dataset.activity !== 'steps') {
            const first = fields.closest('table') || fields;
            const title = make('div', 'Your answer', 'answer-title');
            first.before(title);
        }
        if (workspace)
            form.classList.add('model-task');
        const submit = $('button[type="submit"]', form);
        const actions = make('div', undefined, 'exercise-actions');
        submit.before(actions);
        actions.append(submit);
        if (workspace)
            submit.textContent = 'Check model';
        const clear = make('button', 'Clear answer', 'secondary clear-answer');
        clear.type = 'button';
        actions.append(clear);
        clear.addEventListener(
            'click',
            () => {
                if (form.classList.contains('construction'))
                    $('#clear-construction').click();
                else {
                    $$('input[name], select[name]', form).forEach(el => {
                        if (el.type === 'radio')
                            el.checked = false;
                        else
                            el.value = '';
                        el.removeAttribute('aria-invalid');
                    });
                    const input = $('input[name], select[name]', form);
                    if (input)
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                }
                message($(':scope > .feedback', form), '');
                $('.generated-solution', form)?.remove();
            });
        form.noValidate = true;
        form.addEventListener('input', event => {
            if (!event.target.name)
                return;
            message($(':scope > .feedback', form), '');
            $('.generated-solution', form)?.remove();
        });
    }
    function bindPractice() {
        for (const form of $$('[data-exercise]')) {
            const id = form.dataset.exercise;
            track(form, `practice:${id}`);
            preparePractice(form);
            form.addEventListener(
                'submit',
                async (event) => {
                    event.preventDefault();
                    const button = $('button[type="submit"]', form);
                    const feedback = $(':scope > .feedback', form);
                    const missing = unanswered(form);
                    if (missing) {
                        message(feedback, 'Complete the highlighted answer before checking.', 'bad');
                        missing.setAttribute('aria-invalid', 'true');
                        missing.focus();
                        return;
                    }
                    button.disabled = true;
                    message(feedback, 'Checking…');
                    try {
                        const result = await api('/practice', { id, answer: values(form) });
                        applyStatus(result.status);
                        markFields(form, result.fields);
                        const previous = $('.generated-solution', form);
                        if (previous)
                            previous.remove();
                        if (result.correct) {
                            message(feedback, 'Correct. ' + result.feedback, 'good');
                        }
                        else {
                            const wrong = Object.values(result.fields || {}).some(value => !value);
                            message(feedback, result.diagnostic || (wrong ? 'Not quite. Review the marked answer fields.' : 'Not quite. Review the requirements and try again.'), 'bad');
                            const details = make('div', undefined, 'generated-solution');
                            if (result.hint) {
                                const hint = make('details', undefined, 'optional-solution');
                                hint.append(make('summary', 'Hint'), make('p', result.hint));
                                details.append(hint);
                            }
                            if (!result.diagnostic || !result.feedback || result.diagnostic !== result.feedback) {
                                const solution = make('details', undefined, 'optional-solution');
                                solution.append(make('summary', 'Show worked solution'), make('p', result.feedback));
                                details.append(solution);
                            }
                            feedback.after(details);
                        }
                    }
                    catch (error) {
                        message(feedback, 'Could not check the answer: ' + error.message, 'bad');
                    }
                    finally {
                        button.disabled = false;
                    }
                });
        }
    }
    function bindAssessment() {
        const form = $('#assessment-form');
        const fields = $$('[data-assessment]', form);
        for (const field of fields)
            track(field, `assessment:${field.dataset.assessment}`);
        const navigation = make('nav', undefined, 'assessment-nav');
        navigation.setAttribute('aria-label', 'Assessment questions');
        const count = make('p', '', 'assessment-count');
        const numbers = make('div', undefined, 'assessment-numbers');
        const controls = make('div', undefined, 'assessment-actions');
        const prev = make('button', 'Previous', 'secondary');
        const next = make('button', 'Next question', 'secondary');
        const all = make('button', 'Show all questions', 'secondary');
        for (const b of [prev, next, all])
            b.type = 'button';
        const submit = $('button[type="submit"]', form);
        let selected = 0;
        let showAll = false;
        const buttons = fields.map((field, i) => {
            const button = make('button', String(i + 1), 'question-number');
            button.type = 'button';
            button.addEventListener('click', () => {
                showAll = false;
                show(i);
            });
            numbers.append(button);
            return button;
        });
        navigation.append(count, numbers, all);
        form.prepend(navigation);
        submit.before(controls);
        controls.append(prev, next, submit);
        form.noValidate = true;
        function update() {
            const complete = fields.filter(field => !unanswered(field)).length;
            count.textContent = `${showAll ? 'All questions' : `Question ${selected + 1} of ${fields.length}`} · ${complete}/${fields.length} answered`;
            fields.forEach((field, i) => {
                const feedback = $('.feedback', field);
                buttons[i].dataset.state = feedback?.classList.contains('good') ? 'correct' : feedback?.classList.contains('bad') ? 'incorrect' : unanswered(field) ? 'empty' : 'answered';
                buttons[i].setAttribute('aria-label', `Question ${i + 1}, ${buttons[i].dataset.state}`);
                buttons[i].setAttribute('aria-current', String(!showAll && i === selected));
            });
        }
        function show(i) {
            selected = i;
            fields.forEach((field, index) => {
                field.hidden = !showAll && index !== i;
            });
            prev.hidden = showAll || i === 0;
            next.hidden = showAll || i === fields.length - 1;
            all.textContent = showAll ? 'One question at a time' : 'Show all questions';
            update();
        }
        prev.addEventListener('click', () => show(selected - 1));
        next.addEventListener('click', () => show(selected + 1));
        all.addEventListener('click', () => {
            showAll = !showAll;
            show(selected);
        });
        form.addEventListener(
            'input',
            event => {
                const field = event.target.closest('[data-assessment]');
                if (!field)
                    return;
                message($('.feedback', field), '');
                message($('#assessment-result'), '');
                update();
            });
        show(0);
        form.addEventListener(
            'submit',
            async (event) => {
                event.preventDefault();
                const button = $('button[type="submit"]', form);
                const incomplete = fields.findIndex(field => unanswered(field));
                if (incomplete !== -1) {
                    showAll = false;
                    show(incomplete);
                    const missing = unanswered(fields[incomplete]);
                    missing.setAttribute('aria-invalid', 'true');
                    missing.focus();
                    message($('#assessment-result'), `Question ${incomplete + 1} is incomplete. Answer every question before submitting.`, 'bad');
                    return;
                }
                const answers = Object.fromEntries(fields.map(field => [field.dataset.assessment, values(field)]));
                button.disabled = true;
                message($('#assessment-result'), 'Checking your work…');
                try {
                    const result = await api('/assessment', { answers });
                    applyStatus(result.status);
                    for (const item of result.results) {
                        const field = fields.find(f => f.dataset.assessment === item.id);
                        markFields(field, item.fields);
                        message($('.feedback', field), (item.correct ? 'Correct. ' : 'Needs revision. ') + item.feedback, item.correct ? 'good' : 'bad');
                    }
                    update();
                    const firstWrong = result.results.findIndex(item => !item.correct);
                    if (firstWrong !== -1 && !showAll)
                        show(firstWrong);
                    const ending = result.passed ? (result.status.completed ? (lessonId.endsWith('-final') ? 'Final assessment passed.' : 'Lesson completed.') : 'Finish the remaining exercises to complete the lesson.') : 'Review the feedback and try again.';
                    message($('#assessment-result'), `${result.score} of ${result.total} correct. ${ending}`, result.passed ? 'good' : 'bad');
                }
                catch (error) {
                    message($('#assessment-result'), 'Could not submit the assessment: ' + error.message, 'bad');
                }
                finally {
                    button.disabled = false;
                }
            });
    }
    function graphNumber(value) {
        const text = String(value).trim().replace(/−/g, '-').replace(',', '.');
        if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text))
            return Number(text);
        const parts = text.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
        return parts && Number(parts[2]) !== 0 ? Number(parts[1]) / Number(parts[2]) : NaN;
    }
    function readable(n) {
        return String(Number(n.toPrecision(7))).replace('-', '−');
    }
    function bindGraph() {
        const graph = window.CourseGraph;
        const compare = $('#comparison-graph');
        const original = { a: 1, h: 0, k: 0, reference: true };
        const captions = {
            '1': 'The graph y = x² opens upwards. Its lowest point is (0, 0).',
            '-1': 'Reflecting y = x² in the x-axis gives y = −x². Its vertex is now a maximum.',
            '2': 'Doubling every y-value gives y = 2x². It is narrower than the original (dashed).',
            '0.5': 'Halving every y-value gives y = ½x². It is wider than the original (dashed).'
        };
        function compareA(a) {
            const model = { a, h: 0, k: 0 };
            graph.render(compare, a === 1 ? [model] : [original, model]);
            setText('#comparison-caption', captions[a]);
        }
        compareA(1);
        for (const button of $$('#compare-buttons button'))
            button.addEventListener('click', () => {
                $$('#compare-buttons button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
                compareA(Number(button.dataset.a));
            });
        function translate(h, k) {
            graph.render($('#translation-graph'), h || k ? [original, { a: 1, h, k }] : [{ a: 1, h, k }]);
            setText('#translation-caption', h === 0 ? 'y = x²; vertex (0, 0).' : k === 0 ? 'y = (x − 2)²; vertex (2, 0). The original is dashed.' : 'y = (x − 2)² − 3; vertex (2, −3). The original is dashed.');
        }
        translate(0, 0);
        for (const button of $$('#translation-buttons button'))
            button.addEventListener(
                'click',
                () => {
                    $$('#translation-buttons button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
                    translate(Number(button.dataset.h), Number(button.dataset.k));
                });
        graph.render($('#example-graph'), [{ a: 2, h: 2, k: -5 }], [{ x: 0, y: 3 }, { x: 4, y: 3 }]);
        const form = $('[data-exercise="construct"]');
        const area = $('#construction-graph');
        let choosing = 'vertex';
        let second = null;
        const field = name => $(`[name="${name}"]`, form);
        function getModel() {
            return Object.fromEntries(['h', 'k', 'a'].map(key => [key, graphNumber(field(key).value)]));
        }
        function draw() {
            const model = getModel();
            const hasVertex = Number.isFinite(model.h) && Number.isFinite(model.k);
            const valid = hasVertex && Number.isFinite(model.a) && model.a !== 0 && [model.a, model.h, model.k].every(v => Math.abs(v) <= 10000);
            const visibleVertex = hasVertex && [model.h, model.k].every(v => Math.abs(v) <= 10000);
            const points = visibleVertex ? [{ x: model.h, y: model.k, label: `Vertex (${readable(model.h)}, ${readable(model.k)})` }] : [];
            if (second)
                points.push(second);
            graph.render(area, valid ? [model] : [], points, choosePoint);
            const hTerm = !model.h ? 'x' : model.h > 0 ? `(x − ${readable(model.h)})` : `(x + ${readable(-model.h)})`;
            const aTerm = model.a === 1 ? '' : model.a === -1 ? '−' : readable(model.a);
            setText('#construction-equation', valid ? `f(x) = ${aTerm}${hTerm}²${model.k > 0 ? ' + ' + readable(model.k) : model.k < 0 ? ' − ' + readable(-model.k) : ''}` : 'f(x) = a(x − h)² + k');
            setText('#construct-mode', choosing === 'point' ? 'Select a second point' : valid ? 'Drawing ready. Edit coefficients or start a new drawing.' : 'Select the vertex');
        }
        function choosePoint(x, y) {
            if (choosing === 'vertex' && Object.values(getModel()).every(Number.isFinite))
                return;
            if (choosing === 'vertex') {
                field('h').value = x;
                field('k').value = y;
                field('a').value = '';
                second = null;
                choosing = 'point';
            }
            else {
                const model = getModel();
                if (x === model.h || y === model.k) {
                    message($('.feedback', form), 'Choose a point with a different x-coordinate and height from the vertex.', 'bad');
                    return;
                }
                const a = (y - model.k) / (x - model.h) ** 2;
                field('a').value = a;
                second = { x, y };
                choosing = 'vertex';
            }
            $$('input', form).forEach(input => input.removeAttribute('aria-invalid'));
            draft['practice:construct'] = values(form);
            saveDraft();
            message($('.feedback', form), '');
            draw();
        }
        form.addEventListener('input', () => {
            second = null;
            choosing = 'vertex';
            draw();
        });
        $('#clear-construction').addEventListener(
            'click',
            () => {
                for (const key of ['h', 'k', 'a'])
                    field(key).value = '';
                second = null;
                choosing = 'vertex';
                $$('input', form).forEach(input => input.removeAttribute('aria-invalid'));
                draft['practice:construct'] = values(form);
                saveDraft();
                message($('.feedback', form), '');
                draw();
            });
        draw();
    }
    function bindOutline() {
        if (!('IntersectionObserver' in window))
            return;
        const observer = new IntersectionObserver(
            entries => {
                for (const entry of entries)
                    if (entry.isIntersecting) {
                        $$('.lesson-outline a').forEach(a => a.classList.toggle('active', a.hash === '#' + entry.target.id));
                    }
            },
            { rootMargin: '-18% 0px -65% 0px' });
        $$('.lesson-section').forEach(section => observer.observe(section));
    }
    function make(tag, text, cls) {
        const element = document.createElement(tag);
        if (text !== undefined)
            element.textContent = text;
        if (cls)
            element.className = cls;
        return element;
    }
    function reviewItem(list, title, description, section, lesson) {
        const li = make('li');
        li.append(make('strong', title), make('p', description));
        const link = make('a', 'Review section →', 'text-link');
        link.href = lesson.url + '#' + section;
        li.append(link);
        list.append(li);
    }
    function renderProgress() {
        if (reviewMode) {
            setText('#progress-title', 'Review');
            setText('#progress-subtitle', 'Return to the sections that need more practice.');
        }
        const cards = [];
        if (!reviewMode) {
            const ordinary = lessons.filter(item => !item.id.endsWith('-final'));
            const completed = ordinary.filter(item => allStatuses[item.id].completed).length;
            const passed = lessons.filter(item => item.id.endsWith('-final') && allStatuses[item.id].completed).length;
            setText('#progress-subtitle', `${completed} of ${ordinary.length} lessons completed · ${passed} of ${groups.length} final assessments passed.`);
        }
        const review = $('#review-content');
        review.replaceChildren(make('h2', 'Sections to review'));
        const list = make('ul', undefined, 'review-list');
        let attempted = false;
        for (const lesson of lessons) {
            const data = allStatuses[lesson.id];
            const group = groups.find(g => g.items[0] === lesson);
            if (group)
                cards.push(make('h2', group.title, 'progress-course-title'));
            const box = make('div', undefined, 'progress-card');
            box.append(make('h2', lesson.title), make('p', data.completed ? 'Completed' : 'Not completed'));
            const progress = make('progress');
            progress.max = data.practiceTotal + 1;
            progress.value = data.solved + (data.completed || data.latestAssessment?.passed ? 1 : 0);
            progress.setAttribute('aria-label', 'Lesson progress');
            box.append(progress);
            const metrics = make('div', undefined, 'progress-metrics');
            const count = Object.values(data.practice).reduce((sum, p) => sum + p.attempts, 0);
            attempted ||= Boolean(count || data.assessmentAttempts);
            for (const [value, name] of [
                ...(data.practiceTotal ? [[`${data.solved}/${data.practiceTotal}`, 'Exercises solved']] : []),
                ...(data.notebookTotal ? [[`${data.notebookSolved}/${data.notebookTotal}`, 'Notebook exercises']] : []),
                [data.latestAssessment ? `${data.latestAssessment.score}/${data.latestAssessment.total}` : '—', 'Latest assessment'],
                [count + data.assessmentAttempts, 'Submissions']
            ]) {
                const item = make('div');
                item.append(make('strong', value), make('span', name));
                metrics.append(item);
            }
            box.append(metrics);
            const resume = make('a', data.completed ? 'Review lesson' : 'Continue lesson', 'primary');
            resume.href = resumeUrl(lesson, data);
            box.append(resume);
            cards.push(box);
            for (const [id, [name, section]] of Object.entries(lesson.sections)) {
                const record = data.practice[id];
                if (!record.solved && record.latest)
                    reviewItem(list, lesson.title + ' · ' + name, record.latest.hint || record.latest.feedback, section, lesson);
            }
            for (const item of data.latestAssessment?.results || []) {
                if (!item.correct) {
                    const [name, section, target] = lesson.assessment[item.id];
                    reviewItem(list, lesson.title + ' · ' + name, item.feedback, section, target ? lessons.find(l => l.id === target) : lesson);
                }
            }
        }
        $('#progress-content').replaceChildren(...cards);
        if (list.childElementCount)
            review.append(list);
        else
            review.append(make('p', attempted ? 'No unresolved mistakes in your latest results.' : 'Attempt the lesson exercises to see review suggestions here.'));
    }
    initHeader();
    if (page === 'lesson' && window.matchMedia('(max-width: 700px)').matches)
        $('.course-outline').open = false;
    if (page === 'lesson') {
        initModules();
        bindPractice();
        bindAssessment();
        if (lessonId === 'quadratic-1')
            bindGraph();
        else {
            window.CourseAlgebraUI?.bind();
            window.CourseApplicationsUI?.bind();
            window.LimitsUI?.bind();
        }
        bindIntervalEditors();
        window.MathField?.bind();
        document.addEventListener('notebook-status', event => applyStatus(event.detail));
        window.CourseNotebookUI?.bind();
        bindOutline();
    }
    const loading = page === 'lesson' ? api().then(applyStatus) : Promise.all(lessons.map(async (lesson) => [lesson.id, await api('', undefined, lesson.id)])).then(entries => {
        allStatuses = Object.fromEntries(entries);
        if (page === 'home')
            applyHome();
        else
            renderProgress();
    });
    loading.catch(error => {
        const text = 'Saved results could not be loaded. Open Axion through the Node.js server and try again.';
        if (page === 'lesson')
            setText('#connection-status', text);
        if (page === 'home')
            $$('[data-summary]').forEach(el => el.textContent = text);
        if (page === 'progress')
            setText('#progress-content', text);
    });
})();
