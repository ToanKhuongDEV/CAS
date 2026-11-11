"use client";

import { useQuery } from "@tanstack/react-query";

import { loadCustomerCatalog, loadCustomerCatalogItem } from "./published-catalog.api";
import { getRememberedPublicStoreId } from "../store/public-store.api";

export const customerCatalogQueryKey = ["customer", "catalog"] as const;
export const customerCatalogItemQueryKey = (id: number) =>
  ["customer", "catalog", "items", id] as const;

export function useCustomerCatalog() {
  const storeId = getRememberedPublicStoreId() ?? 1;
  const session =
    typeof window === "undefined" ? null : window.sessionStorage.getItem("cas.catalogSession");
  return useQuery({
    queryKey: [...customerCatalogQueryKey, storeId, session],
    queryFn: () => loadCustomerCatalog(storeId),
    staleTime: 0,
  });
}

export function useCustomerCatalogItem(id: number | null) {
  const storeId = getRememberedPublicStoreId() ?? 1;
  const session =
    typeof window === "undefined" ? null : window.sessionStorage.getItem("cas.catalogSession");
  return useQuery({
    queryKey: [...customerCatalogItemQueryKey(id ?? 0), storeId, session],
    queryFn: () => loadCustomerCatalogItem(id!, storeId),
    enabled: id !== null,
    staleTime: 5 * 60 * 1000,
  });
}
