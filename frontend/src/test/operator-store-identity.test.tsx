import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OperatorStoreIdentity } from "../components/operator/operator-store-identity";
import { getCurrentOperationalAccount } from "../lib/auth/operational-auth";
import { loadPublicStore } from "../lib/api/store/public-store.api";

vi.mock("../lib/auth/firebase", () => ({
  getFirebaseAuth: () => ({ currentUser: { uid: "operator-1" } }),
}));
vi.mock("../lib/auth/operational-auth", () => ({ getCurrentOperationalAccount: vi.fn() }));
vi.mock("../lib/api/store/public-store.api", () => ({
  getRememberedPublicStoreId: vi.fn(() => 1),
  loadPublicStore: vi.fn(),
}));

describe("OperatorStoreIdentity", () => {
  it("loads the store assigned to the operator instead of the remembered public store", async () => {
    vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
      accountId: 2,
      displayName: "Operator Two",
      role: "OPERATOR",
      storeId: 2,
    });
    vi.mocked(loadPublicStore).mockResolvedValue({
      address: "2 Đường CAS",
      closeTime: "22:00",
      email: "store-2@example.com",
      googleMapsLocation: null,
      logoStorageKey: null,
      logoUrl: null,
      name: "Cơ sở 2",
      brandName: "Thương hiệu CAS",
      branchName: "Chi nhánh 2",
      openTime: "09:00",
      phone: "0900000002",
      status: "ACTIVE",
      welcomeSlogan: "Vui trọn từng bàn",
    });

    render(<OperatorStoreIdentity inHeader subtitle="Vận hành" />);

    await waitFor(() => expect(loadPublicStore).toHaveBeenCalledWith(2));
    expect(await screen.findByText("Vui trọn từng bàn")).toBeInTheDocument();
    expect(screen.getByText("Cơ sở Chi nhánh 2")).toBeInTheDocument();
    expect(screen.queryByText("Thương hiệu CAS")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Logo cửa hàng" })).toHaveAttribute(
      "src",
      "/images/bambu-garden-wordmark.svg",
    );
  });
});
