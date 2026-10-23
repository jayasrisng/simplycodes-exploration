import { useState, type CSSProperties, type ReactNode, type Ref } from "react";
import {
  evidence,
  observationDate,
  alternativeFashionOffers,
  alternativesObserved,
  type Merchant,
} from "../part-two-evidence";
import { type Block, type Design, type BlockType } from "./model";
export function BlockContent({
  block,
  merchant,
  onAction,
}: {
  block: Block;
  merchant: Merchant;
  onAction: () => void;
}) {
  const r = evidence[merchant];
  const [customer, setCustomer] = useState("unknown");
  const [alert, setAlert] = useState(false);
  switch (block.id) {
    case "header":
      return (
        <h2 data-lab-headline>
          {merchant}
          <span>{block.text}</span>
        </h2>
      );
    case "coupon":
      return (
        <div data-lab-card>
          <span className="lab-status">
            {r.verified
              ? "✓ Verified in the source record"
              : "○ No verified public code"}
          </span>
          <h3>{r.offer}</h3>
          <p>{block.text}</p>
          <p className="lab-immutable" data-lab-unknown>
            {r.verified
              ? "Storewide. Your cart’s eligibility and full restrictions are unknown."
              : "Two community codes, neither verified. Historical use is not current acceptance. Restrictions and eligibility are unknown."}
          </p>
        </div>
      );
    case "cta":
      return (
        <button
          className={`lab-action treatment-${block.style.button}`}
          data-lab-primary
          style={{
            color: block.style.color,
            justifyContent:
              block.style.align === "left"
                ? "space-between"
                : block.style.align === "center"
                  ? "center"
                  : "flex-end",
            background:
              block.style.button === "solid"
                ? block.style.background
                : "transparent",
            borderColor: block.style.background,
            fontWeight: block.style.weight,
            fontSize: block.style.fontSize,
            borderRadius: block.style.radius,
            minHeight: Math.max(
              20,
              block.style.padding * 2 + block.style.fontSize * 1.25,
            ),
            padding: block.style.padding,
          }}
          onClick={onAction}
        >
          {block.text || r.action}
          <span aria-hidden="true">↗</span>
        </button>
      );
    case "signals":
      return (
        <>
          <h3 className="lab-block-label">{block.text}</h3>
          <dl className="lab-signals">
            <div>
              <dt>{r.verified ? "Recorded Health" : "Verified codes"}</dt>
              <dd>{r.verified ? `${r.health}%` : r.verifiedCount}</dd>
            </div>
            <div>
              <dt>{r.verified ? "Recorded uses" : "Community codes"}</dt>
              <dd>{r.verified ? r.uses : r.onFile}</dd>
            </div>
            <div>
              <dt>{r.verified ? "Verifications" : "Eligibility"}</dt>
              <dd>{r.verified ? r.verifications : "Unknown"}</dd>
            </div>
          </dl>
        </>
      );
    case "evidence":
      return (
        <details className="lab-evidence" data-lab-evidence>
          <summary>{block.text || "Verification evidence"}</summary>
          <div className="lab-evidence-body">
            <p>
              <b>Observed {observationDate}, Pacific.</b>
            </p>
            <p>
              {r.verified
                ? `The top-pick card recorded ${r.offer} storewide, Health ${r.health}%, ${r.uses} uses that day, and ${r.verifications} verifications. “Last used 3h ago” was a label at observation, not a live counter.`
                : "The summary listed two community codes and none verified. At observation, their last-worked labels were 6 months and 2 years ago. That does not rule out private or future codes."}
            </p>
            <p>
              Exact verification time, expiry, and full restrictions are not
              established. Your cart has not been checked. Other source
              summaries may conflict.
            </p>
            <a href={r.source} target="_blank" rel="noreferrer">
              Read source evidence ↗
            </a>
          </div>
        </details>
      );
    case "eligibility":
      return (
        <details className="lab-eligibility">
          <summary>{block.text || "Your eligibility"}</summary>
          <label>
            Customer status
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            >
              <option value="unknown">I’m not sure</option>
              <option value="new">First order</option>
              <option value="returning">Returning customer</option>
            </select>
          </label>
          <p data-lab-unknown role="status">
            {customer === "unknown"
              ? "Unknown eligibility. No details are required to continue."
              : "Preference selected. Customer status does not establish eligibility; check restrictions at the source."}
          </p>
        </details>
      );
    case "alternatives":
      return (
        <div data-lab-alternatives>
          <h3 className="lab-block-label">{block.text}</h3>
          {merchant === "Kith" ? (
            <>
              {alternativeFashionOffers.map((item) => (
                <a
                  className="lab-secondary"
                  href={item.source}
                  target="_blank"
                  rel="noreferrer"
                  key={item.merchant}
                >
                  <span>{item.merchant}</span>
                  <span>{item.offer} ↗</span>
                </a>
              ))}
              <p className="lab-immutable">
                Observed {alternativesObserved}; availability and terms may
                change.
              </p>
            </>
          ) : (
            <>
              <a
                className="lab-secondary"
                href="https://simplycodes.com/store/photo.walgreens.com"
                target="_blank"
                rel="noreferrer"
              >
                Walgreens Photo ↗
              </a>
              <a
                className="lab-secondary"
                href="https://simplycodes.com/store/mpix.com"
                target="_blank"
                rel="noreferrer"
              >
                Mpix ↗
              </a>
              <p className="lab-immutable">
                Related print stores. Check their offers and terms.
              </p>
            </>
          )}
        </div>
      );
    case "notification":
      return (
        <div data-lab-notification>
          <h3 className="lab-block-label">{block.text}</h3>
          <p className="lab-immutable">
            See how future verified-offer updates could work.
          </p>
          <button
            className="lab-secondary"
            data-lab-alert-toggle
            aria-expanded={alert}
            onClick={() => setAlert(!alert)}
          >
            {alert ? "Hide update preview" : "Preview offer updates"}
          </button>
          {alert && (
            <div className="lab-alert" role="status">
              <p>
                Alert concept for {merchant}. No subscription or email
                collection is active.
              </p>
              <a
                className="lab-secondary"
                href="https://simplycodes.com/extension"
                target="_blank"
                rel="noreferrer"
              >
                Explore the extension ↗
              </a>
              <a
                className="lab-secondary"
                href="https://simplycodes.com/blog"
                target="_blank"
                rel="noreferrer"
              >
                Explore existing email updates ↗
              </a>
            </div>
          )}
        </div>
      );
  }
}
export function blockStyle(block: Block): CSSProperties {
  return {
    padding: block.id === "cta" ? 0 : block.style.padding,
    marginBottom: block.style.margin,
    fontSize: block.style.fontSize,
    textAlign: block.style.align,
    color: block.style.color,
    background: block.id === "cta" ? "transparent" : block.style.background,
    borderRadius: block.style.radius,
    fontWeight: block.style.weight,
  };
}
export function Preview({
  design,
  merchant,
  rootRef,
  renderBlock,
  width = 390,
  onHandoff,
}: {
  design: Design;
  merchant: Merchant;
  rootRef?: Ref<HTMLElement>;
  renderBlock?: (b: Block, children: ReactNode) => ReactNode;
  width?: number;
  onHandoff?: () => void;
}) {
  const [handoff, setHandoff] = useState(false);
  const r = evidence[merchant];
  const act = () => {
    setHandoff(true);
    onHandoff?.();
  };
  return (
    <article
      ref={rootRef}
      className={`lab-shopper lab-theme-${design.layout}`}
      style={{ width }}
      aria-label={`${merchant} shopper preview`}
      data-lab-layout={design.layout}
    >
      <div className="lab-phone-chrome" aria-hidden="true">
        <span>9:41</span>
        <i />
        <span>▮▮▮ ▰</span>
      </div>
      <header className="lab-shopbar">
        <span className="wordmark">simplycodes</span>
        <span>Merchant offers</span>
      </header>
      <div className="lab-content">
        {design.blocks
          .filter((b) => b.visible)
          .map((block) => {
            const content = (
              <section data-block-id={block.id} style={blockStyle(block)}>
                <BlockContent
                  block={block}
                  merchant={merchant}
                  onAction={act}
                />
              </section>
            );
            return renderBlock ? (
              renderBlock(block, content)
            ) : (
              <div key={block.id}>{content}</div>
            );
          })}
        {handoff && (
          <section
            className="lab-handoff"
            tabIndex={-1}
            aria-label="Source handoff"
          >
            <h3>Continue at the source</h3>
            <p>Check current availability and restrictions on SimplyCodes.</p>
            <a
              className="lab-action"
              href={r.destination}
              target="_blank"
              rel="noreferrer"
            >
              Continue to SimplyCodes ↗
            </a>
            <button
              className="lab-secondary"
              data-lab-return
              onClick={() => setHandoff(false)}
            >
              Return to the design
            </button>
          </section>
        )}
      </div>
    </article>
  );
}
export function blockFromElement(el: Element): BlockType | undefined {
  return el.closest("[data-block-id]")?.getAttribute("data-block-id") as
    BlockType | undefined;
}
