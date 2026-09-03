import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OrderingLayout from "../app/(customer)/(ordering)/layout";
import MenuPage from "../app/(customer)/(ordering)/menu/page";
import { loadCustomerCatalog } from "../lib/api/catalog/published-catalog.api";
import { loadPublicStoreWelcomeConfig } from "../lib/api/store/public-store.api";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("../lib/api/catalog/published-catalog.api", () => ({ loadCustomerCatalog: vi.fn() }));
vi.mock("../lib/customer/table-session", () => ({
  getCurrentCustomerTableSession: vi.fn().mockResolvedValue({ tableCode: 5 }),
}));
vi.mock("../lib/api/store/public-store.api", () => ({
  loadPublicStore: vi.fn().mockResolvedValue({ logoUrl: null, name: "CAS" }),
  loadPublicStoreWelcomeConfig: vi.fn(),
}));

describe("MenuPage", () => {
  beforeEach(() => {
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
      <OrderingLayout>
        <MenuPage />
      </OrderingLayout>,
    );

    expect(screen.getByRole("searchbox", { name: "Tìm kiếm món ăn" })).toHaveAttribute(
      "placeholder",
      "Tìm món ngon tại Cas...",
    );
    expect((await screen.findAllByRole("heading", { name: "Mỳ cay API" })).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("Món từ API")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dịch vụ thêm" })).toHaveAttribute(
      "href",
      "#additional-services",
    );
    expect(screen.getByRole("heading", { name: "Dịch vụ thêm" })).toBeInTheDocument();
    expect(loadCustomerCatalog).toHaveBeenCalledOnce();
    expect(screen.queryByText("Mỳ cay đặc biệt 7 cấp độ")).not.toBeInTheDocument();
    expect(screen.getByText("Món hết hàng API")).toBeInTheDocument();
    expect(screen.getByText("Hết hàng")).toBeInTheDocument();
    expect(await screen.findByAltText("Banner giới thiệu cửa hàng")).toHaveAttribute(
      "src",
      expect.stringContaining("store-banner.jpg"),
    );
  });
});
