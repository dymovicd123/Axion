const canvas = document.getElementById('graph');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('distance');

// Convert x (-1 to 4) and y (-1 to 10) into canvas positions.
function screenX(x) {
    return 50 + (x + 1) * 116;
}

function screenY(y) {
    return 280 - y * 23.5;
}

function drawPoint(x, color) {
    ctx.beginPath();
    ctx.arc(screenX(x), screenY(x * x), 6, 0, Math.PI * 2);
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
    document.getElementById('left-y').textContent = (left * left).toFixed(4);
    document.getElementById('right-y').textContent = (right * right).toFixed(4);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(screenX(0), 20);
    ctx.lineTo(screenX(0), 310);
    ctx.moveTo(50, screenY(0));
    ctx.lineTo(640, screenY(0));
    ctx.stroke();

    ctx.fillStyle = '#555';
    ctx.font = '13px Arial';
    for (let x = -1; x <= 4; x++) {
        ctx.fillText(x, screenX(x) - 3, 301);
    }
    for (let y = 0; y <= 10; y += 2) {
        ctx.fillText(y, 137, screenY(y) + 4);
    }

    // The parabola.
    ctx.beginPath();
    for (let x = -1; x <= 3.16; x += 0.02) {
        if (x === -1) ctx.moveTo(screenX(x), screenY(x * x));
        else ctx.lineTo(screenX(x), screenY(x * x));
    }
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Show the target point (2, 4) and the two approaching points.
    ctx.beginPath();
    ctx.arc(screenX(2), screenY(4), 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#777';
    ctx.stroke();
    drawPoint(left, '#245c9e');
    drawPoint(right, '#c06b21');
}

slider.addEventListener('input', updateGraph);
document.getElementById('reset').addEventListener('click', function () {
    slider.value = 0.5;
    updateGraph();
});
updateGraph();
