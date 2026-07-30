import { expect, test } from "@playwright/test";

test("shows the CAS landing page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/CAS/);
  await expect(
    page.getByRole("heading", { name: /một trải nghiệm/i }),
  ).toBeVisible();
});
