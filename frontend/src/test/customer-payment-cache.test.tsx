import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import { useCustomerPaymentQuery } from "../lib/api/payment/payment.query";
import { loadCustomerPayment } from "../lib/api/payment/payment.api";

vi.mock("../lib/api/payment/payment.api", () => ({ loadCustomerPayment: vi.fn() }));

afterEach(() => {
  window.sessionStorage.clear();
  vi.clearAllMocks();
});

it("does not reuse a completed payment when the customer session changes", async () => {
  vi.mocked(loadCustomerPayment)
    .mockResolvedValueOnce({
      amount: 100,
      billSnapshot: "{}",
      confirmedAt: null,
      createdAt: "2026-11-19T00:00:00",
      publicId: "old-payment",
      status: "PAID",
      tableCode: 1,
    })
    .mockResolvedValueOnce(null);
  window.sessionStorage.setItem("cas.catalogSession", "old-session");
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result, rerender } = renderHook(() => useCustomerPaymentQuery(), { wrapper });
  await waitFor(() => expect(result.current.data?.status).toBe("PAID"));

  window.sessionStorage.setItem("cas.catalogSession", "new-session");
  rerender();
  expect(result.current.data).toBeUndefined();
  await waitFor(() => expect(result.current.data).toBeNull());
  client.clear();
});
