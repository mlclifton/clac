# clac — Causal Loop Diagram Composer
## Product Requirements Document

**Version:** 0.1 (Draft)
**Date:** 2026-04-10
**Status:** Awaiting review

---

## 1. Purpose

**clac** is a mobile-first web application for composing and rendering Causal Loop Diagrams (CLDs). A CLD is a systems-thinking tool that maps the feedback relationships between variables in a complex system — showing whether each causal link reinforces or opposes change, and whether loops of links create self-amplifying (reinforcing) or self-correcting (balancing) behaviour.

clac lets a practitioner describe a diagram in a concise, human-readable YAML-like specification and immediately see the rendered diagram update as they type. The goal is to make systems-thinking diagrams as easy to sketch as writing a bullet list — without needing a mouse, a desktop app, or a drawing tool.

---

## 2. Target Users

| Persona | Context |
|---|---|
| Systems thinker / consultant | Sketching models in the field, on a tablet or phone |
| Student / researcher | Rapid iteration on feedback structures during study |

---

## 3. Core Concepts

### 3.1 Variables
A **variable** is a named quantity that can change over time (e.g. *Population*, *Advertising Spend*, *Customer Satisfaction*). Variables are the nodes of the diagram.

### 3.2 Causal Links
A **link** is a directed arrow from one variable to another. Every link carries a **polarity**:

| Symbol | Polarity | Meaning |
|---|---|---|
| `+` | Positive (same direction) | An increase in the cause produces an increase in the effect; a decrease produces a decrease |
| `−` | Negative (opposite direction) | An increase in the cause produces a decrease in the effect; a decrease produces an increase |

Links may optionally carry a **delay** marker, indicating that the causal effect takes time to materialise (shown as a double-slash `//` crossing the arrow).

### 3.3 Feedback Loops
A **feedback loop** is a closed path of causal links. clac auto-detects all closed loops in the graph and classifies them:

| Type | Rule | Symbol | Meaning |
|---|---|---|---|
| Reinforcing | Even number of `−` links in the loop (including zero) | **R** | Amplifies change; creates virtuous or vicious cycles |
| Balancing | Odd number of `−` links in the loop | **B** | Opposes change; creates goal-seeking or stabilising behaviour |

Loops are auto-numbered (R1, R2 … B1, B2 …) and can be given optional names.

---

## 4. Feature List

### 4.1 Spec Editor
- Mobile-optimised plain-text editor with monospace font, line numbers, and basic syntax highlighting for the clac YAML format.
- Spec is validated continuously; errors are surfaced inline with line-level highlighting and a brief plain-English message.
- Editor and diagram panels are toggleable (full-screen editor, full-screen diagram, or split view) to suit small screens.

### 4.2 Real-Time Diagram Rendering
- The diagram re-renders within **500 ms** of the last keystroke (debounced to avoid thrashing).

### 4.3 Colour Conventions
Colour is used consistently to communicate diagram semantics at a glance:

| Element | Colour | Rationale |
|---|---|---|
| Positive link arrow | **Blue** | "Going up together" — reinforcing direction |
| Negative link arrow | **Red** | "Opposition / pushback" |
| Delayed link (overlay) | **Orange tick marks** | Draws the eye to latency in the system |
| Reinforcing loop label (R) | **Amber/Gold** background | Warmth signals amplification |
| Balancing loop label (B) | **Blue** background | Coolness signals restraint |
| Variable node (default) | White fill, dark border | Neutral; text is the primary label |
| Variable node (grouped) | User-defined fill colour | Allows thematic grouping (e.g. all financial variables in pale yellow) |
| Loop direction arrow | Curved arrow inside the loop, coloured R=amber, B=blue | Clockwise/counter-clockwise per loop type |

### 4.4 Loop Detection & Labelling
- All closed loops are auto-detected using depth-first graph traversal.
- Each loop is classified (R/B), numbered, and rendered with a small label at the geometric centroid of the loop's variables.
- The author can override the auto-label with a custom name (e.g. `"Burnout Spiral"`) and can suppress individual loops from display.

### 4.5 Delay Visualisation
- A link marked `delay: true` renders with a double crosshatch (`//`) on the arrow shaft, consistent with the Sterman / system-dynamics convention.

### 4.6 Export
- **Copy-to-clipboard** button for quick paste of the CLAC YAML into chat / notes.

### 4.7 Diagram Library (Local)
In this initial version, there is no library, the tool supports on the current diagram. Copy/paste to/from the clipboard of the YAML can provide basic save and load functionality.

---

## 5. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Platform | Progressive Web App (PWA); works on iOS Safari and Android Chrome |
| Viewport | Designed for 375 px wide (iPhone SE) up to tablet |
| Offline | Fully functional with no network connection after first load |
| Performance | Renders a 30-variable, 50-link diagram in < 1 s on a mid-range phone |
| Accessibility | WCAG 2.1 AA; all interactive controls keyboard-accessible |
| Privacy | No data leaves the device (no telemetry, no cloud sync in v1) |
| Install | Installable as a home-screen app via PWA manifest |

---

## 6. The clac Specification Format

The clac spec is a YAML document. The top-level keys are `diagram`, `variables`, `links`, and (optionally) `loops`.

### 6.1 Overall Structure

```yaml
diagram:
  title: "My System Model"
  description: "Optional free-text description"

variables:
  - ...

links:
  - ...

loops:          # optional — auto-detected if omitted
  - ...
```

### 6.2 Variables

Each variable is a node in the diagram.

```yaml
variables:
  - id: population          # required; machine-readable identifier (no spaces)
    label: "Population"     # optional; display label (defaults to id)
    group: demographics     # optional; thematic group name
    color: "#fef9e7"        # optional; override node fill colour
```

**Shorthand** — when no extra properties are needed, a variable can be written as a bare string:

```yaml
variables:
  - population
  - births
  - deaths
```

### 6.3 Links

Each link is a directed causal arrow.

```yaml
links:
  - from: population        # required; source variable id
    to: births              # required; target variable id
    polarity: "+"           # required; "+" or "-"
    delay: false            # optional; default false; true adds delay markers
    label: ""               # optional; short annotation on the arrow
```

**Shorthand** — a link can be written as a compact expression on one line:

```yaml
links:
  - population -> births    "+"
  - births -> population    "+"   delay
  - population -> deaths    "+"
  - deaths -> population    "-"   delay
```

The shorthand pattern is: `<from> -> <to>  "<polarity>"  [delay]`

### 6.4 Loops (optional override block)

If the auto-detected loop names or labels are not satisfactory, they can be overridden:

```yaml
loops:
  - id: R1                      # matches auto-detected loop id
    name: "Growth Engine"       # custom display name
    suppress: false             # set true to hide this loop's label

  - id: B1
    name: "Burnout Limiter"
```

### 6.5 Groups (optional)

Groups allow thematic colour-coding of variable nodes.

```yaml
groups:
  - id: demographics
    label: "Demographics"
    color: "#eaf4fb"        # node fill colour for all variables in this group

  - id: economics
    label: "Economics"
    color: "#fef9e7"
```

### 6.6 Complete Example — Population Dynamics

```yaml
diagram:
  title: "Population Dynamics"
  description: "A simple model of population growth and resource constraint"

groups:
  - id: people
    label: "Population"
    color: "#eaf4fb"
  - id: resources
    label: "Resources"
    color: "#fdfefe"

variables:
  - id: population
    label: "Population"
    group: people
  - id: birth_rate
    label: "Birth Rate"
    group: people
  - id: births
    label: "Births"
    group: people
  - id: deaths
    label: "Deaths"
    group: people
  - id: food_supply
    label: "Food Supply"
    group: resources
  - id: food_per_capita
    label: "Food per Capita"
    group: resources

links:
  - from: population
    to: births
    polarity: "+"
  - from: births
    to: population
    polarity: "+"
    delay: true
  - from: population
    to: deaths
    polarity: "+"
  - from: deaths
    to: population
    polarity: "-"
  - from: population
    to: food_per_capita
    polarity: "-"
  - from: food_per_capita
    to: birth_rate
    polarity: "+"
  - from: birth_rate
    to: births
    polarity: "+"
  - from: food_supply
    to: food_per_capita
    polarity: "+"
```

This spec would produce:
- **R1** (Reinforcing): Population → Births → Population
- **B1** (Balancing): Population → Food per Capita → Birth Rate → Births → Population

---

## 7. User Interface Overview

### 7.1 Layout Modes

```
┌─────────────────────────┐
│  clac          ☰  [▷]  │  ← header: title + menu + run/render button
├─────────────────────────┤
│                         │
│    DIAGRAM PANEL        │  ← pinch-to-zoom, pan
│                         │
├─────────────────────────┤
│                         │
│    EDITOR PANEL         │  ← monospace, syntax-highlighted
│                         │
└─────────────────────────┘
```

- **Split view** (default on tablet): editor left, diagram right.
- **Editor-only / Diagram-only**: toggled by swiping the divider to the edge, or via toolbar icons.
- **Full-screen diagram**: double-tap the diagram panel.

### 7.2 Toolbar
- Toggle editor / diagram / split
- Undo / Redo
- Copy-to-clipboard
- Paste-from-clipboard
- Settings (colour theme: light/dark/high-contrast)

### 7.3 Error Display
Validation errors appear as a collapsible banner below the editor with the affected line highlighted in amber. Example:

```
Line 14 — unknown variable id "populaton" in link (did you mean "population"?)
```

---

## 8. Out of Scope (v1)

- Stock-and-flow diagrams (quantitative simulation)
- Multi-user collaboration / cloud sync
- Version history / diff view
- Animated loop traversal

*End of PRD v0.1*
