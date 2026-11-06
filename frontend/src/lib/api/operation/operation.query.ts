"use client";

import { useQuery } from "@tanstack/react-query";

import { loadAdminDashboard } from "./admin-dashboard.api";
import { loadCustomer, loadCustomers } from "./admin-lookup.api";
import { loadAdminOperationalIncidents } from "./operational-incidents.api";
import { loadAdmins, loadOperators } from "./operational-management.api";
import { loadOperatorDashboardSummary } from "./operator-dashboard.api";

export const operatorDashboardSummaryQueryKey = ["operator", "dashboard", "summary"] as const;
export const adminOperationalIncidentsQueryKey = ["admin", "operational-incidents"] as const;
export const adminDashboardQueryKey = (from: string, to: string) =>
  ["admin", "dashboard", from, to] as const;
export const adminOperatorsQueryKey = ["admin", "operators"] as const;
export const adminAccountsQueryKey = ["admin", "admins"] as const;
export const adminCustomersQueryKey = (page: number, query: string, size: number) =>
  ["admin", "customers", page, query, size] as const;
export const adminCustomerQueryKey = (id: number) => ["admin", "customers", id] as const;

export function useOperatorDashboardSummaryQuery() {
  return useQuery({
    queryKey: operatorDashboardSummaryQueryKey,
    queryFn: loadOperatorDashboardSummary,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  });
}

export function useAdminOperationalIncidentsQuery() {
  return useQuery({
    queryKey: adminOperationalIncidentsQueryKey,
    queryFn: loadAdminOperationalIncidents,
  });
}

export function useAdminDashboardQuery(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: adminDashboardQueryKey(from, to),
    queryFn: ({ signal }) => loadAdminDashboard(from, to, signal),
    enabled,
  });
}

export function useAdminOperatorsQuery() {
  return useQuery({
    queryKey: adminOperatorsQueryKey,
    queryFn: loadOperators,
  });
}

export function useAdminAccountsQuery(enabled: boolean) {
  return useQuery({ queryKey: adminAccountsQueryKey, queryFn: loadAdmins, enabled });
}

export function useAdminCustomersQuery(page: number, query: string, size: number) {
  return useQuery({
    queryKey: adminCustomersQueryKey(page, query, size),
    queryFn: () => loadCustomers({ page, query, size }),
  });
}

export function useAdminCustomerQuery(id: number | null) {
  return useQuery({
    queryKey: adminCustomerQueryKey(id ?? 0),
    queryFn: () => loadCustomer(id!),
    enabled: id !== null,
  });
}
