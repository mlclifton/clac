# clac — Test Strategy Document

**Version:** 0.1
**Date:** 2026-04-13
**Status:** Draft — evolves alongside implementation
**PRD ref:** `docs/clac_prd.md` v0.1
**SDD ref:** `docs/clac_sdd.md` v0.1

---

## 1. Purpose

This document establishes the testing approach for the clac project. Its goals are:

- Provide consistent tooling guidance so every contributor reaches for the same tools.
- Give module-level guidance on what to test and at what level of the stack.
- Record decisions and their rationale so the same ground is not re-trodden.
- Stay lightweight: guidance over prescription, with preferences not mandates where the situation genuinely allows for variation.

This document is a living artefact. It should be updated when a tooling choice is settled during implementation, when a new pattern proves out, or when a previous assumption turns out to be wrong.

---

## 2. Testing Philosophy

**Test behaviour, not implementation.** Tests should verify that a module does what its public interface promises, not that it does it in a particular internal way. Refactoring internals should not require rewriting tests.

**Test at the lowest level that gives confidence.** A bug caught in a unit test is faster to diagnose and fix than one caught in an E2E test. Push tests down the stack as far as the architecture allows.

**Pure functions first.** The parser and graph modules are pure functions with no side effects. These are the highest-value targets for thorough unit testing — they are easy to test in isolation, fast to run, and exercise the core logic of the application.

**Avoid testing third-party libraries.** Don't write tests that verify js-yaml, D3, or CodeMirror behaviour. Test only what clac code does with their outputs.

**Prefer table-driven tests for rule-heavy logic.** The parser, validator, and loop classifier all implement rules that can be expressed as rows of (input → expected output). A single parameterised test with a well-named input table is clearer and easier to extend than many near-identical individual tests.

**Don't test the rendered DOM in detail.** Asserting that a specific SVG `<path>` has a particular `d` attribute value is brittle and adds no confidence beyond what a structural/visual check provides. Test that nodes and links exist with the right identities; leave pixel-exact assertion to visual regression.

**Write tests before implementation (red → green → refactor).** Tests for an epic should be written and committed before the epic is implemented. The first run is expected to be entirely red — a failing test suite against unwritten code is the correct starting state, not a problem to fix before committing. Once the implementation is complete the suite should turn green. This cycle applies at every level: a missing devDependency (e.g. Vitest not yet installed) is the first red; installing it is the first green step before implementation begins.

---

## 3. Test Types and When to Use Each

| Type | When to use | Speed |
|---|---|---|
| **Unit** | Pure logic: parsing, validation, loop detection, colour token lookup | < 1 ms/test |
| **Integration** | Module boundary contracts: parser → graph, layout consuming a model, renderer writing to a real SVG | ~10–100 ms |
| **Component / DOM** | Editor error display, panel layout, toolbar actions | ~50–200 ms |
| **End-to-End (E2E)** | Full user journeys: type spec → diagram appears; copy/paste round-trip; offline behaviour | seconds |
| **Visual regression** | Rendered diagram appearance; colour conventions | on-demand / CI gate |

Unit and integration tests form the bulk of the suite and run on every commit. E2E and visual regression run in CI but not necessarily pre-commit.

---

## 4. Preferred Tooling

### 4.1 Unit and Integration Tests — Vitest

**Preference: [Vitest](https://vitest.dev/)**

Rationale:
- Same config surface as Vite — no separate Babel/transform setup needed for ES2022 modules or the `js-yaml` / D3 imports.
- `describe` / `it` / `expect` API matches Jest, keeping the learning curve low.
- Built-in coverage via V8 (`--coverage`).
- Supports `jsdom` and `happy-dom` environments for tests that need a DOM without a real browser.

Prefer `happy-dom` over `jsdom` for DOM-level tests — it is faster and handles SVG slightly better.

**Version constraint:** The project targets Node 18 (see README). Vitest v3+ requires Node 20+; pin to **`vitest ^2`** to stay compatible with Node 18. If the runtime is upgraded to Node 20+ in a future epic, the constraint may be relaxed.

Configuration hint (to be confirmed during setup):

```js
// vite.config.js (or vitest.config.js)
test: {
  environment: 'happy-dom',
  coverage: { provider: 'v8', reporter: ['text', 'lcov'] }
}
```

### 4.2 End-to-End Tests — Playwright

**Preference: [Playwright](https://playwright.dev/)**

Rationale:
- First-class mobile viewport emulation — essential for a mobile-first PWA.
- Built-in PWA / service worker support and offline network emulation.
- Works across Chromium, WebKit (iOS Safari equivalent), and Firefox from a single test.
- Supports `page.screenshot()` and pixel-diff assertions if visual regression is needed.

E2E tests run against the Vite dev server (`npm run dev`) or the preview build (`npm run preview`). Prefer the preview build for CI — it exercises the production bundle including the service worker.

### 4.3 Visual Regression — Playwright Screenshots (if adopted)

If visual regression is added, use Playwright's built-in `expect(page).toHaveScreenshot()` rather than a separate tool (Percy, Chromatic, etc.) to keep the dependency surface small. Baseline images are committed alongside tests.

Visual regression is optional in v1. Consider adding it once the colour conventions and layout are stable, to guard against accidental rendering regressions.

### 4.4 Linting / Static Analysis

ESLint with a minimal config is sufficient. Not strictly a test, but it catches a class of bugs faster than any test. Run as part of `npm run check` (or similar) in CI.

---

## 5. Module-Level Testing Guidance

The architecture cleanly separates pure-logic modules (parser, graph) from DOM-dependent modules (editor, renderer) and the orchestrator (ui/app). The testing approach follows this split.

### 5.1 `src/parser/` — High-priority unit testing

The parser is a **pure function** (`text → { model, errors }`). It is the most important module to test thoroughly because it is the entry point for all user input and its correctness directly determines diagram correctness.

**What to test:**

- Happy path: a well-formed spec produces a `GraphModel` with no errors and the expected nodes/links.
- Each validation rule in `validator.js` should have at least one passing and one failing test case.
- Both full-form and shorthand link syntax.
- Shorthand variable syntax (bare strings).
- Spec with groups; spec without groups.
- `loops:` override block (custom name, suppressed loop).
- YAML syntax errors (malformed YAML) → single `ParseError` at the correct line.
- Structural errors (missing `variables`, wrong type for a key).
- Semantic errors: unknown `from` id, unknown `to` id, invalid polarity, self-link.
- "Did you mean?" hint generation when a close match exists.
- Empty spec string → graceful result (no crash).

**Approach:** table-driven with `it.each`. Group tests by validation rule. Example shape:

```js
it.each([
  { name: 'unknown from id', spec: '...', expectedErrorLine: 8 },
  { name: 'invalid polarity', spec: '...', expectedErrorLine: 12 },
])('validator rejects: $name', ({ spec, expectedErrorLine }) => { ... })
```

**What not to test:** js-yaml's ability to parse valid YAML. Only test what the clac validator and model builder do with the parsed result.

---

### 5.2 `src/graph/` — Unit testing of loop detection

`model.js` is mostly data construction — light testing is fine (confirm the Map structures are built correctly from valid input).

`loops.js` carries meaningful algorithmic complexity (Johnson's algorithm + R/B classification) and deserves thorough unit testing.

**What to test:**

- A simple two-node reinforcing loop (`A → B +`, `B → A +`) → R1.
- A simple two-node balancing loop (`A → B +`, `B → A -`) → B1.
- Multiple disjoint loops — correct count, correct classification of each.
- Overlapping loops sharing some edges — all elementary cycles detected.
- A loop with zero negative links → Reinforcing.
- A loop with an even number of negative links → Reinforcing.
- A loop with an odd number of negative links → Balancing.
- Graph with no cycles → empty loop array (no crash).
- Single node with a self-link (if the spec allows it) — handled gracefully.
- The `loops:` override block applies custom names and `suppress` correctly.

**Approach:** construct minimal `GraphModel` fixtures directly (don't go through the parser) so loop detection tests are isolated from parsing logic.

---

### 5.3 `src/layout/` — Integration-level, structure not values

The layout module wraps D3-force which is non-deterministic across environments (floating point, iteration count). Do not assert exact `x`/`y` values.

**What to test:**

- `computeLayout` returns a `Map` keyed by all variable ids in the model.
- All returned positions are finite numbers (no `NaN`, no `Infinity`).
- Passing `previousPositions` with existing coordinates seeds those nodes at approximately those positions (within some tolerance).
- A model with a single node returns a position.
- A model with many nodes (e.g. 30) completes without error and within a reasonable time bound.

**Approach:** integration test using real `GraphModel` instances. Assert structural properties of the output, not coordinate values.

---

### 5.4 `src/renderer/` — DOM integration tests + visual regression

The renderer mutates a live SVG element. Tests need a DOM environment (`happy-dom` via Vitest, or a real browser via Playwright).

**What to test (Vitest + happy-dom):**

- After `render()`, a `<g class="nodes">` is present in the SVG.
- The node group contains one element per variable in the model.
- After `render()` with a model containing two links, the link group contains two `<path>` elements.
- Positive links carry the `link-positive` class or the correct stroke colour attribute.
- Negative links carry the `link-negative` class or the correct stroke colour.
- Delayed links render the delay mark element.
- Loop labels are rendered at the correct count.
- Calling `render()` a second time with a modified model updates elements rather than duplicating them (enter/update/exit correctness).

**What to test (Playwright visual regression, optional):**

- The population-dynamics example renders visually as expected (baseline screenshot comparison).
- Light theme vs dark theme renders distinct colour tokens.

**What not to test:** exact path `d` attribute values, exact pixel positions of elements.

---

### 5.5 `src/editor/` — Light unit + integration

The editor wraps CodeMirror 6, which has its own test suite. Limit testing to the clac-specific behaviour.

**What to test:**

- `createEditor()` mounts without throwing.
- `editor.getText()` returns the text set via `editor.setText()`.
- `editor.setErrors([])` clears any existing error decorations (no crash when error list is empty).
- `editor.setErrors([{ line: 3, message: 'x' }])` results in a decoration on line 3 (check for the presence of the decoration class on that line's DOM element, not its exact style).
- The `onChange` callback fires when text is changed programmatically (if the implementation supports it) and — more importantly — when the user types (Playwright test).

**What not to test:** CodeMirror's editing, undo/redo, or scrolling behaviour.

---

### 5.6 `src/ui/app.js` — E2E only

The app orchestrator wires together all modules and manages the DOM shell. It is best tested end-to-end rather than in isolation — unit testing an orchestrator usually means mocking everything and asserting on mock calls, which tests wiring rather than behaviour.

**E2E scenarios to cover:**

| Scenario | What to assert |
|---|---|
| Type a valid spec | Diagram SVG is non-empty within 1 s |
| Type an invalid spec | Error banner appears; diagram not updated |
| Fix the error | Banner disappears; diagram updates |
| Copy YAML button | Clipboard content matches editor text |
| Paste YAML | Editor content updates; diagram re-renders |
| Toggle editor / diagram / split | Correct panels visible |
| Mobile viewport (375 px) | Split mode unavailable; toggle button present |
| Resize divider to edge | Panel collapses |
| Load page, go offline, reload | App loads and functions from service worker cache |

Use Playwright for all of these. Parameterise the mobile viewport test with Playwright's device emulation (`devices['iPhone SE']`).

---

## 6. Test File Conventions

- Unit and integration tests live alongside source files: `src/parser/parser.test.js`.
- Scaffold and build-environment verification tests live in `tests/scaffold/`. These tests exercise the project structure, configuration files, and build commands rather than application logic — they have no source module to live alongside.
- E2E tests live in a top-level `tests/e2e/` directory.
- Visual regression baselines (if used) live in `tests/visual/`.
- Test fixture data (example specs, expected models) lives in `tests/fixtures/`.

---

## 7. Coverage

Coverage is a guide, not a target. Chasing 100% coverage leads to tests of trivial code and tests that couple too tightly to implementation.

**Guidance:**
- `src/parser/` and `src/graph/` — high coverage is valuable and achievable. Aim for > 90% line/branch coverage on these modules.
- `src/layout/` and `src/renderer/` — moderate coverage; structural assertions give confidence without requiring exhaustive branch coverage.
- `src/editor/` and `src/ui/` — lower unit coverage is expected; E2E covers the user-visible behaviour.

Report coverage in CI but do not fail the build on a coverage threshold until the test suite has enough depth for a threshold to be meaningful.

---

## 8. CI Integration

Suggested CI pipeline stages (in order):

1. **Lint** — ESLint; fast, fails early on obvious errors.
2. **Unit + Integration** — `vitest run`; must pass before merge.
3. **Build** — `vite build`; confirms the production bundle is valid.
4. **E2E** — `playwright test` against the preview build; runs on PR and main branch.
5. **Visual regression** — Playwright screenshot diff; advisory on PR (not a hard gate until baselines are stable).

---

## 9. Test Data and Fixtures

A canonical set of spec fixtures should be established early and shared across unit, integration, and E2E tests:

| Fixture | Purpose |
|---|---|
| `minimal_valid.yaml` | Smallest valid spec (two variables, one link) |
| `population_dynamics.yaml` | Complete example from PRD §6.6; canonical happy path |
| `invalid_unknown_id.yaml` | Triggers the "unknown variable id" error |
| `invalid_polarity.yaml` | Triggers the polarity validation error |
| `shorthand_links.yaml` | All links in shorthand form |
| `large_30var.yaml` | 30 variables, 50 links; used for performance assertions |

Fixtures stored as plain `.yaml` files in `tests/fixtures/` are importable in Vitest via `?raw` suffix and loadable by Playwright's `fs` utilities.

---

## 10. What Not to Test (Explicit Exclusions)

- **js-yaml parsing behaviour** — covered by the js-yaml project's own tests.
- **D3 force simulation physics** — not our code; test that we consume its output correctly.
- **CodeMirror editing internals** — not our code.
- **CSS layout and theming** — subjective; covered by visual inspection and, optionally, visual regression.
- **PWA manifest correctness** — the manifest is static JSON; a build-time check (or browser DevTools audit) is more appropriate than a test.
- **Service worker pre-caching completeness** — Workbox handles this; trust the tool.

---

## 11. Open Questions (to resolve during implementation)

| Question | Resolution |
|---|---|
| Will `computeLayout` be synchronous or async? | Affects how layout tests are structured (async/await vs sync) |
| Does the renderer accept an `update`-only mode or always do full enter/update/exit? | Affects the "second render" regression test |
| Is there a build-time check (e.g. TypeScript strict, or JSDoc type checking)? | Would complement testing for structural correctness |
| Visual regression: adopt or defer? | Defer to post-MVP; revisit when colour conventions are stable |

---

*End of Test Strategy v0.1*
