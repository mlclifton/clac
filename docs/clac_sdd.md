# clac — Causal Loop Diagram Composer
## Solution Design Document

**Version:** 0.1
**Date:** 2026-04-10
**Status:** Draft
**PRD ref:** `docs/clac_prd.md` v0.1

---

## 1. Goals of This Document

- Select the technical stack and justify each choice.
- Define the module architecture and the responsibilities of each module.
- Describe the data flow through the system.
- Specify the key data structures shared between modules.
- Identify the file/directory layout of the codebase.

---

## 2. Technical Stack

| Concern | Choice | Rationale |
|---|---|---|
| Language | Vanilla JavaScript (ES2022 modules) | No framework overhead; modules provide enough structure for this scope |
| Build tool | **Vite** | Zero-config, instant dev server with HMR; produces a clean static `dist/` bundle; no network needed after build |
| YAML parser | **js-yaml** | Battle-tested, small (~55 KB min+gzip), runs entirely in the browser; bundled into the build output |
| Graph layout | **D3-force** (D3 v7 subset) | Proven force-directed layout; stateful simulation preserves stability across re-renders; ships in the bundle |
| Graph rendering | **SVG via D3 selections** | SVG scales cleanly on all screen sizes and densities; supports pinch-to-zoom natively via `viewBox`; D3 enter/update/exit keeps incremental updates efficient |
| Code editor | **CodeMirror 6** | Designed for mobile; modular (only needed extensions are bundled); supports custom language modes for syntax highlighting; line decorations for inline error display |
| PWA layer | **vite-plugin-pwa** | Generates service worker and Web App Manifest automatically from simple config; zero-effort offline caching |
| Styling | Plain CSS with CSS custom properties | Sufficient for this scope; custom properties enable light/dark/high-contrast theming with a single token swap |

**No runtime network dependency.** All libraries are bundled at build time. The built `dist/` directory is entirely self-contained.

---

## 3. Module Architecture

The source is divided into five modules with a clear, single-direction dependency graph:

```
┌──────────────┐
│   ui/app     │  ← orchestrator; owns the DOM shell, toolbar, panel layout
└──────┬───────┘
       │ owns instances of ↓
  ┌────┴──────────────────────────────────────┐
  │                                           │
┌─┴──────────┐   ┌──────────┐   ┌───────────┐│
│  editor/   │   │ parser/  │   │ renderer/ ││
│  editor    │──▶│  index   │──▶│  index    ││
└────────────┘   └────┬─────┘   └─────┬─────┘│
  (CodeMirror)        │               │      │
                 ┌────▼─────┐   ┌─────▼─────┐│
                 │  graph/  │   │  layout/  ││
                 │  model   │──▶│  force    ││
                 │  loops   │   └───────────┘│
                 └──────────┘                │
  └──────────────────────────────────────────┘
```

### Dependency rules
- `parser` depends on `graph` (produces a `GraphModel`).
- `layout` depends on `graph` (consumes a `GraphModel`, produces positions).
- `renderer` depends on `graph` and `layout`.
- `editor` is standalone; it emits raw text only.
- `ui/app` wires everything together; it is the only module that touches the DOM shell.

No module imports from `ui/app`. No circular dependencies.

---

## 4. Module Descriptions

### 4.1 `src/parser/`

**Responsibility:** Convert raw clac YAML text into a validated `GraphModel`.

**Files:**
- `parser.js` — entry point; orchestrates parse → validate → build model
- `validator.js` — semantic checks (unknown ids, missing polarities, self-links, etc.)

**Interface:**
```js
// Returns { model: GraphModel | null, errors: ParseError[] }
parse(text: string): ParseResult
```

**`ParseError`:**
```js
{
  line: number,       // 1-based line number in source text
  message: string,    // plain-English description
  hint: string | null // optional "did you mean X?" suggestion
}
```

**Processing steps:**
1. `js-yaml.load(text)` — syntax parse; YAML exceptions map to a `ParseError` at the relevant line.
2. Structural validation — check required keys exist and have correct types.
3. Semantic validation — check all `from`/`to` ids in `links` exist in `variables`; check polarity is `"+"` or `"-"`.
4. Build and return a `GraphModel`.

The parser is a **pure function** — no side effects, no DOM access. This makes it trivially testable.

---

### 4.2 `src/graph/`

**Responsibility:** Define shared data structures and the loop-detection algorithm.

**Files:**
- `model.js` — `GraphModel` class / factory
- `loops.js` — loop enumeration and classification

**`GraphModel` structure:**
```js
{
  variables: Map<id, Variable>,   // keyed by id string
  links: Link[],
  groups: Map<id, Group>,
  meta: { title, description }
}

Variable: { id, label, group, color }
Link:     { from, to, polarity, delay, label }
Group:    { id, label, color }
```

**Loop detection (`loops.js`):**

Uses Johnson's algorithm (simple, well-understood) to enumerate all elementary cycles in the directed graph. For each cycle:
1. Count the number of `"-"` links.
2. Even count (including 0) → Reinforcing (**R**).
3. Odd count → Balancing (**B**).
4. Assign sequential ids (R1, R2… B1, B2… in traversal order).

Each detected loop is attached to the `GraphModel` as:
```js
Loop: {
  id: string,       // "R1", "B1", etc.
  type: "R" | "B",
  variableIds: string[],  // ordered sequence around the cycle
  name: string | null,    // from loops: override block, or null
  suppress: boolean
}
```

---

### 4.3 `src/layout/`

**Responsibility:** Assign (x, y) positions to each variable node using D3-force simulation.

**Files:**
- `force.js` — wraps D3-force; manages simulation lifecycle

**Interface:**
```js
// Returns Map<variableId, {x, y}>
computeLayout(model: GraphModel, previousPositions: Map): Promise<PositionMap>
```

**Design choices:**
- The simulation runs for a fixed number of ticks (not animated) then resolves — this gives a stable layout without animation jank during editing.
- `previousPositions` is passed in so that nodes that already have positions are seeded with those coordinates. This prevents the whole diagram from re-flowing on minor edits.
- Force parameters: link distance proportional to label length; charge repulsion prevents overlap; centre force keeps the diagram centred in the viewport.

---

### 4.4 `src/renderer/`

**Responsibility:** Translate a `GraphModel` + `PositionMap` into SVG elements inside a given `<svg>` container.

**Files:**
- `renderer.js` — main render function
- `arrows.js` — curved arrow path calculation and delay-mark overlay
- `colours.js` — colour token constants (single source of truth for the palette)

**Interface:**
```js
render(svg: SVGElement, model: GraphModel, positions: PositionMap): void
```

**Rendering layers** (drawn in order, each a `<g>` group):
1. `g.loop-arcs` — curved directional arc for each loop label (R=amber, B=blue)
2. `g.links` — arrow paths; colour = polarity (blue=+, red=−); delay marks if applicable
3. `g.nodes` — rounded rectangles with variable labels; fill = group colour or white
4. `g.link-labels` — `+` / `−` polarity symbol near the arrowhead
5. `g.loop-labels` — `R1` / `B1` etc. badge at loop centroid

Uses D3's **enter/update/exit** pattern: on each call, existing elements are updated in place rather than re-created, minimising DOM churn and visual flicker.

**Colour tokens (`colours.js`):**
```js
export const COLOURS = {
  link_positive:   '#2980b9',  // blue
  link_negative:   '#e74c3c',  // red
  delay_mark:      '#e67e22',  // orange
  loop_R_bg:       '#f39c12',  // amber
  loop_B_bg:       '#2980b9',  // blue
  loop_R_text:     '#ffffff',
  loop_B_text:     '#ffffff',
  node_fill:       '#ffffff',
  node_stroke:     '#2c3e50',
  node_text:       '#2c3e50',
}
```
These are overridden by CSS custom properties for dark/high-contrast modes.

---

### 4.5 `src/editor/`

**Responsibility:** Provide the text editor panel; emit change events; display inline parse errors.

**Files:**
- `editor.js` — CodeMirror 6 instance setup, event wiring
- `clac-lang.js` — custom StreamParser for basic clac YAML syntax highlighting

**Syntax highlight rules (clac-lang.js):**

| Token class | Pattern | Colour (light theme) |
|---|---|---|
| `keyword` | Top-level keys: `diagram`, `variables`, `links`, `loops`, `groups` | Purple |
| `string` | Quoted values | Green |
| `operator` | `->`, `+`, `-` | Bold, red/blue per polarity |
| `comment` | `#` to end of line | Grey italic |
| `def` | `id:` values | Teal |

**Error display:**
- A `ParseError[]` is passed to `setErrors(errors)`.
- Each error creates a CodeMirror line decoration (amber background on the offending line).
- A collapsible banner above the editor summarises all errors.

**Interface:**
```js
const editor = createEditor(domContainer, { onChange: (text) => {} })
editor.getText(): string
editor.setText(text): void
editor.setErrors(errors: ParseError[]): void
```

---

### 4.6 `src/ui/app.js`

**Responsibility:** Application shell — owns the DOM structure, toolbar, and the pipeline that connects editor → parser → layout → renderer.

**Pipeline (triggered on each editor change):**
```
editor.onChange(text)
  → debounce(300ms)
  → parser.parse(text)           → errors? → editor.setErrors()
  → loops.detect(model)
  → layout.computeLayout(model, previousPositions)
  → renderer.render(svg, model, positions)
```

**Panel layout management:**
- Three modes: `editor`, `split`, `diagram` — stored in a CSS class on `<body>`.
- The divider between panels is a draggable element (pointer events); dragging to the edge collapses that panel.
- On small screens (< 600 px wide) `split` mode is unavailable; the toolbar shows a toggle button instead.

**Toolbar actions:**
- View toggle (editor / split / diagram)
- Undo / Redo — delegated to CodeMirror's built-in history
- Copy YAML — `navigator.clipboard.writeText(editor.getText())`
- Paste YAML — `navigator.clipboard.readText()` → `editor.setText()`
- Settings — opens a minimal drawer for colour theme selection

---

## 5. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        ui/app.js                            │
│                                                             │
│  ┌──────────────┐  text   ┌──────────────────────────────┐  │
│  │   editor/    │────────▶│  parser/parser.js            │  │
│  │   editor.js  │◀────────│  → GraphModel + ParseError[] │  │
│  └──────────────┘ errors  └──────────────┬───────────────┘  │
│                                          │ GraphModel        │
│                                          ▼                   │
│                           ┌──────────────────────────────┐  │
│                           │  graph/loops.js              │  │
│                           │  → GraphModel with loops[]   │  │
│                           └──────────────┬───────────────┘  │
│                                          │                   │
│                                          ▼                   │
│                           ┌──────────────────────────────┐  │
│                           │  layout/force.js             │  │
│                           │  → PositionMap               │  │
│                           └──────────────┬───────────────┘  │
│                                          │                   │
│                                          ▼                   │
│                           ┌──────────────────────────────┐  │
│                           │  renderer/renderer.js        │  │
│                           │  → SVG DOM mutations         │  │
│                           └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Directory Layout

```
clac/
├── index.html                  # App shell HTML; loads src/main.js
├── package.json                # Vite + dependencies
├── vite.config.js              # Vite + vite-plugin-pwa config
├── public/
│   ├── manifest.json           # PWA manifest (name, icons, display: standalone)
│   └── icons/                  # PWA home-screen icons (192×192, 512×512)
└── src/
    ├── main.js                 # Entry point: imports App, mounts to #app
    ├── style.css               # Global styles + CSS custom property tokens
    ├── editor/
    │   ├── editor.js
    │   └── clac-lang.js
    ├── parser/
    │   ├── parser.js
    │   └── validator.js
    ├── graph/
    │   ├── model.js
    │   └── loops.js
    ├── layout/
    │   └── force.js
    ├── renderer/
    │   ├── renderer.js
    │   ├── arrows.js
    │   └── colours.js
    └── ui/
        └── app.js
```

---

## 7. PWA & Offline Configuration

**`vite-plugin-pwa`** is configured with:
- `registerType: 'autoUpdate'` — service worker updates silently.
- `workbox.globPatterns: ['**/*.{js,css,html,svg,png,woff2}']` — pre-caches the entire build.
- After the first load, the app functions fully offline.

**`manifest.json`:**
```json
{
  "name": "clac",
  "short_name": "clac",
  "display": "standalone",
  "orientation": "any",
  "start_url": "/",
  "background_color": "#ffffff",
  "theme_color": "#2c3e50"
}
```

---

## 8. Development & Build Workflow

```bash
# Install dependencies (one-time, requires network)
npm install

# Start dev server (hot-reload, no network needed after install)
npm run dev        # → http://localhost:5173

# Production build (outputs to dist/)
npm run build

# Preview the production build locally
npm run preview    # → http://localhost:4173
```

The built `dist/` directory is fully self-contained. It can be served by any static file server (`python3 -m http.server`, `npx serve dist`, nginx, etc.) with no internet access.

---

## 9. Key npm Dependencies

| Package | Version | Purpose |
|---|---|---|
| `vite` | ^5 | Build tool and dev server |
| `vite-plugin-pwa` | ^0.20 | Service worker + PWA manifest generation |
| `js-yaml` | ^4 | YAML parser |
| `d3-force` | ^3 | Force-directed graph layout simulation |
| `d3-selection` | ^3 | SVG DOM helpers (enter/update/exit) |
| `d3-drag` | ^3 | Future: drag to reposition nodes |
| `d3-zoom` | ^3 | Pan and pinch-to-zoom on the SVG canvas |
| `@codemirror/view` | ^6 | CodeMirror 6 editor core |
| `@codemirror/state` | ^6 | CodeMirror editor state management |
| `@codemirror/language` | ^6 | Language support base for custom mode |
| `@codemirror/commands` | ^6 | Undo/redo, indent, etc. |
| `@codemirror/theme-one-dark` | ^6 | Dark theme (optional, loaded lazily) |

Only D3 subpackages that are actually used are imported — not the full D3 bundle — keeping the bundle lean.

---

## 10. Theming

CSS custom properties are defined on `:root` and overridden in `[data-theme="dark"]` and `[data-theme="high-contrast"]` blocks. The `colours.js` module exports the same tokens as JS constants for use in the SVG renderer, ensuring the two stay in sync.

---

*End of SDD v0.1*
