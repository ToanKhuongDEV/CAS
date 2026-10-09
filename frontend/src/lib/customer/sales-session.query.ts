"use client";

import { useQuery } from "@tanstack/react-query";

import { getCurrentCustomerSalesSession } from "./sales-session";

export const currentCustomerSalesSessionQueryKey = [
  "customer",
  "sales-session",
  "current",
] as const;

export function useCurrentCustomerSalesSessionQuery() {
  return useQuery({
    queryKey: currentCustomerSalesSessionQueryKey,
    queryFn: getCurrentCustomerSalesSession,
  });
}
