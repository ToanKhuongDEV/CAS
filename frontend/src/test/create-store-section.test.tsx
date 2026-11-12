import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CreateStoreSection } from "../components/admin/create-store-section";
import { createStore, loadAdminStores } from "../lib/api/store/store-settings.api";
import { getCurrentOperationalAccount } from "../lib/auth/operational-auth";

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (_auth: unknown, callback: (user: object) => void) => {
    callback({});
    return () => {};
  },
}));
vi.mock("../lib/auth/firebase", () => ({ getFirebaseAuth: () => ({}) }));
vi.mock("../lib/auth/operational-auth", () => ({ getCurrentOperationalAccount: vi.fn() }));
vi.mock("../lib/api/store/store-settings.api", () => ({
  createStore: vi.fn(),
  loadAdminStores: vi.fn().mockResolvedValue([]),
}));
vi.mock("../components/ui/toast-provider", () => ({ useToast: () => ({ showToast: vi.fn() }) }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("creates a branch and refreshes the store selector for a super admin", async () => {
  vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
    accountId: 1,
    storeId: 1,
    displayName: "Admin",
    role: "SUPER_ADMIN",
  });
  vi.mocked(createStore).mockResolvedValue({ id: 2, status: "ACTIVE" });
  const refreshed = vi.fn();
  window.addEventListener("cas:stores-updated", refreshed);
  render(<CreateStoreSection />);
  fireEvent.change(await screen.findByLabelText("Tên chi nhánh"), { target: { value: "Branch" } });
  fireEvent.change(screen.getByLabelText("Địa chỉ"), { target: { value: "Address" } });
  fireEvent.change(screen.getByLabelText("Số điện thoại"), { target: { value: "0900" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "store@example.com" } });
  fireEvent.change(screen.getByLabelText("Giờ mở cửa"), { target: { value: "08:00" } });
  fireEvent.change(screen.getByLabelText("Giờ đóng cửa"), { target: { value: "22:00" } });
  fireEvent.click(screen.getByRole("button", { name: "Tạo chi nhánh" }));
  await waitFor(() =>
    expect(createStore).toHaveBeenCalledWith({
      branchName: "Branch",
      address: "Address",
      phone: "0900",
      email: "store@example.com",
      googleMapsLocation: null,
      openTime: "08:00",
      closeTime: "22:00",
      sourceStoreId: null,
    }),
  );
  await waitFor(() => expect(refreshed).toHaveBeenCalledTimes(1));
  window.removeEventListener("cas:stores-updated", refreshed);
});

it("does not offer branch creation to an admin", async () => {
  vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
    accountId: 1,
    storeId: 1,
    displayName: "Admin",
    role: "ADMIN",
  });
  render(<CreateStoreSection />);
  await waitFor(() => expect(getCurrentOperationalAccount).toHaveBeenCalled());
  expect(screen.queryByRole("button", { name: "Tạo chi nhánh" })).not.toBeInTheDocument();
});

it("creates the branch with the selected source menu", async () => {
  vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
    accountId: 1,
    storeId: 1,
    displayName: "Admin",
    role: "SUPER_ADMIN",
  });
  vi.mocked(loadAdminStores).mockResolvedValue([
    { id: 1, branchName: "Nguồn", status: "ACTIVE" },
    { id: 2, branchName: "Đích", status: "ACTIVE" },
  ]);
  vi.mocked(createStore).mockResolvedValue({ id: 3, status: "ACTIVE" });
  render(<CreateStoreSection />);
  await screen.findByRole("option", { name: "Nguồn" });
  fireEvent.change(screen.getByLabelText("Tên chi nhánh"), { target: { value: "Branch" } });
  fireEvent.change(screen.getByLabelText("Địa chỉ"), { target: { value: "Address" } });
  fireEvent.change(screen.getByLabelText("Số điện thoại"), { target: { value: "0900" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "store@example.com" } });
  fireEvent.change(screen.getByLabelText("Giờ mở cửa"), { target: { value: "08:00" } });
  fireEvent.change(screen.getByLabelText("Giờ đóng cửa"), { target: { value: "22:00" } });
  fireEvent.change(screen.getByLabelText("Sao chép thực đơn từ chi nhánh"), {
    target: { value: "1" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Tạo chi nhánh" }));
  await waitFor(() =>
    expect(createStore).toHaveBeenCalledWith(expect.objectContaining({ sourceStoreId: 1 })),
  );
  expect(screen.queryByLabelText("Chi nhánh đích")).not.toBeInTheDocument();
});

it("retains the form when creation or copying fails", async () => {
  vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
    accountId: 1,
    storeId: 1,
    displayName: "Admin",
    role: "SUPER_ADMIN",
  });
  vi.mocked(loadAdminStores).mockResolvedValue([{ id: 1, branchName: "Nguồn", status: "ACTIVE" }]);
  vi.mocked(createStore).mockRejectedValueOnce(new Error("Không thể sao chép"));
  render(<CreateStoreSection />);
  fireEvent.change(await screen.findByLabelText("Tên chi nhánh"), { target: { value: "Branch" } });
  fireEvent.change(screen.getByLabelText("Địa chỉ"), { target: { value: "Address" } });
  fireEvent.change(screen.getByLabelText("Số điện thoại"), { target: { value: "0900" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "store@example.com" } });
  fireEvent.change(screen.getByLabelText("Giờ mở cửa"), { target: { value: "08:00" } });
  fireEvent.change(screen.getByLabelText("Giờ đóng cửa"), { target: { value: "22:00" } });
  await screen.findByRole("option", { name: "Nguồn" });
  fireEvent.change(screen.getByLabelText("Sao chép thực đơn từ chi nhánh"), {
    target: { value: "1" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Tạo chi nhánh" }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Tạo chi nhánh" })).toBeEnabled());
  expect(screen.getByLabelText("Tên chi nhánh")).toHaveValue("Branch");
  expect(screen.getByLabelText("Sao chép thực đơn từ chi nhánh")).toHaveValue("1");
});
