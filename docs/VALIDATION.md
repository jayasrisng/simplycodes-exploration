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
