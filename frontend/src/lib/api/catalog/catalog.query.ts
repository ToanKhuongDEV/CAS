"use client";

import { useQuery } from "@tanstack/react-query";

import { loadAdminCatalog } from "./catalog.api";
import { loadOperatorCatalog } from "./published-catalog.api";

export const adminCatalogQueryKey = ["admin", "catalog"] as const;
export const operatorCatalogQueryKey = ["operator", "catalog"] as const;

export function useAdminCatalogQuery() {
  return useQuery({ queryKey: adminCatalogQueryKey, queryFn: loadAdminCatalog });
}

export function useOperatorCatalogQuery() {
  return useQuery({ queryKey: operatorCatalogQueryKey, queryFn: loadOperatorCatalog });
}
