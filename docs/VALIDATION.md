# Validation

Local verification completed October 21, 2026 (Pacific), Node 22.19.0.

- TypeScript + Vite production build: passed.
- Vitest: 14 tests passed, including eligibility, missing information, merchant/category/minimum restrictions, sale exclusion, checkout failure, money rounding and contribution arithmetic.
- Playwright: 6 tests passed. Full interactions at 1440, 1280, 768 and 390px; keyboard/reduced motion; automated accessibility at desktop/mobile.
- Zero detected page errors and no horizontal page overflow in the tested chapters.
- axe WCAG A/AA scan: zero detected violations in tested default desktop/mobile states after fixing contrast and receipt definition-list semantics. This automated scan is not a complete accessibility certification.
- Browser screenshots of desktop/mobile hero and cart comparison inspected for layout.
- Merchant switch updates both views; unknown student eligibility prompts a question; cart changes reset checkout; rejection counts no discount; final payable review creates no payment or transaction; restart resets inputs and permissions.
- All requested source pages read through the research browser; no real merchant checkout tested. Links remain external navigation rather than claims that their offers currently work.

GitHub Actions repeats unit tests, Playwright checks and the production build before publishing. Production URL is verified separately after a successful deployment.

## Focused five-chapter revision

- TypeScript + Vite build passed; unchanged eligibility/arithmetic suite: 14 passing tests.
- Revised Playwright suite: 6 passing tests across 1440, 1280, 768 and 390px.
- Checked merchant switching, shared eligibility, missing-information handling, both manual and assisted checkout routes, forced rejection and retry, final payable amount, privacy preferences, calculator, Sources/agent disclosure and full restart.
- Native evidence dialog opens, traps keyboard interaction, closes with Escape, and restores focus to the opener.
- Automated WCAG A/AA scans: zero detected violations on desktop and both phone views; reduced-motion and keyboard chapter navigation passed.
- No detected page errors or horizontal page overflow in the tested chapters. Persistent heading labels checked in viewport on desktop/tablet.
- Captured first-viewport, full-page and all five chapter screenshots at every required width, plus phone Existing and evidence-drawer captures. Reviewed composition and iterated on alignment, readable controls and mobile access to calculator inputs.
- Selected before/after captures and decisions: [visual review](visual-review/README.md).
