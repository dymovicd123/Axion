Axion.init('Progress');
const app = document.getElementById('app');
const lessonList = [
    ['limits-basics', 'Understanding limits', 'lesson:limits-basics'],
    ['limits-sides', 'One-sided limits', 'lesson:limits-sides'],
    ['limits-continuity', 'Continuity', 'lesson:limits-continuity'],
    ['limits-algebra', 'Calculating limits', 'lesson:limits-algebra'],
    ['derivatives', 'Derivatives', 'lesson:derivatives'],
    ['integrals', 'Integrals', 'lesson:integrals']
];
const skills = [
    ['concept', 'Understanding limits'],
    ['sides', 'One-sided limits'],
    ['continuity', 'Continuity'],
    ['algebra', 'Calculating limits'],
    ['derivatives', 'Derivatives'],
    ['integrals', 'Integrals']
];
const labGroups = [
    ['function-studio', 'Function Studio'], ['studio', 'Limit demonstration'], ['builder', 'Piecewise demonstration'], ['slope', 'Slope Lab'], ['area', 'Area Lab']
];
app.innerHTML = `<p class="eyebrow">Learning record</p>
<h1 class="page-heading">My progress</h1>
<p class="lead">Completed lessons, solved exercises and lab results saved on this server.</p>
<div id="summary" class="stat-row"></div>
<div class="section-heading"><h2>Projects</h2><p>Submitted constructions and models</p></div>
<div id="project-progress" class="module-list"></div>
<div class="section-heading">
<h2>Lessons</h2>
<p>Marked after the review question</p>
</div>
<div id="lessons" class="module-list">
</div>
<div class="section-heading">
<h2>Practice</h2>
<p>Correct answers by topic</p>
</div>
<div id="skills" class="grid">
</div>
<div class="section-heading">
<h2>Experiments</h2>
<p>Completed lab tasks</p>
</div>
<div id="labs" class="grid">
</div>
<div class="section-heading">
<h2>Recent attempts</h2>
<p>Latest submitted answers</p>
</div>
<div class="panel" id="recent">
<div class="empty">Loading your learning record…</div>
</div>
<div class="section-heading">
<h2>About saved data</h2>
</div>
<div class="notice">Axion currently has no accounts. Anyone using the same server sees the same saved progress.</div>
<div class="actions" style="margin-top:16px">
<button class="btn danger" id="reset">Clear learning record</button>
<span class="feedback" id="reset-feedback" role="status">
</span>
</div>`;
async function refresh() {
    try {
        const [progress, state, projects] = await Promise.all([Axion.api('/progress'), Axion.api('/study/status'), Axion.api('/projects/status')]);
        const done = new Set(progress.map(r => r.activity)), solved = new Set(state.attempts.filter(a => a.correct && a.finished).map(a => a.questionId));
        const completedLabs = state.labs || [];
        const finishedProjects = new Set(projects.filter(r => r.correct).map(r => r.project));
        document.getElementById('project-progress').innerHTML = ProjectMath.projects.map(p => {
            const entries = projects.filter(r => r.project === p.id);
            return `<a class="module-row" href="project.html?id=${p.id}"><div><b>${p.title}</b><p>${entries.length} submitted solution${entries.length === 1 ? '' : 's'}</p></div><span class="tag ${finishedProjects.has(p.id) ? 'good' : ''}">${finishedProjects.has(p.id) ? 'Completed' : entries.length ? 'In progress' : 'Not started'}</span></a>`;
        }).join('');
        document.getElementById('summary').innerHTML = `<div class="stat"><strong>${lessonList.filter(l => done.has(l[2])).length}/6</strong><span>Lessons completed</span></div><div class="stat"><strong>${solved.size}/24</strong><span>Problems solved</span></div><div class="stat"><strong>${finishedProjects.size}/6</strong><span>Projects completed</span></div>`;
        document.getElementById('lessons').innerHTML = lessonList.map(([id, title, activity], i) => `<a class="module-row" href="learn.html?lesson=${id}"><span class="module-number">${i + 1}</span><div><b>${title}</b><p>${done.has(activity) ? 'Knowledge check passed' : 'Not completed'}</p></div><span class="tag ${done.has(activity) ? 'good' : ''}">${done.has(activity) ? 'Completed' : 'To learn'}</span></a>`).join('');
        document.getElementById('skills').innerHTML = skills.map(([key, title]) => {
            const attempted = state.attempts.filter(a => a.skill === key), passed = new Set(attempted.filter(a => a.correct && a.finished).map(a => a.questionId)).size;
            return `<a class="card" href="practice.html?skill=${key}"><div class="stage-header"><b>${title}</b><span class="tag">${passed}/4</span></div><div class="progress-track"><div style="width:${passed * 25}%"></div></div><p>${attempted.length} checks submitted · ${passed === 4 ? '4 problems completed' : 'Open remaining problems'}</p><span class="card-bottom">Open problems →</span></a>`;
        }).join('');
        document.getElementById('labs').innerHTML = labGroups.map(([id, title]) => {
            const passed = completedLabs.filter(r => r.kind === id).length;
            return `<a class="card" href="${id === 'function-studio' ? 'function-studio.html' : 'labs.html?lab=' + id}"><div class="stage-header"><b>${title}</b><span class="tag ${passed ? 'good' : ''}">${passed} passed</span></div><p>Open the lab to see its tasks.</p><span class="card-bottom">Open lab →</span></a>`;
        }).join('');
        const attempts = [...state.attempts].reverse().slice(0, 10);
        document.getElementById('recent').innerHTML = attempts.length ? `<table class="data-table"><thead><tr><th>Question</th><th>Skill</th><th>Result</th></tr></thead><tbody>${attempts.map(r => `<tr><td>${Axion.escape(r.questionId)}</td><td>${Axion.escape(r.skill)}</td><td>${r.correct && r.finished ? 'Solved' : 'Needs review'}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">No saved attempts yet. <a href="practice.html">Try your first problem.</a></div>';
    }
    catch (e) {
        document.getElementById('recent').innerHTML = `<div class="result-box bad">Could not load progress: ${Axion.escape(e.message)}</div>`;
    }
}
document.getElementById('reset').addEventListener(
    'click',
    async () => {
        if (!window.confirm('Clear all progress, practice attempts, lab results and project submissions on this local server? Browser drafts will remain.'))
            return;
        try {
            await Axion.api('/study/reset', { method: 'DELETE' });
            await Axion.api('/progress', { method: 'DELETE' });
            document.getElementById('reset-feedback').textContent = 'Progress cleared.';
            await refresh();
        }
        catch (e) {
            document.getElementById('reset-feedback').textContent = e.message;
        }
    });
refresh();
