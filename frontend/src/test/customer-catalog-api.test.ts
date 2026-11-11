import { afterEach, expect, it, vi } from "vitest";
import {
  loadCustomerCatalog,
  loadCustomerCatalogItem,
} from "../lib/api/catalog/published-catalog.api";
import { resolveCustomerSalesSessionByTable, logoutCustomer } from "../lib/customer/sales-session";

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  vi.unstubAllGlobals();
});

it("changes the catalog cache scope when entering and leaving a customer session", async () => {
  const resolution = {
    customerInformationRequired: false,
    joinSessionRequired: false,
    joinableSessions: [],
    sessionStatus: "OPEN",
    tableCode: 1,
  };
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: resolution }) }),
  );
  await resolveCustomerSalesSessionByTable({ storeId: 2, tableCode: 1 });
  const firstScope = window.sessionStorage.getItem("cas.catalogSession");
  expect(firstScope).toBeTruthy();
  await resolveCustomerSalesSessionByTable({ storeId: 2, tableCode: 1 });
  expect(window.sessionStorage.getItem("cas.catalogSession")).not.toBe(firstScope);
  await logoutCustomer();
  expect(window.sessionStorage.getItem("cas.catalogSession")).toBeNull();
});

it("requests the selected store for every public catalog endpoint", async () => {
  window.localStorage.setItem("cas.selectedStoreId", "2");
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [] }) });
  vi.stubGlobal("fetch", fetchMock);
  await loadCustomerCatalog();
  await loadCustomerCatalogItem(42);
  expect(fetchMock).toHaveBeenCalledTimes(6);
  for (const [url] of fetchMock.mock.calls) expect(url).toMatch(/\?storeId=2$/);
});
