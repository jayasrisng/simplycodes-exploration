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
import { Evolution } from "./Evolution";
import { Discovery } from "./Discovery";
import tokens from "./tokens.json";
import "./style.css";
for (const scope of ["shell", "existing", "proposal"] as const)
  Object.entries(tokens[scope]).forEach(([key, value]) =>
    document.documentElement.style.setProperty(`--${scope}-${key}`, value),
  );
const chapters = [
  "Find a Code",
  "Is It Eligible?",
  "Trust & Privacy",
  "Apply & Save",
  "Be Found Everywhere",
  "What Comes Next",
];
const sources = [
  ["Nike coupon page", "https://simplycodes.com/store/nike.com"],
  ["Vistaprint coupon page", "https://simplycodes.com/store/vistaprint.com"],
  ["Verification method", "https://simplycodes.com/how-it-works"],
  ["Privacy policy", "https://simplycodes.com/privacy"],
  ["Browser extension", "https://simplycodes.com/extension"],
  ["Published agent tools", "https://mcp.simplycodes.com/"],
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
    [triedCustomer, setTriedCustomer] = useState(false),
    [readEvidence, setReadEvidence] = useState(false),
    [resetEpoch, setResetEpoch] = useState(0);
  const evidenceRef = useRef<HTMLDialogElement>(null),
    sourceRef = useRef<HTMLDialogElement>(null);
  const best = recommend(cart),
    current = offers.find((o) => o.id === selected)!,
    merchantOffers = offers.filter((o) => o.merchant === cart.merchant),
    rightPrice = totals(
      cart.amount,
      rightResult === "applied" ? best?.percent : 0,
    );
  useEffect(() => {
    let frame = 0;
    const syncChapter = () => {
      const offset = matchMedia("(max-width:767px)").matches
        ? 195
        : matchMedia("(max-width:1050px)").matches
          ? 215
          : 180;
      let chapter = 0;
      document.querySelectorAll<HTMLElement>("[data-chapter]").forEach((el) => {
        if (el.getBoundingClientRect().top <= offset)
          chapter = Number(el.dataset.chapter);
      });
      setActive(chapter);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncChapter);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    syncChapter();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
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
    setTriedCustomer(false);
    setReadEvidence(false);
    setResetEpoch((x) => x + 1);
    setActive(0);
    window.scrollTo({
      top: 0,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
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
            <ShieldCheck size={14} /> Supported by dated checks. Merchant
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
  const strip = (i: number, description: string) => (
    <div className="chapter-strip">
      <h2>
        <span>{String(i).padStart(2, "0")}</span>
        {chapters[i]}
      </h2>
      <p>{description}</p>
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
        Skip to exploration
      </a>
      <header className="topbar">
        <a className="wordmark" href="#chapter-0">
          SimplyCodes
        </a>
        <span className="topbar-title">
          Independent study · sample shopping interactions
        </span>
        <div className="topbar-actions">
          <button className="text-button" onClick={() => setSourcesOpen(true)}>
            Design notes <ArrowUpRight size={14} />
          </button>
        </div>
      </header>
      <div className="workspace">
        <aside>
          <div className="sidebar-intro">
            <span className="overline">THE SHOPPING DECISION</span>
            <h1>
              Find the saving.
              <br />
              Skip the guesswork.
            </h1>
          </div>
          <nav aria-label="Chapters">
            {chapters.map((name, i) => (
              <button
                key={name}
                aria-current={active === i ? "step" : undefined}
                onClick={() => jump(i)}
              >
                <span>0{i}</span>
                <b>{name}</b>
                <ChevronRight size={14} />
              </button>
            ))}
          </nav>
          
        </aside>
        <main>
          <h1 className="mobile-title">Find the saving. Skip the guesswork.</h1>
          <div
            className={
              "panel-headings " +
              (active === 4 || active === 5 ? "overview-headings" : "")
            }
          >
            {active === 4 || active === 5 ? (
              <div className="overview-heading">
                <span className="heading-mark" />
                <span className="panel-title">
                  {active === 5 ? "THE BIGGER PICTURE" : "BE FOUND EVERYWHERE"}
                </span>
                <span className="heading-meta">
                  {active === 5
                    ? "From verified coupon to approved action"
                    : "One evidence record. Every channel."}
                </span>
              </div>
            ) : (
              <>
                <div className="existing">
                  <span className="heading-mark" />
                  <span className="panel-title">EXISTING SIMPLYCODES</span>
                  <span className="heading-meta">
                    Published patterns
                  </span>
                </div>
                <div className="proposal">
                  <span className="heading-mark" />
                  <span className="panel-title">MY PROPOSAL</span>
                  <span className="heading-meta">For this cart</span>
                </div>
              </>
            )}
          </div>
          <div
            className="mobile-switch"
            role="group"
            aria-label="Comparison view"
          >
            {active === 4 || active === 5 ? (
              <span className="mobile-context">
                {active === 5 ? "THE BIGGER PICTURE" : "BE FOUND EVERYWHERE"}
              </span>
            ) : (
              <>
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
              </>
            )}
          </div>
          <section id="chapter-0" data-chapter="0">
            {strip(0, "One cart. Two ways to choose.")}
            <div className="first-task">
              <div>
                <span className="overline">START HERE</span>
                <h3>You're shopping at {cart.merchant}. Which code works for a {money(cart.amount)} cart?</h3>
                <p className="task-instruction" aria-live="polite">
                  {triedCustomer
                    ? "The best match changes with your eligibility."
                    : "Try “New customer” to see how the recommendation changes."}
                </p>
              </div>
              <div className="first-task-controls" role="group" aria-label="Customer type">
                <button aria-pressed={cart.customer === "returning"} onClick={() => { setTriedCustomer(true); update({ customer: "returning" }); }}>Returning customer</button>
                <button className={!triedCustomer && active === 0 ? "guided-action" : undefined} aria-pressed={cart.customer === "new"} onClick={() => { setTriedCustomer(true); update({ customer: "new" }); }}>New customer <ArrowRight size={13} /></button>
              </div>
            </div>
            <div className="merchant-toolbar">
              <div
                className="merchant-switch"
                role="group"
                aria-label="Merchant"
              >
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
            {pair(
              <>
                <div className="product-heading">
                  <span className="merchant-monogram">
                    {cart.merchant === "Nike" ? "N" : "V"}
                  </span>
                  <div>
                    <h3>{cart.merchant} coupons</h3>
                    <p>Codes and restrictions</p>
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
            {strip(1, "Adjust the cart. See which codes qualify.")}
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
                  <small>Before shipping · tax excluded</small>
                </div>
              </>,
            )}
          </section>
          <section id="chapter-2" data-chapter="2">
            {strip(2, "View the proof behind the decision.")}
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
                      ? "This code matches your cart."
                      : "No verified match found."}
                  </h3>
                  <p>
                    {best
                      ? `${best.code} · ${conditions(best)}`
                      : "There’s no currently supported offer in this set for your cart."}
                  </p>
                  <button
                    className={"outline full " + (active === 2 && !readEvidence ? "guided-action" : "")}
                    onClick={() => { setReadEvidence(true); setDrawer(best || offers[4]); }}
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
                    Cart details stay in this browser session. Nothing is shared here.
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
            {strip(3,
              "Try the eligible code. See the total update.",
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
                  className={"primary full " + (active === 3 && rightAttempts === 0 && best ? "guided-action" : "")}
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
            {strip(4,
              "Explore answers built for search and AI.",
            )}
            <Discovery key={resetEpoch} active={active === 4} />
          </section>
          <section id="chapter-5" data-chapter="5">
            {strip(5, "From reliable coupons to trusted agentic shopping.")}
            <Evolution
              key={resetEpoch}
              cart={cart}
              best={best}
              onEvidence={setDrawer}
              onExplore={() => jump(0)}
            />
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
              Why these changes <ArrowUpRight size={14} />
            </button>
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
          <span className="overline">EVIDENCE DETAILS</span>
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
            <p>Sample record · no live checkout tested.</p>
            <dl className="evidence-report">
              <div>
                <dt>Example check results</dt>
                <dd>
                  {drawer.passes} of {drawer.tests} passed
                </dd>
              </div>
              <div>
                <dt>Recorded time · UTC</dt>
                <dd>{drawer.tested}</dd>
              </div>
              <div>
                <dt>Conditions</dt>
                <dd>{conditions(drawer)}</dd>
              </div>
              <div>
                <dt>Human & live checkout signals</dt>
                <dd>Not available for this record.</dd>
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
      <dialog ref={sourceRef} className="sources-dialog" aria-labelledby="sources-title" onCancel={() => setSourcesOpen(false)}>
        <div className="dialog-head">
          <span className="overline">DESIGN NOTES</span>
          <button className="icon-button" aria-label="Close design notes" onClick={() => setSourcesOpen(false)}><X size={20} /></button>
        </div>
        <h2 id="sources-title">Why these changes?</h2>
        <p className="research-lead">
          SimplyCodes already verifies codes, shows restrictions and helps at checkout.
          The opportunity is what shoppers can do with that evidence.
        </p>
        <div className="research-decisions">
          <article>
            <span className="overline">KEEP</span>
            <h3>The verification engine</h3>
            <p>Health Scores, Proof Packets and clear no-code states are already part of the product.</p>
          </article>
          <article>
            <span className="overline">CHANGE</span>
            <h3>Make eligibility obvious</h3>
            <p>A code verified for a merchant isn't necessarily eligible for this cart. Show the condition before the code.</p>
          </article>
          <article>
            <span className="overline">EXTEND</span>
            <h3>Give agents the same clarity</h3>
            <p>Return a dated verdict, relevant restrictions and an honest next action, including when no code is confirmed.</p>
          </article>
        </div>
        <div className="research-sources">
          <h3>Source pages</h3>
          <div className="source-links">
            {sources.map(([name, url]) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer">{name} <ExternalLink size={13} /></a>
            ))}
          </div>
        </div>
        <p className="research-boundary">
          Public pages reviewed October 21, 2026. Comparisons are interpretive.
          Coupon outcomes use sample data; no live merchant checkout or MCP request was performed.
        </p>
      </dialog>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
