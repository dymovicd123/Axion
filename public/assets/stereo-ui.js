(function () {
    const L = StereoLessons,
        M = StereoModel,
        P = ProjectMath,
        q = new URLSearchParams(location.search),
        index = Math.max(0, Math.min(L.length - 1, Math.trunc(Number(q.get('lesson'))) - 1 || 0)),
        mode = ['practice', 'labs', 'final', 'generator'].includes(q.get('mode')) ? q.get('mode') : 'study',
        lesson = L[index],
        main = document.getElementById('stereo-main');
    const url = (i, m = 'study') => `stereometry.html?lesson=${i + 1}&mode=${m}`;
    const key = 'axion-stereo-progress-v2';
    let progress = {};
    try {
        progress = JSON.parse((window.AxionStorage || localStorage).getItem(key) || '{}') || {};
    }
    catch { }
    const save = (id, complete) => {
        progress[id] = complete;
        try {
            (window.AxionStorage || localStorage).setItem(key, JSON.stringify(progress));
        }
        catch { }
        ;
        sidebar();
    };
    document.documentElement.dataset.theme = (window.AxionStorage || localStorage).getItem('axion-theme') || 'light';
    document.getElementById('course-header').innerHTML = '<div class="header-inner"><a class="brand" href="index.html"><span class="brand-mark">A</span>Axion</a><nav class="main-nav"><a aria-current="page" href="index.html">Courses</a><a href="course-progress.html?view=review">Review</a><a href="course-progress.html">Progress</a></nav><button class="theme-toggle" id="theme">Toggle theme</button></div>';
    document.getElementById('theme').onclick = () => {
        const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = t;
        (window.AxionStorage || localStorage).setItem('axion-theme', t);
        document.dispatchEvent(new Event('axion-theme'));
    };
    function sidebar() {
        document.getElementById('stereo-sidebar').innerHTML = `<a class="back-link" href="index.html">← All courses</a><h3>Solid geometry</h3><p class="small">${L.filter((_, i) => progress['practice' + i]).length}/5 practice sets completed</p><ol class="outline-lessons">${L.map((l, i) => `<li class="${i === index && mode !== 'final' ? 'current' : ''}"><a href="${url(i, mode === 'final' ? 'study' : mode)}">${i + 1}. ${l.title}${progress['practice' + i] ? ' ✓' : ''}</a>${mode === 'study' && i === index ? `<nav class="lesson-outline" aria-label="Lesson sections">${l.sections.map(([name], j) => `<a href="#theory-${j + 1}">${j + 1}. ${name}</a>`).join('')}</nav>` : ''}</li>`).join('')}<li><a href="${url(0, 'final')}">Final assessment${progress.final ? ' ✓' : ''}</a></li></ol>`;
    }
    sidebar();
    main.innerHTML = `<nav class="course-module-tabs">${['study', 'practice', 'labs', 'generator', 'final'].map(m => `<a href="${url(index, m)}" ${m === mode ? 'aria-current="page"' : ''}>${({ study: 'Study', practice: 'Practice', labs: 'Labs', generator: 'Generator', final: 'Assessment' })[m]}</a>`).join('')}</nav><header class="lesson-header"><p class="eyebrow">Solid geometry · ${mode === 'final' ? 'Final assessment' : `Lesson ${index + 1} of 5`}</p><h1>${mode === 'final' ? 'Final assessment' : mode === 'generator' ? 'Problem generator' : lesson.title}</h1><p class="lead">${mode === 'final' ? 'Review all five topics without hints before submitting.' : mode === 'generator' ? 'Generate new geometry problems with their own model, construction goals and calculations.' : lesson.intro}</p></header><div id="stereo-body"></div><div class="module-end">${index > 0 && mode !== 'final' ? `<a class="secondary" href="${url(index - 1, mode)}">← Previous lesson</a>` : ''}${index < 4 && mode !== 'final' ? `<a class="primary" href="${url(index + 1, mode)}">Next lesson →</a>` : `<a class="primary" href="${url(0, 'final')}">Final assessment →</a>`}</div>`;
    const body = document.getElementById('stereo-body');
    if (mode !== 'study')
        document.body.classList.add('stereo-work-page');
    if (mode === 'study') {
        body.innerHTML = `<div class="worked stereo-goals"><h3>In this lesson</h3><ol>${lesson.sections.map(([title], i) => `<li><a href="#theory-${i + 1}">${title}</a></li>`).join('')}</ol></div>` + lesson.sections.map(([title, text], i) => `<section class="lesson-section stereo-theory" id="theory-${i + 1}"><h2>${i + 1}. ${title}</h2>${text}</section>`).join('') + StereoWorkspace.study(index) + `<section class="lesson-section"><h2>Try it yourself</h2><p>Use the construction tools in Practice to solve problems. Labs are separate investigations.</p><a class="primary" href="${url(index, 'practice')}">Practice this topic →</a></section>`;
    }
    else if (mode === 'generator') {
        const G = StereoGenerator;
        const k = 'axion-stereo-generator-current';
        let config;
        try {
            config = JSON.parse((window.AxionStorage || localStorage).getItem(k) || 'null');
        }
        catch { }
        if (!config || !Number.isInteger(config.topic) || config.topic < 0 || config.topic > 4 || !Number.isInteger(config.level) || config.level < 0 || config.level > 2 || !Number.isInteger(config.seed) || config.seed < 0 || config.seed > 4294967295)
            config = { topic: index, level: 1, seed: Math.floor(Math.random() * 4294967296) };
        body.innerHTML = `<section class="stereo-generator-panel"><div><label for="gen-topic">Topic</label><select id="gen-topic">${G.topics.map((v, i) => `<option value="${i}">${v}</option>`).join('')}</select></div><div><label for="gen-level">Difficulty</label><select id="gen-level">${G.levels.map((v, i) => `<option value="${i}">${v}</option>`).join('')}</select></div><button class="primary" id="gen-new">Generate problem</button><div><label for="gen-history">Recent problems</label><select id="gen-history"><option value="">Current problem</option></select></div><p class="small" id="gen-info"></p></section><div id="generated-work"></div>`;
        const topic = body.querySelector('#gen-topic'),
            level = body.querySelector('#gen-level'),
            work = body.querySelector('#generated-work');
        topic.value = config.topic;
        level.value = config.level;
        let dispose;
        const recentKey = 'axion-stereo-generator-recent';
        let recent = [];
        try {
            recent = JSON.parse((window.AxionStorage || localStorage).getItem(recentKey) || '[]') || [];
        }
        catch { }
        if (!Array.isArray(recent))
            recent = [];
        const recentSelect = body.querySelector('#gen-history');
        function render() {
            dispose?.();
            const t = G.generate(config.topic, config.level, config.seed);
            recent = [config, ...recent.filter(c => c.topic !== config.topic || c.level !== config.level || c.seed !== config.seed)].slice(0, 15);
            try {
                (window.AxionStorage || localStorage).setItem(k, JSON.stringify(config));
                (window.AxionStorage || localStorage).setItem(recentKey, JSON.stringify(recent));
            }
            catch { }
            recentSelect.innerHTML = '<option value="">Current problem</option>' + recent.slice(1).map((c, i) => `<option value="${i + 1}">${G.topics[c.topic]} · ${G.levels[c.level]} · #${c.seed}</option>`).join('');
            recentSelect.value = '';
            body.querySelector('#gen-info').textContent = `${t.difficulty} · ${config.level === 2 ? 'Independent: no hints or measurements' : 'Guided practice with hints and measurement'} · Draft saved in this browser`;
            dispose = StereoWorkspace.mount(work, [t], config.level === 2 ? 'final' : 'generator', () => { });
        }
        recentSelect.onchange = () => {
            if (recentSelect.value === '')
                return;
            config = recent[Number(recentSelect.value)];
            topic.value = config.topic;
            level.value = config.level;
            render();
        };
        body.querySelector('#gen-new').onclick = () => {
            config = { topic: Number(topic.value), level: Number(level.value), seed: Math.floor(Math.random() * 4294967296) };
            render();
        };
        render();
    }
    else {
        const tasks = mode === 'final' ? StereoTasks.final : mode === 'labs' ? [StereoTasks.labs[index]] : StereoTasks.practice[index];
        StereoWorkspace.mount(body, tasks, mode, complete => save(mode === 'final' ? 'final' : mode === 'labs' ? 'lab' + index : 'practice' + index, complete));
    }
})();
