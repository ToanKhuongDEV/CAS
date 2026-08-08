"use client";

import { useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";
import { CasIcon } from "../../../components/ui/cas-icon";

type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  status: "ACTIVE" | "SOLD_OUT" | "HIDDEN";
  tags: string[];
};

const mockItems: MenuItem[] = [
  { id: 1, name: "Mỳ Cay Hải Sản Cấp 1–7", category: "Mỳ Cay", price: 69000, status: "ACTIVE", tags: ["Bán chạy", "Cay"] },
  { id: 2, name: "Mỳ Cay Bò Mỹ", category: "Mỳ Cay", price: 65000, status: "ACTIVE", tags: ["Bán chạy"] },
  { id: 3, name: "Ốc Hương Trứng Muối", category: "Các Món Ốc", price: 120000, status: "SOLD_OUT", tags: ["Đặc sản"] },
  { id: 4, name: "Ốc Mơ Xào Bơ Tỏi", category: "Các Món Ốc", price: 95000, status: "ACTIVE", tags: [] },
  { id: 5, name: "Trà Mãng Cầu Đầm Sen", category: "Đồ Uống", price: 35000, status: "SOLD_OUT", tags: ["Giải nhiệt"] },
  { id: 6, name: "Trà Chanh Giã Tay", category: "Đồ Uống", price: 28000, status: "ACTIVE", tags: [] },
];

export default function AdminCatalogPage() {
  const [items, setItems] = useState<MenuItem[]>(mockItems);
  const [filterCat, setFilterCat] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const toggleStatus = (id: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "ACTIVE" ? "SOLD_OUT" : "ACTIVE";
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const filtered = items.filter((item) => {
    const matchCat = filterCat === "ALL" || item.category === filterCat;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
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
        <CasButton icon="plus" variant="primary" size="md">
          Thêm món mới
        </CasButton>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-cas-glass p-4 border border-cas-outline-variant/30">
        <div className="relative flex-1 max-w-md">
          <CasIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cas-on-surface-variant" name="search" />
          <input
            type="text"
            placeholder="Tìm kiếm tên món..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface pl-9 pr-4 py-2 text-xs font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {["ALL", "Mỳ Cay", "Các Món Ốc", "Đồ Uống"].map((cat) => (
            <CasButton
              key={cat}
              onClick={() => setFilterCat(cat)}
              variant={filterCat === cat ? "primary" : "outline"}
              size="sm"
            >
              {cat === "ALL" ? "Tất cả Danh mục" : cat}
            </CasButton>
          ))}
        </div>
      </div>

      {/* Table Danh sách Món */}
      <div className="overflow-x-auto rounded-3xl border border-cas-outline-variant/30 bg-cas-glass shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-cas-outline-variant/25 bg-cas-surface-container/60 text-cas-on-surface-variant font-extrabold uppercase">
            <tr>
              <th className="px-6 py-4">Tên Món</th>
              <th className="px-6 py-4">Danh mục</th>
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
                <td className="px-6 py-4 font-black text-cas-primary">
                  {item.price.toLocaleString("vi-VN")} đ
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="rounded-md bg-cas-secondary/15 px-2 py-0.5 text-[0.68rem] font-extrabold text-cas-secondary">
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
                        : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {item.status === "ACTIVE" ? "ĐANG BÁN" : "HẾT HÀNG"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <CasButton
                    onClick={() => toggleStatus(item.id)}
                    variant="outline"
                    size="sm"
                  >
                    {item.status === "ACTIVE" ? "Hết hàng" : "Mở bán lại"}
                  </CasButton>
                  <CasButton variant="outline-primary" size="sm">
                    Sửa
                  </CasButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
