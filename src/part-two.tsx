import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/600.css";
import "./part-two.css";
import {
  evidence,
  layouts,
  initialInteraction,
  type Layout,
  type Merchant,
  type Interaction,
} from "./part-two-evidence";
import { MerchantPhone, PhoneFrame, Handoff, External } from "./PartTwoPhone";
import { Experiments } from "./PartTwoExperiments";
import { Beyond } from "./PartTwoSupporting";
type Step = "search" | "results" | "merchant" | "handoff";
const steps: Step[] = ["search", "results", "merchant", "handoff"];
function readStep(): Step {
  const part = location.hash.split("/")[1];
  return steps.includes(part as Step) ? (part as Step) : "search";
}
function App() {
  const [layout, setLayout] = useState<Layout>("B");
  const [merchant, setMerchant] = useState<Merchant>("Vistaprint");
  const [mode, setMode] = useState<"gallery" | "journey">(
    location.hash.startsWith("#journey") ? "journey" : "gallery",
  );
  const [compare, setCompare] = useState(false);
  const [pair, setPair] = useState<[Layout, Layout]>(["A", "B"]);
  const [step, setStep] = useState<Step>(readStep);
  const [interactions, setInteractions] = useState<
    Record<Merchant, Interaction>
  >({ Vistaprint: { ...initialInteraction }, Kith: { ...initialInteraction } });
  const [handoff, setHandoff] = useState<Merchant | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const firstRadio = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onPop = () => {
      setMode(location.hash.startsWith("#journey") ? "journey" : "gallery");
      setStep(readStep());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    if (handoff) {
      previousFocus.current = document.activeElement as HTMLElement;
      dialog.current?.showModal();
    } else if (dialog.current?.open) {
      dialog.current.close();
      previousFocus.current?.focus();
    }
  }, [handoff]);
  function navigate(next: Step) {
    setStep(next);
    setMode("journey");
    history.pushState({ journey: true }, "", `#journey/${next}`);
    requestAnimationFrame(() => {
      stage.current?.focus();
      stage.current?.querySelector(".phone")?.scrollTo(0, 0);
    });
  }
  function goBack() {
    if (history.state?.journey) history.back();
    else navigate(steps[Math.max(0, steps.indexOf(step) - 1)]);
  }
  function setView(next: "gallery" | "journey") {
    setMode(next);
    history.pushState(
      null,
      "",
      next === "gallery" ? "#gallery" : `#journey/${step}`,
    );
  }
  function update(value: Interaction) {
    setInteractions((old) => ({ ...old, [merchant]: value }));
  }
  function choosePair(index: 0 | 1, value: Layout) {
    setPair((old) => {
      const next: [Layout, Layout] = [...old];
      if (next[1 - index] === value) next[1 - index] = old[index];
      next[index] = value;
      return next;
    });
  }
  function restart() {
    setInteractions((old) => ({
      ...old,
      [merchant]: { ...initialInteraction },
    }));
    navigate("search");
  }
  const r = evidence[merchant];
  const phone = (l: Layout) => (
    <MerchantPhone
      merchant={merchant}
      layout={l}
      interaction={interactions[merchant]}
      onInteraction={update}
      onAction={() =>
        mode === "journey" ? navigate("handoff") : setHandoff(merchant)
      }
    />
  );
  return (
    <>
      <a className="skip" href="#playground">
        Skip to prototypes
      </a>
      <header className="page-nav">
        <a href="../" className="wordmark">
          simplycodes<span> / studio</span>
        </a>
        <h1>Prototype gallery</h1>
        <nav aria-label="Project">
          <a href="../">Part One ↗</a>
        </nav>
      </header>
      <main>
        <section
          className="workspace"
          id="playground"
          aria-label="Layout playground"
        >
          <aside className="design-controls">
            <div className="section-label">
              DESIGN DIRECTION <span>03</span>
            </div>
            <fieldset className="layout-picker">
              <legend className="sr-only">Layout</legend>
              {layouts.map((l, i) => (
                <label
                  className={`layout-option ${layout === l.id ? "selected" : ""}`}
                  key={l.id}
                >
                  <input
                    ref={i === 0 ? firstRadio : undefined}
                    type="radio"
                    name="layout"
                    value={l.id}
                    checked={layout === l.id}
                    onChange={() => {
                      setLayout(l.id);
                      if (compare) choosePair(0, l.id);
                    }}
                  />
                  <span
                    className={`layout-mini mini-${l.id}`}
                    aria-hidden="true"
                  >
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="layout-option-copy">
                    <strong>
                      {l.id} · {l.name}
                    </strong>
                    <small>{l.intent}</small>
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="control-divider" />
            <label className="merchant-select">
              Merchant / state
              <select
                value={merchant}
                onChange={(e) => {
                  setMerchant(e.target.value as Merchant);
                  if (mode === "journey") navigate("search");
                }}
              >
                <option value="Vistaprint">Vistaprint · verified offer</option>
                <option value="Kith">Kith · no verified code</option>
              </select>
            </label>
            <p className="baseline-note">
              {layout === "A"
                ? "Baseline-inspired reference. Not a reproduction of the live page."
                : layout === "B"
                  ? "Action leads. Evidence follows."
                  : "Confidence, history, and unknowns share the stage."}
            </p>
            <a className="experiment-jump" href="#experiments">
              Design experiments <span>↓</span>
            </a>
          </aside>
          <div className="canvas">
            <div className="canvas-toolbar">
              <div className="view-switch" aria-label="Prototype mode">
                <button
                  aria-pressed={mode === "gallery"}
                  onClick={() => setView("gallery")}
                >
                  Layouts
                </button>
                <button
                  aria-pressed={mode === "journey"}
                  onClick={() => setView("journey")}
                >
                  Search journey
                </button>
              </div>
              {mode === "gallery" ? (
                <button
                  className="compare-toggle"
                  aria-pressed={compare}
                  onClick={() => {
                    setCompare(!compare);
                    if (!compare) setPair([layout, layout === "A" ? "B" : "A"]);
                  }}
                >
                  ▥ Compare
                </button>
              ) : (
                <span className="simulation-label">SIMULATION</span>
              )}
            </div>
            {mode === "gallery" ? (
              <>
                <div className="stage-caption">
                  <span>
                    {compare
                      ? "SIDE BY SIDE"
                      : `${layout} · ${layouts.find((l) => l.id === layout)!.name}`}
                  </span>
                  <span>390 × 844</span>
                </div>
                {compare && (
                  <div className="compare-controls">
                    <label>
                      Left layout
                      <select
                        value={pair[0]}
                        onChange={(e) =>
                          choosePair(0, e.target.value as Layout)
                        }
                      >
                        {layouts.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.id} · {l.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <span aria-hidden="true">↔</span>
                    <label>
                      Right layout
                      <select
                        value={pair[1]}
                        onChange={(e) =>
                          choosePair(1, e.target.value as Layout)
                        }
                      >
                        {layouts.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.id} · {l.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
                <div
                  className={`phone-stage ${compare ? "comparison" : ""}`}
                  key={compare ? "compare" : "single"}
                >
                  {(compare ? pair : [layout]).map((l, i) => (
                    <div className="phone-column" key={i}>
                      {compare && (
                        <h3 className="phone-caption">
                          {l} · {layouts.find((x) => x.id === l)!.name}
                        </h3>
                      )}
                      {phone(l)}
                      <div className="fold">844 PX / FIRST VIEWPORT</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="journey-controls">
                  <button disabled={step === "search"} onClick={goBack}>
                    ← Back
                  </button>
                  <span>{steps.indexOf(step) + 1} / 4</span>
                  <button onClick={restart}>Restart</button>
                  <button onClick={() => firstRadio.current?.focus()}>
                    Change layout
                  </button>
                </div>
                <ol className="journey-progress" aria-label="Journey progress">
                  {["Search", "Result", "Evaluate", "Act"].map((s, i) => (
                    <li
                      key={s}
                      aria-current={
                        steps.indexOf(step) === i ? "step" : undefined
                      }
                    >
                      <span>{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
                <div
                  className="phone-stage journey-stage"
                  ref={stage}
                  tabIndex={-1}
                  aria-label={`Journey: ${step}`}
                >
                  <div className="phone-column" key={step}>
                    {step === "merchant" ? (
                      phone(layout)
                    ) : step === "handoff" ? (
                      <PhoneFrame label="Source handoff">
                        <div className="browser-address">↗ simplycodes.com</div>
                        <Handoff merchant={merchant} />
                        <button className="return-offer" onClick={goBack}>
                          ← Return to the offer
                        </button>
                      </PhoneFrame>
                    ) : (
                      <PhoneFrame
                        label={
                          step === "search"
                            ? "Simulated Google search"
                            : "Simulated search results"
                        }
                      >
                        <div className="search-surface">
                          <div className="browser-address">
                            ⌕ google.com <span>Simulated</span>
                          </div>
                          {step === "search" ? (
                            <div className="google-search">
                              <div
                                className="google-word"
                                aria-label="Google-style search"
                              >
                                <span>G</span>
                                <span>o</span>
                                <span>o</span>
                                <span>g</span>
                                <span>l</span>
                                <span>e</span>
                              </div>
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  navigate("results");
                                }}
                              >
                                <label htmlFor="query">Search for a code</label>
                                <select
                                  id="query"
                                  value={merchant}
                                  onChange={(e) =>
                                    setMerchant(e.target.value as Merchant)
                                  }
                                >
                                  <option value="Vistaprint">
                                    Vistaprint promo codes
                                  </option>
                                  <option value="Kith">
                                    Kith discount codes
                                  </option>
                                </select>
                                <button className="search-submit" type="submit">
                                  Search <span>→</span>
                                </button>
                              </form>
                              <p>Choose a query to try the journey.</p>
                            </div>
                          ) : (
                            <div className="search-results">
                              <div className="google-small">Google</div>
                              <div className="search-query">⌕ {r.query}</div>
                              <div className="search-types">
                                All <span>Shopping</span>
                                <span>Images</span>
                              </div>
                              <p className="result-notice">
                                Simulated result · no ranking implied
                              </p>
                              <div className="result-source">
                                <span>S</span>
                                <div>
                                  SimplyCodes
                                  <small>
                                    simplycodes.com › store ›{" "}
                                    {merchant.toLowerCase()}.com
                                  </small>
                                </div>
                              </div>
                              <button
                                className="search-result"
                                onClick={() => navigate("merchant")}
                              >
                                {r.title}
                              </button>
                              <p className="result-snippet">{r.snippet}</p>
                              <div className="result-links">
                                <button
                                  onClick={() => {
                                    update({
                                      ...interactions[merchant],
                                      proof: true,
                                    });
                                    navigate("merchant");
                                  }}
                                >
                                  Verification history
                                </button>
                                <button
                                  onClick={() => {
                                    update({
                                      ...interactions[merchant],
                                      eligibility: true,
                                    });
                                    navigate("merchant");
                                  }}
                                >
                                  Offer restrictions
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </PhoneFrame>
                    )}
                    <div className="fold">
                      {step === "merchant"
                        ? `${layout} · ${layouts.find((l) => l.id === layout)!.name}`
                        : "SEARCH-TO-ACTION FLOW"}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
        <Experiments onAction={setHandoff} />
        <Beyond />
        <footer>
          <span>Unofficial concept · Part Two</span>
          <a href="../">Return to Part One ↗</a>
          <details>
            <summary>Sources & Limitations</summary>
            <p>
              Unofficial design concepts using public evidence observed October
              22, 2026 (Pacific). Vistaprint’s top-pick card: 15% storewide,
              Health 100%, 16 uses that day, 185 verifications. Kith: two
              community codes, none verified. Relative usage and history belong
              to that observation, not today.
            </p>
            <p>
              Cart eligibility, exact verification time, expiry, and full
              restrictions are unknown. No checkout, authenticated MCP call,
              email send, or Reddit integration was tested. Search screens are
              simulated; no ranking, traffic, savings, or experiment results are
              claimed. No analytics run here. Source handoffs are not qualifying
              save actions.
            </p>
            <p>
              SimplyCodes already exposes verification, Health Scores,
              restrictions, and code actions. These layouts explore presentation
              of that evidence.
            </p>
            <External href={evidence.Vistaprint.source}>
              Vistaprint record
            </External>{" "}
            · <External href={evidence.Kith.source}>Kith record</External> ·{" "}
            <External href="https://developers.simplycodes.com/docs">
              MCP documentation
            </External>
          </details>
        </footer>
      </main>
      <dialog
        ref={dialog}
        className="handoff-dialog"
        aria-label="Continue to source"
        onCancel={() => setHandoff(null)}
        onClose={() => setHandoff(null)}
      >
        <button
          className="dialog-close"
          onClick={() => setHandoff(null)}
          aria-label="Close handoff"
        >
          ×
        </button>
        {handoff && <Handoff merchant={handoff} />}
      </dialog>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
