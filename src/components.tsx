import type { ReactNode } from "react";
import { ShieldCheck, ChevronRight, Copy, Check } from "lucide-react";
import { money, totals, type Offer, type VerificationState } from "./engine";
export function VerificationBadge({ state }: { state: VerificationState }) {
  return (
    <span
      className={
        "badge " +
        (state === "VERIFIED"
          ? "good"
          : state === "INELIGIBLE"
            ? "bad"
            : "neutral")
      }
    >
      <ShieldCheck size={13} />
      {state === "CONDITIONALLY APPLICABLE" ? "ELIGIBILITY NEEDED" : state}
    </span>
  );
}
export function Comparison({
  view,
  left,
  right,
}: {
  view: string;
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className={"comparison show-" + view}>
      <div className="pane existing">{left}</div>
      <div className="pane proposal">{right}</div>
    </div>
  );
}
export function conditions(o: Offer) {
  return (
    [
      o.minimum ? `$${o.minimum}+` : null,
      o.newOnly ? "New customers" : null,
      o.student ? "Eligible students" : null,
      o.category || null,
      o.fullPrice ? "Full-price only" : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Selected styles; terms unconfirmed"
  );
}
export function CouponCard({
  offer: o,
  selected,
  onSelect,
  onEvidence,
  cartState,
}: {
  offer: Offer;
  selected: boolean;
  onSelect: (o: Offer) => void;
  onEvidence: (o: Offer) => void;
  cartState?: VerificationState;
}) {
  return (
    <article className="coupon">
      <div className="coupon-top">
        <strong>
          {o.percent}% <span>off</span>
        </strong>
        <VerificationBadge state={o.verified ? "VERIFIED" : "UNVERIFIED"} />
      </div>
      <h3>{o.title}</h3>
      <p>{conditions(o)}</p>
      <div className="coupon-bottom">
        <button className="text-button" onClick={() => onEvidence(o)}>
          Evidence <ChevronRight size={14} />
        </button>
        <button
          className={"code-button " + (selected ? "chosen" : "")}
          aria-label={"Select " + o.code}
          aria-pressed={selected}
          onClick={() => onSelect(o)}
        >
          <code>{o.code}</code>
          {selected ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      {cartState && (
        <div className="cart-status">
          <span>Your cart</span>
          <VerificationBadge state={cartState} />
        </div>
      )}
    </article>
  );
}
export function Receipt({
  amount,
  percent = 0,
}: {
  amount: number;
  percent?: number;
}) {
  const t = totals(amount, percent);
  return (
    <dl className="receipt">
      <div>
        <dt>Subtotal</dt>
        <dd>{money(t.subtotal)}</dd>
      </div>
      <div className={percent ? "discount" : ""}>
        <dt>Discount</dt>
        <dd>−{money(t.discount)}</dd>
      </div>
      <div>
        <dt>Shipping</dt>
        <dd>{t.shipping ? money(t.shipping) : "Free"}</dd>
      </div>
      <div className="total">
        <dt>Payable total</dt>
        <dd>{money(t.total)}</dd>
      </div>
    </dl>
  );
}
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="empty-state">
      <ShieldCheck size={25} />
      {children}
    </div>
  );
}
