const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { compile, build, sample } = require('../expression');
const { checkChallenge, validateSetup } = require('../studio-check');
const { createStore } = require('../store');
function setup(left, a = 2, pointMode = 'auto', pointValue = '') {
    return { mode: 'single', left, right: '', a, pointMode, pointValue };
}
test('function editor accepts original algebraic, trigonometric and implicit multiplication', () => {
    const cases = [
        ['(x^2-4)/(x-2)', 3, 5],
        ['sin(x)/x', .001, Math.sin(.001) / .001],
        ['(x+1)(x-1)', 3, 8],
        ['2x + 3', 4, 11],
        ['-x^2', 2, -4],
        ['2sin(pi/2)', 1, 2],
        ['sqrt(abs(x))', -9, 3],
        ['ln(e^2)', 0, 2]
    ];
    for (const [text, x, expected] of cases)
        assert.ok(Math.abs(compile(text)(x) - expected) < 1e-8, text);
});
test('formula parser rejects unknown functions and executable syntax', () => {
    for (const text of ['alert(1)', 'x;process.exit(0)', 'x.constructor', '', 'x**2', 'sin(x', 'fetch(1)', 'x)']) {
        assert.throws(() => compile(text), undefined, text);
    }
    assert.throws(() => compile('x'.repeat(141)));
});
test('point overrides and piecewise formulas use the correct branch', () => {
    const single = build(setup('(x^2-4)/(x-2)', 2));
    assert.equal(single.at(2), NaN);
    assert.ok(Math.abs(sample(single, .0001).left - 3.9999) < 1e-6);
    const piece = build({ mode: 'piecewise', left: 'x+1', right: 'x+4', a: 1, pointMode: 'custom', pointValue: 8 });
    assert.equal(piece.at(0), 1);
    assert.equal(piece.at(2), 6);
    assert.equal(piece.at(1), 8);
    const pole = build(setup('1/(x-2)', 2));
    assert.equal(Number.isNaN(pole.at(2)), true);
    const hole = build(setup('x+2', 2, 'undefined'));
    assert.equal(Number.isNaN(hole.at(2)), true);
    assert.equal(hole.at(2.1), 4.1);
});
test('challenge verification evaluates actual formulas instead of trusting numbers', () => {
    assert.equal(checkChallenge('hole', setup('(x^2-4)/(x-2)')).correct, true);
    assert.equal(checkChallenge('changed', setup('x+2', 2, 'custom', 9)).correct, true);
    assert.equal(checkChallenge('jump', { mode: 'piecewise', left: 'x+1', right: 'x+4', a: 1, pointMode: 'custom', pointValue: 8 }).correct, true);
    assert.equal(checkChallenge('continuous', setup('2x', 3)).correct, true);
    assert.equal(checkChallenge('hole', setup('1/(x-2)')).correct, false);
    assert.equal(checkChallenge('hole', setup('x+2')).correct, false);
    assert.equal(checkChallenge('hole', setup('x+2', 1, 'undefined')).correct, false);
    assert.equal(checkChallenge('changed', setup('x+2', 2, 'custom', 12)).correct, false);
    assert.throws(() => validateSetup(setup('x', 100)));
    assert.throws(() => validateSetup(setup('x', 2, 'custom', '')));
});
test('saved functions survive reload, can be reopened, and can be deleted', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'axion-functions-'));
    const filename = path.join(dir, 'db.json');
    try {
        await fs.copyFile(path.join(__dirname, 'fixtures/empty-db.json'), filename);
        const store = createStore(filename);
        const config = setup('sin(x)/x', 0);
        const record = await store.saveExperiment({ config, note: 'Try near zero' });
        assert.ok(record.id);
        const reloaded = createStore(filename);
        assert.equal((await reloaded.experiments())[0].config.left, 'sin(x)/x');
        assert.equal((await reloaded.experiments())[0].note, 'Try near zero');
        assert.equal((await reloaded.checkStudio({ challenge: 'hole', config: setup('(x^2-4)/(x-2)') })).correct, true);
        assert.equal((await reloaded.checkStudio({ challenge: 'hole', config: setup('(x^2-4)/(x-2)') })).correct, true);
        const data = await reloaded.read();
        assert.equal(data.labResults.filter(row => row.kind === 'function-studio').length, 1);
        await reloaded.deleteExperiment(record.id);
        assert.equal((await createStore(filename).experiments()).length, 0);
        await assert.rejects(reloaded.saveExperiment({ config, note: 'a'.repeat(281) }));
        await assert.rejects(reloaded.saveExperiment({ config: setup('alert(x)'), note: '' }));
    }
    finally {
        await fs.rm(dir, { recursive: true, force: true });
    }
});
