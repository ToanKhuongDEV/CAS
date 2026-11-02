import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import AdminPromotionsPage from "../app/admin/promotions/page";
import { loadAdminCatalog } from "../lib/api/catalog/catalog.api";
import { createPromotion, loadAdminPromotions } from "../lib/api/promotion/promotion.api";

vi.mock("../lib/api/catalog/catalog.api", () => ({ loadAdminCatalog: vi.fn() }));
vi.mock("../lib/api/promotion/promotion.api", () => ({
  createPromotion: vi.fn(),
  loadAdminPromotions: vi.fn(),
  loadPromotionRedemptions: vi.fn(),
  updatePromotion: vi.fn(),
  updatePromotionStatus: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(loadAdminPromotions).mockResolvedValue([]);
  vi.mocked(loadAdminCatalog).mockResolvedValue({
    items: [],
    categories: [],
    optionGroups: [],
    tags: [],
  });
});

it("keeps the form and identifies a code rejected as duplicate by the server", async () => {
  vi.mocked(createPromotion).mockRejectedValue(new Error("Mã RT42 đã tồn tại trong cơ sở này."));
  render(<AdminPromotionsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Tạo promotion" }));
  fireEvent.change(screen.getByPlaceholderText("VD: Mùa hè giảm 50.000đ"), {
    target: { value: "Ưu đãi" },
  });
  const codes = screen.getByPlaceholderText("VD: DG12345, RT42, DVG34DD");
  fireEvent.change(codes, { target: { value: "DG12345, RT42, DVG34DD" } });
  fireEvent.change(screen.getByLabelText("Số lượt"), { target: { value: "5" } });
  fireEvent.click(screen.getByRole("button", { name: "Thêm mã" }));
  fireEvent.click(screen.getByRole("button", { name: "Lưu promotion" }));
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận lưu" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Mã RT42 đã tồn tại trong cơ sở này.");
  expect(screen.getByRole("list", { name: "Danh sách mã khuyến mãi" })).toHaveTextContent(
    "DG12345 · 5 lượt",
  );
  expect(screen.getByRole("list", { name: "Danh sách mã khuyến mãi" })).toHaveTextContent(
    "RT42 · 5 lượt",
  );
  expect(screen.getByPlaceholderText("VD: Mùa hè giảm 50.000đ")).toHaveValue("Ưu đãi");
});

it("keeps all inputs when one code is duplicated within the entered list", async () => {
  render(<AdminPromotionsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Tạo promotion" }));
  fireEvent.change(screen.getByPlaceholderText("VD: Mùa hè giảm 50.000đ"), {
    target: { value: "Ưu đãi" },
  });
  const codes = screen.getByPlaceholderText("VD: DG12345, RT42, DVG34DD");
  fireEvent.change(codes, { target: { value: "DG12345, RT42, DG12345" } });
  fireEvent.click(screen.getByRole("button", { name: "Thêm mã" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Mã DG12345 bị trùng trong danh sách nhập.",
  );
  expect(codes).toHaveValue("DG12345, RT42, DG12345");
  expect(createPromotion).not.toHaveBeenCalled();
});

it("requires adding pending codes before saving", () => {
  render(<AdminPromotionsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Tạo promotion" }));
  fireEvent.change(screen.getByPlaceholderText("VD: Mùa hè giảm 50.000đ"), {
    target: { value: "Ưu đãi" },
  });
  fireEvent.change(screen.getByLabelText("Mã"), { target: { value: "RT42" } });
  fireEvent.click(screen.getByRole("button", { name: "Lưu promotion" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Nhấn Thêm mã");
  expect(createPromotion).not.toHaveBeenCalled();
});

it("validates code and quota before adding and allows removing a code", () => {
  render(<AdminPromotionsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Tạo promotion" }));
  const code = screen.getByLabelText("Mã");
  const quota = screen.getByLabelText("Số lượt");
  const add = screen.getByRole("button", { name: "Thêm mã" });
  fireEvent.change(code, { target: { value: "RT-42" } });
  fireEvent.click(add);
  expect(screen.getByRole("alert")).toHaveTextContent("Ví dụ: DG12345, RT42, DVG34DD");
  fireEvent.change(code, { target: { value: "RT42" } });
  fireEvent.change(quota, { target: { value: "0" } });
  fireEvent.click(add);
  expect(screen.getByRole("alert")).toHaveTextContent("Số lượt phải là số nguyên");
  fireEvent.change(quota, { target: { value: "5" } });
  fireEvent.click(add);
  expect(screen.getByRole("list", { name: "Danh sách mã khuyến mãi" })).toHaveTextContent(
    "RT42 · 5 lượt",
  );
  fireEvent.click(screen.getByRole("button", { name: "Xóa mã RT42" }));
  expect(screen.getByRole("list", { name: "Danh sách mã khuyến mãi" })).toBeEmptyDOMElement();
});
