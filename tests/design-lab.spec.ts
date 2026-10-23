import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const key = "simplycodes-design-lab-v1";
async function openLab(page: Page, width = 1440) {
  await page.setViewportSize({ width, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/2/");
  await page.getByRole("button", { name: "Design Lab", exact: true }).click();
  await expect(page.locator(".lab")).toBeVisible();
}
async function review(page: Page) {
  await page
    .getByRole("button", { name: "Review Design", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Review Design", exact: true }),
  ).toBeEnabled({ timeout: 20000 });
  await expect(page.locator(".lab-report-summary").first()).toBeVisible();
  await expect(page.getByRole("status").first()).toContainText(
    "Review complete",
  );
}
async function saved(page: Page) {
  await page.getByRole("button", { name: "Save locally", exact: true }).click();
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key);
}
async function scan(page: Page) {
  const r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    r.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
}
test("editor edits, history, persistence, JSON import/export and evidence boundary", async ({
  page,
}) => {
  test.setTimeout(60000);
  await openLab(page);
  await page
    .locator(".lab-layer-select")
    .filter({ hasText: "Merchant header" })
    .click();
  await page
    .locator("[data-property-copy]")
    .fill("discount codes for your next order");
  await expect(page.locator("[data-lab-headline]")).toContainText(
    "discount codes",
  );
  await page.getByLabel("Text size", { exact: true }).fill("30");
  await page.getByRole("button", { name: "Undo", exact: false }).click();
  await expect(page.getByLabel("Text size", { exact: true })).toHaveValue("25");
  await page.getByRole("button", { name: "Redo", exact: false }).click();
  await expect(page.getByLabel("Text size", { exact: true })).toHaveValue("30");
  await page
    .locator(".lab-layer-select")
    .filter({ hasText: "Primary CTA" })
    .click();
  await page.locator("[data-property-copy]").fill("Inspect this offer");
  await expect(page.locator("[data-lab-primary]")).toHaveText(
    /Inspect this offer/,
  );
  const ws = await saved(page);
  await page.reload();
  await expect(page.locator("[data-lab-primary]")).toHaveText(
    /Inspect this offer/,
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Design Lab",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  expect((await download).suggestedFilename()).toBe(
    "simplycodes-design-lab.json",
  );
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator("[data-lab-primary]")).not.toHaveText(
    /Inspect this offer/,
  );
  await page.getByLabel("Import design JSON").setInputFiles({
    name: "workspace.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(ws)),
  });
  await expect(page.locator("[data-lab-primary]")).toHaveText(
    /Inspect this offer/,
  );
  await page.getByLabel("Import design JSON").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ ...ws, evidence: { verified: true, health: 999 } }),
    ),
  });
  await expect(page.getByRole("alert")).toContainText("Import rejected");
  await expect(page.locator("[data-lab-card]")).toContainText("15% off");
  await expect(page.locator("[data-lab-primary]")).toHaveText(
    /Inspect this offer/,
  );
  await page.getByRole("button", { name: "Dismiss error" }).click();
  await page.screenshot({
    path: "test-results/lab-editor-desktop.png",
    fullPage: true,
  });
  await scan(page);
});
test("actual pointer and keyboard drag, move buttons and undo", async ({
  page,
}) => {
  await openLab(page);
  const handle = page.getByRole("button", {
    name: "Drag Primary CTA",
    exact: true,
  });
  await page
    .locator(".lab-layer-select")
    .filter({ hasText: "Primary CTA" })
    .click();
  await handle.focus();
  await page.keyboard.press("Space");
  await expect(page.locator(".lab-drag-preview")).toBeVisible();
  await page.keyboard.press("ArrowUp");
  await expect(page.locator('[role="status"]').last()).toContainText(
    "area coupon",
  );
  await page.keyboard.press("Space");
  await expect(page.locator(".lab-node").nth(1)).toHaveAttribute(
    "data-layer",
    "cta",
  );
  await page.getByRole("button", { name: "Undo", exact: false }).click();
  await expect(page.locator(".lab-node").nth(2)).toHaveAttribute(
    "data-layer",
    "cta",
  );
  await page
    .getByRole("button", { name: "Move Primary CTA earlier", exact: true })
    .click();
  await expect(page.locator(".lab-node").nth(1)).toHaveAttribute(
    "data-layer",
    "cta",
  );
  await page
    .getByRole("button", { name: "Move Primary CTA later", exact: true })
    .click();
  await expect(page.locator(".lab-node").nth(2)).toHaveAttribute(
    "data-layer",
    "cta",
  );
  await page
    .getByRole("button", { name: "Hide Notification prompt", exact: true })
    .click();
  await expect(page.locator("[data-lab-notification]")).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Add or select Notification prompt",
      exact: true,
    })
    .click();
  await expect(page.locator("[data-lab-notification]")).toHaveCount(1);
  await page
    .locator(".lab-layer-select")
    .filter({ hasText: "Primary CTA" })
    .click();
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  const target = await page
    .locator(".lab-node[data-layer=header]")
    .boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2, box!.y - 10, { steps: 3 });
  await page.mouse.move(target!.x + 100, target!.y + 20, { steps: 15 });
  await page.mouse.up();
  await expect(page.locator(".lab-node").first()).toHaveAttribute(
    "data-layer",
    "cta",
  );
  await expect(page.locator(".lab-layers li").first()).toContainText(
    "Primary CTA",
  );
});
for (const layout of ["A", "B", "C"])
  test(`rendered reviews, locked states, and 390 fold for ${layout}`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await openLab(page);
    await page.getByLabel("Start from").selectOption(layout);
    await page
      .getByRole("button", { name: "Load template", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Shopper preview", exact: true })
      .click();
    const root = page.locator(".lab-shopper");
    const b = await root.boundingBox();
    expect(b!.width).toBe(390);
    expect(b!.height).toBe(844);
    for (const merchant of ["Vistaprint", "Kith"]) {
      await page.getByLabel("Merchant", { exact: true }).selectOption(merchant);
      await page
        .getByLabel("Task", { exact: true })
        .selectOption(merchant === "Kith" ? "no-code" : "offer");
      await review(page);
      const ws = await saved(page);
      const report = ws.versions.find(
        (d: { id: string }) => d.id === ws.activeId,
      ).review;
      expect(report.axeVersion).toMatch(/^4\./);
      for (const id of [
        "intent",
        "headline-fold",
        "card-fold",
        "cta-fold",
        "evidence",
        "unknown",
        "journey",
        "overflow",
      ])
        expect(
          report.findings.find((f: { id: string }) => f.id === id).status,
          id,
        ).toBe("pass");
      expect(
        report.findings.some((f: { status: string }) => f.status === "manual"),
      ).toBe(true);
      await page
        .locator(".lab-shopper")
        .screenshot({ path: `test-results/lab-${layout}-${merchant}.png` });
      await expect(page.locator("[data-lab-card]")).toContainText(
        merchant === "Vistaprint" ? "15% off" : "No verified public code",
      );
    }
  });
test("review detects real failures, deterministic fixes and stale reports", async ({
  page,
}) => {
  test.setTimeout(60000);
  await openLab(page);
  await page
    .getByRole("button", { name: "Hide Primary CTA", exact: true })
    .click();
  await review(page);
  const finding = page.locator(".lab-finding").filter({
    has: page.locator("summary", {
      hasText: "Primary action within first viewport",
    }),
  });
  await expect(finding).toContainText("not rendered");
  await finding.getByRole("button", { name: "Apply suggested fix" }).click();
  await expect(page.locator("[data-lab-primary]")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Design review", exact: false })
    .click();
  await expect(page.locator(".lab-report-summary")).toContainText(
    "out of date",
  );
  await review(page);
  await expect(finding).toContainText("Bottom edge");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page
    .locator(".lab-layer-select")
    .filter({ hasText: "Merchant header" })
    .click();
  await page.locator("[data-property-copy]").fill("Welcome");
  await review(page);
  const intent = page.locator(".lab-finding").filter({
    has: page.locator("summary", { hasText: "Merchant search intent" }),
  });
  await expect(intent).toHaveClass(/issue/);
  await intent.getByRole("button", { name: "Apply suggested fix" }).click();
  await expect(page.locator("[data-lab-headline]")).toContainText(
    "promo codes",
  );
  await page.getByRole("button", { name: "Properties", exact: true }).click();
  await page.getByLabel("Text color picker").fill("#0c110e");
  await review(page);
  await expect(
    page.locator(".lab-finding").filter({
      has: page.locator("summary", {
        hasText: "Text contrast · header",
      }),
    }),
  ).toBeVisible();
});
test("Version A/B comparison preserves distinct edits and respective reports", async ({
  page,
}) => {
  test.setTimeout(60000);
  await openLab(page);
  await review(page);
  await page
    .getByRole("button", { name: "Duplicate design", exact: true })
    .click();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
    "Version B",
  );
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page
    .locator(".lab-layer-select")
    .filter({ hasText: "Primary CTA" })
    .click();
  await page.getByLabel("Padding", { exact: true }).fill("22");
  await page
    .getByRole("button", { name: "Compare versions", exact: true })
    .click();
  await expect(page.locator(".lab-version-grid .lab-shopper")).toHaveCount(2);
  await review(page);
  const summaries = page.locator(".lab-version-grid .lab-report-summary");
  await expect(summaries).toHaveCount(2);
  await expect(summaries.nth(0)).not.toContainText("out of date");
  await expect(summaries.nth(1)).not.toContainText("out of date");
  await page
    .getByLabel("Hypothesis")
    .first()
    .fill("Larger CTA padding makes the source action easier to use.");
  await page.screenshot({
    path: "test-results/lab-versions.png",
    fullPage: true,
  });
  const ws = await saved(page);
  expect(ws.versions.length).toBe(2);
  expect(ws.versions.every((d: { review?: unknown }) => d.review)).toBe(true);
  await page.reload();
  await page
    .getByRole("button", { name: "Compare versions", exact: true })
    .click();
  await expect(
    page.locator(".lab-version-grid .lab-report-summary"),
  ).toHaveCount(2);
});
for (const width of [390, 768])
  test(`responsive editor, discovery task and portable read-only participant link ${width}`, async ({
    page,
    context,
  }) => {
    test.setTimeout(60000);
    await openLab(page, width);
    await page.getByLabel("Merchant", { exact: true }).selectOption("Kith");
    await page.getByLabel("Task", { exact: true }).selectOption("discovery");
    await review(page);
    await expect(
      page.locator(".lab-finding").filter({
        has: page.locator("summary", {
          hasText: "Similar stores or updates can be discovered",
        }),
      }),
    ).toHaveClass(/pass/);
    await page
      .getByRole("button", { name: "Create participant link", exact: true })
      .click();
    const link = await page
      .getByLabel("Read-only participant URL")
      .inputValue();
    const participant = await context.newPage();
    await participant.goto(link);
    await expect(participant.locator(".lab-participant")).toBeVisible();
    await expect(participant.locator(".lab-left")).toHaveCount(0);
    await expect(participant.locator(".lab-right")).toHaveCount(0);
    await expect(participant.locator("[data-lab-card]")).toContainText(
      "No verified public code",
    );
    await participant
      .getByRole("button", { name: "Preview offer updates", exact: true })
      .click();
    await expect(participant.locator(".lab-alert")).toBeVisible();
    await participant.locator("[data-lab-primary]").click();
    await expect(participant.locator(".lab-handoff a")).toHaveAttribute(
      "href",
      "https://simplycodes.com/store/kith.com#best-deal-section",
    );
    await participant.reload();
    await expect(participant.locator(".lab-participant")).toBeVisible();
    await participant.close();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/lab-review-${width}.png`,
      fullPage: true,
    });
    await scan(page);
    await page
      .getByRole("button", { name: "Read-only testing mode", exact: true })
      .click();
    await expect(page.locator(".lab-left")).toHaveCount(0);
    await page
      .getByRole("button", { name: "Return to editor", exact: true })
      .click();
    await expect(page.locator(".lab-left")).toBeVisible();
  });
test("below-fold CTA detection and deterministic move fix use actual layout measurements", async ({
  page,
}) => {
  test.setTimeout(60000);
  await openLab(page);
  for (let i = 0; i < 5; i++)
    await page
      .getByRole("button", { name: "Move Primary CTA later", exact: true })
      .click();
  await review(page);
  const report = page
    .locator(".lab-finding")
    .filter({
      has: page.locator("summary", {
        hasText: "Primary action within first viewport",
      }),
    });
  await expect(report).toHaveClass(/issue/);
  await expect(report).toContainText("844px limit");
  const ws = await saved(page);
  const measured = ws.versions[0].review.findings.find(
    (f: { id: string }) => f.id === "cta-fold",
  );
  expect(measured.status).toBe("issue");
  await report
    .getByRole("button", { name: "Apply suggested fix", exact: true })
    .click();
  await review(page);
  await expect(report).toHaveClass(/pass/);
  await page.screenshot({
    path: "test-results/lab-fixed-review.png",
    fullPage: true,
  });
});
