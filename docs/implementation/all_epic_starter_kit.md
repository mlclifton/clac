# clac — Development Session Starter Kit

A quick-reference for any implementation session. Read the files below in the circumstances described — do not rely on memory of prior sessions.

---

## Always read first

| File | When it matters |
|---|---|
| `docs/clac_prd.md` | Checking what a feature should do, how the spec format works, or what is explicitly out of scope |
| `docs/clac_sdd.md` | Checking the module design, interfaces, data structures, colour tokens, or dependency rules between modules |

---

## Backlog & progress tracking

| File | When it matters |
|---|---|
| `backlogs/v1_implementaion_bklg.md` | Getting an overview of all epics and the dependency execution order |
| `backlogs/epic_Epic_<N>-<Title>.md` | Starting or resuming work on a specific epic — tick tasks `[x]` as they complete |

---

## Reference

| File | When it matters |
|---|---|
| `README.md` | Checking the intended getting-started workflow or overall project summary |
| `ABOUT.md` | One-paragraph project description for tooling that needs a brief summary |
| `LICENSE` | Any question about redistribution or warranty |

---

## Conventions to carry into every session

- **Module boundaries** — each `src/` subdirectory is an independent module; only `src/ui/app.js` may import across modules to wire the pipeline (see SDD §3)
- **Colour tokens** — all palette values live in `src/renderer/colours.js`; CSS custom properties must mirror them (see SDD §4.4 and §10)
- **Spec format** — the clac YAML format is fully defined in PRD §6; the parser must handle both verbose and shorthand forms
- **No network at runtime** — all dependencies must be bundled; nothing fetched at runtime

---

*Last updated: Epic 0 (planning baseline) complete — no source code exists yet*
