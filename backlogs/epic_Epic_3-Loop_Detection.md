## Epic 3 — Loop Detection

*Enumerate all elementary cycles in the directed graph and classify each as Reinforcing or Balancing. Depends on Epic 2.*

- [ ] **3.1** Write `src/graph/loops.js`: implement a helper that builds a plain adjacency list from a `GraphModel` (node ids → array of outgoing link indices)
- [ ] **3.2** Implement **Johnson's algorithm** for elementary cycle enumeration on the directed graph; return each cycle as an ordered array of variable ids
- [ ] **3.3** Implement the **polarity classifier**: for each cycle, count the number of `"-"` links; even count (including 0) → `"R"`, odd count → `"B"`
- [ ] **3.4** Assign **sequential ids**: sort detected loops so all R loops are numbered before B loops (R1, R2…, B1, B2…) in the order they are discovered
- [ ] **3.5** Apply the **`loops:` override block** from the spec: match by auto-assigned id; copy `name` and `suppress` fields if present; leave unmatched auto ids unchanged
- [ ] **3.6** Attach the completed `loops` array to the `GraphModel` and export a `detectLoops(model) → GraphModel` function
- [ ] **3.7** Write unit tests in `src/graph/loops.test.js` covering: single reinforcing loop, single balancing loop, two independent loops, nested overlapping loops, a graph with no loops, and a graph with a delay link in a loop
