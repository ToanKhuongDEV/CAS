import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { ToastProvider, useToast } from "../components/ui/toast-provider";

function ToastTrigger() {
  const { showToast } = useToast();
  return (
    <button
      onClick={() => showToast({ message: "Đã lưu thay đổi.", title: "Hoàn tất", type: "success" })}
      type="button"
    >
      Hiện thông báo
    </button>
  );
}

it("shows and dismisses a shared toast", () => {
  render(
    <ToastProvider>
      <ToastTrigger />
    </ToastProvider>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Hiện thông báo" }));
  const toast = screen.getByRole("status");
  expect(toast).toHaveClass("bg-cas-surface", "text-cas-secondary");
  expect(toast).toHaveTextContent("Hoàn tất");
  expect(toast).toHaveTextContent("Đã lưu thay đổi.");

  fireEvent.click(screen.getByRole("button", { name: "Đóng thông báo" }));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

afterEach(() => vi.unstubAllGlobals());

it("shows the Backend error message for every failed CAS API response", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Khuyến mãi này không còn hiệu lực." }), {
        headers: { "Content-Type": "application/json" },
        status: 409,
      }),
    ),
  );
  render(
    <ToastProvider>
      <span />
    </ToastProvider>,
  );

  await fetch("http://localhost:8080/api/v1/customer/promotions/selection");

  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent("Khuyến mãi này không còn hiệu lực."),
  );
});
