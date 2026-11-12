const boxes = document.querySelectorAll('.topic-check');
const progressBar = document.getElementById('progress-bar');
const progressCount = document.getElementById('progress-count');
const saveMessage = document.getElementById('save-message');
const clearButton = document.getElementById('clear-progress');

let completed = [];
let ready = false;

function showProgress() {
    boxes.forEach(function (box) {
        box.checked = completed.some(function (item) {
            return item.topic === box.value;
        });
        box.disabled = !ready;
    });

    progressBar.value = completed.length;
    progressCount.textContent = `${completed.length} of ${boxes.length} topics completed`;
    clearButton.disabled = !ready || completed.length === 0;
}

async function loadProgress() {
    ready = false;
    showProgress();
    saveMessage.textContent = 'Loading progress...';

    try {
        const response = await fetch('/progress');
        if (!response.ok) throw new Error('Request failed');

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid data');
        completed = data;
        ready = true;
        saveMessage.textContent = 'Progress loaded from the server.';
    } catch (error) {
        saveMessage.textContent = 'Could not load progress. Start the server and refresh this page.';
    }

    showProgress();
}

async function changeProgress(box) {
    const existing = completed.find(function (item) {
        return item.topic === box.value;
    });

    ready = false;
    showProgress();
    saveMessage.textContent = 'Saving...';

    try {
        let response;

        if (existing) {
            response = await fetch(`/progress/${existing.id}`, { method: 'DELETE' });
        } else {
            response = await fetch('/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: box.value })
            });
        }

        if (!response.ok) throw new Error('Request failed');
        await loadProgress();
        saveMessage.textContent = 'Progress saved on the server.';
    } catch (error) {
        await loadProgress();
        saveMessage.textContent = 'Could not save the change. Please try again.';
    }
}

async function clearProgress() {
    ready = false;
    showProgress();
    saveMessage.textContent = 'Clearing progress...';

    try {
        for (const item of completed) {
            const response = await fetch(`/progress/${item.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Request failed');
        }
        await loadProgress();
        saveMessage.textContent = 'Progress cleared.';
    } catch (error) {
        await loadProgress();
        saveMessage.textContent = 'Could not clear all progress.';
    }
}

boxes.forEach(function (box) {
    box.addEventListener('change', function () {
        changeProgress(box);
    });
});

clearButton.addEventListener('click', clearProgress);
loadProgress();
