# Validation

Verified October 21, 2026 (Pacific), Node 22.19.0.

- TypeScript + Vite production build passed.
- Vitest: 19 tests passed. The original 14 shopping/price/contribution tests remain unchanged; five additional tests cover MCP verdict separation, eligibility, safe actions and Google breadcrumb required fields.
- Playwright: eight tests passed. Four complete flows at 1440, 1280, 768 and 390px, keyboard/reduced motion, both phone comparisons, and automated accessibility across all three discovery tabs.
- Every chapter navigation target (00–05), all five evolution stages, local approval/undo, merchant switching, shared cart conditions, evidence dialog Escape/focus return, privacy controls, both checkout routes, forced rejection/retry, final payable review and Restart were checked.
- Discovery checks include default no-code answers, positive/negative/untested/unavailable records, student eligibility and approval gates, optional evidence, and breadcrumb validation. Unverified evidence cannot authorize a coupon action; a direct merchant link remains available.
- No detected JavaScript page errors or document overflow at the required widths. axe WCAG A/AA scans detected no violations in tested desktop/mobile views and discovery tabs. This is not a complete accessibility certification.
- Captured all six chapters and all five evolution stages at every required width, plus full-page, evidence, AI-answer and approved-agent states. Visually inspected each chapter at all four widths; selected captures and fixes are in [visual review](visual-review/README.md).
- Fixed native focus scrolling on the phone comparison switch by giving it a fixed position and preserving its layout space. A throttled section-top tracker keeps the active chapter correct through tall panels and changing tab heights.
- Local Google breadcrumb checks pass against the official requirements. Google's external Rich Results Test returned a sign-in error; no external pass is claimed. See [research](RESEARCH.md).
- No authenticated MCP request, live merchant checkout, ranking test, payment or transaction was performed. Examples are local, source-attributed and explicitly illustrative.

GitHub Actions repeats unit tests, Playwright and the production build before publishing to the existing GitHub Pages project. Live deployment is checked separately after publishing.
