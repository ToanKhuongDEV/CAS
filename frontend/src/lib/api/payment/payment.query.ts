"use client";

import { useQuery } from "@tanstack/react-query";

import {
  loadCustomerPayment,
  loadEligibleUnpaidSessions,
  loadOperatorPaidTodayPayments,
  loadOperatorPayments,
  loadOperatorUnpaidRecords,
} from "./payment.api";

export const customerPaymentQueryKey = ["customer", "payment"] as const;
export const operatorPaymentsQueryKey = ["operator", "payments"] as const;
export const operatorPaidTodayPaymentsQueryKey = ["operator", "payments", "paid-today"] as const;
export const operatorUnpaidRecordsQueryKey = (status?: "OPEN" | "RESOLVED") =>
  ["operator", "unpaid-records", status ?? "all"] as const;
export const eligibleUnpaidSessionsQueryKey = (minimumOpenMinutes: number) =>
  ["operator", "unpaid-records", "eligible-sessions", minimumOpenMinutes] as const;

export function useCustomerPaymentQuery(pollIntervalMs?: number) {
  return useQuery({
    queryKey: customerPaymentQueryKey,
    queryFn: loadCustomerPayment,
    refetchInterval: pollIntervalMs,
    refetchIntervalInBackground: false,
  });
}

export function useOperatorPaymentsQuery(pollIntervalMs?: number) {
  return useQuery({
    queryKey: operatorPaymentsQueryKey,
    queryFn: loadOperatorPayments,
    refetchInterval: pollIntervalMs,
  });
}

export function useOperatorPaidTodayPaymentsQuery() {
  return useQuery({
    queryKey: operatorPaidTodayPaymentsQueryKey,
    queryFn: loadOperatorPaidTodayPayments,
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
