const W = require('./public/assets/stereo-workspace-model');
const P = require('./public/assets/project-math');
const T = require('./public/assets/stereo-tasks');
const G = require('./public/assets/stereo-generator');
const fixed = [...T.practice.flat(), ...T.labs, ...T.final];
function getTask(id) { const task = fixed.find(t => t.id === id); if (task)
    return task; const m = typeof id === 'string' && /^gen-(\d)-(\d)-(\d{1,10})$/.exec(id); if (m) {
    const t = G.generate(...m.slice(1).map(Number));
    if (t.id === id)
        return t;
} throw Error('Unknown geometry task.'); }
function validate(input) {
    const t = getTask(input.id), base = W.points(...t.dims);
    if (t.shape === 'pyramid') {
        for (const id of ['E', 'F', 'G', 'H'])
            delete base[id];
        base.O = [0, -t.dims[2] / 2, 0];
        base.T = [0, t.dims[2] / 2, 0];
    }
    const p = input.points;
    if (!p || typeof p !== 'object' || Array.isArray(p) || Object.keys(p).length > 80)
        throw Error('Invalid points.');
    const isPoint = q => Array.isArray(q) && q.length === 3 && q.every(Number.isFinite);
    for (const [id, q] of Object.entries(base))
        if (!isPoint(p[id]) || P.distance(q, p[id]) > 1e-7)
            throw Error('Base vertices cannot be changed.');
    const pending = Object.keys(p).filter(id => !Object.hasOwn(base, id));
    if (pending.some(id => !/^M[1-9]\d{0,2}$/.test(id) || !isPoint(p[id])))
        throw Error('Invalid constructed point.');
    // Every new point must be reachable by midpoint constructions from earlier points.
    while (pending.length) {
        let found = false;
        const ids = Object.keys(base);
        for (let i = pending.length - 1; i >= 0; i--) {
            const id = pending[i];
            if (ids.some((a, j) => ids.slice(j + 1).some(b => P.distance(p[id], W.midpoint(base[a], base[b])) < 1e-7))) {
                base[id] = p[id];
                pending.splice(i, 1);
                found = true;
            }
        }
        if (!found)
            throw Error('Invalid midpoint construction.');
    }
    for (const [name, min, max] of [['segments', 2, 2], ['polys', 3, 80], ['extracted', 3, 80]]) {
        const list = input[name];
        if (!Array.isArray(list) || list.length > 100)
            throw Error('Invalid construction list.');
        for (const ids of list) {
            if (!Array.isArray(ids) || ids.length < min || ids.length > max || new Set(ids).size !== ids.length || ids.some(id => typeof id !== 'string' || !Object.hasOwn(base, id)))
                throw Error('Invalid construction vertices.');
            if (min === 3 && !W.validPolygon(W.flatten(ids.map(id => base[id]))))
                throw Error('Invalid planar polygon.');
        }
    }
    if (!Array.isArray(input.answers) || input.answers.length !== t.answers.length || input.answers.some(v => typeof v !== 'string' || v.length > 250))
        throw Error('Invalid answers.');
    const construction = W.constructionOK(t, input), correctAnswers = t.answers.filter((a, i) => W.correct(input.answers[i], a.value, a.tol)).length;
    return {
        id: t.id, generated: !!t.generated, correct: construction && correctAnswers === t.answers.length, construction, correctAnswers, totalAnswers: t.answers.length
    };
}
module.exports = { getTask, validate };
