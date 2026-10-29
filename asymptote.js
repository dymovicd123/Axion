const canvas = document.getElementById('graph');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('distance');

// Show x from 0 to 4 and y from -12 to 12.
function screenX(x) {
    return 45 + x * 145;
}

function screenY(y) {
    return 170 - y * 11.5;
}

function drawPoint(x, color) {
    ctx.beginPath();
    ctx.arc(screenX(x), screenY(1 / (x - 2)), 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function updateGraph() {
    const distance = Number(slider.value);
    const left = 2 - distance;
    const right = 2 + distance;

    document.getElementById('distance-value').textContent = distance.toFixed(2);
    document.getElementById('left-x').textContent = left.toFixed(2);
    document.getElementById('right-x').textContent = right.toFixed(2);
    document.getElementById('left-y').textContent = (1 / (left - 2)).toFixed(2);
    document.getElementById('right-y').textContent = (1 / (right - 2)).toFixed(2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(45, 20);
    ctx.lineTo(45, 320);
    ctx.moveTo(45, 170);
    ctx.lineTo(635, 170);
    ctx.stroke();

    ctx.fillStyle = '#555';
    ctx.font = '13px Arial';
    for (let x = 0; x <= 4; x++) {
        ctx.fillText(x, screenX(x) - 3, 190);
    }
    ctx.fillText('10', 18, screenY(10) + 4);
    ctx.fillText('-10', 12, screenY(-10) + 4);

    // Dashed vertical asymptote x = 2.
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(screenX(2), 10);
    ctx.lineTo(screenX(2), 330);
    ctx.strokeStyle = '#888';
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw the two separate branches of the function.
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    for (let side = 0; side < 2; side++) {
        ctx.beginPath();
        const start = side === 0 ? 0 : 2.08;
        const end = side === 0 ? 1.92 : 4;
        for (let x = start; x <= end; x += 0.01) {
            const y = 1 / (x - 2);
            if (x === start) ctx.moveTo(screenX(x), screenY(y));
            else ctx.lineTo(screenX(x), screenY(y));
        }
        ctx.stroke();
    }

    drawPoint(left, '#245c9e');
    drawPoint(right, '#c06b21');
}

slider.addEventListener('input', updateGraph);
document.getElementById('reset').addEventListener('click', function () {
    slider.value = 0.5;
    updateGraph();
});
updateGraph();
