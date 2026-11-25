const express = require('express');
const path = require('node:path');
const fs = require('node:fs');
const { createAuth, cookie } = require('./auth');
const { createStore } = require('./store');
const { bank, publicQuestion } = require('./practice-bank');
const { challenges } = require('./studio-check');
const Course = require('./course-bank');
const Notebook = require('./course-notebook');
const app = express();
const dataFile = process.env.AXION_DATA_FILE || path.join(__dirname, 'data', 'db.sqlite');
const auth = createAuth(dataFile);
app.disable('x-powered-by');
app.use('/api/drafts', express.json({ limit: '5mb' }));
app.use(express.json({ limit: '25kb' }));
const route = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
app.use(
    '/api',
    (req, res, next) => {
        res.set('Cache-Control', 'no-store');
        if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('X-Axion-Request') !== '1')
            return res.status(403).json({ error: 'Invalid request origin.' });
        req.user = auth.authenticate(req.get('Cookie'));
        next();
    });
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'Axion' }));
app.get('/api/auth/me', (req, res) => res.json({ user: req.user, setupNeeded: auth.setupNeeded() }));
const attempts = new Map();
function throttle(req, res, next) {
    const now = Date.now();
    for (const [key, value] of attempts)
        if (value.until <= now)
            attempts.delete(key);
    const key = req.ip;
    const entry = attempts.get(key) || { count: 0, until: now + 15 * 60 * 1000 };
    if (++entry.count > 20)
        return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
    attempts.set(key, entry);
    next();
}
for (const action of ['register', 'login'])
    app.post(
        '/api/auth/' + action,
        throttle,
        route(async (req, res) => {
            const result = await auth[action](req.body, req.get('Cookie'));
            res.set('Set-Cookie', cookie(result.token, req.secure || process.env.AXION_SECURE_COOKIE === '1'));
            res.status(action === 'register' ? 201 : 200).json({ user: result.user });
        }));
app.use(
    '/api',
    (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ error: 'Sign in to continue.' });
        const profile = req.get('X-Axion-Profile');
        if ((profile && profile !== req.user.profileId) || (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && profile !== req.user.profileId))
            return res.status(409).json({ error: 'Account changed. Reload this page before continuing.' });
        next();
    });
app.post('/api/auth/logout', (req, res) => {
    auth.logout(req.get('Cookie'));
    res.set('Set-Cookie', cookie(null, req.secure || process.env.AXION_SECURE_COOKIE === '1')).json({ ok: true });
});
app.get('/api/drafts', (req, res) => res.json(auth.drafts(req.user)));
app.put('/api/drafts/:key', (req, res) => {
    auth.saveDraft(req.user, req.params.key, req.body?.value);
    res.json({ ok: true });
});
app.post('/api/drafts/import', (req, res) => res.json({ imported: auth.importDrafts(req.user, req.body?.drafts) }));
app.use('/api', (req, res, next) => {
    req.store = createStore(dataFile, req.user.profileId);
    next();
});
app.get('/api/stereo/results', route(async (req, res) => res.json(await req.store.stereoResults())));
app.post('/api/stereo/results', route(async (req, res) => res.json(await req.store.stereoSubmit(req.body || {}))));
app.get('/api/course/:lessonId', route(async (req, res) => res.json(await req.store.courseStatus(req.params.lessonId))));
app.post('/api/course/:lessonId/practice', route(async (req, res) => res.json(await req.store.coursePractice(req.body || {}, req.params.lessonId))));
app.post(
    '/api/course/:lessonId/practice-step',
    (req, res) => {
        try {
            res.json(Course.checkPracticeStep(req.body?.id, req.body?.key, req.body?.value, req.params.lessonId));
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
app.post('/api/course/:lessonId/assessment', route(async (req, res) => res.json(await req.store.courseAssessment(req.body || {}, req.params.lessonId))));
app.get('/api/course/:lessonId/notebooks', route(async (req, res) => res.json(await req.store.notebookList(req.params.lessonId))));
app.post('/api/course/:lessonId/notebook', route(async (req, res) => res.json(await req.store.notebookCheck(req.body || {}, req.params.lessonId))));
app.get(
    '/api/course/:lessonId/notebook/:id/solution',
    (req, res) => {
        try {
            res.json(Notebook.worked(req.params.lessonId, req.params.id));
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
app.get('/api/progress', route(async (req, res) => res.json(await req.store.progress())));
app.post('/api/progress', route(async (req, res) => res.status(201).json(await req.store.finish(req.body?.activity))));
app.delete('/api/progress', route(async (req, res) => {
    await req.store.clearProgress();
    res.json({ ok: true });
}));
app.post('/api/lesson/check', route(async (req, res) => res.json(await req.store.checkLesson(req.body?.id, req.body?.answer))));
app.get('/api/study/questions', (req, res) => res.json(bank.filter(q => !req.query.skill || req.query.skill === 'all' || q.skill === req.query.skill).map(publicQuestion)));
app.get('/api/study/status', route(async (req, res) => res.json(await req.store.studyStatus())));
app.post('/api/study/check', route(async (req, res) => res.json(await req.store.checkPractice(req.body || {}))));
app.post('/api/study/lab', route(async (req, res) => res.json(await req.store.checkLab(req.body || {}))));
app.delete('/api/study/reset', route(async (req, res) => {
    await req.store.resetStudy();
    res.json({ ok: true });
}));
app.get('/api/studio/challenges', (req, res) => res.json(challenges.map(({ id, title, task, a }) => ({ id, title, task, a }))));
app.post('/api/studio/challenge', route(async (req, res) => res.json(await req.store.checkStudio(req.body || {}))));
app.get('/api/studio/experiments', route(async (req, res) => res.json(await req.store.experiments())));
app.post('/api/studio/experiments', route(async (req, res) => res.status(201).json(await req.store.saveExperiment(req.body || {}))));
app.delete('/api/studio/experiments/:id', route(async (req, res) => res.json(await req.store.deleteExperiment(req.params.id))));
app.get('/api/projects/status', route(async (req, res) => res.json(await req.store.projectStatus())));
app.post('/api/projects/check', route(async (req, res) => res.status(201).json(await req.store.checkProject(req.body || {}))));
app.use('/api', (req, res) => res.status(404).json({ error: 'Unknown API route' }));
app.use('/vendor/three', express.static(path.join(__dirname, 'node_modules', 'three', 'build')));
app.use('/vendor/three-addons', express.static(path.join(__dirname, 'node_modules', 'three', 'examples', 'jsm')));
app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD')
        return next();
    const requested = decodeURIComponent(req.path);
    if (requested.startsWith('/assets/') || requested.startsWith('/videos/'))
        return next();
    const name = requested === '/' ? 'index.html' : requested.slice(1).replace(/\/$/, '');
    if (!/^[a-z0-9-]+(?:\.html)?$/i.test(name))
        return res.status(404).send('Page not found');
    const htmlName = name.endsWith('.html') ? name : name + '.html';
    const filename = path.join(__dirname, 'public', htmlName);
    if (!fs.existsSync(filename))
        return res.status(404).send('Page not found');
    res.set('Cache-Control', 'no-store');
    const user = auth.authenticate(req.get('Cookie'));
    if (htmlName === 'login.html') {
        if (user)
            return res.redirect('/');
        return res.sendFile(filename);
    }
    if (!user)
        return res.redirect('/login.html?next=' + encodeURIComponent(req.originalUrl));
    const bootstrap = JSON.stringify({ user, drafts: auth.drafts(user) }).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    const inject = '<script>window.AxionSession=' + bootstrap + ';</script><script src="/assets/account.js"></script><link rel="stylesheet" href="/assets/account.css">';
    res.type('html').send(fs.readFileSync(filename, 'utf8').replace(/<head>/i, '<head>' + inject));
});
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/videos', express.static(path.join(__dirname, 'public', 'videos')));
app.use((req, res) => res.status(404).send('Page not found'));
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && 'body' in error)
        return res.status(400).json({ error: 'Invalid JSON' });
    if (!error.status || error.status >= 500)
        console.error(error);
    res.status(error.status || 500).json({ error: error.status ? error.message : 'Internal server error' });
});
if (require.main === module) {
    (async () => {
        const requested = process.env.PORT ? Number(process.env.PORT) : null;
        if (requested !== null && (!Number.isInteger(requested) || requested < 1 || requested > 65535))
            throw Error('PORT must be from 1 to 65535');
        const ports = requested ? [requested] : [3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010];
        for (const port of ports) {
            try {
                await new Promise((resolve, reject) => {
                    const server = app.listen(port, '127.0.0.1');
                    server.once('error', reject);
                    server.once('listening', resolve);
                });
                console.log(`Axion: http://127.0.0.1:${port}/`);
                console.log(`API:   http://127.0.0.1:${port}/api/health`);
                return;
            }
            catch (e) {
                if (e.code !== 'EADDRINUSE')
                    throw e;
            }
        }
        throw Error('Ports 3001–3010 are occupied. Stop another server or set PORT.');
    })().catch(e => {
        console.error(e.message);
        process.exitCode = 1;
    });
}
module.exports = app;
