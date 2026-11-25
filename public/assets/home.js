Axion.init('Archive');
const app = document.getElementById('app');
const topics = [
    {
        title: 'Geometry', description: 'Construct circles, tangent lines and shortest paths.', projects: ['circumcircle', 'path', 'tangent'], lesson: null
    },
    {
        title: 'Functions and limits', description: 'Describe shapes with functions and investigate their behavior.', projects: ['container'], lesson: 'limits-basics'
    },
    {
        title: 'Differential calculus', description: 'Find optimal dimensions and study rates of change.', projects: ['box'], lesson: 'derivatives'
    },
    {
        title: 'Integral calculus and 3D geometry',
        description: 'Calculate volumes and explore cross-sections of solids.',
        projects: ['container', 'section'],
        lesson: 'integrals'
    }
];
const featured = ['container', 'box', 'section'];
app.innerHTML = `<h1 class="page-heading">Previous materials</h1>
<p class="lead">Earlier lessons, projects and tools, kept separately from the new course.</p>
<div class="section-heading"><h2>Projects</h2><a href="project.html">View all six →</a></div>
<div class="module-list">${featured.map(id => {
    const p = ProjectMath.projects.find(p => p.id === id);
    return `<a class="module-row" href="project.html?id=${p.id}"><div><b>${p.title}</b><p>${p.description}</p></div><span class="tag" data-home-project="${p.id}">3D</span><span class="module-arrow">→</span></a>`;
}).join('')}</div>
<div class="section-heading"><h2>Geometry workshop</h2><a href="project.html">All constructions →</a></div>
<div class="module-list">${ProjectMath.projects.filter(p => p.type === 'geometry').map(p => `<a class="module-row" href="project.html?id=${p.id}"><div><b>${p.title}</b><p>${p.description}</p></div><span class="tag" data-home-project="${p.id}">${p.level}</span><span class="module-arrow">→</span></a>`).join('')}</div>
<div class="section-heading"><h2>Study by topic</h2></div>
<div class="grid">${topics.map(t => `<section class="card"><h3>${t.title}</h3><p>${t.description}</p>${t.lesson ? `<p><a href="learn.html?lesson=${t.lesson}">Read lesson →</a></p>` : ''}${t.projects.map(id => {
    const p = ProjectMath.projects.find(p => p.id === id);
    return `<p><a href="project.html?id=${id}">${p.title} →</a></p>`;
}).join('')}</section>`).join('')}</div>
<div class="section-heading"><h2>Study record</h2><a href="my-progress.html">Progress →</a></div>
<div class="stat-row" id="stats"><div class="stat"><strong>—</strong><span>Projects completed</span></div><div class="stat"><strong>—</strong><span>Lessons completed</span></div><div class="stat"><strong>—</strong><span>Problems solved</span></div></div>
<div class="section-heading"><h2>Tools and practice</h2></div>
<div class="grid"><a class="card" href="function-studio.html"><h3>Function Studio</h3><p>Plot your own functions and investigate limits.</p></a><a class="card" href="practice.html"><h3>Practice problems</h3><p>Calculation, algebra and concept exercises.</p></a></div>
<footer class="footer">Axion · Web Programming Project</footer>`;
Promise.all([Axion.api('/progress'), Axion.api('/study/status'), Axion.api('/projects/status')]).then(([progress, state, projects]) => {
    const done = new Set(projects.filter(r => r.correct).map(r => r.project));
    const lessons = new Set(progress.filter(p => Axion.lessons.some(l => 'lesson:' + l[0] === p.activity)).map(p => p.activity));
    const solved = new Set(state.attempts.filter(a => a.correct && a.finished).map(a => a.questionId));
    document.getElementById('stats').innerHTML = `<div class="stat"><strong>${done.size}/6</strong><span>Projects completed</span></div><div class="stat"><strong>${lessons.size}/6</strong><span>Lessons completed</span></div><div class="stat"><strong>${solved.size}/24</strong><span>Problems solved</span></div>`;
    for (const id of done) {
        const el = document.querySelector(`[data-home-project="${id}"]`);
        if (el) {
            el.textContent = 'Completed';
            el.className = 'tag good';
        }
    }
}).catch(() => { });
