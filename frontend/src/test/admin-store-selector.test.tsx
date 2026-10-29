import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminStoreSelector } from "../components/admin/admin-store-selector";
import { selectedAdminStoreStorageKey } from "../lib/auth/operational-auth";
import { getCurrentOperationalAccount } from "../lib/auth/operational-auth";
import { loadAdminStores } from "../lib/api/store/store-settings.api";

const auth = vi.hoisted(() => ({ listener: null as null | ((user: unknown) => void) }));
vi.mock("firebase/auth", () => ({
  onIdTokenChanged: (_auth: unknown, callback: (user: unknown) => void) => {
    auth.listener = callback;
    return vi.fn();
  },
}));
vi.mock("../lib/auth/firebase", () => ({ getFirebaseAuth: () => ({}) }));
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
    cleanup();
    window.fetch = originalFetch;
    window.sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("shows the store selector after a super admin signs in, including for one store", async () => {
    vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
      accountId: 1,
      displayName: "Super Admin",
      role: "SUPER_ADMIN",
      storeId: 2,
    });
    vi.mocked(loadAdminStores).mockResolvedValue([
      { id: 2, branchName: "Cơ sở 2", status: "ACTIVE" },
    ]);
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AdminStoreSelector />
      </QueryClientProvider>,
    );

    act(() => auth.listener?.(null));
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    act(() => auth.listener?.({}));

    expect(await screen.findByRole("combobox", { name: "Cơ sở" })).toHaveValue("2");
    expect(screen.getByRole("option", { name: "Cơ sở 2" })).toBeInTheDocument();
  });

  it("reports a store list loading error", async () => {
    vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
      accountId: 1,
      displayName: "Super Admin",
      role: "SUPER_ADMIN",
      storeId: 1,
    });
    vi.mocked(loadAdminStores).mockRejectedValueOnce(new Error("Failed"));
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AdminStoreSelector />
      </QueryClientProvider>,
    );
    act(() => auth.listener?.({}));
    expect(await screen.findByRole("alert")).toHaveTextContent("Không thể tải danh sách cơ sở.");
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
