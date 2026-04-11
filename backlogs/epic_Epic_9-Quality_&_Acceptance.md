## Epic 9 — Quality & Acceptance

*Validate the complete application against the PRD requirements. Depends on all previous Epics.*

- [ ] **9.1** End-to-end test: paste the **Population Dynamics** example from PRD §6.6 into the editor; verify R1 and B1 loops are detected, labelled, and colour-coded correctly
- [ ] **9.2** End-to-end test: introduce errors one at a time (unknown id, missing polarity, malformed shorthand, invalid YAML); verify each surfaces the correct error message with the correct line highlighted and the previous diagram is preserved
- [ ] **9.3** Performance test: construct a spec with 30 variables and 50 links; measure re-render latency on a mid-range Android device (target: < 500 ms from keystroke to updated SVG)
- [ ] **9.4** Test **pinch-to-zoom** and **pan** on the diagram panel on both iOS and Android; verify the diagram does not reset position or scale on re-render
- [ ] **9.5** Test **dark theme** and **high-contrast theme**: verify all text, arrows, and badges meet WCAG 2.1 AA contrast ratios; verify theme persists across page reloads
- [ ] **9.6** Test **Copy / Paste YAML** round-trip: copy the spec, clear the editor, paste back — verify the diagram is identical
- [ ] **9.7** Cross-browser smoke test: iOS Safari 17+, Android Chrome 120+, desktop Chrome, desktop Firefox — verify rendering, editing, and PWA install all function correctly
- [ ] **9.8** Accessibility audit: verify all toolbar buttons have accessible labels (`aria-label`); verify the editor and diagram panels are focusable; run axe or Lighthouse accessibility audit and resolve any AA failures
- [ ] **9.9** Update `docs/clac_prd.md` status to `Approved` and `docs/clac_sdd.md` status to `Approved`; record any spec deviations discovered during implementation in a `## Implementation Notes` section of the SDD
