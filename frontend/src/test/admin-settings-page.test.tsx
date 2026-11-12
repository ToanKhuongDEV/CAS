import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AdminSettingsPage from "../app/admin/settings/page";
import { loadLongWaitWarningMinutes } from "../lib/api/store/long-wait-warning.api";
import { loadStoreSettings } from "../lib/api/store/store-settings.api";

vi.mock("../components/admin/store-welcome-config-section", () => ({
  StoreWelcomeConfigSection: () => null,
}));
vi.mock("../components/admin/brand-settings-section", () => ({
  BrandSettingsSection: () => null,
}));
vi.mock("../components/admin/create-store-section", () => ({
  CreateStoreSection: () => null,
}));
vi.mock("../components/ui/toast-provider", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));
vi.mock("../lib/api/catalog/cloudinary-upload", () => ({ uploadImage: vi.fn() }));
vi.mock("../lib/api/store/long-wait-warning.api", () => ({
  loadLongWaitWarningMinutes: vi.fn(),
  updateLongWaitWarningMinutes: vi.fn(),
}));
vi.mock("../lib/api/store/store-settings.api", () => ({
  loadStoreSettings: vi.fn(),
  updateStoreSettings: vi.fn(),
}));

describe("AdminSettingsPage", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows a recoverable error when store settings cannot be loaded", async () => {
    vi.mocked(loadLongWaitWarningMinutes).mockResolvedValue(25);
    vi.mocked(loadStoreSettings).mockRejectedValue(new Error("Không thể tải cấu hình cửa hàng."));

    render(<AdminSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Không thể tải cấu hình cửa hàng.")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Lưu Thông tin Cơ sở" })).toBeDisabled();
  });

  it("updates the phone preview with the current store fields", async () => {
    vi.mocked(loadLongWaitWarningMinutes).mockResolvedValue(25);
    vi.mocked(loadStoreSettings).mockResolvedValue({
      branchName: "Chi nhánh A",
      address: "Địa chỉ A",
      phone: "0900000000",
      email: "a@example.com",
      logoUrl: null,
      logoStorageKey: null,
      googleMapsLocation: null,
      openTime: "08:00",
      closeTime: "22:00",
      welcomeSlogan: null,
      status: "ACTIVE",
    });
    render(<AdminSettingsPage />);
    expect(await screen.findByText("Chi nhánh A")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Nhập tên cơ sở..."), {
      target: { value: "Chi nhánh B" },
    });
    expect(screen.getByText("Chi nhánh B")).toBeInTheDocument();
    expect(screen.getByText("Đang mở")).toBeInTheDocument();
    expect(
      within(
        screen.getByText("Xem trước Thông tin Cửa hàng").parentElement!.parentElement!,
      ).getByText("25 phút"),
    ).toBeInTheDocument();
  });
});
