(function () {
    const lessons = [
        ['limits-basics', 'Understanding limits'],
        ['limits-sides', 'One-sided limits'],
        ['limits-continuity', 'Continuity & discontinuities'],
        ['limits-algebra', 'Calculating limits'],
        ['derivatives', 'Introduction to derivatives'],
        ['integrals', 'Introduction to integrals']
    ];
    const sections = [
        ['archive.html', 'Archive'],
        ['project.html', 'Projects'],
        ['learn.html', 'Learn'],
        ['practice.html', 'Practice'],
        ['function-studio.html', 'Tools'],
        ['my-progress.html', 'Progress']
    ];
    const themeKey = 'axion-theme';
    function init(section) {
        const theme = localStorage.getItem(themeKey) || 'light';
        document.documentElement.dataset.theme = theme;
        document.getElementById('site-header').innerHTML = `<div class="topbar"><div class="topbar-inner"><a class="brand" href="index.html"><b>A</b> Axion</a><nav class="top-nav" aria-label="Main navigation">${sections.map(([file, label]) => `<a href="${file}" class="${section === label ? 'active' : ''}">${label}</a>`).join('')}</nav><div class="top-controls"><button id="theme-toggle" class="theme-button" type="button">${theme === 'dark' ? 'Light' : 'Dark'} mode</button></div></div></div>`;
        const side = document.getElementById('site-sidebar');
        if (side) {
            side.className = 'sidebar';
            side.innerHTML = `<div class="side-heading">Projects</div><a class="side-link" href="project.html">All projects</a><a class="side-link" href="project.html?id=container">Vessel design</a><a class="side-link" href="project.html?id=box">Box optimization</a><a class="side-link" href="project.html?id=section">Cube cross-sections</a><div class="side-heading">Limits</div>${lessons.slice(0, 4).map(([id, label], i) => `<a class="side-link" data-lesson="${id}" href="learn.html?lesson=${id}"><span>${String(i + 1).padStart(2, '0')} · ${label}</span></a>`).join('')}<div class="side-heading">Other topics</div>${lessons.slice(4).map(([id, label]) => `<a class="side-link" data-lesson="${id}" href="learn.html?lesson=${id}">${label}</a>`).join('')}<div class="side-heading">Tools</div>
<a class="side-link" href="function-studio.html">Function Studio</a>
<a class="side-link" href="labs.html?lab=slope">Calculus demonstrations</a>
<a class="side-link" href="practice.html">Problem sets</a>`;
            const id = new URLSearchParams(location.search).get('lesson');
            if (id) {
                const link = side.querySelector(`[data-lesson="${id}"]`);
                if (link)
                    link.classList.add('active');
            }
        }
        document.getElementById('theme-toggle')?.addEventListener(
            'click',
            () => {
                const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
                document.documentElement.dataset.theme = next;
                localStorage.setItem(themeKey, next);
                document.getElementById('theme-toggle').textContent = (next === 'dark' ? 'Light' : 'Dark') + ' mode';
                document.dispatchEvent(new Event('axion-theme'));
            });
    }
    async function api(path, options) {
        const res = await fetch('/api' + path, { ...options, headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) } });
        const type = res.headers.get('content-type') || '';
        if (!type.includes('application/json'))
            throw Error('Server returned a non-JSON response');
        const data = await res.json();
        if (!res.ok)
            throw Error(data.error || 'Request failed');
        return data;
    }
    function math(root = document) {
        if (window.MathJax?.startup?.promise) {
            window.MathJax.startup.promise.then(() => window.MathJax.typesetPromise([root])).catch(() => { });
        }
    }
    function fb(el, message, kind) {
        el.textContent = message;
        el.className = 'feedback' + (kind ? ' ' + kind : '');
    }
    function escape(value) {
        return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    }
    function pct(done, total) {
        return total ? Math.round(done / total * 100) : 0;
    }
    window.Axion = { init, api, math, fb, escape, pct, lessons };
})();
