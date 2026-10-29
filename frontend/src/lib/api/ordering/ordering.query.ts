"use client";

import { useQuery } from "@tanstack/react-query";

import {
  loadCustomerBill,
  loadCustomerOrders,
  loadOperatorBill,
  loadOperatorOrderDetail,
  loadOperatorTables,
} from "./ordering.api";

export const customerOrdersQueryKey = ["customer", "orders"] as const;
export const customerBillQueryKey = ["customer", "orders", "bill"] as const;
export const operatorTablesQueryKey = ["operator", "sales-sessions", "tables"] as const;
export const operatorBillQueryKey = (sessionId: string) =>
  ["operator", "sales-sessions", sessionId, "bill"] as const;
export const operatorOrderDetailQueryKey = (orderId: string) =>
  ["operator", "orders", orderId] as const;

export function useCustomerOrdersQuery() {
  return useQuery({ queryKey: customerOrdersQueryKey, queryFn: loadCustomerOrders });
}

export function useCustomerBillQuery(pollIntervalMs?: number) {
  return useQuery({
    queryKey: customerBillQueryKey,
    queryFn: loadCustomerBill,
    retry: false,
    refetchInterval: pollIntervalMs,
    refetchIntervalInBackground: true,
  });
}

export function useOperatorTablesQuery(pollIntervalMs?: number) {
  return useQuery({
    queryKey: operatorTablesQueryKey,
    queryFn: loadOperatorTables,
    refetchInterval: pollIntervalMs,
    refetchIntervalInBackground: false,
  });
}

export function useOperatorBillQuery(sessionId: string | null) {
  return useQuery({
    queryKey: operatorBillQueryKey(sessionId ?? "none"),
    queryFn: () => loadOperatorBill(sessionId!),
    enabled: sessionId !== null,
  });
}

export function useOperatorOrderDetailQuery(orderId: string) {
  return useQuery({
    queryKey: operatorOrderDetailQueryKey(orderId),
    queryFn: () => loadOperatorOrderDetail(orderId),
  });
}
