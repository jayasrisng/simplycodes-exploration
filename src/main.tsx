import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  Check,
  CheckCheck,
  ShieldCheck,
  SlidersHorizontal,
  ChevronRight,
  Plus,
  Minus,
  X,
  RotateCcw,
  LockKeyhole,
  Code2,
  Search,
  ShoppingBag,
  Info,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  initialCart,
  offers,
  evaluate,
  recommend,
  totals,
  money,
  contribution,
  attempt,
  type Cart,
  type Offer,
} from "./engine";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/600.css";
import tokens from "./tokens.json";
import "./style.css";
import {
  VerificationBadge,
  Comparison,
  CouponCard,
  Receipt,
} from "./components";
Object.entries(tokens.color).forEach(([key, value]) =>
  document.documentElement.style.setProperty("--color-" + key, value),
);
Object.entries(tokens.radius).forEach(([key, value]) =>
  document.documentElement.style.setProperty("--radius-" + key, value),
);
document.documentElement.style.setProperty("--font-body", tokens.type.body);
document.documentElement.style.setProperty(
  "--font-merchant",
  tokens.type.merchant,
);
const chapters = [
  "The idea",
  "Finding a code",
  "Your cart, your code",
  "Trust, at a glance",
  "Privacy in context",
  "Coupon to checkout",
  "An agent is shopping",
  "The revenue hypothesis",
  "How I would build it",
];
const sources = [
  ["SimplyCodes", "https://simplycodes.com/"],
  ["Nike merchant page", "https://simplycodes.com/store/nike.com"],
  ["Vistaprint merchant page", "https://simplycodes.com/store/vistaprint.com"],
  ["Privacy", "https://simplycodes.com/privacy"],
  ["How it works", "https://simplycodes.com/how-it-works"],
  ["Extension", "https://simplycodes.com/extension"],
  ["How it makes money", "https://simplycodes.com/how-we-make-money"],
  ["Product.ai design engineer", "https://product.ai/join/design-engineer/"],
  ["Product.ai MCP & API status", "https://product.ai/developers/"],
  ["Capital One Shopping", "https://capitaloneshopping.com/"],
  ["PayPal Honey", "https://www.joinhoney.com/"],
  ["Rakuten", "https://www.rakuten.com/"],
  ["Groupon", "https://www.groupon.com/"],
  ["inKind", "https://inkind.com/"],
];
function App() {
  const [active, setActive] = useState(0),
    [mobile, setMobile] = useState("proposal"),
    [cart, setCart] = useState<Cart>(initialCart),
    [drawer, setDrawer] = useState<Offer | null>(null),
    [sourceOpen, setSourceOpen] = useState(false),
    [sharing, setSharing] = useState(false),
    [permission, setPermission] = useState(false),
    [selected, setSelected] = useState("welcome"),
    [leftResult, setLeftResult] = useState(""),
    [rightResult, setRightResult] = useState(""),
    [failure, setFailure] = useState(false),
    [sessions, setSessions] = useState(100000),
    [baseline, setBaseline] = useState(12),
    [lift, setLift] = useState(2),
    [completion, setCompletion] = useState(65),
    [commission, setCommission] = useState(4),
    [sample, setSample] = useState("empty"),
    [complete, setComplete] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    sourceDialog = useRef<HTMLDialogElement>(null);
  const best = recommend(cart),
    current = offers.find((o) => o.id === selected)!,
    price = totals(cart.amount, rightResult === "applied" ? best?.percent : 0),
    monthly = contribution(sessions, lift, completion, commission);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting)
            setActive(Number((e.target as HTMLElement).dataset.chapter));
      },
      { rootMargin: "-25% 0px -55% 0px" },
    );
    document
      .querySelectorAll("[data-chapter]")
      .forEach((e) => observer.observe(e));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    setLeftResult("");
    setRightResult("");
    setComplete(false);
  }, [cart, failure]);
  useEffect(() => {
    if (drawer) dialog.current?.showModal();
    else dialog.current?.close();
  }, [drawer]);
  useEffect(() => {
    if (sourceOpen) sourceDialog.current?.showModal();
    else sourceDialog.current?.close();
  }, [sourceOpen]);
  const jump = (i: number) => {
    setActive(i);
    document.getElementById("chapter-" + i)?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  const update = (patch: Partial<Cart>) => setCart((c) => ({ ...c, ...patch }));
  const badge = (text: string) => <VerificationBadge state={text} />;
  const pair = (left: React.ReactNode, right: React.ReactNode) => (
    <Comparison view={mobile} left={left} right={right} />
  );
  const card = (o: Offer, interactive = true) => (
    <CouponCard
      key={o.id}
      offer={o}
      selected={selected === o.id}
      interactive={interactive}
      onEvidence={setDrawer}
      onSelect={async (offer) => {
        setSelected(offer.id);
        setLeftResult("");
        try {
          await navigator.clipboard.writeText(offer.code);
          setLeftResult("copied");
        } catch {
          setLeftResult("selected");
        }
      }}
    />
  );
  const recommendation = () =>
    best ? (
      <div className="decision" key={best.id}>
        <div className="decision-top">
          {badge("VERIFIED")}
          <span>Illustrative rules result</span>
        </div>
        <div className="saving">
          {money(totals(cart.amount, best.percent).discount)}
          <span>potential saving</span>
        </div>
        <h3>{best.percent}% off. Matched to your cart.</h3>
        <p>
          {best.title}. Minimum {money(best.minimum)}.
          {best.fullPrice ? " Full-price items only." : ""} Final acceptance
          remains the merchant’s decision.
        </p>
        <div className="recommend-code">
          <code>{best.code}</code>
          <button onClick={() => setDrawer(best)}>
            Why this code? <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="decision-foot">
          <CheckCheck size={16} /> Best eligible offer in this fixture set
        </div>
      </div>
    ) : (
      <div className="decision">
        <ShieldCheck size={28} />
        <h3>No verified code for this cart.</h3>
        <p>
          We won’t turn historical activity into a promise. Check the merchant’s
          sale, membership benefits, or adjust your cart.
        </p>
        <a
          href={
            cart.merchant === "Nike"
              ? "https://www.nike.com/w/sale-3yaep"
              : "https://www.vistaprint.com/"
          }
          target="_blank"
          rel="noreferrer"
        >
          Explore {cart.merchant === "Nike" ? "Nike’s sale" : "Vistaprint"}{" "}
          <ArrowUpRight size={14} />
        </a>
      </div>
    );
  const heading = (n: number, kicker: string, title: string, body: string) => (
    <div className="chapter-heading">
      <div className="eyebrow">
        {String(n + 1).padStart(2, "0")} / {kicker}
      </div>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
  const merchantSwitch = (
    <div className="merchant-switch" role="group" aria-label="Merchant">
      {(["Vistaprint", "Nike"] as const).map((m) => (
        <button
          key={m}
          aria-label={m}
          className={cart.merchant === m ? "selected" : ""}
          onClick={() =>
            update({
              merchant: m,
              category: m === "Nike" ? "Shoes" : "Business cards",
            })
          }
        >
          {m === "Nike" ? (
            <span className="nike">✓</span>
          ) : (
            <span className="vp">V</span>
          )}
          {m}
          {cart.merchant === m && <Check size={14} />}
        </button>
      ))}
    </div>
  );
  return (
    <>
      <a className="skip" href="#chapter-1">
        Skip to interactive comparison
      </a>
      <header>
        <a className="wordmark" href="#chapter-0">
          SimplyCodes
        </a>
        <span className="header-caption">
          INDEPENDENT EXPLORATION · NOT AFFILIATED
        </span>
        <button className="header-credit" onClick={() => jump(8)}>
          Jayasri Guthula <ArrowUpRight size={15} />
        </button>
      </header>
      <div className="app-shell">
        <aside>
          <div className="aside-heading">
            FROM VERIFICATION
            <br />
            TO DECISION
          </div>
          <nav aria-label="Chapters">
            {chapters.map((c, i) => (
              <button
                key={c}
                onClick={() => jump(i)}
                aria-current={active === i ? "step" : undefined}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                {c}
                {active === i && <span className="active-marker" />}
              </button>
            ))}
          </nav>
          <div className="aside-bottom">
            <span className="small-label">THE QUESTION</span>
            <p>
              What if trust felt
              <br />
              effortless?
            </p>
            <button className="text-button" onClick={() => setSourceOpen(true)}>
              Research & sources <ArrowUpRight size={13} />
            </button>
            <div className="progress">
              <i style={{ width: `${((active + 1) / 9) * 100}%` }} />
            </div>
            <span className="small-label">
              {String(active + 1).padStart(2, "0")} OF 09 CHAPTERS
            </span>
          </div>
        </aside>
        <main>
          <section id="chapter-0" data-chapter="0" className="hero">
            <div className="eyebrow">
              <span className="tiny-star">✳</span> LESS READING. MORE SAVING.
            </div>
            <h1>
              From verification
              <br />
              to <em>decision.</em>
            </h1>
            <p className="hero-statement">
              People come to save money.
              <br />
              Not to study how coupons work.
            </p>
            <p className="hero-description">
              SimplyCodes has built the intelligence to verify coupons.
              <br className="desktop-break" /> My question: make the right
              decision as clear as the evidence behind it.
            </p>
            <div className="hero-actions">
              <button className="primary" onClick={() => jump(1)}>
                Explore the thinking <ArrowDown size={16} />
              </button>
              <span>9 chapters. One better shopping decision.</span>
            </div>
            <div className="hero-comparison">
              <div className="mini-today">
                <div className="eyebrow">TODAY</div>
                <div className="mini-coupon">
                  <span>
                    40%<small>OFF</small>
                  </span>
                  <div>
                    <b>A bigger discount.</b>
                    <p>But is it right for me?</p>
                    <i />
                    <i />
                  </div>
                  <Search size={18} />
                </div>
                <div className="mini-meta">Verified codes. More decisions.</div>
              </div>
              <span className="bridge-arrow">
                <ArrowRight size={18} />
              </span>
              <div className="mini-proposal">
                <div className="eyebrow">MY PROPOSAL</div>
                <div className="mini-verdict">
                  <span className="check-circle">
                    <Check size={20} />
                  </span>
                  <div>
                    <b>The right saving for your cart.</b>
                    <p>Eligible. Explained. Ready to try.</p>
                  </div>
                </div>
                <div className="mini-meta">
                  <ShieldCheck size={13} /> Same intelligence. A clearer next
                  step.
                </div>
              </div>
            </div>
            <div className="hero-footer">
              <span>
                INDEPENDENT EXPLORATION · NOT AFFILIATED WITH SIMPLYCODES
              </span>
              <button onClick={() => jump(1)}>
                Scroll to compare <ArrowDown size={13} />
              </button>
            </div>
          </section>
          <div
            className="mobile-tabs"
            role="group"
            aria-label="Comparison view"
          >
            <button
              aria-pressed={mobile === "today"}
              onClick={() => setMobile("today")}
            >
              Today
            </button>
            <button
              aria-pressed={mobile === "proposal"}
              onClick={() => setMobile("proposal")}
            >
              My proposal
            </button>
          </div>
          <section id="chapter-1" data-chapter="1">
            {heading(
              1,
              "FINDING A CODE",
              "Start with an answer.",
              "The same merchant. The same evidence. A different amount of work for the shopper.",
            )}
            {merchantSwitch}
            <p className="source-observation">
              Observed public pages: Nike’s main count had no verified codes;
              Vistaprint showed 20. Both already provide savings alternatives
              and expandable activity.{" "}
              <button
                className="text-button"
                onClick={() => setSourceOpen(true)}
              >
                Sources ↗
              </button>
            </p>
            <p className="fixture-note">
              Interactive offers below are illustrative fixtures, not current
              merchant promotions. Public observations: October 21, 2026. Open
              research notes for sources.
            </p>
            {pair(
              <>
                <div className="merchant-heading">
                  <span className="merchant-icon">
                    {cart.merchant === "Nike" ? "✓" : "V"}
                  </span>
                  <div>
                    <h3>{cart.merchant} coupon codes</h3>
                    <p>Offers, restrictions & verification activity</p>
                  </div>
                </div>
                <div className="listing-summary">
                  <b>
                    {cart.merchant === "Nike"
                      ? "0 verified codes*"
                      : "20 verified codes*"}
                  </b>
                  <span>*Observed public main count</span>
                </div>
                {offers
                  .filter((o) => o.merchant === cart.merchant)
                  .slice(0, 3)
                  .map((o) => card(o))}
                <p className="small-copy">
                  Observed: verified badges, last-used times, restrictions and
                  expandable activity. This working list uses fixtures; public
                  counts change.
                </p>
              </>,
              <>
                <div className="opportunity">
                  <span className="small-label">A SMALLER DECISION</span>
                  <h3>
                    {cart.merchant === "Nike"
                      ? "Honesty is a useful answer."
                      : "Don’t make me compare everything."}
                  </h3>
                  <p>
                    {cart.merchant === "Nike"
                      ? "No verified offer should mean a clear next step, not a dead end."
                      : "Lead with the strongest supported match, then let me inspect the rest."}
                  </p>
                </div>
                {recommendation()}
                <div className="insight">
                  <Info size={16} />
                  <p>
                    Verified for a merchant does not automatically mean eligible
                    for your cart.
                  </p>
                </div>
              </>,
            )}
          </section>
          <section id="chapter-2" data-chapter="2">
            {heading(
              2,
              "THE RIGHT CODE FOR MY CART",
              "The biggest number isn’t always the best saving.",
              "Change the conditions. Watch the recommendation earn its place.",
            )}
            <div className="cart-controls">
              <div className="control-heading">
                <SlidersHorizontal size={17} />
                <b>Your shopping conditions</b>
                <span>Local, illustrative cart</span>
              </div>
              <div className="control-grid">
                <label>
                  Cart amount <strong>{money(cart.amount)}</strong>
                  <input
                    aria-label="Cart amount"
                    type="range"
                    min="20"
                    max="300"
                    step="5"
                    value={cart.amount}
                    onChange={(e) => update({ amount: +e.target.value })}
                  />
                </label>
                <label>
                  Product category
                  <select
                    value={cart.category}
                    onChange={(e) =>
                      update({ category: e.target.value as Cart["category"] })
                    }
                  >
                    <option>Business cards</option>
                    <option>Shoes</option>
                    <option>Apparel</option>
                  </select>
                </label>
                <label>
                  Customer
                  <select
                    value={cart.customer}
                    onChange={(e) =>
                      update({ customer: e.target.value as Cart["customer"] })
                    }
                  >
                    <option value="returning">Returning customer</option>
                    <option value="new">New customer</option>
                  </select>
                </label>
                <label>
                  Student eligibility
                  <select
                    value={cart.student}
                    onChange={(e) =>
                      update({ student: e.target.value as Cart["student"] })
                    }
                  >
                    <option value="unknown">I haven’t answered</option>
                    <option value="yes">Eligible student</option>
                    <option value="no">Not eligible</option>
                  </select>
                </label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={cart.sale}
                    onChange={(e) => update({ sale: e.target.checked })}
                  />{" "}
                  My cart includes sale items
                </label>
              </div>
            </div>
            {pair(
              <>
                <h3>Sort by discount. Read the fine print.</h3>
                {offers
                  .filter((o) => o.merchant === cart.merchant)
                  .sort((a, b) => b.percent - a.percent)
                  .map((o) => (
                    <div key={o.id}>
                      {card(o)}
                      <div className="state-line">
                        Cart check: {badge(evaluate(o, cart))}
                      </div>
                    </div>
                  ))}
              </>,
              <>
                {recommendation()}
                {cart.merchant === "Vistaprint" &&
                  cart.student === "unknown" && (
                    <div className="question">
                      <span className="small-label">
                        ONE QUESTION COULD IMPROVE THIS
                      </span>
                      <h4>Are you an eligible student?</h4>
                      <p>
                        The 30% offer needs an answer before it can be
                        recommended.
                      </p>
                      <div className="button-row">
                        <button onClick={() => update({ student: "yes" })}>
                          Yes, eligible
                        </button>
                        <button onClick={() => update({ student: "no" })}>
                          No
                        </button>
                      </div>
                      {badge("CONDITIONALLY APPLICABLE")}
                    </div>
                  )}
                <div className="summary">
                  <span>Estimated subtotal after discount</span>
                  <strong>
                    {money(
                      totals(cart.amount, best?.percent).subtotal -
                        totals(cart.amount, best?.percent).discount,
                    )}
                  </strong>
                  <small>Shipping shown at checkout. Tax not modeled.</small>
                </div>
              </>,
            )}
          </section>
          <section id="chapter-3" data-chapter="3">
            {heading(
              3,
              "TRUST WITHOUT THE RESEARCH PAPER",
              "A verdict first. The evidence, always.",
              "Transparency works best when people can choose how deep to go.",
            )}
            {pair(
              <div className="report">
                <span className="small-label">
                  OBSERVED PUBLIC TRUST PATTERNS
                </span>
                <h3>Health Score. Activity. Proof.</h3>
                <p>
                  SimplyCodes’ methodology already describes automated tests,
                  human consensus and fleet signals, synthesized into Health
                  Scores and machine-readable Proof Packets. The merchant pages
                  expose verification activity and code conditions.
                </p>
                {[
                  "Verification activity",
                  "Restrictions & exclusions",
                  "Checkout and community signals",
                ].map((t) => (
                  <details key={t}>
                    <summary>{t}</summary>
                    <p>
                      Illustrative supporting evidence appears in the full
                      report. No live checkout was tested.
                    </p>
                  </details>
                ))}
                <p className="small-copy">
                  Source: /how-it-works, observed Oct 21, 2026. This hierarchy
                  is an approximation; no live score is reproduced.
                </p>
              </div>,
              <div className="trust-stack">
                <div className="trust-level">
                  <span>01</span>
                  <div>
                    <h3>
                      {best
                        ? "A supported match for these conditions."
                        : "No supported match for these conditions."}
                    </h3>
                    <p>The answer, before the research.</p>
                  </div>
                  <ShieldCheck />
                </div>
                <details open>
                  <summary>Why this recommendation?</summary>
                  <p>
                    {best
                      ? `${best.code}: ${best.percent}% off, minimum ${money(best.minimum)}. Fixture verification: ${new Date(best.tested).toLocaleDateString("en-US", { timeZone: "UTC" })}.`
                      : "No fixture offer meets both verification and cart requirements."}
                  </p>
                  <p>
                    Evidence applies to fixture test carts. A merchant may
                    reject a different cart.
                  </p>
                </details>
                <button
                  className="outline full"
                  onClick={() => setDrawer(best || offers[4])}
                >
                  Open complete evidence <ArrowUpRight size={16} />
                </button>
              </div>,
            )}
          </section>
          <section id="chapter-4" data-chapter="4">
            {heading(
              4,
              "PRIVACY AT THE MOMENT IT MATTERS",
              "Permission should come with understanding.",
              "Put the explanation beside the moment a shopper is asked to share.",
            )}
            {pair(
              <div className="report">
                <LockKeyhole />
                <h3>A policy is the foundation.</h3>
                <p>
                  The published privacy page says the extension activates at
                  checkout, avoids browsing-history tracking and personal
                  profiling, and does not sell data. It explains merchant
                  commissions and keeps commission out of code ranking.
                </p>
                <a
                  href="https://simplycodes.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                >
                  Read the published privacy policy <ExternalLink size={14} />
                </a>
                <p className="small-copy">
                  The plain-language page defers to its formal legal documents.
                  A precise retention period is not stated in the inspected
                  page. These are published commitments, not an audit of the
                  extension.
                </p>
              </div>,
              <div className="privacy-card">
                <span className="small-label">
                  PROPOSED CONTEXTUAL DISCLOSURE · LEGAL REVIEW NEEDED
                </span>
                <h3>Your cart helps find a fit.</h3>
                <p>
                  This exploration uses cart amount, item type and eligibility
                  answers to compare fixture offers in your browser. It sends
                  none of these inputs to a server.
                </p>
                <div className="privacy-facts">
                  <p>
                    <b>Needed</b> Cart conditions, to check restrictions.
                  </p>
                  <p>
                    <b>Retained here</b> Only in memory; reset on refresh.
                  </p>
                  <p>
                    <b>Real extension</b> Published page: checkout activation
                    and code-outcome collection. Exact retention is not
                    specified there.
                  </p>
                  <p>
                    <b>Business model</b> SimplyCodes says it earns merchant
                    commission after purchases through its links; commission is
                    excluded from ranking.
                  </p>
                </div>
                <button
                  className="toggle-row"
                  role="switch"
                  aria-checked={permission}
                  onClick={() => setPermission(!permission)}
                >
                  <span>
                    Allow cart matching <small>Local interaction only</small>
                  </span>
                  <i className={permission ? "on" : ""} />
                </button>
                <button
                  className="toggle-row"
                  role="switch"
                  aria-checked={sharing}
                  onClick={() => setSharing(!sharing)}
                >
                  <span>
                    Optional feedback sharing{" "}
                    <small>
                      {sharing ? "Selected; no data is sent" : "Off by default"}
                    </small>
                  </span>
                  <i className={sharing ? "on" : ""} />
                </button>
                <a
                  href="https://simplycodes.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                >
                  Read full policy <ArrowUpRight size={14} />
                </a>
              </div>,
            )}
          </section>
          <section id="chapter-5" data-chapter="5">
            {heading(
              5,
              "FROM COUPON TO CHECKOUT",
              "Less trial. More progress.",
              "SimplyCodes already advertises automatic testing and best-code application. This proposal extends that clarity across discovery, eligibility and failure recovery.",
            )}
            <label className="failure-control">
              <input
                type="checkbox"
                checked={failure}
                onChange={(e) => setFailure(e.target.checked)}
              />{" "}
              Test a merchant rejection, even for an eligible code
            </label>
            {pair(
              <div className="checkout">
                <span className="small-label">
                  CONVENTIONAL MANUAL PATH · ILLUSTRATIVE
                </span>
                <h3>Choose. Copy. Try. Repeat.</h3>
                <label>
                  Coupon to try
                  <select
                    value={selected}
                    onChange={(e) => {
                      setSelected(e.target.value);
                      setLeftResult("");
                    }}
                  >
                    {offers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.code} · {o.percent}% off
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="outline full"
                  onClick={() => setLeftResult(attempt(current, cart, failure))}
                >
                  Try {current.code} <ArrowRight size={15} />
                </button>
                <div role="status" className={"checkout-message " + leftResult}>
                  {leftResult === "applied"
                    ? "Code accepted for this fixture cart."
                    : leftResult === "rejected"
                      ? "Code rejected. Inspect the conditions and choose another."
                      : leftResult === "copied"
                        ? "Code copied. Ready to try at this fictional checkout."
                        : "Your code has not been tried."}
                </div>
                <Receipt
                  amount={cart.amount}
                  percent={leftResult === "applied" ? current.percent : 0}
                />
              </div>,
              <div className="checkout">
                <span className="small-label">THE ASSISTED PATH</span>
                <h3>
                  {best
                    ? `${best.code} fits your stated conditions.`
                    : "No supported offer to apply."}
                </h3>
                <p>
                  {best
                    ? `${best.percent}% off · ${best.title} · minimum ${money(best.minimum)}.`
                    : "Continue without a code or adjust the cart in chapter 03."}
                </p>
                <button
                  className="primary full"
                  disabled={!best || rightResult === "applied"}
                  onClick={() => setRightResult(attempt(best!, cart, failure))}
                >
                  {rightResult === "applied" ? (
                    <>
                      <Check size={16} /> Offer applied
                    </>
                  ) : (
                    <>
                      Apply eligible offer <ArrowRight size={15} />
                    </>
                  )}
                </button>
                <div
                  role="status"
                  className={"checkout-message " + rightResult}
                >
                  {rightResult === "rejected"
                    ? "The merchant rejected this attempt. No discount has been counted. Continue at the original price or change conditions."
                    : rightResult === "applied"
                      ? `Saved ${money(price.discount)} in this fictional checkout.`
                      : "A match is a reason to try, never a guarantee."}
                </div>
                <Receipt
                  amount={cart.amount}
                  percent={rightResult === "applied" ? best?.percent : 0}
                />
                <button
                  className="outline full"
                  onClick={() => setComplete(true)}
                >
                  Review final payable <ArrowRight size={14} />
                </button>
                {complete && (
                  <div className="checkout-message applied" role="status">
                    Final payable: {money(price.total)}. You’ve reached the end
                    of this fictional checkout. No order or payment is created.
                  </div>
                )}
                <button
                  className="text-button"
                  onClick={() => {
                    setRightResult("");
                    setLeftResult("");
                    setComplete(false);
                  }}
                >
                  <RotateCcw size={13} /> Reset checkout
                </button>
              </div>,
            )}
          </section>
          <section id="chapter-6" data-chapter="6">
            {heading(
              6,
              "WHAT IF AN AGENT IS SHOPPING?",
              "Same truth. A different reader.",
              "“Find me Nike shoes and the best available discount.”",
            )}
            {pair(
              <div className="agent">
                <div className="chat-bubble">
                  <Search size={15} /> Nike · best discount
                </div>
                <h3>Headlines aren’t enough.</h3>
                <p>
                  A promotional percentage and historical usage don’t establish
                  current validity, cart eligibility or checkout acceptance.
                </p>
                <div className="agent-warning">
                  I can’t responsibly call EXTRA50 a verified saving.
                </div>
              </div>,
              <div className="agent">
                <span className="small-label">ACTIONABLE VERIFICATION</span>
                <h3>“I found no verified Nike code in this fixture set.”</h3>
                <p>
                  “I can show Nike’s current sale page, but I can’t promise a
                  discount on the shoes you choose.”
                </p>
                <details>
                  <summary>
                    <Code2 size={15} /> Inspect structured result
                  </summary>
                  <pre>
                    {JSON.stringify(
                      {
                        merchant: "nike.com",
                        source: "illustrative_fixture",
                        verification: "NO VERIFIED CODE",
                        cartEligibility: "unknown",
                        checkoutTested: false,
                        missing: ["specific product", "current merchant terms"],
                        nextAction: "inspect_merchant_sale",
                        guaranteedSaving: null,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </details>
                <p className="small-copy">
                  Structured Proof Packets are existing SimplyCodes work.
                  Product.ai’s public developer page currently labels MCP and
                  REST API access “coming soon” with a waitlist. This local
                  evidence view does not claim a live integration.
                </p>
                <a
                  href="https://simplycodes.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Explore the existing platform <ArrowUpRight size={14} />
                </a>
              </div>,
            )}
          </section>
          <section id="chapter-7" data-chapter="7">
            {heading(
              7,
              "WHY THIS COULD GROW REVENUE",
              "Better decisions. A measurable hypothesis.",
              "Clarity only creates business value if it changes successful shopping behavior.",
            )}
            <div className="causal">
              {[
                "Clearer decisions",
                "Fewer wasted attempts",
                "Eligible purchases",
                "Attributable revenue",
              ].map((s, i) => (
                <React.Fragment key={s}>
                  <span>
                    <small>0{i + 1}</small>
                    {s}
                  </span>
                  {i < 3 && <ArrowRight size={15} />}
                </React.Fragment>
              ))}
            </div>
            <div className="calculator">
              <div>
                <span className="small-label">
                  SCENARIO ASSUMPTIONS · NOT COMPANY DATA
                </span>
                <h3>What could the opportunity look like?</h3>
                {[
                  {
                    label: "Qualified sessions / month",
                    value: sessions,
                    set: setSessions,
                    min: 1000,
                    max: 500000,
                    step: 1000,
                    format: (x: number) => x.toLocaleString(),
                  },
                  {
                    label: "Baseline redemption rate",
                    value: baseline,
                    set: setBaseline,
                    min: 1,
                    max: 50,
                    step: 1,
                    format: (x: number) => x + "%",
                  },
                  {
                    label: "Redemption improvement",
                    value: lift,
                    set: setLift,
                    min: 0,
                    max: 10,
                    step: 0.5,
                    format: (x: number) => x + " percentage points",
                  },
                  {
                    label: "Purchase completion rate",
                    value: completion,
                    set: setCompletion,
                    min: 0,
                    max: 100,
                    step: 1,
                    format: (x: number) => x + "%",
                  },
                  {
                    label: "Net commission / purchase",
                    value: commission,
                    set: setCommission,
                    min: 0,
                    max: 15,
                    step: 0.5,
                    format: money,
                  },
                ].map((x) => (
                  <label className="slider-label" key={x.label}>
                    {x.label}
                    <strong>{x.format(x.value)}</strong>
                    <input
                      aria-label={x.label}
                      type="range"
                      min={x.min}
                      max={x.max}
                      step={x.step}
                      value={x.value}
                      onChange={(e) => x.set(+e.target.value)}
                    />
                  </label>
                ))}
              </div>
              <div className="calculator-result">
                <span className="small-label">
                  POTENTIAL INCREMENTAL CONTRIBUTION
                </span>
                <strong>
                  {money(monthly)}
                  <small>/ month</small>
                </strong>
                <p>{money(monthly * 12)} annualized</p>
                <hr />
                <span>
                  {baseline}% → {baseline + lift}% scenario redemption
                </span>
                <p>
                  {Math.round(
                    (((sessions * lift) / 100) * completion) / 100,
                  ).toLocaleString()}{" "}
                  incremental completed purchases / month
                </p>
                <p className="small-copy">
                  Sessions × percentage-point improvement × completion × net
                  commission. Baseline contextualizes the treatment; lift drives
                  the incremental estimate. Assumes eligible, attributable
                  purchases and no cannibalization.
                </p>
              </div>
            </div>
            <div className="experiment">
              <div>
                <span className="small-label">THE EXPERIMENT</span>
                <h3>Randomize qualified sessions.</h3>
                <p>
                  <b>Control</b> Current merchant-page experience.
                </p>
                <p>
                  <b>Treatment</b> Decision-first interface.
                </p>
                <p>
                  <b>Primary metric</b> Incremental net revenue per qualified
                  shopping session.
                </p>
              </div>
              <div>
                <span className="small-label">GUARDRAILS</span>
                <p>
                  Unsuccessful redemption · Unverified claims presented as
                  verified · Checkout abandonment · Privacy comprehension ·
                  Accessibility · User complaints.
                </p>
                <details>
                  <summary>Ship, revise, or abandon?</summary>
                  <p>
                    <b>Ship:</b> pre-registered revenue improvement with
                    uncertainty bounds above zero and no material guardrail
                    regression.
                  </p>
                  <p>
                    <b>Revise:</b> comprehension improves but revenue evidence
                    is inconclusive.
                  </p>
                  <p>
                    <b>Abandon:</b> misleading verification, persistent
                    accessibility failures, or credible revenue harm.
                  </p>
                </details>
              </div>
            </div>
          </section>
          <section id="chapter-8" data-chapter="8">
            {heading(
              8,
              "HOW I WOULD BUILD IT",
              "Design the decision. Engineer the details.",
              "A reusable system connects product judgment to something people can actually use.",
            )}
            <div className="workflow">
              {[
                "Understand",
                "Find friction",
                "Hypothesize",
                "Design",
                "Build",
                "Test",
                "Measure",
                "Improve",
              ].map((s, i) => (
                <div key={s}>
                  <span>0{i + 1}</span>
                  <b>{s}</b>
                </div>
              ))}
            </div>
            <div className="library">
              <div className="control-heading">
                <Code2 size={17} />
                <b>The working component library</b>
                <span>Same components. Same rules.</span>
              </div>
              <div className="component-index">
                {[
                  ["Coupon cards", 1],
                  ["Evidence drawer", 3],
                  ["Privacy disclosure", 4],
                  ["Cart summary", 5],
                ].map(([label, chapter]) => (
                  <button key={label} onClick={() => jump(Number(chapter))}>
                    {label} <ArrowUpRight size={12} />
                  </button>
                ))}
              </div>
              <div className="library-grid">
                <div>
                  <span className="small-label">ACTION HIERARCHY</span>
                  <div className="button-row">
                    <button
                      className="primary"
                      onClick={() => setDrawer(offers[1])}
                    >
                      Inspect proof <ArrowUpRight size={14} />
                    </button>
                    <button
                      className="outline"
                      onClick={() => {
                        setCart(initialCart);
                        setFailure(false);
                        setMobile("proposal");
                        setSharing(false);
                        setPermission(false);
                        setSelected("welcome");
                        setLeftResult("");
                        setRightResult("");
                        setComplete(false);
                        setSessions(100000);
                        setBaseline(12);
                        setLift(2);
                        setCompletion(65);
                        setCommission(4);
                        setSample("empty");
                        jump(0);
                      }}
                    >
                      <RotateCcw size={14} /> Restart
                    </button>
                  </div>
                  <span className="small-label">VERIFICATION VOCABULARY</span>
                  <div className="badges">
                    {[
                      "VERIFIED",
                      "CONDITIONALLY APPLICABLE",
                      "UNVERIFIED",
                      "INELIGIBLE",
                      "NO VERIFIED CODE",
                    ].map((s) => (
                      <React.Fragment key={s}>{badge(s)}</React.Fragment>
                    ))}
                  </div>
                </div>
                <div>
                  <label>
                    System states
                    <select
                      aria-label="System states"
                      value={sample}
                      onChange={(e) => setSample(e.target.value)}
                    >
                      <option value="empty">Empty</option>
                      <option value="loading">Loading</option>
                      <option value="error">Error</option>
                    </select>
                  </label>
                  <div className="sample-state" role="status">
                    {sample === "empty" ? (
                      <>
                        <ShoppingBag />
                        <b>No matching offers</b>
                        <span>Try adjusting your cart conditions.</span>
                      </>
                    ) : sample === "loading" ? (
                      <>
                        <span className="loader" />
                        <b>Checking supporting evidence…</b>
                        <span>Loading state specimen</span>
                      </>
                    ) : (
                      <>
                        <Info />
                        <b>Evidence unavailable</b>
                        <button
                          className="text-button"
                          onClick={() => setSample("empty")}
                        >
                          Try again <RotateCcw size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <details>
                <summary>Tokens & rules for coding agents</summary>
                <pre>{`color.brand = #185b3e\ncolor.mint = #d8f3e4\nradius.card = 16px\nspace = [4, 8, 12, 16, 24, 32, 48, 64, 96]\n\nNever map unknown eligibility to verified.\nUse the pure rules engine for every price.\nEvidence drawers preserve keyboard focus.\nRespect prefers-reduced-motion.\nKeep fixture claims separate from source observations.`}</pre>
              </details>
            </div>
            <div className="closing">
              <span className="tiny-star">✳</span>
              <h2>
                Make truth
                <br />
                <em>easy to act on.</em>
              </h2>
              <p>Product thinking, made tangible.</p>
              <a
                href="https://jayasrisng.com/"
                target="_blank"
                rel="noreferrer"
              >
                Jayasri Guthula <ArrowUpRight size={16} />
              </a>
            </div>
          </section>
          <footer>
            <p>
              Independent exploration. Not affiliated with or endorsed by
              SimplyCodes or Product.ai.
            </p>
            <button className="text-button" onClick={() => setSourceOpen(true)}>
              Sources, scope & limitations <ArrowUpRight size={13} />
            </button>
            <span>Built with intention. October 2026.</span>
          </footer>
        </main>
      </div>
      <dialog
        ref={dialog}
        aria-labelledby="evidence-title"
        onCancel={() => setDrawer(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setDrawer(null);
        }}
      >
        <div className="dialog-head">
          <span className="small-label">THE COMPLETE EVIDENCE</span>
          <button aria-label="Close evidence" onClick={() => setDrawer(null)}>
            <X />
          </button>
        </div>
        {drawer && (
          <>
            <h2 id="evidence-title">{drawer.code}</h2>
            {badge(evaluate(drawer, cart))}
            <p className="fixture-note">
              Illustrative evidence report. These tests did not occur in a real
              merchant checkout.
            </p>
            <dl>
              <dt>Fixture verification</dt>
              <dd>
                {drawer.verified
                  ? "Supported by fixture test results"
                  : "No current supporting fixture result"}
              </dd>
              <dt>Fixture test outcome</dt>
              <dd>
                {drawer.passes} / {drawer.tests} passes · not a probability for
                your cart
              </dd>
              <dt>Last fixture timestamp (UTC)</dt>
              <dd>{drawer.tested}</dd>
              <dt>Human verification</dt>
              <dd>No actual human checkout verification performed</dd>
              <dt>Restrictions</dt>
              <dd>
                Minimum {money(drawer.minimum)}
                {drawer.newOnly ? " · New customers only" : ""}
                {drawer.category ? " · " + drawer.category : ""}
                {drawer.fullPrice ? " · Full-price only" : ""}
                {drawer.student ? " · Student eligibility required" : ""}
              </dd>
              <dt>Uncertainty</dt>
              <dd>
                Merchant exclusions, expiry and final acceptance may differ. No
                live checkout signals collected.
              </dd>
            </dl>
            <button className="primary full" onClick={() => setDrawer(null)}>
              Back to the decision <ArrowRight size={14} />
            </button>
          </>
        )}
      </dialog>
      <dialog
        ref={sourceDialog}
        aria-labelledby="sources-title"
        onCancel={() => setSourceOpen(false)}
      >
        <div className="dialog-head">
          <span className="small-label">RESEARCH & INTEGRITY</span>
          <button
            aria-label="Close sources"
            onClick={() => setSourceOpen(false)}
          >
            <X />
          </button>
        </div>
        <h2 id="sources-title">Show your sources.</h2>
        <p>
          Research observed October 21, 2026 (Pacific). All requested sources
          were inspected after intermittent security challenges. Observations
          and limitations are documented in the repository. No live checkout was
          tested. All interactive coupons and scores are fixtures.
        </p>
        <div className="source-links">
          {sources.map(([title, url]) => (
            <a key={url} href={url} target="_blank" rel="noreferrer">
              {title}
              <ArrowUpRight size={14} />
            </a>
          ))}
        </div>
        <p className="small-copy">
          Nike and Vistaprint counts were observed on public pages and may
          change. Proposed privacy copy needs legal review. This site collects
          no payment information or analytics.
        </p>
      </dialog>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
