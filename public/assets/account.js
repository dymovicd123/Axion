(function () {
    const session = window.AxionSession;
    if (!session) return;
    const user = session.user;
    const values = new Map(Object.entries(session.drafts));
    const pending = new Map();
    const active = new Map();
    let timer, failure = '', navigating = false;
    const originalFetch = window.fetch.bind(window);
    window.fetch = (resource, init = {}) => {
        const url = new URL(resource instanceof Request ? resource.url : resource, location.href);
        if (url.origin !== location.origin || !url.pathname.startsWith('/api/')) return originalFetch(resource, init);
        const headers = new Headers(init.headers || (resource instanceof Request ? resource.headers : undefined));
        headers.set('X-Axion-Request', '1');
        headers.set('X-Axion-Profile', user.profileId);
        return originalFetch(resource, { ...init, headers }).then(response => {
            if (response.status === 401 || response.status === 409) {
                failure = 'Session expired or account changed. Open a new page to sign in.';
                status();
            }
            return response;
        });
    };
    function status() {
        const indicator = document.getElementById('account-sync');
        if (!indicator) return;
        indicator.textContent = failure ? 'Not synced — retry' : pending.size || active.size ? 'Saving…' : 'Saved';
        indicator.title = failure || 'Your drafts are saved to your account.';
        indicator.dataset.error = failure ? 'true' : 'false';
    }
    function schedule() {
        clearTimeout(timer);
        timer = setTimeout(() => flush(), 350);
        status();
    }
    function save(key, value) {
        if (active.has(key)) return active.get(key);
        const promise = fetch('/api/drafts/' + encodeURIComponent(key), {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value }), keepalive: value.length < 10000
        }).then(async response => {
            if (!response.ok) throw Error((await response.json()).error || 'Could not save.');
            if (pending.get(key) === value) pending.delete(key);
            failure = '';
            return true;
        }).catch(error => { failure = error.message; return false; }).finally(() => { active.delete(key); status(); });
        active.set(key, promise);
        return promise;
    }
    async function flush() {
        clearTimeout(timer);
        while (pending.size || active.size) {
            const batch = [...pending].map(([key,value]) => save(key,value));
            const results = await Promise.all([...batch,...active.values()]);
            if (results.some(result => !result)) { status(); return false; }
        }
        status(); return true;
    }
    window.AxionStorage = {
        getItem(key) { return key === 'axion-theme' ? localStorage.getItem(key) : values.get(key) ?? null; },
        setItem(key,value) {
            if (key === 'axion-theme') { localStorage.setItem(key,value); return; }
            value = String(value);
            if (values.get(key) === value) return;
            values.set(key,value); pending.set(key,value); schedule();
        }
    };
    window.AxionAccount = { user, flush };
    document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
    window.addEventListener('beforeunload', event => {
        if (!navigating && (pending.size || active.size)) { flush(); event.preventDefault(); event.returnValue = ''; }
    });
    document.addEventListener('click', async event => {
        const link = event.target.closest?.('a[href]');
        if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
        const dest = new URL(link.href,location.href);
        if (dest.origin !== location.origin || (dest.pathname === location.pathname && dest.search === location.search) || (!pending.size && !active.size)) return;
        event.preventDefault();
        if (await flush()) { navigating = true; location.href = dest.href; }
        else alert('Your changes are not saved. Retry synchronization before leaving.');
    });
    window.addEventListener('online', () => flush());
    window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
    async function logout() {
        if (!await flush() && !confirm('Some changes are not saved. Sign out anyway?')) return;
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (!response.ok) throw Error('Could not sign out. Reload and try again.');
            navigating = true; location.replace('/login.html');
        } catch (error) { alert(error.message); }
    }
    function ready() {
        const header = document.querySelector('.header-inner, .topbar-inner, .account-header');
        if (header) {
            const nav = document.createElement('div'); nav.className = 'account-controls';
            const profile = document.createElement('a'); profile.href = '/profile.html'; profile.textContent = user.displayName; profile.title = 'Your profile'; profile.className = 'account-name';
            const sync = document.createElement('button'); sync.type='button'; sync.id='account-sync'; sync.className='account-sync'; sync.onclick=()=>flush();
            const signOut = document.createElement('button'); signOut.type='button'; signOut.textContent='Sign out'; signOut.onclick=logout;
            nav.append(profile,sync,signOut); header.append(nav); status();
        }
        const name = document.getElementById('profile-name');
        if (name) {
            name.textContent = user.displayName;
            document.getElementById('profile-username').textContent = '@' + user.username;
            document.getElementById('profile-drafts').textContent = values.size;
            const section = document.getElementById('legacy-import');
            if (user.legacy) {
                section.hidden = false;
                document.getElementById('import-old').onclick = async () => {
                    const result = document.getElementById('import-status');
                    const keys = /^axion-(?:(?:quadratic|limits)-(?:[1-5]|final)-draft|notebook-[a-z0-9_-]+|project-[a-z0-9_-]+|stereo-(?:progress-v2|work-v2|generator-current|generator-recent))$/i;
                    const drafts = {};
                    try {
                        for (let i=0; i<localStorage.length; i++) {
                            const key=localStorage.key(i); if (keys.test(key)) { const value=localStorage.getItem(key); try { JSON.parse(value); drafts[key]=value; } catch {} }
                        }
                        if (!Object.keys(drafts).length) { result.textContent='No previous drafts found on this browser.'; return; }
                        if (!confirm('Import previous local drafts into this account? Existing server drafts will not be overwritten.')) return;
                        const response=await fetch('/api/drafts/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({drafts})});
                        const data=await response.json(); if (!response.ok) throw Error(data.error);
                        const refreshed=await fetch('/api/drafts'); if (!refreshed.ok) throw Error('Import saved. Reload to see drafts.');
                        for (const [key,value] of Object.entries(await refreshed.json())) values.set(key,value);
                        document.getElementById('profile-drafts').textContent=values.size;
                        result.textContent=`Imported ${data.imported} drafts. Existing account drafts were preserved.`;
                    } catch(error) { result.textContent=error.message; }
                };
            }
        }
    }
    document.addEventListener('DOMContentLoaded', ready);
})();
