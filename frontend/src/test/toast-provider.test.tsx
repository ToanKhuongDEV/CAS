import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

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
