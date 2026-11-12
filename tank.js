const slider = document.getElementById('time');
const flowSelect = document.getElementById('flow');

function updateTank() {
    const time = Number(slider.value);
    const increasing = flowSelect.value === 'increasing';
    const rate = increasing ? 1 + time : 3;
    const volume = increasing ? time + time * time / 2 : 3 * time;

    document.getElementById('time-value').textContent = time.toFixed(1) + ' s';
    document.getElementById('rate-value').textContent = rate.toFixed(1) + ' L/s';
    document.getElementById('volume-value').textContent = volume.toFixed(1) + ' L';
    document.getElementById('water').style.height = volume / 60 * 100 + '%';
    document.getElementById('flow-formula').textContent = increasing ? 'V(t) = t + t²/2' : 'V(t) = 3t';
}

slider.addEventListener('input', updateTank);
flowSelect.addEventListener('change', updateTank);

document.getElementById('reset').addEventListener('click', function () {
    slider.value = 0;
    flowSelect.value = 'constant';
    updateTank();
});

updateTank();
