import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const width of [1440, 1280, 768, 390])
  test(`Part Two layout and interactions ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/2/");
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Find the code.",
    );
    await page.screenshot({
      path: `test-results/part-two-default-${width}.png`,
      fullPage: true,
    });
    for (const merchant of ["Vistaprint", "Kith"]) {
      if (width <= 860)
        await page
          .getByRole("button", {
            name:
              merchant === "Vistaprint" ? "Verified offer" : "No verified code",
            exact: true,
          })
          .click();
      const phone = page.getByRole("article", {
        name: `${merchant} mobile experience`,
      });
      await phone.scrollIntoViewIfNeeded();
      await phone.evaluate((el) => (el.scrollTop = 0));
      const box = await phone.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBe(390);
      if (width > 860) expect(box!.height).toBe(844);
      else expect(box!.height).toBeGreaterThanOrEqual(844);
      for (const selector of [
        "[data-merchant-headline]",
        "[data-top-card]",
        "[data-primary]",
      ]) {
        const b = await phone.locator(selector).boundingBox();
        expect(b!.y).toBeGreaterThanOrEqual(box!.y);
        expect(b!.y + b!.height).toBeLessThanOrEqual(box!.y + 844);
        expect(b!.x + b!.width).toBeLessThanOrEqual(box!.x + 390);
      }
      if (width === 390) {
        await page.evaluate(() => {
          const el = document.querySelector(".phone-column.selected .phone")!;
          window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
        });
        for (const selector of [
          "[data-merchant-headline]",
          "[data-top-card]",
          "[data-primary]",
        ]) {
          const b = await phone.locator(selector).boundingBox();
          expect(b!.y).toBeGreaterThanOrEqual(0);
          expect(b!.y + b!.height).toBeLessThanOrEqual(844);
        }
      }
      await phone.screenshot({
        path: `test-results/part-two-${merchant}-${width}.png`,
      });
      const disclosure = phone.locator(".evidence summary");
      await disclosure.focus();
      await page.keyboard.press("Enter");
      await expect(phone.locator(".evidence")).toHaveAttribute("open", "");
      if (width <= 860) {
        expect(
          await phone.evaluate((el) => getComputedStyle(el).overflowY),
        ).toBe("visible");
        const end = phone.locator(".phone-body > :last-child");
        await end.scrollIntoViewIfNeeded();
        await expect(end).toBeInViewport();
        expect(await phone.evaluate((el) => el.scrollTop)).toBe(0);
        await disclosure.focus();
      }
      await page.keyboard.press("Enter");
      await expect(phone.locator(".evidence")).not.toHaveAttribute("open", "");
      await expect(phone.locator("[data-primary]")).toHaveAttribute(
        "href",
        merchant === "Vistaprint"
          ? "https://simplycodes.com/store/vistaprint.com#verified-promos-section"
          : "https://simplycodes.com/store/kith.com#best-deal-section",
      );
      if (merchant === "Kith")
        await expect(
          phone.getByRole("link", { name: "Visit Kith’s website" }),
        ).toHaveAttribute("href", "https://kith.com/");
      const phoneScan = await new AxeBuilder({ page })
        .include(".phone-column.selected, .phone-column")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(phoneScan.violations).toEqual([]);
      if (merchant === "Vistaprint") {
        await expect(phone.getByText("Last used · Oct 22")).toBeVisible();
        await expect(phone.locator("[data-primary]")).toContainText(
          "Check the SimplyCodes source",
        );
        await phone.locator(".personalize summary").click();
        for (const v of ["new", "returning", "unknown"]) {
          await phone.locator("select").selectOption(v);
          await expect(phone.getByRole("status")).not.toBeEmpty();
        }
      }
    }
    await expect(page.getByRole("tab", { name: /SEO/ })).not.toBeVisible();
    await page.locator(".optional-strategy > summary").focus();
    await page.keyboard.press("Enter");
    for (const name of [
      "SEO",
      "AI discovery",
      "MCP",
      "Deal digest",
      "Reddit",
    ]) {
      await page.getByRole("tab", { name: new RegExp(name) }).click();
      await expect(page.getByRole("tabpanel")).toBeVisible();
      if (name === "MCP") {
        await page
          .getByRole("button", { name: "Extension", exact: true })
          .click();
        await expect(page.locator(".record-output")).toContainText(
          "cart restrictions",
        );
        await page.getByLabel("Test missing verification time").check();
        await expect(page.locator(".record-output")).toContainText(
          "do not claim",
        );
        await page.getByText("Where llms.txt fits", { exact: true }).click();
      }
      if (name === "Reddit") {
        for (const step of ["Listen", "Answer", "Host"]) {
          await page.getByRole("button", { name: step, exact: true }).click();
          await expect(page.getByRole("button", { name: step, exact: true })).toHaveAttribute("aria-pressed", "true");
        }
      }
      if (name === "Deal digest") {
        for (const c of ["Every 3 days", "Weekly", "Daily"]) {
          await page.getByRole("button", { name: c, exact: true }).click();
          await expect(
            page.getByRole("button", { name: c, exact: true }),
          ).toHaveAttribute("aria-pressed", "true");
        }
        await page.getByText("Rules before a send", { exact: true }).click();
      }
    }
    await page.getByRole("tab", { name: /Reddit/ }).focus();
    await page.keyboard.press("Home");
    await expect(page.getByRole("tab", { name: /SEO/ })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("tab", { name: /AI discovery/ })).toBeFocused();
    await page
      .getByText("Experiment & search guardrail", { exact: true })
      .click();
    await expect(page.locator(".experiment")).toContainText(
      "at least two full weeks",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      scan.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    await page.screenshot({
      path: `test-results/part-two-full-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("link", { name: "Return to Part One" }).click();
    await expect(page.locator("[data-chapter]")).toHaveCount(6);
  });
