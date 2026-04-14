# Epic 1 — Project Scaffold: Definition of Done

**Epic:** 1 — Project Scaffold  
**Derived from:** `backlogs/epic_Epic_1-Project_Scaffold.md`, `docs/clac_sdd.md`  
**Test file:** `tests/scaffold/epic1.test.js`

---

## Acceptance Conditions (Gherkin)

### Story 1.1 — Vite project initialised

```gherkin
Feature: Vite vanilla-JS project initialised

  Scenario: package.json identifies a Vite project
    Given the file "package.json" exists at the project root
    Then "package.json" contains a "scripts" key
    And the "scripts.dev" value equals "vite"
    And the "scripts.build" value equals "vite build"
    And the "scripts.preview" value equals "vite preview"
    And "package.json" lists "vite" in "devDependencies"
```

---

### Story 1.2 — src/ directory tree

```gherkin
Feature: Source directory skeleton exists

  Scenario Outline: Required src/ subdirectory exists with an index.js placeholder
    Given the project root is the current working directory
    Then the directory "src/<subdir>" exists
    And the file "src/<subdir>/index.js" exists

    Examples:
      | subdir   |
      | editor   |
      | parser   |
      | graph    |
      | layout   |
      | renderer |
      | ui       |
```

---

### Story 1.3 — npm dependencies installed and pinned

```gherkin
Feature: All required npm dependencies are declared and installed

  Scenario Outline: Runtime dependency is listed in package.json
    Given the file "package.json" exists
    Then "package.json" lists "<package>" in "dependencies"

    Examples:
      | package                      |
      | js-yaml                      |
      | d3-force                     |
      | d3-selection                 |
      | d3-zoom                      |
      | d3-drag                      |
      | @codemirror/view             |
      | @codemirror/state            |
      | @codemirror/language         |
      | @codemirror/commands         |
      | @codemirror/theme-one-dark   |

  Scenario Outline: Dev dependency is listed in package.json
    Given the file "package.json" exists
    Then "package.json" lists "<package>" in "devDependencies"

    Examples:
      | package          |
      | vite             |
      | vite-plugin-pwa  |

  Scenario: All declared dependencies are physically installed
    Given the file "package.json" exists
    Then the directory "node_modules" exists
    And the directory "node_modules/js-yaml" exists
    And the directory "node_modules/d3-force" exists
    And the directory "node_modules/vite-plugin-pwa" exists

  Scenario: package-lock.json is present (dependencies are pinned)
    Then the file "package-lock.json" exists at the project root
```

---

### Story 1.4 — vite.config.js PWA configuration

```gherkin
Feature: vite.config.js configures vite-plugin-pwa correctly

  Scenario: vite.config.js exists
    Then the file "vite.config.js" exists at the project root

  Scenario: VitePWA plugin is imported and applied
    Given the contents of "vite.config.js" are read
    Then the contents include the string "vite-plugin-pwa"
    And the contents include the string "VitePWA"

  Scenario: registerType is set to autoUpdate
    Given the contents of "vite.config.js" are read
    Then the contents include the string "registerType"
    And the contents include the string "autoUpdate"

  Scenario: Workbox globPatterns covers required asset types
    Given the contents of "vite.config.js" are read
    Then the contents include the string "globPatterns"
    And the contents include the string ".js"
    And the contents include the string ".css"
    And the contents include the string ".html"
```

---

### Story 1.5 — index.html shell structure

```gherkin
Feature: index.html provides the required application shell

  Scenario: index.html exists at the project root
    Then the file "index.html" exists at the project root

  Scenario: index.html contains a <header> element
    Given the contents of "index.html" are read
    Then the contents include the string "<header"

  Scenario: index.html contains <main id="app">
    Given the contents of "index.html" are read
    Then the contents include the string "<main"
    And the contents include the string "id=\"app\""

  Scenario: index.html loads src/main.js as an ES module
    Given the contents of "index.html" are read
    Then the contents include the string "type=\"module\""
    And the contents include the string "src/main.js"
```

---

### Story 1.6 — src/style.css theming tokens

```gherkin
Feature: style.css defines CSS custom property tokens for all three themes

  Scenario: style.css exists
    Then the file "src/style.css" exists

  Scenario: Light theme tokens are defined on :root
    Given the contents of "src/style.css" are read
    Then the contents include the string ":root"
    And the contents include at least one CSS custom property declaration matching "--[a-z]"

  Scenario: Dark theme override block is present
    Given the contents of "src/style.css" are read
    Then the contents include the string "[data-theme=\"dark\"]"

  Scenario: High-contrast theme override block is present
    Given the contents of "src/style.css" are read
    Then the contents include the string "[data-theme=\"high-contrast\"]"
```

---

### Story 1.7 — src/main.js mounts the app shell

```gherkin
Feature: src/main.js is a valid ES module entry point

  Scenario: src/main.js exists
    Then the file "src/main.js" exists

  Scenario: src/main.js imports from the ui module
    Given the contents of "src/main.js" are read
    Then the contents include the string "ui/"
    Or the contents include the string "app.js"

  Scenario: Development server starts and responds with HTTP 200
    Given "npm install" has been run
    When the dev server is started with "npm run dev"
    Then an HTTP GET to "http://localhost:5173/" returns status 200 within 15 seconds
    And the response body contains the string "id=\"app\""
    When the dev server process is terminated
```

---

### Story 1.8 — Production build succeeds

```gherkin
Feature: Production build and preview commands succeed

  Scenario: npm run build exits without error and produces dist/
    Given "npm install" has been run
    When "npm run build" is executed
    Then the process exits with code 0
    And the directory "dist/" exists
    And the file "dist/index.html" exists
    And the directory "dist/assets" exists

  Scenario: dist/ is non-trivially sized (not an empty build)
    Given "npm run build" has completed successfully
    Then at least one ".js" file exists under "dist/assets/"
    And at least one ".css" file exists under "dist/assets/"

  Scenario: npm run preview serves the built app and responds with HTTP 200
    Given "npm run build" has completed successfully
    When the preview server is started with "npm run preview"
    Then an HTTP GET to "http://localhost:4173/" returns status 200 within 10 seconds
    And the response body contains the string "id=\"app\""
    When the preview server process is terminated
```

---

## Test Implementation

The scenarios are implemented as a single Vitest test suite at:

```
tests/scaffold/epic1.test.js
```

**Runtime:** Vitest (see test strategy §4.1). `node:fs`, `node:path`, and `node:child_process` are used for file checks and process management; the built-in `fetch` (Node 18+) is used for HTTP assertions against the dev and preview servers.

**Execution:**

```bash
npx vitest@2 run tests/scaffold/epic1.test.js
```

> Node 18 compatibility: Vitest v3+ requires Node 20+. Use `vitest ^2` until the runtime is upgraded (see test strategy §4.1).

Stories 1.1–1.6 are pure file-system and content checks — fast, deterministic, no server required.  
Stories 1.7 and 1.8 spawn child processes and carry extended timeouts (30 s and 60 s respectively).

> **TDD note:** This suite is written before Epic 1 is implemented. The expected first state is entirely red. Installing Vitest (`npm install --save-dev vitest`) is the first green step; passing all tests is the final green state after full implementation.
