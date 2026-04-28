import { test, expect } from "@playwright/test";

test.describe("Visual regression – home page", () => {
  test("home page matches snapshot on desktop", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("home-desktop.png", { fullPage: true });
  });

  test("home page matches snapshot on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("home-mobile.png", { fullPage: true });
  });
});

test.describe("Visual regression – unauthenticated redirect pages", () => {
  test("policies page shows connect prompt or redirects on desktop", async ({ page }) => {
    await page.goto("/policies");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("policies-unauthenticated-desktop.png", {
      fullPage: true,
    });
  });

  test("policies page shows connect prompt or redirects on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/policies");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("policies-unauthenticated-mobile.png", {
      fullPage: true,
    });
  });

  test("create page shows connect prompt or redirects on desktop", async ({ page }) => {
    await page.goto("/create");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("create-unauthenticated-desktop.png", { fullPage: true });
  });

  test("settings page shows connect prompt or redirects on desktop", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("settings-unauthenticated-desktop.png", {
      fullPage: true,
    });
  });
});

test.describe("Visual regression – error states", () => {
  test("404 not-found page matches snapshot", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("not-found.png", { fullPage: true });
  });
});
