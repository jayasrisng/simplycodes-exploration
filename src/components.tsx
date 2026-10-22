import type { ReactNode } from "react";
import { ShieldCheck, ChevronRight, Copy, Check } from "lucide-react";
import { money, totals, type Offer } from "./engine";
export function VerificationBadge({ state }: { state: string }) {
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
      <ShieldCheck size={12} />
      {state}
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
      <div className="pane today">
        <div className="pane-label">
          <span className="dot" /> TODAY <span>Evidence to interpret</span>
        </div>
        {left}
      </div>
      <div className="pane proposal">
        <div className="pane-label">
          <span className="dot" /> MY PROPOSAL <span>A decision to act on</span>
        </div>
        {right}
      </div>
    </div>
  );
}
export function CouponCard({
  offer: o,
  selected,
  interactive = true,
  onSelect,
  onEvidence,
}: {
  offer: Offer;
  selected: boolean;
  interactive?: boolean;
  onSelect: (o: Offer) => void;
  onEvidence: (o: Offer) => void;
}) {
  return (
    <article className="coupon">
      <div className="coupon-percent">
        {o.percent}%<small>OFF</small>
      </div>
      <div className="coupon-info">
        <VerificationBadge state={o.verified ? "VERIFIED" : "UNVERIFIED"} />
        <h4>{o.title}</h4>
        <p>
          {o.minimum ? `Orders $${o.minimum}+ · ` : ""}
          {o.newOnly
            ? "New customers"
            : o.student
              ? "Student eligibility required"
              : o.fullPrice
                ? "Full-price items only"
                : "See conditions"}
        </p>
        <p className="fixture-activity">
          Fixture evidence: {o.passes}/{o.tests} test cases ·{" "}
          {o.tested.slice(5, 10)} UTC
        </p>
        <button className="text-button" onClick={() => onEvidence(o)}>
          Inspect evidence <ChevronRight size={13} />
        </button>
      </div>
      {interactive && (
        <button
          className={"code-button " + (selected ? "chosen" : "")}
          onClick={() => onSelect(o)}
          aria-label={"Select " + o.code}
        >
          {o.code}
          {selected ? <Check size={13} /> : <Copy size={13} />}
        </button>
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
    <div className="receipt-block">
      <dl className="receipt">
        <div>
          <dt>Subtotal</dt>
          <dd>{money(t.subtotal)}</dd>
        </div>
        <div className={percent ? "discount" : ""}>
          <dt>Eligible discount</dt>
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
      <small className="receipt-note">
        USD · tax not modeled · fictional checkout
      </small>
    </div>
  );
}
