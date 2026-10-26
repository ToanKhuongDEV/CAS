import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminStoreSelector } from "../components/admin/admin-store-selector";
import { selectedAdminStoreStorageKey } from "../lib/auth/operational-auth";
import { getCurrentOperationalAccount } from "../lib/auth/operational-auth";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("../lib/auth/firebase", () => ({ getFirebaseAuth: () => ({ currentUser: {} }) }));
vi.mock("../lib/auth/operational-auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../lib/auth/operational-auth")>()),
  getCurrentOperationalAccount: vi.fn(),
}));
vi.mock("../lib/api/store/store-settings.api", () => ({
  loadAdminStores: vi.fn().mockResolvedValue([{ id: 2, branchName: "Cơ sở 2" }]),
}));

describe("AdminStoreSelector", () => {
  const originalFetch = window.fetch;

  afterEach(() => {
    window.fetch = originalFetch;
    window.sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("adds the remembered store to the first admin request", async () => {
    window.sessionStorage.setItem(selectedAdminStoreStorageKey, "2");
    vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
      accountId: 1,
      displayName: "Super Admin",
      role: "SUPER_ADMIN",
      storeId: 1,
    });
    const fetch = vi.fn().mockResolvedValue(new Response());
    window.fetch = fetch;

    render(
      <QueryClientProvider client={new QueryClient()}>
        <AdminStoreSelector />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(window.fetch).not.toBe(originalFetch));
    await window.fetch("/api/v1/admin/store/settings");

    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/admin/store/settings",
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
    expect(new Headers(fetch.mock.calls[0][1].headers).get("X-CAS-Store-Id")).toBe("2");
  });
});
