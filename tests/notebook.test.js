const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const N = require('../course-notebook');
const {createStore} = require('../store');
const Course = require('../course-bank');

test('all notebook solutions are accepted without leaking answers in the task list', () => {
    for (const t of N.tasks) {
        const w = N.worked(t.lesson,t.id);
        const r = N.check(t.lesson,{id:t.id,rows:w.rows,answer:w.answer,finish:true});
        assert.equal(r.complete,true,t.id);
        const item = N.list(t.lesson).find(x=>x.id===t.id);
        assert.equal(item.solution,undefined);
        assert.equal(item.roots,undefined);
        assert.equal(item.answer,undefined);
    }
});
test('equations accept alternative transformations but reject losing a root or multiplying by x', () => {
    const check = rows=>N.check('quadratic-3',{id:'equation-zero',rows,answer:['4','0'],finish:true});
    assert.equal(check(['x^2-4x=0','x(x-4)=0']).complete,true);
    assert.equal(check(['x=4']).complete,false);
    assert.equal(check(['x^3-4x^2=0']).complete,false);
    assert.equal(check(['0=0']).complete,false);
    assert.equal(check(['3x^2=12x']).complete,false);
    assert.equal(N.check('quadratic-3',{id:'equation-irrational',rows:['(x+3)^2=7'],answer:['-3+sqrt(7)','-3-sqrt(7)'],finish:true}).complete,true);
});
test('vertex form must be equivalent and actually contain a completed square', () => {
    const check = rows=>N.check('quadratic-2',{id:'square-monic',rows,finish:true});
    assert.equal(check(['-18+(5-x)^2']).complete,true);
    assert.equal(check(['7-10x+x^2']).complete,false);
    assert.equal(check(['(x-5)^2+18']).complete,false);
});
test('rational limits check equivalence and reject an unresolved hole and zero denominator', () => {
    const check=rows=>N.check('limits-3',{id:'limit-cancel',rows,answer:'6',finish:true});
    assert.equal(check(['3+x']).complete,true);
    assert.equal(check(['(x-3)(x+3)/(x-3)']).complete,false);
    assert.equal(check(['(x^2-9)/0']).complete,false);
    assert.equal(check(['6']).complete,false);
    assert.equal(check(['0.000000000001*x/0.000000000001','x+3']).complete,false);
    assert.equal(check(['(x+3)/(x-x+1)']).complete,true);
    assert.equal(check(['x+2','x+3']).complete,false);
});
test('visual editor serialization of grouped fractions and powers is compatible with normal exercises',()=>{
    assert.equal(Course.checkPractice('standard',{h:'(4)/(2)',k:'(1)^(2)'},'quadratic-1').correct,true);
});
test('notebook line checks do not complete the task and final submissions persist separately',async()=>{
    const dir=await fs.mkdtemp(path.join(os.tmpdir(),'axion-notebook-'));
    try{
        const file=path.join(dir,'db.json');await fs.writeFile(file,'{}');
        const store=createStore(file);const input={id:'limit-cancel',rows:['x+3'],answer:'6'};
        await store.notebookCheck({...input,finish:false},'limits-3');
        assert.equal((await store.courseStatus('limits-3')).notebookSolved,0);
        const result=await store.notebookCheck({...input,finish:true},'limits-3');
        assert.equal(result.status.notebookSolved,1);
        const other=createStore(file);assert.equal((await other.notebookList('limits-3')).find(t=>t.id===input.id).latest.rows[0],'x+3');
        assert.equal((await other.courseStatus('limits-3')).solved,0);
    }finally{await fs.rm(dir,{recursive:true,force:true});}
});

test('standalone practice has eight additional problems with independent IDs and valid answers', () => {
    const extra = N.tasks.filter(task => task.practiceOnly);
    assert.equal(extra.length, 8);
    assert.equal(new Set(N.tasks.map(task => task.id)).size, N.tasks.length);
    for (const task of extra) {
        const worked = N.worked(task.lesson, task.id);
        assert.equal(N.check(task.lesson, { id: task.id, rows: worked.rows, answer: worked.answer, finish: true }).complete, true);
        assert.equal(N.list(task.lesson).find(item => item.id === task.id).practiceOnly, true);
    }
});
