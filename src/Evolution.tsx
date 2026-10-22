import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  Search,
  ShieldCheck,
  Check,
  ArrowRight,
  LockKeyhole,
} from "lucide-react";
import { money, totals, type Cart, type Offer } from "./engine";
const stages = [
  {
    name: "Find",
    description: "Discover coupons.",
    detail: "Start with the shopping habit people already know.",
  },
  {
    name: "Verify",
    description: "Establish whether they work.",
    detail: "Replace a promotional claim with a dated verification record.",
  },
  {
    name: "Decide",
    description: "Identify relevant savings.",
    detail: "Connect the evidence to this shopper’s cart and eligibility.",
  },
  {
    name: "Assist",
    description: "Help complete the purchase.",
    detail:
      "Make restrictions, application and recovery part of one clear flow.",
  },
  {
    name: "Act",
    description: "Execute approved actions.",
    detail:
      "Ask for explicit permission. Keep the scope visible and reversible.",
  },
];
export function Evolution({
  cart,
  best,
  onEvidence,
  onExplore,
}: {
  cart: Cart;
  best?: Offer;
  onEvidence: (o: Offer) => void;
  onExplore: () => void;
}) {
  const [stage, setStage] = useState(0),
    [approved, setApproved] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  useEffect(() => setApproved(false), [cart]);
  useEffect(() => {
    const item = rail.current?.children[stage] as HTMLElement | undefined;
    if (rail.current && item)
      rail.current.scrollTo({
        left:
          item.offsetLeft -
          rail.current.offsetLeft -
          rail.current.clientWidth / 2 +
          item.clientWidth / 2,
        behavior: "instant",
      });
  }, [stage]);
  const select = (i: number, focus = false) => {
    setStage(i);
    if (focus) (rail.current?.children[i] as HTMLElement)?.focus();
  };
  const keys = (e: KeyboardEvent<HTMLButtonElement>) => {
    let next = stage;
    if (e.key === "ArrowRight") next = (stage + 1) % 5;
    else if (e.key === "ArrowLeft") next = (stage + 4) % 5;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 4;
    else return;
    e.preventDefault();
    select(next, true);
  };
  const t = totals(cart.amount, best?.percent);
  return (
    <div className="evolution overview-surface">
      <div className="evolution-intro">
        <span className="overline">FROM HELPFUL TO TRUSTED</span>
        <p>Select a step to see how AI earns permission to do more.</p>
      </div>
      <div
        className="evolution-rail"
        ref={rail}
        role="tablist"
        aria-label="Shopping evolution"
      >
        {stages.map((s, i) => (
          <button
            key={s.name}
            id={"stage-tab-" + i}
            role="tab"
            aria-selected={stage === i}
            aria-controls="stage-panel"
            tabIndex={stage === i ? 0 : -1}
            onClick={() => select(i)}
            onKeyDown={keys}
          >
            <span className="stage-number">0{i + 1}</span>
            <b>{s.name.toUpperCase()}</b>
            {i < 4 && <ArrowRight size={16} />}
          </button>
        ))}
      </div>
      <div
        className="evolution-detail"
        id="stage-panel"
        role="tabpanel"
        aria-labelledby={"stage-tab-" + stage}
        tabIndex={0}
      >
        <div className="stage-explanation">
          <span className="overline">{stages[stage].name}</span>
          <h3>{stages[stage].description}</h3>
          <p>{stages[stage].detail}</p>
        </div>
        <div className="stage-example">
          {stage === 0 ? (
            <>
              <div className="mini-query">
                <Search size={17} />
                {cart.merchant} coupon codes
              </div>
              <div className="mini-result">
                <ShieldCheck size={19} />
                <div>
                  <b>A saving worth checking.</b>
                  <p>Merchant, offer, verification.</p>
                </div>
              </div>
              <button className="text-button" onClick={() => select(1)}>
                Follow the evidence <ArrowRight size={14} />
              </button>
            </>
          ) : stage === 1 ? (
            <>
              <div className="mini-result">
                <ShieldCheck size={22} />
                <div>
                  <b>
                    {best
                      ? `${best.code} · supported check`
                      : "No verified code for this cart"}
                  </b>
                  <p>
                    {best
                      ? `Checked ${new Date(best!.tested).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })} · conditions attached`
                      : "A clear no is useful information."}
                  </p>
                </div>
              </div>
              {best && (
                <button className="outline" onClick={() => onEvidence(best)}>
                  Inspect verification <ArrowRight size={14} />
                </button>
              )}
            </>
          ) : stage === 2 ? (
            <>
              <div className="mini-saving">
                {money(t.discount)}
                <span>potential saving</span>
              </div>
              <p>
                {best
                  ? `${best.code} · matched to the stated cart conditions.`
                  : "No eligible verified offer. Try another saving path."}
              </p>
              <div className="mini-detail">
                {money(cart.amount)} cart · {cart.customer} customer
              </div>
            </>
          ) : stage === 3 ? (
            <>
              <div className="mini-receipt">
                <span>Cart</span>
                <b>{money(cart.amount)}</b>
                <span>Eligible saving</span>
                <b>−{money(t.discount)}</b>
                <span>Payable total</span>
                <b>{money(t.total)}</b>
              </div>
              <span className="mini-detail">
                Clear outcome. Honest recovery if a code fails.
              </span>
            </>
          ) : (
            <>
              <div className="mini-result">
                <LockKeyhole size={22} />
                <div>
                  <b>
                    {best
                      ? `Prepare ${best.code} for this cart?`
                      : "Prepare a merchant savings link?"}
                  </b>
                  <p>Only this action. No order or payment.</p>
                </div>
              </div>
              <button
                className={approved ? "outline full" : "primary full"}
                onClick={() => setApproved(!approved)}
              >
                {approved ? (
                  <>
                    <Check size={15} />
                    Approved locally · undo
                  </>
                ) : (
                  <>
                    Approve this action <ArrowRight size={15} />
                  </>
                )}
              </button>
              <p className="approval-status" role="status">
                {approved
                  ? "Permission granted for this example only. No external action executed."
                  : "The shopper stays in control."}
              </p>
            </>
          )}
        </div>
      </div>
      <div className="vision-story">
        <span className="overline">THE BIGGER PICTURE</span>
        <h2>Before AI can shop for you, it has to earn your trust.</h2>
        <div className="vision-copy">
          <p>People don't come to SimplyCodes to understand coupon verification. They come to save money.</p>
          <p>
            My approach starts there: make the best eligible saving obvious,
            remove unnecessary decisions, and keep the evidence one click away.
            The goal is to turn more visitors into shoppers who successfully complete purchases.
          </p>
          <p>But I see a bigger opportunity.</p>
          <p>
            Snapchat made AR familiar through playful filters before introducing products
            like Specs. It didn't ask people to understand the technology first.
            It made them comfortable using it.
          </p>
          <p>I see a similar path for SimplyCodes and Product.ai.</p>
          <p>
            First, shoppers trust AI to find a code. Then to verify it. Then to choose
            the best option. Eventually, they trust it to complete a purchase within
            boundaries they've approved.
          </p>
          <p className="vision-thesis">
            <strong>SimplyCodes earns trust in the recommendation. Product.ai can extend that trust into action.</strong>
          </p>
          <p>That's the transition I'd love to help build.</p>
        </div>
        <button className="outline vision-back" onClick={onExplore}>
          Back to the shopping comparison <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
