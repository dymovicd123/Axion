try {
    document.documentElement.dataset.theme = localStorage.getItem('axion-theme') || 'light';
}
catch { }
fetch('/api/stereo/results').then(r => {
    if (!r.ok)
        throw Error();
    return r.json();
}).then(rows => {
    document.getElementById('profile-geometry').textContent = rows.filter(row => row.correct).length;
}).catch(() => { });
