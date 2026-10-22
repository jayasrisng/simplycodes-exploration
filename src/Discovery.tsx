import { useEffect, useState, type KeyboardEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Code2,
  ExternalLink,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  actionFor,
  answerFor,
  breadcrumbExample,
  evidenceExample,
  validateBreadcrumb,
  verdictLabels,
  sourceUrl,
  contractUrl,
  type PromoVerdict,
  type StudentEligibility,
} from "./evidence";
const modes = ["Google Search", "AI Search", "Agent integration"];
const seoFields = [
  "Specific title",
  "Readable verdict",
  "Merchant links",
  "Last checked",
  "Restrictions",
  "Structured breadcrumbs",
];
export function Discovery({ active = false }: { active?: boolean }) {
  const [mode, setMode] = useState(0),
    [verdict, setVerdict] = useState<PromoVerdict>("CONFIDENT_NO"),
    [fields, setFields] = useState(seoFields.map(() => true)),
    [validated, setValidated] = useState(false),
    [step, setStep] = useState(0),
    [student, setStudent] = useState<StudentEligibility>("unknown"),
    [approved, setApproved] = useState(false),
    [exploredChannels, setExploredChannels] = useState(false);
  const record = evidenceExample(verdict),
    action = actionFor(record, student);
  useEffect(() => {
    setStep(0);
    setApproved(false);
    setStudent("unknown");
  }, [verdict]);
  const selectTab = (i: number, focus = false) => {
    setMode(i);
    setExploredChannels(true);
    if (focus) document.getElementById("discovery-tab-" + i)?.focus();
  };
  const keys = (e: KeyboardEvent<HTMLButtonElement>) => {
    let i = mode;
    if (e.key === "ArrowRight") i = (mode + 1) % 3;
    else if (e.key === "ArrowLeft") i = (mode + 2) % 3;
    else if (e.key === "Home") i = 0;
    else if (e.key === "End") i = 2;
    else return;
    e.preventDefault();
    selectTab(i, true);
  };
  const sourceLink = (
    <a
      className="record-source"
      href={sourceUrl}
      target="_blank"
      rel="noreferrer"
    >
      Nike coupon page <ExternalLink size={13} />
    </a>
  );
  const result = (
    <>
      <div
        className={
          "record-verdict " + (verdict === "VERIFIED_OK" ? "positive" : "")
        }
      >
        <ShieldCheck size={18} />
        {verdictLabels[verdict]}
      </div>
      <p className="answer-text">{answerFor(record)}</p>
      <dl className="answer-facts">
        <div>
          <dt>Merchant</dt>
          <dd>Nike · nike.com</dd>
        </div>
        <div>
          <dt>Last checked</dt>
          <dd>
            {record.meta.verified_at
              ? "21 Oct 2026 · 15:00 UTC"
              : "No verification timestamp"}
          </dd>
        </div>
        <div>
          <dt>Scope</dt>
          <dd>
            {verdict === "VERIFIED_OK"
              ? "Students · full-price shoes"
              : verdict === "CONFIDENT_NO"
                ? "Observed web checkout channel"
                : "No supported checkout claim"}
          </dd>
        </div>
      </dl>
      {sourceLink}
    </>
  );
  return (
    <div className="discovery overview-surface">
      <div className="discovery-intro">
        <p>{exploredChannels ? "The same evidence, different entry points." : "Select AI Search to see what a shopper's assistant could answer."}</p>
      </div>
      <div
        className="discovery-tabs"
        role="tablist"
        aria-label="Discovery channels"
      >
        {modes.map((name, i) => (
          <button
            role="tab"
            id={"discovery-tab-" + i}
            aria-controls="discovery-panel"
            aria-selected={mode === i}
            tabIndex={mode === i ? 0 : -1}
            key={name}
            className={i === 1 && active && !exploredChannels ? "guided-action" : undefined}
            onClick={() => selectTab(i)}
            onKeyDown={keys}
          >
            <span>{["SEO", "AEO", "MCP"][i]}</span>
            {name}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id="discovery-panel"
        aria-labelledby={"discovery-tab-" + mode}
        tabIndex={0}
      >
        {mode === 0 ? (
          <>
            <div className="discovery-query">
              <Search size={18} />
              <span>Nike promo codes that work</span>
            </div>
            <div className="discovery-grid">
              <div className="discovery-controls">
                <span className="overline">
                  WHAT SEARCH CAN READ
                </span>
                <h3>Make the answer findable.</h3>
                {seoFields.map((label, i) => (
                  <label className="seo-toggle" key={label}>
                    <input
                      type="checkbox"
                      checked={fields[i]}
                      onChange={() => {
                        setFields((f) => f.map((x, j) => (j === i ? !x : x)));
                        setValidated(false);
                      }}
                    />
                    {label}
                    <Check size={14} />
                  </label>
                ))}
                
              </div>
              <div className="page-excerpt">
                <span className="overline">
                  MERCHANT PAGE CONTENT
                </span>
                {fields[2] && (
                  <div className="breadcrumb">
                    <a
                      href="https://simplycodes.com/stores"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Stores
                    </a>
                    <ChevronRight size={12} />
                    <a href={sourceUrl} target="_blank" rel="noreferrer">
                      Nike coupons
                    </a>
                  </div>
                )}
                <h3>
                  {fields[0]
                    ? "Nike promo codes — verification & conditions | SimplyCodes"
                    : "Nike offers"}
                </h3>
                {fields[0] && (
                  <p>
                    See the dated verification status, restrictions and next
                    useful saving path.
                  </p>
                )}
                {fields[1] ? (
                  <article className="crawlable-example">
                    <h4>Nike coupon verification</h4>
                    <p>No verified public code in this example record.</p>
                    {fields[3] && (
                      <p>
                        <b>Checked</b> 21 Oct 2026 · 15:00 UTC
                      </p>
                    )}
                    {fields[4] && (
                      <p>
                        <b>Scope</b> Web checkout only. Private and member
                        offers may differ.
                      </p>
                    )}
                  </article>
                ) : (
                  <div className="missing-content">
                    A promotional headline without readable evidence leaves the
                    answer unclear.
                  </div>
                )}
                {fields[2] && (
                  <p className="canonical-line">Canonical: {sourceUrl}</p>
                )}
                <details>
                  <summary>
                    <Code2 size={14} />
                    Inspect structured data
                  </summary>
                  <p>Readable navigation and breadcrumb markup stay aligned.</p>
                  <pre>
                    {JSON.stringify(
                      fields[5] && fields[2] ? breadcrumbExample : {},
                      null,
                      2,
                    )}
                  </pre>
                  <button
                    className="outline"
                    onClick={() => setValidated(true)}
                  >
                    Check required fields
                  </button>
                  {validated && (
                    <p className="validation-result" role="status">
                      {fields[5] &&
                      fields[2] &&
                      validateBreadcrumb(breadcrumbExample).length === 0
                        ? "Required breadcrumb fields present."
                        : "Add visible breadcrumbs and their required markup."}{" "}
                      Local guideline check; not a Google Rich Results Test
                      result.
                    </p>
                  )}
                  
                </details>
              </div>
            </div>
            <p className="discovery-note">
              Titles and snippets can be rewritten. Structured data does not
              guarantee inclusion or ranking.
            </p>
          </>
        ) : (
          <>
            <div className="discovery-query">
              <Search size={18} />
              <span>Find me Nike shoes and the best coupon available.</span>
            </div>
            <div className="record-toolbar">
              <label>
                Verification record
                <select
                  aria-label="Verification record"
                  value={verdict}
                  onChange={(e) => setVerdict(e.target.value as PromoVerdict)}
                >
                  {(Object.keys(verdictLabels) as PromoVerdict[]).map((v) => (
                    <option value={v} key={v}>
                      {verdictLabels[v]}
                    </option>
                  ))}
                </select>
              </label>
              <span>Source-attributed. Dated. Scoped.</span>
            </div>
            {mode === 1 ? (
              <>
                <div className="discovery-grid">
                  <div className="answer-source">
                    <span className="overline">
                      WHAT THE PAGE MAKES AVAILABLE
                    </span>
                    <h3>A clear answer, even when it’s no.</h3>
                    <ul className="evidence-fields">
                      <li>Merchant identity</li>
                      <li>Verdict and verification time</li>
                      <li>Restrictions and observed channels</li>
                      <li>Source and methodology links</li>
                    </ul>
                    <details>
                      <summary>See the extraction</summary>
                      <pre>
                        {JSON.stringify(
                          {
                            merchant: record.merchant.domain,
                            verification_status: record.verdict,
                            last_checked: record.meta.verified_at,
                            restrictions: record.caveats,
                            source_url: sourceUrl,
                            methodology_url: contractUrl,
                          },
                          null,
                          2,
                        )}
                      </pre>
                    </details>
                    
                  </div>
                  <div className="answer-card">
                    <span className="overline">
                      AN ANSWER AN ASSISTANT COULD GIVE
                    </span>
                    {result}
                    <div className="next-action">
                      <span>Next useful action</span>
                      <a
                        href={
                          verdict === "VERIFIED_OK"
                            ? sourceUrl
                            : "https://www.nike.com/w/sale-3yaep"
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        {verdict === "VERIFIED_OK"
                          ? "Inspect the offer conditions"
                          : "Explore Nike’s sale"}
                        <ArrowUpRight size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  className="agent-flow"
                  aria-label="Agent verification flow"
                >
                  {[
                    "User request",
                    "Merchant identified",
                    "Tool called",
                    "Evidence returned",
                    "Restrictions evaluated",
                    "Recommendation",
                    "Approved action",
                  ].map((label, i) => (
                    <div key={label} className={step >= i ? "reached" : ""}>
                      <span>
                        {step > i ? (
                          <Check size={12} />
                        ) : (
                          String(i + 1).padStart(2, "0")
                        )}
                      </span>
                      <b>{label}</b>
                    </div>
                  ))}
                </div>
                <div className="discovery-grid">
                  <div className="tool-card">
                    <span className="overline">
                      EXISTING SIMPLYCODES MCP TOOLS
                    </span>
                    <h3>Call the verifier. Keep the receipt.</h3>
                    
                    <pre>
                      {JSON.stringify(
                        {
                          tool: "get_merchant_codes",
                          arguments: { merchant: "nike.com", limit: 3 },
                        },
                        null,
                        2,
                      )}
                    </pre>
                    <button
                      className="outline full"
                      onClick={() => {
                        setStep(3);
                        setApproved(false);
                      }}
                    >
                      Read example response <ArrowRight size={15} />
                    </button>
                    <details>
                      <summary>Inspect the typed evidence</summary>
                      
                      <pre className="agent-envelope">
                        {JSON.stringify(record, null, 2)}
                      </pre>
                      <a
                        href="https://developers.simplycodes.com/docs"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Published MCP documentation <ArrowUpRight size={13} />
                      </a>
                    </details>
                  </div>
                  <div className="agent-result">
                    {step < 3 ? (
                      <div className="agent-empty">
                        <ShieldCheck size={30} />
                        <h3>A claim needs a check.</h3>
                        <p>
                          Read the dated response before recommending a saving.
                        </p>
                      </div>
                    ) : (
                      <>
                        {result}
                        {step < 5 ? (
                          <button
                            className="primary full"
                            onClick={() => setStep(5)}
                          >
                            Evaluate restrictions <ArrowRight size={15} />
                          </button>
                        ) : (
                          <>
                            {verdict === "VERIFIED_OK" &&
                              student === "unknown" && (
                                <div className="question agent-question">
                                  <div>
                                    <h3>Are you an eligible student?</h3>
                                    <p>
                                      The offer can’t be recommended for your
                                      cart until this is known.
                                    </p>
                                  </div>
                                  <div className="button-row">
                                    <button onClick={() => setStudent("yes")}>
                                      Yes, eligible
                                    </button>
                                    <button onClick={() => setStudent("no")}>
                                      No
                                    </button>
                                  </div>
                                </div>
                              )}
                            <div className="approval-card">
                              <span className="overline">YOUR NEXT ACTION</span>
                              <h3>{action.label}</h3>
                              <button
                                className="primary full"
                                disabled={!action.ready || approved}
                                onClick={() => {
                                  setApproved(true);
                                  setStep(6);
                                }}
                              >
                                {approved ? (
                                  <>
                                    <Check size={15} />
                                    Action approved
                                  </>
                                ) : (
                                  <>
                                    Approve this action <ArrowRight size={15} />
                                  </>
                                )}
                              </button>
                              {approved ? (
                                <div role="status">
                                  <p>
                                    Approved locally. No order or payment
                                    created.
                                  </p>
                                  <a
                                    href={action.url!}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Continue to merchant{" "}
                                    <ArrowUpRight size={14} />
                                  </a>
                                </div>
                              ) : (
                                <p className="small-note">
                                  Approval prepares a merchant link. It never
                                  authorizes a purchase.
                                </p>
                              )}
                              {!action.ready && verdict !== "VERIFIED_OK" && (
                                <a
                                  href="https://www.nike.com/"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Continue directly to Nike{" "}
                                  <ArrowUpRight size={14} />
                                </a>
                              )}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <p className="discovery-note">
                  VERIFIED_OK, CONFIDENT_NO, UNTESTED and WITHHELD are distinct.
                  Missing evidence is never a negative checkout result.
                </p>
              </>
            )}
          </>
        )}
      </div>
      <div className="discovery-closing">
        <p>A verified answer should be useful wherever shopping starts.</p>
      </div>
    </div>
  );
}
