## Epic 6 — Code Editor

*Provide the mobile-friendly text editor with syntax highlighting and inline error display. Depends on Epic 2 (`ParseError` type).*

- [ ] **6.1** Write `src/editor/editor.js`: create a CodeMirror 6 `EditorView` mounted into a given DOM container; configure `lineNumbers`, `history`, `drawSelection`, `highlightActiveLine`; disable browser spellcheck and autocorrect on the editor element
- [ ] **6.2** Write `src/editor/clac-lang.js`: implement a CodeMirror `StreamParser` with token rules for the clac YAML syntax (keywords, strings, operators, comments, id values per the SDD §4.5 table); wrap it with `StreamLanguage.define()`
- [ ] **6.3** Apply the custom language to the CodeMirror instance; verify keyword and operator tokens receive distinct colours in the light theme
- [ ] **6.4** Implement the **`onChange` callback**: wire a CodeMirror `updateListener` that fires `onChange(text)` whenever the document changes; apply a 300 ms debounce
- [ ] **6.5** Implement `setErrors(errors: ParseError[])`: create a CodeMirror `StateEffect` and `StateField` that holds the current error list; apply a `Decoration.line` with class `cm-error-line` (amber background) for each error's line number
- [ ] **6.6** Implement the **error banner**: a `<div class="error-banner">` above the editor; `setErrors()` populates it with one `<p>` per error (line number + message + hint if present); clicking the banner collapses/expands it; banner is hidden when `errors` is empty
- [ ] **6.7** Export `createEditor(container, { onChange }) → { getText, setText, setErrors }`; confirm `getText()` returns the current document text and `setText()` replaces it without corrupting undo history
- [ ] **6.8** Seed the editor with the **Population Dynamics example** from the PRD as the default starting content on first load
