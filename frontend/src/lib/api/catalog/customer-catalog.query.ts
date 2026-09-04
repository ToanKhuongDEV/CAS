"use client";

import { useQuery } from "@tanstack/react-query";

import { loadCustomerCatalog } from "./published-catalog.api";

export const customerCatalogQueryKey = ["customer", "catalog"] as const;

export function useCustomerCatalog() {
  return useQuery({
    queryKey: customerCatalogQueryKey,
    queryFn: loadCustomerCatalog,
    staleTime: 5 * 60 * 1000,
  });
}
