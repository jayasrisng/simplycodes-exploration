import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const width of [1440, 1280, 768, 390]) {
  test(`five-chapter workspace and full shopping flow at ${width}px`, async ({
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
    await expect(page.locator("[data-chapter]")).toHaveCount(5);
    await expect(page.locator("#chapter-0 .proposal")).toContainText("$30.00");
    if (width >= 768) {
      await expect(
        page.getByText("EXISTING SIMPLYCODES", { exact: false }).first(),
      ).toBeInViewport();
      await expect(page.locator("#chapter-0 .existing")).toBeInViewport();
      await expect(page.locator("#chapter-0 .proposal")).toBeInViewport();
    }
    await page.screenshot({ path: `test-results/first-viewport-${width}.png` });
    await page.screenshot({
      path: `test-results/full-page-${width}.png`,
      fullPage: true,
    });
    if (width === 390) {
      await page.getByRole("button", { name: "Existing", exact: true }).click();
      await page.screenshot({
        path: "test-results/full-page-existing-390.png",
        fullPage: true,
      });
      await page.getByRole("button", { name: "Proposal", exact: true }).click();
    }
    for (let i = 0; i < 5; i++) {
      await page.locator(`#chapter-${i}`).scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.waitForTimeout(150);
      await page.screenshot({
        path: `test-results/chapter-${i + 1}-${width}.png`,
      });
      if (width >= 768)
        await expect(page.locator(".panel-headings")).toBeInViewport();
      if (width >= 768)
        for (const title of await page.locator(".panel-title").all())
          await expect(title).toBeInViewport();
    }
    await page.getByRole("button", { name: "Nike", exact: true }).click();
    await expect(page.locator("#chapter-0 .proposal")).toContainText(
      "No verified code.",
    );
    await expect(page.locator("#chapter-0 .existing")).toContainText(
      "UNVERIFIED",
    );
    await page.getByRole("button", { name: "Vistaprint", exact: true }).click();
    await page.locator("#chapter-1").scrollIntoViewIfNeeded();
    await page
      .getByLabel("Student eligibility", { exact: true })
      .selectOption("yes");
    await expect(page.locator("#chapter-1 .decision-code")).toContainText(
      "STUDENT30",
    );
    await page.getByLabel("Customer", { exact: true }).selectOption("new");
    await expect(page.locator("#chapter-1 .decision-code")).toContainText(
      "WELCOME40",
    );
    await expect(page.locator("#chapter-1 .question")).toHaveCount(0);
    const proofButton = page.locator("#chapter-1 .decision-code button");
    await proofButton.click();
    await expect(page.getByRole("dialog", { name: "WELCOME40" })).toBeVisible();
    await page.screenshot({ path: `test-results/evidence-${width}.png` });
    await page.keyboard.press("Tab");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(proofButton).toBeFocused();
    await page.locator("#chapter-2").scrollIntoViewIfNeeded();
    const privacy = page.getByRole("switch", {
      name: /Cart sharing permission/,
    });
    await privacy.click();
    await expect(privacy).toHaveAttribute("aria-checked", "true");
    await page.locator("#chapter-3").scrollIntoViewIfNeeded();
    // Exercise both routes, including the phone's panel switch.
    if (width === 390)
      await page.getByRole("button", { name: "Existing", exact: true }).click();
    await page.locator("#chapter-3 .existing select").selectOption("print");
    await page
      .getByRole("button", { name: "Try PRINT25", exact: true })
      .click();
    await expect(
      page.locator("#chapter-3 .existing .checkout-message"),
    ).toContainText("Code accepted");
    await expect(page.locator("#chapter-3 .existing .total")).toContainText(
      "$90.00",
    );
    if (width === 390)
      await page.getByRole("button", { name: "Proposal", exact: true }).click();
    await page
      .getByRole("button", { name: "Apply eligible offer", exact: true })
      .click();
    await expect(
      page.locator("#chapter-3 .proposal .checkout-message"),
    ).toContainText("Saved $48.00");
    await expect(page.locator("#chapter-3 .proposal .total")).toContainText(
      "$72.00",
    );
    await page.getByRole("button", { name: "Review final payable" }).click();
    await expect(page.locator(".completion")).toContainText("$72.00");
    await page.getByLabel("Test merchant rejection").check();
    await page
      .getByRole("button", { name: "Apply eligible offer", exact: true })
      .click();
    await expect(
      page.locator("#chapter-3 .proposal .checkout-message"),
    ).toContainText("No discount counted");
    await expect(page.locator("#chapter-3 .proposal .total")).toContainText(
      "$120.00",
    );
    await page
      .getByRole("button", { name: "Retry without forced rejection" })
      .click();
    await expect(page.getByLabel("Test merchant rejection")).not.toBeChecked();
    await page
      .getByRole("button", { name: "Apply eligible offer", exact: true })
      .click();
    await expect(page.locator("#chapter-3 .proposal .total")).toContainText(
      "$72.00",
    );
    await page
      .getByRole("slider", { name: "Redemption improvement", exact: true })
      .fill("0");
    await expect(page.locator(".calculator-result>strong")).toContainText(
      "$0.00",
    );
    await page.getByRole("button", { name: /Sources, system/ }).click();
    await expect(
      page.getByRole("dialog", { name: "Sources & scope" }),
    ).toBeVisible();
    await page.getByText("AI-agent evidence", { exact: true }).click();
    await expect(
      page.getByText("No live integration was tested.", { exact: false }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close sources" }).click();
    {
      await page.getByRole("button", { name: "Restart", exact: true }).click();
      await expect(page.locator(".merchant-toolbar")).toBeInViewport();
      await expect(page.locator(".calculator-result>strong")).toContainText(
        "$5,200.00",
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
    page.getByText("Skip to comparison", { exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#chapter-0")).toBeInViewport();
  await page.getByRole("button", { name: "Nike", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Chapters" })
    .getByRole("button", { name: /Apply & save/ })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#chapter-3")).toBeInViewport();
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
