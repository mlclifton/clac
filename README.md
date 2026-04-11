# clac — Causal Loop Diagram Composer

> **AI-Generated Code Warning**
> This project was created with AI assistance. It is provided as-is, without warranty of any kind, express or implied. Use at your own risk. See [LICENSE](LICENSE) for details.

---

## What is clac?

**clac** is a mobile-first Progressive Web App (PWA) for composing and rendering [Causal Loop Diagrams](https://en.wikipedia.org/wiki/Causal_loop_diagram) (CLDs) — a systems-thinking tool for mapping feedback relationships between variables in a complex system.

You describe your diagram in a concise, human-readable YAML-like specification; clac renders the diagram in real-time as you type, using colour to communicate structure at a glance. No mouse, no desktop app, no drawing tool required.

> Full requirements: [`docs/clac_prd.md`](docs/clac_prd.md)
> Architecture & design: [`docs/clac_sdd.md`](docs/clac_sdd.md)

---

## Key Features

- **Live rendering** — the diagram updates within 500 ms of each keystroke
- **YAML spec format** — describe variables, causal links (with `+`/`−` polarity), and delays in plain text; loops are auto-detected and classified
- **Colour-coded diagrams** — positive links in blue, negative links in red, reinforcing loops (R) in amber, balancing loops (B) in blue
- **Mobile-first** — designed for 375 px (iPhone SE) upward; works on iOS Safari and Android Chrome
- **Offline / PWA** — installable to the home screen; fully functional with no network connection after first load
- **No cloud** — all data stays on the device; copy/paste YAML to/from the clipboard for save and share

## The clac Spec Format

A diagram is described in four sections:

```yaml
diagram:
  title: "Population Dynamics"
  description: "Growth and resource constraint"

groups:
  - id: people
    label: "People"
    color: "#eaf4fb"

variables:
  - id: population
    label: "Population"
    group: people
  - births
  - deaths

links:
  - from: population
    to: births
    polarity: "+"
  - deaths -> population   "-"   delay
```

Links support a compact shorthand: `<from> -> <to> "<polarity>" [delay]`

See [`docs/clac_prd.md §6`](docs/clac_prd.md) for the full specification including groups, loop overrides, and a complete worked example.

---

## Technical Stack

> Full architecture detail: [`docs/clac_sdd.md`](docs/clac_sdd.md)

| Concern | Choice |
|---|---|
| Language | Vanilla JavaScript (ES2022 modules) |
| Build tool | Vite |
| YAML parser | js-yaml (bundled) |
| Graph layout | D3-force |
| Rendering | SVG via D3 selections |
| Code editor | CodeMirror 6 |
| PWA / Offline | vite-plugin-pwa (Workbox) |

---

## Getting Started

```bash
# Install dependencies (requires Node 18+; one-time, network required)
npm install

# Start the development server
npm run dev        # → http://localhost:5173

# Build for production
npm run build

# Preview the production build locally
npm run preview    # → http://localhost:4173
```

The built `dist/` directory is fully self-contained and can be served by any static file server.

---

## Project Layout

```
clac/
├── docs/
│   ├── clac_prd.md          # Product Requirements Document
│   └── clac_sdd.md          # Solution Design Document
├── backlogs/
│   └── v1_implementaion_bklg.md   # Implementation backlog
├── public/                  # Static assets (PWA manifest, icons)
└── src/
    ├── editor/              # CodeMirror editor + clac language mode
    ├── parser/              # YAML parser + semantic validator
    ├── graph/               # GraphModel + loop detection
    ├── layout/              # D3-force layout engine
    ├── renderer/            # SVG renderer
    └── ui/                  # App shell, pipeline, toolbar
```

---

## License

[MIT](LICENSE) © mlclifton
