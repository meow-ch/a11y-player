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

async function stubPendingMediaPlayback(page: Parameters<typeof test>[0]["page"]) {
  await page.addInitScript(() => {
    const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "src");
    let pendingPlayReject: ((reason: unknown) => void) | null = null;

    (window as any).__a11yPlayerUnhandledRejections = [];
    (window as any).__a11yPlayerPlayCallCount = 0;

    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason;
      (window as any).__a11yPlayerUnhandledRejections.push({
        name: reason?.name,
        message: reason?.message ?? String(reason),
      });
    });

    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: function play() {
        (window as any).__a11yPlayerPlayCallCount += 1;
        return new Promise((_resolve, reject) => {
          pendingPlayReject = reject;
        });
      },
    });

    Object.defineProperty(HTMLMediaElement.prototype, "pause", {
      configurable: true,
      value: function pause() {
        if (!pendingPlayReject) return;
        const reject = pendingPlayReject;
        pendingPlayReject = null;
        reject(new DOMException("The play() request was interrupted by a call to pause().", "AbortError"));
      },
    });

    if (originalSrcDescriptor?.get && originalSrcDescriptor?.set) {
      Object.defineProperty(HTMLMediaElement.prototype, "src", {
        configurable: true,
        get() {
          return originalSrcDescriptor.get?.call(this);
        },
        set(value) {
          if (pendingPlayReject) {
            const reject = pendingPlayReject;
            pendingPlayReject = null;
            reject(new DOMException("The play() request was interrupted by a new load request.", "AbortError"));
          }
          originalSrcDescriptor.set?.call(this, value);
        },
      });
    }
  });
}

async function getUnhandledRejections(page: Parameters<typeof test>[0]["page"]) {
  return page.evaluate(() => (window as any).__a11yPlayerUnhandledRejections);
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

  test("handles interrupted play promise when switching sections during pending playback", async ({ page }) => {
    await stubPendingMediaPlayback(page);
    await page.goto("/e2e/short-long");

    await expect(page.locator(".DaisyPlayer__Container")).toBeVisible();
    await expect(page.locator(".AudioPlayer__Title")).toContainText(
      "La vie est une chose étrange : roman, auteur : Donal Ryan"
    );

    await page.locator(".AudioPlayer__Control--play-pause").click();
    await page.waitForFunction(() => (window as any).__a11yPlayerPlayCallCount > 0);

    await page.getByRole("button", { name: /Section Suivante/i }).click();
    await expect(page.locator(".AudioPlayer__Title")).toContainText("À propos de ce livre numérique Daisy");

    await page.waitForTimeout(50);
    expect(await getUnhandledRejections(page)).toEqual([]);
  });
});
