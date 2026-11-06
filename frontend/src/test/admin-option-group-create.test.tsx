import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import AdminOptionsPage from "../app/admin/catalog/options/page";
import {
  createCatalogOptionGroup,
  createCatalogOptionValue,
  loadAdminCatalog,
} from "../lib/api/catalog/catalog.api";

const showToast = vi.fn();
vi.mock("../components/ui/toast-provider", () => ({ useToast: () => ({ showToast }) }));

vi.mock("../lib/api/catalog/catalog.api", () => ({
  loadAdminCatalog: vi.fn(),
  createCatalogOptionGroup: vi.fn(),
  createCatalogOptionValue: vi.fn(),
}));

it("shows limits only for multiple selection and uses valid single-selection limits", async () => {
  vi.mocked(loadAdminCatalog).mockResolvedValue({
    items: [],
    categories: [],
    optionGroups: [],
    tags: [],
  });
  vi.mocked(createCatalogOptionGroup).mockResolvedValue(undefined);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AdminOptionsPage />
    </QueryClientProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Tạo nhóm option" }));
  expect(screen.queryByLabelText("Chọn tối thiểu")).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Kiểu chọn"), { target: { value: "MULTIPLE" } });
  fireEvent.change(screen.getByLabelText("Chọn tối thiểu"), { target: { value: "2" } });
  fireEvent.change(screen.getByLabelText("Chọn tối đa"), { target: { value: "3" } });
  fireEvent.change(screen.getByLabelText("Kiểu chọn"), { target: { value: "SINGLE" } });
  expect(screen.queryByLabelText("Chọn tối đa")).not.toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText("VD: Mức giá / Độ ngọt / Topping..."), {
    target: { value: "Size" },
  });
  fireEvent.click(screen.getAllByRole("button", { name: "Tạo nhóm option" })[1]);
  await waitFor(() =>
    expect(createCatalogOptionGroup).toHaveBeenCalledWith(
      expect.objectContaining({ selectionType: "SINGLE", minSelect: 0, maxSelect: 1 }),
    ),
  );
});

it("shows the duplicate option message and keeps the entered name", async () => {
  vi.mocked(loadAdminCatalog).mockResolvedValue({
    items: [],
    categories: [],
    tags: [],
    optionGroups: [
      {
        id: 5,
        name: "Topping",
        selectionType: "MULTIPLE",
        minSelect: 0,
        maxSelect: null,
        displayOrder: 0,
        status: "ACTIVE",
        values: [],
      },
    ],
  });
  vi.mocked(createCatalogOptionValue).mockRejectedValue(
    new Error('Tên option "Trân châu" đã tồn tại trong nhóm này.'),
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AdminOptionsPage />
    </QueryClientProvider>,
  );
  const input = await screen.findByPlaceholderText(
    "Nhập giá trị option mới (VD: Siêu cay, Size L...)",
  );
  fireEvent.change(input, { target: { value: "Trân châu" } });
  fireEvent.click(screen.getByRole("button", { name: "Thêm" }));
  await waitFor(() =>
    expect(showToast).toHaveBeenCalledWith({
      type: "error",
      message: 'Tên option "Trân châu" đã tồn tại trong nhóm này.',
    }),
  );
  expect(
    screen.queryByText('Tên option "Trân châu" đã tồn tại trong nhóm này.'),
  ).not.toBeInTheDocument();
  expect(input).toHaveValue("Trân châu");
});
