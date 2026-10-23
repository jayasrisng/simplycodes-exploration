import { describe, it, expect } from "vitest";
import {
  makeDesign,
  parseWorkspace,
  moveBlock,
  applyFix,
  signature,
  type Workspace,
} from "./model";
function workspace(): Workspace {
  const d = makeDesign("B");
  return { schema: 1, activeId: d.id, versions: [d] };
}
describe("portable design model", () => {
  it("round-trips all eight components, styles, order and versions", () => {
    const w = workspace();
    const b = makeDesign("C", "Version B");
    w.versions.push(b);
    w.activeId = b.id;
    expect(parseWorkspace(JSON.stringify(w))).toEqual(w);
  });
  it("rejects imported evidence, destinations and arbitrary CSS", () => {
    const w = workspace();
    expect(() =>
      parseWorkspace(JSON.stringify({ ...w, evidence: { health: 100 } })),
    ).toThrow(/Unexpected/);
    const data = JSON.parse(JSON.stringify(w));
    data.versions[0].blocks[0].style.background = "url(javascript:alert(1))";
    expect(() => parseWorkspace(JSON.stringify(data))).toThrow(/hex/);
    data.versions[0].blocks[0].style.background = "#ffffff";
    data.versions[0].blocks[0].destination = "https://example.com";
    expect(() => parseWorkspace(JSON.stringify(data))).toThrow(/Unexpected/);
  });
  it("rejects duplicate components, non-finite/out-of-range values, and unsupported versions", () => {
    const w = workspace();
    w.versions[0].blocks[0].id = "cta";
    expect(() => parseWorkspace(JSON.stringify(w))).toThrow(/Duplicate/);
    const d = workspace();
    d.versions[0].blocks[0].style.fontSize = 999;
    expect(() => parseWorkspace(JSON.stringify(d))).toThrow(/between/);
    expect(() =>
      parseWorkspace(JSON.stringify({ ...workspace(), schema: 2 })),
    ).toThrow(/schema/);
  });
  it("moves flow components without losing identity or styles", () => {
    const d = makeDesign();
    const result = moveBlock(d, "cta", 0);
    expect(result.blocks[0].id).toBe("cta");
    expect(result.blocks.find((b) => b.id === "cta")).toEqual(
      d.blocks.find((b) => b.id === "cta"),
    );
    expect(d.blocks[0].id).toBe("header");
  });
  it("safe fixes change only the targeted presentation and make reports stale", () => {
    const d = makeDesign();
    d.blocks.find((b) => b.id === "cta")!.visible = false;
    const before = signature(d);
    const result = applyFix(d, { kind: "show", block: "cta" });
    expect(result.blocks.find((b) => b.id === "cta")!.visible).toBe(true);
    expect(signature(result)).not.toBe(before);
    expect(result.blocks.filter((b) => b.id !== "cta")).toEqual(
      d.blocks.filter((b) => b.id !== "cta"),
    );
  });
  it("chooses a genuinely contrasting foreground for deterministic contrast fixes", () => {
    const d = makeDesign();
    const b = d.blocks.find((b) => b.id === "header")!;
    b.style.background = "#ffffff";
    b.style.color = "#ffffff";
    expect(
      applyFix(d, { kind: "contrast", block: "header" }).blocks.find(
        (b) => b.id === "header",
      )!.style.color,
    ).toBe("#000000");
  });
});
