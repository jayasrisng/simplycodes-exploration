import { type ReactNode } from "react";
import {
  evidence,
  observationDate,
  alternativeFashionOffers,
  alternativesObserved,
  type Merchant,
  type Layout,
  type Interaction,
} from "./part-two-evidence";
export function External({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children} ↗
    </a>
  );
}
export function PhoneFrame({
  children,
  label,
  layout,
}: {
  children: ReactNode;
  label: string;
  layout?: Layout;
}) {
  return (
    <article
      className={`phone ${layout ? `layout-${layout}` : ""}`}
      aria-label={label}
    >
      <div className="statusbar" aria-hidden="true">
        <span>9:41</span>
        <span className="island" />
        <span>▮▮▮ ▰</span>
      </div>
      {children}
    </article>
  );
}
function NoCodeRecovery({
  showPreview,
  onToggle,
}: {
  showPreview: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="no-code-recovery" aria-label="Other ways to save">
      <div className="recovery-heading">
        <h3>Still looking for something similar?</h3>
        <p>Other fashion stores with recorded verified offers</p>
      </div>
      <div className="recovery-stores">
        {alternativeFashionOffers.map((item) => (
          <a key={item.merchant} href={item.source} target="_blank" rel="noreferrer" className="recovery-store">
            <span><strong>{item.merchant}</strong><small>{item.category}</small></span>
            <span className="recovery-offer"><b>{item.offer}</b><small>100% recorded Health ↗</small></span>
          </a>
        ))}
      </div>
      <p className="recovery-freshness">
        Seen {alternativesObserved}. Health Scores are not guarantees; check the source for current terms.
      </p>
      <div className="recovery-alert">
        <strong>No Kith code today? Stay in the loop.</strong>
        <p>Browse available savings now, or explore how future code alerts could work.</p>
        <button type="button" onClick={onToggle} aria-expanded={showPreview} className="recovery-alert-button">
          {showPreview ? "Hide alert preview" : "Preview code alerts"}
        </button>
        {showPreview && (
          <div className="alert-preview" role="status">
            <b>Alert concept · Kith</b>
            <p>A merchant-specific notification design for future verified Kith offers. SimplyCodes already describes push alerts in its mobile app; this prototype has no active subscription or email collection.</p>
            <div className="recovery-channel-links">
              <a href="https://simplycodes.com/extension" target="_blank" rel="noreferrer">Get the extension ↗</a>
              <a href="https://simplycodes.com/blog" target="_blank" rel="noreferrer">Explore email updates ↗</a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
export function MerchantPhone({
  merchant,
  layout,
  interaction,
  onInteraction,
  onAction,
}: {
  merchant: Merchant;
  layout: Layout;
  interaction: Interaction;
  onInteraction: (value: Interaction) => void;
  onAction: () => void;
}) {
  const record = evidence[merchant];
  const change = (key: "proof" | "eligibility") =>
    onInteraction({ ...interaction, [key]: !interaction[key] });
  const action = (
    <button className="primary" data-primary onClick={onAction}>
      {record.action}
      <span aria-hidden="true">↗</span>
    </button>
  );
  const signals = (
    <div className="signals">
      <div>
        <strong>
          {record.verified ? `${record.health}%` : record.verifiedCount}
        </strong>
        <span>{record.verified ? "Recorded Health" : "Verified codes"}</span>
      </div>
      <div>
        <strong>{record.verified ? record.uses : record.onFile}</strong>
        <span>{record.verified ? "Recorded uses" : "Community codes"}</span>
      </div>
      <div>
        <strong>{record.verified ? record.verifications : "Unknown"}</strong>
        <span>{record.verified ? "Verifications" : "Your eligibility"}</span>
      </div>
    </div>
  );
  const proof = (
    <details className="evidence" open={interaction.proof}>
      <summary
        onClick={(e) => {
          e.preventDefault();
          change("proof");
        }}
      >
        {record.verified ? "Why this code?" : "What we checked"}
        <span aria-hidden="true">{interaction.proof ? "−" : "+"}</span>
      </summary>
      <div className="disclosure-body">
        <p>
          <b>Observed {observationDate} · Pacific.</b>
        </p>
        {record.verified ? (
          <>
            <p>
              The top-pick card showed {record.offer} storewide, Health{" "}
              {record.health}%, {record.verifications} verifications,{" "}
              {record.uses} uses that day, and “last used 3h ago.” Those are
              frozen source labels, not live counters.
            </p>
            <p>
              A working report was dated October 22. Exact verification time,
              expiry, minimum spend, and customer restrictions were not
              established. Your cart has not been checked; a use is not proof of
              acceptance.
            </p>
            <p>
              Other page summaries conflict. This is a supported starting point,
              not a guaranteed best saving.
            </p>
          </>
        ) : (
          <>
            <p>
              The summary listed two community codes and none verified. Their
              last-worked labels were 6 months and 2 years ago at observation.
            </p>
            <p>
              Historical reports and recent use do not establish current
              acceptance. This does not rule out private or future codes. No
              checkout was tested.
            </p>
          </>
        )}
        <External href={record.source}>Inspect the source evidence</External>
      </div>
    </details>
  );
  return (
    <PhoneFrame label={`${merchant} · ${layout} mobile layout`} layout={layout}>
      <header className="shopbar">
        <a className="wordmark" href="https://simplycodes.com/">
          simplycodes<sup>®</sup>
        </a>
        <External href={record.source}>All offers</External>
      </header>
      <div className="phone-body">
        <nav className="crumb" aria-label={`${merchant} ${layout} breadcrumb`}>
          <a href="https://simplycodes.com/stores">Stores</a>
          <span>/</span>
          {merchant}
        </nav>
        <div className="merchant-heading">
          <div
            className={`merchant-icon ${merchant === "Kith" ? "kith" : ""}`}
            aria-hidden="true"
          >
            {merchant === "Kith" ? "Kith" : "V"}
          </div>
          <h2 data-merchant-headline>
            {merchant}
            <span>promo codes & coupons</span>
          </h2>
        </div>
        {layout === "A" && (
          <>
            <div className="store-summary">
              {record.verified
                ? `${record.verifiedCount} verified codes · ${record.onFile} on file`
                : `${record.onFile} community codes · none verified`}
            </div>
            <div className="merchant-tabs">
              <b>Top codes</b>
              <a href={record.destination} target="_blank" rel="noreferrer">
                {record.verified ? "Code history" : "Other savings"} ↗
              </a>
            </div>
          </>
        )}
        {layout === "C" && (
          <div className="confidence-heading">
            <span className="eyebrow">THE EVIDENCE EDIT</span>
            <p>
              {record.verified
                ? "A stronger starting point."
                : "An honest place to start."}
            </p>
          </div>
        )}
        <section data-top-card className="offer-card">
          {layout === "A" ? (
            <>
              <div className="card-kicker">
                {record.verified ? "TOP PICK" : "COMMUNITY STATUS"}
                <span>
                  {record.verified ? "✓ Verified in record" : "○ Not verified"}
                </span>
              </div>
              <div className="familiar-offer">
                <h3>
                  {record.verified ? `${record.percent}%` : "No code"}
                  <span>{record.verified ? "off" : "verified"}</span>
                </h3>
                <p>
                  {record.verified
                    ? "Storewide at Vistaprint"
                    : "Historical codes are not a working-code recommendation."}
                </p>
              </div>
              {signals}
              {action}
              <p className="card-caption">
                {record.verified
                  ? "Check current terms on SimplyCodes."
                  : "Alternatives on SimplyCodes. No discount promised."}
              </p>
            </>
          ) : layout === "B" ? (
            <>
              <span className="pill">
                {record.verified
                  ? "✓ Verified in source record"
                  : "○ No verified public code"}
              </span>
              <h3 className={record.verified ? "hero-discount" : "empty-title"}>
                {record.verified ? (
                  <>
                    {record.percent}
                    <span>%</span>
                    <em>off storewide</em>
                  </>
                ) : (
                  <>
                    No verified
                    <br />
                    code today.
                  </>
                )}
              </h3>
              <p className="offer-description">
                {record.verified
                  ? "Start with the supported offer. Check your cart’s terms at the source."
                  : "Two community codes, neither verified. Explore alternatives before trying your luck."}
              </p>
              {action}
              <div className="compact-proof">
                {record.verified ? (
                  <>
                    <span>{record.health}% recorded Health</span>
                    <span>{record.verifications} verifications</span>
                  </>
                ) : (
                  <>
                    <span>2 historical codes</span>
                    <span>No saving promised</span>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="evidence-top">
                <span>SIMPLYCODES RECORD</span>
                <span>{record.verified ? "✓ Supported" : "○ Unverified"}</span>
              </div>
              <div className="confidence-score">
                <strong>
                  {record.verified ? record.health : "—"}
                  <small>{record.verified ? "%" : ""}</small>
                </strong>
                <div>
                  {record.verified
                    ? "Recorded Health Score"
                    : "No verified public code"}
                  <p>
                    {record.verified
                      ? "A signal, not a guarantee."
                      : "Missing proof is useful information."}
                  </p>
                </div>
              </div>
              <dl className="evidence-ledger">
                <div>
                  <dt>
                    {record.verified
                      ? "Reported activity"
                      : "Community history"}
                  </dt>
                  <dd>
                    {record.verified
                      ? `${record.uses} recorded uses`
                      : `${record.onFile} codes on file`}
                  </dd>
                </div>
                <div>
                  <dt>
                    {record.verified
                      ? "Verification history"
                      : "Current acceptance"}
                  </dt>
                  <dd>
                    {record.verified
                      ? `${record.verifications} verifications`
                      : "Not established"}
                  </dd>
                </div>
                <div>
                  <dt>Your cart’s eligibility</dt>
                  <dd>Unknown</dd>
                </div>
              </dl>
              <div className="evidence-offer">
                <h3>{record.verified ? record.offer : "No code to promise"}</h3>
                <span>
                  {record.verified ? "Storewide" : "Other paths available"}
                </span>
              </div>
              {action}
              <p className="card-caption">
                {record.verified
                  ? "Expiry and full restrictions need checking."
                  : "Explore alternatives; check their terms."}
              </p>
            </>
          )}
        </section>
        {proof}
        {!record.verified && (
          <NoCodeRecovery
            showPreview={interaction.alertPreview}
            onToggle={() => onInteraction({ ...interaction, alertPreview: !interaction.alertPreview })}
          />
        )}
        <details className="eligibility" open={interaction.eligibility}>
          <summary
            onClick={(e) => {
              e.preventDefault();
              change("eligibility");
            }}
          >
            Your eligibility
            <span>Optional {interaction.eligibility ? "−" : "+"}</span>
          </summary>
          <div className="disclosure-body">
            <label>
              Customer status
              <select
                value={interaction.customer}
                onChange={(e) =>
                  onInteraction({ ...interaction, customer: e.target.value })
                }
              >
                <option value="unknown">I’m not sure</option>
                <option value="new">First order</option>
                <option value="returning">Returning customer</option>
              </select>
            </label>
            <p role="status">
              {interaction.customer === "unknown"
                ? "You can continue without sharing anything."
                : interaction.customer === "new"
                  ? "First order selected. A welcome offer is not established by this evidence."
                  : "Returning customer selected. Account and cart restrictions still need checking."}
            </p>
          </div>
        </details>
        {layout === "A" ? (
          <div className="secondary-content">
            <span className="eyebrow">
              {record.verified ? "MORE FROM THIS STORE" : "OTHER WAYS TO SHOP"}
            </span>
            <External href={record.source}>
              {record.verified
                ? "Browse the remaining code history"
                : "Review non-code alternatives"}
            </External>
          </div>
        ) : (
          <p className="quiet-link">
            <External href={record.verified ? record.source : record.store}>
              {record.verified
                ? "Browse all Vistaprint offers"
                : "Visit Kith’s website"}
            </External>
          </p>
        )}
      </div>
    </PhoneFrame>
  );
}
export function Handoff({ merchant }: { merchant: Merchant }) {
  const r = evidence[merchant];
  return (
    <div className="handoff-content">
      <span className="handoff-icon" aria-hidden="true">
        ↗
      </span>
      <span className="eyebrow">NEXT STEP</span>
      <h2>
        {r.verified
          ? "Check the offer at its source."
          : "Explore the alternatives."}
      </h2>
      <p>
        {r.verified
          ? "Continue to SimplyCodes’ verified-code section to inspect the offer and current terms."
          : "Continue to SimplyCodes’ non-code savings section. Availability and eligibility need checking."}
      </p>
      <a
        className="primary"
        href={r.destination}
        target="_blank"
        rel="noreferrer"
      >
        Continue to SimplyCodes <span>↗</span>
      </a>
      <p className="handoff-note">
        No code has been revealed, copied, or tested.
      </p>
      {!r.verified && (
        <External href={r.store}>Or visit Kith’s website</External>
      )}
    </div>
  );
}
