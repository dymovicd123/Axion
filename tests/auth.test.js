const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { DatabaseSync } = require('node:sqlite');
const { createAuth, cookie } = require('../auth');
const { createDatabase } = require('../database');
const { createStore } = require('../store');
function temporary(run) {
    return async () => { const dir=fs.mkdtempSync(path.join(os.tmpdir(),'axion-auth-')); try { await run(path.join(dir,'db.sqlite')); } finally { fs.rmSync(dir,{recursive:true,force:true}); } };
}
const account = (username, displayName=username) => ({username,displayName,password:'example-password-123'});
const header = token => cookie(token).split(';')[0];
test('v1 migration preserves results; first account claims local profile and later accounts are isolated', temporary(async file => {
    await createStore(file).coursePractice({id:'standard',answer:{h:2,k:1}});
    const auth=createAuth(file); assert.equal(auth.setupNeeded(),true);
    const a=await auth.register(account('alice')), b=await auth.register(account('bob'));
    assert.equal(a.user.profileId,'local'); assert.notEqual(a.user.profileId,b.user.profileId);
    assert.equal((await createStore(file,a.user.profileId).courseStatus()).solved,1);
    assert.equal((await createStore(file,b.user.profileId).courseStatus()).solved,0);
    await createStore(file,b.user.profileId).coursePractice({id:'standard',answer:{h:2,k:1}});
    await createStore(file,a.user.profileId).clearProgress();
    assert.equal((await createStore(file,b.user.profileId).courseStatus()).solved,1);
    assert.equal(createAuth(file).setupNeeded(),false);
    const sql=new DatabaseSync(file); try {
        assert.equal(sql.prepare('PRAGMA user_version').get().user_version,2);
        assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM migrations').get().n,2);
        assert.equal(sql.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
        assert.equal(sql.prepare('PRAGMA foreign_key_check').all().length,0);
    } finally {sql.close();}
}));
test('authentication uses hashed passwords and tokens, rejects duplicate names, rotates and revokes sessions', temporary(async file => {
    const auth=createAuth(file), a=await auth.register(account('Alice'));
    assert.equal(auth.authenticate(header(a.token)).username,'alice');
    assert.equal(auth.authenticate('axion_session=invalid'),null);
    assert.match(cookie(a.token,true),/HttpOnly; SameSite=Strict; Max-Age=604800; Secure/);
    await assert.rejects(auth.register(account('ALICE')),e=>e.status===409);
    await assert.rejects(auth.register({...account('other'),password:'short'}),e=>e.status===400);
    await assert.rejects(auth.login({...account('alice'),password:'wrong'}),e=>e.status===401);
    const b=await auth.login(account('ALICE'),header(a.token));
    assert.equal(auth.authenticate(header(a.token)),null); assert.equal(auth.authenticate(header(b.token)).id,a.user.id);
    const sql=new DatabaseSync(file); try {
        assert.notEqual(sql.prepare('SELECT password_hash FROM users').get().password_hash,account('alice').password);
        assert.notEqual(sql.prepare('SELECT token_hash FROM sessions').get().token_hash,b.token);
        sql.prepare('UPDATE sessions SET expires_at=0').run();
    } finally {sql.close();}
    assert.equal(auth.authenticate(header(b.token)),null);
    const c=await auth.login(account('alice'));auth.logout(header(c.token));assert.equal(auth.authenticate(header(c.token)),null);
}));
test('drafts persist across sessions, stay isolated and import does not overwrite current drafts', temporary(async file => {
    const auth=createAuth(file), a=await auth.register(account('alice')), b=await auth.register(account('bob'));
    const key='axion-stereo-work-v2', value=JSON.stringify({p11:{steps:[{text:'AC=5'}]}});
    auth.saveDraft(a.user,key,value); assert.deepEqual(auth.drafts(b.user),{});
    assert.equal(auth.importDrafts(a.user,{[key]:'{}','axion-limits-1-draft':'{"x":1}'}),1);
    assert.equal(auth.importDrafts(a.user,{'axion-limits-1-draft':'{}'}),0);
    assert.throws(()=>auth.importDrafts(b.user,{[key]:value}),e=>e.status===403);
    assert.throws(()=>auth.saveDraft(a.user,'unknown','{}'),e=>e.status===400);
    assert.throws(()=>auth.saveDraft(a.user,key,'not json'),e=>e.status===400);
    const again=await createAuth(file).login(account('alice'));
    assert.equal(createAuth(file).drafts(again.user)[key],value);
    auth.saveDraft(b.user,key,'{"bob":true}'); assert.equal(auth.drafts(a.user)[key],value);
}));
