import { describe, it, expect } from "vitest";
import {
  actionFor,
  evidenceExample,
  validateBreadcrumb,
  breadcrumbExample,
  answerFor,
  type PromoVerdict,
} from "./evidence";
describe("Published MCP envelope adaptation", () => {
  it("keeps four verdicts distinct and absent evidence empty", () => {
    for (const v of [
      "VERIFIED_OK",
      "CONFIDENT_NO",
      "UNTESTED",
      "WITHHELD",
    ] as PromoVerdict[]) {
      const r = evidenceExample(v);
      expect(r.verdict).toBe(v);
      expect(r.offers).toHaveLength(v === "VERIFIED_OK" ? 1 : 0);
      expect(r.meta.verified_at === null).toBe(
        v === "UNTESTED" || v === "WITHHELD",
      );
      expect(JSON.stringify(r)).not.toContain('"code":');
      expect(answerFor(r)).toBeTruthy();
    }
  });
  it("requires eligibility before preparing a verified offer link", () => {
    const r = evidenceExample("VERIFIED_OK");
    expect(actionFor(r, "unknown").ready).toBe(false);
    expect(actionFor(r, "yes").url).toContain("simplycodes.com");
    expect(actionFor(r, "no").url).toContain("nike.com/w/sale");
  });
  it("never promotes untested or unavailable evidence into an approved saving", () => {
    for (const v of ["UNTESTED", "WITHHELD"] as PromoVerdict[])
      expect(actionFor(evidenceExample(v), "yes").ready).toBe(false);
    expect(actionFor(evidenceExample("CONFIDENT_NO"), "unknown").label).toBe(
      "Open Nike’s sale",
    );
  });
});
describe("Google breadcrumb requirements", () => {
  it("includes a visible trail with ordered required fields and no product claims", () => {
    expect(validateBreadcrumb(breadcrumbExample)).toEqual([]);
    expect(JSON.stringify(breadcrumbExample)).not.toMatch(
      /Product|Offer|rating/,
    );
  });
  it("rejects missing, unordered or non-URL items", () => {
    expect(
      validateBreadcrumb({ ...breadcrumbExample, itemListElement: [] }),
    ).not.toEqual([]);
    expect(
      validateBreadcrumb({
        ...breadcrumbExample,
        itemListElement: [
          { ...breadcrumbExample.itemListElement[0], position: 0, item: "" },
          breadcrumbExample.itemListElement[1],
        ],
      }),
    ).not.toEqual([]);
  });
});
