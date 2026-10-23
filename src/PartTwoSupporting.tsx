import { useState } from "react";
import { External as Source } from "./PartTwoPhone";
const vista = "https://simplycodes.com/store/vistaprint.com";
const observed = "October 22, 2026";
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
    title: "Participate before promoting.",
    existing:
      "Shopping communities already discuss codes; SimplyCodes publishes a guide to finding codes on Reddit.",
    change:
      "Disclose affiliation, follow each community’s rules, answer verification questions, and turn reported friction into product fixes.",
    measure:
      "Questions resolved, recurring friction themes, and moderator removals. No posting-volume target.",
    url: "https://simplycodes.com/blog/coupon-codes-reddit",
    source: "SimplyCodes Reddit guide",
  },
];
export function Beyond() {
  const [active, setActive] = useState(0);
  const [surface, setSurface] = useState("Website");
  const [cadence, setCadence] = useState("Daily");
  const [missing, setMissing] = useState(false);
  const [communityStep, setCommunityStep] = useState("Question");
  const item = opportunities[active];
  return (
    <section className="beyond" id="beyond">
      <details className="optional-strategy">
        <summary>
          Optional · Beyond the landing page <span>5 opportunities</span>
        </summary>
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
                <span className="eyebrow">POSSIBLE COMMUNITY FLOW</span>
                <div className="segments" aria-label="Community flow">
                  {["Question", "Response", "Product follow-up"].map((step) => (
                    <button
                      key={step}
                      aria-pressed={communityStep === step}
                      onClick={() => setCommunityStep(step)}
                    >
                      {step}
                    </button>
                  ))}
                </div>
                <div aria-live="polite">
                  {communityStep === "Question" ? (
                    <p>Shopper: “My code failed. Can I trust SimplyCodes?”</p>
                  ) : communityStep === "Response" ? (
                    <>
                      <p>
                        Team member: “I work with SimplyCodes. A recent use is
                        not proof of acceptance. Here is the dated verification
                        history. Which restriction or error did you see? Please
                        leave out personal and order details.”
                      </p>
                      <Source href="https://simplycodes.com/how-it-works">
                        Explain how verification works
                      </Source>
                    </>
                  ) : (
                    <p>
                      Product follow-up → review the failure, check whether
                      restrictions were clear, and add recurring friction to the
                      improvement backlog.
                    </p>
                  )}
                </div>
                <small>
                  Concept only. Human review and community rules first; no
                  automated promotion. A moderated community would need
                  sustained demand. Existing account activity was not audited.
                </small>
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
