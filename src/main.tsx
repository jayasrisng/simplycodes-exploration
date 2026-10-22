import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  ChevronRight,
  Code2,
  ExternalLink,
  Info,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/600.css";
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
import {
  Comparison,
  CouponCard,
  VerificationBadge,
  Receipt,
  EmptyState,
  conditions,
} from "./components";
import tokens from "./tokens.json";
import "./style.css";
for (const scope of ["shell", "existing", "proposal"] as const)
  Object.entries(tokens[scope]).forEach(([key, value]) =>
    document.documentElement.style.setProperty(`--${scope}-${key}`, value),
  );
const chapters = [
  "Find a code",
  "Is it eligible?",
  "Trust & privacy",
  "Apply & save",
  "Business impact",
];
const sources = [
  ["Merchant: Nike", "https://simplycodes.com/store/nike.com"],
  ["Merchant: Vistaprint", "https://simplycodes.com/store/vistaprint.com"],
  ["SimplyCodes identity", "https://simplycodes.com/"],
  ["Verification & Proof Packets", "https://simplycodes.com/how-it-works"],
  ["Privacy commitments", "https://simplycodes.com/privacy"],
  ["Existing extension", "https://simplycodes.com/extension"],
  ["Commission model", "https://simplycodes.com/how-we-make-money"],
  ["Product.ai role", "https://product.ai/join/design-engineer/"],
  ["Agent / MCP availability", "https://product.ai/developers/"],
  ["Capital One Shopping", "https://capitaloneshopping.com/"],
  ["PayPal Honey", "https://www.joinhoney.com/"],
  ["Rakuten", "https://www.rakuten.com/"],
  ["Groupon", "https://www.groupon.com/"],
  ["inKind", "https://inkind.com/"],
];
function App() {
  const [active, setActive] = useState(0),
    [view, setView] = useState("proposal"),
    [cart, setCart] = useState<Cart>(initialCart),
    [selected, setSelected] = useState("welcome"),
    [drawer, setDrawer] = useState<Offer | null>(null),
    [sourcesOpen, setSourcesOpen] = useState(false),
    [sharing, setSharing] = useState(false),
    [permission, setPermission] = useState(false),
    [failure, setFailure] = useState(false),
    [leftResult, setLeftResult] = useState(""),
    [rightResult, setRightResult] = useState(""),
    [leftAttempts, setLeftAttempts] = useState(0),
    [rightAttempts, setRightAttempts] = useState(0),
    [complete, setComplete] = useState(false),
    [sessions, setSessions] = useState(100000),
    [baseline, setBaseline] = useState(12),
    [lift, setLift] = useState(2),
    [completion, setCompletion] = useState(65),
    [commission, setCommission] = useState(4);
  const evidenceRef = useRef<HTMLDialogElement>(null),
    sourceRef = useRef<HTMLDialogElement>(null);
  const best = recommend(cart),
    current = offers.find((o) => o.id === selected)!,
    merchantOffers = offers.filter((o) => o.merchant === cart.merchant),
    monthly = contribution(sessions, lift, completion, commission),
    rightPrice = totals(
      cart.amount,
      rightResult === "applied" ? best?.percent : 0,
    );
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting)
            setActive(Number((e.target as HTMLElement).dataset.chapter));
      },
      { rootMargin: "-150px 0px -50% 0px" },
    );
    document
      .querySelectorAll("[data-chapter]")
      .forEach((e) => observer.observe(e));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const nav = document.querySelector("nav");
    const item = nav?.children[active] as HTMLElement | undefined;
    if (nav && item && matchMedia("(max-width:1050px)").matches)
      nav.scrollTo({
        left: item.offsetLeft - nav.clientWidth / 2 + item.clientWidth / 2,
        behavior: "instant",
      });
  }, [active]);
  useEffect(() => {
    setLeftResult("");
    setRightResult("");
    setComplete(false);
  }, [cart, failure]);
  useEffect(() => {
    if (drawer) evidenceRef.current?.showModal();
    else evidenceRef.current?.close();
  }, [drawer]);
  useEffect(() => {
    if (sourcesOpen) sourceRef.current?.showModal();
    else sourceRef.current?.close();
  }, [sourcesOpen]);
  const jump = (i: number) => {
    setActive(i);
    document.getElementById("chapter-" + i)?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  const update = (patch: Partial<Cart>) => setCart((c) => ({ ...c, ...patch }));
  const reset = () => {
    setCart(initialCart);
    setSelected("welcome");
    setView("proposal");
    setSharing(false);
    setPermission(false);
    setFailure(false);
    setLeftResult("");
    setRightResult("");
    setLeftAttempts(0);
    setRightAttempts(0);
    setComplete(false);
    setSessions(100000);
    setBaseline(12);
    setLift(2);
    setCompletion(65);
    setCommission(4);
    jump(0);
  };
  const choose = async (o: Offer) => {
    setSelected(o.id);
    setLeftResult("selected");
    try {
      await navigator.clipboard.writeText(o.code);
      setLeftResult("copied");
    } catch {}
  };
  const card = (o: Offer, checkCart = false) => (
    <CouponCard
      key={o.id}
      offer={o}
      selected={selected === o.id}
      onSelect={choose}
      onEvidence={setDrawer}
      cartState={checkCart ? evaluate(o, cart) : undefined}
    />
  );
  const question =
    cart.merchant === "Vistaprint" &&
    cart.student === "unknown" &&
    cart.amount >= 50 &&
    (!best || best.percent < 30) ? (
      <div className="question">
        <div>
          <span className="overline">ONE MISSING DETAIL</span>
          <h3>Eligible for a student discount?</h3>
          <p>Confirm before considering STUDENT30.</p>
        </div>
        <div className="button-row">
          <button onClick={() => update({ student: "yes" })}>Yes</button>
          <button onClick={() => update({ student: "no" })}>No</button>
        </div>
      </div>
    ) : null;
  const recommendation = (action = false) =>
    best ? (
      <>
        <div className="decision" key={best.id}>
          <div className="decision-top">
            <span className="overline">BEST SUPPORTED MATCH</span>
            <VerificationBadge state="VERIFIED" />
          </div>
          <div className="saving">
            {money(totals(cart.amount, best.percent).discount)}
            <span>potential saving</span>
          </div>
          <h3>
            {best.percent}% off your {cart.category.toLowerCase()}.
          </h3>
          <p>{conditions(best)}</p>
          <div className="decision-code">
            <code>{best.code}</code>
            <button className="text-button" onClick={() => setDrawer(best)}>
              Why this code? <ChevronRight size={14} />
            </button>
          </div>
          {action && (
            <button
              className="primary full"
              onClick={() => {
                setSelected(best.id);
                jump(3);
              }}
            >
              Use {best.code} <ArrowRight size={16} />
            </button>
          )}
          <div className="subtle-line">
            <ShieldCheck size={14} /> Supported by modeled checks. Merchant
            acceptance may differ.
          </div>
        </div>
        {question}
      </>
    ) : (
      <EmptyState>
        <h3>
          {cart.merchant === "Nike"
            ? "No verified code."
            : "No eligible verified code."}
        </h3>
        <p>
          {cart.merchant === "Nike"
            ? "Historical use isn’t current verification."
            : "None of these offers meets your cart conditions."}
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
          {cart.merchant === "Nike"
            ? "Explore Nike’s sale"
            : "Explore merchant offers"}{" "}
          <ArrowUpRight size={15} />
        </a>
      </EmptyState>
    );
  const pair = (left: React.ReactNode, right: React.ReactNode) => (
    <Comparison view={view} left={left} right={right} />
  );
  const strip = (i: number, hypothesis: string) => (
    <div className="chapter-strip">
      <h2>
        <span>{String(i + 1).padStart(2, "0")}</span>
        {i === 4 ? "Does this improve business?" : chapters[i]}
      </h2>
      <p>{hypothesis}</p>
    </div>
  );
  const toggle = (
    label: string,
    value: boolean,
    setter: (v: boolean) => void,
  ) => (
    <button
      className="toggle-row"
      role="switch"
      aria-checked={value}
      onClick={() => setter(!value)}
    >
      <span>
        {label}
        <small>{value ? "Allowed · local preference" : "Off"}</small>
      </span>
      <i className={value ? "on" : ""} />
    </button>
  );
  return (
    <>
      <a className="skip" href="#chapter-0">
        Skip to comparison
      </a>
      <header className="topbar">
        <a className="wordmark" href="#chapter-0">
          SimplyCodes
        </a>
        <span className="topbar-title">
          Independent & unaffiliated · illustrative offers and checkout
        </span>
        <div className="topbar-actions">
          <button className="text-button" onClick={() => setSourcesOpen(true)}>
            Sources <ArrowUpRight size={14} />
          </button>
        </div>
      </header>
      <div className="workspace">
        <aside>
          <div className="sidebar-intro">
            <span className="overline">THE EXPLORATION</span>
            <h1>
              Same evidence.
              <br />
              Clearer decisions.
            </h1>
          </div>
          <nav aria-label="Chapters">
            {chapters.map((name, i) => (
              <button
                key={name}
                aria-current={active === i ? "step" : undefined}
                onClick={() => jump(i)}
              >
                <span>0{i + 1}</span>
                <b>{name}</b>
                <ChevronRight size={14} />
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <a href="https://jayasrisng.com/" target="_blank" rel="noreferrer">
              Jayasri Guthula <ArrowUpRight size={13} />
            </a>
          </div>
        </aside>
        <main>
          <h1 className="mobile-title">Same evidence. Clearer decisions.</h1>
          <div className="panel-headings">
            <div className="existing">
              <span className="heading-mark" />
              <span className="panel-title">EXISTING SIMPLYCODES</span>
              <span className="heading-meta">Public interface patterns</span>
            </div>
            <div className="proposal">
              <span className="heading-mark" />
              <span className="panel-title">MY PROPOSAL</span>
              <span className="heading-meta">Cart-first decisions</span>
            </div>
          </div>
          <div
            className="mobile-switch"
            role="group"
            aria-label="Comparison view"
          >
            <button
              aria-pressed={view === "existing"}
              onClick={() => setView("existing")}
            >
              Existing
            </button>
            <button
              aria-pressed={view === "proposal"}
              onClick={() => setView("proposal")}
            >
              Proposal
            </button>
          </div>
          <div className="merchant-toolbar">
            <div className="merchant-switch" role="group" aria-label="Merchant">
              {(["Vistaprint", "Nike"] as const).map((m) => (
                <button
                  key={m}
                  aria-pressed={cart.merchant === m}
                  onClick={() => {
                    update({
                      merchant: m,
                      category: m === "Nike" ? "Shoes" : "Business cards",
                    });
                    setSelected(m === "Nike" ? "old" : "welcome");
                  }}
                >
                  {m}
                  {cart.merchant === m && <Check size={13} />}
                </button>
              ))}
            </div>
            <span>
              <ShoppingBag size={14} />
              {money(cart.amount)} cart{" "}
              <button className="text-button" onClick={() => jump(1)}>
                Edit <ChevronRight size={12} />
              </button>
            </span>
          </div>
          <section id="chapter-0" data-chapter="0">
            {strip(
              0,
              "Hypothesis: one supported next step beats another list to compare.",
            )}
            {pair(
              <>
                <div className="product-heading">
                  <span className="merchant-monogram">
                    {cart.merchant === "Nike" ? "N" : "V"}
                  </span>
                  <div>
                    <h3>{cart.merchant} coupons</h3>
                    <p>Codes, conditions & verification</p>
                  </div>
                  <button
                    className="icon-button"
                    aria-label="View merchant research"
                    onClick={() => setSourcesOpen(true)}
                  >
                    <Info size={17} />
                  </button>
                </div>
                <div className="list-heading">
                  <b>Top codes</b>
                  <span>Same illustrative offer set</span>
                </div>
                {merchantOffers.slice(0, 3).map((o) => card(o))}
              </>,
              <>
                <div className="product-heading">
                  <span className="merchant-monogram">
                    {cart.merchant === "Nike" ? "N" : "V"}
                  </span>
                  <div>
                    <h3>Your {cart.merchant} saving</h3>
                    <p>
                      {money(cart.amount)} · {cart.customer} customer
                    </p>
                  </div>
                </div>
                {recommendation(true)}
                <button
                  className="text-button next-link"
                  onClick={() => jump(1)}
                >
                  Change cart conditions <ArrowRight size={14} />
                </button>
              </>,
            )}
          </section>
          <section id="chapter-1" data-chapter="1">
            {strip(
              1,
              "Hypothesis: match the conditions before chasing the percentage.",
            )}
            <div className="cart-controls">
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
                Category
                <select
                  aria-label="Category"
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
                  aria-label="Customer"
                  value={cart.customer}
                  onChange={(e) =>
                    update({ customer: e.target.value as Cart["customer"] })
                  }
                >
                  <option value="returning">Returning</option>
                  <option value="new">New</option>
                </select>
              </label>
              <label>
                Student eligibility
                <select
                  aria-label="Student eligibility"
                  value={cart.student}
                  onChange={(e) =>
                    update({ student: e.target.value as Cart["student"] })
                  }
                >
                  <option value="unknown">Unknown</option>
                  <option value="yes">Eligible</option>
                  <option value="no">Not eligible</option>
                </select>
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={cart.sale}
                  onChange={(e) => update({ sale: e.target.checked })}
                />
                Sale items
              </label>
            </div>
            {pair(
              <>
                <div className="list-heading">
                  <b>Compare the conditions</b>
                  <span>Code-by-code eligibility</span>
                </div>
                {merchantOffers.map((o) => card(o, true))}
              </>,
              <>
                <div className="list-heading">
                  <b>Matched to this cart</b>
                  <span aria-live="polite">
                    {best ? "Supported match" : "No match"}
                  </span>
                </div>
                <div aria-live="polite" aria-atomic="true">
                  {recommendation()}
                </div>
                <div className="cart-estimate">
                  <span>After eligible discount</span>
                  <strong>
                    {money(
                      cart.amount - totals(cart.amount, best?.percent).discount,
                    )}
                  </strong>
                  <small>Before shipping · tax not modeled</small>
                </div>
              </>,
            )}
          </section>
          <section id="chapter-2" data-chapter="2">
            {strip(
              2,
              "Hypothesis: show the verdict first; keep the full proof one click away.",
            )}
            {pair(
              <>
                <div className="list-heading">
                  <b>How verification works</b>
                  <button
                    className="text-button"
                    onClick={() => setSourcesOpen(true)}
                  >
                    Source <ArrowUpRight size={13} />
                  </button>
                </div>
                <div className="verification-model">
                  <span className="overline">HEALTH SCORE</span>
                  <strong>0–100</strong>
                  <p>Outcome · consensus · freshness</p>
                  <div className="signal-list">
                    {[
                      "Automated tests",
                      "Human verification",
                      "Checkout signals",
                    ].map((x, i) => (
                      <div key={x}>
                        <span>0{i + 1}</span>
                        {x}
                        <ShieldCheck size={15} />
                      </div>
                    ))}
                  </div>
                  <button
                    className="outline full"
                    onClick={() => setDrawer(best || offers[4])}
                  >
                    Inspect a Proof Packet <ArrowUpRight size={14} />
                  </button>
                </div>
                <div className="privacy-policy">
                  <LockKeyhole size={20} />
                  <h3>Published privacy commitments</h3>
                  <p>
                    Checkout-only activation. No browsing-history tracking or
                    personal profiling. Merchant-funded commissions.
                  </p>
                  <a
                    href="https://simplycodes.com/privacy"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read full policy <ArrowUpRight size={14} />
                  </a>
                </div>
              </>,
              <>
                <div className="trust-verdict">
                  <ShieldCheck size={27} />
                  <VerificationBadge
                    state={best ? "VERIFIED" : "NO VERIFIED CODE"}
                  />
                  <h3>
                    {best
                      ? "A supported match. Evidence included."
                      : "No supported code. No false promise."}
                  </h3>
                  <p>
                    {best
                      ? `${best.code} · ${conditions(best)}`
                      : "There’s no currently supported offer in this set for your cart."}
                  </p>
                  <button
                    className="outline full"
                    onClick={() => setDrawer(best || offers[4])}
                  >
                    View full evidence <ChevronRight size={15} />
                  </button>
                </div>
                <div className="privacy-card">
                  <div className="privacy-title">
                    <LockKeyhole size={18} />
                    <h3>Only what helps check the fit.</h3>
                  </div>
                  <p>
                    Cart amount, category and eligibility. This exploration
                    keeps inputs in memory.
                  </p>
                  {toggle("Cart sharing permission", permission, setPermission)}
                  {toggle("Optional feedback sharing", sharing, setSharing)}
                  <a
                    href="https://simplycodes.com/privacy"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Full policy & retention details <ArrowUpRight size={13} />
                  </a>
                </div>
              </>,
            )}
          </section>
          <section id="chapter-3" data-chapter="3">
            {strip(
              3,
              "Compare the manual route with cart-assisted application.",
            )}
            <div className="checkout-toolbar">
              <span>
                {cart.merchant} · {money(cart.amount)} subtotal
              </span>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={failure}
                  onChange={(e) => setFailure(e.target.checked)}
                />
                Test merchant rejection
              </label>
            </div>
            {pair(
              <div className="checkout">
                <div className="list-heading">
                  <b>Choose & try a code</b>
                  <span>{leftAttempts} attempts this session</span>
                </div>
                <p className="route-note">
                  Manual route. The existing extension also assists checkout.
                </p>
                <label>
                  Coupon
                  <select
                    value={selected}
                    onChange={(e) => {
                      setSelected(e.target.value);
                      setLeftResult("");
                    }}
                  >
                    {merchantOffers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.code} · {o.percent}% off
                      </option>
                    ))}
                  </select>
                </label>
                <div className="button-row checkout-actions">
                  <button className="outline" onClick={() => choose(current)}>
                    Copy code
                  </button>
                  <button
                    className="primary"
                    onClick={() => {
                      setLeftAttempts((n) => n + 1);
                      setLeftResult(attempt(current, cart, failure));
                    }}
                  >
                    Try {current.code}
                    <ArrowRight size={15} />
                  </button>
                </div>
                <div role="status" className={"checkout-message " + leftResult}>
                  {leftResult === "applied"
                    ? "Code accepted. Discount applied."
                    : leftResult === "rejected"
                      ? "Code rejected. Try another or continue without a code."
                      : leftResult === "copied"
                        ? "Copied. Ready to try."
                        : "Select a code to begin."}
                </div>
                <Receipt
                  amount={cart.amount}
                  percent={leftResult === "applied" ? current.percent : 0}
                />
              </div>,
              <div className="checkout">
                <div className="list-heading">
                  <b>Apply the supported match</b>
                  <span>{rightAttempts} attempts this session</span>
                </div>
                <div className="checkout-offer">
                  <ShieldCheck size={20} />
                  <div>
                    <h3>
                      {best
                        ? `${best.code} · ${best.percent}% off`
                        : "No eligible verified code"}
                    </h3>
                    <p>
                      {best
                        ? conditions(best)
                        : "Continue at the original price."}
                    </p>
                  </div>
                  {best && (
                    <button
                      className="icon-button"
                      aria-label="Checkout evidence"
                      onClick={() => setDrawer(best)}
                    >
                      <Info size={17} />
                    </button>
                  )}
                </div>
                <button
                  className="primary full"
                  disabled={!best || rightResult === "applied"}
                  onClick={() => {
                    setRightAttempts((n) => n + 1);
                    setRightResult(attempt(best!, cart, failure));
                    setComplete(false);
                  }}
                >
                  {rightResult === "applied" ? (
                    <>
                      <Check size={16} />
                      Offer applied
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
                  {rightResult === "applied"
                    ? `Saved ${money(rightPrice.discount)}. Total updated.`
                    : rightResult === "rejected"
                      ? "Merchant rejected this attempt. No discount counted."
                      : "A cart match is a reason to try, not a guarantee."}
                </div>
                {rightResult === "rejected" && (
                  <button
                    className="text-button recovery"
                    onClick={() => {
                      setFailure(false);
                      setRightResult("");
                    }}
                  >
                    Retry without forced rejection <RotateCcw size={14} />
                  </button>
                )}
                <Receipt
                  amount={cart.amount}
                  percent={rightResult === "applied" ? best?.percent : 0}
                />
                <button
                  className="outline full"
                  onClick={() => setComplete(true)}
                >
                  Review final payable <ArrowRight size={15} />
                </button>
                {complete && (
                  <p className="completion" role="status">
                    Final payable: {money(rightPrice.total)}. No order or
                    payment created.
                  </p>
                )}
              </div>,
            )}
          </section>
          <section id="chapter-4" data-chapter="4">
            {strip(4, "A testable revenue hypothesis, not a measured lift.")}
            <div className="assumptions-label">
              <Info size={14} />
              Scenario assumptions · not company data
            </div>
            <div className="scenario-controls">
              {" "}
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
                  format: (x: number) => x + " pp",
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
            {pair(
              <div className="baseline-scenario">
                <span className="overline">BASELINE SCENARIO</span>
                <h3>{baseline}% redemption</h3>
                <strong>
                  {money(
                    contribution(sessions, baseline, completion, commission),
                  )}
                  <small>modeled net commission / month</small>
                </strong>
                <p>
                  {Math.round(
                    (((sessions * baseline) / 100) * completion) / 100,
                  ).toLocaleString()}{" "}
                  completed purchases / month
                </p>
                <details>
                  <summary>Calculation & limits</summary>
                  <p>
                    Sessions × redemption improvement × completion × net
                    commission. Baseline contextualizes the change;
                    percentage-point lift drives the incremental estimate.
                    Assumes attribution and no cannibalization.
                  </p>
                </details>
              </div>,
              <>
                <div className="calculator-result">
                  <span className="overline">
                    INCREMENTAL CONTRIBUTION SCENARIO
                  </span>
                  <strong>
                    {money(monthly)}
                    <small>/ month</small>
                  </strong>
                  <p>
                    {money(monthly * 12)} annualized · {baseline}% →{" "}
                    {baseline + lift}% redemption
                  </p>
                </div>
                <div className="experiment">
                  <h3>The experiment</h3>
                  <dl>
                    <div>
                      <dt>Control</dt>
                      <dd>Current merchant page</dd>
                    </div>
                    <div>
                      <dt>Treatment</dt>
                      <dd>Cart-first decision interface</dd>
                    </div>
                    <div>
                      <dt>Primary metric</dt>
                      <dd>Incremental net revenue / qualified session</dd>
                    </div>
                  </dl>
                  <details>
                    <summary>Success criteria & guardrails</summary>
                    <p>
                      <b>Ship:</b> credible incremental revenue above zero; no
                      material guardrail regression.
                    </p>
                    <p>
                      <b>Revise:</b> clearer decisions, inconclusive revenue.
                    </p>
                    <p>
                      <b>Abandon:</b> revenue harm or misleading verification.
                    </p>
                    <p>
                      Guardrails: failed redemption, unverified claims,
                      abandonment, privacy comprehension, accessibility and
                      complaints.
                    </p>
                  </details>
                </div>
              </>,
            )}
          </section>
          <div className="workspace-footer">
            <button className="text-button" onClick={reset}>
              <RotateCcw size={14} />
              Restart
            </button>
            <button
              className="text-button"
              onClick={() => setSourcesOpen(true)}
            >
              <Code2 size={15} />
              Sources, system & agent research <ArrowUpRight size={14} />
            </button>
            <span>USD · tax excluded · no payments</span>
          </div>
        </main>
      </div>
      <dialog
        ref={evidenceRef}
        aria-labelledby="evidence-title"
        onCancel={() => setDrawer(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setDrawer(null);
        }}
      >
        <div className="dialog-head">
          <span className="overline">ILLUSTRATIVE EVIDENCE</span>
          <button
            className="icon-button"
            aria-label="Close evidence"
            onClick={() => setDrawer(null)}
          >
            <X size={20} />
          </button>
        </div>
        {drawer && (
          <>
            <h2 id="evidence-title">{drawer.code}</h2>
            <VerificationBadge state={evaluate(drawer, cart)} />
            <p>No real merchant checkout was tested.</p>
            <dl className="evidence-report">
              <div>
                <dt>Modeled test results</dt>
                <dd>
                  {drawer.passes} of {drawer.tests} passed
                </dd>
              </div>
              <div>
                <dt>Fixture timestamp · UTC</dt>
                <dd>{drawer.tested}</dd>
              </div>
              <div>
                <dt>Conditions</dt>
                <dd>{conditions(drawer)}</dd>
              </div>
              <div>
                <dt>Human & live checkout signals</dt>
                <dd>Not collected in this exploration.</dd>
              </div>
              <div>
                <dt>Uncertainty</dt>
                <dd>
                  Merchant acceptance, exclusions and expiry may differ. Pass
                  counts are not a success probability.
                </dd>
              </div>
            </dl>
            <button className="primary full" onClick={() => setDrawer(null)}>
              Back to comparison <ArrowRight size={15} />
            </button>
          </>
        )}
      </dialog>
      <dialog
        ref={sourceRef}
        className="sources-dialog"
        aria-labelledby="sources-title"
        onCancel={() => setSourcesOpen(false)}
      >
        <div className="dialog-head">
          <span className="overline">RESEARCH RECORD</span>
          <button
            className="icon-button"
            aria-label="Close sources"
            onClick={() => setSourcesOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <h2 id="sources-title">Sources & scope</h2>
        <p>
          Public pages observed October 21, 2026. Interface patterns are
          approximations; interactive codes, timestamps and outcomes are local
          fixtures.
        </p>
        <details open>
          <summary>Current-state observations</summary>
          <p>
            Nike’s main count showed no verified codes. Vistaprint showed 20,
            with restrictions, last-used information and expandable activity.
            Counts may change.
          </p>
          <p>
            The existing extension already advertises savings ranking,
            restrictions and best-code application. The comparison explores
            decision clarity, not a new auto-apply capability.
          </p>
          <p>
            Privacy commitments are published claims, not an extension audit.
            Exact retention was not specified on the inspected plain-language
            page; formal legal terms govern. Proposed contextual wording needs
            legal review. Sharing switches here are local preferences only.
          </p>
        </details>
        <div className="source-links">
          {sources.map(([name, url]) => (
            <a key={url} href={url} target="_blank" rel="noreferrer">
              {name}
              <ExternalLink size={13} />
            </a>
          ))}
        </div>
        <details>
          <summary>AI-agent evidence</summary>
          <p>
            SimplyCodes already describes machine-readable Proof Packets.
            Product.ai’s developer page labels MCP/API access “coming soon.” No
            live integration was tested.
          </p>
          <pre>
            {JSON.stringify(
              {
                merchant: "nike.com",
                source: "illustrative_fixture",
                verification: "NO VERIFIED CODE",
                cartEligibility: "unknown",
                checkoutTested: false,
                guaranteedSaving: null,
              },
              null,
              2,
            )}
          </pre>
        </details>
        <details>
          <summary>Design system & implementation</summary>
          <p>
            Shared typed fixtures, pure eligibility and price functions, scoped
            dark tokens, native evidence dialogs and reduced-motion support. No
            analytics or payment collection.
          </p>
          <pre>{JSON.stringify(tokens, null, 2)}</pre>
          <a
            href="https://github.com/jayasrisng/simplycodes-exploration/tree/main/docs"
            target="_blank"
            rel="noreferrer"
          >
            Read technical documentation <ArrowUpRight size={14} />
          </a>
        </details>
      </dialog>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
