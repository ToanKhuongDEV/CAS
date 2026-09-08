import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OrderingLayout from "../app/(customer)/(ordering)/layout";
import MenuPage from "../app/(customer)/(ordering)/menu/page";
import { QueryProvider } from "../components/providers/query-provider";
import { ToastProvider } from "../components/ui/toast-provider";
import { loadCustomerCatalog } from "../lib/api/catalog/published-catalog.api";
import { loadPublicStore, loadPublicStoreWelcomeConfig } from "../lib/api/store/public-store.api";

vi.mock("next/navigation", () => ({
  usePathname: () => "/menu",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("../lib/api/catalog/published-catalog.api", () => ({ loadCustomerCatalog: vi.fn() }));
vi.mock("../lib/customer/table-session", () => ({
  getCurrentCustomerTableSession: vi.fn().mockResolvedValue({ tableCode: 5 }),
  hasOpenCustomerTableSession: vi.fn().mockResolvedValue(true),
}));
vi.mock("../lib/api/store/public-store.api", () => ({
  loadPublicStore: vi.fn(),
  loadPublicStoreWelcomeConfig: vi.fn(),
}));
vi.mock("../lib/api/notification/notification.api", () => ({
  loadCustomerNotifications: vi.fn().mockResolvedValue({ notifications: [], unreadCount: 0 }),
  markAllCustomerNotificationsRead: vi.fn(),
  markCustomerNotificationRead: vi.fn(),
}));

describe("MenuPage", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/menu");
    vi.mocked(loadPublicStore).mockResolvedValue({
      address: "1 CAS Street",
      closeTime: "22:00:00",
      email: "contact@cas.test",
      googleMapsLocation: null,
      logoStorageKey: null,
      logoUrl: null,
      name: "CAS",
      openTime: "08:00:00",
      phone: "0901 234 567",
      status: "ACTIVE",
      welcomeSlogan: null,
    });
    vi.mocked(loadPublicStoreWelcomeConfig).mockResolvedValue({
      bannerImageUrl: "https://example.test/store-banner.jpg",
      heroPrimaryImageUrl: null,
      heroSecondaryImageUrl: null,
      menuPreview1ImageUrl: null,
      menuPreview2ImageUrl: null,
      menuPreview3ImageUrl: null,
      menuPreview4ImageUrl: null,
      menuPreview5ImageUrl: null,
    });
    vi.mocked(loadCustomerCatalog).mockResolvedValue({
      categories: [
        {
          categoryType: "REGULAR",
          description: null,
          displayOrder: 1,
          id: 1,
          name: "Mỳ cay API",
          status: "ACTIVE",
        },
      ],
      items: [
        {
          availabilityStatus: "ACTIVE",
          categoryId: 1,
          description: "Món từ API",
          displayOrder: 1,
          id: 10,
          imageStorageKey: null,
          imageUrl: null,
          name: "Mỳ cay API",
          optionGroups: [],
          price: 55_000,
          tags: [],
        },
        {
          availabilityStatus: "SOLD_OUT",
          categoryId: 1,
          description: "Tạm hết hàng",
          displayOrder: 2,
          id: 11,
          imageStorageKey: null,
          imageUrl: null,
          name: "Món hết hàng API",
          optionGroups: [],
          price: 45_000,
          tags: [],
        },
      ],
      optionGroups: [],
      tags: [],
    });
  });

  it("renders catalog data loaded from the API", async () => {
    render(
      <QueryProvider>
        <ToastProvider>
          <OrderingLayout>
            <MenuPage />
          </OrderingLayout>
        </ToastProvider>
      </QueryProvider>,
    );

    expect(screen.getByRole("searchbox", { name: "Tìm kiếm món ăn" })).toHaveAttribute(
      "placeholder",
      "Tìm món ngon tại Cas...",
    );
    expect((await screen.findAllByRole("heading", { name: "Mỳ cay API" })).length).toBeGreaterThan(
      0,
    );
    expect(
      screen
        .getAllByRole("link", { name: "Mỳ cay API" })
        .find((link) => link.getAttribute("href") === "/menu/10"),
    ).toBeDefined();
    expect(screen.getByText("Món từ API")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dịch vụ thêm" })).toHaveAttribute(
      "href",
      "#additional-services",
    );
    expect(screen.getByRole("heading", { name: "Dịch vụ thêm" })).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: "Liên hệ qua Zalo: 0901 234 567" }),
    ).toHaveAttribute("href", "https://zalo.me/0901234567");
    expect(loadCustomerCatalog).toHaveBeenCalledOnce();
    expect(screen.queryByText("Mỳ cay đặc biệt 7 cấp độ")).not.toBeInTheDocument();
    expect(screen.getByText("Món hết hàng API")).toBeInTheDocument();
    expect(screen.getByText("Hết hàng")).toBeInTheDocument();
    expect(await screen.findByAltText("Banner giới thiệu cửa hàng")).toHaveAttribute(
      "src",
      expect.stringContaining("store-banner.jpg"),
    );
  });

  it("scrolls to the category requested from the welcome page", async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    window.history.replaceState({}, "", "/menu?category=Mỳ cay API");

    render(
      <QueryProvider>
        <ToastProvider>
          <OrderingLayout>
            <MenuPage />
          </OrderingLayout>
        </ToastProvider>
      </QueryProvider>,
    );

    await screen.findByRole("heading", { level: 2, name: "Mỳ cay API" });

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" }));
  });

  it("shows a success toast after adding an item to the cart", async () => {
    render(
      <QueryProvider>
        <ToastProvider>
          <OrderingLayout>
            <MenuPage />
          </OrderingLayout>
        </ToastProvider>
      </QueryProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Chọn tùy chọn cho Mỳ cay API" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Đã thêm Mỳ cay API vào giỏ hàng.");
  });
});
