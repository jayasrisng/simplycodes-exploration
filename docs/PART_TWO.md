# Part Two: evidence and implementation

Observed October 22, 2026, America/Los_Angeles. Fixed public-page snapshots, not a live feed. No code was revealed, no checkout was attempted, and no authenticated MCP call or email send was made.

## Evidence

- https://simplycodes.com/store/vistaprint.com — initial Cloudflare challenge, subsequently readable. Merchant summary: 744 codes, 20 verified; update Oct 22, 2:17 PM PT. Top-pick card: 15% storewide, verified, Health 100%, last used 3h ago, 16 uses today, 185 verifications, working report dated Oct 22. Card says sitewide; minimum spend, expiry, precise verification timestamp, and customer eligibility not established. Other narrative sections give conflicting best-offer and count claims. The prototype uses the top-pick card, not those summaries. No literal code copied or invented. Relative times are explicitly frozen to observation.
- https://simplycodes.com/store/kith.com — HTTP 200. Summary: two codes, none verified; cards labeled Community Code. Last-worked labels: 6 months and 2 years. Recent uses and historical reports are not current verification. Conflicting narrative claims are excluded. The CTA opens Kith itself without claiming a sale, newsletter discount, shipping benefit, or loyalty saving.
- https://developers.simplycodes.com/docs — HTTP 200. Dated and attributable envelope; verification time, TTL and tested scope; authentication required for serving tools. Documentation reviewed, no integration established.
- https://mcp.simplycodes.com/server.json — HTTP 200, version 0.5.1. Tools: verify_promo_code, get_merchant_codes, get_merchant_verification, report_code_outcome. Free-tier reveal_url versus paid-tier code documented. Concept UI does not claim to be an exact wire response.
- https://simplycodes.com/blog — HTTP 200. Newsletter signup, blog, live category rankings and refreshed verification studies observed. https://simplycodes.com/blog/live-data/best-working-home-decor-codes is linked from this hub. The digest adds personalization and cadence; it does not invent existing publishing capabilities.
- https://simplycodes.com/blog/coupon-codes-reddit — HTTP 200. Existing Reddit coupon-discovery guide. No account activity audit or inference of no Reddit presence.
- https://developers.google.com/search/docs/appearance/ai-features — HTTP 200. Existing SEO fundamentals, textual content, internal links and crawl access; no special AI text file or schema required; indexing/serving not guaranteed.
- https://llmstxt.org/ — HTTP 200, v2 proposal, modified Aug 10, 2026. Markdown navigation for compatible agents. https://simplycodes.com/llms.txt redirected to /404 with status 404. This observation applies only to that host/path. No official-looking llms.txt is deployed by this independent project.

## Architecture

Vite multi-page entry at 2/index.html, independent TSX and CSS. GitHub Pages serves the physical dist/2/index.html on direct requests and refreshes. Part One's source, styles, index, fixture engine, and interactions are untouched. Shared runtime/font assets may be factored by the bundler. No new dependencies, telemetry, backend, DNS or portfolio edits.

## Product boundaries

One supported offer without assuming cart details; source link instead of fabricated code. Optional customer status does not manufacture a better recommendation. Kith uses a useful store click-out without declaring that no possible code exists. Missing verification time in the MCP concept suppresses freshness claims. The experiment and digest rules are proposals, not measured results or live services.

## Validation

Part Two Playwright tests cover 1440, 1280, 768 and 390 widths at 844 height, physical 390×844 phone bounds, headline/full-card/CTA DOM bounding boxes, actual viewport bounds on mobile, refresh, switch, keyboard disclosures/tabs, optional status, missing verification time, digest cadence, source destinations, Part One navigation and axe checks. Screenshots saved under test-results. Existing regression suite and unit tests remain required by CI.

Completed checks: 19 unit tests; 15 Playwright tests against both development and production-preview servers; TypeScript + Vite production build; axe checks; inspected both 390×844 phone screenshots and the desktop full-page capture. Integrated upstream through b156111 before final regression, preserving all newer Part One changes. Production /2/index.html references assets via ../assets/ so the repository subpath works without SPA fallback.
