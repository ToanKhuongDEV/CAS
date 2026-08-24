"use client";

import { useCallback, useEffect, useState } from "react";
import { CasButton } from "../../../../components/ui/cas-button";
import { CasIcon } from "../../../../components/ui/cas-icon";
import {
  createCatalogCategory,
  deleteCatalogCategory,
  loadAdminCatalog,
  updateCatalogCategory,
  type CatalogCategory,
} from "../../../../lib/api/catalog/catalog.api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CatalogCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogCategory | null>(null);
  const [name, setName] = useState("");
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const refreshCategories = useCallback(async () => {
    try {
      const data = await loadAdminCatalog();
      setCategories(data.categories.filter((category) => category.categoryType === "REGULAR"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load categories.");
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void refreshCategories(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [refreshCategories]);

  const addCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await createCatalogCategory({
        categoryType: "REGULAR",
        description: "",
        displayOrder: categories.length,
        name: name.trim(),
        status: "ACTIVE",
      });
      await refreshCategories();
      setName("");
      setShowAddForm(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create category.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateCategoryName = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingCategory || !editName.trim()) return;
    setIsSaving(true);
    try {
      await updateCatalogCategory(editingCategory.id, {
        ...editingCategory,
        description: editingCategory.description ?? "",
        name: editName.trim(),
      });
      await refreshCategories();
      setEditingCategory(null);
      setEditName("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update category.");
    } finally {
      setIsSaving(false);
    }
  };

  const removeCategory = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      await deleteCatalogCategory(deleteTarget.id);
      await refreshCategories();
      setDeleteTarget(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete category.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategoryStatus = async (category: CatalogCategory) => {
    setIsSaving(true);
    try {
      await updateCatalogCategory(category.id, {
        ...category,
        description: category.description ?? "",
        status: category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });
      await refreshCategories();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update category.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-cas-on-surface">Danh mục món</h1>
          <p className="text-xs text-cas-on-surface-variant">
            Tạo, chỉnh sửa, ẩn hoặc hiển thị danh mục trên thực đơn khách.
          </p>
        </div>
        <CasButton icon="plus" onClick={() => setShowAddForm(true)} size="md" variant="primary">
          Thêm danh mục mới
        </CasButton>
      </div>
      {error ? <p className="text-sm font-semibold text-cas-error">{error}</p> : null}

      {/* Modal Tạo danh mục mới */}
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

      {/* Modal Sửa tên danh mục */}
      {editingCategory && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditingCategory(null);
          }}
        >
          <form
            className="my-auto w-full max-w-md space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl animate-in fade-in duration-150"
            onSubmit={updateCategoryName}
          >
            <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
              <h3 className="text-base font-black text-cas-on-surface">Chỉnh Sửa Danh Mục</h3>
              <button
                className="text-xs font-bold text-cas-on-surface-variant hover:text-cas-primary"
                onClick={() => setEditingCategory(null)}
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
                  onChange={(event) => setEditName(event.target.value)}
                  required
                  type="text"
                  value={editName}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <CasButton
                onClick={() => setEditingCategory(null)}
                size="sm"
                type="button"
                variant="outline"
              >
                Hủy
              </CasButton>
              <CasButton size="sm" type="submit" variant="primary">
                Lưu thay đổi
              </CasButton>
            </div>
          </form>
        </div>
      )}

      {/* Modal Xác nhận Xóa danh mục */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null);
          }}
        >
          <div className="my-auto w-full max-w-md space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl animate-in fade-in duration-150">
            <h3 className="text-base font-black text-cas-on-surface">
              Xóa Danh Mục &quot;{deleteTarget.name}&quot;?
            </h3>
            <p className="font-medium text-xs text-cas-on-surface-variant">
              Bạn có chắc chắn muốn xóa danh mục này không? Các món ăn thuộc danh mục này sẽ giữ
              nguyên tên danh mục cũ cho đến khi được cập nhật lại.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <CasButton
                onClick={() => setDeleteTarget(null)}
                size="sm"
                type="button"
                variant="outline"
              >
                Hủy
              </CasButton>
              <CasButton
                disabled={isSaving}
                onClick={removeCategory}
                size="sm"
                type="button"
                variant="primary"
              >
                Xác nhận Xóa
              </CasButton>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {categories.map((category, index) => (
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-4 shadow-xs"
            key={category.id}
          >
            <div>
              <p className="font-black text-cas-on-surface">
                {index + 1}. {category.name}
              </p>
              <p className="mt-1 text-xs text-cas-on-surface-variant">
                {category.status === "ACTIVE" ? "Đang hiển thị trên menu" : "Đang ẩn trên menu"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <CasButton
                disabled={isSaving}
                onClick={() => void toggleCategoryStatus(category)}
                size="sm"
                variant={category.status === "ACTIVE" ? "outline" : "outline-primary"}
              >
                {category.status === "ACTIVE" ? "Ẩn danh mục" : "Hiển thị"}
              </CasButton>
              <button
                className="cursor-pointer rounded-lg p-2 text-cas-on-surface-variant transition hover:bg-cas-surface-container hover:text-cas-primary"
                onClick={() => {
                  setEditingCategory(category);
                  setEditName(category.name);
                }}
                title="Sửa tên danh mục"
                type="button"
              >
                <CasIcon className="size-4" name="edit" />
              </button>
              <button
                className="cursor-pointer rounded-lg p-2 text-cas-on-surface-variant transition hover:bg-rose-500/10 hover:text-rose-600"
                onClick={() => setDeleteTarget(category)}
                title="Xóa danh mục"
                type="button"
              >
                <CasIcon className="size-4" name="trash" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
