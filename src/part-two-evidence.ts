export type Merchant = "Vistaprint" | "Kith";
export type Layout = "A" | "B" | "C";
export const layouts: { id: Layout; name: string; intent: string }[] = [
  {
    id: "A",
    name: "Familiar",
    intent: "Recognizable signals. A browsable list.",
  },
  { id: "B", name: "Action-first", intent: "One offer. A direct next step." },
  {
    id: "C",
    name: "Evidence-first",
    intent: "The proof sits beside the decision.",
  },
];
export const evidence = {
  Vistaprint: {
    name: "Vistaprint",
    verified: true,
    percent: 15,
    verifiedCount: 20,
    onFile: 744,
    offer: "15% off",
    scope: "Storewide",
    health: 100,
    uses: 16,
    verifications: 185,
    source: "https://simplycodes.com/store/vistaprint.com",
    destination:
      "https://simplycodes.com/store/vistaprint.com#verified-promos-section",
    store: "https://www.vistaprint.com/",
    action: "Check offer at source",
    query: "Vistaprint promo codes",
    title: "Vistaprint Promo Codes & Coupons | SimplyCodes",
    snippet:
      "Explore Vistaprint promo codes with verification history, Health Scores, and offer restrictions. Check the evidence before you choose.",
  },
  Kith: {
    name: "Kith",
    verified: false,
    percent: null,
    verifiedCount: 0,
    onFile: 2,
    offer: "No verified public code",
    scope: "Explore other ways to shop",
    health: null,
    uses: null,
    verifications: null,
    source: "https://simplycodes.com/store/kith.com",
    destination: "https://simplycodes.com/store/kith.com#best-deal-section",
    store: "https://kith.com/",
    action: "Explore non-code alternatives",
    query: "Kith discount codes",
    title: "Kith Discount Codes & Savings | SimplyCodes",
    snippet:
      "Review Kith community-code history and non-code alternatives. See what is verified, what is historical, and where to check next.",
  },
} as const;
export const alternativeFashionOffers = [
  {
    merchant: "END.",
    category: "Designer / streetwear",
    offer: "15% off storewide",
    health: 100,
    source: "https://simplycodes.com/store/endclothing.com",
  },
  {
    merchant: "Fashion Nova",
    category: "Fashion / apparel",
    offer: "30% off storewide",
    health: 100,
    source: "https://simplycodes.com/store/fashionnova.com",
  },
] as const;
// These are dated public offer observations, not live recommendations or
// guarantees. A 100% Health Score is not a 100% success probability.
export const alternativesObserved = "October 23, 2026";
export const observationDate = "October 22, 2026";
export type Interaction = {
  proof: boolean;
  eligibility: boolean;
  customer: string;
  alertPreview: boolean;
};
export const initialInteraction: Interaction = {
  proof: false,
  eligibility: false,
  customer: "unknown",
  alertPreview: false,
};
