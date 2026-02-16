import { expect, test } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 390, height: 844 };

async function getWidthMetrics(page: Parameters<typeof test>[0]["page"]) {
  return page.evaluate(() => ({
    viewport: window.innerWidth,
    doc: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
}

function overflowPx(metrics: { viewport: number; doc: number; body: number }) {
  return Math.max(metrics.doc, metrics.body) - metrics.viewport;
}

test.describe("DaisyPlayer layout regressions", () => {
  test("desktop: player width stays stable when switching long/short section titles", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/e2e/short-long");

    const player = page.locator(".DaisyPlayer__Container");
    await expect(player).toBeVisible();
    await expect(page.locator(".AudioPlayer__Title")).toContainText(
      "La vie est une chose étrange : roman, auteur : Donal Ryan"
    );

    const widthLong = await player.evaluate((node) => Math.round(node.getBoundingClientRect().width));
    const before = await getWidthMetrics(page);

    await page.locator(".DaisyPlayer__ToggleSectionsViewButton").click();
    await page.getByRole("button", { name: "À propos de ce livre numérique Daisy" }).click();
    await expect(page.locator(".AudioPlayer__Title")).toContainText("À propos de ce livre numérique Daisy");

    const widthShort = await player.evaluate((node) => Math.round(node.getBoundingClientRect().width));
    const after = await getWidthMetrics(page);

    expect(Math.abs(widthLong - widthShort)).toBeLessThanOrEqual(1);
    expect(overflowPx(before)).toBeLessThanOrEqual(1);
    expect(overflowPx(after)).toBeLessThanOrEqual(1);
  });

  test("desktop: long 12700-like TOC content does not create horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto("/e2e/long-12700");

    await expect(page.locator(".DaisyPlayer__Container")).toBeVisible();
    await expect(page.locator(".DaisyPlayer__Container h1")).toHaveText("Heureusement, elle n'a pas souffert");
    await expect(page.locator(".DaisyPlayer__Container h3")).toHaveText(
      "Bruce ToussaintCD[NETTOYAGE garder auteur uniquement]"
    );

    const before = await getWidthMetrics(page);

    await page.locator(".DaisyPlayer__ToggleSectionsViewButton").click();
    await expect(page.getByRole("button", { name: "Mercédès" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Jean-Claude" })).toBeVisible();
    await page.getByRole("button", { name: "À propos de ce livre numérique Daisy" }).click();
    await expect(page.locator(".AudioPlayer__Title")).toContainText("À propos de ce livre numérique Daisy");

    const afterAbout = await getWidthMetrics(page);

    await page.locator(".DaisyPlayer__ToggleSectionsViewButton").click();
    await page.getByRole("button", {
      name: "Heureusement, elle n'a pas souffert, auteur : Heureusement, elle n'a pas souffert / Bruce Toussaint",
    }).click();
    await expect(page.locator(".AudioPlayer__Title")).toContainText(
      "Heureusement, elle n'a pas souffert, auteur : Heureusement, elle n'a pas souffert / Bruce Toussaint"
    );

    const afterMain = await getWidthMetrics(page);

    expect(overflowPx(before)).toBeLessThanOrEqual(1);
    expect(overflowPx(afterAbout)).toBeLessThanOrEqual(1);
    expect(overflowPx(afterMain)).toBeLessThanOrEqual(1);
  });

  test("mobile: long 12700-like TOC content does not create horizontal overflow", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/e2e/long-12700");

    const player = page.locator(".DaisyPlayer__Container");
    await expect(player).toBeVisible();
    const widthBefore = await player.evaluate((node) => Math.round(node.getBoundingClientRect().width));

    const before = await getWidthMetrics(page);

    await page.locator(".DaisyPlayer__ToggleSectionsViewButton").click();
    await page.getByRole("button", { name: "À propos de ce livre numérique Daisy" }).click();
    await expect(page.locator(".AudioPlayer__Title")).toContainText("À propos de ce livre numérique Daisy");

    const after = await getWidthMetrics(page);
    const widthAfter = await player.evaluate((node) => Math.round(node.getBoundingClientRect().width));

    expect(widthBefore).toBeLessThanOrEqual(MOBILE_VIEWPORT.width + 1);
    expect(widthAfter).toBeLessThanOrEqual(MOBILE_VIEWPORT.width + 1);
    expect(overflowPx(before)).toBeLessThanOrEqual(1);
    expect(overflowPx(after)).toBeLessThanOrEqual(1);
  });
});
