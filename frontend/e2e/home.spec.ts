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
  await expect(
    page.locator("[data-drag-scroll-root]"),
  ).toHaveAttribute("data-drag-scroll-ready", "true");

  await page.mouse.move(10, 700);
  await page.mouse.down();
  await page.mouse.move(10, 300, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => window.scrollY > 0)).toBe(true);
});

test("shows the CAS menu page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/menu");

  await expect(page).toHaveTitle(/Thực đơn \| CAS/);
  await expect(
    page.getByRole("searchbox", { name: "Tìm kiếm món ăn" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Mỳ cay đặc biệt 7 cấp độ" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Gà rán giòn rụm" }),
  ).toBeVisible();
  const categoryNavigation = page.getByRole("navigation", {
    name: "Đi đến danh mục món",
  });
  await expect(categoryNavigation).toHaveCSS("position", "sticky");
  const categoryScroller = categoryNavigation.locator("div");
  await expect
    .poll(() =>
      categoryScroller.evaluate(
        (element) => element.scrollWidth > element.clientWidth,
      ),
    )
    .toBe(true);
  const categoryScrollerBox = await categoryScroller.boundingBox();

  if (!categoryScrollerBox) {
    throw new Error("Không xác định được kích thước thanh category");
  }

  const categoryScrollerY =
    categoryScrollerBox.y + categoryScrollerBox.height / 2;

  await page.mouse.move(
    categoryScrollerBox.x + categoryScrollerBox.width - 24,
    categoryScrollerY,
  );
  await page.mouse.down();
  await page.mouse.move(categoryScrollerBox.x + 40, categoryScrollerY, {
    steps: 8,
  });
  await page.mouse.up();
  await expect
    .poll(() =>
      categoryScroller.evaluate((element) => element.scrollLeft > 0),
    )
    .toBe(true);
  await page.getByRole("link", { name: "Ăn vặt" }).click();
  await expect(page).toHaveURL(/#an-vat$/);
  await expect(
    page.getByRole("heading", { name: "Ăn vặt", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /xem món đã chọn/i }),
  ).toContainText("4 món");
});

test("shows the CAS cart page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/cart");

  await expect(page).toHaveTitle(/Giỏ hàng \| CAS/);
  await expect(
    page.getByRole("heading", { name: "Giỏ hàng của bạn" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Mỳ cay đặc biệt 7 cấp độ" }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: /ghi chú chung/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Gửi món xuống bếp" }),
  ).toBeVisible();
  await expect(page.getByText(/đang chuẩn bị/i)).toHaveCount(0);
});

test("shows the customer information page from a table QR token", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/table/demo-qr-token");

  await expect(page).toHaveTitle(/Thông tin bàn \| CAS/);
  await expect(
    page.getByRole("heading", { name: "Mở phiên gọi món" }),
  ).toBeVisible();
  await expect(page.getByLabel("Tên của bạn")).toBeVisible();
  await expect(page.getByLabel("Số điện thoại")).toBeVisible();
  const submitButton = page.getByRole("button", {
    name: "Mở phiên và xem thực đơn",
  });

  await submitButton.click();
  await expect(page.getByText("Vui lòng nhập tên của bạn.")).toBeVisible();
  await expect(page.getByText("Vui lòng nhập số điện thoại.")).toBeVisible();

  await page.getByLabel("Tên của bạn").fill("Nguyễn Văn A");
  await page.getByLabel("Số điện thoại").fill("0901234567");
  await submitButton.click();

  await expect(page).toHaveURL(/\/menu$/);
});

test("creates a customer payment request UI", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/payment");

  await expect(page).toHaveTitle(/Thanh toán \| CAS/);
  await expect(
    page.getByRole("heading", { name: "Kiểm tra hóa đơn" }),
  ).toBeVisible();
  await expect(page.getByText("Tổng cần thanh toán")).toBeVisible();
  await expect(page.getByText(/ngân hàng|mb bank/i)).toHaveCount(0);

  await page
    .getByRole("button", { name: "Gửi yêu cầu thanh toán" })
    .click();

  await expect(
    page.getByText("Đang chờ nhân viên xác nhận"),
  ).toBeVisible();
  await expect(
    page.getByText(/vui lòng ra gặp nhân viên để hoàn tất thanh toán/i),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Đã gửi yêu cầu thanh toán" }),
  ).toBeDisabled();
});
