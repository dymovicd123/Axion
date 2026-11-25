# Axion

Axion is a web-based mathematics learning platform for high school students. The main learning path combines explanations, worked examples, interactive diagrams and exercises in a single lesson, followed by independent assessment.

## Run locally

Install Node.js 22.16.0 or newer (Node 24 LTS is recommended; SQLite is built into Node). In the folder containing `package.json`, run:

```bash
npm install
npm test
npm start
```

Open the address printed by the server (usually `http://127.0.0.1:3001/`). Register the first account, or sign in to an existing account. Use the Node.js server rather than opening HTML files directly. The HTTP integration test requires Express, which is installed by `npm install`.

## Course 1: Quadratic functions and equations

The full course contains five lessons, each with five embedded exercises and a five-question independent assessment:

1. **Quadratic functions** — standard and vertex form, symmetry, translations, intercepts, domain, range and graph construction.
2. **Completing the square** — the area model, maintaining equivalence, non-unit and negative leading coefficients, expansion, and using vertex form.
3. **Quadratic equations** — factorisation, missing terms, completing the square, derivation of the quadratic formula, discriminant and real roots.

4. **Quadratic inequalities** — signs, endpoints, repeated roots, exact intervals and intersections.
5. **Applications** — building quadratic models, domain restrictions, optimisation, projectile height, and an interactive basketball trajectory investigation.

The **Final assessment** has ten independent problems spanning the five lessons. There are 25 embedded exercises, 25 lesson-assessment questions and 10 final-assessment questions. The course is complete when all five lessons have been completed and the final assessment has been passed with 10/10.

## Course 2: Limits and continuity

Four lessons, each with four embedded exercises and a four-question independent assessment:

1. **Understanding limits** — approaching a point, measuring a hidden function, holes and function values, and an experiment with output-error bounds.
2. **One-sided limits and continuity** — left and right limits, removable discontinuities, parameters, and constructing a piecewise function by drawing two lines or entering coefficients.
3. **Calculating limits** — limit laws, direct substitution, factorisation, rationalisation, and common denominators. The factorisation exercise also supports checking each algebraic step separately.
4. **Infinity and asymptotes** — infinite limits, horizontal and vertical asymptotes, leading powers, and designing a rational function with prescribed properties.

The **Final assessment** has eight independent problems. The course contains 40 graded questions (16 embedded exercises, 16 lesson-assessment questions and 8 final questions). Completion requires all four lessons and the final assessment. The precision experiment checks the whole interval using its endpoint bounds, and the construction tasks accept multiple mathematically valid solutions.

## Learning flow

- **Courses**: both course programmes and independent links to resume each course.
- **Study**: the existing sequential lessons, with demonstrations, exercises and assessments.
- **Practice**: choose a lesson topic and solve its exercises and notebooks without scrolling through theory. Eight additional notebook problems are available exclusively here.
- **Labs**: choose a topic with a graded investigation. Six investigations are available: parabola construction, basketball trajectory, hidden-function measurements, precision bounds, piecewise construction and asymptote design. Study and the standalone modes share task IDs, drafts and server results; repeating a task does not create another completion. The separate modes use `?mode=practice` and `?mode=labs` on the lesson URL.
- **Review**: relevant sections based on unresolved mistakes in either course, including final assessments.
- **Progress**: per-lesson results grouped by course. A lesson is complete when all its exercises are solved and its assessment is passed in full.
- Light and dark themes share a saved preference. Draft answers are kept in browser local storage. Submitted results are stored on the server.

Previous calculus lessons, Function Studio, 3D projects, geometry workshop, Manim videos and practice bank are retained under **Previous materials and tools**. They use their original interface and are not counted in the current courses' progress.

## Implementation

- `public/index.html` — course catalogue and resume link.
- `public/quadratic.html`, `public/completing-square.html`, `public/quadratic-equations.html`, `public/quadratic-inequalities.html`, `public/applications.html`, `public/quadratic-final.html` — sequential lessons with embedded exercises and assessments.
- `public/course-progress.html` — progress and review views.
- `public/assets/course.css` — responsive course layout and theme variables.
- `public/assets/course.js` — learning flow, drafts, answer submission, review, theme and resume logic.
- `public/assets/course-graph.js` — SVG coordinate graph, overlays, and vertex/point construction.
- `public/limits-1.html` through `public/limits-4.html`, and `public/limits-final.html` — sequential limits course.
- `public/assets/course-limits-ui.js` — measurement instrument, SVG graphs, piecewise drawing, precision and asymptote model previews, and individual step checks.
- `public/assets/course-limits-meta.js` — limits lesson navigation and review mappings; it contains no grading keys.
- `public/assets/course-limits.css` — activity layout and theme-compatible controls.
- `course-bank.js`, `course-quadratics.js`, `course-final.js`, `course-limits.json` — question banks, grading and progress.
- `tests/limits.test.js`, `tests/limits-answers.json` — reference answers, alternative models, step checks and persistence tests.
- `course-algebra.js` — polynomial coefficient and expression-form validation, numeric root evaluation.
- `public/assets/course-algebra-ui.js` — interactive area model and discriminant graphs.
- `course-intervals.js` — interval notation, unions, singletons, empty and full sets, and numeric endpoint equivalence.
- `public/assets/course-model.js` — shared trajectory mathematics used by both browser and server.
- `public/assets/course-applications-ui.js` — interactive sign demonstration, optimisation graph, and trajectory preview and animation.
- `tests/course-final.test.js` — checks for the last two lessons, interval notation, trajectory constraints, and final assessment.
- `server.js`, `store.js`, `database.js` — Express API, validation and SQLite persistence. The legacy `data/db.json` is a migration source, not the active store.
- `tests/course.test.js` — mathematical checks, completion and persistence tests.
- `tests/http.test.js` — HTTP integration test for course and project routes.

The course uses native HTML, CSS, JavaScript and SVG. The existing MathJax library and other tools are retained in the archive. No new npm or CDN dependencies were added.

## Mathematical notebook and input

The original 100 graded questions are retained. Nine notebook exercises are embedded in the relevant sections of the quadratic functions, completing the square, quadratic equations and calculating limits lessons. Eight more are available only in Practice (17 notebook problems in total). Each exercise accepts a sequence of independently entered transformations, with line checks and a separate final solution check. Equation exercises require all real roots; limit exercises require an equivalent expression that permits direct substitution. Worked solutions are optional and initially collapsed.

Click an answer field to use the visual editor. The fraction, exponent and square-root buttons insert editable two-dimensional structures. Typing `/` or `^` inserts a fraction or exponent; use the arrow keys to move between parts. Backspace and Delete edit the current selection or character; at a structured boundary they move into the adjacent part, and empty structures can be removed. A notebook line can be removed even if it is the last line; add another line to continue. Text mode remains available for pasting or editing longer expressions. The editor is implemented locally in `public/assets/math-field.js` and `math-field.css`; it is not MathLive or a complete computer algebra editor. Interval fields and live model controls retain their specialised interfaces.

Notebook drafts are saved locally; final submissions and their rows are stored in `notebookAttempts` and shown separately in Progress. These additional exercises are optional and do not invalidate previously completed lessons. `course-notebook.js` validates polynomial transformations, proportional quadratic equations and rational expressions near a finite limit point. It does not check arbitrary proofs or symbolic transformations involving variable radicals, transcendental functions or general equation solving. Roots and coefficients are compared numerically with tolerances. `tests/notebook.test.js` covers reference solutions, alternative transformations, invalid steps and persistence.

## Course API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/course/:lessonId` | Read progress, recent exercise results and assessment score |
| POST | `/api/course/:lessonId/practice` | Validate and save one exercise (`id`, `answer`) |
| POST | `/api/course/limits-3/practice-step` | Check one algebraic step (`id`, `key`, `value`) without recording completion |
| GET | `/api/course/:lessonId/notebooks` | List notebook exercises and saved submissions |
| POST | `/api/course/:lessonId/notebook` | Check rows and optionally save the complete solution (`id`, `rows`, `answer`, `finish`) |
| GET | `/api/course/:lessonId/notebook/:id/solution` | Open a worked notebook solution |
| POST | `/api/course/:lessonId/assessment` | Validate and save the independent assessment (`answers`) |
| GET | `/api/health` | Check server availability |

Existing `/api/progress`, `/api/study`, `/api/studio`, `/api/lesson` and `/api/projects` routes remain available for previous materials.

Accounts now have separate results. Back up `data/db.sqlite` and `data/db.json` before replacing an existing project. See Accounts (v6) below. The algebra and limits courses have fixed exercises; solid geometry also has a parameterized generator. Supported lesson IDs are `quadratic-1` through `quadratic-5`, `quadratic-final`, `limits-1` through `limits-4`, and `limits-final`. The algebra and limits final lessons are assessment only. Attempts without a lesson ID belong to lesson 1 for compatibility. Polynomial answers use coefficient comparison with a numerical tolerance and check the requested factored or expanded form. Roots may be entered in either order with fractions and square roots (`sqrt(...)`); equality is checked numerically within 1e-8. The checker is not a general symbolic algebra engine and does not verify arbitrary proofs.

Interval answers use parentheses and brackets, `U` or ∪ for unions, `inf` or ∞ for infinity, `{2}` for a singleton, `empty` for the empty set, and `all` for all real numbers. Endpoints can include fractions and `sqrt(...)`; equivalent unions are normalised. The trajectory checker evaluates the specified mathematical constraints rather than a single predetermined answer. Its preview is an idealised 2D point trajectory, not a full basketball physics simulation.

The limits measurement instrument evaluates a fixed function locally; the student sees the numerical readings, not the rule, until feedback is shown. The readings are temporary within the page. Numerical samples alone do not prove a limit. The step checker verifies the specified polynomial transformations, not arbitrary symbolic derivations. Piecewise construction supports two affine branches and an independent point value; asymptote design supports the reciprocal family A/(x − h) + k.

## Exercise interface

Exercises distinguish the problem, answer controls, optional answer-format guidance and the result. Missing fields are detected before sending a request. Assessments open one question at a time by default; question buttons show answer status, and Show all questions is available. Answers remain in the browser draft until submitted. The optional interval editor produces interval notation from endpoints and inclusion choices. Graph construction, parameter editors and live model requirements use the same fields submitted to the existing course API. The Limits explanations now include worked examples and numerical evidence before exercises.

### Solid geometry

Open the Solid geometry card on the course catalogue. Five English-language lessons cover incidence, relative positions, angles and distances, cube cross-sections, and surface area and volume. Each lesson includes expanded theory, standalone construction-based practice and a lab. The final assessment contains five construction problems. Rotate models by dragging or use the view buttons. Browser drafts and accepted server results are shown separately; see the workspace sections below.

### Solid geometry: construction-based workspace

The stereometry course now has separate Study diagrams, ten Practice problems, five Labs and five Assessment problems. Practice and Labs require constructions and numerical expressions, rather than multiple-choice quizzes. Select vertices on the 3D model (or use the point buttons), choose Segment, Midpoint, Plane / polygon or Extract 2D, and press Construct. Select points in boundary order for a polygon. Extracted planar figures use an orthonormal coordinate system so distances and angles are preserved. The solution notebook retains reasoning, intermediate and final answers. Practice provides checks and optional hints; assessment reports acceptance without hints. Constructions and numerical answers are automatically checked; free-text reasoning is not graded.

Run `npm install` again: the Three.js dependency is new. Express serves its modules locally, including OrbitControls. If WebGL or the dependency is unavailable, the workspace automatically uses the existing Canvas view. Planar figures use SVG, not JSXGraph. Drafts remain in this browser; accepted completions are also submitted to the server. Previous multiple-choice completion does not count toward the new course. No changes were made to GitHub.

Verification: `npm test` — 53 passed, 1 HTTP test skipped when Express was unavailable. Chromium with inlined project scripts and a storage shim verified a diagonal task, restoration of a draft, a triangular cross-section, and absence of assessment hints. Actual HTTP navigation and the Three.js rendering path could not be verified in the restricted build environment.

### Solid geometry workspace: drawing and analysis update

The Practice, Labs and Assessment layouts have a wider workspace, named construction actions and a separate planar panel. Given dimensions are visible in the task and on the solid. Select two vertices in Inspect or click a side in the extracted 2D diagram to record a calculated length. In Practice and Labs, Measure provides an optional numerical check; Assessment does not expose that tool. Known and recorded lengths share the same state in 3D and 2D. Supported checked length answers also populate matching segments. Extracted figures remain proportional and show right-angle marks in Study, Practice and Labs. Tall solids default to an explicitly labelled schematic view; switch to true scale at any time. Schematic transformations never change calculations or point coordinates stored in the solution. Existing local drafts remain compatible.

Validation: 56 passing Node tests, one skipped HTTP test (Express unavailable in the test environment). Chromium tested with directly loaded scripts and Canvas fallback; live Three.js/WebGL and Express routes were not verified in this environment.

### Solid geometry workspace v4

- The **Generator** tab provides parameterized problems for all five geometry topics and three difficulty levels. Each variant is reproducible from its topic, difficulty and seed. The advanced level uses independent solving without hints, measurement or worked solutions. The recent-problem menu restores up to 15 variants and their local drafts.
- The solution notebook now contains ordered construction, reasoning, calculation and conclusion blocks. Each block supports the shared visual math editor, theorem names and an attached extracted figure. Legacy free-form reasoning migrates into a reasoning block. The notebook is not an automatic proof checker.
- In the planar workspace, select a tool and vertices to draw auxiliary segments, create midpoints, mark angles or mark equal sides. The midpoint and segment share the 3D model. Angle and equal-side marks are planar annotations; practice checks entered marks, assessment does not reveal their correctness. Annotations are not required for final grading.
- `GET /api/stereo/results` lists accepted geometry tasks; `POST /api/stereo/results` validates known vertices, midpoint constructions, polygon validity, required constructions and numerical answers before storing a completion in SQLite. Repeated submissions are idempotent. The Progress page displays the server records separately from browser drafts. SQLite is now implemented; authentication is not, and the server still uses one local learner profile. A failed network submission remains local and can be retried with Check solution. Previous local completions must be resubmitted to sync.
- Test with `npm test`; install dependencies before running the Express HTTP integration test. No new npm dependencies were added.


## SQLite database and migration (v5)

Axion uses Node's built-in `node:sqlite` module, without a native npm addon or a separate database service. The minimum Node version is 22.16.0. Node 22 may print an experimental SQLite warning; this does not indicate a failed migration.

### Upgrade an existing copy

1. Stop the old server. Back up the **existing** `data/db.json` outside the project before extracting or overwriting files. A clean checkout does not contain a legacy database; the server creates a fresh SQLite database if no previous data exists. If an existing `data/db.sqlite` already exists, back it up as well.
2. Extract the updated project, and copy the saved JSON into `data/db.json` if this is your first SQLite upgrade. Keep the same browser and origin if you want existing local drafts to remain accessible.
3. Check `node -v`; install a supported version if needed. Run `npm install`, `npm run db:migrate`, `npm test`, then `npm start`. The migration also runs automatically during normal server startup.
4. Check the counts printed by `db:migrate` and the Progress page. The first migration reads the legacy JSON, creates `data/db.sqlite`, and copies all nine supported collections in one transaction. It records import counts in `migrations` and leaves the source file unchanged. A second launch never imports the JSON again. Invalid legacy collections abort the migration rather than silently dropping data.

`AXION_DATA_FILE` optionally selects a database path. A `.json` path means import that file into a sibling `.sqlite` database (compatible with the older configuration); a `.sqlite` path imports its same-base-name `.json` if present. If neither file exists, a fresh database is initialized. Never delete the SQLite file to re-import JSON: doing so would lose work created after migration. Back up the SQLite file while the server is stopped.

### Database structure

| Table | Purpose | Important indexed/searchable columns |
| --- | --- | --- |
| `profiles` | Learner identity, one profile per account | `id` |
| `course_attempts` | Algebra and limits practice/assessments | `lesson_id`, `kind`, `exercise_id` |
| `notebook_attempts` | Submitted mathematical notebook solutions | `lesson_id`, `task_id` |
| `stereo_results` | Accepted fixed/generated geometry tasks | `task_id`, `generated`, `completed_at` |
| `progress` | Legacy lesson completion | `activity` |
| `study_attempts` | Legacy practice bank attempts | `question_id`, `skill` |
| `lab_results` | Legacy lab/challenge completions | `kind`, `challenge` |
| `lesson_checks` | Legacy lesson checks | `lesson_id`, `correct` |
| `experiments` | Saved Function Studio configurations | `experiment_id` |
| `project_attempts` | Legacy project submissions | `project_id` |
| `migrations` | Schema version and first import counts | `version` |

Every learning record has a SQL row ID and a `profile_id` foreign key. The original per-record JSON is preserved in `payload` to retain all heterogeneous answer shapes, timestamps and feedback, including missing legacy fields. SQL generated columns expose common attributes without duplicating them manually; indexes cover profile and the primary lookup attribute of each table. The existing `store.js` public methods and API paths keep the same validation and response contracts. Writes use SQLite transactions; unchanged row prefixes are retained and only the changed suffix of each affected collection is rewritten. This compatibility adapter reads the authenticated profile's collections into memory; direct SQL queries and narrower updates can replace that layer as the app grows.

### Solid geometry theory (v5)

All five Study lessons now have five expanded sections with a contents navigator, definitions, theorem conditions, geometric proofs, coordinate methods as an alternative, original labeled diagrams, worked multi-step problems, common mistakes, and self-check explanations. Study remains distinct from Practice, Labs, Generator and Assessment. The examples use the same A–H cuboid convention as the workspace.

Verification of v5: 63 Node tests passed, 1 HTTP integration test skipped because Express is not installed in the build environment. The four new database tests cover all nine legacy collections, restart, repeated migration, rollback, concurrent submissions, SQL integrity and profile isolation. Chromium verified rendering and section navigation for all five Study lessons and separation from Practice using directly injected local scripts; HTTP navigation was blocked in the build environment. The actual Express HTTP server and Three.js render path were not tested here.


## Accounts and draft synchronization (v6)

Stop the old server and back up the existing `data/db.sqlite` (and `data/db.json`) outside the project. Keep the original SQLite file when replacing v5 with v6. `npm install`, `npm test`, then `npm start`. The server automatically upgrades schema version 1 to version 2; if upgrading directly from JSON, both migrations run. The first account created on a new account database claims the existing local profile and all its SQL learning records; create that account yourself before permitting anyone else to register. Subsequent accounts get new profiles and no inherited progress. No default credentials are supplied.

New tables: `users` (unique username, password hash, profile FK), `sessions` (hashed random token, user FK, expiry), `drafts` (profile FK and draft key, JSON value, update time). Passwords are salted and hashed using scrypt; opaque session tokens are hashed in SQLite and held in HttpOnly, SameSite=Strict cookies with a seven-day lifetime. Logout revokes the session. Registration/login have an in-process rate limit. Learning endpoints use the authenticated profile, never a client-supplied profile as authority. Mutations require the same-origin request header and matching profile header; stale tabs cannot write to a newly signed-in account.

Sign in through the new login page; the account name, sync indicator and Sign out are in the header. Profile links to individual Progress. Algebra/limits drafts, solution notebooks, geometry constructions and generator history, and old project drafts sync to the server; theme remains a device preference. Use Profile → Import old drafts in the original browser and at the original server address to explicitly import pre-v6 localStorage drafts into the first account without overwriting server drafts. No other account receives these old browser drafts. A Saved indicator means the last draft write was acknowledged; click it to retry on failure. Draft synchronization requires a connection; simultaneous edits to the same draft use last-write-wins, not collaborative editing. Do not sign out or close the tab while unsaved work remains.

This is a local educational app. The default server binds to 127.0.0.1. For external hosting, first claim the legacy profile locally, configure HTTPS and `AXION_SECURE_COOKIE=1`, review proxy settings and rate limiting, and add account recovery and operational safeguards. There is no password reset, email verification or administrator role. Different devices must connect to the same server for synchronization; separate local installations do not share databases.

Verification: 66 automated tests passed, one HTTP integration test skipped because Express was not installed in the build environment. New tests cover migration, isolation, password/token hashing, duplicate username, expiry, session rotation, logout and non-destructive draft import. Full Express/Three.js runtime remains to be verified after installing dependencies.
