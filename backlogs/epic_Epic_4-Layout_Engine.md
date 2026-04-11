## Epic 4 — Layout Engine

*Assign (x, y) positions to variable nodes using D3-force simulation. Depends on Epic 2 (consumes `GraphModel`); Epic 5 depends on this.*

- [ ] **4.1** Write `src/layout/force.js`: create a D3-force simulation with `forceLink`, `forceManyBody` (charge), and `forceCenter`; export `computeLayout(model, previousPositions, canvasWidth, canvasHeight) → PositionMap`
- [ ] **4.2** Tune force parameters: link distance = `Math.max(80, labelLength * 7)`; charge strength = `-300`; run for **300 ticks** synchronously (no animation) then stop
- [ ] **4.3** Implement **position seeding**: before starting the simulation, initialise each node's `x`/`y` from `previousPositions` if a matching id exists; seed new nodes at the canvas centre with a small random jitter to prevent singularities
- [ ] **4.4** Handle **edge cases**: single isolated node (place at canvas centre); disconnected subgraphs (add a weak `forceCenter` per subgraph component to prevent drift off-canvas)
- [ ] **4.5** Clamp final positions so no node centre lands outside a 20 px inset of the canvas boundary
- [ ] **4.6** Export `DEFAULT_CANVAS = { width: 1000, height: 750 }` as a named constant for use by both the layout engine and the SVG renderer
- [ ] **4.7** Smoke-test the layout engine in isolation with the Population Dynamics example from the PRD; log node positions and confirm reasonable spread
