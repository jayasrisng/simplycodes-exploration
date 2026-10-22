export type Merchant = "Vistaprint" | "Nike";
export type VerificationState =
  | "VERIFIED"
  | "CONDITIONALLY APPLICABLE"
  | "UNVERIFIED"
  | "INELIGIBLE"
  | "NO VERIFIED CODE";
export type Cart = {
  amount: number;
  category: "Business cards" | "Shoes" | "Apparel";
  sale: boolean;
  customer: "new" | "returning";
  student: "unknown" | "yes" | "no";
  merchant: Merchant;
};
export type Offer = {
  id: string;
  code: string;
  percent: number;
  merchant: Merchant;
  minimum: number;
  category?: Cart["category"];
  newOnly?: boolean;
  student?: boolean;
  fullPrice?: boolean;
  verified: boolean;
  title: string;
  tested: string;
  tests: number;
  passes: number;
};
export const initialCart: Cart = {
  amount: 120,
  category: "Business cards",
  sale: false,
  customer: "returning",
  student: "unknown",
  merchant: "Vistaprint",
};
export const offers: Offer[] = [
  {
    id: "welcome",
    code: "WELCOME40",
    percent: 40,
    merchant: "Vistaprint",
    minimum: 75,
    newOnly: true,
    verified: true,
    title: "40% off your first order",
    tested: "2026-10-20T16:30:00Z",
    tests: 12,
    passes: 10,
  },
  {
    id: "print",
    code: "PRINT25",
    percent: 25,
    merchant: "Vistaprint",
    minimum: 100,
    category: "Business cards",
    fullPrice: true,
    verified: true,
    title: "25% off business cards",
    tested: "2026-10-21T15:00:00Z",
    tests: 18,
    passes: 18,
  },
  {
    id: "student",
    code: "STUDENT30",
    percent: 30,
    merchant: "Vistaprint",
    minimum: 50,
    student: true,
    verified: true,
    title: "30% off for eligible students",
    tested: "2026-10-20T10:00:00Z",
    tests: 8,
    passes: 8,
  },
  {
    id: "open",
    code: "SAVE15",
    percent: 15,
    merchant: "Vistaprint",
    minimum: 50,
    verified: true,
    title: "15% off orders over $50",
    tested: "2026-10-19T09:00:00Z",
    tests: 20,
    passes: 17,
  },
  {
    id: "old",
    code: "EXTRA50",
    percent: 50,
    merchant: "Nike",
    minimum: 0,
    verified: false,
    title: "50% off selected styles",
    tested: "2026-08-01T12:00:00Z",
    tests: 3,
    passes: 0,
  },
];
export function evaluate(o: Offer, c: Cart): VerificationState {
  if (
    !Number.isFinite(c.amount) ||
    c.amount < 0 ||
    o.merchant !== c.merchant ||
    c.amount < o.minimum ||
    (o.newOnly && c.customer !== "new") ||
    (o.category && o.category !== c.category) ||
    (o.fullPrice && c.sale) ||
    (o.student && c.student === "no")
  )
    return "INELIGIBLE";
  if (!o.verified) return "UNVERIFIED";
  if (o.student && c.student === "unknown") return "CONDITIONALLY APPLICABLE";
  return "VERIFIED";
}
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n,
  );
export function totals(amount: number, percent = 0) {
  const subtotal = Math.max(0, Number.isFinite(amount) ? amount : 0);
  const discount =
    Math.round(
      subtotal *
        Math.min(100, Math.max(0, Number.isFinite(percent) ? percent : 0)),
    ) / 100;
  const shipping = subtotal >= 100 ? 0 : 5.99;
  return {
    subtotal,
    discount,
    shipping,
    total: Math.round((subtotal - discount + shipping) * 100) / 100,
  };
}
export function recommend(cart: Cart) {
  return offers
    .filter((o) => evaluate(o, cart) === "VERIFIED")
    .sort((a, b) => b.percent - a.percent)[0];
}
export function contribution(
  sessions: number,
  improvement: number,
  completion: number,
  commission: number,
) {
  return (
    Math.round(
      ((((Math.max(0, sessions) * Math.max(0, improvement)) / 100) *
        Math.max(0, completion)) /
        100) *
        Math.max(0, commission) *
        100,
    ) / 100
  );
}
export function attempt(o: Offer, c: Cart, forceFailure = false) {
  return !forceFailure && evaluate(o, c) === "VERIFIED"
    ? "applied"
    : "rejected";
}
