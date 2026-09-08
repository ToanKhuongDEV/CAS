import { describe, expect, it } from "vitest";

import { validatePromotionForm, type PromotionForm } from "../app/admin/promotions/page";

const validForm = (): PromotionForm => ({
  code: "SAVE10",
  discountValue: 10,
  endAt: "2026-10-01T12:00",
  maxDiscountAmount: 100000,
  maxRedemptions: 100,
  maxRedemptionsPerCustomer: 1,
  minBillAmount: 50000,
  name: "Giảm giá tháng 10",
  promotionType: "PERCENT_OFF",
  startAt: "2026-10-01T08:00",
  status: "DRAFT",
  targets: [],
});

describe("validatePromotionForm", () => {
  it("rejects invalid values, quota, dates, and missing item-promotion target", () => {
    const errors = validatePromotionForm({
      ...validForm(),
      discountValue: 101,
      endAt: "2026-10-01T07:00",
      maxRedemptions: 0,
      name: " ",
      promotionType: "ITEM_PERCENT_OFF",
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        "Vui lòng nhập tên chương trình.",
        "Tỷ lệ giảm không được vượt quá 100%.",
        "Số lượt dùng tối đa phải là số nguyên lớn hơn 0.",
        "Thời điểm kết thúc phải sau hoặc bằng thời điểm bắt đầu.",
        "Khuyến mãi theo món hoặc danh mục cần chọn ít nhất một phạm vi áp dụng.",
      ]),
    );
  });

  it("accepts a valid whole-bill promotion", () => {
    expect(validatePromotionForm(validForm())).toEqual([]);
  });
});
