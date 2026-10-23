# Design Lab

Design Lab extends Part Two at `/2/#lab`; the gallery remains the default. Part One, existing gallery layouts, search journey, experiment comparisons, and the user's sourced Kith recovery changes are preserved.

## Editing model

- `src/design-lab/model.ts`: versioned, strictly validated JSON schema; eight flow components; template adapters for A/B/C; presentation-only edits and deterministic fixes. Evidence records and external URLs are never supplied by imported designs. Only bounded numeric values, supported enumerations, plain text and six-digit colors are accepted. Imports are size-limited and atomic.
- `Preview.tsx`: real React shopper controls backed by the shared `part-two-evidence.ts`. Editor overlays are inert; shopper preview and participant mode expose functional disclosures, eligibility, source handoff, alternative links and a local alert concept.
- `DesignLab.tsx`: dnd-kit pointer and keyboard sensors, drag overlays, accessible move buttons, properties, 50-step undo/redo, reset, up to eight versions, local persistence, JSON files, comparison, and read-only participant snapshot links.
- `lab.css`: scoped styling; three columns on desktop; collapsible tools and natural page flow on small screens. Desktop phone viewports remain 390×844. Editing cannot introduce absolute positioning.

Edits auto-save after a short debounce, with an explicit Save locally button. Corrupt stored data is not overwritten by automatic recovery; the user can import a valid workspace or explicitly save a new one. Errors offer JSON export as a portable alternative. Participant links contain only a single validated design snapshot and task/merchant context in the URL fragment. They neither read nor write the editor's workspace and collect no responses. They are read-only interfaces, not access-control or tamper-proof links.

## Review method

`review.ts` evaluates the **rendered shopper preview**, not an editor screenshot or an AI opinion:

- Reads the merchant headline and search-intent terms.
- Measures the headline, complete card wrapper, and CTA against the canvas's 844px first viewport.
- Reports CTA background/weight as an explicit prominence heuristic, not a perceptual or conversion prediction.
- Checks the native evidence disclosure and immutable source URL, visible eligibility/restriction uncertainty, and the honest Kith fallback.
- Checks task/merchant consistency; for discovery tasks, verifies alternatives or exercises the local update preview.
- Clicks the local primary button and verifies its resulting source handoff. No external navigation or merchant checkout is performed.
- Measures visible control targets against the documented 44px design target; distinguishes this from WCAG 2.2 AA's 24px minimum and exceptions.
- Measures horizontal overflow at 390 and 320px.
- Reads text foreground/background styles and calculates WCAG 1.4.3 contrast ratios, including identical-color cases axe may defer.
- Dynamically loads actual axe-core and runs WCAG 2 A/AA, 2.1 AA and 2.2 AA checks. Incomplete rules or scan errors remain explicit human checks, never silent passes.

Findings carry status, severity, measured evidence, and a suggested change. A safe edit is offered only for a defined model operation (restore a component, restore search-intent copy, move the CTA after the offer, restore its treatment, reduce padding, or set a contrasting foreground). Other actionable findings select the relevant component controls. Every edit invalidates the stored review signature; changing task or merchant also marks a report stale. Version reports are independent and portable. Pass counts are just counts of automated checks, with human checks reported separately.

Focus, screen-reader comprehension, realistic perception of prominence, and actual participant completion remain human evaluation tasks. No API key, AI reviewer, backend, analytics, conversion result, or heatmap is present.

## Validation

Model tests cover round-trip persistence, invalid schemas, unsafe CSS/extra evidence fields, duplicate components, immutable updates, and deterministic fixes. Browser tests cover edits, history, restore, files, actual pointer/keyboard drag, move alternatives, all templates and merchant states, measured below-fold failure and repair, real contrast failures, stale reviews, comparison and stored reports, responsive layout, participant links in a separate tab, refresh, and axe checks. The full existing regression suite remains unchanged and required by the Pages workflow.

Runtime libraries: official dnd-kit sortable APIs (https://dndkit.com/legacy/presets/sortable/overview/) and axe-core. Both Design Lab and axe are code-split, so the gallery does not load the editor or accessibility engine until needed.

Completed validation: 25 unit tests and 38 browser tests passed against development and production output, including all existing regressions. The final property-control polish passed the 10 Design Lab tests against production output. Screenshots in `docs/visual-review/design-lab/` were inspected. Deliberate failures included a hidden CTA, below-fold CTA, missing intent copy, and equal foreground/background colors; reports and deterministic repairs were checked. The testing link was opened and refreshed in another page with editor controls absent.
