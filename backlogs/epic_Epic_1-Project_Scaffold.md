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
