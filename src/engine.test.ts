import { describe, it, expect } from "vitest";
import {
  initialCart,
  offers,
  evaluate,
  recommend,
  totals,
  attempt,
  contribution,
} from "./engine";
describe("coupon eligibility and recommendation", () => {
  it("chooses the best supported returning-customer offer", () =>
    expect(recommend(initialCart)?.code).toBe("PRINT25"));
  it("rejects a larger new-customer coupon for returning shoppers", () =>
    expect(evaluate(offers[0], initialCart)).toBe("INELIGIBLE"));
  it("asks about unknown student status instead of guessing", () =>
    expect(evaluate(offers[2], initialCart)).toBe("CONDITIONALLY APPLICABLE"));
  it("uses a student offer only after confirmation", () =>
    expect(recommend({ ...initialCart, student: "yes" })?.code).toBe(
      "STUDENT30",
    ));
  it("supports a newly eligible first-order offer", () =>
    expect(recommend({ ...initialCart, customer: "new" })?.code).toBe(
      "WELCOME40",
    ));
  it("excludes full-price offers for sale carts", () =>
    expect(recommend({ ...initialCart, sale: true })?.code).toBe("SAVE15"));
  it("handles minimum spend, category, merchant and invalid amounts", () => {
    for (const c of [
      { ...initialCart, amount: 99 },
      { ...initialCart, category: "Shoes" as const },
      { ...initialCart, merchant: "Nike" as const },
      { ...initialCart, amount: NaN },
      { ...initialCart, amount: -1 },
    ])
      expect(evaluate(offers[1], c)).toBe("INELIGIBLE");
  });
  it("never upgrades unverified offers", () => {
    const c = { ...initialCart, merchant: "Nike" as const };
    expect(evaluate(offers[4], c)).toBe("UNVERIFIED");
    expect(recommend(c)).toBeUndefined();
  });
  it("has no code when no minimum is met", () =>
    expect(recommend({ ...initialCart, amount: 20 })).toBeUndefined());
});
describe("checkout and arithmetic", () => {
  it("calculates cents and shipping consistently", () =>
    expect(totals(120, 25)).toEqual({
      subtotal: 120,
      discount: 30,
      shipping: 0,
      total: 90,
    }));
  it("clamps invalid amounts and discounts", () => {
    expect(totals(NaN, 150).total).toBe(5.99);
    expect(totals(120, NaN).total).toBe(120);
    expect(totals(80, 150).total).toBe(5.99);
    expect(totals(80, -2).total).toBe(85.99);
  });
  it("records success only for supported eligibility", () => {
    expect(attempt(offers[1], initialCart)).toBe("applied");
    expect(attempt(offers[0], initialCart)).toBe("rejected");
    expect(attempt(offers[2], initialCart)).toBe("rejected");
  });
  it("lets merchant failure override eligibility", () =>
    expect(attempt(offers[1], initialCart, true)).toBe("rejected"));
  it("calculates incremental contribution from percentage-point lift", () => {
    expect(contribution(100000, 2, 65, 4)).toBe(5200);
    expect(contribution(100000, 0, 65, 4)).toBe(0);
  });
});
