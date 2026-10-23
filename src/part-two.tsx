import { useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/600.css";
import "./part-two.css";
const vista = "https://simplycodes.com/store/vistaprint.com";
const kith = "https://simplycodes.com/store/kith.com";
const observed = "Oct 22, 2026";
function Source({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children} ↗
    </a>
  );
}
function Phone({ merchant }: { merchant: "Vistaprint" | "Kith" }) {
  const positive = merchant === "Vistaprint";
  const [customer, setCustomer] = useState("unknown");
  return (
    <article className="phone" aria-label={`${merchant} mobile experience`}>
      <div className="statusbar" aria-hidden="true">
        <span>9:41</span>
        <span className="island" />
        <span>▮▮▮ ▰</span>
      </div>
      <header className="shopbar">
        <a href="https://simplycodes.com/" className="wordmark">
          simplycodes<span>®</span>
        </a>
        <span className="verified-label">✓ Evidence first</span>
      </header>
      <div className="phone-body">
        <nav className="crumb" aria-label={`${merchant} breadcrumb`}>
          <a href="https://simplycodes.com/">Stores</a>
          <span>/</span>
          <span>{merchant}</span>
        </nav>
        <div
          className={`merchant-icon ${positive ? "vista" : "kith"}`}
          aria-hidden="true"
        >
          {positive ? "V" : "Kith"}
        </div>
        <h2 data-merchant-headline>
          {merchant}
          <br />
          promo codes & coupons
        </h2>
        <section
          className={`offer ${positive ? "positive" : ""}`}
          data-top-card
        >
          <div className="eyebrow">
            {positive
              ? "✓ VERIFIED ON SIMPLYCODES"
              : "○ NO VERIFIED PUBLIC CODE"}
          </div>
          {positive ? (
            <>
              <h3 className="discount">
                15% <span>off</span>
              </h3>
              <p className="offer-name">Storewide at Vistaprint</p>
              <p className="offer-note">
                Check the terms for your cart before using this offer.
              </p>
              <div className="signals">
                <div>
                  <strong>100%</strong>
                  <span>Health Score</span>
                </div>
                <div>
                  <strong>3h ago</strong>
                  <span>Last used · Oct 22</span>
                </div>
                <div>
                  <strong>16</strong>
                  <span>Uses on Oct 22</span>
                </div>
              </div>
              <a
                className="primary"
                data-primary
                href={`${vista}#verified-promos-section`}
                target="_blank"
                rel="noreferrer"
              >
                Check the SimplyCodes source <span>↗</span>
              </a>
            </>
          ) : (
            <>
              <h3 className="no-code-title">No verified code right now.</h3>
              <p className="offer-note">
                Two community codes are listed. Neither is currently verified.
              </p>
              <div className="honest-note">
                Past use is not current verification.
              </div>
              <a
                className="primary"
                data-primary
                href={`${kith}#best-deal-section`}
                target="_blank"
                rel="noreferrer"
              >
                Explore non-code alternatives <span>↗</span>
              </a>
            </>
          )}
        </section>
        {!positive && (
          <a
            className="secondary-store"
            href="https://kith.com/"
            target="_blank"
            rel="noreferrer"
          >
            Visit Kith’s website ↗
          </a>
        )}
        <details className="evidence">
          <summary>
            {positive ? "Why this code?" : "What we checked"}
            <span aria-hidden="true">+</span>
          </summary>
          {positive ? (
            <div>
              <p>
                The source’s top-pick card showed 15% off storewide, Health
                100%, 185 verifications, and a working report dated Oct 22.
              </p>
              <p>
                “3h ago” and 16 uses were displayed on Oct 22, 2026, not live
                counters. A use is not proof of acceptance.
              </p>
              <p>
                No minimum spend, expiry, or customer restriction was stated on
                this card. Missing terms are unknown, not unrestricted. Larger
                headline deals elsewhere on the page conflict; this is not a
                guaranteed best saving for your cart.
              </p>
              <Source href={vista}>Inspect the original card</Source>
            </div>
          ) : (
            <div>
              <p>
                The merchant summary said none verified; both listed cards were
                labeled Community Code. On Oct 22, 2026, their last-worked
                labels were 6 months and 2 years ago.
              </p>
              <p>
                Historical reports and recent uses do not establish current
                acceptance. Other narrative sections conflict with these labels.
                We did not test a checkout or rule out private, targeted, or
                future codes.
              </p>
              <Source href={kith}>Inspect Kith’s code history</Source>
            </div>
          )}
        </details>
        {positive ? (
          <details className="personalize">
            <summary>
              Shopping for the first time? <span>Optional</span>
            </summary>
            <label htmlFor="customer">Your Vistaprint customer status</label>
            <select
              id="customer"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            >
              <option value="unknown">I’m not sure</option>
              <option value="new">First order</option>
              <option value="returning">Returning customer</option>
            </select>
            <p role="status">
              {customer === "new"
                ? "Check first-order terms at the source before choosing. We have not verified a better welcome offer."
                : customer === "returning"
                  ? "Keep the storewide offer as a starting point; check account and cart restrictions at checkout."
                  : "No problem. You can inspect the offer without sharing anything."}
            </p>
          </details>
        ) : (
          <div className="history">
            <span>COMMUNITY HISTORY</span>
            <p>Useful context. Not a verified recommendation.</p>
            <Source href={kith}>Review the two community codes</Source>
          </div>
        )}
      </div>
    </article>
  );
}
const opportunities = [
  {
    name: "SEO",
    title: "Protect the search entry point.",
    existing:
      "Merchant titles, coupon content, and store links already serve search intent.",
    change:
      "Keep the merchant H1 first. Improve the decision hierarchy without removing crawlable evidence, restrictions, history, or internal links.",
    measure:
      "Organic clicks by matched merchant/query cohort; indexing and mobile content parity.",
    url: "https://developers.google.com/search/docs/appearance/ai-features",
    source: "Google Search guidance",
  },
  {
    name: "AI discovery",
    title: "An answer that carries its evidence.",
    existing:
      "SimplyCodes already publishes verification history and structured evidence.",
    change:
      "Keep source, verification date, conditions, and unknowns together when an answer travels beyond the page.",
    measure:
      "Correct source attribution, timestamp coverage, and unsupported-claim rate in a fixed prompt evaluation.",
    url: "https://developers.simplycodes.com/docs",
    source: "Result envelope documentation",
  },
  {
    name: "MCP",
    title: "One record. More useful surfaces.",
    existing:
      "SimplyCodes already publishes four MCP tools, including get_merchant_codes and get_merchant_verification.",
    change:
      "Adapt one evidence record to a web card, an extension, and an agent answer while preserving its limitations.",
    measure:
      "Evidence consistency across surfaces; stale-record and missing-field rates.",
    url: "https://mcp.simplycodes.com/server.json",
    source: "Published MCP manifest · v0.5.1",
  },
  {
    name: "Deal digest",
    title: "Distribute what is already verified.",
    existing:
      "The blog, newsletter signup, live rankings, and refreshed verification reports already exist.",
    change:
      "Add an opt-in digest for chosen merchants: useful changes, at the cadence the subscriber chooses.",
    measure:
      "Unique save visits from the digest, unsubscribe rate, and stale or duplicate sends.",
    url: "https://simplycodes.com/blog",
    source: "Research, live data & newsletter",
  },
  {
    name: "Reddit",
    title: "Turn coupon questions into useful answers.",
    existing:
      "People question whether coupon sites are trustworthy and how SimplyCodes works. SimplyCodes already has a Reddit coupon guide.",
    change:
      "Answer real questions transparently, route failed-code reports into product feedback, and consider an official moderated community if there is sustained demand.",
    measure:
      "Questions resolved, useful referrals, recurring issues fixed, and moderation quality—not posts published.",
    url: "https://simplycodes.com/blog/coupon-codes-reddit",
    source: "SimplyCodes Reddit guide",
  },
];
function Beyond() {
  const [active, setActive] = useState(0);
  const [surface, setSurface] = useState("Website");
  const [cadence, setCadence] = useState("Daily");
  const [missing, setMissing] = useState(false);
  const [redditAction, setRedditAction] = useState("Listen");
  const item = opportunities[active];
  return (
    <section className="beyond" id="beyond">
      <details className="optional-strategy">
        <summary>
          Beyond the mobile screens <span>Search · AI · Community</span>
        </summary>
        <div className="section-heading">
          <div>
            <h2>More ways to use verified evidence.</h2>
          </div>
        </div>
        <div className="opportunity-layout">
          <div
            className="opportunity-tabs"
            role="tablist"
            aria-label="Growth opportunities"
            aria-orientation="vertical"
          >
            {opportunities.map((o, i) => (
              <button
                key={o.name}
                id={`op-${i}`}
                role="tab"
                aria-selected={active === i}
                aria-controls="op-panel"
                tabIndex={active === i ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  let next = i;
                  if (e.key === "ArrowDown") next = (i + 1) % 5;
                  else if (e.key === "ArrowUp") next = (i + 4) % 5;
                  else if (e.key === "Home") next = 0;
                  else if (e.key === "End") next = 4;
                  else return;
                  e.preventDefault();
                  setActive(next);
                  document.getElementById(`op-${next}`)?.focus();
                }}
              >
                <span>0{i + 1}</span>
                {o.name}
                <span>↗</span>
              </button>
            ))}
          </div>
          <div
            id="op-panel"
            role="tabpanel"
            aria-labelledby={`op-${active}`}
            tabIndex={0}
          >
            <h3>{item.title}</h3>
            <p>
              <b>Already there.</b> {item.existing}
            </p>
            <p>
              <b>The next step.</b> {item.change}
            </p>
            {active === 0 && (
              <div className="specimen">
                <span className="eyebrow">PRODUCTION CONTENT CONTRACT</span>
                <code>
                  Title: Vistaprint Promo Codes & Coupons | SimplyCodes
                  <br />
                  H1: Vistaprint promo codes & coupons
                </code>
                <p>
                  H1 → supported offer + action → evidence → code history →
                  related stores. Serve equivalent text and links in mobile
                  HTML. This independent page keeps its own title and canonical.
                </p>
              </div>
            )}
            {active === 1 && (
              <blockquote className="specimen">
                “SimplyCodes listed a 15% storewide Vistaprint offer on Oct 22,
                2026, with a working report dated that day. Exact verification
                time and expiry are unavailable here; your cart has not been
                checked.”
                <br />
                <Source href={vista}>Source: Vistaprint card</Source>
                <small>
                  Illustrative answer, not an actual AI response. Crawlability
                  and clear evidence do not guarantee Google or ChatGPT
                  citations.
                </small>
              </blockquote>
            )}
            {active === 2 && (
              <div className="specimen">
                <div className="segments" aria-label="Evidence surface">
                  {["Website", "Extension", "AI agent"].map((s) => (
                    <button
                      key={s}
                      aria-pressed={surface === s}
                      onClick={() => setSurface(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="record-output" aria-live="polite">
                  {missing
                    ? "Verification time missing → do not claim a fresh verified result. Open the source to recheck."
                    : surface === "Website"
                      ? "15% off storewide → view the code at its source."
                      : surface === "Extension"
                        ? "15% candidate → inspect cart restrictions before recommending application."
                        : "Dated source → explain the offer, uncertainty, and reveal link; never invent a code."}
                </p>
                <details>
                  <summary>Inspect the shared evidence record</summary>
                  <pre>
                    {JSON.stringify(
                      {
                        merchant: "Vistaprint",
                        offer: "15% off storewide",
                        source: vista,
                        observed_on: "2026-10-22",
                        source_label: "Verified",
                        working_report_date: "2026-10-22",
                        verified_at: null,
                        ttl_seconds: null,
                        restrictions: "Storewide; other terms unknown",
                        cart_eligibility: "unknown",
                        action_url: vista,
                      },
                      null,
                      2,
                    )}
                  </pre>
                  <small>
                    Local observation model, not the official API schema. Null
                    verification time and TTL prevent a live freshness claim;
                    production must retrieve the source envelope.
                  </small>
                </details>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={missing}
                    onChange={(e) => setMissing(e.target.checked)}
                  />{" "}
                  Test missing verification time
                </label>
                <small>
                  Local mapping concept, not an MCP response or live call. A
                  production adapter must honor verified_at, TTL, restrictions,
                  and refusals from the actual envelope.
                </small>
                <details>
                  <summary>Where llms.txt fits</summary>
                  <p>
                    A proposed navigation file for compatible agents, not a
                    Google ranking mechanism. Google requires no special AI text
                    file. SimplyCodes’ root llms.txt returned 404 on {observed};
                    this does not establish absence on other hosts.
                  </p>
                  <pre>
                    {
                      "# Independent SimplyCodes exploration\n> A dated design concept, not the official site.\n\n## Sources\n- [Official docs](https://developers.simplycodes.com/docs)\n- [Tool manifest](https://mcp.simplycodes.com/server.json)"
                    }
                  </pre>
                  <p>
                    Sample only; not published as SimplyCodes documentation.
                  </p>
                  <Source href="https://llmstxt.org/">llms.txt proposal</Source>{" "}
                  ·{" "}
                  <Source href="https://developers.google.com/search/docs/appearance/ai-features">
                    Google guidance
                  </Source>
                </details>
              </div>
            )}
            {active === 3 && (
              <div className="specimen">
                <span className="eyebrow">DIGEST PREVIEW · CONCEPT ONLY</span>
                <div className="segments">
                  {["Daily", "Every 3 days", "Weekly"].map((c) => (
                    <button
                      key={c}
                      aria-pressed={cadence === c}
                      onClick={() => setCadence(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <p aria-live="polite">
                  {cadence === "Daily"
                    ? "Vistaprint: 15% storewide was the observed top pick. Recheck verification before sending a notable-offer alert."
                    : cadence === "Every 3 days"
                      ? "Send only material changes: a newly verified offer, changed restrictions, or a withdrawal. No change → no email."
                      : "Summarize verified availability and reliability over the week. No longitudinal data in this snapshot → no trend or savings total."}
                </p>
                <details>
                  <summary>Rules before a send</summary>
                  <p>
                    Require explicit merchant and cadence opt-in, confirmation,
                    and one-click unsubscribe. Re-fetch before send; suppress
                    missing timestamps, expired TTLs, and non-verified claims.
                    Proposed maximum evidence age: 24 hours, or the source TTL
                    if shorter.
                  </p>
                  <p>
                    Deduplicate by subscriber + merchant + offer + material
                    version across cadences. Respect consent withdrawal
                    immediately. Count savings only with genuine transaction or
                    outcome data, never from clicks or headline discounts.
                  </p>
                </details>
                <small>No subscription is collected or email sent here.</small>
              </div>
            )}
            {active === 4 && (
              <div className="specimen">
                <span className="eyebrow">COMMUNITY PLAYBOOK</span>
                <div className="segments" aria-label="Reddit community ideas">
                  {["Listen", "Answer", "Host"].map((step) => (
                    <button
                      key={step}
                      aria-pressed={redditAction === step}
                      onClick={() => setRedditAction(step)}
                    >
                      {step}
                    </button>
                  ))}
                </div>
                <p className="record-output" aria-live="polite">
                  {redditAction === "Listen"
                    ? "Track questions about failed codes, verification and whether SimplyCodes is trustworthy. Surface patterns for the product team."
                    : redditAction === "Answer"
                      ? "Reply as an identified team member where subreddit rules permit. Explain checks, limitations and next steps; do not mass-post links."
                      : "If shoppers want a dedicated space, pilot an official moderated community: code-help threads, verified updates, transparent rules and a route for reported failures."}
                </p>
                <Source href="https://www.reddit.com/r/Affiliatemarketing/comments/1h5edbl/can_someone_please_explain_how_companies_like/">
                  A real question about how SimplyCodes works
                </Source>
                <small>Community replies require human review and subreddit permission. Search visibility is not guaranteed.</small>
              </div>
            )}
            <p className="measure">
              <b>Measure</b> {item.measure}
            </p>
            <Source href={item.url}>{item.source}</Source>
          </div>
        </div>
      </details>
    </section>
  );
}
function App() {
  const [phone, setPhone] = useState("Vistaprint");
  return (
    <>
      <a className="skip" href="#screens">
        Skip to mobile experiences
      </a>
      <header className="page-nav">
        <a href="../" className="wordmark">
          simplycodes<span> / 02</span>
        </a>
        <nav aria-label="Exploration">
          <a href="../">Part One ↗</a>
          <span>PART TWO</span>
        </nav>
      </header>
      <main>
        <section className="intro">
          <span className="eyebrow">SIMPLYCODES / MOBILE</span>
          <h1>
            Find the code.
            <br />
            <span>Skip the guessing.</span>
          </h1>
          <div className="intro-bottom">
            <p>Verified offer or no verified code. Both have a clear next step.</p>
            <a className="intro-link" href="#screens">Explore the screens ↓</a>
          </div>
        </section>
        <section
          id="screens"
          className="screens"
          aria-label="Two merchant experiences"
        >
          <div className="mobile-switch" aria-label="Choose merchant">
            {["Vistaprint", "Kith"].map((s) => (
              <button
                key={s}
                aria-pressed={phone === s}
                onClick={() => setPhone(s)}
              >
                {s === "Vistaprint" ? "Verified offer" : "No verified code"}
              </button>
            ))}
          </div>
          <div className="phone-grid">
            {(["Vistaprint", "Kith"] as const).map((m, i) => (
              <div
                className={`phone-column ${phone === m ? "selected" : ""}`}
                key={m}
              >
                <div className="phone-caption">
                  <span>
                    {i === 0
                      ? "A / A SUPPORTED ANSWER"
                      : "B / AN HONEST ALTERNATIVE"}
                  </span>
                  <b>{m}</b>
                </div>
                <Phone merchant={m} />
                <div className="fold">
                  <span>390 × 844 · FIRST VIEWPORT ENDS HERE</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="design-diff" aria-label="Design decisions">
          <p><strong>Keep</strong> Health Scores, usage history, verification evidence.</p>
          <p><strong>Change</strong> One clear action first. Details on demand.</p>
        </section>
        <section className="experiment">
          <div>
            <span className="eyebrow">THE EXPERIMENT</span>
            <h2>Saves per 100 visits</h2>
            <p>Would a clearer action lead to more useful shopper decisions?</p>
          </div>
          <div className="metric">
            <strong>
              +10<span>%</span>
            </strong>
            <p>
              relative lift
              <br />
              illustrative target, not a forecast
            </p>
          </div>
          <div className="metric-definition">
            <h3>
              Visits with ≥1 save action
              <br />
              per 100 eligible visits
            </h3>
            <p>
              100 × visits with a reveal, copy, or store click-out ÷ eligible
              visits. Count each visit once. Prototype source handoffs are not
              qualifying save actions; no saves are recorded here.
            </p>
            <details>
              <summary>Experiment & search guardrail</summary>
              <p>
                Randomize eligible human merchant-page visits into current and
                proposed layouts, with a stable assignment. Define a visit as a
                30-minute session; exclude bots and internal traffic before
                assignment. Segment verified and no-code pages.
              </p>
              <p>
                Pre-register sample size from baseline rate, 80% power, and a 5%
                significance level for the 10% relative target. Run at least 14
                days and until the planned sample is reached; report confidence
                intervals, not an early win.
              </p>
              <p>
                <b>Proposed rollback threshold:</b> a greater than 5% relative
                decline in organic clicks versus matched unchanged pages over at
                least two full weeks, beyond the pre-registered normal-variance
                interval. Match on prior traffic, query intent, device, and
                seasonality. Investigate indexing and page changes; insufficient
                sample means inconclusive, not safe.
              </p>
              <p>
                Track raw outbound events and unique click-out visits
                separately. Measure confirmed acceptance, orders, and realized
                savings only with consented outcome data. A save action is
                intent, not a completed saving. No tracking runs in this
                prototype.
              </p>
            </details>
          </div>
        </section>
        <Beyond />
        <footer>
          <span>Unofficial interface concept. Not affiliated with SimplyCodes.</span>
          <a href="../">Return to Part One ↗</a>
          <details>
            <summary>Sources & limits</summary>
            <p>
              Merchant cards, developer docs, MCP manifest, research hub, Google
              guidance, and llms.txt proposal inspected {observed} (Pacific).
              Card signals are a fixed observation, not live eligibility. No
              checkout, MCP authentication, mailing service, or real experiment
              was run.
            </p>
            <Source href={vista}>Vistaprint</Source> ·{" "}
            <Source href={kith}>Kith</Source> ·{" "}
            <Source href="https://developers.simplycodes.com/docs">
              Developer docs
            </Source>
          </details>
        </footer>
      </main>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
