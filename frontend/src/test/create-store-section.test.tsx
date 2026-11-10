import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CreateStoreSection } from "../components/admin/create-store-section";
import { copyStoreMenu, createStore, loadAdminStores } from "../lib/api/store/store-settings.api";
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
  copyStoreMenu: vi.fn(),
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

it("copies the selected source menu to the selected destination", async () => {
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
  vi.mocked(copyStoreMenu).mockResolvedValue(undefined);
  render(<CreateStoreSection />);
  await screen.findAllByRole("option", { name: "Nguồn" });
  fireEvent.change(screen.getByLabelText("Chi nhánh nguồn"), { target: { value: "1" } });
  fireEvent.change(screen.getByLabelText("Chi nhánh đích"), { target: { value: "2" } });
  fireEvent.click(screen.getByRole("button", { name: "Sao chép thực đơn" }));
  await waitFor(() => expect(copyStoreMenu).toHaveBeenCalledWith(1, 2));
});
