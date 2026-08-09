"use client";

import { useState } from "react";
import { CasButton } from "../../../../components/ui/cas-button";

type Category = { id: number; name: string; visible: boolean };
const initialCategories: Category[] = [
  { id: 1, name: "Mỳ Cay", visible: true },
  { id: 2, name: "Gà Rán", visible: true },
  { id: 3, name: "Đồ Ăn Vặt", visible: true },
  { id: 4, name: "Đồ Uống", visible: true },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");

  const addCategory = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setCategories((current) => [...current, { id: Date.now(), name: name.trim(), visible: true }]);
    setName("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-cas-on-surface">Danh mục món</h1>
          <p className="text-xs text-cas-on-surface-variant">
            Tạo, ẩn hoặc hiển thị danh mục trên thực đơn khách.
          </p>
        </div>
        <CasButton icon="plus" onClick={() => setShowAddForm(true)} size="md" variant="primary">
          Thêm danh mục mới
        </CasButton>
      </div>

      {showAddForm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAddForm(false);
          }}
        >
          <form
            className="my-auto w-full max-w-md space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl animate-in fade-in duration-150"
            onSubmit={addCategory}
          >
            <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
              <h3 className="text-base font-black text-cas-on-surface">Tạo Danh Mục Mới</h3>
              <button
                className="text-xs font-bold text-cas-on-surface-variant hover:text-cas-primary"
                onClick={() => setShowAddForm(false)}
                type="button"
              >
                Hủy
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-cas-on-surface-variant">
                  Tên danh mục món:
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="VD: Món Tráng Miệng / Đồ Uống..."
                  required
                  type="text"
                  value={name}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <CasButton
                onClick={() => setShowAddForm(false)}
                size="sm"
                type="button"
                variant="outline"
              >
                Hủy
              </CasButton>
              <CasButton icon="plus" size="sm" type="submit" variant="primary">
                Thêm danh mục
              </CasButton>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {categories.map((category, index) => (
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-4"
            key={category.id}
          >
            <div>
              <p className="font-black text-cas-on-surface">
                {index + 1}. {category.name}
              </p>
              <p className="mt-1 text-xs text-cas-on-surface-variant">
                {category.visible ? "Đang hiển thị trên menu" : "Đang ẩn trên menu"}
              </p>
            </div>
            <CasButton
              onClick={() =>
                setCategories((current) =>
                  current.map((item) =>
                    item.id === category.id ? { ...item, visible: !item.visible } : item,
                  ),
                )
              }
              size="sm"
              variant="outline-primary"
            >
              {category.visible ? "Ẩn danh mục" : "Hiển thị"}
            </CasButton>
          </div>
        ))}
      </div>
    </div>
  );
}
