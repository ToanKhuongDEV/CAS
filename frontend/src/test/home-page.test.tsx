import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Home from "../app/(customer)/page";
import CustomerLayout from "../app/(customer)/layout";
import { loadPublicStore, loadPublicStoreWelcomeConfig } from "../lib/api/store/public-store.api";
import { getCurrentCustomerSalesSession } from "../lib/customer/sales-session";

const { push, replace } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push, replace }),
}));

vi.mock("../lib/api/store/public-store.api", () => ({
  getRememberedPublicStoreId: vi.fn().mockReturnValue(null),
  loadPublicStore: vi.fn(),
  loadPublicStoreWelcomeConfig: vi.fn(),
  rememberPublicStoreId: vi.fn(),
}));
vi.mock("../lib/customer/sales-session", () => ({
  getCurrentCustomerSalesSession: vi.fn(),
}));

describe("Home", () => {
  beforeEach(() => {
    push.mockClear();
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
    vi.mocked(getCurrentCustomerSalesSession).mockResolvedValue({
      customerInformationRequired: false,
      joinSessionRequired: false,
      joinableSessions: [],
      sessionStatus: "OPEN",
      tableCode: 12,
    });
  });

  it("renders the CAS welcome experience from public store APIs", async () => {
    render(
      <CustomerLayout>
        <Home />
      </CustomerLayout>,
    );

    expect(
      screen.getByRole("heading", { name: /chào mừng bạn đến bambu garden/i }),
    ).toBeInTheDocument();
    expect(await screen.findAllByText("Món ngon gọi nhanh, vui trọn từng bàn.")).toHaveLength(2);
    expect(await screen.findByText("Bàn 12")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bắt đầu gọi món/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mỳ cay" })).toHaveAttribute(
      "href",
      "/menu?category=M%E1%BB%B3%20cay",
    );
    expect(screen.getByRole("heading", { name: "Khám phá thực đơn" })).toBeInTheDocument();
    expect(screen.getByText("CAS Mì Cay")).toBeInTheDocument();
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
    expect(
      screen.getByRole("img", { name: "Tô mỳ cay nóng nổi bật tại Bambu Garden" }),
    ).toHaveAttribute("src", "https://example.test/hero-primary.jpg");
    expect(
      screen.getByRole("img", { name: "Tô mỳ cay nóng với rau nấm và nhiều topping" }),
    ).toHaveAttribute("src", "https://example.test/menu-1.jpg");
  });

  it("uses Bambu Garden and no invented email when store data cannot load", async () => {
    vi.mocked(loadPublicStore).mockRejectedValue(new Error("Unavailable"));
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /chào mừng bạn đến bambu garden/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /contact@cas-restaurant/i })).not.toBeInTheDocument();
    await waitFor(() => expect(loadPublicStore).toHaveBeenCalled());
  });

  it.each([
    ["OPEN", "/menu"],
    ["PAYMENT_PENDING", "/payment"],
  ] as const)("opens %s session at %s", async (sessionStatus, destination) => {
    vi.mocked(getCurrentCustomerSalesSession).mockResolvedValue({
      customerInformationRequired: false,
      joinSessionRequired: false,
      joinableSessions: [],
      sessionStatus,
      tableCode: 12,
    });
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /bắt đầu gọi món/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith(destination));
  });

  it("opens the start page when there is no current session", async () => {
    vi.mocked(getCurrentCustomerSalesSession).mockRejectedValue(new Error("No session"));
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /bắt đầu gọi món/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/start"));
  });
});
