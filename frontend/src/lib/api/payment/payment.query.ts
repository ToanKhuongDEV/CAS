"use client";

import { useQuery } from "@tanstack/react-query";

import {
  loadCustomerPayment,
  loadAdminPaidPayments,
  loadEligibleUnpaidSessions,
  loadOperatorPaidTodayPayments,
  loadOperatorPayments,
  loadOperatorUnpaidRecords,
} from "./payment.api";

export const customerPaymentQueryKey = ["customer", "payment"] as const;
export const customerPaymentSessionQueryKey = () =>
  [
    ...customerPaymentQueryKey,
    typeof window === "undefined" ? null : window.sessionStorage.getItem("cas.catalogSession"),
  ] as const;
export const operatorPaymentsQueryKey = ["operator", "payments"] as const;
export const operatorPaidTodayPaymentsQueryKey = ["operator", "payments", "paid-today"] as const;
export const adminPaidPaymentsQueryKey = ["admin", "payments"] as const;
export const operatorUnpaidRecordsQueryKey = (status?: "OPEN" | "RESOLVED") =>
  ["operator", "unpaid-records", status ?? "all"] as const;
export const eligibleUnpaidSessionsQueryKey = (minimumOpenMinutes: number) =>
  ["operator", "unpaid-records", "eligible-sessions", minimumOpenMinutes] as const;

export function useCustomerPaymentQuery(pollIntervalMs?: number) {
  return useQuery({
    queryKey: customerPaymentSessionQueryKey(),
    queryFn: loadCustomerPayment,
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.status === "PAID" ||
      query.state.error?.message === "Vui lòng quét mã QR của bàn để tiếp tục."
        ? false
        : pollIntervalMs,
    refetchIntervalInBackground: false,
  });
}

export function useOperatorPaymentsQuery(pollIntervalMs?: number, enabled = true) {
  return useQuery({
    queryKey: operatorPaymentsQueryKey,
    queryFn: loadOperatorPayments,
    enabled,
    refetchInterval: pollIntervalMs,
  });
}

export function useOperatorPaidTodayPaymentsQuery(enabled = true) {
  return useQuery({
    queryKey: operatorPaidTodayPaymentsQueryKey,
    queryFn: loadOperatorPaidTodayPayments,
    enabled,
  });
}

export function useAdminPaidPaymentsQuery(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: [...adminPaidPaymentsQueryKey, from, to],
    queryFn: () => loadAdminPaidPayments(from, to),
    enabled: enabled && Boolean(from && to && from <= to),
  });
}

export function useOperatorUnpaidRecordsQuery(status?: "OPEN" | "RESOLVED") {
  return useQuery({
    queryKey: operatorUnpaidRecordsQueryKey(status),
    queryFn: () => loadOperatorUnpaidRecords(status),
  });
}

export function useEligibleUnpaidSessionsQuery(minimumOpenMinutes: number) {
  return useQuery({
    queryKey: eligibleUnpaidSessionsQueryKey(minimumOpenMinutes),
    queryFn: () => loadEligibleUnpaidSessions(minimumOpenMinutes),
  });
}
