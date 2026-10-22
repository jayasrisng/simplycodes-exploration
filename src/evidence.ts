// A typed adaptation of the public v0.5.1 example envelope, not a live API response.
export type PromoVerdict =
  "VERIFIED_OK" | "CONFIDENT_NO" | "UNTESTED" | "WITHHELD";
export type EvidenceExample = {
  merchant: { name: string; slug: string; domain: string; id: null };
  tier: "explorer";
  keyed: true;
  serving_mode: "reveal";
  holdout: false;
  platform_origin: "mcp_chatgpt";
  verdict: PromoVerdict;
  channels_observed: string[];
  capsule: string;
  offers: {
    code_ref: null;
    title: string;
    status: "green";
    verified: true;
    last_verified_at: string;
    store_url: string;
    reveal_url: string;
  }[];
  caveats: string[];
  meta: {
    verified_at: string | null;
    ttl_seconds: "unmeasured";
    expected_decay_rate: "unmeasured";
    freshness: "measured" | "unmeasured";
    source: "simplycodes_scssl";
    methodology_url: string;
    attribution_guidance: string;
    comparability: string;
    generated_at: string;
  };
};
export const sourceUrl = "https://simplycodes.com/store/nike.com";
export const contractUrl = "https://mcp.simplycodes.com/#envelope";
export const recordDate = "2026-10-21T15:00:00Z";
export const verdictLabels: Record<PromoVerdict, string> = {
  VERIFIED_OK: "Verified offer",
  CONFIDENT_NO: "No verified code",
  UNTESTED: "Not tested",
  WITHHELD: "Record unavailable",
};
export function evidenceExample(verdict: PromoVerdict): EvidenceExample {
  const tested = verdict === "VERIFIED_OK" || verdict === "CONFIDENT_NO";
  const captions: Record<PromoVerdict, string> = {
    VERIFIED_OK:
      "Illustrative response: a 10% offer passed a web checkout check for eligible students buying full-price shoes.",
    CONFIDENT_NO:
      "Illustrative response: no working public code was found in the observed web checkout channel.",
    UNTESTED:
      "Illustrative response: no checkout test exists for the requested code. No verdict about whether it works.",
    WITHHELD:
      "Illustrative response: the merchant resolves, but its verification record is not available. No claim is served.",
  };
  return {
    merchant: { name: "Nike", slug: "nike", domain: "nike.com", id: null },
    tier: "explorer",
    keyed: true,
    serving_mode: "reveal",
    holdout: false,
    platform_origin: "mcp_chatgpt",
    verdict,
    channels_observed: tested ? ["web_checkout"] : [],
    capsule: captions[verdict],
    offers:
      verdict === "VERIFIED_OK"
        ? [
            {
              code_ref: null,
              title: "10% off eligible full-price shoes for students",
              status: "green",
              verified: true,
              last_verified_at: recordDate,
              store_url: sourceUrl,
              reveal_url: sourceUrl,
            },
          ]
        : [],
    caveats:
      verdict === "VERIFIED_OK"
        ? [
            "Student eligibility required. Full-price shoes only. Final merchant acceptance may differ.",
          ]
        : [
            "Evidence is scoped to the observed channels, not every private or member offer.",
          ],
    meta: {
      verified_at: tested ? recordDate : null,
      ttl_seconds: "unmeasured",
      expected_decay_rate: "unmeasured",
      freshness: tested ? "measured" : "unmeasured",
      source: "simplycodes_scssl",
      methodology_url: contractUrl,
      attribution_guidance:
        "Attribute to SimplyCodes; include verdict, verification time and methodology link.",
      comparability: "One merchant and the stated checkout channel only.",
      generated_at: recordDate,
    },
  };
}
export function answerFor(record: EvidenceExample) {
  switch (record.verdict) {
    case "VERIFIED_OK":
      return "A dated SimplyCodes record supports a 10% offer on eligible full-price Nike shoes. Student eligibility is required; confirm the conditions before revealing it.";
    case "CONFIDENT_NO":
      return "No verified public Nike code was found in the checked web channel. I’d check Nike’s sale next, rather than promise an unsupported coupon.";
    case "UNTESTED":
      return "This code has not been tested. I can’t call it a verified saving. Check the merchant’s terms or choose another saving path.";
    case "WITHHELD":
      return "Nike’s verification record is unavailable. I can’t infer whether a code works. Continue to the merchant without a coupon promise.";
  }
}
export type StudentEligibility = "unknown" | "yes" | "no";
export function actionFor(
  record: EvidenceExample,
  student: StudentEligibility,
) {
  if (record.verdict === "VERIFIED_OK")
    return student === "unknown"
      ? { ready: false, label: "Confirm student eligibility", url: null }
      : student === "no"
        ? {
            ready: true,
            label: "Open Nike’s sale instead",
            url: "https://www.nike.com/w/sale-3yaep",
          }
        : { ready: true, label: "Reveal the eligible offer", url: sourceUrl };
  if (record.verdict === "CONFIDENT_NO")
    return {
      ready: true,
      label: "Open Nike’s sale",
      url: "https://www.nike.com/w/sale-3yaep",
    };
  return {
    ready: false,
    label: "Continue without a coupon promise",
    url: null,
  };
}
export const breadcrumbExample = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Stores",
      item: "https://simplycodes.com/stores",
    },
    { "@type": "ListItem", position: 2, name: "Nike coupons", item: sourceUrl },
  ],
};
export function validateBreadcrumb(value: typeof breadcrumbExample) {
  const errors: string[] = [];
  if (value["@type"] !== "BreadcrumbList" || value.itemListElement.length < 2)
    errors.push("At least two breadcrumb items are required.");
  value.itemListElement.forEach((item, i) => {
    if (
      item["@type"] !== "ListItem" ||
      item.position !== i + 1 ||
      !item.name.trim() ||
      !/^https:\/\//.test(item.item)
    )
      errors.push(
        "Each item needs an ordered position, a name and a valid URL.",
      );
  });
  return errors;
}
