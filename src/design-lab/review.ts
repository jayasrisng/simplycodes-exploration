import { evidence, type Merchant } from "../part-two-evidence";
import {
  type Design,
  type Review,
  type Finding,
  type Task,
  type BlockType,
  signature,
  contrastRatio,
} from "./model";
import { blockFromElement } from "./Preview";
const frame = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
const visible = (el: Element | null): el is HTMLElement =>
  !!el &&
  el.getClientRects().length > 0 &&
  getComputedStyle(el).visibility !== "hidden" &&
  getComputedStyle(el).display !== "none";
export async function reviewDesign(
  root: HTMLElement,
  design: Design,
  merchant: Merchant,
  task: Task,
): Promise<Review> {
  const findings: Finding[] = [];
  const add = (finding: Finding) => findings.push(finding);
  const r = evidence[merchant];
  const oldScroll = root.scrollTop;
  root.scrollTop = 0;
  await document.fonts.ready;
  await frame();
  const headline = root.querySelector("[data-lab-headline]");
  const card = root.querySelector('[data-block-id="coupon"]');
  const cta = root.querySelector<HTMLElement>("[data-lab-primary]");
  const proof = root.querySelector<HTMLDetailsElement>("[data-lab-evidence]");
  const rect = root.getBoundingClientRect();
  const offset = (el: HTMLElement) =>
    Math.round(el.getBoundingClientRect().bottom - rect.top + root.scrollTop);
  const headlineOK =
    visible(headline) &&
    headline.textContent!.includes(merchant) &&
    /promo|coupon|discount/i.test(headline.textContent!);
  add({
    id: "intent",
    title: "Merchant search intent",
    status: headlineOK ? "pass" : "issue",
    severity: headlineOK ? "info" : "high",
    evidence: visible(headline)
      ? `Rendered headline: “${headline.textContent}”.`
      : "The merchant headline is hidden or absent.",
    suggestion:
      "Keep the merchant name and coupon or promo-code intent in the visible headline.",
    block: "header",
    ...(!headlineOK
      ? {
          fix: {
            kind: visible(headline) ? "headline" : "show",
            block: "header",
          },
        }
      : {}),
  });
  for (const [id, title, el, block] of [
    ["headline-fold", "Headline within first viewport", headline, "header"],
    ["card-fold", "Complete top card within first viewport", card, "coupon"],
    ["cta-fold", "Primary action within first viewport", cta, "cta"],
  ] as const) {
    const shown = visible(el);
    const bottom = shown ? offset(el) : null;
    const inFold =
      shown && bottom! <= 844 && el.getBoundingClientRect().top >= rect.top;
    add({
      id,
      title,
      status: inFold ? "pass" : "issue",
      severity: inFold ? "info" : "high",
      evidence: shown
        ? `Bottom edge ${bottom}px from canvas top; 844px limit. Canvas width ${Math.round(rect.width)}px.`
        : `${title.split(" within")[0]} is not rendered.`,
      suggestion: shown
        ? "Reduce spacing or move this component earlier in the flow."
        : "Restore this component to the design.",
      block,
      ...(!shown
        ? { fix: { kind: "show", block } }
        : !inFold
          ? { fix: { kind: block === "cta" ? "move" : "padding", block } }
          : {}),
    });
  }
  if (visible(cta)) {
    const style = getComputedStyle(cta);
    const distinct =
      style.backgroundColor !== "rgba(0, 0, 0, 0)" &&
      style.backgroundColor !== getComputedStyle(root).backgroundColor &&
      Number(style.fontWeight) >= 500;
    add({
      id: "prominence",
      title: "Distinct primary action treatment",
      status: distinct ? "pass" : "issue",
      severity: distinct ? "info" : "medium",
      evidence: `Background ${style.backgroundColor}; font weight ${style.fontWeight}. This is a style heuristic, not a prediction of attention.`,
      suggestion: "Use a solid, contrasting treatment for the primary action.",
      block: "cta",
      ...(!distinct ? { fix: { kind: "cta", block: "cta" } } : {}),
    });
  }
  const evidenceOK =
    visible(proof) &&
    !!proof.querySelector("summary") &&
    proof.querySelector("a")?.getAttribute("href") === r.source;
  add({
    id: "evidence",
    title: "Evidence is accessible",
    status: evidenceOK ? "pass" : "issue",
    severity: evidenceOK ? "info" : "high",
    evidence: evidenceOK
      ? "A native disclosure exposes the dated record and original source link."
      : "A usable evidence disclosure or source link is missing.",
    suggestion: "Keep the evidence disclosure visible.",
    block: "evidence",
    ...(!evidenceOK ? { fix: { kind: "show", block: "evidence" } } : {}),
  });
  const unknown = [...root.querySelectorAll("[data-lab-unknown]")].some(
    (el) =>
      visible(el) &&
      /unknown|not establish|restrictions/i.test(el.textContent || ""),
  );
  add({
    id: "unknown",
    title: "Eligibility and restrictions remain explicit",
    status: unknown ? "pass" : "issue",
    severity: unknown ? "info" : "high",
    evidence: unknown
      ? "Visible copy states that cart eligibility or restrictions are unknown."
      : "No visible uncertainty copy was found.",
    suggestion:
      "Restore the coupon card’s visible uncertainty copy; do not infer eligibility.",
    block: "coupon",
    ...(!unknown ? { fix: { kind: "show", block: "coupon" } } : {}),
  });
  if (!r.verified) {
    const honest =
      visible(card) &&
      /neither verified|not current acceptance/i.test(card.textContent || "") &&
      visible(cta);
    add({
      id: "no-code",
      title: "Honest no-code next step",
      status: honest ? "pass" : "issue",
      severity: honest ? "info" : "high",
      evidence: honest
        ? "The card distinguishes community history from verification and offers an alternatives action."
        : "The no-code explanation or alternatives action is missing.",
      suggestion:
        "Keep the no-code card and its alternatives action available.",
      block: visible(card) ? "cta" : "coupon",
      ...(!honest
        ? { fix: { kind: "show", block: visible(card) ? "cta" : "coupon" } }
        : {}),
    });
  }
  const taskMatch = task !== "offer" || merchant === "Vistaprint";
  const noCodeMatch = task !== "no-code" || merchant === "Kith";
  add({
    id: "task-state",
    title: "Selected task matches the merchant state",
    status: taskMatch && noCodeMatch ? "pass" : "issue",
    severity: taskMatch && noCodeMatch ? "info" : "medium",
    evidence: `Task: ${task}. Rendered merchant: ${merchant}.`,
    suggestion:
      "Choose Vistaprint for the supported-offer task, or Kith for the no-code task.",
  });
  // Exercise only local prototype controls. Never open an external destination.
  if (visible(cta)) {
    cta.click();
    await frame();
    const link = root.querySelector(".lab-handoff a");
    const pathOK = link?.getAttribute("href") === r.destination;
    add({
      id: "journey",
      title: "Prototype action reaches the source handoff",
      status: pathOK ? "pass" : "issue",
      severity: pathOK ? "info" : "high",
      evidence: pathOK
        ? "Clicked the local CTA and found the expected SimplyCodes destination. No external checkout or acceptance was tested."
        : "The local CTA did not produce the expected source handoff.",
      suggestion: "Restore the primary CTA and its fixed source destination.",
      block: "cta",
    });
    root.querySelector<HTMLButtonElement>("[data-lab-return]")?.click();
    await frame();
  } else
    add({
      id: "journey",
      title: "Prototype action reaches the source handoff",
      status: "issue",
      severity: "high",
      evidence: "There is no visible primary action to exercise.",
      suggestion: "Restore the primary CTA.",
      block: "cta",
      fix: { kind: "show", block: "cta" },
    });
  if (task === "discovery") {
    const alternatives = root.querySelector("[data-lab-alternatives] a");
    const notify = root.querySelector<HTMLButtonElement>(
      "[data-lab-alert-toggle]",
    );
    let alertOK = false;
    if (visible(notify)) {
      const wasOpen = notify.getAttribute("aria-expanded") === "true";
      if (!wasOpen) notify.click();
      await frame();
      alertOK = visible(root.querySelector(".lab-alert"));
      if (!wasOpen) notify.click();
      await frame();
    }
    add({
      id: "discovery-task",
      title: "Similar stores or updates can be discovered",
      status: visible(alternatives) || alertOK ? "pass" : "issue",
      severity: visible(alternatives) || alertOK ? "info" : "high",
      evidence: `Related-store link ${visible(alternatives) ? "available" : "absent"}; local alert preview ${alertOK ? "opened" : "unavailable"}.`,
      suggestion: "Restore alternatives or the notification concept.",
      block: "alternatives",
      ...(!visible(alternatives) && !alertOK
        ? { fix: { kind: "show", block: "alternatives" } }
        : {}),
    });
  }
  const targets = [
    ...root.querySelectorAll<HTMLElement>(
      "button,summary,select,a.lab-action,a.lab-secondary",
    ),
  ].filter((el) => visible(el));
  const small = targets.filter((el) => {
    const b = el.getBoundingClientRect();
    return b.width < 44 || b.height < 44;
  });
  add({
    id: "touch",
    title: "44px touch-target design target",
    status: small.length ? "issue" : "pass",
    severity: small.length ? "medium" : "info",
    evidence: small.length
      ? small
          .slice(0, 4)
          .map(
            (el) =>
              `${el.textContent?.trim().slice(0, 40)}: ${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)}px`,
          )
          .join("; ")
      : `${targets.length} visible primary controls meet 44×44px. This design target exceeds WCAG 2.2 AA’s 24px minimum (exceptions apply).`,
    suggestion:
      "Increase action padding. Review inline-link exceptions separately.",
    block: small[0] ? blockFromElement(small[0]) : undefined,
    ...(small[0] && blockFromElement(small[0]) === "cta"
      ? { fix: { kind: "cta", block: "cta" } }
      : {}),
  });
  const previousWidth = root.style.width;
  const overflowWidths: number[] = [];
  for (const width of [390, 320]) {
    root.style.width = `${width}px`;
    await frame();
    const horizontal = root.scrollWidth > root.clientWidth + 1;
    if (horizontal) overflowWidths.push(width);
  }
  root.style.width = previousWidth;
  await frame();
  add({
    id: "overflow",
    title: "Mobile content fits at 390px and 320px",
    status: overflowWidths.length ? "issue" : "pass",
    severity: overflowWidths.length ? "high" : "info",
    evidence: overflowWidths.length
      ? `Horizontal overflow at ${overflowWidths.join(" and ")}px.`
      : "No horizontal scroll overflow detected at either width.",
    suggestion: "Reduce oversized type or spacing and allow long text to wrap.",
  });
  const claim = design.blocks.find(
    (b) =>
      b.visible &&
      /guaranteed|100% success|verified today|saved\s*\$/i.test(b.text),
  );
  if (claim)
    add({
      id: "claims",
      title: "Unsupported copy needs review",
      status: "issue",
      severity: "high",
      evidence: `Editable copy contains “${claim.text}”.`,
      suggestion:
        "Remove acceptance or freshness guarantees unsupported by the fixed record.",
      block: claim.id,
    });
  // Read actual foreground/background styles, including identical-color text
  // that axe may defer for human inspection. Templates use solid colors only.
  const hex = (css: string): string | null => {
    const values = css.match(/[\d.]+/g)?.map(Number);
    if (
      !values ||
      values.length < 3 ||
      (values.length === 4 && values[3] === 0)
    )
      return null;
    return (
      "#" +
      values
        .slice(0, 3)
        .map((v) => Math.round(v).toString(16).padStart(2, "0"))
        .join("")
    );
  };
  const failedContrast = new Map<
    BlockType,
    { ratio: number; threshold: number; fg: string; bg: string; sample: string }
  >();
  for (const el of root.querySelectorAll<HTMLElement>(
    "h2,h2 span,h3,p,dt,dd,summary,button,a",
  )) {
    if (!visible(el) || !el.textContent?.trim()) continue;
    const block = blockFromElement(el);
    if (!block) continue;
    const style = getComputedStyle(el);
    const fg = hex(style.color);
    let ancestor: HTMLElement | null = el;
    let bg: string | null = null;
    while (ancestor && !bg) {
      bg = hex(getComputedStyle(ancestor).backgroundColor);
      ancestor = ancestor.parentElement;
    }
    if (!fg || !bg) continue;
    const ratio = contrastRatio(fg, bg);
    const large =
      parseFloat(style.fontSize) >= 24 ||
      (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
    const threshold = large ? 3 : 4.5;
    if (ratio < threshold && !failedContrast.has(block))
      failedContrast.set(block, {
        ratio,
        threshold,
        fg,
        bg,
        sample: el.textContent.trim().slice(0, 60),
      });
  }
  if (!failedContrast.size)
    add({
      id: "rendered-contrast",
      title: "Rendered text contrast",
      status: "pass",
      severity: "info",
      evidence:
        "Sampled visible text meets 4.5:1 normal-text or 3:1 large-text thresholds against its rendered solid background.",
      suggestion:
        "Check all interactive and assistive-technology states with people.",
    });
  for (const [block, value] of failedContrast)
    add({
      id: `contrast-${block}`,
      title: `Text contrast · ${block}`,
      status: "issue",
      severity: "high",
      evidence: `“${value.sample}”: ${value.ratio.toFixed(2)}:1; required ${value.threshold}:1. Foreground ${value.fg}, background ${value.bg}.`,
      suggestion:
        "Choose a foreground that meets the applicable WCAG 1.4.3 contrast threshold.",
      block,
      fix: { kind: block === "cta" ? "cta" : "contrast", block },
    });
  const axe = await import("axe-core");
  let axeVersion = axe.default.version;
  try {
    const result = await axe.default.run(root, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
      },
    });
    if (!result.violations.length)
      add({
        id: "axe",
        title: "Automated WCAG accessibility checks",
        status: "pass",
        severity: "info",
        evidence: `axe-core ${axeVersion}: ${result.passes.length} applicable rules passed; no violations detected.`,
        suggestion:
          "Automated checks do not replace keyboard, screen-reader, or participant testing.",
      });
    for (const v of result.violations) {
      const node = v.nodes[0];
      const element = node?.target?.[0];
      let el: Element | null = null;
      try {
        if (typeof element === "string") el = root.querySelector(element);
      } catch {
        /* axe can return compound selectors */
      }
      const b = el ? blockFromElement(el) : undefined;
      add({
        id: `axe-${v.id}`,
        title: v.help,
        status: "issue",
        severity:
          v.impact === "critical" || v.impact === "serious" ? "high" : "medium",
        evidence:
          `${v.nodes.length} affected element(s). ${node?.failureSummary || v.description}`.slice(
            0,
            1500,
          ),
        suggestion: v.description,
        block: b,
        ...(v.id === "color-contrast" && b
          ? { fix: { kind: b === "cta" ? "cta" : "contrast", block: b } }
          : {}),
      });
    }
    if (result.incomplete.length)
      add({
        id: "axe-manual",
        title: "Accessibility checks needing human judgment",
        status: "manual",
        severity: "info",
        evidence: `axe could not fully resolve ${result.incomplete.length} rule(s): ${result.incomplete.map((x) => x.id).join(", ")}.`,
        suggestion: "Inspect these states with keyboard and a screen reader.",
      });
  } catch (error) {
    add({
      id: "axe-error",
      title: "Accessibility scan did not complete",
      status: "manual",
      severity: "high",
      evidence:
        error instanceof Error ? error.message : "Unknown scan failure.",
      suggestion: "Retry the review; no accessibility pass is claimed.",
    });
  }
  add({
    id: "human",
    title: "Focus, comprehension, and real task completion",
    status: "manual",
    severity: "info",
    evidence:
      "The preview has scoped :focus-visible styles and native controls. Real participant behavior and assistive-technology use were not observed.",
    suggestion:
      "Use the participant link to test keyboard focus, reading order, and comprehension with people.",
  });
  root.scrollTop = oldScroll;
  return {
    signature: signature(design),
    merchant,
    task,
    at: new Date().toISOString(),
    findings,
    axeVersion,
  };
}
