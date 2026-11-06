import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminStoreIdentity } from "../components/admin/admin-store-identity";
import {
  getCurrentOperationalAccount,
  getSelectedAdminStoreId,
} from "../lib/auth/operational-auth";

const auth = vi.hoisted(() => ({ listener: null as null | ((user: unknown) => void) }));
vi.mock("firebase/auth", () => ({
  onIdTokenChanged: (_auth: unknown, callback: (user: unknown) => void) => {
    auth.listener = callback;
    return vi.fn();
  },
}));
vi.mock("../lib/auth/firebase", () => ({ getFirebaseAuth: () => ({}) }));
vi.mock("../lib/auth/operational-auth", () => ({
  getCurrentOperationalAccount: vi.fn(),
  getSelectedAdminStoreId: vi.fn(() => null),
}));
vi.mock("../components/ui/store-identity", () => ({
  StoreIdentity: ({ subtitle, storeId }: { subtitle: string; storeId?: number }) => (
    <span>
      {subtitle}
      {storeId ? ` - ${storeId}` : ""}
    </span>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdminStoreIdentity", () => {
  it.each([
    ["SUPER_ADMIN", "Super Admin"],
    ["ADMIN", "Admin"],
  ] as const)("shows the label for %s", async (role, label) => {
    vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
      accountId: 1,
      storeId: 1,
      displayName: "User",
      role,
    });
    render(<AdminStoreIdentity />);
    act(() => auth.listener?.({}));
    expect(await screen.findByText(`${label} - 1`)).toBeInTheDocument();
  });

  it("updates the label when a super admin signs in after the header mounts", async () => {
    vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
      accountId: 1,
      storeId: 1,
      displayName: "User",
      role: "SUPER_ADMIN",
    });
    render(<AdminStoreIdentity />);

    act(() => auth.listener?.(null));
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    act(() => auth.listener?.({}));
    expect(await screen.findByText("Super Admin - 1")).toBeInTheDocument();
  });

  it("uses the selected store for a super admin", async () => {
    vi.mocked(getSelectedAdminStoreId).mockReturnValue(2);
    vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
      accountId: 1,
      storeId: 1,
      displayName: "User",
      role: "SUPER_ADMIN",
    });
    render(<AdminStoreIdentity />);
    act(() => auth.listener?.({}));
    expect(await screen.findByText("Super Admin - 2")).toBeInTheDocument();
  });
});
