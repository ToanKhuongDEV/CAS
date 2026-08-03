import { expect, test } from "@playwright/test";

test("shows the CAS welcome page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page).toHaveTitle(/CAS/);
  await expect(
    page.getByRole("heading", { name: /chào mừng bạn đến cas/i }),
  ).toBeVisible();
  await expect(page.getByText("Bàn 05")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /bắt đầu gọi món/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Khám phá thực đơn" }),
  ).toBeVisible();
  await expect(page.getByText("Mỳ cay", { exact: true })).toBeVisible();
  await expect(page.getByText("Gà rán", { exact: true })).toBeVisible();
});
