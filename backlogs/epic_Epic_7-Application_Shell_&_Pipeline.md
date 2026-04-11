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
