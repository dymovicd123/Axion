const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
let installed = true;
try {
    require.resolve('express');
}
catch {
    installed = false;
}
test(
    'Express serves project pages and validates and persists project submissions',
    { skip: !installed && 'Run npm install to enable HTTP integration tests' },
    async () => {
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'axion-http-'));
        const file = path.join(dir, 'db.json');
        await fs.copyFile(path.join(__dirname, 'fixtures/empty-db.json'), file);
        process.env.AXION_DATA_FILE = file;
        const app = require('../server');
        let server;
        try {
            server = await new Promise((resolve, reject) => {
                const s = app.listen(0, '127.0.0.1', () => resolve(s));
                s.once('error', reject);
            });
            const url = 'http://127.0.0.1:' + server.address().port;
            const anon = await fetch(url + '/api/progress');
            assert.equal(anon.status, 401);
            assert.equal((await fetch(url + '/project.html', { redirect: 'manual' })).status, 302);
            const register = async (username) => {
                const response = await fetch(
                    url + '/api/auth/register',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Axion-Request': '1' },
                        body: JSON.stringify({ username, displayName: username, password: 'test-password-123' })
                    });
                assert.equal(response.status, 201);
                return { cookie: response.headers.get('set-cookie').split(';')[0], user: (await response.json()).user };
            };
            const alice = await register('alice');
            const bob = await register('bob');
            const request = (target, init = {}, account = alice) => fetch(target, { ...init, headers: { ...init.headers, Cookie: account.cookie, 'X-Axion-Request': '1', 'X-Axion-Profile': account.user.profileId } });
            assert.equal((await fetch(url + '/api/progress', { method: 'DELETE', headers: { Cookie: alice.cookie } })).status, 403);
            assert.equal((await fetch(url + '/api/progress', { method: 'DELETE', headers: { Cookie: bob.cookie, 'X-Axion-Request': '1', 'X-Axion-Profile': alice.user.profileId } })).status, 409);
            const page = await request(url + '/project.html?id=container');
            assert.equal(page.status, 200);
            assert.match(await page.text(), /assets\/project\.js/);
            const send = model => request(url + '/api/projects/check', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: 'container', model, note: 'HTTP test' })
            });
            const invalid = await send({ formula: '-2' });
            assert.equal(invalid.status, 400);
            const wrong = await send({ formula: '2' });
            assert.equal(wrong.status, 201);
            assert.equal((await wrong.json()).correct, false);
            const correct = await send({ formula: '2+2.46*sin(pi*x/12)' });
            assert.equal(correct.status, 201);
            assert.equal((await correct.json()).correct, true);
            const attempts = await (await request(url + '/api/projects/status')).json();
            assert.equal(attempts.length, 2);
            assert.equal(attempts[1].model.formula, '2+2.46*sin(pi*x/12)');
            const stored = await require('../store').createStore(file).read();
            assert.equal(stored.projectAttempts.length, 2);
            const lessonPage = await request(url + '/quadratic.html');
            assert.equal(lessonPage.status, 200);
            assert.match(await lessonPage.text(), /Lesson assessment/);
            const course = url + '/api/course/quadratic-1';
            const sendCourse = (suffix, payload) => request(course + suffix, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            assert.equal((await (await request(course)).json()).solved, 0);
            const rejected = await sendCourse('/practice', { id: 'standard', answer: { h: 2 } });
            assert.equal(rejected.status, 400);
            const graded = await sendCourse('/practice', { id: 'standard', answer: { h: 2, k: 1 } });
            assert.equal(graded.status, 200);
            assert.equal((await graded.json()).correct, true);
            assert.equal((await (await request(course)).json()).solved, 1);
            assert.equal((await sendCourse('/assessment', { answers: {} })).status, 400);
            const assessment = await sendCourse(
                '/assessment',
                {
                    answers: {
                        shape: { direction: 'down', h: -2, k: 3 },
                        calculate: { h: 3, k: -4, intercept: 14 },
                        symmetry: { otherX: -5 },
                        range: { relation: 'le', bound: 6 },
                        build: { a: 3, h: 2, k: -1 }
                    }
                });
            assert.equal(assessment.status, 200);
            assert.equal((await assessment.json()).passed, true);
            assert.equal((await (await request(course)).json()).completed, false);
            const second = url + '/api/course/quadratic-2';
            const third = url + '/api/course/quadratic-3';
            for (const page of ['completing-square.html', 'quadratic-equations.html']) {
                assert.equal((await request(url + '/' + page)).status, 200);
            }
            const submit = (target, payload) => request(target + '/practice', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            const secondResult = await submit(second, { id: 'rewrite', answer: { expression: '6+4x-2x^2' } });
            assert.equal(secondResult.status, 200);
            assert.equal((await secondResult.json()).correct, true);
            const thirdResult = await submit(third, { id: 'factor', answer: { expression: '(x+5)(x-2)', r1: 2, r2: -5 } });
            assert.equal(thirdResult.status, 200);
            assert.equal((await thirdResult.json()).correct, true);
            assert.equal((await (await request(second)).json()).solved, 1);
            assert.equal((await (await request(third)).json()).solved, 1);
            assert.equal((await (await request(course)).json()).solved, 1);
            for (const page of ['quadratic-inequalities.html', 'applications.html', 'quadratic-final.html']) {
                assert.equal((await request(url + '/' + page)).status, 200);
            }
            const fourth = url + '/api/course/quadratic-4';
            const fifth = url + '/api/course/quadratic-5';
            const final = url + '/api/course/quadratic-final';
            const inequality = await submit(fourth, { id: 'signs', answer: { solution: '(-inf,-2) U (3,inf)' } });
            assert.equal(inequality.status, 200);
            assert.equal((await inequality.json()).correct, true);
            const trajectory = await submit(fifth, { id: 'trajectory', answer: { a: '-1/5', b: '69/40', c: '2' } });
            assert.equal(trajectory.status, 200);
            assert.equal((await trajectory.json()).correct, true);
            assert.equal((await (await request(final)).json()).practiceTotal, 0);
            assert.equal((await (await request(final)).json()).completed, false);
            for (const page of ['limits-1.html', 'limits-2.html', 'limits-3.html', 'limits-4.html', 'limits-final.html']) {
                assert.equal((await request(url + '/' + page)).status, 200);
            }
            const limits = url + '/api/course/limits-1';
            const precision = await submit(limits, { id: 'precision', answer: { delta: '.04' } });
            assert.equal((await precision.json()).correct, true);
            assert.equal((await (await request(limits)).json()).solved, 1);
            const step = await request(url + '/api/course/limits-3/practice-step', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: 'steps', key: 'factor', value: '(x-3)(x-4)' })
            });
            assert.equal((await step.json()).correct, true);
            assert.equal((await (await request(url + '/api/course/limits-3')).json()).solved, 0);
            const notebookList = await (await request(limits + '/notebooks')).json();
            assert.equal(notebookList.length, 0);
            const notebookUrl = url + '/api/course/limits-3';
            const items = await (await request(notebookUrl + '/notebooks')).json();
            assert.equal(items.length, 3);
            const notebook = await request(notebookUrl + '/notebook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: 'limit-cancel', rows: ['x+3'], answer: '6', finish: true })
            });
            assert.equal(notebook.status, 200);
            assert.equal((await notebook.json()).complete, true);
            assert.equal((await (await request(notebookUrl)).json()).notebookSolved, 1);
            assert.equal((await request(notebookUrl + '/notebook/limit-cancel/solution')).status, 200);
            assert.equal((await request(url + '/api/course/unknown')).status, 400);
            assert.equal((await request(url + '/api/nonexistent')).status, 404);
            assert.equal((await (await request(course, {}, bob)).json()).solved, 0);
            const draft = await request(url + '/api/drafts/axion-stereo-work-v2', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: '{"test":true}' }) });
            assert.equal(draft.status, 200);
            assert.equal((await (await request(url + '/api/drafts')).json())['axion-stereo-work-v2'], '{"test":true}');
            assert.deepEqual(await (await request(url + '/api/drafts', {}, bob)).json(), {});
            assert.equal((await request(url + '/api/auth/logout', { method: 'POST' })).status, 200);
            assert.equal((await request(url + '/api/progress')).status, 401);
        }
        finally {
            if (server)
                await new Promise(resolve => server.close(resolve));
            await fs.rm(dir, { recursive: true, force: true });
        }
    });
