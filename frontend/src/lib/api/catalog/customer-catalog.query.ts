"use client";

import { useQuery } from "@tanstack/react-query";

import { loadCustomerCatalog, loadCustomerCatalogItem } from "./published-catalog.api";

export const customerCatalogQueryKey = ["customer", "catalog"] as const;
export const customerCatalogItemQueryKey = (id: number) =>
  ["customer", "catalog", "items", id] as const;

export function useCustomerCatalog() {
  return useQuery({
    queryKey: customerCatalogQueryKey,
    queryFn: loadCustomerCatalog,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCustomerCatalogItem(id: number | null) {
  return useQuery({
    queryKey: customerCatalogItemQueryKey(id ?? 0),
    queryFn: () => loadCustomerCatalogItem(id!),
    enabled: id !== null,
    staleTime: 5 * 60 * 1000,
  });
}
