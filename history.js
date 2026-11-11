const historyMessage = document.getElementById('history-message');
const historyList = document.getElementById('history-list');
const refreshButton = document.getElementById('refresh-history');

async function loadHistory() {
    historyMessage.textContent = 'Loading results...';
    historyList.innerHTML = '';
    refreshButton.disabled = true;

    try {
        const response = await fetch('/attempts');
        if (!response.ok) throw new Error('Request failed');

        const attempts = await response.json();
        if (!Array.isArray(attempts)) throw new Error('Invalid data');

        attempts.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        historyMessage.textContent = attempts.length === 0 ? 'No saved attempts yet.' : `${attempts.length} saved attempts`;

        attempts.forEach(function (attempt) {
            const item = document.createElement('li');
            const date = new Date(attempt.date);
            const dateText = Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString();
            item.textContent = `${attempt.topic}: ${attempt.score}/${attempt.total} — ${dateText}`;
            historyList.append(item);
        });
    } catch (error) {
        historyMessage.textContent = 'Could not load results. Check the server and try again.';
    } finally {
        refreshButton.disabled = false;
    }
}

refreshButton.addEventListener('click', loadHistory);
loadHistory();
