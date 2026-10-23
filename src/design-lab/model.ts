import type { Layout, Merchant } from "../part-two-evidence";
export const STORAGE_KEY = "simplycodes-design-lab-v1";
export const blockTypes = [
  "header",
  "coupon",
  "cta",
  "signals",
  "evidence",
  "eligibility",
  "alternatives",
  "notification",
] as const;
export type BlockType = (typeof blockTypes)[number];
export const blockNames: Record<BlockType, string> = {
  header: "Merchant header",
  coupon: "Coupon card",
  cta: "Primary CTA",
  signals: "Verification signals",
  evidence: "Evidence disclosure",
  eligibility: "Eligibility selector",
  alternatives: "Alternative stores",
  notification: "Notification prompt",
};
export type BlockStyle = {
  padding: number;
  margin: number;
  fontSize: number;
  align: "left" | "center" | "right";
  color: string;
  background: string;
  radius: number;
  weight: 400 | 500 | 600 | 700;
  button: "solid" | "outline" | "text";
};
export type Block = {
  id: BlockType;
  visible: boolean;
  text: string;
  style: BlockStyle;
};
export type Task = "offer" | "no-code" | "discovery";
export const taskNames: Record<Task, string> = {
  offer: "Find a supported offer and inspect its evidence",
  "no-code": "Find a useful next step without a verified code",
  discovery: "Find similar stores or future offer updates",
};
export type Fix = {
  kind: "show" | "headline" | "cta" | "contrast" | "padding" | "move";
  block: BlockType;
};
export type Finding = {
  id: string;
  title: string;
  status: "pass" | "issue" | "manual";
  severity: "high" | "medium" | "low" | "info";
  evidence: string;
  suggestion: string;
  block?: BlockType;
  fix?: Fix;
};
export type Review = {
  signature: string;
  merchant: Merchant;
  task: Task;
  at: string;
  findings: Finding[];
  axeVersion: string;
};
export type Design = {
  id: string;
  name: string;
  layout: Layout;
  blocks: Block[];
  hypothesis: string;
  review?: Review;
};
export type Workspace = { schema: 1; activeId: string; versions: Design[] };
export function uid() {
  return crypto.randomUUID();
}
export function makeDesign(layout: Layout = "B", name = "Version A"): Design {
  const style: BlockStyle = {
    padding: 14,
    margin: 8,
    fontSize: 14,
    align: "left",
    color: "#e7efe9",
    background: "#111b15",
    radius: 10,
    weight: 400,
    button: "solid",
  };
  const texts: Record<BlockType, string> = {
    header: "promo codes & coupons",
    coupon: "Check the terms for your cart.",
    cta: "",
    signals: "Verification snapshot",
    evidence: "Inspect verification evidence",
    eligibility: "Your eligibility",
    alternatives: "Similar stores",
    notification: "Future offer updates",
  };
  const order: BlockType[] =
    layout === "A"
      ? [
          "header",
          "signals",
          "coupon",
          "cta",
          "evidence",
          "eligibility",
          "alternatives",
          "notification",
        ]
      : layout === "C"
        ? [
            "header",
            "signals",
            "coupon",
            "cta",
            "evidence",
            "eligibility",
            "alternatives",
            "notification",
          ]
        : [
            "header",
            "coupon",
            "cta",
            "signals",
            "evidence",
            "eligibility",
            "alternatives",
            "notification",
          ];
  return {
    id: uid(),
    name,
    layout,
    hypothesis: "",
    blocks: order.map((id) => ({
      id,
      visible: true,
      text: texts[id],
      style: {
        ...style,
        ...(id === "header"
          ? {
              fontSize: layout === "C" ? 27 : 25,
              background: "#0c110e",
              weight: 600 as const,
            }
          : id === "cta"
            ? {
                color: "#102a19",
                background: "#8aefaa",
                weight: 600 as const,
                padding: 16,
              }
            : id === "coupon"
              ? {
                  fontSize: layout === "B" ? 32 : 25,
                  background: layout === "C" ? "#e2e9db" : "#1a2d21",
                  color: layout === "C" ? "#203726" : "#e7efe9",
                  padding: 18,
                }
              : id === "signals"
                ? {
                    fontSize: 12,
                    background: layout === "C" ? "#d9e4d3" : "#1b2a20",
                    color: layout === "C" ? "#203726" : "#e7efe9",
                  }
                : id === "alternatives" || id === "notification"
                  ? { fontSize: 13 }
                  : {}),
        radius: layout === "C" ? 3 : 10,
      },
    })),
  };
}
export function newWorkspace(): Workspace {
  const d = makeDesign();
  return { schema: 1, activeId: d.id, versions: [d] };
}
export function signature(d: Design) {
  return JSON.stringify({ layout: d.layout, blocks: d.blocks });
}
export function moveBlock(d: Design, id: BlockType, index: number): Design {
  const blocks = [...d.blocks];
  const from = blocks.findIndex((b) => b.id === id);
  if (from < 0) return d;
  const [b] = blocks.splice(from, 1);
  blocks.splice(Math.max(0, Math.min(index, blocks.length)), 0, b);
  return { ...d, blocks };
}
export function applyFix(d: Design, fix: Fix): Design {
  if (fix.kind === "move") {
    const coupon = d.blocks
      .filter((b) => b.id !== "cta")
      .findIndex((b) => b.id === "coupon");
    return moveBlock(d, "cta", coupon + 1);
  }
  return {
    ...d,
    blocks: d.blocks.map((b) =>
      b.id !== fix.block
        ? b
        : {
            ...b,
            ...(fix.kind === "show" ? { visible: true } : {}),
            ...(fix.kind === "headline"
              ? { text: "promo codes & coupons" }
              : {}),
            style: {
              ...b.style,
              ...(fix.kind === "cta"
                ? {
                    button: "solid",
                    background: "#8aefaa",
                    color: "#102a19",
                    padding: 16,
                    weight: 600 as const,
                  }
                : fix.kind === "contrast"
                  ? {
                      color:
                        contrastRatio("#ffffff", b.style.background) >=
                        contrastRatio("#000000", b.style.background)
                          ? "#ffffff"
                          : "#000000",
                    }
                  : fix.kind === "padding"
                    ? { padding: 14, margin: 8 }
                    : {}),
            },
          },
    ),
  };
}
export function contrastRatio(a: string, b: string) {
  const lum = (hex: string) => {
    const v = hex
      .slice(1)
      .match(/../g)!
      .map((x) => parseInt(x, 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return v[0] * 0.2126 + v[1] * 0.7152 + v[2] * 0.0722;
  };
  const x = lum(a),
    y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a JSON object.");
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some((k) => !allowed.includes(k)))
    throw new Error(
      "Unexpected fields. Verification evidence and external destinations cannot be imported.",
    );
}
function str(v: unknown, max = 240) {
  if (typeof v !== "string" || v.length > max)
    throw new Error("Invalid or oversized text field.");
  return v;
}
function choice<T extends string>(v: unknown, values: readonly T[]): T {
  if (typeof v !== "string" || !values.includes(v as T))
    throw new Error("Unsupported value.");
  return v as T;
}
function num(v: unknown, min: number, max: number) {
  if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max)
    throw new Error(`Numeric values must be between ${min} and ${max}.`);
  return v;
}
function color(v: unknown) {
  if (typeof v !== "string" || !/^#[0-9a-f]{6}$/i.test(v))
    throw new Error("Colors must use six-digit hex values.");
  return v;
}
function parseReview(v: unknown): Review | undefined {
  if (v === undefined) return undefined;
  const r = object(v);
  if (!Array.isArray(r.findings) || r.findings.length > 80)
    throw new Error("Invalid review.");
  return {
    signature: str(r.signature, 20000),
    merchant: choice(r.merchant, ["Vistaprint", "Kith"]),
    task: choice(r.task, ["offer", "no-code", "discovery"]),
    at: str(r.at, 60),
    axeVersion: str(r.axeVersion, 30),
    findings: r.findings.map((value) => {
      const f = object(value);
      return {
        id: str(f.id, 100),
        title: str(f.title, 180),
        status: choice(f.status, ["pass", "issue", "manual"]),
        severity: choice(f.severity, ["high", "medium", "low", "info"]),
        evidence: str(f.evidence, 1600),
        suggestion: str(f.suggestion, 1000),
        ...(f.block ? { block: choice(f.block, blockTypes) } : {}),
        ...(f.fix
          ? {
              fix: {
                kind: choice(object(f.fix).kind, [
                  "show",
                  "headline",
                  "cta",
                  "contrast",
                  "padding",
                  "move",
                ]),
                block: choice(object(f.fix).block, blockTypes),
              },
            }
          : {}),
      };
    }),
  };
}
export function parseWorkspace(text: string): Workspace {
  if (text.length > 600000)
    throw new Error("File is too large (600 KB maximum).");
  const w = object(JSON.parse(text));
  keys(w, ["schema", "activeId", "versions"]);
  if (
    w.schema !== 1 ||
    !Array.isArray(w.versions) ||
    w.versions.length < 1 ||
    w.versions.length > 8
  )
    throw new Error(
      "Expected Design Lab schema 1, with one to eight versions.",
    );
  const versions = w.versions.map((value) => {
    const d = object(value);
    keys(d, ["id", "name", "layout", "blocks", "hypothesis", "review"]);
    if (!Array.isArray(d.blocks) || d.blocks.length !== 8)
      throw new Error("A design must contain all eight component definitions.");
    const seen = new Set();
    const blocks = d.blocks.map((value) => {
      const b = object(value);
      keys(b, ["id", "visible", "text", "style"]);
      const id = choice(b.id, blockTypes);
      if (seen.has(id)) throw new Error("Duplicate component definition.");
      seen.add(id);
      if (typeof b.visible !== "boolean")
        throw new Error("Visibility must be boolean.");
      const s = object(b.style);
      keys(s, [
        "padding",
        "margin",
        "fontSize",
        "align",
        "color",
        "background",
        "radius",
        "weight",
        "button",
      ]);
      const weight = num(s.weight, 400, 700);
      if (![400, 500, 600, 700].includes(weight))
        throw new Error("Unsupported font weight.");
      return {
        id,
        visible: b.visible,
        text: str(b.text),
        style: {
          padding: num(s.padding, 0, 80),
          margin: num(s.margin, 0, 60),
          fontSize: num(s.fontSize, 10, 64),
          align: choice(s.align, ["left", "center", "right"]),
          color: color(s.color),
          background: color(s.background),
          radius: num(s.radius, 0, 36),
          weight: weight as BlockStyle["weight"],
          button: choice(s.button, ["solid", "outline", "text"]),
        },
      };
    });
    return {
      id: str(d.id, 80),
      name: str(d.name, 60),
      layout: choice(d.layout, ["A", "B", "C"]),
      blocks,
      hypothesis: str(d.hypothesis, 500),
      review: parseReview(d.review),
    };
  });
  if (new Set(versions.map((d) => d.id)).size !== versions.length)
    throw new Error("Version identifiers must be unique.");
  const activeId = str(w.activeId, 80);
  if (!versions.some((d) => d.id === activeId))
    throw new Error("Active version not found.");
  return { schema: 1, activeId, versions };
}
export function participantLink(d: Design, merchant: Merchant, task: Task) {
  const clean = { ...d, review: undefined };
  const data = JSON.stringify({
    workspace: { schema: 1, activeId: d.id, versions: [clean] },
    merchant,
    task,
  });
  const bytes = new TextEncoder().encode(data);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const encoded = btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  return `${location.origin}${location.pathname}#lab-test/${encoded}`;
}
export function readParticipant(hash: string) {
  const payload = hash.slice("#lab-test/".length);
  if (payload.length > 60000) throw new Error("Participant link is too long.");
  const binary = atob(payload.replaceAll("-", "+").replaceAll("_", "/"));
  const value = object(
    JSON.parse(
      new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0))),
    ),
  );
  return {
    workspace: parseWorkspace(JSON.stringify(value.workspace)),
    merchant: choice(value.merchant, ["Vistaprint", "Kith"]),
    task: choice(value.task, ["offer", "no-code", "discovery"]),
  };
}
