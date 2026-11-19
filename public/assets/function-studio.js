Axion.init('Math Lab');
const app = document.getElementById('app');
const MathFn = window.AxionExpression;

const examples = {
    line: { mode: 'single', left: 'x+2', right: 'x+2', a: 2, pointMode: 'auto', pointValue: '' },
    hole: { mode: 'single', left: '(x^2-4)/(x-2)', right: '', a: 2, pointMode: 'auto', pointValue: '' },
    point: { mode: 'single', left: 'x+2', right: '', a: 2, pointMode: 'custom', pointValue: '9' },
    jump: { mode: 'piecewise', left: 'x+1', right: 'x+4', a: 2, pointMode: 'custom', pointValue: '6' },
    trig: { mode: 'single', left: 'sin(x)/x', right: '', a: 0, pointMode: 'auto', pointValue: '' },
    pole: { mode: 'single', left: '1/(x-2)', right: '', a: 2, pointMode: 'auto', pointValue: '' },
    oscillate: { mode: 'single', left: 'sin(1/x)', right: '', a: 0, pointMode: 'auto', pointValue: '' }
};
const challengeList = [
    ['hole', 'Removable hole', 'At x = 2: limit 4 from both sides, but f(2) undefined.'],
    ['changed', 'Different function value', 'At x = 2: limit 4 from both sides, but f(2) = 9.'],
    ['jump', 'Jump discontinuity', 'At x = 1: left limit 2, right limit 5, and f(1) = 8.'],
    ['continuous', 'Continuous function', 'At x = 3: both sides approach 6, and f(3) = 6.']
];
const challengeTargets = { hole: 2, changed: 2, jump: 1, continuous: 3 };
const distances = [0.5, 0.1, 0.01, 0.001, 0.0001];
let settings = { ...examples.hole };
let model = MathFn.build(settings);
let viewport = { center: 2, width: 9 };
let selectedDistance = 0.1;
let panel = 'explore';
let plotBounds = null;
let graphPointer = null;
let currentChallenge = 'hole';
let saved = [];

app.innerHTML = `
  <div class="fs-head">
    <div>
      <p class="eyebrow">Math Lab</p>
      <h1 class="page-heading">Function Studio</h1>
      <p class="fs-help">Enter a formula, examine its graph, and compare values near a point. You can also create piecewise functions and save your work.</p>
    </div>
    <a class="btn ghost" href="labs.html?lab=slope">Other experiments</a>
  </div>
  <div class="fs-tabs" aria-label="Function Studio sections">
    <button data-panel="explore" aria-selected="true">Explore</button>
    <button data-panel="challenge" aria-selected="false">Challenges</button>
    <button data-panel="saved" aria-selected="false">Saved functions</button>
  </div>
  <div class="fs-workspace">
    <section class="fs-plot" aria-label="Function graph">
      <div class="fs-plot-head"><h2>Graph</h2><div class="fs-tools" aria-label="Graph controls">
        <button id="zoom-in" title="Zoom in" aria-label="Zoom in">+</button>
        <button id="zoom-out" title="Zoom out" aria-label="Zoom out">−</button>
        <button id="zoom-reset" title="Reset view">Reset</button>
        <button id="download-chart" title="Save graph as PNG">PNG</button>
      </div></div>
      <canvas id="fs-canvas" role="img" aria-label="Graph of the entered function, with two approach points and a target position"></canvas>
      <p class="fs-readout" id="fs-cursor">Click to choose x. Drag to pan, or scroll to zoom.</p>
      <div class="fs-output">
        <div><strong id="fs-left-value">—</strong><span>From left</span></div>
        <div><strong id="fs-right-value">—</strong><span>From right</span></div>
        <div><strong id="fs-point-value">—</strong><span>At x = a</span></div>
      </div>
      <div class="fs-samples">
        <h2>Values near x = a</h2>
        <table aria-label="Values approaching the target from both sides"><thead><tr><th>Distance h</th><th>x = a − h</th><th>f(x)</th><th>x = a + h</th><th>f(x)</th></tr></thead><tbody id="fs-sample-rows"></tbody></table>
        <p class="fs-small">Select a row to move the two markers. These measurements suggest a limit; they do not prove it.</p>
      </div>
    </section>
    <section class="fs-editor" aria-label="Function editor">
      <h2>Edit function</h2>
      <label class="fs-label" for="fs-example">Examples</label>
      <select id="fs-example"><option value="custom">My function</option><option value="line">x + 2</option><option value="hole" selected>(x² − 4)/(x − 2)</option><option value="point">A changed point</option><option value="jump">A jump</option><option value="trig">sin(x)/x</option><option value="pole">1/(x − 2)</option><option value="oscillate">sin(1/x)</option></select>
      <div class="fs-switch"><label><input type="radio" name="fs-mode" value="single" checked> One formula</label><label><input type="radio" name="fs-mode" value="piecewise"> Left and right formulas</label></div>
      <label class="fs-label" for="fs-left" id="fs-left-label">f(x) =</label>
      <input id="fs-left" spellcheck="false" autocomplete="off" value="(x^2-4)/(x-2)">
      <div id="fs-right-wrap" hidden><label class="fs-label" for="fs-right">For x &gt; a, f(x) =</label><input id="fs-right" spellcheck="false" autocomplete="off"></div>
      <p class="fs-hint">Use x, +, −, *, /, ^, brackets, sin(x), cos(x), sqrt(x), abs(x), ln(x) or exp(x). Example: (x^2-4)/(x-2).</p>
      <div class="fs-row">
        <div><label class="fs-label" for="fs-a" id="fs-a-label">Target x (a)</label><input id="fs-a" type="number" step="any" min="-20" max="20" value="2"></div>
        <div><label class="fs-label" for="fs-point-mode">At x = a</label><select id="fs-point-mode"><option value="auto">Use formula</option><option value="undefined">Undefined</option><option value="custom">Set value</option></select></div>
      </div>
      <div id="fs-point-wrap" hidden><label class="fs-label" for="fs-point-value-input">f(a) =</label><input id="fs-point-value-input" type="number" step="any" value="9"></div>
      <p class="fs-validation" id="fs-error" role="status"></p>
      <div class="fs-actions"><button class="btn" id="fs-plot">Plot function</button><button class="btn ghost" id="fs-clear">Clear</button></div>
      <div class="fs-note">Select Plot function after changing the formula. You can also select a row in the table.</div>
    </section>
  </div>
  <section class="fs-section" id="fs-challenge-panel" hidden>
    <h2>Build a function</h2>
    <p>Choose a task. Use the function editor to set up your graph, then select Check function.</p>
    <label class="fs-label" for="fs-challenge">Task</label>
    <select id="fs-challenge">${challengeList.map(row => `<option value="${row[0]}">${row[1]}</option>`).join('')}</select>
    <p class="fs-task" id="fs-challenge-task"></p>
    <div class="fs-actions"><button class="btn" id="fs-check">Check function</button><a href="learn.html?lesson=limits-continuity">Read about discontinuities</a></div>
    <div class="fs-feedback" id="fs-challenge-feedback" role="status"></div>
    <p class="fs-small">The result is checked using values near the target point.</p>
  </section>
  <section class="fs-section" id="fs-saved-panel" hidden>
    <h2>My functions</h2>
    <p>Save a formula and load it again later. These records are stored on the local Axion server.</p>
    <label class="fs-label" for="fs-note">Notes (optional)</label>
    <textarea id="fs-note" rows="2" maxlength="280" placeholder="What did you notice?"></textarea>
    <div class="fs-actions"><button class="btn" id="fs-save">Save current function</button></div>
    <div class="fs-feedback" id="fs-save-feedback" role="status"></div>
    <div id="fs-saved-list"></div>
  </section>
`;

const el = id => document.getElementById(id);
const canvas = el('fs-canvas');
const workspace = app.querySelector('.fs-workspace');
app.insertBefore(el('fs-challenge-panel'), workspace);
app.insertBefore(el('fs-saved-panel'), workspace);

function putForm(config) {
    if (panel === 'challenge') config = { ...config, a: challengeTargets[currentChallenge] };
    settings = { ...config };
    el('fs-left').value = config.left;
    el('fs-right').value = config.right || '';
    el('fs-a').value = config.a;
    el('fs-point-mode').value = config.pointMode;
    el('fs-point-value-input').value = config.pointValue === undefined || config.pointValue === null ? '' : config.pointValue;
    document.querySelectorAll('input[name="fs-mode"]').forEach(r => r.checked = r.value === config.mode);
    updateVisibleFields();
}

function updateVisibleFields() {
    const mode = document.querySelector('input[name="fs-mode"]:checked').value;
    el('fs-right-wrap').hidden = mode !== 'piecewise';
    el('fs-left-label').textContent = mode === 'piecewise' ? 'For x < a, f(x) =' : 'f(x) =';
    el('fs-point-wrap').hidden = el('fs-point-mode').value !== 'custom';
}

function readForm() {
    return {
        mode: document.querySelector('input[name="fs-mode"]:checked').value,
        left: el('fs-left').value.trim(), right: el('fs-right').value.trim(),
        a: el('fs-a').value, pointMode: el('fs-point-mode').value,
        pointValue: el('fs-point-value-input').value
    };
}

function applySettings(centerOnTarget = false) {
    try {
        const config = readForm();
        const candidate = MathFn.build(config);
        settings = { ...config, a: candidate.a };
        model = candidate;
        if (centerOnTarget) viewport.center = model.a;
        el('fs-error').textContent = '';
        updateVisibleFields();
        draw();
        return true;
    } catch (error) {
        el('fs-error').textContent = error.message;
        return false;
    }
}

function niceStep(span) {
    const exponent = Math.pow(10, Math.floor(Math.log10(span / 6)));
    const normalized = span / 6 / exponent;
    return (normalized < 1.5 ? 1 : normalized < 3.5 ? 2 : normalized < 7.5 ? 5 : 10) * exponent;
}
function color(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function finiteSamples() {
    const candidates = [];
    for (let i = 0; i <= 450; i++) {
        const x = viewport.center - viewport.width / 2 + viewport.width * i / 450;
        const y = x < model.a ? model.left(x) : model.right(x);
        if (Number.isFinite(y) && Math.abs(y) < 1e12) candidates.push(y);
    }
    candidates.sort((a, b) => a - b);
    if (!candidates.length) return [-5, 5];
    let lo = candidates[Math.floor((candidates.length - 1) * .035)];
    let hi = candidates[Math.floor((candidates.length - 1) * .965)];
    const range = Math.max(hi - lo, 1.5);
    return [lo - range * .17, hi + range * .17];
}

function draw() {
    const width = Math.max(canvas.getBoundingClientRect().width, 260);
    const height = Math.max(canvas.getBoundingClientRect().height, 260);
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    const pad = { left: 53, right: 18, top: 16, bottom: 35 };
    const xmin = viewport.center - viewport.width / 2, xmax = viewport.center + viewport.width / 2;
    const [ymin, ymax] = finiteSamples();
    const X = x => pad.left + (x - xmin) / (xmax - xmin) * (width - pad.left - pad.right);
    const Y = y => pad.top + (ymax - y) / (ymax - ymin) * (height - pad.top - pad.bottom);
    plotBounds = { xmin, xmax, ymin, ymax, width, height, pad, X, Y };
    ctx.fillStyle = color('--surface'); ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 1; ctx.strokeStyle = color('--line'); ctx.fillStyle = color('--muted');
    ctx.font = '11px system-ui';
    const sx = niceStep(xmax - xmin), sy = niceStep(ymax - ymin);
    for (let n = Math.ceil(xmin / sx); n * sx < xmax && n < Math.ceil(xmin / sx) + 20; n++) {
        const x = n * sx, px = X(x);
        ctx.beginPath(); ctx.moveTo(px, pad.top); ctx.lineTo(px, height - pad.bottom); ctx.stroke();
        ctx.textAlign = 'center'; ctx.fillText(MathFn.format(x), px, height - pad.bottom + 18);
    }
    for (let n = Math.ceil(ymin / sy); n * sy < ymax && n < Math.ceil(ymin / sy) + 20; n++) {
        const y = n * sy, py = Y(y);
        ctx.beginPath(); ctx.moveTo(pad.left, py); ctx.lineTo(width - pad.right, py); ctx.stroke();
        ctx.textAlign = 'right'; ctx.fillText(MathFn.format(y), pad.left - 8, py + 4);
    }
    ctx.strokeStyle = color('--muted'); ctx.lineWidth = 1.25;
    if (xmin <= 0 && xmax >= 0) { ctx.beginPath(); ctx.moveTo(X(0), pad.top); ctx.lineTo(X(0), height - pad.bottom); ctx.stroke(); }
    if (ymin <= 0 && ymax >= 0) { ctx.beginPath(); ctx.moveTo(pad.left, Y(0)); ctx.lineTo(width - pad.right, Y(0)); ctx.stroke(); }

    const drawBranch = (fn, from, to) => {
        if (from >= to) return;
        let started = false, previousY = null;
        ctx.beginPath(); ctx.strokeStyle = color('--accent'); ctx.lineWidth = 2.7;
        const count = 720;
        for (let i = 0; i <= count; i++) {
            const x = from + (to - from) * i / count;
            const y = fn(x);
            const ok = Number.isFinite(y) && y >= ymin - (ymax - ymin) * .3 && y <= ymax + (ymax - ymin) * .3;
            if (!ok) { started = false; previousY = null; continue; }
            const cut = previousY !== null && Math.abs(previousY - y) > (ymax - ymin) * .35;
            if (!started || cut) { ctx.moveTo(X(x), Y(y)); started = true; }
            else ctx.lineTo(X(x), Y(y));
            previousY = y;
        }
        ctx.stroke();
    };
    const gap = Math.max((xmax - xmin) / 150000, 1e-7);
    drawBranch(model.left, xmin, Math.min(xmax, model.a - gap));
    drawBranch(model.right, Math.max(xmin, model.a + gap), xmax);

    function circle(x, y, outline, hollow, radius = 5.5) {
        if (!Number.isFinite(y) || x < xmin || x > xmax || y < ymin || y > ymax) return;
        ctx.beginPath(); ctx.arc(X(x), Y(y), radius, 0, Math.PI * 2);
        ctx.fillStyle = hollow ? color('--surface') : outline; ctx.fill();
        ctx.strokeStyle = outline; ctx.lineWidth = 2.5; ctx.stroke();
    }
    function vertical(x, stroke) {
        if (x < xmin || x > xmax) return;
        ctx.strokeStyle = stroke; ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(X(x), pad.top); ctx.lineTo(X(x), height - pad.bottom); ctx.stroke(); ctx.setLineDash([]);
    }
    const data = MathFn.sample(model, selectedDistance);
    vertical(model.a, '#a98c63');
    vertical(model.a - selectedDistance, '#317da7'); vertical(model.a + selectedDistance, '#c47a3e');
    circle(model.a - selectedDistance, data.left, '#317da7', false);
    circle(model.a + selectedDistance, data.right, '#c47a3e', false);
    const point = model.at(model.a);
    const near = MathFn.sample(model, .0001);
    if (Number.isFinite(near.left)) circle(model.a, near.left, color('--accent'), true, 6);
    if (Number.isFinite(near.right) && Math.abs(near.right - near.left) > .08) circle(model.a, near.right, '#c47a3e', true, 6);
    if (Number.isFinite(point)) circle(model.a, point, '#a54942', false, 6);
    ctx.font = '12px system-ui'; ctx.textAlign = 'left'; ctx.fillStyle = color('--muted');
    ctx.fillText('x', width - 17, height - 8);
    ctx.fillText('y', 13, 20);
    el('fs-left-value').textContent = MathFn.format(data.left);
    el('fs-right-value').textContent = MathFn.format(data.right);
    el('fs-point-value').textContent = MathFn.format(point);
    renderTable();
}

function renderTable() {
    const a = model.a;
    el('fs-sample-rows').innerHTML = distances.map(d => {
        const row = MathFn.sample(model, d);
        return `<tr data-distance="${d}" tabindex="0" class="${d === selectedDistance ? 'selected' : ''}"><td>${d}</td><td>${MathFn.format(a - d)}</td><td>${MathFn.format(row.left)}</td><td>${MathFn.format(a + d)}</td><td>${MathFn.format(row.right)}</td></tr>`;
    }).join('');
    document.querySelectorAll('[data-distance]').forEach(row => {
        const select = () => { selectedDistance = Number(row.dataset.distance); draw(); };
        row.addEventListener('click', select);
        row.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(); } });
    });
}

function setPanel(next) {
    panel = next;
    document.querySelectorAll('[data-panel]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.panel === next)));
    const challengeMode = next === 'challenge';
    el('fs-challenge-panel').hidden = !challengeMode;
    el('fs-saved-panel').hidden = next !== 'saved';
    el('fs-a').disabled = challengeMode;
    el('fs-a-label').textContent = challengeMode ? 'Target x (set by task)' : 'Target x (a)';
    if (challengeMode) updateChallengeText();
    el('fs-cursor').textContent = challengeMode
        ? 'The target x is fixed for this task. Drag to move the graph or scroll to zoom.'
        : 'Click to choose x. Drag to pan, or scroll to zoom.';
    if (next === 'saved') loadSaved();
}

async function loadSaved() {
    const list = el('fs-saved-list');
    list.textContent = 'Loading...';
    try {
        saved = await Axion.api('/studio/experiments');
        list.innerHTML = saved.length ? saved.map(row => `<div class="fs-saved-item"><div><strong>${Axion.escape(row.config.mode === 'piecewise' ? `${row.config.left} | ${row.config.right}` : row.config.left)}</strong><p>Target x = ${row.config.a} · ${new Date(row.savedAt).toLocaleString()}${row.note ? ` · ${Axion.escape(row.note)}` : ''}</p></div><div class="actions"><button class="btn ghost small" data-load="${row.id}">Open</button><button class="btn ghost small" data-delete="${row.id}">Delete</button></div></div>`).join('') : '<p class="fs-small">No saved functions yet.</p>';
    } catch (error) { list.textContent = 'Could not load saved functions: ' + error.message; }
}

function updateChallengeText() {
    currentChallenge = el('fs-challenge').value;
    el('fs-challenge-task').textContent = challengeList.find(row => row[0] === currentChallenge)[2];
    el('fs-challenge-feedback').textContent = '';
    if (panel === 'challenge') {
        el('fs-a').value = String(challengeTargets[currentChallenge]);
        applySettings(true);
    }
}

el('fs-example').addEventListener('change', event => {
    if (event.target.value === 'custom') return;
    putForm(examples[event.target.value]);
    applySettings(true);
});
for (const radio of document.querySelectorAll('input[name="fs-mode"]')) radio.addEventListener('change', () => { updateVisibleFields(); el('fs-example').value = 'custom'; });
el('fs-point-mode').addEventListener('change', () => { updateVisibleFields(); el('fs-example').value = 'custom'; });
for (const id of ['fs-left','fs-right','fs-a','fs-point-value-input']) el(id).addEventListener('input', () => el('fs-example').value = 'custom');
el('fs-plot').addEventListener('click', () => applySettings(true));
el('fs-clear').addEventListener('click', () => {
    el('fs-example').value = 'custom';
    putForm({ mode: 'single', left: 'x', right: '', a: 0, pointMode: 'auto', pointValue: '' });
    viewport = { center: 0, width: 9 };
    applySettings();
});
for (const button of document.querySelectorAll('[data-panel]')) button.addEventListener('click', () => setPanel(button.dataset.panel));
el('zoom-in').addEventListener('click', () => { viewport.width = Math.max(.005, viewport.width / 1.8); draw(); });
el('zoom-out').addEventListener('click', () => { viewport.width = Math.min(100, viewport.width * 1.8); draw(); });
el('zoom-reset').addEventListener('click', () => { viewport.center = model.a; viewport.width = 9; draw(); });
el('download-chart').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'axion-function.png'; link.href = canvas.toDataURL('image/png'); link.click();
});
canvas.addEventListener('pointerdown', event => {
    graphPointer = { x: event.clientX, center: viewport.center, moved: false };
    canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', event => {
    if (!plotBounds) return;
    const pos = (event.clientX - canvas.getBoundingClientRect().left - plotBounds.pad.left) / (plotBounds.width - plotBounds.pad.left - plotBounds.pad.right);
    const x = plotBounds.xmin + pos * (plotBounds.xmax - plotBounds.xmin);
    const y = x < model.a ? model.left(x) : model.right(x);
    el('fs-cursor').textContent = `x: ${MathFn.format(x)}     f(x): ${MathFn.format(y)}. ${panel === 'challenge' ? 'Target x is fixed for this task; drag to pan.' : 'Click to choose x; drag to pan.'}`;
    if (graphPointer) {
        const dx = event.clientX - graphPointer.x;
        if (Math.abs(dx) > 4) graphPointer.moved = true;
        if (graphPointer.moved) {
            viewport.center = graphPointer.center - dx / (plotBounds.width - plotBounds.pad.left - plotBounds.pad.right) * viewport.width;
            draw();
        }
    }
});
canvas.addEventListener('pointerup', event => {
    if (!graphPointer) return;
    if (!graphPointer.moved && panel !== 'challenge') {
        const rect = canvas.getBoundingClientRect();
        const x = plotBounds.xmin + (event.clientX - rect.left - plotBounds.pad.left) / (plotBounds.width - plotBounds.pad.left - plotBounds.pad.right) * viewport.width;
        el('fs-a').value = Math.max(-20, Math.min(20, Number(x.toFixed(4))));
        el('fs-example').value = 'custom';
        applySettings();
    }
    graphPointer = null;
});
canvas.addEventListener('pointercancel', () => { graphPointer = null; });
canvas.addEventListener('wheel', event => {
    event.preventDefault();
    viewport.width = Math.max(.005, Math.min(100, viewport.width * (event.deltaY > 0 ? 1.3 : 1 / 1.3)));
    draw();
}, { passive: false });
el('fs-challenge').addEventListener('change', updateChallengeText);
el('fs-check').addEventListener('click', async () => {
    if (!applySettings()) { el('fs-challenge-feedback').textContent = 'Correct the formula first.'; return; }
    const feedback = el('fs-challenge-feedback');
    feedback.textContent = 'Checking...'; feedback.className = 'fs-feedback';
    try {
        const result = await Axion.api('/studio/challenge', { method: 'POST', body: JSON.stringify({ challenge: currentChallenge, config: settings }) });
        feedback.textContent = result.message;
        feedback.classList.add(result.correct ? 'ok' : 'bad');
    } catch (error) { feedback.textContent = error.message; feedback.classList.add('bad'); }
});
el('fs-save').addEventListener('click', async () => {
    if (!applySettings()) return;
    const feedback = el('fs-save-feedback');
    feedback.textContent = 'Saving...'; feedback.className = 'fs-feedback';
    try {
        await Axion.api('/studio/experiments', { method: 'POST', body: JSON.stringify({ config: settings, note: el('fs-note').value }) });
        feedback.textContent = 'Saved.'; feedback.classList.add('ok');
        el('fs-note').value = '';
        await loadSaved();
    } catch (error) { feedback.textContent = error.message; feedback.classList.add('bad'); }
});
el('fs-saved-list').addEventListener('click', async event => {
    const open = event.target.closest('[data-load]'), remove = event.target.closest('[data-delete]');
    if (open) {
        const record = saved.find(row => row.id === open.dataset.load);
        if (!record) return;
        putForm(record.config);
        el('fs-example').value = 'custom';
        applySettings(true);
        setPanel('explore');
    }
    if (remove) {
        try {
            await Axion.api('/studio/experiments/' + encodeURIComponent(remove.dataset.delete), { method: 'DELETE' });
            await loadSaved();
        } catch (error) { el('fs-save-feedback').textContent = error.message; }
    }
});
window.addEventListener('resize', draw);
document.addEventListener('axion-theme', draw);
updateChallengeText();
putForm(settings);
draw();
