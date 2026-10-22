# Design system and agent usage rules

## Executable sources

- `src/tokens.json`: machine-readable scoped shell, existing and proposal palettes, plus type, spacing, radius and motion choices. Each palette is loaded into its own CSS variable namespace.
- `src/engine.ts`: shared typed fixtures, verification vocabulary and pure eligibility, recommendation, totals, attempt and contribution functions.
- `src/components.tsx`: reusable status badge, coupon card, comparison frame and receipt.
- `src/main.tsx`: chapter narrative, shared cart, local permission state and chapter navigation.
- `src/style.css`: responsive composition, visual hierarchy, focus and reduced-motion behavior.

## Component contracts

Primary button: commit the principal local action; disabled when no eligible offer exists. Secondary button: inspect or reset. Links navigate to real source pages; never style a dead control as an action.

Coupon card: show percentage, conditions, code selection/copy and evidence entry; detailed fixture test history stays in the evidence drawer. Public observations live in explicitly sourced context; fixture cards never claim to be live offers.

Verification states: VERIFIED, CONDITIONALLY APPLICABLE, UNVERIFIED, INELIGIBLE, NO VERIFIED CODE. Never infer verified eligibility from unknown student status. Never use color alone. Evidence support and cart applicability are different concepts.

Evidence dialog: the app uses native dialog semantics, title, modal focus containment, Escape and close actions, return focus. Include restriction, date, pass count, human evidence absence and uncertainty. Fixture tests are not live events or a success probability.

Privacy disclosure: distinguish documented SimplyCodes commitments, local exploration behavior and proposed production copy awaiting legal review. A UI toggle cannot grant real extension permissions.

Receipt: always call `totals`. Round cents consistently. Free shipping at pre-discount subtotal >= $100 is a fictional fixture, not a merchant policy. Tax is explicitly excluded. Count no discount after rejection.

Empty and error states: explain no-code results and rejected attempts; never count a discount after rejection. Retry removes the forced rejection and allows another explicit attempt. No simulated network call is represented as a real verification.

## Agent invariants

1. Never rank on commission. Recommend only supported eligible fixtures, descending by eligible fixture saving.
2. Never upgrade unknown or unverified to verified. Ask the smallest missing question.
3. Reuse the same cart and rules on both sides. Recompute outcomes when cart conditions change.
4. Never add real merchant codes without source and observation date; never call them checkout-tested without evidence.
5. Every actionable affordance works by keyboard. Preserve visible focus, native labels, semantic disclosure and motion preferences.
6. Keep the site usable at 1440, 1280, 768 and 390px. The mobile Existing / Proposal switch exposes both experiences.
7. Do not reintroduce speculative revenue projections. Agent actions require explicit approval; absent evidence never becomes a verified saving.
8. Keep independent attribution visible. No official-site impersonation, trackers, payments or user-data collection.
9. Change engine tests when business rules change; run browser flows after UI changes.

## Motion

180ms transitions for local state; progress follows the active chapter. Scroll navigation uses smooth behavior except under reduced-motion preferences. Amount changes are immediate and status messages explain outcomes. Never delay a shopper’s action for decoration.

## Six-chapter workspace (00–05)

The 220px navigation rail and equal product columns fill desktop width. Existing and Proposal headings remain sticky; a 2px green divider marks the boundary. At <=1050px the rail becomes a compact horizontal navigator; at <=767px the accessible view switch shows one pane. No hero, nested presentation frames, gradient, glow, or decorative motion.

Use a single global independent/illustrative disclosure. Source limitations, legal review, the machine-readable token record and AI-agent prior work stay in Sources. Do not suggest that savings ranking or auto-apply are inventions of this proposal; existing products already describe them.

The opening Evolution component and final Discovery component span both product columns. Shopping chapters 01–04 retain the equal panels. Sticky headers change to contextual labels for chapters 00 and 05 without changing height. A requestAnimationFrame-throttled scroll handler tracks section tops, including tall sections and dynamically changing tab heights. Evolution and discovery tablists support ArrowLeft/Right, Home and End, one tab stop, and associated panels. Restart remounts these local experiences and resets the shared cart.

`src/evidence.ts` owns four published MCP verdicts and local action eligibility; it does not call the server. Inspector JSON is optional. Approval only prepares a merchant link; the shopper chooses whether to open it. Unknown student eligibility blocks the verified-offer action. Search examples use real source links and visible BreadcrumbList examples, without injecting fictional merchant structured data into the live document.
