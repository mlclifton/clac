# clac v1 — Implementation Backlog

**Version:** 1.0
**Date:** 2026-04-10
**Ref:** `docs/clac_prd.md` v0.1 · `docs/clac_sdd.md` v0.1

Epics and tasks are listed in dependency/execution order. An epic should not begin until all epics above it are complete unless explicitly noted.

Progress key: `[ ]` not started · `[x]` complete

---

## Epic 1 — Project Scaffold

*Establish the Vite project, directory skeleton, and dependency baseline. Everything else builds on this.*

- [ ] **1.1** Initialise Vite project with the vanilla JS template (`npm create vite@latest clac -- --template vanilla`) and commit the initial scaffold
- [ ] **1.2** Create the full `src/` directory tree: `editor/`, `parser/`, `graph/`, `layout/`, `renderer/`, `ui/` — add an empty `index.js` placeholder in each
- [ ] **1.3** Install and pin all npm dependencies listed in SDD §9 (`js-yaml`, `d3-force`, `d3-selection`, `d3-zoom`, `d3-drag`, `@codemirror/*`, `vite-plugin-pwa`)
- [ ] **1.4** Configure `vite.config.js`: add `vite-plugin-pwa` plugin with Workbox `globPatterns` and `registerType: 'autoUpdate'`
- [ ] **1.5** Write `index.html`: minimal shell with `<header>`, `<main id="app">`, and `<script type="module" src="/src/main.js">`
- [ ] **1.6** Write `src/style.css`: define CSS custom property tokens for the full colour palette (light theme), a `[data-theme="dark"]` override block, and a `[data-theme="high-contrast"]` override block
- [ ] **1.7** Write `src/main.js`: import and mount the app shell (stub); confirm the dev server starts and renders a placeholder page with `npm run dev`
- [ ] **1.8** Verify `npm run build` produces a `dist/` directory and `npm run preview` serves it without errors

---

## Epic 2 — Data Model & YAML Parser

*Define the shared data structures and parse clac YAML text into a `GraphModel`. The loop detector, layout engine, and renderer all depend on this model.*

- [ ] **2.1** Write `src/graph/model.js`: define and export the `Variable`, `Link`, `Group`, `Loop`, and `GraphModel` plain-object structures with JSDoc type annotations
- [ ] **2.2** Write `src/parser/parser.js` entry point: skeleton with `parse(text) → { model, errors }` signature; integrate `js-yaml.load()` and map YAML syntax exceptions to `ParseError` objects (with 1-based line number extracted from the exception)
- [ ] **2.3** Implement the **structural parser** in `parser.js`: walk the raw YAML object and populate a `GraphModel`; handle the verbose form of `variables` (objects with `id`, `label`, `group`, `color`)
- [ ] **2.4** Implement the **variable shorthand**: a bare string item in the `variables` list expands to `{ id: str, label: str }`
- [ ] **2.5** Implement the **link verbose form** parser: read `from`, `to`, `polarity`, `delay`, `label` fields
- [ ] **2.6** Implement the **link shorthand** parser: parse the pattern `"<from> -> <to>  \"+\"|\"−\"  [delay]"` using a regex; emit a `ParseError` for malformed shorthand
- [ ] **2.7** Write `src/parser/validator.js`: implement semantic checks — (a) all `from`/`to` ids exist in `variables`; (b) polarity is `"+"` or `"-"`; (c) no self-links; (d) unknown ids in `loops` override block — each check emits a `ParseError` with a plain-English message and a `hint` where applicable (e.g. Levenshtein nearest-match suggestion for unknown ids)
- [ ] **2.8** Write unit tests in `src/parser/parser.test.js` covering: valid full-form spec, valid shorthand spec, malformed YAML, unknown variable id in a link, missing polarity, self-link

---

## Epic 3 — Loop Detection

*Enumerate all elementary cycles in the directed graph and classify each as Reinforcing or Balancing. Depends on Epic 2.*

- [ ] **3.1** Write `src/graph/loops.js`: implement a helper that builds a plain adjacency list from a `GraphModel` (node ids → array of outgoing link indices)
- [ ] **3.2** Implement **Johnson's algorithm** for elementary cycle enumeration on the directed graph; return each cycle as an ordered array of variable ids
- [ ] **3.3** Implement the **polarity classifier**: for each cycle, count the number of `"-"` links; even count (including 0) → `"R"`, odd count → `"B"`
- [ ] **3.4** Assign **sequential ids**: sort detected loops so all R loops are numbered before B loops (R1, R2…, B1, B2…) in the order they are discovered
- [ ] **3.5** Apply the **`loops:` override block** from the spec: match by auto-assigned id; copy `name` and `suppress` fields if present; leave unmatched auto ids unchanged
- [ ] **3.6** Attach the completed `loops` array to the `GraphModel` and export a `detectLoops(model) → GraphModel` function
- [ ] **3.7** Write unit tests in `src/graph/loops.test.js` covering: single reinforcing loop, single balancing loop, two independent loops, nested overlapping loops, a graph with no loops, and a graph with a delay link in a loop

---

## Epic 4 — Layout Engine

*Assign (x, y) positions to variable nodes using D3-force simulation. Depends on Epic 2 (consumes `GraphModel`); Epic 5 depends on this.*

- [ ] **4.1** Write `src/layout/force.js`: create a D3-force simulation with `forceLink`, `forceManyBody` (charge), and `forceCenter`; export `computeLayout(model, previousPositions, canvasWidth, canvasHeight) → PositionMap`
- [ ] **4.2** Tune force parameters: link distance = `Math.max(80, labelLength * 7)`; charge strength = `-300`; run for **300 ticks** synchronously (no animation) then stop
- [ ] **4.3** Implement **position seeding**: before starting the simulation, initialise each node's `x`/`y` from `previousPositions` if a matching id exists; seed new nodes at the canvas centre with a small random jitter to prevent singularities
- [ ] **4.4** Handle **edge cases**: single isolated node (place at canvas centre); disconnected subgraphs (add a weak `forceCenter` per subgraph component to prevent drift off-canvas)
- [ ] **4.5** Clamp final positions so no node centre lands outside a 20 px inset of the canvas boundary
- [ ] **4.6** Export `DEFAULT_CANVAS = { width: 1000, height: 750 }` as a named constant for use by both the layout engine and the SVG renderer
- [ ] **4.7** Smoke-test the layout engine in isolation with the Population Dynamics example from the PRD; log node positions and confirm reasonable spread

---

## Epic 5 — SVG Renderer

*Draw the complete diagram into an SVG element. Depends on Epics 2, 3, and 4.*

- [ ] **5.1** Write `src/renderer/colours.js`: export the `COLOURS` token object (all palette values from SDD §4.4); these are the single source of truth — CSS custom properties and this object must stay in sync
- [ ] **5.2** Write `src/renderer/renderer.js` skeleton: accept `(svgElement, model, positions)`, set up the five named `<g>` layers in draw order (`loop-arcs`, `links`, `nodes`, `link-labels`, `loop-labels`), and apply `d3-zoom` for pan and pinch-to-zoom
- [ ] **5.3** Implement **node rendering**: use D3 enter/update/exit on `g.nodes`; each node is a `<g>` containing a `<rect>` (rounded corners, fill from group colour or `COLOURS.node_fill`, stroke `COLOURS.node_stroke`) and a `<text>` label (centred, wraps at 100 px)
- [ ] **5.4** Write `src/renderer/arrows.js`: implement `curvedPath(source, target, curvature)` returning an SVG cubic Bézier path string; implement `arrowheadMarker(id, colour)` returning an SVG `<marker>` definition; handle the self-link case (small loop arc above the node)
- [ ] **5.5** Implement **link rendering**: use D3 enter/update/exit on `g.links`; each link is a `<path>` using `curvedPath`; stroke colour from `COLOURS.link_positive` or `COLOURS.link_negative`; reference the matching arrowhead marker
- [ ] **5.6** Implement **polarity label** rendering on `g.link-labels`: place a `+` or `−` symbol near the midpoint of the Bézier curve, offset perpendicular to the tangent; colour matches the link stroke
- [ ] **5.7** Implement **delay mark** rendering: for links with `delay: true`, overlay two short orange tick lines crossing the arrow shaft at 45°, positioned at 40% along the curve
- [ ] **5.8** Implement **loop label badges** on `g.loop-labels`: calculate the geometric centroid of the loop's variable positions; render a rounded `<rect>` + `<text>` badge (amber fill for R, blue for B); omit if `suppress: true`
- [ ] **5.9** Implement **loop arc** on `g.loop-arcs`: for each non-suppressed loop, draw a small curved arrow (clockwise for R, counter-clockwise for B) centred at the loop centroid, coloured to match the badge

---

## Epic 6 — Code Editor

*Provide the mobile-friendly text editor with syntax highlighting and inline error display. Depends on Epic 2 (`ParseError` type).*

- [ ] **6.1** Write `src/editor/editor.js`: create a CodeMirror 6 `EditorView` mounted into a given DOM container; configure `lineNumbers`, `history`, `drawSelection`, `highlightActiveLine`; disable browser spellcheck and autocorrect on the editor element
- [ ] **6.2** Write `src/editor/clac-lang.js`: implement a CodeMirror `StreamParser` with token rules for the clac YAML syntax (keywords, strings, operators, comments, id values per the SDD §4.5 table); wrap it with `StreamLanguage.define()`
- [ ] **6.3** Apply the custom language to the CodeMirror instance; verify keyword and operator tokens receive distinct colours in the light theme
- [ ] **6.4** Implement the **`onChange` callback**: wire a CodeMirror `updateListener` that fires `onChange(text)` whenever the document changes; apply a 300 ms debounce
- [ ] **6.5** Implement `setErrors(errors: ParseError[])`: create a CodeMirror `StateEffect` and `StateField` that holds the current error list; apply a `Decoration.line` with class `cm-error-line` (amber background) for each error's line number
- [ ] **6.6** Implement the **error banner**: a `<div class="error-banner">` above the editor; `setErrors()` populates it with one `<p>` per error (line number + message + hint if present); clicking the banner collapses/expands it; banner is hidden when `errors` is empty
- [ ] **6.7** Export `createEditor(container, { onChange }) → { getText, setText, setErrors }`; confirm `getText()` returns the current document text and `setText()` replaces it without corrupting undo history
- [ ] **6.8** Seed the editor with the **Population Dynamics example** from the PRD as the default starting content on first load

---

## Epic 7 — Application Shell & Pipeline

*Wire all modules into a working application. Depends on all previous Epics.*

- [ ] **7.1** Write the full `index.html` structure: `<header>` (app title + toolbar), `<div class="panel-editor">`, `<div class="divider">`, `<div class="panel-diagram">` with a `<svg id="diagram">` inside; mount point `<div id="app">` wraps the panels
- [ ] **7.2** Write CSS grid layout in `style.css`: three named layout classes on `<body>` — `layout-editor` (editor 100%, diagram hidden), `layout-split` (editor 50% / diagram 50%), `layout-diagram` (editor hidden, diagram 100%); default to `layout-split`
- [ ] **7.3** Implement the **toolbar**: three view-toggle buttons (editor / split / diagram icons); active state styling; on screens narrower than 600 px, `layout-split` is replaced by `layout-diagram` when that toggle is pressed (never show split on small screens)
- [ ] **7.4** Implement the **draggable divider**: pointer-events on `<div class="divider">`; dragging updates a CSS custom property `--split-ratio` used by the grid column template; snaps to 0% or 100% when dragged within 60 px of an edge (collapsing that panel)
- [ ] **7.5** Write `src/ui/app.js`: implement `initPipeline(editorEl, svgEl)` that creates the editor, wires the `onChange` → debounce → `parse` → `detectLoops` → `computeLayout` → `render` chain; passes `previousPositions` back into `computeLayout` on each call
- [ ] **7.6** Implement **error propagation** in the pipeline: pass `ParseError[]` from the parser back to `editor.setErrors()`; if `model` is `null` (unparseable), skip layout and render but leave the previous diagram visible (do not clear it)
- [ ] **7.7** Implement toolbar **Copy YAML**: calls `navigator.clipboard.writeText(editor.getText())`; shows a brief "Copied!" toast for 1.5 s
- [ ] **7.8** Implement toolbar **Paste YAML**: calls `navigator.clipboard.readText()` then `editor.setText(text)`; handles clipboard permission denial gracefully with an inline message
- [ ] **7.9** Implement **Settings drawer**: a slide-in `<aside>` toggled by a gear icon; contains a three-way radio for theme (light / dark / high-contrast); selection writes `data-theme` attribute to `<html>` and persists to `localStorage`

---

## Epic 8 — PWA & Offline

*Package the app for home-screen installation and verified offline use. Depends on Epic 7 (complete app build).*

- [ ] **8.1** Create `public/manifest.json`: set `name`, `short_name`, `display: "standalone"`, `orientation: "any"`, `start_url: "/"`, `background_color`, `theme_color`, and icon references
- [ ] **8.2** Create or source PWA icons: `public/icons/icon-192.png` and `public/icons/icon-512.png` (simple wordmark or glyph); reference them in `manifest.json`
- [ ] **8.3** Verify `vite-plugin-pwa` injects the `<link rel="manifest">` tag and registers the service worker in the production build
- [ ] **8.4** Verify the Workbox precache list in the built service worker covers all JS, CSS, HTML, and icon assets
- [ ] **8.5** Test offline behaviour: load the app, disable network, hard-refresh — confirm the app loads from cache and renders fully
- [ ] **8.6** Test **install to home screen** on iOS Safari (Add to Home Screen) and Android Chrome (install prompt); confirm the app launches in standalone mode with no browser chrome

---

## Epic 9 — Quality & Acceptance

*Validate the complete application against the PRD requirements. Depends on all previous Epics.*

- [ ] **9.1** End-to-end test: paste the **Population Dynamics** example from PRD §6.6 into the editor; verify R1 and B1 loops are detected, labelled, and colour-coded correctly
- [ ] **9.2** End-to-end test: introduce errors one at a time (unknown id, missing polarity, malformed shorthand, invalid YAML); verify each surfaces the correct error message with the correct line highlighted and the previous diagram is preserved
- [ ] **9.3** Performance test: construct a spec with 30 variables and 50 links; measure re-render latency on a mid-range Android device (target: < 500 ms from keystroke to updated SVG)
- [ ] **9.4** Test **pinch-to-zoom** and **pan** on the diagram panel on both iOS and Android; verify the diagram does not reset position or scale on re-render
- [ ] **9.5** Test **dark theme** and **high-contrast theme**: verify all text, arrows, and badges meet WCAG 2.1 AA contrast ratios; verify theme persists across page reloads
- [ ] **9.6** Test **Copy / Paste YAML** round-trip: copy the spec, clear the editor, paste back — verify the diagram is identical
- [ ] **9.7** Cross-browser smoke test: iOS Safari 17+, Android Chrome 120+, desktop Chrome, desktop Firefox — verify rendering, editing, and PWA install all function correctly
- [ ] **9.8** Accessibility audit: verify all toolbar buttons have accessible labels (`aria-label`); verify the editor and diagram panels are focusable; run axe or Lighthouse accessibility audit and resolve any AA failures
- [ ] **9.9** Update `docs/clac_prd.md` status to `Approved` and `docs/clac_sdd.md` status to `Approved`; record any spec deviations discovered during implementation in a `## Implementation Notes` section of the SDD

---

## Dependency Summary

```
Epic 1 (Scaffold)
    └── Epic 2 (Parser & Model)
            ├── Epic 3 (Loop Detection)
            │       └── Epic 5 (Renderer) ←─┐
            ├── Epic 4 (Layout Engine) ──────┘
            └── Epic 6 (Editor)
                        └── Epic 7 (Shell & Pipeline)  ← requires Epics 3, 4, 5, 6
                                    └── Epic 8 (PWA)
                                                └── Epic 9 (QA)
```

Epics 3, 4, and 6 may proceed **in parallel** once Epic 2 is complete.
Epic 5 may begin once Epics 3 and 4 are both complete.
Epic 7 requires Epics 3, 4, 5, and 6 to all be complete.

---

*End of v1 Implementation Backlog*
