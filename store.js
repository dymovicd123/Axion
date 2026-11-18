const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { bank, check: checkQuestion } = require('./practice-bank');
const { checks } = require('./lesson-checks');
const { validateSetup, checkChallenge } = require('./studio-check');

function createStore(file) {
    let queue=Promise.resolve();

    async function read() {
        const data=JSON.parse(await fs.readFile(file,'utf8'));
        for(const key of ['progress','studyAttempts','labResults','lessonChecks','experiments']) {
            if(!Array.isArray(data[key])) data[key]=[];
        }
        return data;
    }

    function edit(change) {
        const job=queue.then(async()=>{
            const data=await read();
            const result=change(data);
            const temp=path.join(path.dirname(file),`.axion-${randomUUID()}.tmp`);
            try {
                await fs.writeFile(temp,JSON.stringify(data,null,2)+'\n','utf8');
                await fs.rename(temp,file);
            } finally {await fs.rm(temp,{force:true}).catch(()=>{});}
            return result;
        });
        queue=job.then(()=>{},()=>{});
        return job;
    }

    function mark(data,activity) {
        let item=data.progress.find(entry=>entry.activity===activity);
        if(!item){item={id:randomUUID(),activity,completedAt:new Date().toISOString()};data.progress.push(item);}
        return item;
    }

    function badRequest(message){const err=new Error(message);err.status=400;return err;}

    return {
        read,
        async progress(){return (await read()).progress;},
        async finish(activity){
            if(!Object.values(checks).some(c=>c.activity===activity))throw badRequest('Unknown lesson');
            return edit(data=>mark(data,activity));
        },
        async checkLesson(id,answer){
            const question=checks[id];if(!question)throw badRequest('Unknown lesson');
            if(!Number.isInteger(answer))throw badRequest('Choose a valid answer');
            const correct=answer===question.correct;
            await edit(data=>{
                data.lessonChecks.push({id:randomUUID(),lesson:id,correct,at:new Date().toISOString()});
                if(correct)mark(data,question.activity);
            });
            return {correct,explanation:question.explanation,saved:correct};
        },
        async clearProgress(){await edit(data=>{data.progress=[];data.lessonChecks=[];});},
        async studyStatus(){const data=await read();return {attempts:data.studyAttempts,labs:data.labResults};},
        async checkPractice(input){
            const q=bank.find(item=>item.id===input.id);if(!q)throw badRequest('Question not found');
            const outcome=checkQuestion(q,input.answer,input.stepIndex);
            if(!outcome)throw badRequest('Invalid step');
            if(outcome.finished||!outcome.correct){await edit(data=>{data.studyAttempts.push({id:randomUUID(),questionId:q.id,skill:q.skill,correct:outcome.correct,finished:outcome.finished,at:new Date().toISOString()});});}
            const explanation=outcome.correct?(outcome.finished?q.explanation:outcome.stepExplanation):(outcome.stepExplanation||q.hints[0]);
            return {...outcome,explanation};
        },
        async checkLab(input){
            const {kind,challenge,config={}}=input||{};
            let correct=false,explanation='';
            if(kind==='studio'){
                const targets={line:4,hole:4,changed:4,jump:'DNE',asymptote:'DNE'};
                if(!Object.hasOwn(targets,challenge))throw badRequest('Unknown studio function');
                correct=String(config.prediction).trim().toUpperCase()===String(targets[challenge]).toUpperCase();
                explanation=correct?'The prediction agrees with the nearby behavior on both sides.':'Look at the left and right outputs again. The value at x = 2 is a separate question.';
            } else if(kind==='builder'){
                const targets={hole:[4,4,null],misleading:[4,4,9],jump:[2,5,8],continuous:[3,3,3]};
                const target=targets[challenge];if(!target)throw badRequest('Unknown builder challenge');
                const numbers=[config.left,config.right,config.point];
                correct=numbers.every((value,index)=>value===target[index]);
                explanation=correct?'The two one-sided limits and the exact point meet the challenge.':'Check each side limit independently, and check the value at x = 2 separately.';
            } else if(kind==='slope'){
                const h=Number(config.h);
                correct=challenge==='tangent'&&Number.isFinite(h)&&h>0&&h<=0.1&&String(config.prediction).trim()==='2';
                explanation=correct?'The secant slope for x² at x=1 approaches 2 as h approaches zero.':'Bring h below 0.1 and determine the limiting slope.';
            } else if(kind==='area'){
                const n=Number(config.n),method=config.method;
                correct=challenge==='estimate'&&Number.isInteger(n)&&n>=2&&n<=64&&['left','right'].includes(method)&&8/n<=0.5;
                explanation=correct?'The approximation is within 0.5 L of the exact total, 12 L.':'Use at least 16 left or right rectangles to reduce the error to 0.5 L or less.';
            } else throw badRequest('Unknown lab');
            if(correct)await edit(data=>{if(!data.labResults.some(row=>row.kind===kind&&row.challenge===challenge))data.labResults.push({id:randomUUID(),kind,challenge,completedAt:new Date().toISOString()});});
            return {correct,explanation};
        },
        async checkStudio(input){
            let result;
            try {result=checkChallenge(input.challenge,input.config);} catch(error){throw badRequest(error.message);}
            if(result.correct) await edit(data=>{
                if(!data.labResults.some(item=>item.kind==='function-studio'&&item.challenge===input.challenge)){
                    data.labResults.push({id:randomUUID(),kind:'function-studio',challenge:input.challenge,completedAt:new Date().toISOString()});
                }
            });
            return result;
        },
        async experiments(){return (await read()).experiments.slice().reverse();},
        async saveExperiment(input){
            let normalized;
            try {normalized=validateSetup(input.config).config;} catch(error){throw badRequest(error.message);}
            const note=input.note===undefined?'':input.note;
            if(typeof note!=='string'||note.length>280)throw badRequest('Notes must be under 280 characters.');
            return edit(data=>{
                const item={id:randomUUID(),config:normalized,note:note.trim(),savedAt:new Date().toISOString()};
                data.experiments.push(item);
                if(data.experiments.length>30)data.experiments=data.experiments.slice(-30);
                return item;
            });
        },
        async deleteExperiment(id){
            return edit(data=>{
                const index=data.experiments.findIndex(item=>item.id===id);
                if(index<0)throw Object.assign(Error('Saved function not found.'),{status:404});
                data.experiments.splice(index,1);
                return {ok:true};
            });
        },
        async resetStudy(){await edit(data=>{data.studyAttempts=[];data.labResults=[];});}
    };
}
module.exports={createStore};
