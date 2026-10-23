import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const layouts = ["A", "B", "C"];
const merchants = ["Vistaprint", "Kith"];
async function selectLayout(page: Page, layout: string) {
  await page.getByRole("radio", { name: new RegExp(`^${layout} ·`) }).check();
}
async function scan(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    results.violations.map((x) => ({
      id: x.id,
      nodes: x.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
}
for (const width of [1440, 1280, 768, 390])
  test(`gallery: six layouts, fold, state, accessibility at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/2/");
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Prototype gallery",
    );
    await expect(page.locator(".optional-strategy")).not.toHaveAttribute(
      "open",
      "",
    );
    await page.screenshot({
      path: `test-results/gallery-overview-${width}.png`,
      fullPage: true,
    });
    for (const merchant of merchants) {
      await page.getByLabel("Merchant / state").selectOption(merchant);
      for (const l of layouts) {
        await selectLayout(page, l);
        const phone = page.locator(".phone");
        await phone.evaluate((el) => (el.scrollTop = 0));
        const box = await phone.boundingBox();
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
          await page.evaluate(() =>
            window.scrollTo(
              0,
              document.querySelector(".phone")!.getBoundingClientRect().top +
                window.scrollY,
            ),
          );
          for (const sel of [
            "[data-merchant-headline]",
            "[data-top-card]",
            "[data-primary]",
          ]) {
            const b = await phone.locator(sel).boundingBox();
            expect(b!.y).toBeGreaterThanOrEqual(0);
            expect(b!.y + b!.height).toBeLessThanOrEqual(844);
          }
        }
        if (merchant === "Kith") {
          await expect(phone.getByText("Still looking for something similar?")).toBeVisible();
          await expect(phone.getByRole("link", { name: /END\./ })).toHaveAttribute("href", "https://simplycodes.com/store/endclothing.com");
          await expect(phone.getByRole("link", { name: /Fashion Nova/ })).toHaveAttribute("href", "https://simplycodes.com/store/fashionnova.com");
          const alert = phone.getByRole("button", { name: "Preview code alerts" });
          await alert.click();
          await expect(phone.getByText(/no active subscription or email collection/i)).toBeVisible();
          await expect(phone.getByRole("link", { name: /Get the extension/ })).toHaveAttribute("href", "https://simplycodes.com/extension");
          await phone.getByRole("button", { name: "Hide alert preview" }).click();
        }
        await phone.screenshot({
          path: `test-results/gallery-${l}-${merchant}-${width}.png`,
        });
        await scan(page);
        const proof = phone.locator(".evidence summary");
        await proof.focus();
        await page.keyboard.press("Enter");
        await expect(phone.locator(".evidence")).toHaveAttribute("open", "");
        await expect(phone.locator(".evidence")).toContainText(
          "October 22, 2026",
        );
        if (width <= 860) {
          expect(
            await phone.evaluate((el) => getComputedStyle(el).overflowY),
          ).toBe("visible");
          await phone
            .locator(".disclosure-body")
            .first()
            .scrollIntoViewIfNeeded();
          expect(await phone.evaluate((el) => el.scrollTop)).toBe(0);
        }
        await proof.click();
        await phone.locator("[data-primary]").click();
        const dialog = page.getByRole("dialog", { name: "Continue to source" });
        await expect(dialog).toBeVisible();
        await expect(
          dialog.getByRole("link", { name: "Continue to SimplyCodes" }),
        ).toHaveAttribute(
          "href",
          merchant === "Vistaprint"
            ? "https://simplycodes.com/store/vistaprint.com#verified-promos-section"
            : "https://simplycodes.com/store/kith.com#best-deal-section",
        );
        await scan(page);
        await page.keyboard.press("Escape");
        await expect(dialog).not.toBeVisible();
        await expect(phone.locator("[data-primary]")).toBeFocused();
      }
    }
    // Keep relevant state while changing visual direction.
    await page.locator(".eligibility summary").click();
    await page.getByLabel("Customer status").selectOption("new");
    await selectLayout(page, "A");
    await expect(page.getByLabel("Customer status")).toHaveValue("new");
    await expect(page.getByLabel("Merchant / state")).toHaveValue("Kith");
    await page.locator(".eligibility summary").click();
    await page.getByRole("button", { name: "Compare", exact: false }).click();
    for (const pair of [
      ["A", "B"],
      ["B", "C"],
      ["A", "C"],
    ]) {
      await page.getByLabel("Left layout").selectOption(pair[0]);
      await page.getByLabel("Right layout").selectOption(pair[1]);
      await expect(page.locator(".phone")).toHaveCount(2);
      for (const p of await page.locator(".phone").all())
        await expect(p).toContainText("Kith");
      expect(await page.getByLabel("Left layout").inputValue()).not.toBe(
        await page.getByLabel("Right layout").inputValue(),
      );
    }
    await page.screenshot({
      path: `test-results/gallery-compare-${width}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await scan(page);
    expect(errors).toEqual([]);
    await page.getByRole("link", { name: "Return to Part One" }).click();
    await expect(page.locator("[data-chapter]")).toHaveCount(6);
  });
for (const width of [1440, 390])
  for (const l of layouts)
    for (const merchant of merchants)
      test(`journey ${l} ${merchant} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto("/2/");
        await selectLayout(page, l);
        await page
          .getByRole("button", { name: "Search journey", exact: true })
          .click();
        await page.getByLabel("Search for a code").selectOption(merchant);
        await expect(page.getByLabel("Merchant / state")).toHaveValue(merchant);
        await page.locator(".phone").screenshot({
          path: `test-results/journey-${l}-${merchant}-${width}-search.png`,
        });
        await scan(page);
        await page
          .getByRole("button", { name: "Search →", exact: true })
          .click();
        await expect(page.locator(".search-result")).toContainText(merchant);
        await expect(page.locator(".result-notice")).toContainText(
          "no ranking implied",
        );
        await page.locator(".phone").screenshot({
          path: `test-results/journey-${l}-${merchant}-${width}-result.png`,
        });
        await scan(page);
        await page.locator(".search-result").click();
        await expect(page.locator(".phone")).toHaveClass(
          new RegExp(`layout-${l}`),
        );
        await page.locator(".evidence summary").click();
        await expect(page.locator(".evidence")).toContainText(
          "October 22, 2026",
        );
        await page.locator(".eligibility summary").click();
        await page.getByLabel("Customer status").selectOption("returning");
        await page.locator(".phone").screenshot({
          path: `test-results/journey-${l}-${merchant}-${width}-evidence.png`,
        });
        await page
          .getByRole("button", { name: "Change layout", exact: true })
          .click();
        await expect(page.getByRole("radio", { name: /^A ·/ })).toBeFocused();
        await selectLayout(page, l === "A" ? "B" : "A");
        await expect(page.getByLabel("Customer status")).toHaveValue(
          "returning",
        );
        await selectLayout(page, l);
        await page.locator("[data-primary]").click();
        await expect(
          page.getByRole("link", { name: "Continue to SimplyCodes" }),
        ).toBeVisible();
        await page.locator(".phone").screenshot({
          path: `test-results/journey-${l}-${merchant}-${width}-handoff.png`,
        });
        await scan(page);
        await page.getByRole("button", { name: "← Back", exact: true }).click();
        await expect(page.locator("[data-top-card]")).toBeVisible();
        await expect(page.getByLabel("Customer status")).toHaveValue(
          "returning",
        );
        await page.goBack();
        await expect(page.locator(".search-result")).toBeVisible();
        await page.goForward();
        await expect(page.locator("[data-top-card]")).toBeVisible();
        await page
          .getByRole("button", { name: "Restart", exact: true })
          .click();
        await expect(page.getByLabel("Search for a code")).toHaveValue(
          merchant,
        );
        await page.reload();
        await expect(page.getByLabel("Search for a code")).toBeVisible();
      });
test("experiments isolate controls, optional ideas work, and narrow mobile is usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/2/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const experiment of [
    "Primary CTA",
    "Evidence visibility",
    "Information density",
    "No-code fallback",
  ]) {
    await page
      .getByRole("combobox", { name: "Explore", exact: true })
      .selectOption({ label: experiment });
    await expect(page.locator(".experiment-variant")).toHaveCount(2);
    if (experiment === "Primary CTA")
      for (const property of ["Position", "Size", "Prominence", "Wording"]) {
        await page.getByLabel("CTA property").selectOption(property);
        await page
          .locator(".experiment-previews")
          .screenshot({ path: `test-results/experiment-${property}.png` });
      }
    await page.locator(".experiment-cta").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close handoff" }).click();
    await page.locator(".experiment-previews").screenshot({
      path: `test-results/experiment-${experiment.replaceAll(" ", "-")}.png`,
    });
    await scan(page);
  }
  await page.locator(".optional-strategy > summary").focus();
  await page.keyboard.press("Enter");
  for (const name of ["SEO", "AI discovery", "MCP", "Deal digest", "Reddit"]) {
    await page.getByRole("tab", { name: new RegExp(name) }).click();
    if (name === "MCP") {
      await page.getByLabel("Test missing verification time").check();
      await expect(page.locator(".record-output")).toContainText(
        "do not claim",
      );
    }
    if (name === "Reddit") {
      for (const step of ["Question", "Response", "Product follow-up"]) {
        await page.getByRole("button", { name: step, exact: true }).click();
        await expect(
          page.getByRole("button", { name: step, exact: true }),
        ).toHaveAttribute("aria-pressed", "true");
      }
      await expect(page.getByRole("tabpanel")).toContainText(
        "improvement backlog",
      );
    }
    await scan(page);
  }
  await page.getByRole("tab", { name: /Reddit/ }).focus();
  await page.keyboard.press("Home");
  await expect(page.getByRole("tab", { name: /SEO/ })).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: /Reddit/ })).toBeFocused();
  await page.setViewportSize({ width: 320, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator(".evidence summary").click();
  await page.locator(".eligibility summary").click();
  await page.getByLabel("Customer status").selectOption("new");
  expect(
    await page
      .locator(".phone")
      .evaluate((el) => getComputedStyle(el).overflowY),
  ).toBe("visible");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
