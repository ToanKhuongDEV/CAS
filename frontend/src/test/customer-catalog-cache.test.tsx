import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import { useCustomerCatalog } from "../lib/api/catalog/customer-catalog.query";
import { loadCustomerCatalog } from "../lib/api/catalog/published-catalog.api";

vi.mock("../lib/api/catalog/published-catalog.api", () => ({
  loadCustomerCatalog: vi.fn(),
}));

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  vi.clearAllMocks();
});

it("does not reuse a catalog from another store or customer session", async () => {
  vi.mocked(loadCustomerCatalog).mockImplementation(async (storeId) => ({
    categories: [],
    items: [],
    optionGroups: [],
    tags: [],
    storeId,
  }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { rerender } = renderHook(() => useCustomerCatalog(), { wrapper });
  await waitFor(() => expect(loadCustomerCatalog).toHaveBeenCalledWith(1));

  window.localStorage.setItem("cas.selectedStoreId", "2");
  rerender();
  await waitFor(() => expect(loadCustomerCatalog).toHaveBeenCalledWith(2));
  window.sessionStorage.setItem("cas.catalogSession", "new-session");
  rerender();
  await waitFor(() => expect(loadCustomerCatalog).toHaveBeenCalledTimes(3));
  client.clear();
});
