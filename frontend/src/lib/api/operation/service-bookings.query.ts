"use client";

import { useQuery } from "@tanstack/react-query";

import { loadOperatorServiceBookings } from "./service-bookings.api";

export const operatorServiceBookingsQueryKey = ["operator", "service-bookings"] as const;

export function useOperatorServiceBookingsQuery() {
  return useQuery({
    queryKey: operatorServiceBookingsQueryKey,
    queryFn: loadOperatorServiceBookings,
  });
}
