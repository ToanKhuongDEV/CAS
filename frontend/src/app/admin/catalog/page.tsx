"use client";

import { useEffect, useRef, useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";
import { CasIcon } from "../../../components/ui/cas-icon";

type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  status: "ACTIVE" | "SOLD_OUT" | "INACTIVE";
  tags: string[];
  description?: string;
  displayOrder: number;
  optionGroups?: string[];
};

type ItemDraft = Omit<MenuItem, "id">;
type ModalMode = "create" | "edit" | "deactivate" | null;

const categories = ["Mỳ Cay", "Gà Rán", "Đồ Ăn Vặt", "Đồ Uống"];
const optionGroups = ["Cấp độ cay", "Kích thước", "Độ ngọt", "Topping"];
const tags = ["Bán chạy", "Cay", "Đặc sản", "Giải nhiệt", "Ăn vặt", "Món mới"];
const emptyDraft: ItemDraft = {
  category: categories[0],
  description: "",
  displayOrder: 0,
  name: "",
  optionGroups: [],
  price: 0,
  status: "ACTIVE",
  tags: [],
};

const mockItems: MenuItem[] = [
  {
    id: 1,
    name: "Mỳ Cay Hải Sản Cấp 1–7",
    category: "Mỳ Cay",
    displayOrder: 1,
    price: 69000,
    status: "ACTIVE",
    tags: ["Bán chạy", "Cay"],
  },
  {
    id: 2,
    name: "Mỳ Cay Bò Mỹ",
    category: "Mỳ Cay",
    displayOrder: 2,
    price: 65000,
    status: "ACTIVE",
    tags: ["Bán chạy"],
  },
  {
    id: 3,
    name: "Gà Rán Sốt Cay Hàn Quốc",
    category: "Gà Rán",
    displayOrder: 1,
    price: 39000,
    status: "SOLD_OUT",
    tags: ["Bán chạy"],
  },
  {
    id: 4,
    name: "Gà Popcorn Lắc Phô Mai",
    category: "Gà Rán",
    displayOrder: 2,
    price: 32000,
    status: "ACTIVE",
    tags: [],
  },
  {
    id: 7,
    name: "Hướng Dương Rang Bơ",
    category: "Đồ Ăn Vặt",
    displayOrder: 1,
    price: 18000,
    status: "ACTIVE",
    tags: ["Ăn vặt"],
  },
  {
    id: 5,
    name: "Trà Mãng Cầu Đầm Sen",
    category: "Đồ Uống",
    displayOrder: 1,
    price: 35000,
    status: "SOLD_OUT",
    tags: ["Giải nhiệt"],
  },
  {
    id: 6,
    name: "Trà Chanh Giã Tay",
    category: "Đồ Uống",
    displayOrder: 2,
    price: 28000,
    status: "ACTIVE",
    tags: [],
  },
];

export default function AdminCatalogPage() {
  const [items, setItems] = useState<MenuItem[]>(mockItems);
  const [filterCat, setFilterCat] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [draft, setDraft] = useState<ItemDraft>(emptyDraft);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [isOptionGroupDropdownOpen, setIsOptionGroupDropdownOpen] = useState(false);
  const [imageFileName, setImageFileName] = useState("");
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const optionGroupDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!tagDropdownRef.current?.contains(event.target as Node)) setIsTagDropdownOpen(false);
      if (!optionGroupDropdownRef.current?.contains(event.target as Node))
        setIsOptionGroupDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeModal = () => {
    setModalMode(null);
    setSelectedItem(null);
    setDraft(emptyDraft);
    setIsTagDropdownOpen(false);
    setIsOptionGroupDropdownOpen(false);
    setImageFileName("");
  };

  const openEditModal = (item: MenuItem) => {
    setSelectedItem(item);
    setDraft({
      ...item,
      description: item.description ?? "",
      optionGroups: item.optionGroups ?? [],
    });
    setModalMode("edit");
  };

  const saveItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name || draft.price < 0) return;
    if (modalMode === "create") {
      setItems((current) => [...current, { ...draft, name, id: Date.now() }]);
    }
    if (modalMode === "edit" && selectedItem) {
      setItems((current) =>
        current.map((item) => (item.id === selectedItem.id ? { ...item, ...draft, name } : item)),
      );
    }
    closeModal();
  };

  const deactivateItem = () => {
    if (selectedItem) {
      setItems((current) =>
        current.map((item) =>
          item.id === selectedItem.id ? { ...item, status: "INACTIVE" } : item,
        ),
      );
    }
    closeModal();
  };

  const filtered = items
    .filter((item) => {
      const matchCat =
        filterCat === "ALL" ||
        (filterCat === "FOOD" && item.category !== "Đồ Uống") ||
        (filterCat === "DRINK" && item.category === "Đồ Uống");
      const matchStatus = filterStatus === "ALL" || item.status === filterStatus;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    })
    .sort(
      (first, second) =>
        first.category.localeCompare(second.category) || first.displayOrder - second.displayOrder,
    );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-cas-on-surface">Quản lý Thực đơn & Catalog</h1>
          <p className="text-xs text-cas-on-surface-variant">
            Thêm, chỉnh sửa món ăn, cài đặt giá, nhóm option và trạng thái SOLD_OUT.
          </p>
        </div>
        <CasButton icon="plus" onClick={() => setModalMode("create")} variant="primary" size="md">
          Thêm món mới
        </CasButton>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-cas-glass p-4 border border-cas-outline-variant/30">
        <div className="relative flex-1 max-w-md">
          <CasIcon
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cas-on-surface-variant"
            name="search"
          />
          <input
            type="text"
            placeholder="Tìm kiếm tên món..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface pl-9 pr-4 py-2 text-xs font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="catalog-type-filter">
            Loại món
          </label>
          <select
            className="rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-xs font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
            id="catalog-type-filter"
            onChange={(event) => setFilterCat(event.target.value)}
            value={filterCat}
          >
            <option value="ALL">Tất cả</option>
            <option value="FOOD">Đồ ăn</option>
            <option value="DRINK">Đồ uống</option>
          </select>
          <label className="sr-only" htmlFor="catalog-status-filter">
            Trạng thái món
          </label>
          <select
            className="rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-xs font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
            id="catalog-status-filter"
            onChange={(event) => setFilterStatus(event.target.value)}
            value={filterStatus}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang bán</option>
            <option value="INACTIVE">Ngừng bán</option>
            <option value="SOLD_OUT">Hết hàng</option>
          </select>
          <CasButton
            onClick={() => {
              setFilterCat("ALL");
              setFilterStatus("ALL");
              setSearch("");
            }}
            size="sm"
            variant="outline"
          >
            Xóa lọc
          </CasButton>
        </div>
      </div>

      {/* Table Danh sách Món */}
      <div className="overflow-x-auto rounded-3xl border border-cas-outline-variant/30 bg-cas-glass shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-cas-outline-variant/25 bg-cas-surface-container/60 text-cas-on-surface-variant font-extrabold uppercase">
            <tr>
              <th className="px-6 py-4">Tên Món</th>
              <th className="px-6 py-4">Danh mục</th>
              <th className="px-6 py-4 text-center">Thứ tự hiển thị</th>
              <th className="px-6 py-4">Giá Niêm yết</th>
              <th className="px-6 py-4">Nhãn (Tags)</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cas-outline-variant/15 font-bold">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-cas-surface-container/30 transition">
                <td className="px-6 py-4">
                  <span className="text-sm font-black text-cas-on-surface">{item.name}</span>
                </td>
                <td className="px-6 py-4 text-cas-on-surface-variant">{item.category}</td>
                <td className="px-6 py-4 text-center font-black text-cas-on-surface-variant">
                  {item.displayOrder}
                </td>
                <td className="px-6 py-4 font-black text-cas-primary">
                  {item.price.toLocaleString("vi-VN")} đ
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-cas-secondary/15 px-2 py-0.5 text-[0.68rem] font-extrabold text-cas-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[0.68rem] font-black ${
                      item.status === "ACTIVE"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : item.status === "SOLD_OUT"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : "bg-cas-outline-variant/20 text-cas-on-surface-variant"
                    }`}
                  >
                    {item.status === "ACTIVE"
                      ? "ĐANG BÁN"
                      : item.status === "SOLD_OUT"
                        ? "HẾT HÀNG"
                        : "NGỪNG BÁN"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <CasButton
                    onClick={() => openEditModal(item)}
                    variant="outline-primary"
                    size="sm"
                  >
                    Sửa
                  </CasButton>
                  <CasButton
                    disabled={item.status === "INACTIVE"}
                    onClick={() => {
                      setSelectedItem(item);
                      setModalMode("deactivate");
                    }}
                    size="sm"
                    variant="outline"
                  >
                    Ẩn
                  </CasButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalMode ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          {modalMode === "deactivate" && selectedItem ? (
            <section
              aria-labelledby="deactivate-item-title"
              className="w-full max-w-md rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl"
            >
              <h2 className="text-lg font-black" id="deactivate-item-title">
                Ẩn món khỏi thực đơn?
              </h2>
              <p className="mt-3 text-sm text-cas-on-surface-variant">
                Món “{selectedItem.name}” sẽ chuyển sang trạng thái INACTIVE, không còn hiển thị cho
                khách và vẫn được giữ lại cho lịch sử order.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <CasButton onClick={closeModal} size="sm" variant="outline">
                  Hủy
                </CasButton>
                <CasButton onClick={deactivateItem} size="sm" variant="primary">
                  Xác nhận ẩn món
                </CasButton>
              </div>
            </section>
          ) : (
            <form
              aria-labelledby="catalog-item-form-title"
              className="w-full max-w-2xl space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl"
              onSubmit={saveItem}
            >
              <div className="flex items-start justify-between border-b border-cas-outline-variant/20 pb-4">
                <div>
                  <h2 className="text-lg font-black" id="catalog-item-form-title">
                    {modalMode === "create" ? "Thêm món mới" : "Chỉnh sửa món"}
                  </h2>
                  <p className="mt-1 text-xs text-cas-on-surface-variant">
                    Thiết lập thông tin, nhãn và nhóm option áp dụng cho món.
                  </p>
                </div>
                <button
                  className="text-xs font-bold text-cas-on-surface-variant hover:text-cas-primary"
                  onClick={closeModal}
                  type="button"
                >
                  Đóng
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-bold text-cas-on-surface-variant">
                  Tên món
                  <input
                    className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-sm text-cas-on-surface"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    required
                    value={draft.name}
                  />
                </label>
                <label className="text-xs font-bold text-cas-on-surface-variant">
                  Danh mục
                  <select
                    className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-sm text-cas-on-surface"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    value={draft.category}
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold text-cas-on-surface-variant">
                  Giá niêm yết (đ)
                  <input
                    className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-sm text-cas-on-surface"
                    min="0"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        price: Number(event.target.value),
                      }))
                    }
                    required
                    step="1000"
                    type="number"
                    value={draft.price}
                  />
                </label>
                <label className="text-xs font-bold text-cas-on-surface-variant">
                  Trạng thái
                  <select
                    className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-sm text-cas-on-surface"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        status: event.target.value as MenuItem["status"],
                      }))
                    }
                    value={draft.status}
                  >
                    <option value="ACTIVE">Đang bán</option>
                    <option value="SOLD_OUT">Hết hàng</option>
                    <option value="INACTIVE">Ẩn khỏi thực đơn</option>
                  </select>
                </label>
                <label className="text-xs font-bold text-cas-on-surface-variant">
                  Thứ tự hiển thị
                  <input
                    className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-sm text-cas-on-surface"
                    min="0"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        displayOrder: Number(event.target.value),
                      }))
                    }
                    required
                    type="number"
                    value={draft.displayOrder}
                  />
                </label>
              </div>
              <label className="block text-xs font-bold text-cas-on-surface-variant">
                Mô tả
                <textarea
                  className="mt-1 min-h-20 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-sm text-cas-on-surface"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  value={draft.description}
                />
              </label>
              <label className="block text-xs font-bold text-cas-on-surface-variant">
                Ảnh món
                <input
                  accept="image/*"
                  className="mt-1 block w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-sm text-cas-on-surface file:mr-3 file:rounded-lg file:border-0 file:bg-cas-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-cas-primary"
                  onChange={(event) => setImageFileName(event.target.files?.[0]?.name ?? "")}
                  type="file"
                />
              </label>
              {imageFileName ? (
                <p className="text-xs text-cas-on-surface-variant">Đã chọn: {imageFileName}</p>
              ) : null}
              <div
                className="relative text-xs font-bold text-cas-on-surface-variant"
                ref={tagDropdownRef}
              >
                <span>Nhãn món</span>
                <button
                  aria-expanded={isTagDropdownOpen}
                  aria-haspopup="listbox"
                  className="mt-1 flex min-h-10 w-full items-center justify-between rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 text-left text-sm font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                  onClick={() => setIsTagDropdownOpen((current) => !current)}
                  type="button"
                >
                  <span>{draft.tags.length > 0 ? draft.tags.join(", ") : "Chọn nhãn món"}</span>
                  <CasIcon
                    className={`size-4 shrink-0 transition-transform ${isTagDropdownOpen ? "rotate-90" : ""}`}
                    name="arrow"
                  />
                </button>
                {isTagDropdownOpen ? (
                  <div
                    className="absolute z-10 mt-1 w-full rounded-xl border border-cas-outline-variant/30 bg-cas-surface p-2 shadow-xl"
                    role="listbox"
                    aria-multiselectable="true"
                  >
                    {tags.map((tag) => (
                      <label
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm font-bold text-cas-on-surface hover:bg-cas-primary/8"
                        key={tag}
                      >
                        <input
                          checked={draft.tags.includes(tag)}
                          onChange={() =>
                            setDraft((current) => ({
                              ...current,
                              tags: current.tags.includes(tag)
                                ? current.tags.filter((item) => item !== tag)
                                : [...current.tags, tag],
                            }))
                          }
                          type="checkbox"
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
              <div
                className="relative text-xs font-bold text-cas-on-surface-variant"
                ref={optionGroupDropdownRef}
              >
                <span>Nhóm option áp dụng</span>
                <button
                  aria-expanded={isOptionGroupDropdownOpen}
                  aria-haspopup="listbox"
                  className="mt-1 flex min-h-10 w-full items-center justify-between rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 text-left text-sm font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                  onClick={() => setIsOptionGroupDropdownOpen((current) => !current)}
                  type="button"
                >
                  <span>
                    {(draft.optionGroups?.length ?? 0) > 0
                      ? draft.optionGroups?.join(", ")
                      : "Chọn nhóm option"}
                  </span>
                  <CasIcon
                    className={`size-4 shrink-0 transition-transform ${isOptionGroupDropdownOpen ? "rotate-90" : ""}`}
                    name="arrow"
                  />
                </button>
                {isOptionGroupDropdownOpen ? (
                  <div
                    aria-multiselectable="true"
                    className="absolute z-10 mt-1 w-full rounded-xl border border-cas-outline-variant/30 bg-cas-surface p-2 shadow-xl"
                    role="listbox"
                  >
                    {optionGroups.map((group) => (
                      <label
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm font-bold text-cas-on-surface hover:bg-cas-primary/8"
                        key={group}
                      >
                        <input
                          checked={draft.optionGroups?.includes(group) ?? false}
                          onChange={() =>
                            setDraft((current) => {
                              const selectedGroups = current.optionGroups ?? [];
                              return {
                                ...current,
                                optionGroups: selectedGroups.includes(group)
                                  ? selectedGroups.filter((item) => item !== group)
                                  : [...selectedGroups, group],
                              };
                            })
                          }
                          type="checkbox"
                        />
                        {group}
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex justify-end gap-2 border-t border-cas-outline-variant/20 pt-4">
                <CasButton onClick={closeModal} size="sm" type="button" variant="outline">
                  Hủy
                </CasButton>
                <CasButton size="sm" type="submit" variant="primary">
                  {modalMode === "create" ? "Thêm món" : "Lưu thay đổi"}
                </CasButton>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
