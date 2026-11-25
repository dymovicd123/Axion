Axion.init('Learn');
const query = new URLSearchParams(location.search);
const id = query.get('lesson') || 'limits-basics';
const lesson = (window.LESSONS || []).find(l => l.id === id);
const app = document.getElementById('app');
if (!lesson) {
    app.innerHTML = '<div class="empty">Lesson not found. <a href="index.html">Return to the course</a>.</div>';
}
else {
    app.innerHTML = `<div class="crumb"><a href="index.html">Courses</a> / ${Axion.escape(lesson.category)} / ${Axion.escape(lesson.title)}</div><p class="eyebrow">${Axion.escape(lesson.category)} · ${Axion.escape(lesson.time)}</p><h1 class="page-heading">${Axion.escape(lesson.title)}</h1><p class="lead">${Axion.escape(lesson.summary)}</p><div class="lesson-layout"><div class="reading">${lesson.sections.map((s, i) => `<section class="panel lesson-block" id="part-${i + 1}"><p class="eyebrow">Section ${i + 1} of ${lesson.sections.length}</p><h2>${Axion.escape(s.title)}</h2>${s.html}</section>`).join('')}<section class="lesson-tools" id="knowledge-check">
<p class="eyebrow">Review question</p>
<h3>Check your understanding</h3>
<p>Choose an answer to mark this lesson complete.</p>
<h3 style="font-size:16px">${Axion.escape(lesson.check.question)}</h3><div class="quiz-mini" id="quiz-options">${lesson.check.choices.map((c, i) => `<label><input type="radio" name="check" value="${i}"><span>${Axion.escape(c)}</span></label>`).join('')}</div>
<div class="actions" style="margin-top:15px">
<button class="btn" id="check-submit">Check answer</button>
<span id="check-status" class="tag">Not checked</span>
</div>
<p id="check-feedback" class="feedback" role="status">
</p>
</section>
<div class="section-heading">
<h2>Related material</h2>
</div>
<div class="grid">
<a class="card" href="practice.html?skill=${encodeURIComponent(lesson.skill)}">
<span class="card-kicker">Practice</span>
<h3>Practice problems</h3>
<p>Exercises on this topic.</p>
<span class="card-bottom">Go to practice →</span>
</a>
<a class="card" href="labs.html?lab=${lesson.lab}">
<span class="card-kicker">Tools</span>
<h3>Graph and demonstration</h3>
<p>See the topic on a graph.</p>
<span class="card-bottom">Open lab →</span>
</a>
</div>
${ProjectMath.projects.some(p => p.lessons.includes(lesson.id)) ? `<div class="section-heading"><h2>Apply this topic</h2></div><div class="module-list">${ProjectMath.projects.filter(p => p.lessons.includes(lesson.id)).map(p => `<a class="module-row" href="project.html?id=${p.id}"><div><b>${p.title}</b><p>${p.description}</p></div><span class="module-arrow">→</span></a>`).join('')}</div>` : '<div class="section-heading"><h2>Explore functions</h2></div><p><a href="function-studio.html">Try your own function in Function Studio →</a></p>'}
<div class="footer">Axion · Web Programming Project</div>
</div>
<nav class="reading-toc" aria-label="On this page">
<strong>In this lesson</strong>${lesson.sections.map((s, i) => `<a href="#part-${i + 1}">${i + 1}. ${Axion.escape(s.title)}</a>`).join('')}<a href="#knowledge-check">Knowledge check</a></nav></div>`;
    document.title = lesson.title + ' · Axion';
    Axion.math(app);
    const button = document.getElementById('check-submit'),
        msg = document.getElementById('check-feedback'),
        tag = document.getElementById('check-status');
    button.addEventListener(
        'click',
        async () => {
            const selected = document.querySelector('input[name="check"]:checked');
            if (!selected)
                return Axion.fb(msg, 'Choose an answer first.');
            try {
                const result = await Axion.api('/lesson/check', { method: 'POST', body: JSON.stringify({ id: lesson.id, answer: Number(selected.value) }) });
                if (result.correct) {
                    tag.textContent = 'Completed';
                    tag.className = 'tag good';
                    Axion.fb(msg, 'Correct. ' + result.explanation + ' Saved to your progress.', 'ok');
                }
                else {
                    Axion.fb(msg, 'Incorrect. ' + result.explanation, 'bad');
                }
            }
            catch (e) {
                Axion.fb(msg, 'Could not check the answer: ' + e.message, 'bad');
            }
        });
    Axion.api('/progress').then(rows => {
        if (rows.some(row => row.activity === lesson.activity)) {
            tag.textContent = 'Completed';
            tag.className = 'tag good';
        }
    }).catch(() => { });
}
