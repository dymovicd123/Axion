const questions = [
    {
        text: 'Find the limit as x approaches 3: 2x + 1',
        answers: ['5', '6', '7', '8'],
        correct: 2,
        explanation: 'The expression is continuous, so substitute x = 3: 2(3) + 1 = 7.'
    },
    {
        text: 'Find the limit as x approaches 2: (x² - 4) / (x - 2)',
        answers: ['0', '2', '4', 'The limit does not exist'],
        correct: 2,
        explanation: 'Factor the numerator: (x - 2)(x + 2). For x not equal to 2, the expression becomes x + 2. Its limit is 4.'
    },
    {
        text: 'What happens to 1 / (x - 2) as x approaches 2 from the right?',
        answers: ['It approaches 0', 'It approaches +∞', 'It approaches -∞', 'It approaches 2'],
        correct: 1,
        explanation: 'To the right of 2, x - 2 is positive and very small. Dividing 1 by it gives increasingly large positive numbers.'
    },
    {
        text: 'Does the two-sided limit of 1 / (x - 2) exist as x approaches 2?',
        answers: ['Yes, it is 0', 'Yes, it is 2', 'Yes, it is +∞', 'No, the two sides behave differently'],
        correct: 3,
        explanation: 'The left side goes toward -∞ and the right side toward +∞. There is no single two-sided limit.'
    },
    {
        text: 'A function follows f(x) = x² near x = 2, but f(2) = 10. What is its limit as x approaches 2?',
        answers: ['4', '10', '2', 'The limit does not exist'],
        correct: 0,
        explanation: 'A limit depends on values near the point, not necessarily the value at the point. Nearby values of x² approach 4.'
    }
];

const questionNumber = document.getElementById('question-number');
const questionText = document.getElementById('question-text');
const choices = document.getElementById('choices');
const feedback = document.getElementById('feedback');
const checkButton = document.getElementById('check-answer');
const nextButton = document.getElementById('next-question');
const restartButton = document.getElementById('restart-quiz');

let current = 0;
let score = 0;

function showQuestion() {
    const question = questions[current];

    questionNumber.textContent = `Question ${current + 1} of ${questions.length}`;
    questionText.textContent = question.text;
    choices.innerHTML = '<legend>Choose one answer</legend>';
    feedback.textContent = '';
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
    document.getElementById('quiz-form').hidden = true;
    checkButton.hidden = true;
    nextButton.hidden = true;
    restartButton.hidden = false;
    feedback.textContent = score === questions.length ? 'All answers are correct.' : 'You can review the lessons and try again.';
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

restartButton.addEventListener('click', function () {
    current = 0;
    score = 0;
    document.getElementById('quiz-form').hidden = false;
    restartButton.hidden = true;
    showQuestion();
});

showQuestion();
