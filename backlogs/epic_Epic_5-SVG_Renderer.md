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
