## Epic 2 — Data Model & YAML Parser

*Define the shared data structures and parse clac YAML text into a `GraphModel`. The loop detector, layout engine, and renderer all depend on this model.*

- [ ] **2.1** Write `src/graph/model.js`: define and export the `Variable`, `Link`, `Group`, `Loop`, and `GraphModel` plain-object structures with JSDoc type annotations
- [ ] **2.2** Write `src/parser/parser.js` entry point: skeleton with `parse(text) → { model, errors }` signature; integrate `js-yaml.load()` and map YAML syntax exceptions to `ParseError` objects (with 1-based line number extracted from the exception)
- [ ] **2.3** Implement the **structural parser** in `parser.js`: walk the raw YAML object and populate a `GraphModel`; handle the verbose form of `variables` (objects with `id`, `label`, `group`, `color`)
- [ ] **2.4** Implement the **variable shorthand**: a bare string item in the `variables` list expands to `{ id: str, label: str }`
- [ ] **2.5** Implement the **link verbose form** parser: read `from`, `to`, `polarity`, `delay`, `label` fields
- [ ] **2.6** Implement the **link shorthand** parser: parse the pattern `"<from> -> <to>  \"+\"|\"−\"  [delay]"` using a regex; emit a `ParseError` for malformed shorthand
- [ ] **2.7** Write `src/parser/validator.js`: implement semantic checks — (a) all `from`/`to` ids exist in `variables`; (b) polarity is `"+"` or `"-"`; (c) no self-links; (d) unknown ids in `loops` override block — each check emits a `ParseError` with a plain-English message and a `hint` where applicable (e.g. Levenshtein nearest-match suggestion for unknown ids)
- [ ] **2.8** Write unit tests in `src/parser/parser.test.js` covering: valid full-form spec, valid shorthand spec, malformed YAML, unknown variable id in a link, missing polarity, self-link
