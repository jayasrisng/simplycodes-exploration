import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const width of [1440, 1280, 768, 390]) {
  test(`six-chapter workspace and full shopping flow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Same evidence.",
    );
    await expect(page.locator("[data-chapter]")).toHaveCount(6);
    await expect(page.locator("#chapter-1 .proposal")).toContainText("$30.00");
    await page.screenshot({ path: `test-results/first-viewport-${width}.png` });
    await page.screenshot({
      path: `test-results/full-page-${width}.png`,
      fullPage: true,
    });
    const evolution = page.locator("#chapter-0");
    for (let i = 0; i < 5; i++) {
      await evolution.getByRole("tab").nth(i).click();
      await expect(evolution.getByRole("tabpanel")).toHaveAttribute(
        "aria-labelledby",
        `stage-tab-${i}`,
      );
      await page.screenshot({
        path: `test-results/evolution-${i}-${width}.png`,
      });
    }
    await evolution
      .getByRole("button", { name: "Approve this action" })
      .click();
    await expect(evolution.getByRole("status")).toContainText(
      "Permission granted",
    );
    await evolution.getByRole("button", { name: /Approved locally/ }).click();
    await expect(evolution.getByRole("status")).toContainText(
      "The shopper stays in control",
    );
    await evolution.getByRole("tab").first().click();
    await page
      .getByRole("navigation")
      .getByRole("button", { name: /01 Find a Code/ })
      .click();
    await expect(page.locator("#chapter-1 .proposal")).toContainText("$30.00");
    if (width === 390) {
      await page.getByRole("button", { name: "Existing", exact: true }).click();
      await page.screenshot({
        path: "test-results/full-page-existing-390.png",
        fullPage: true,
      });
      await page.getByRole("button", { name: "Proposal", exact: true }).click();
    }
    for (let i = 0; i < 6; i++) {
      const navButton = page.getByRole("navigation").getByRole("button").nth(i);
      await navButton.click();
      await expect(navButton).toHaveAttribute("aria-current", "step");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.waitForTimeout(150);
      await page.screenshot({
        path: `test-results/chapter-${i}-${width}.png`,
      });
      if (width >= 768)
        await expect(page.locator(".panel-headings")).toBeInViewport();
      if (width >= 768)
        for (const title of await page.locator(".panel-title").all())
          await expect(title).toBeInViewport();
    }
    await page.getByRole("button", { name: "Nike", exact: true }).click();
    await expect(page.locator("#chapter-1 .proposal")).toContainText(
      "No verified code.",
    );
    await expect(page.locator("#chapter-1 .existing")).toContainText(
      "UNVERIFIED",
    );
    await page.getByRole("button", { name: "Vistaprint", exact: true }).click();
    await page.locator("#chapter-2").scrollIntoViewIfNeeded();
    await page
      .getByLabel("Student eligibility", { exact: true })
      .selectOption("yes");
    await expect(page.locator("#chapter-2 .decision-code")).toContainText(
      "STUDENT30",
    );
    await page.getByLabel("Customer", { exact: true }).selectOption("new");
    await expect(page.locator("#chapter-2 .decision-code")).toContainText(
      "WELCOME40",
    );
    await expect(page.locator("#chapter-2 .question")).toHaveCount(0);
    const proofButton = page.locator("#chapter-2 .decision-code button");
    await proofButton.click();
    await expect(page.getByRole("dialog", { name: "WELCOME40" })).toBeVisible();
    await page.screenshot({ path: `test-results/evidence-${width}.png` });
    await page.keyboard.press("Tab");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(proofButton).toBeFocused();
    await page.locator("#chapter-3").scrollIntoViewIfNeeded();
    const privacy = page.getByRole("switch", {
      name: /Cart sharing permission/,
    });
    await privacy.click();
    await expect(privacy).toHaveAttribute("aria-checked", "true");
    await page.locator("#chapter-4").scrollIntoViewIfNeeded();
    // Exercise both routes, including the phone's panel switch.
    if (width === 390)
      await page.getByRole("button", { name: "Existing", exact: true }).click();
    await page.locator("#chapter-4 .existing select").selectOption("print");
    await page
      .getByRole("button", { name: "Try PRINT25", exact: true })
      .click();
    await expect(
      page.locator("#chapter-4 .existing .checkout-message"),
    ).toContainText("Code accepted");
    await expect(page.locator("#chapter-4 .existing .total")).toContainText(
      "$90.00",
    );
    if (width === 390)
      await page.getByRole("button", { name: "Proposal", exact: true }).click();
    await page
      .getByRole("button", { name: "Apply eligible offer", exact: true })
      .click();
    await expect(
      page.locator("#chapter-4 .proposal .checkout-message"),
    ).toContainText("Saved $48.00");
    await expect(page.locator("#chapter-4 .proposal .total")).toContainText(
      "$72.00",
    );
    await page.getByRole("button", { name: "Review final payable" }).click();
    await expect(page.locator(".completion")).toContainText("$72.00");
    await page.getByLabel("Test merchant rejection").check();
    await page
      .getByRole("button", { name: "Apply eligible offer", exact: true })
      .click();
    await expect(
      page.locator("#chapter-4 .proposal .checkout-message"),
    ).toContainText("No discount counted");
    await expect(page.locator("#chapter-4 .proposal .total")).toContainText(
      "$120.00",
    );
    await page
      .getByRole("button", { name: "Retry without forced rejection" })
      .click();
    await expect(page.getByLabel("Test merchant rejection")).not.toBeChecked();
    await page
      .getByRole("button", { name: "Apply eligible offer", exact: true })
      .click();
    await expect(page.locator("#chapter-4 .proposal .total")).toContainText(
      "$72.00",
    );
    await page
      .getByRole("navigation")
      .getByRole("button", { name: /05 Be Found Everywhere/ })
      .click();
    const discovery = page.locator("#chapter-5");
    await discovery
      .getByText("Inspect structured data", { exact: true })
      .click();
    await discovery
      .getByRole("button", { name: "Check required fields" })
      .click();
    await expect(discovery.getByRole("status")).toContainText(
      "Required breadcrumb fields present",
    );
    await discovery.getByRole("tab", { name: "AEO AI Search" }).click();
    await expect(discovery.locator(".answer-card")).toContainText(
      "No verified public Nike code",
    );
    await page.screenshot({ path: `test-results/ai-search-${width}.png` });
    await discovery.getByRole("tab", { name: "MCP Agent integration" }).click();
    await discovery
      .getByRole("button", { name: "Read example response" })
      .click();
    await discovery
      .getByRole("button", { name: "Evaluate restrictions" })
      .click();
    await discovery
      .getByRole("button", { name: "Approve this action" })
      .click();
    await expect(discovery.getByRole("status")).toContainText(
      "Approved locally",
    );
    await discovery
      .getByLabel("Verification record")
      .selectOption("VERIFIED_OK");
    await discovery
      .getByRole("button", { name: "Read example response" })
      .click();
    await discovery
      .getByRole("button", { name: "Evaluate restrictions" })
      .click();
    await expect(
      discovery.getByRole("button", { name: "Approve this action" }),
    ).toBeDisabled();
    await discovery.getByRole("button", { name: "Yes, eligible" }).click();
    await discovery
      .getByRole("button", { name: "Approve this action" })
      .click();
    await expect(discovery.getByRole("status")).toContainText(
      "Approved locally",
    );
    await page.screenshot({ path: `test-results/agent-verified-${width}.png` });
    for (const state of ["UNTESTED", "WITHHELD"]) {
      await discovery.getByLabel("Verification record").selectOption(state);
      await discovery
        .getByRole("button", { name: "Read example response" })
        .click();
      await discovery
        .getByRole("button", { name: "Evaluate restrictions" })
        .click();
      await expect(
        discovery.getByRole("button", { name: "Approve this action" }),
      ).toBeDisabled();
      await expect(discovery.locator(".agent-result")).toContainText(
        "No verification timestamp",
      );
    }
    await page.getByRole("button", { name: /Sources, system/ }).click();
    await expect(
      page.getByRole("dialog", { name: "Sources & scope" }),
    ).toBeVisible();
    await page.getByText("AI-agent evidence", { exact: true }).click();
    await expect(
      page.getByText("SimplyCodes already publishes MCP tools:", {
        exact: false,
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close sources" }).click();
    {
      await page.getByRole("button", { name: "Restart", exact: true }).click();
      await expect(page.locator("#chapter-0")).toBeInViewport();
      await expect(page.getByRole("tab", { name: /01 FIND/ })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(privacy).toHaveAttribute("aria-checked", "false");
    }
    expect(errors).toEqual([]);
  });
}
test("keyboard navigation, no-code checkout and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByText("Skip to exploration", { exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#chapter-0")).toBeInViewport();
  await page.getByRole("button", { name: "Nike", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Chapters" })
    .getByRole("button", { name: /Apply & Save/ })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#chapter-4")).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Apply eligible offer" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
});
test("WCAG contrast, labels and dialog semantics on both mobile views", async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page
      .getByRole("navigation")
      .getByRole("button", { name: /01 Find a Code/ })
      .click();
    for (const view of width === 390
      ? ["Proposal", "Existing"]
      : ["Proposal"]) {
      if (width === 390)
        await page.getByRole("button", { name: view, exact: true }).click();
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
  }
});

test("evolution and discovery tablists support keyboard traversal", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const first = page.getByRole("tab", { name: /01 FIND/ });
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /02 VERIFY/ })).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: /05 ACT/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.keyboard.press("Home");
  await expect(first).toBeFocused();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /05 Be Found/ })
    .click();
  await page.getByRole("tab", { name: "SEO Google Search" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "AEO AI Search" })).toBeFocused();
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "MCP Agent integration" }),
  ).toHaveAttribute("aria-selected", "true");
});
test("discovery accessibility in each channel and on phones", async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page
      .getByRole("navigation")
      .getByRole("button", { name: /05 Be Found/ })
      .click();
    for (const name of [
      "SEO Google Search",
      "AEO AI Search",
      "MCP Agent integration",
    ]) {
      await page.getByRole("tab", { name }).click();
      if (name.startsWith("MCP")) {
        await page
          .getByRole("button", { name: "Read example response" })
          .click();
        await page
          .getByRole("button", { name: "Evaluate restrictions" })
          .click();
      }
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        scan.violations.map((x) => ({
          id: x.id,
          nodes: x.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
  }
});
