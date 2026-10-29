import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BrandSettingsSection } from "../components/admin/brand-settings-section";
import { StoreWelcomeConfigSection } from "../components/admin/store-welcome-config-section";
import { getCurrentOperationalAccount } from "../lib/auth/operational-auth";
import { loadBrandSettings, updateBrandSettings } from "../lib/api/store/store-settings.api";
import { loadStoreWelcomeConfig } from "../lib/api/store/store-welcome-config.api";

const showToast = vi.fn();
vi.mock("../components/ui/toast-provider", () => ({ useToast: () => ({ showToast }) }));
vi.mock("../lib/auth/firebase", () => ({ getFirebaseAuth: () => ({ currentUser: {} }) }));
vi.mock("../lib/auth/operational-auth", () => ({ getCurrentOperationalAccount: vi.fn() }));
vi.mock("../lib/api/store/store-settings.api", () => ({
  loadBrandSettings: vi.fn(),
  updateBrandSettings: vi.fn(),
}));
vi.mock("../lib/api/store/store-welcome-config.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../lib/api/store/store-welcome-config.api")>()),
  loadStoreWelcomeConfig: vi.fn(),
  saveStoreWelcomeConfig: vi.fn(),
}));

describe("Admin settings sections", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("reports a brand loading failure to a super admin", async () => {
    vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
      accountId: 1,
      displayName: "Super Admin",
      role: "SUPER_ADMIN",
      storeId: 1,
    });
    vi.mocked(loadBrandSettings).mockRejectedValue(new Error("Không thể tải thương hiệu."));

    render(<BrandSettingsSection />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Không thể tải thương hiệu.");
  });

  it("shows the fixed logo and preserves the stored logo when saving brand settings", async () => {
    vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
      accountId: 1,
      displayName: "Super Admin",
      role: "SUPER_ADMIN",
      storeId: 1,
    });
    vi.mocked(loadBrandSettings).mockResolvedValue({
      name: "CAS",
      logoUrl: "https://example.com/old.png",
      logoStorageKey: "cas/brand/old",
      welcomeSlogan: "Xin chào",
    });

    render(<BrandSettingsSection />);

    expect(await screen.findByRole("img", { name: "Logo thương hiệu" })).toHaveAttribute(
      "src",
      "/images/bambu-garden-logo.png",
    );
    expect(screen.getByLabelText("Tải logo chung")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Bỏ logo" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Lưu thương hiệu chung" }));
    await vi.waitFor(() =>
      expect(updateBrandSettings).toHaveBeenCalledWith({
        name: "CAS",
        logoUrl: "https://example.com/old.png",
        logoStorageKey: "cas/brand/old",
        welcomeSlogan: "Xin chào",
      }),
    );
  });

  it("does not allow saving welcome images after a loading failure", async () => {
    vi.mocked(loadStoreWelcomeConfig).mockRejectedValue(new Error("Không thể tải Welcome."));

    render(<StoreWelcomeConfigSection />);

    await vi.waitFor(() => expect(showToast).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "Lưu trang Welcome" })).toBeDisabled();
  });

  it("allows creating a welcome configuration when none exists", async () => {
    vi.mocked(loadStoreWelcomeConfig).mockResolvedValue(null);

    render(<StoreWelcomeConfigSection />);

    await vi.waitFor(() =>
      expect(screen.getByRole("button", { name: "Lưu trang Welcome" })).toBeEnabled(),
    );
  });
});
