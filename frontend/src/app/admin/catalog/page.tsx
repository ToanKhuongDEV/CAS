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
  imageSrc?: string;
  createdAt?: string;
};

type ItemDraft = Omit<MenuItem, "id">;
type ModalMode = "create" | "edit" | "deactivate" | null;
type SortOption =
  | "DEFAULT"
  | "ORDER_ASC"
  | "ORDER_DESC"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "CREATED_NEWEST"
  | "CREATED_OLDEST";

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
  imageSrc: "",
  createdAt: new Date().toISOString().split("T")[0],
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
    imageSrc: "/images/welcome/spicy-noodles.jpg",
    createdAt: "2026-08-01",
  },
  {
    id: 2,
    name: "Mỳ Cay Bò Mỹ",
    category: "Mỳ Cay",
    displayOrder: 2,
    price: 65000,
    status: "ACTIVE",
    tags: ["Bán chạy"],
    imageSrc: "/images/welcome/spicy-noodles.jpg",
    createdAt: "2026-08-02",
  },
  {
    id: 3,
    name: "Gà Rán Sốt Cay Hàn Quốc",
    category: "Gà Rán",
    displayOrder: 1,
    price: 39000,
    status: "SOLD_OUT",
    tags: ["Bán chạy"],
    imageSrc: "/images/welcome/fried-chicken.jpg",
    createdAt: "2026-08-03",
  },
  {
    id: 4,
    name: "Gà Popcorn Lắc Phô Mai",
    category: "Gà Rán",
    displayOrder: 2,
    price: 32000,
    status: "ACTIVE",
    tags: [],
    imageSrc: "/images/welcome/fried-chicken.jpg",
    createdAt: "2026-08-04",
  },
  {
    id: 7,
    name: "Hướng Dương Rang Bơ",
    category: "Đồ Ăn Vặt",
    displayOrder: 1,
    price: 18000,
    status: "ACTIVE",
    tags: ["Ăn vặt"],
    imageSrc: "/images/welcome/street-snacks.jpg",
    createdAt: "2026-08-05",
  },
  {
    id: 5,
    name: "Trà Mãng Cầu Đầm Sen",
    category: "Đồ Uống",
    displayOrder: 1,
    price: 35000,
    status: "SOLD_OUT",
    tags: ["Giải nhiệt"],
    imageSrc: "/images/welcome/matcha-drink.jpg",
    createdAt: "2026-08-06",
  },
  {
    id: 6,
    name: "Trà Chanh Giã Tay",
    category: "Đồ Uống",
    displayOrder: 2,
    price: 28000,
    status: "ACTIVE",
    tags: [],
    imageSrc: "/images/welcome/matcha-drink.jpg",
    createdAt: "2026-08-07",
  },
];

export default function AdminCatalogPage() {
  const [items, setItems] = useState<MenuItem[]>(mockItems);
  const [filterCat, setFilterCat] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("DEFAULT");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [draft, setDraft] = useState<ItemDraft>(emptyDraft);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [isOptionGroupDropdownOpen, setIsOptionGroupDropdownOpen] = useState(false);
  const [imageFileName, setImageFileName] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<"ACTIVE" | "SOLD_OUT" | "INACTIVE" | "">(
    "",
  );
  const [bulkMessage, setBulkMessage] = useState<{
    text: string;
    type: "success" | "warning";
  } | null>(null);
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

  const handleSelectItem = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((itemId) => itemId !== id)));
  };

  const applyBulkStatusUpdate = () => {
    if (!bulkTargetStatus) {
      setBulkMessage({ text: "Vui lòng chọn trạng thái cần đổi", type: "warning" });
      setTimeout(() => setBulkMessage(null), 3000);
      return;
    }
    if (selectedIds.length === 0) {
      setBulkMessage({ text: "Vui lòng tích chọn các món cần đổi trạng thái", type: "warning" });
      setTimeout(() => setBulkMessage(null), 3000);
      return;
    }
    setItems((current) =>
      current.map((item) =>
        selectedIds.includes(item.id) ? { ...item, status: bulkTargetStatus } : item,
      ),
    );
    const statusLabels: Record<string, string> = {
      ACTIVE: "Đang bán",
      SOLD_OUT: "Hết hàng",
      INACTIVE: "Ngừng bán",
    };
    setBulkMessage({
      text: `Đã cập nhật trạng thái "${statusLabels[bulkTargetStatus]}" cho ${selectedIds.length} món`,
      type: "success",
    });
    setSelectedIds([]);
    setBulkTargetStatus("");
    setTimeout(() => setBulkMessage(null), 4000);
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedItem(null);
    setDraft(emptyDraft);
    setIsTagDropdownOpen(false);
    setIsOptionGroupDropdownOpen(false);
    setImageFileName("");
    setImagePreview("");
  };

  const openEditModal = (item: MenuItem) => {
    setSelectedItem(item);
    setDraft({
      ...item,
      description: item.description ?? "",
      optionGroups: item.optionGroups ?? [],
      imageSrc: item.imageSrc ?? "",
    });
    setImagePreview(item.imageSrc ?? "");
    setImageFileName(item.imageSrc ? "Ảnh hiện tại" : "");
    setModalMode("edit");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFileName(file.name);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setDraft((current) => ({ ...current, imageSrc: previewUrl }));
    }
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
    .sort((first, second) => {
      if (sortBy === "ORDER_ASC") return first.displayOrder - second.displayOrder;
      if (sortBy === "ORDER_DESC") return second.displayOrder - first.displayOrder;
      if (sortBy === "PRICE_ASC") return first.price - second.price;
      if (sortBy === "PRICE_DESC") return second.price - first.price;
      if (sortBy === "CREATED_NEWEST")
        return (second.createdAt ?? "").localeCompare(first.createdAt ?? "");
      if (sortBy === "CREATED_OLDEST")
        return (first.createdAt ?? "").localeCompare(second.createdAt ?? "");
      return (
        first.category.localeCompare(second.category) || first.displayOrder - second.displayOrder
      );
    });

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
            <option value="ALL">Tất cả danh mục</option>
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
          <label className="sr-only" htmlFor="catalog-sort-filter">
            Sắp xếp danh sách
          </label>
          <select
            className="rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-xs font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
            id="catalog-sort-filter"
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            value={sortBy}
          >
            <option value="DEFAULT">Sắp xếp: Mặc định</option>
            <option value="ORDER_ASC">Thứ tự hiển thị (Thấp → Cao)</option>
            <option value="ORDER_DESC">Thứ tự hiển thị (Cao → Thấp)</option>
            <option value="PRICE_ASC">Giá tăng dần</option>
            <option value="PRICE_DESC">Giá giảm dần</option>
            <option value="CREATED_NEWEST">Ngày tạo (Mới nhất)</option>
            <option value="CREATED_OLDEST">Ngày tạo (Cũ nhất)</option>
          </select>
          <CasButton
            onClick={() => {
              setFilterCat("ALL");
              setFilterStatus("ALL");
              setSearch("");
              setSortBy("DEFAULT");
            }}
            size="sm"
            variant="outline"
          >
            Xóa lọc
          </CasButton>

          {/* Always Visible Bulk Update Control */}
          <div className="ml-auto flex flex-wrap items-center gap-2 border-t border-cas-outline-variant/20 pt-2 sm:ml-0 sm:border-t-0 sm:border-l sm:border-cas-outline-variant/30 sm:pt-0 sm:pl-3">
            <label className="sr-only" htmlFor="bulk-status-select">
              Cập nhật trạng thái hàng loạt
            </label>
            <select
              className="rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-xs font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
              id="bulk-status-select"
              onChange={(e) =>
                setBulkTargetStatus(e.target.value as "ACTIVE" | "SOLD_OUT" | "INACTIVE" | "")
              }
              value={bulkTargetStatus}
            >
              <option value="">-- Đổi trạng thái hàng loạt --</option>
              <option value="ACTIVE">Chuyển &quot;Đang bán&quot;</option>
              <option value="SOLD_OUT">Chuyển &quot;Hết hàng&quot;</option>
              <option value="INACTIVE">Chuyển &quot;Ngừng bán&quot;</option>
            </select>
            <CasButton onClick={applyBulkStatusUpdate} size="sm" variant="outline-primary">
              Áp dụng {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
            </CasButton>
            {selectedIds.length > 0 ? (
              <button
                className="cursor-pointer text-xs font-semibold text-cas-on-surface-variant underline hover:text-cas-on-surface"
                onClick={() => setSelectedIds([])}
                type="button"
              >
                Bỏ chọn
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {bulkMessage ? (
        <div
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold shadow-xs ${
            bulkMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
          }`}
        >
          <CasIcon
            className="size-4 shrink-0"
            name={bulkMessage.type === "success" ? "check" : "info"}
          />
          <span>{bulkMessage.text}</span>
        </div>
      ) : null}

      {/* Table Danh sách Món */}
      <div className="overflow-x-auto rounded-3xl border border-cas-outline-variant/30 bg-cas-glass shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-cas-outline-variant/25 bg-cas-surface-container/60 font-extrabold uppercase text-cas-on-surface-variant">
            <tr>
              <th className="w-12 px-4 py-4 text-center" />
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
              <tr
                key={item.id}
                className={`transition hover:bg-cas-surface-container/30 ${
                  selectedIds.includes(item.id) ? "bg-cas-primary/5" : ""
                }`}
              >
                <td className="px-4 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                    className="size-4 cursor-pointer rounded border-cas-outline-variant/50 text-cas-primary focus:ring-cas-primary"
                    aria-label={`Chọn món ${item.name}`}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {item.imageSrc ? (
                      <img
                        src={item.imageSrc}
                        alt={item.name}
                        className="size-10 rounded-xl object-cover border border-cas-outline-variant/30 shrink-0"
                      />
                    ) : (
                      <div className="size-10 rounded-xl bg-cas-surface-container flex items-center justify-center border border-cas-outline-variant/30 shrink-0">
                        <CasIcon name="sparkle" className="size-4 text-cas-on-surface-variant/50" />
                      </div>
                    )}
                    <span className="text-sm font-black text-cas-on-surface">{item.name}</span>
                  </div>
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
              <div className="space-y-2">
                <label className="block text-xs font-bold text-cas-on-surface-variant">
                  Ảnh món
                  <input
                    accept="image/*"
                    className="mt-1 block w-full cursor-pointer rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-sm text-cas-on-surface file:mr-3 file:rounded-lg file:border-0 file:bg-cas-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-cas-primary"
                    onChange={handleFileChange}
                    type="file"
                  />
                </label>
                {imagePreview ? (
                  <div className="relative mt-2 flex items-center gap-3 rounded-2xl border border-cas-outline-variant/30 bg-cas-surface-container/60 p-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Xem trước ảnh món"
                      className="size-16 shrink-0 rounded-xl border border-cas-outline-variant/30 object-cover shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-cas-on-surface">
                        {imageFileName || "Ảnh món khả dụng"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setImageFileName("");
                        setDraft((current) => ({ ...current, imageSrc: "" }));
                      }}
                      className="rounded-lg p-1.5 text-cas-on-surface-variant transition hover:bg-rose-500/10 hover:text-rose-600"
                      title="Xóa ảnh xem trước"
                    >
                      <CasIcon name="trash" className="size-4" />
                    </button>
                  </div>
                ) : null}
              </div>
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
