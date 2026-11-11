
const questionNumber = document.getElementById('question-number');
const questionText = document.getElementById('question-text');
const choices = document.getElementById('choices');
const feedback = document.getElementById('feedback');
const checkButton = document.getElementById('check-answer');
const nextButton = document.getElementById('next-question');
const restartButton = document.getElementById('restart-quiz');
const saveButton = document.getElementById('save-result');
const saveMessage = document.getElementById('save-message');
const quizForm = document.getElementById('quiz-form');
const historyLink = document.getElementById('history-link');

let questions = [];
let current = 0;
let score = 0;

async function loadQuestions() {
    questionNumber.textContent = 'Loading questions...';
    questionText.textContent = '';
    feedback.textContent = '';
    saveMessage.textContent = '';
    quizForm.hidden = true;
    checkButton.hidden = true;
    nextButton.hidden = true;
    saveButton.hidden = true;
    restartButton.hidden = true;
    historyLink.hidden = true;

    try {
        const response = await fetch('/questions');
        if (!response.ok) throw new Error('Request failed');

        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('No questions');

        questions = data;
        current = 0;
        score = 0;
        quizForm.hidden = false;
        showQuestion();
    } catch (error) {
        questionNumber.textContent = 'Could not load the quiz.';
        feedback.textContent = 'Please start the Axion server and try again.';
        restartButton.textContent = 'Retry';
        restartButton.hidden = false;
    }
}

function showQuestion() {
    const question = questions[current];

    questionNumber.textContent = `Question ${current + 1} of ${questions.length}`;
    questionText.textContent = question.text;
    choices.innerHTML = '<legend>Choose one answer</legend>';
    feedback.textContent = '';
    saveMessage.textContent = '';
    checkButton.disabled = true;
    checkButton.hidden = false;
    nextButton.hidden = true;

    question.answers.forEach(function (answer, index) {
        const label = document.createElement('label');
        const radio = document.createElement('input');

        radio.type = 'radio';
        radio.name = 'answer';
        radio.value = index;
        radio.addEventListener('change', function () {
            checkButton.disabled = false;
        });

        label.append(radio, ' ' + answer);
        choices.append(label);
    });
}

function checkAnswer() {
    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected) return;

    const question = questions[current];
    const isCorrect = Number(selected.value) === question.correct;

    if (isCorrect) {
        score++;
        feedback.textContent = 'Correct. ' + question.explanation;
    } else {
        feedback.textContent = 'Not quite. The correct answer is "' + question.answers[question.correct] + '". ' + question.explanation;
    }

    choices.querySelectorAll('input').forEach(function (radio) {
        radio.disabled = true;
    });

    checkButton.hidden = true;
    nextButton.hidden = false;
    nextButton.textContent = current === questions.length - 1 ? 'See result' : 'Next question';
}

function showResult() {
    questionNumber.textContent = 'Quiz finished';
    questionText.textContent = `Your score: ${score} / ${questions.length}`;
    quizForm.hidden = true;
    checkButton.hidden = true;
    nextButton.hidden = true;
    restartButton.textContent = 'Try again';
    restartButton.hidden = false;
    saveButton.hidden = false;
    saveButton.disabled = false;
    historyLink.hidden = false;
    feedback.textContent = score === questions.length ? 'All answers are correct.' : 'You can review the lessons and try again.';
}

async function saveResult() {
    saveButton.disabled = true;
    saveMessage.textContent = 'Saving...';

    try {
        const response = await fetch('/attempts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic: 'Limits',
                score: score,
                total: questions.length,
                date: new Date().toISOString()
            })
        });

        if (!response.ok) throw new Error('Request failed');
        saveMessage.textContent = 'Result saved on the server.';
        saveButton.hidden = true;
    } catch (error) {
        saveMessage.textContent = 'Could not save the result. Is the server running?';
        saveButton.disabled = false;
    }
}

checkButton.addEventListener('click', checkAnswer);
nextButton.addEventListener('click', function () {
    current++;
    if (current < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
});

restartButton.addEventListener('click', loadQuestions);
saveButton.addEventListener('click', saveResult);
loadQuestions();
