import { useState } from "react";
import { evidence, type Merchant } from "./part-two-evidence";
const experiments = [
  {
    name: "Primary CTA",
    difference: "Change one CTA property at a time.",
    hypothesis: "A more noticeable action reduces hesitation.",
    metric: "Visits with ≥1 save action per 100 eligible visits.",
  },
  {
    name: "Evidence visibility",
    difference: "Collapsed evidence versus the same evidence open upfront.",
    hypothesis:
      "Visible proof increases informed action without slowing discovery.",
    metric:
      "Visits with ≥1 save action per 100 eligible visits; evidence engagement as a diagnostic.",
  },
  {
    name: "Information density",
    difference:
      "Compact versus spacious presentation of the same trust information.",
    hypothesis:
      "More breathing room improves comprehension without hiding the action.",
    metric:
      "Visits with ≥1 save action per 100 eligible visits; restriction comprehension as a diagnostic.",
  },
  {
    name: "No-code fallback",
    difference:
      "The same alternatives action before versus after the explanation.",
    hypothesis: "An immediate alternative keeps no-code visits useful.",
    metric: "Visits with ≥1 store click-out per 100 eligible no-code visits.",
  },
];
export function Experiments({ onAction }: { onAction: (m: Merchant) => void }) {
  const [index, setIndex] = useState(0);
  const [property, setProperty] = useState("Position");
  const exp = experiments[index];
  const merchant = index === 3 ? "Kith" : "Vistaprint";
  const r = evidence[merchant];
  return (
    <section className="experiments" id="experiments">
      <div className="section-line">
        <h2>Design Experiments</h2>
        <span>One variable at a time</span>
      </div>
      <div className="experiment-controls">
        <label>
          Explore
          <select
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
          >
            {experiments.map((x, i) => (
              <option key={x.name} value={i}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        {index === 0 && (
          <label>
            CTA property
            <select
              value={property}
              onChange={(e) => setProperty(e.target.value)}
            >
              {["Position", "Size", "Prominence", "Wording"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="experiment-meta">
        <p>
          <b>Difference</b>
          {index === 0
            ? `${property} only. All other content stays the same.`
            : exp.difference}
        </p>
        <p>
          <b>Hypothesis</b>
          {exp.hypothesis}
        </p>
        <p>
          <b>Success metric</b>
          {exp.metric}
        </p>
      </div>
      <div className="experiment-previews">
        {[0, 1].map((version) => {
          const cta = (
            <button
              className={`primary experiment-cta ${index === 0 && version === 1 ? `test-${property.toLowerCase()}` : ""}`}
              onClick={() => onAction(merchant)}
            >
              {index === 0 && property === "Wording" && version === 1
                ? "Review the offer on SimplyCodes"
                : r.action}
              <span>↗</span>
            </button>
          );
          const early =
            (index === 0 && property === "Position" && version === 1) ||
            (index === 3 && version === 1);
          return (
            <div
              className="experiment-variant"
              key={`${index}-${property}-${version}`}
            >
              <div className="variant-label">
                {version === 0 ? "CONTROL" : "VARIATION"}
                <span>
                  {index === 0
                    ? property
                    : index === 1
                      ? version
                        ? "Upfront"
                        : "On demand"
                      : index === 2
                        ? version
                          ? "Spacious"
                          : "Compact"
                        : version
                          ? "Action first"
                          : "Explanation first"}
                </span>
              </div>
              <div
                className={`experiment-card ${index === 2 && version === 1 ? "spacious" : ""}`}
              >
                <div className="eyebrow">{merchant}</div>
                <h3>{r.offer}</h3>
                {early && cta}
                <p>
                  {r.verified
                    ? "Storewide. Your cart’s eligibility is unknown."
                    : "Two community codes, neither verified. Other savings may have their own restrictions."}
                </p>
                {index === 1 ? (
                  <details open={version === 1 ? true : undefined}>
                    <summary>Verification evidence</summary>
                    <p>
                      Recorded Health 100% · 185 verifications. Observed October
                      22, 2026. Exact verification time and expiry unknown.
                    </p>
                  </details>
                ) : (
                  index !== 3 && (
                    <div className="experiment-signals">
                      <span>{r.health}% recorded Health</span>
                      <span>{r.verifications} verifications</span>
                      <span>Eligibility unknown</span>
                    </div>
                  )
                )}
                {!early && cta}
              </div>
            </div>
          );
        })}
      </div>
      <p className="experiment-footnote">
        Production metric: count each qualifying visit once after a reveal,
        copy, or store click-out. Organic search traffic is a guardrail. These
        local handoffs record no saves. A/B/C are broad concepts; the pairs
        above isolate a proposed change, not measured winners.
      </p>
    </section>
  );
}
