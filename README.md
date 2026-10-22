# SimplyCodes — From Verification to Decision

**Less reading. More saving.** An independent, interactive product thinking exploration by [Jayasri Guthula](https://jayasrisng.com/).

Nine chapters connect observed merchant-page patterns to cart eligibility, progressive evidence, contextual privacy, checkout recovery, agent-readable verification and a measurable revenue hypothesis. The desktop comparison shares one cart across both panels; mobile includes a Today / My Proposal switch.

## Run

Node 22 required (`nvm use`).

```sh
npm ci
npm run dev
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright starts its own local Vite server unless an existing one is available. Tests cover 1440, 1280, 768 and 390px, cart rules, merchant switching, evidence dialogs, privacy state, checkout success/rejection, calculator arithmetic, mobile switching, keyboard and reduced motion. Screenshots and reports are generated under ignored test-results.

## Read the reasoning

- [Research, dates and access limitations](docs/RESEARCH.md)
- [Design system and coding-agent rules](docs/DESIGN_SYSTEM.md)
- [Deployment and architecture](docs/ARCHITECTURE.md)
- [Machine-readable tokens](src/tokens.json)
- [Pure rules and typed fixture data](src/engine.ts)

## Integrity

This is independent work, not affiliated with or endorsed by SimplyCodes or Product.ai. Names belong to their respective owners. The source research credits existing SimplyCodes verification, extension and structured-evidence capabilities. All interactive coupons, test outcomes, timestamps, shipping rules and checkout totals are illustrative fixtures. No live coupon testing, payments or transactions occur. Calculator inputs are scenario assumptions, not measured results. No analytics or trackers; fonts self-hosted. Proposed privacy copy requires legal review before production use.

## Publishing

Dedicated repository and GitHub Pages workflow. Publishing does not write to the existing portfolio repository or modify DNS. The safe GitHub project path is `/simplycodes-exploration/`; `/simplycodes` or a subdomain requires additional hosting configuration. Vite uses relative asset paths to support the separate project deployment.
