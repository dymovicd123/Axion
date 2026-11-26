(function () {
    const el = document.getElementById('stereo-progress');
    if (!el)
        return;
    let progress = {};
    try {
        progress = JSON.parse((window.AxionStorage || localStorage).getItem('axion-stereo-progress-v2') || '{}') || {};
    }
    catch { }
    const titles = ['Points, lines and planes', 'Parallelism and perpendicularity', 'Angles and distances', 'Cross-sections', 'Surface area and volume'];
    function render() {
        const count = titles.filter((_, i) => progress['practice' + i]).length;
        const review = new URLSearchParams(location.search).get('view') === 'review';
        el.innerHTML = `<h2>Solid geometry</h2><p>${count}/5 practice sets completed · Final assessment ${progress.final ? 'passed' : 'not passed'} · Saved in your account</p><ol class="syllabus-list">${titles.map((t, i) => ({ t, i })).filter(({ i }) => !review || !progress['practice' + i]).map(({ t, i }) => `<li><a href="stereometry.html?lesson=${i + 1}&mode=practice"><strong>${t}</strong><span>${progress['practice' + i] ? 'Completed' : 'Practice'}</span></a></li>`).join('')}<li><a href="stereometry.html?mode=final"><strong>Final assessment</strong><span>${progress.final ? 'Passed' : 'Not passed'}</span></a></li></ol>`;
    }
    render();
    fetch('/api/stereo/results').then(r => {
        if (!r.ok)
            throw Error();
        return r.json();
    }).then(rows => {
        const done = new Set(rows.filter(r => r.correct).map(r => r.id)), generated = rows.filter(r => r.correct && r.generated).length;
        const fixedDone = titles.map((_, i) => done.has(`p${i + 1}1`) && done.has(`p${i + 1}2`));
        const finalDone = titles.every((_, i) => done.has(`f${i + 1}`));
        const p = document.createElement('p');
        p.className = 'small';
        p.textContent = `Server records: ${fixedDone.filter(Boolean).length}/5 practice sets · ${finalDone ? 'Assessment passed' : 'Assessment not completed'} · ${generated} generated problems solved. Drafts synchronize with your account.`;
        el.append(p);
    }).catch(() => { });
})();
