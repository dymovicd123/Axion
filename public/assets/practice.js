Axion.init('Practice');
const app = document.getElementById('app');
const skills = [
    ['all', 'Mixed practice'],
    ['concept', 'Understanding limits'],
    ['sides', 'One-sided limits'],
    ['continuity', 'Continuity'],
    ['algebra', 'Calculating limits'],
    ['derivatives', 'Derivatives'],
    ['integrals', 'Integrals']
];
let questions = [], current = 0, step = 0, chosen = null, hints = 0, solved = new Set(), history = [], busy = false;
const params = new URLSearchParams(location.search);
let skill = skills.some(s => s[0] === params.get('skill')) ? params.get('skill') : 'concept';
app.innerHTML = `<p class="eyebrow">Exercises</p>
<h1 class="page-heading">Practice problems</h1>
<p class="lead">Choose a topic and work through the problems. Your results are saved automatically.</p>
<div class="panel">
<div class="stage-header">
<label class="field">Choose a topic<select id="skill">${skills.map(([value, label]) => `<option value="${value}" ${value === skill ? 'selected' : ''}>${label}</option>`).join('')}</select>
</label>
<div>
<span class="tag" id="mastery">Loading results</span>
</div>
</div>
<div id="question-tabs" class="question-list">
</div>
<div id="work-area" aria-live="polite">
</div>
</div><section id="practice-projects" class="module-list" style="margin-top:18px"></section>`;
function relatedProjects() {
    const list = ProjectMath.projects.filter(p => skill === 'all' || p.skill === skill || (['concept', 'sides', 'continuity', 'algebra'].includes(skill) && p.id === 'container'));
    document.getElementById('practice-projects').innerHTML = list.length ? '<h2>Apply the mathematics</h2>' + list.map(p => `<a class="module-row" href="project.html?id=${p.id}"><div><b>${p.title}</b><p>${p.description}</p></div><span class="module-arrow">→</span></a>`).join('') : '';
}
relatedProjects();
document.getElementById('skill').addEventListener(
    'change',
    e => {
        skill = e.target.value;
        try {
            window.history.replaceState(null, '', 'practice.html?skill=' + skill);
        }
        catch (e) { }
        ;
        relatedProjects();
        load();
    });
function score() {
    const set = new Set(history.filter(a => a.correct && a.finished).map(a => a.questionId));
    return questions.filter(q => set.has(q.id)).length;
}
function drawTabs() {
    document.getElementById('question-tabs').innerHTML = questions.map((q, i) => `<button class="question-pill ${current === i ? 'active' : ''} ${solved.has(q.id) ? 'done' : ''}" data-q="${i}" title="${Axion.escape(q.title)}">${i + 1}${solved.has(q.id) ? ' ✓' : ''}</button>`).join('');
    document.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => {
        current = Number(b.dataset.q);
        reset();
        render();
    }));
    document.getElementById('mastery').textContent = `${score()} of ${questions.length} solved in this set`;
}
function reset() {
    step = 0;
    chosen = null;
    hints = 0;
    busy = false;
}
function render() {
    drawTabs();
    const q = questions[current], work = document.getElementById('work-area');
    if (!q) {
        work.innerHTML = '<div class="empty">No questions found for this topic.</div>';
        return;
    }
    const types = {
        numeric: 'Calculate',
        choice: 'Concept check',
        error: 'Find the error',
        steps: 'Algebra steps',
        match: 'Matching'
    };
    let form = '';
    if (q.kind === 'numeric') {
        form = `<label class="field" for="answer">Your answer (number or fraction)<input id="answer" class="answer-input" autocomplete="off" inputmode="decimal" placeholder="e.g. 4 or 1/4">
</label>`;
    }
    if (['choice', 'error', 'steps'].includes(q.kind)) {
        const options = q.kind === 'steps' ? q.steps[step].options : q.options;
        form = `${q.kind === 'steps' ? `<p class="eyebrow">Step ${step + 1} of ${q.steps.length}: ${Axion.escape(q.steps[step].label)}</p>` : ''}<div class="choice-list" id="choices">${options.map((opt, i) => `<button type="button" class="choice" data-choice="${i}"><span>${String.fromCharCode(65 + i)}</span><span>${Axion.escape(opt)}</span></button>`).join('')}</div>`;
    }
    if (q.kind === 'match') {
        form = `<div class="controls">${q.rows.map((row, i) => `<label class="field">${Axion.escape(row)}<select class="match-select" data-match="${i}"><option value="">Choose a match</option>${q.options.map((option, j) => `<option value="${j}">${Axion.escape(option)}</option>`).join('')}</select></label>`).join('')}</div>`;
    }
    const previous = current > 0;
    work.innerHTML = `<div class="stage-header" style="margin-top:18px"><span class="card-kicker">Problem ${current + 1} of ${questions.length} · ${types[q.kind]}</span><span class="tag">${Axion.escape(skills.find(s => s[0] === q.skill)?.[1] || q.skill)}</span></div><h2 class="question-title">${Axion.escape(q.title)}</h2><p>${Axion.escape(q.prompt)}</p>${q.formula ? `<div class="formula">$$${q.formula}$$</div>` : ''}${form}<div class="actions" style="margin-top:19px"><button class="btn" id="submit">Check ${q.kind === 'steps' ? 'step' : 'answer'}</button>
<button class="btn ghost" id="hint">Hint 1</button>
<button class="btn ghost" id="next">Next problem</button>
</div>
<p class="feedback" id="response" role="status">
</p>
<div id="detail">
</div>`;
    Axion.math(work);
    work.querySelectorAll('[data-choice]').forEach(b => b.addEventListener('click', () => {
        chosen = Number(b.dataset.choice);
        work.querySelectorAll('[data-choice]').forEach(x => x.classList.toggle('selected', x === b));
    }));
    document.getElementById('submit').addEventListener('click', submit);
    document.getElementById('next').addEventListener('click', () => {
        current = (current + 1) % questions.length;
        reset();
        render();
    });
    document.getElementById('hint').addEventListener(
        'click',
        () => {
            const q = questions[current];
            const msg = q.hints[Math.min(hints, 1)];
            hints++;
            document.getElementById('detail').innerHTML = `<div class="result-box"><strong>Hint ${Math.min(hints, 2)}</strong><p>${Axion.escape(msg)}</p></div>`;
            document.getElementById('hint').textContent = hints >= 2 ? 'Show hint again' : 'Hint 2';
        });
}
async function submit() {
    if (busy)
        return;
    const q = questions[current];
    let answer;
    if (q.kind === 'numeric') {
        answer = document.getElementById('answer').value.trim();
        if (!answer)
            return Axion.fb(document.getElementById('response'), 'Enter an answer first.');
    }
    else if (q.kind === 'match') {
        answer = [...document.querySelectorAll('[data-match]')].map(x => x.value === '' ? null : Number(x.value));
        if (answer.some(x => x === null))
            return Axion.fb(document.getElementById('response'), 'Match all the statements first.');
    }
    else {
        answer = chosen;
        if (answer === null)
            return Axion.fb(document.getElementById('response'), 'Choose an action or answer first.');
    }
    busy = true;
    document.getElementById('submit').disabled = true;
    try {
        const result = await Axion.api('/study/check', { method: 'POST', body: JSON.stringify({ id: q.id, answer, stepIndex: step }) });
        const msg = document.getElementById('response');
        if (!result.correct) {
            Axion.fb(msg, 'Incorrect. Try again or use a hint.', 'bad');
            const box = document.getElementById('detail');
            box.innerHTML = `<div class="result-box bad"><strong>Explanation</strong><p>${Axion.escape(result.explanation)}</p></div>`;
            return;
        }
        if (q.kind === 'steps' && !result.finished) {
            Axion.fb(msg, 'Correct step. ' + result.explanation, 'ok');
            step++;
            chosen = null;
            setTimeout(() => render(), 550);
            return;
        }
        solved.add(q.id);
        history.push({ questionId: q.id, correct: true, finished: true });
        Axion.fb(msg, 'Correct. Result saved.', 'ok');
        document.getElementById('detail').innerHTML = `<div class="result-box good"><strong>Solution</strong><p>${Axion.escape(result.explanation)}</p></div>`;
        drawTabs();
        document.getElementById('submit').disabled = true;
    }
    catch (error) {
        Axion.fb(document.getElementById('response'), 'Unable to check or save the answer: ' + error.message, 'bad');
    }
    finally {
        busy = false;
        if (!solved.has(q.id))
            document.getElementById('submit').disabled = false;
    }
}
async function load() {
    document.getElementById('work-area').innerHTML = '<div class="empty">Loading problems…</div>';
    try {
        const [qs, state] = await Promise.all([Axion.api('/study/questions?skill=' + skill), Axion.api('/study/status')]);
        questions = qs;
        history = state.attempts || [];
        solved = new Set(history.filter(a => a.correct && a.finished).map(a => a.questionId));
        current = 0;
        reset();
        render();
    }
    catch (e) {
        document.getElementById('work-area').innerHTML = `<div class="result-box bad">Cannot load practice from the server: ${Axion.escape(e.message)}</div>`;
    }
}
load();
