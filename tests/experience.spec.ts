import { test, expect } from "@playwright/test";
for (const width of [1440, 1280, 768, 390]) {
  test(`complete interaction at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "From verification",
    );
    await page.screenshot({ path: `test-results/hero-${width}.png` });
    for (let i = 0; i < 9; i++) {
      await page.locator(`#chapter-${i}`).scrollIntoViewIfNeeded();
      await expect(page.locator(`#chapter-${i}`)).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.getByRole("button", { name: "Nike", exact: true }).click();
    await expect(page.locator("#chapter-1 .proposal")).toContainText(
      "No verified code",
    );
    await page.getByRole("button", { name: "Vistaprint", exact: true }).click();
    await page.locator("#chapter-2").scrollIntoViewIfNeeded();
    if (width === 1440)
      await page.screenshot({ path: "test-results/comparison-1440.png" });
    await page
      .getByRole("combobox")
      .filter({ has: page.locator('option[value="yes"]') })
      .selectOption("yes");
    await expect(page.locator("#chapter-2 .recommend-code")).toContainText(
      "STUDENT30",
    );
    await page
      .getByRole("combobox")
      .filter({ has: page.locator('option[value="returning"]') })
      .selectOption("new");
    await expect(page.locator("#chapter-2 .recommend-code")).toContainText(
      "WELCOME40",
    );
    await page.locator("#chapter-2 .recommend-code button").click();
    await expect(
      page.getByRole("dialog").filter({ hasText: "THE COMPLETE EVIDENCE" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.locator("#chapter-4").scrollIntoViewIfNeeded();
    const toggle = page.getByRole("switch", { name: /Allow cart matching/ });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await page.locator("#chapter-5").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Apply eligible offer" }).click();
    await expect(
      page.locator("#chapter-5 .proposal .checkout-message"),
    ).toContainText("Saved $48.00");
    await page.getByRole("button", { name: "Review final payable" }).click();
    await expect(page.locator("#chapter-5 .proposal")).toContainText(
      "Final payable: $72.00",
    );
    await page.getByLabel("Test a merchant rejection").check();
    await page.getByRole("button", { name: "Apply eligible offer" }).click();
    await expect(
      page.locator("#chapter-5 .proposal .checkout-message"),
    ).toContainText("No discount has been counted");
    await expect(page.locator("#chapter-5 .proposal .total")).toContainText(
      "$120.00",
    );
    if (width === 390) {
      await page.getByRole("button", { name: "Today", exact: true }).click();
      await expect(page.locator("#chapter-5 .today")).toBeVisible();
      await page
        .getByRole("button", { name: "My proposal", exact: true })
        .click();
    }
    await page
      .getByRole("slider", { name: "Redemption improvement", exact: true })
      .fill("0");
    await expect(page.locator(".calculator-result>strong")).toContainText(
      "$0.00",
    );
    await page.locator("#chapter-8").scrollIntoViewIfNeeded();
    await page.getByLabel("System states").selectOption("error");
    await expect(
      page.getByText("Evidence unavailable", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Try again", exact: true }).click();
    await expect(
      page.getByText("No matching offers", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Restart", exact: true }).click();
    await expect(
      page.getByRole("switch", { name: /Allow cart matching/ }),
    ).toHaveAttribute("aria-checked", "false");
    await expect(page.locator(".calculator-result>strong")).toContainText(
      "$5,200.00",
    );
    expect(errors).toEqual([]);
  });
}
test("keyboard, reduced motion and mobile empty state", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByText("Skip to interactive comparison")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#chapter-1")).toBeInViewport();
  await page.getByRole("button", { name: "Nike", exact: true }).click();
  await page.locator("#chapter-5").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Apply eligible offer" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
});

test("accessible contrast, semantics and labels on desktop and mobile", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await page.emulateMedia({ reducedMotion: "reduce" });
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        description: v.description,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
});
