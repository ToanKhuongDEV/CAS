import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OperatorCatalogAvailabilityView } from "../components/operator/operator-catalog-availability-view";
import { ToastProvider } from "../components/ui/toast-provider";
import {
  loadOperatorCatalog,
  updateOperatorItemAvailability,
} from "../lib/api/catalog/published-catalog.api";

vi.mock("../lib/api/catalog/published-catalog.api", () => ({
  loadOperatorCatalog: vi.fn(),
  updateOperatorItemAvailability: vi.fn(),
}));

describe("OperatorCatalogAvailabilityView", () => {
  beforeEach(() => {
    vi.mocked(loadOperatorCatalog).mockResolvedValue({
      categories: [],
      items: [
        {
          availabilityStatus: "ACTIVE",
          categoryId: 1,
          description: null,
          displayOrder: 1,
          id: 10,
          imageStorageKey: null,
          imageUrl: "/images/welcome/spicy-noodles.jpg",
          name: "Mì cay",
          optionGroups: [],
          price: 45_000,
          tags: [],
        },
      ],
      optionGroups: [],
      tags: [],
    });
    vi.mocked(updateOperatorItemAvailability).mockResolvedValue(undefined);
  });

  it("only lets the operator change an item's selling availability", async () => {
    render(
      <ToastProvider>
        <OperatorCatalogAvailabilityView />
      </ToastProvider>,
    );

    expect(await screen.findByText("Mì cay")).toBeInTheDocument();
    expect(screen.getByAltText("Mì cay")).toHaveAttribute(
      "src",
      "/images/welcome/spicy-noodles.jpg",
    );
    expect(screen.getByRole("columnheader", { name: "Trạng thái" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Trạng thái món" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /thêm món/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Đánh dấu hết hàng" }));

    await waitFor(() =>
      expect(updateOperatorItemAvailability).toHaveBeenCalledWith(10, "SOLD_OUT"),
    );
    expect(await screen.findByText("Mì cay đã được đánh dấu hết hàng.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Chuyển sang đang bán" })).toBeInTheDocument();
  });
});
