# Axion

Axion is a small Calculus learning website built for a web programming course. It contains four lessons on limits, introductions to derivatives and integrals, practice problems, and interactive graphs.

## Run the website

Install Node.js 18 or newer. Open a terminal in the project folder (the one containing `package.json`) and run:

```bash
npm install
npm test
npm start
```

The terminal prints the website address, usually `http://127.0.0.1:3001/`. If that port is occupied, the server tries ports up to 3010. Keep the terminal open while using the site. Open the printed address, not an HTML file directly or a Live Server address.

## What's included

- **Learn:** four lessons on limits, plus introductory lessons on derivatives and integrals.
- **Practice:** 24 questions covering six topics. Questions include numerical answers, matching, finding mistakes, and algebra steps.
- **Math Lab:** Function Studio for entering and saving functions, and additional labs for limits, slopes, and area approximations.
- **Progress:** completed lessons, solved problems, and passed lab tasks.

This project uses ordinary HTML, CSS, and JavaScript in `public/`, with an Express server in `server.js`. The browser sends requests to `/api/...`, and the server saves results in `data/db.json`. There are no accounts, so everyone using the same server shares the saved results.

## API

The main routes are:

| Method and path | Purpose |
| --- | --- |
| `GET /api/health` | Check that the server is running |
| `GET /api/study/questions?skill=concept` | Load practice questions without answer keys |
| `POST /api/study/check` | Check and save a submitted solution |
| `POST /api/lesson/check` | Check a lesson's review question |
| `GET /api/progress` | Read completed lessons |
| `GET /api/study/status` | Read practice attempts and lab results |
| `POST /api/study/lab` | Check a guided lab task |
| `POST /api/studio/challenge` | Check a Function Studio challenge |
| `GET /api/studio/experiments` | Load saved functions |
| `POST /api/studio/experiments` | Save a function |
| `DELETE /api/studio/experiments/:id` | Delete a saved function |

You can check the API by opening `http://127.0.0.1:3001/api/health` (use the port printed by the server). It should return JSON. Then solve a problem, refresh Progress, and confirm the result was saved.

## Project files

- `public/` — pages, styles, browser JavaScript, and videos.
- `server.js` — Express routes and static file serving.
- `store.js` — reads and saves study data.
- `practice-bank.js`, `lesson-checks.js`, `studio-check.js` — questions and answer checking.
- `expression.js` — mathematical expression parser used by the server; `public/assets/expression.js` is its browser copy.
- `tests/` — automatic tests, run with `npm test`.
- `manim/` — Python source files for the mathematical animations.

Math formulas are displayed with a bundled copy of MathJax. Its license is included. To render the Manim scenes on a machine with Manim installed, run `python manim/render.py`; this replaces the existing videos only after successful rendering. Manim is not needed to run the website.
