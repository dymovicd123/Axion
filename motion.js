const slider = document.getElementById('time');
const playButton = document.getElementById('play');
const car = document.getElementById('car');
let timer = null;

function updateMotion() {
    const time = Number(slider.value);
    const distance = time * time;
    const speed = 2 * time;

    document.getElementById('time-value').textContent = time.toFixed(1) + ' s';
    document.getElementById('distance-value').textContent = distance.toFixed(1);
    document.getElementById('speed-value').textContent = speed.toFixed(1);
    document.getElementById('average-value').textContent = time === 0 ? '—' : time.toFixed(1);
    const percent = distance / 36 * 100;
    car.style.left = percent + '%';
    car.style.transform = `translateX(-${percent}%)`;
}

function stopMotion() {
    clearInterval(timer);
    timer = null;
    playButton.textContent = 'Play';
}

playButton.addEventListener('click', function () {
    if (timer !== null) {
        stopMotion();
        return;
    }

    if (Number(slider.value) >= 6) slider.value = 0;
    playButton.textContent = 'Pause';
    timer = setInterval(function () {
        slider.value = Math.min(6, Number(slider.value) + 0.1).toFixed(1);
        updateMotion();
        if (Number(slider.value) >= 6) stopMotion();
    }, 120);
});

slider.addEventListener('input', function () {
    stopMotion();
    updateMotion();
});

document.getElementById('reset').addEventListener('click', function () {
    stopMotion();
    slider.value = 0;
    updateMotion();
});

updateMotion();
