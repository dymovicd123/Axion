(function () {
    try {
        document.documentElement.dataset.theme = localStorage.getItem('axion-theme') || 'light';
    }
    catch { }
    const form = document.getElementById('auth-form'),
        title = document.getElementById('auth-title'),
        error = document.getElementById('auth-error'),
        submit = document.getElementById('auth-submit');
    let register = false;
    function mode(value) {
        register = value;
        title.textContent = submit.textContent = value ? 'Create account' : 'Sign in';
        document.getElementById('name-field').hidden = !value;
        form.elements.displayName.required = value;
        form.elements.password.minLength = value ? 8 : 1;
        form.elements.password.autocomplete = value ? 'new-password' : 'current-password';
        document.getElementById('password-hint').hidden = !value;
        document.getElementById('login-tab').setAttribute('aria-pressed', String(!value));
        document.getElementById('register-tab').setAttribute('aria-pressed', String(value));
        error.textContent = '';
    }
    document.getElementById('login-tab').onclick = () => mode(false);
    document.getElementById('register-tab').onclick = () => mode(true);
    fetch('/api/auth/me').then(r => r.json()).then(data => {
        if (data.setupNeeded) {
            document.getElementById('setup-note').hidden = false;
            mode(true);
        }
    }).catch(() => { });
    form.onsubmit = async (event) => {
        event.preventDefault();
        submit.disabled = true;
        error.textContent = '';
        try {
            const response = await fetch('/api/auth/' + (register ? 'register' : 'login'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Axion-Request': '1' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
            const data = await response.json();
            if (!response.ok)
                throw Error(data.error || 'Could not sign in.');
            const next = new URLSearchParams(location.search).get('next');
            const target = next && /^\/(?!\/)[a-zA-Z0-9_/?=&.%#-]*$/.test(next) && !next.startsWith('/login') && !next.startsWith('/api/') ? next : '/';
            location.replace(target);
        }
        catch (e) {
            error.textContent = e.message;
            submit.disabled = false;
        }
    };
})();
