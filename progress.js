const boxes = document.querySelectorAll('.topic-check');
const progressBar = document.getElementById('progress-bar');
const progressCount = document.getElementById('progress-count');
const saveMessage = document.getElementById('save-message');
const storageKey = 'axion-limits-progress';

let completed = [];

try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved)) {
        completed = saved;
    }
} catch (error) {
    completed = [];
}

boxes.forEach(function (box) {
    box.checked = completed.includes(box.value);
    box.addEventListener('change', updateProgress);
});

function updateProgress() {
    completed = Array.from(boxes)
        .filter(function (box) {
            return box.checked;
        })
        .map(function (box) {
            return box.value;
        });

    progressBar.value = completed.length;
    progressCount.textContent = `${completed.length} of ${boxes.length} topics completed`;

    try {
        localStorage.setItem(storageKey, JSON.stringify(completed));
        saveMessage.textContent = 'Saved in this browser.';
    } catch (error) {
        saveMessage.textContent = 'This browser cannot save your progress.';
    }
}

document.getElementById('clear-progress').addEventListener('click', function () {
    boxes.forEach(function (box) {
        box.checked = false;
    });
    updateProgress();
});

updateProgress();
