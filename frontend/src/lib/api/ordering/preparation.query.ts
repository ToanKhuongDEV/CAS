"use client";

import { useQuery } from "@tanstack/react-query";

import { loadLongWaitTables, loadPreparationGroups } from "./preparation.api";

export const operatorLongWaitTablesQueryKey = [
  "operator",
  "preparation",
  "long-wait-tables",
] as const;
export const operatorPreparationGroupsQueryKey = ["operator", "preparation", "groups"] as const;

export function useOperatorLongWaitTablesQuery() {
  return useQuery({
    queryKey: operatorLongWaitTablesQueryKey,
    queryFn: loadLongWaitTables,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useOperatorPreparationGroupsQuery(pollIntervalMs?: number) {
  return useQuery({
    queryKey: operatorPreparationGroupsQueryKey,
    queryFn: loadPreparationGroups,
    refetchInterval: pollIntervalMs,
    refetchIntervalInBackground: false,
  });
}
