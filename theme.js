const savedTheme = localStorage.getItem('axion-theme');
document.documentElement.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light';

const themeButton = document.getElementById('theme-toggle');

function updateThemeButton() {
    const dark = document.documentElement.dataset.theme === 'dark';
    themeButton.textContent = dark ? 'Light mode' : 'Dark mode';
    themeButton.setAttribute('aria-pressed', String(dark));
}

themeButton.addEventListener('click', function () {
    const dark = document.documentElement.dataset.theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'light' : 'dark';
    localStorage.setItem('axion-theme', document.documentElement.dataset.theme);
    updateThemeButton();
    document.dispatchEvent(new Event('axion-theme-change'));
});

updateThemeButton();
