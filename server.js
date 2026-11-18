const express=require('express');
const path=require('node:path');
const {createStore}=require('./store');
const {bank,publicQuestion}=require('./practice-bank');
const {challenges}=require('./studio-check');

const app=express();
const store=createStore(process.env.AXION_DATA_FILE||path.join(__dirname,'data','db.json'));
app.disable('x-powered-by');
app.use(express.json({limit:'25kb'}));
const route=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(next);

app.get('/api/health',(req,res)=>res.json({ok:true,service:'Axion'}));
app.get('/api/progress',route(async(req,res)=>res.json(await store.progress())));
app.post('/api/progress',route(async(req,res)=>res.status(201).json(await store.finish(req.body?.activity))));
app.delete('/api/progress',route(async(req,res)=>{await store.clearProgress();res.json({ok:true})}));
app.post('/api/lesson/check',route(async(req,res)=>res.json(await store.checkLesson(req.body?.id,req.body?.answer))));
app.get('/api/study/questions',(req,res)=>res.json(bank.filter(q=>!req.query.skill||req.query.skill==='all'||q.skill===req.query.skill).map(publicQuestion)));
app.get('/api/study/status',route(async(req,res)=>res.json(await store.studyStatus())));
app.post('/api/study/check',route(async(req,res)=>res.json(await store.checkPractice(req.body||{}))));
app.post('/api/study/lab',route(async(req,res)=>res.json(await store.checkLab(req.body||{}))));
app.delete('/api/study/reset',route(async(req,res)=>{await store.resetStudy();res.json({ok:true})}));
app.get('/api/studio/challenges',(req,res)=>res.json(challenges.map(({id,title,task,a})=>({id,title,task,a}))));
app.post('/api/studio/challenge',route(async(req,res)=>res.json(await store.checkStudio(req.body||{}))));
app.get('/api/studio/experiments',route(async(req,res)=>res.json(await store.experiments())));
app.post('/api/studio/experiments',route(async(req,res)=>res.status(201).json(await store.saveExperiment(req.body||{}))));
app.delete('/api/studio/experiments/:id',route(async(req,res)=>res.json(await store.deleteExperiment(req.params.id))));
app.use('/api',(req,res)=>res.status(404).json({error:'Unknown API route'}));

app.use(express.static(path.join(__dirname,'public'),{index:'index.html',extensions:['html']}));
app.use((req,res)=>res.status(404).send('Page not found'));
app.use((error,req,res,next)=>{
    if(error instanceof SyntaxError&&'body' in error)return res.status(400).json({error:'Invalid JSON'});
    console.error(error);
    res.status(error.status||500).json({error:error.status?error.message:'Internal server error'});
});

if(require.main===module){
    (async()=>{
        const requested=process.env.PORT?Number(process.env.PORT):null;
        if(requested!==null&&(!Number.isInteger(requested)||requested<1||requested>65535))throw Error('PORT must be from 1 to 65535');
        const ports=requested?[requested]:[3001,3002,3003,3004,3005,3006,3007,3008,3009,3010];
        for(const port of ports){
            try{
                await new Promise((resolve,reject)=>{const server=app.listen(port,'127.0.0.1');server.once('error',reject);server.once('listening',resolve)});
                console.log(`Axion: http://127.0.0.1:${port}/`);
                console.log(`API:   http://127.0.0.1:${port}/api/health`);
                return;
            }catch(e){if(e.code!=='EADDRINUSE')throw e;}
        }
        throw Error('Ports 3001–3010 are occupied. Stop another server or set PORT.');
    })().catch(e=>{console.error(e.message);process.exitCode=1});
}
module.exports=app;
