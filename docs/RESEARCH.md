# Research record

Observed October 21, 2026, America/Los_Angeles. Public pages were inspected using a browser. Several initial requests hit Cloudflare; successful later reads are distinguished below. No merchant checkout, account session, extension installation, real coupon redemption, or payment was performed. Public copy describes capabilities; this is not an independent audit of those capabilities.

## SimplyCodes

| Source                                       | Observation                                                                                                                                                                                                                                                                                                                                            | Access                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| https://simplycodes.com/                     | Verification-led hero; search; automated, human and fleet layers; store directory with verified counts. Vistaprint directory count was 20.                                                                                                                                                                                                             | Read after initial challenge |
| https://simplycodes.com/store/nike.com       | Main summary: one code on file, no verified codes yet. Community-code card: 10% off, new-customer restriction; last-use time and verification history. Alternatives include loyalty, clearance and eligibility programs. Other sections contain historical activity; that is not proof of current applicability.                                       | Read after initial challenge |
| https://simplycodes.com/store/vistaprint.com | Main count: 746 codes on file, 20 verified. First visible top pick: 15% storewide, Health 95%, last used 1h ago. Another 15% card; a $20 member-only code; a 10% code. Expandable activity and code details. Different narrative sections report different offer counts and best discounts; do not collapse these into a single cart-specific promise. | Read after initial challenge |
| https://simplycodes.com/how-it-works         | Describes three verification layers; Health Score derived from outcome, consensus and freshness. A Proof Packet contains verdict, score, evidence and conditions in structured JSON. Explicit no-code states are already part of the product’s public philosophy.                                                                                      | Read                         |
| https://simplycodes.com/extension            | Already advertises automatic testing, sorting by dollar savings, surfaced restrictions, Health Scores, Proof Packets and best-code application. These are existing capabilities, not inventions of this exploration. Installation/real behavior not tested.                                                                                            | Read                         |
| https://simplycodes.com/privacy              | Plain-language commitments: checkout-only activation, no browsing-history tracking, personal profiling or selling user data; user-action-based affiliate activation; commission-independent ranking. Formal legal text governs conflicts. Precise retention period not stated on this page.                                                            | Read                         |
| https://simplycodes.com/how-we-make-money    | Revenue from commissions on completed purchases through links. Describes separation of commission/affiliate data from ranking. Paid placement, verdicts, freshness and badges are disallowed according to the published description.                                                                                                                   | Read                         |
| https://product.ai/join/design-engineer/     | Role owns consumer trust interfaces and production React/TypeScript/CSS, with machine-readable tokens, motion and component rules for coding agents. Emphasizes credible confidence and measurable impact.                                                                                                                                             | Read                         |

### Visual system

Home computed body: DM Sans. Merchant body: Figtree. Merchant page screenshot shows black background, charcoal cards, white typography, vivid green (#03ff88) CTAs and italic SimplyCodes wordmark. The initial site used those cues in Today panels with a light editorial shell. The focused revision uses consistent charcoal surfaces, retaining distinct scoped Existing and Proposal palettes. It deliberately does not claim pixel-perfect reproduction. Fonts are self-hosted via fontsource packages. No merchant logos or screenshots are redistributed.

### Agent / MCP prior work and availability

SimplyCodes publishes a dedicated MCP server at https://mcp.simplycodes.com/ and documentation at https://developers.simplycodes.com/docs. Both were read successfully during this revision. The public manifest https://mcp.simplycodes.com/server.json returned version 0.5.1 and four tools: `verify_promo_code`, `get_merchant_codes`, `get_merchant_verification`, and `report_code_outcome`. The endpoint is Streamable HTTP at https://mcp.simplycodes.com/mcp. No authenticated tool execution or outcome reporting was performed.

The documented verdicts are `VERIFIED_OK`, `CONFIDENT_NO`, `UNTESTED`, and `WITHHELD`. Negative evidence is scoped to observed checkout channels; WITHHELD means the merchant resolves but its verification record is not materialized. Access, rate-limit and retrieval refusals are separate. Explorer responses supply reveal links rather than literal paid-tier codes. Comparison tools such as `search_deals` are reserved, not registered, and are not invented here.

The published example envelope provides merchant, tier, serving mode, verdict, observed channels, capsule, offers, caveats and metadata (verification time, freshness, TTL, attribution and methodology). `src/evidence.ts` is a typed **local adaptation**, not generated server types. The linked GitHub implementation was unavailable publicly (404); no complete wire-response JSON Schema was retrieved. Null timestamps, sample platform origin, channel identifiers and fixture values are local examples, not claims about certified schema nullability or real Nike offers. Positive examples require student eligibility; no test is converted into a guarantee.

Correction to earlier research: Product.ai’s separate developer waitlist page was insufficient evidence about SimplyCodes MCP availability. The earlier inference that no SimplyCodes endpoint had been established is superseded by the dedicated published server and manifest above.

### Search and shopping discovery: primary-source review

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide): useful titles/descriptions, crawlable content and links, canonicalization, and access to page resources. Titles/snippets may be rewritten; no ranking promise.
- [Google BreadcrumbList](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb): at least two ListItems, ordered positions, names and URLs (last URL may be omitted). The example includes both URLs and matches its visible Stores → Nike coupons trail. Local tests check these required fields and order; no coupon markup is injected into this personal exploration’s document head.
- [Product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet) apply to a specific product/variants, not a generic merchant coupon list. [Merchant listings](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing) require a page where the shopper can buy products. This aggregator example uses BreadcrumbList, not Product or Offer markup. Eligibility and required-field rules were checked against these documents. No guarantee of a rich result.
- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots): OAI-SearchBot concerns search; allow robots access and published IP ranges/WAF access. GPTBot training controls are independent. ChatGPT-User is a user-initiated fetcher, not the automatic search crawler. The live SimplyCodes robots.txt was readable and did not explicitly block OAI-SearchBot; no crawler-IP or WAF audit was conducted.
- [OpenAI web search](https://developers.openai.com/api/docs/guides/tools-web-search): answers can include source citations; the prototype presents a concise attributed answer, not an actual ChatGPT response.
- [OpenAI commerce start guide](https://developers.openai.com/commerce/guides/get-started): approved-partner product feeds are a separate route. Readable coupon markup does not establish a commerce partnership or feed integration. No SimplyCodes partnership is asserted.
- [Snap Specs](https://www.specs.com/): current official Lenses/Specs reference. The familiarity-before-responsibility progression is the author’s product analogy, not a measured causal claim or an official commerce roadmap.


## Adjacent experiences

| Source                          | Observed public behavior                                                                                                                        | Design implication                                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| https://capitaloneshopping.com/ | Offer amounts, rates, caps, activation actions, rate-change warnings and commission explanation.                                                | Put conditions beside the action; distinguish discount from rewards.                                        |
| https://www.joinhoney.com/      | One-click coupon testing narrative; price tracking and seller comparison; cookie acceptance/decline controls.                                   | Reduce orchestration work, while avoiding an unsupported success promise.                                   |
| https://www.rakuten.com/        | Cash Back activation, variable-rate and welcome-reward terms, payout timing, merchant-funded model explanation and privacy FAQ.                 | Show payable amount separately from later rewards and explain attribution.                                  |
| https://www.groupon.com/        | Original, sale and code-adjusted prices; “with code” labels. Signup offer specifies new-purchase/local-category terms and email/text tradeoffs. | Make final price and conditions inspectable without treating the largest headline as universally available. |
| https://inkind.com/             | Restaurant rewards, phone payment narrative, participating venues, first-visit offer with minimum spend, cookie choices.                        | Connect immediate savings to the qualifying action; show venue and first-use limits.                        |

These were public marketing/discovery observations only. No logged-in checkout behavior, cashback receipt, restaurant bill payment or competitor extension was tested. Competitor claims were not independently audited. No competitor interface is copied wholesale.

## Product judgment and limits

The proposal extends existing decision-oriented capabilities across merchant discovery, cart eligibility, evidence order, privacy context and rejection recovery. It does not assert SimplyCodes currently lacks auto-apply, savings ranking, restrictions, structured evidence or no-code handling. The side-by-side checkout is explicitly the conventional manual path versus an assisted interaction; it is not an observed recording of today’s extension.

The Vistaprint and Nike interactive code strings, percentage values, dates, tests, pass counts, shipping threshold and outcomes are deterministic **invented fixtures**, not the observed live offers above. Fixture “VERIFIED” means supported by fixture evidence, not an actual merchant checkout. Student status is deliberately unknown until answered. Merchant eligibility does not guarantee final acceptance.

The revenue calculator has been removed. No conversion, commission uplift or company business result is measured here. The engine contribution helper remains unused by the UI. Revenue remains outside coupon ranking.

No analytics, accounts, trackers, remote font requests, payment requests or actual extension permissions. Toggles are local state specimens. Production permission and retention language would require policy and legal review.

## Focused revision research

Revisited the Vistaprint merchant page during the revision on October 21, 2026 (Pacific). After an initial Cloudflare challenge, the page rendered successfully. Computed font remained Figtree and the primary action color was rgb(3,255,136). The public top pick still displayed 15% off, Health 95%, last used information and expandable verification activity. This supports dark neutral cards, green actions and evidence affordances; it does not establish a new checkout observation.

The revised comparison uses the same illustrative offer set and does not claim its exact order is the live ranking. Per-card cart checks are local overlays to make the comparison inspectable. The manual checkout route is labeled as such and explicitly credits the existing extension’s assisted application. Session attempt counts are actual local clicks, not measured time savings or claims about real shopper effort.

### External validation limitation

Google’s Rich Results Test was opened and the sample BreadcrumbList plus its matching visible trail was submitted through its code editor. The tool returned “Something went wrong / Log in and try again.” No external validation result was obtained. Required-field and order checks pass locally against the Search Central requirements; this is not a Google certification or ranking result.
