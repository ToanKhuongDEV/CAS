import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AdminSettingsPage from "../app/admin/settings/page";
import { loadLongWaitWarningMinutes } from "../lib/api/store/long-wait-warning.api";
import { loadStoreSettings } from "../lib/api/store/store-settings.api";

vi.mock("../components/admin/store-welcome-config-section", () => ({
  StoreWelcomeConfigSection: () => null,
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
  });
});
