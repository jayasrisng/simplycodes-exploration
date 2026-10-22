# SimplyCodes — From Verification to Decision

[Open the interactive comparison](https://jayasrisng.com/simplycodes-exploration/). Independent exploration of a decision-first shopping experience.

The site opens directly into an interactive $120 cart comparison. Four shopping chapters lead into SEO and AI discoverability, then a concise vision for gaining permission to act through earned trust. Chapters run from 00 to 05. A persistent dark workspace keeps Existing SimplyCodes and My Proposal side by side on desktop; phones use an Existing / Proposal switch. Both views share the same cart and pure rules engine.

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

Playwright starts its own local Vite server unless an existing one is available. Tests cover 1440, 1280, 768 and 390px, cart rules, merchant switching, evidence dialogs and focus restoration, privacy state, both checkout routes, rejection recovery, evolution and discovery tabs, four MCP verdicts, eligibility and approval gates, breadcrumb field checks, mobile switching, keyboard and reduced motion. Full-page and chapter screenshots are captured at every required width. Screenshots and reports are generated under ignored test-results. Selected before/after captures and the visual review are in docs/visual-review.

## Read the reasoning

- [Research, dates and access limitations](docs/RESEARCH.md)
- [Design system and coding-agent rules](docs/DESIGN_SYSTEM.md)
- [Deployment and architecture](docs/ARCHITECTURE.md)
- [Machine-readable tokens](src/tokens.json)
- [Pure shopping rules and fixtures](src/engine.ts)
- [Typed MCP envelope adaptation and search evidence](src/evidence.ts)

## Integrity

This is independent work, not affiliated with or endorsed by SimplyCodes or Product.ai. Names belong to their respective owners. The source research credits existing SimplyCodes verification, extension and structured-evidence capabilities. All interactive coupons, test outcomes, timestamps, shipping rules and checkout totals are illustrative fixtures. No live coupon testing, payments or transactions occur. No analytics or trackers; fonts self-hosted. Proposed privacy copy requires legal review before production use.

The revenue calculator and its state are removed. The pure contribution helper remains available in the shared engine. MCP examples credit SimplyCodes’ existing published tools; no authenticated connection or live offer verification occurs. Search examples do not imply actual rankings or platform endorsement.

## Publishing

Dedicated repository and GitHub Pages workflow. Publishing does not write to the existing portfolio repository or modify DNS. The safe GitHub project path is `/simplycodes-exploration/`; `/simplycodes` or a subdomain requires additional hosting configuration. Vite uses relative asset paths to support the separate project deployment.

The final section closes with a concise trust-to-agent-commerce progression. Contextual cues direct visitors to the first customer choice, evidence inspection, checkout and AI-search channel, and stop pulsing after interaction. Reduced-motion preferences are respected.

A small factual disclosure of sample data stays in Design notes; the main presentation and concluding passage avoid defensive copy. Editorial text uses the available desktop width.
