import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Home from "../app/(customer)/page";
import { loadPublicStore, loadPublicStoreWelcomeConfig } from "../lib/api/store/public-store.api";

vi.mock("../lib/api/store/public-store.api", () => ({
  loadPublicStore: vi.fn(),
  loadPublicStoreWelcomeConfig: vi.fn(),
}));

describe("Home", () => {
  beforeEach(() => {
    vi.mocked(loadPublicStore).mockResolvedValue({
      address: "123 Đường Ẩm Thực, Quận 1",
      closeTime: "22:00:00",
      email: "hello@cas.local",
      googleMapsLocation: "https://maps.google.com/?q=10.7769,106.7009",
      logoStorageKey: null,
      logoUrl: null,
      name: "CAS Mì Cay",
      openTime: "09:00:00",
      phone: "0900000000",
      status: "ACTIVE",
      welcomeSlogan: "Món ngon gọi nhanh, vui trọn từng bàn.",
    });
    vi.mocked(loadPublicStoreWelcomeConfig).mockResolvedValue({
      bannerImageUrl: "https://example.test/banner.jpg",
      heroPrimaryImageUrl: "https://example.test/hero-primary.jpg",
      heroSecondaryImageUrl: "https://example.test/hero-secondary.jpg",
      menuPreview1ImageUrl: "https://example.test/menu-1.jpg",
      menuPreview2ImageUrl: null,
      menuPreview3ImageUrl: null,
      menuPreview4ImageUrl: null,
      menuPreview5ImageUrl: null,
    });
  });

  it("renders the CAS welcome experience from public store APIs", async () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: /chào mừng bạn đến cas/i })).toBeInTheDocument();
    expect(await screen.findByText("Món ngon gọi nhanh, vui trọn từng bàn.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /bắt đầu gọi món/i })).toHaveAttribute("href", "/menu");
    expect(screen.getByRole("heading", { name: "Khám phá thực đơn" })).toBeInTheDocument();
    expect(screen.getAllByText("CAS Mì Cay")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "0900000000" })).toHaveAttribute(
      "href",
      "tel:0900000000",
    );
    expect(screen.getByRole("link", { name: "hello@cas.local" })).toHaveAttribute(
      "href",
      "mailto:hello@cas.local",
    );
    expect(screen.getByText("09:00 – 22:00 mỗi ngày")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Banner giới thiệu cửa hàng" })).toHaveAttribute(
      "src",
      "https://example.test/banner.jpg",
    );
    expect(screen.getByRole("img", { name: "Tô mỳ cay nóng nổi bật tại CAS" })).toHaveAttribute(
      "src",
      "https://example.test/hero-primary.jpg",
    );
    expect(
      screen.getByRole("img", { name: "Tô mỳ cay nóng với rau nấm và nhiều topping" }),
    ).toHaveAttribute("src", "https://example.test/menu-1.jpg");

    fireEvent.click(screen.getByRole("button", { name: "Chuyển đổi giao diện sáng hoặc tối" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });
});
