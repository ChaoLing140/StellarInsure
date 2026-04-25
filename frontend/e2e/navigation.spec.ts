import { test, expect } from "@playwright/test";

const PUBLIC_ROUTES = ["/", "/legal/privacy", "/legal/terms"];

for (const route of PUBLIC_ROUTES) {
  test(`${route} loads without JS errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    expect(errors).toHaveLength(0);
  });
}

test("404 page renders gracefully", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist-xyz");
  // Next.js returns 404 for unknown routes
  expect(response?.status()).toBe(404);
});

test("skip link jumps keyboard users to main content", async ({ page }) => {
  await page.goto("/");

  const skipLink = page.locator("a.skip-link");
  const main = page.locator("main#main-content");

  await expect(skipLink).toHaveAttribute("href", "#main-content");
  await expect(main).toBeVisible();

  await skipLink.focus();
  await skipLink.press("Enter");

  await expect(page).toHaveURL(/#main-content$/);
  await expect(main).toBeFocused();
});
