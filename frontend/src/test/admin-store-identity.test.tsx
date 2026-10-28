import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminStoreIdentity } from "../components/admin/admin-store-identity";
import { getCurrentOperationalAccount } from "../lib/auth/operational-auth";

vi.mock("../lib/auth/firebase", () => ({ getFirebaseAuth: () => ({ currentUser: {} }) }));
vi.mock("../lib/auth/operational-auth", () => ({ getCurrentOperationalAccount: vi.fn() }));
vi.mock("../components/ui/store-identity", () => ({
  StoreIdentity: ({ subtitle }: { subtitle: string }) => <span>{subtitle}</span>,
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
    expect(await screen.findByText(label)).toBeInTheDocument();
  });
});
