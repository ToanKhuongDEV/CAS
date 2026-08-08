"use client";

import { useState } from "react";
import { CasButton } from "../../../../components/ui/cas-button";

type Category = { id: number; name: string; visible: boolean };
const initialCategories: Category[] = [
  { id: 1, name: "Mỳ Cay", visible: true },
  { id: 2, name: "Các Món Ốc", visible: true },
  { id: 3, name: "Đồ Uống", visible: true },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const addCategory = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setCategories((current) => [...current, { id: Date.now(), name: name.trim(), visible: true }]);
    setName("");
  };

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-black text-cas-on-surface">Danh mục món</h1><p className="text-xs text-cas-on-surface-variant">Tạo, ẩn hoặc hiển thị danh mục trên thực đơn khách.</p></div>
    <form onSubmit={addCategory} className="flex flex-wrap gap-3 rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-4">
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên danh mục" className="min-w-56 flex-1 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-xs font-bold text-cas-on-surface" />
      <CasButton type="submit" icon="plus" size="sm">Thêm danh mục</CasButton>
    </form>
    <div className="space-y-3">{categories.map((category, index) => <div key={category.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-4">
      <div><p className="font-black text-cas-on-surface">{index + 1}. {category.name}</p><p className="mt-1 text-xs text-cas-on-surface-variant">{category.visible ? "Đang hiển thị trên menu" : "Đang ẩn trên menu"}</p></div>
      <CasButton onClick={() => setCategories((current) => current.map((item) => item.id === category.id ? { ...item, visible: !item.visible } : item))} variant="outline-primary" size="sm">{category.visible ? "Ẩn danh mục" : "Hiển thị"}</CasButton>
    </div>)}</div>
  </div>;
}
