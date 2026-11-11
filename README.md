# Axion

Axion is our web programming project for learning calculus. It has lessons about limits, derivatives and integrals, interactive labs, limits practice questions, a quiz, and a progress page.

## Running the project

You'll need Node.js 22 or newer. Open a terminal in the project folder and run:

```bash
npm install
npm start
```

Then open http://localhost:3000/index.html in your browser.

The quiz and progress pages need the server to be running. Stop it with `Ctrl + C`.

You can switch between light and dark mode using the button in the header.

## API (Week 3)

We're using JSON Server with `db.json` to store the data.

- `GET /questions` — load quiz questions
- `POST /attempts` — save a quiz result
- `GET /attempts` — load previous results
- `GET /progress` — load completed lessons
- `POST /progress` — mark a lesson as completed
- `DELETE /progress/:id` — remove a completed mark

To test it, finish the quiz and save your score, then check the History page. You can also mark a lesson in My Progress and refresh the page to see that it stays saved.

There's no login yet, so the saved results and progress are shared by anyone using the same local server.

## New topics

- `derivatives.html` — introduction to derivatives and a motion lab (`motion.html`).
- `integrals.html` — introduction to integrals and a water tank lab (`tank.html`).

The new lessons and labs run in the browser. Quiz and Progress still use the same JSON Server API.
