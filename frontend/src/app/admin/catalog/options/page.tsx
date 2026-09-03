"use client";

import { useCallback, useEffect, useState } from "react";
import { CasButton } from "../../../../components/ui/cas-button";
import { CasIcon } from "../../../../components/ui/cas-icon";
import {
  createCatalogOptionGroup,
  createCatalogOptionValue,
  deleteCatalogOptionGroup,
  deleteCatalogOptionValue,
  loadAdminCatalog,
  updateCatalogOptionGroup,
  updateCatalogOptionValue,
  type CatalogOptionGroup,
  type CatalogOptionValue,
} from "../../../../lib/api/catalog/catalog.api";

export default function AdminOptionsPage() {
  const [groups, setGroups] = useState<CatalogOptionGroup[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CatalogOptionGroup | null>(null);
  const [deleteGroupTarget, setDeleteGroupTarget] = useState<CatalogOptionGroup | null>(null);
  const [name, setName] = useState("");
  const [selectionType, setSelectionType] = useState<CatalogOptionGroup["selectionType"]>("SINGLE");
  const [minSelect, setMinSelect] = useState(0);
  const [maxSelect, setMaxSelect] = useState<number | null>(1);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [status, setStatus] = useState<CatalogOptionGroup["status"]>("ACTIVE");
  const [editName, setEditName] = useState("");
  const [editSelectionType, setEditSelectionType] =
    useState<CatalogOptionGroup["selectionType"]>("SINGLE");
  const [editMinSelect, setEditMinSelect] = useState(0);
  const [editMaxSelect, setEditMaxSelect] = useState<number | null>(1);
  const [editDisplayOrder, setEditDisplayOrder] = useState(0);
  const [editStatus, setEditStatus] = useState<CatalogOptionGroup["status"]>("ACTIVE");
  const [valueInput, setValueInput] = useState<Record<number, string>>({});
  const [valuePriceInput, setValuePriceInput] = useState<Record<number, string>>({});
  const [editingValue, setEditingValue] = useState<CatalogOptionValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const refreshGroups = useCallback(async () => {
    try {
      const data = await loadAdminCatalog();
      setGroups(data.optionGroups);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load option groups.");
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void refreshGroups(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [refreshGroups]);

  const addGroup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    if (
      (selectionType === "SINGLE" && (minSelect > 1 || (maxSelect !== null && maxSelect > 1))) ||
      (maxSelect !== null && minSelect > maxSelect)
    ) {
      setError("Giới hạn số lựa chọn không hợp lệ.");
      return;
    }
    setIsSaving(true);
    try {
      await createCatalogOptionGroup({
        displayOrder,
        maxSelect,
        minSelect,
        name: name.trim(),
        selectionType,
        status,
      });
      await refreshGroups();
      setName("");
      setSelectionType("SINGLE");
      setMinSelect(0);
      setMaxSelect(1);
      setDisplayOrder(groups.length + 1);
      setStatus("ACTIVE");
      setShowAddForm(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create option group.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateGroupName = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingGroup || !editName.trim()) return;
    if (
      (editSelectionType === "SINGLE" &&
        (editMinSelect > 1 || (editMaxSelect !== null && editMaxSelect > 1))) ||
      (editMaxSelect !== null && editMinSelect > editMaxSelect)
    ) {
      setError("Giới hạn số lựa chọn không hợp lệ.");
      return;
    }
    setIsSaving(true);
    try {
      await updateCatalogOptionGroup(editingGroup.id, {
        displayOrder: editDisplayOrder,
        maxSelect: editMaxSelect,
        minSelect: editMinSelect,
        name: editName.trim(),
        selectionType: editSelectionType,
        status: editStatus,
      });
      await refreshGroups();
      setEditingGroup(null);
      setEditName("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update option group.");
    } finally {
      setIsSaving(false);
    }
  };

  const removeGroup = async () => {
    if (!deleteGroupTarget) return;
    setIsSaving(true);
    try {
      await deleteCatalogOptionGroup(deleteGroupTarget.id);
      await refreshGroups();
      setDeleteGroupTarget(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete option group.");
    } finally {
      setIsSaving(false);
    }
  };

  const addOptionValue = async (groupId: number, event: React.FormEvent) => {
    event.preventDefault();
    const nextVal = valueInput[groupId]?.trim();
    if (!nextVal) return;
    setIsSaving(true);
    try {
      await createCatalogOptionValue(groupId, {
        displayOrder: groups.find((group) => group.id === groupId)?.values.length ?? 0,
        extraPrice: Number(valuePriceInput[groupId] || 0),
        isDefault: false,
        name: nextVal,
        status: "ACTIVE",
      });
      await refreshGroups();
      setValueInput((current) => ({ ...current, [groupId]: "" }));
      setValuePriceInput((current) => ({ ...current, [groupId]: "" }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create option value.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateOptionValue = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingValue || !editingValue.name.trim() || editingValue.extraPrice < 0) return;
    setIsSaving(true);
    try {
      await updateCatalogOptionValue(editingValue.id, {
        displayOrder: editingValue.displayOrder,
        extraPrice: editingValue.extraPrice,
        isDefault: editingValue.isDefault,
        name: editingValue.name.trim(),
        status: editingValue.status,
      });
      await refreshGroups();
      setEditingValue(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update option value.");
    } finally {
      setIsSaving(false);
    }
  };

  const removeOptionValue = async (valueId: number) => {
    setIsSaving(true);
    try {
      await deleteCatalogOptionValue(valueId);
      await refreshGroups();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete option value.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-cas-on-surface">Nhóm và giá trị option</h1>
          <p className="text-xs text-cas-on-surface-variant">
            Quản lý riêng các lựa chọn để liên kết với món ăn.
          </p>
        </div>
        <CasButton icon="plus" onClick={() => setShowAddForm(true)} size="md" variant="primary">
          Tạo nhóm option
        </CasButton>
      </div>
      {error ? <p className="text-sm font-semibold text-cas-error">{error}</p> : null}

      {editingValue ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-cas-on-surface/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditingValue(null);
          }}
        >
          <form
            className="w-full max-w-md space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl"
            onSubmit={updateOptionValue}
          >
            <h2 className="text-lg font-black text-cas-on-surface">Sửa giá trị option</h2>
            <label className="block text-xs font-bold text-cas-on-surface-variant">
              Tên
              <input
                className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface"
                onChange={(event) =>
                  setEditingValue((value) =>
                    value ? { ...value, name: event.target.value } : value,
                  )
                }
                required
                value={editingValue.name}
              />
            </label>
            <label className="block text-xs font-bold text-cas-on-surface-variant">
              Giá cộng thêm
              <input
                className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface"
                min="0"
                onChange={(event) =>
                  setEditingValue((value) =>
                    value ? { ...value, extraPrice: Number(event.target.value) } : value,
                  )
                }
                step="1"
                type="number"
                value={editingValue.extraPrice}
              />
            </label>
            <label className="block text-xs font-bold text-cas-on-surface-variant">
              Thứ tự hiển thị
              <input
                className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface"
                min="0"
                onChange={(event) =>
                  setEditingValue((value) =>
                    value ? { ...value, displayOrder: Number(event.target.value) } : value,
                  )
                }
                type="number"
                value={editingValue.displayOrder}
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-cas-on-surface">
              <input
                checked={editingValue.isDefault}
                onChange={(event) =>
                  setEditingValue((value) =>
                    value ? { ...value, isDefault: event.target.checked } : value,
                  )
                }
                type="checkbox"
              />
              Chọn mặc định
            </label>
            <label className="block text-xs font-bold text-cas-on-surface-variant">
              Trạng thái
              <select
                className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface"
                onChange={(event) =>
                  setEditingValue((value) =>
                    value
                      ? { ...value, status: event.target.value as CatalogOptionValue["status"] }
                      : value,
                  )
                }
                value={editingValue.status}
              >
                <option value="ACTIVE">Đang dùng</option>
                <option value="INACTIVE">Ngừng dùng</option>
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <CasButton
                onClick={() => setEditingValue(null)}
                size="sm"
                type="button"
                variant="outline"
              >
                Hủy
              </CasButton>
              <CasButton disabled={isSaving} size="sm" type="submit" variant="primary">
                Lưu thay đổi
              </CasButton>
            </div>
          </form>
        </div>
      ) : null}

      {/* Modal Tạo nhóm option */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAddForm(false);
          }}
        >
          <form
            className="my-auto w-full max-w-md space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl animate-in fade-in duration-150"
            onSubmit={addGroup}
          >
            <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
              <h3 className="text-base font-black text-cas-on-surface">Tạo Nhóm Option Mới</h3>
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
                  Tên nhóm option:
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="VD: Mức giá / Độ ngọt / Topping..."
                  required
                  type="text"
                  value={name}
                />
              </div>
              <label className="block font-bold text-cas-on-surface-variant">
                Kiểu chọn
                <select
                  className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                  onChange={(event) =>
                    setSelectionType(event.target.value as CatalogOptionGroup["selectionType"])
                  }
                  value={selectionType}
                >
                  <option value="SINGLE">Chọn một</option>
                  <option value="MULTIPLE">Chọn nhiều</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block font-bold text-cas-on-surface-variant">
                  Chọn tối thiểu
                  <input
                    className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                    min="0"
                    onChange={(event) => setMinSelect(Number(event.target.value))}
                    type="number"
                    value={minSelect}
                  />
                </label>
                <label className="block font-bold text-cas-on-surface-variant">
                  Chọn tối đa
                  <input
                    className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                    min="0"
                    onChange={(event) =>
                      setMaxSelect(event.target.value === "" ? null : Number(event.target.value))
                    }
                    placeholder="Không giới hạn"
                    type="number"
                    value={maxSelect ?? ""}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block font-bold text-cas-on-surface-variant">
                  Thứ tự hiển thị
                  <input
                    className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                    min="0"
                    onChange={(event) => setDisplayOrder(Number(event.target.value))}
                    type="number"
                    value={displayOrder}
                  />
                </label>
                <label className="block font-bold text-cas-on-surface-variant">
                  Trạng thái
                  <select
                    className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                    onChange={(event) =>
                      setStatus(event.target.value as CatalogOptionGroup["status"])
                    }
                    value={status}
                  >
                    <option value="ACTIVE">Đang dùng</option>
                    <option value="INACTIVE">Ngừng dùng</option>
                  </select>
                </label>
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
                Tạo nhóm option
              </CasButton>
            </div>
          </form>
        </div>
      )}

      {/* Modal sửa nhóm option */}
      {editingGroup && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditingGroup(null);
          }}
        >
          <form
            className="my-auto w-full max-w-md space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl animate-in fade-in duration-150"
            onSubmit={updateGroupName}
          >
            <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
              <h3 className="text-base font-black text-cas-on-surface">Chỉnh sửa Nhóm Option</h3>
              <button
                className="text-xs font-bold text-cas-on-surface-variant hover:text-cas-primary"
                onClick={() => setEditingGroup(null)}
                type="button"
              >
                Hủy
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-cas-on-surface-variant">
                  Tên nhóm option:
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                  onChange={(event) => setEditName(event.target.value)}
                  required
                  type="text"
                  value={editName}
                />
              </div>
              <label className="block font-bold text-cas-on-surface-variant">
                Kiểu chọn
                <select
                  className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                  onChange={(event) =>
                    setEditSelectionType(event.target.value as CatalogOptionGroup["selectionType"])
                  }
                  value={editSelectionType}
                >
                  <option value="SINGLE">Chọn một</option>
                  <option value="MULTIPLE">Chọn nhiều</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block font-bold text-cas-on-surface-variant">
                  Chọn tối thiểu
                  <input
                    className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                    min="0"
                    onChange={(event) => setEditMinSelect(Number(event.target.value))}
                    type="number"
                    value={editMinSelect}
                  />
                </label>
                <label className="block font-bold text-cas-on-surface-variant">
                  Chọn tối đa
                  <input
                    className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                    min="0"
                    onChange={(event) =>
                      setEditMaxSelect(
                        event.target.value === "" ? null : Number(event.target.value),
                      )
                    }
                    placeholder="Không giới hạn"
                    type="number"
                    value={editMaxSelect ?? ""}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block font-bold text-cas-on-surface-variant">
                  Thứ tự hiển thị
                  <input
                    className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                    min="0"
                    onChange={(event) => setEditDisplayOrder(Number(event.target.value))}
                    type="number"
                    value={editDisplayOrder}
                  />
                </label>
                <label className="block font-bold text-cas-on-surface-variant">
                  Trạng thái
                  <select
                    className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                    onChange={(event) =>
                      setEditStatus(event.target.value as CatalogOptionGroup["status"])
                    }
                    value={editStatus}
                  >
                    <option value="ACTIVE">Đang dùng</option>
                    <option value="INACTIVE">Ngừng dùng</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <CasButton
                onClick={() => setEditingGroup(null)}
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

      {/* Modal Xác nhận Xóa nhóm */}
      {deleteGroupTarget && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDeleteGroupTarget(null);
          }}
        >
          <div className="my-auto w-full max-w-md space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl animate-in fade-in duration-150">
            <h3 className="text-base font-black text-cas-on-surface">
              Xóa Nhóm Option &quot;{deleteGroupTarget.name}&quot;?
            </h3>
            <p className="font-medium text-xs text-cas-on-surface-variant">
              Bạn có chắc chắn muốn xóa nhóm option này không? Hành động này sẽ xóa toàn bộ các giá
              trị lựa chọn bên trong.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <CasButton
                onClick={() => setDeleteGroupTarget(null)}
                size="sm"
                type="button"
                variant="outline"
              >
                Hủy
              </CasButton>
              <CasButton onClick={removeGroup} size="sm" type="button" variant="primary">
                Xác nhận Xóa
              </CasButton>
            </div>
          </div>
        </div>
      )}

      {/* Group Cards List */}
      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <section
            className="flex flex-col justify-between rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-5 shadow-xs"
            key={group.id}
          >
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-cas-outline-variant/15 pb-3">
                <h2 className="text-base font-black text-cas-on-surface">{group.name}</h2>
                <div className="flex items-center gap-1">
                  <button
                    className="cursor-pointer rounded-lg p-1.5 text-cas-on-surface-variant transition hover:bg-cas-surface-container hover:text-cas-primary"
                    onClick={() => {
                      setEditingGroup(group);
                      setEditName(group.name);
                      setEditSelectionType(group.selectionType);
                      setEditMinSelect(group.minSelect);
                      setEditMaxSelect(group.maxSelect);
                      setEditDisplayOrder(group.displayOrder);
                      setEditStatus(group.status);
                    }}
                    title="Sửa nhóm option"
                    type="button"
                  >
                    <CasIcon className="size-4" name="edit" />
                  </button>
                  <button
                    className="cursor-pointer rounded-lg p-1.5 text-cas-on-surface-variant transition hover:bg-rose-500/10 hover:text-rose-600"
                    onClick={() => setDeleteGroupTarget(group)}
                    title="Xóa nhóm option"
                    type="button"
                  >
                    <CasIcon className="size-4" name="trash" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {group.values.length > 0 ? (
                  group.values.map((val) => (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-xl border border-cas-secondary/20 bg-cas-secondary/15 px-3 py-1 text-xs font-bold text-cas-secondary"
                      key={val.id}
                    >
                      <span>{val.name}</span>
                      <button
                        className="cursor-pointer rounded-full p-0.5 text-cas-secondary transition hover:bg-cas-secondary/20 hover:text-cas-primary"
                        disabled={isSaving}
                        onClick={() => setEditingValue(val)}
                        title={`Sửa giá trị ${val.name}`}
                        type="button"
                      >
                        <CasIcon className="size-3" name="edit" />
                      </button>
                      <button
                        className="cursor-pointer rounded-full p-0.5 text-cas-secondary transition hover:bg-cas-secondary/20 hover:text-rose-600"
                        disabled={isSaving}
                        onClick={() => void removeOptionValue(val.id)}
                        title={`Xóa giá trị ${val.name}`}
                        type="button"
                      >
                        <CasIcon className="size-3" name="close" />
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-xs italic text-cas-on-surface-variant/60">
                    Chưa có giá trị option nào.
                  </p>
                )}
              </div>
            </div>

            <form
              className="mt-5 flex flex-wrap gap-2 border-t border-cas-outline-variant/15 pt-3"
              onSubmit={(event) => addOptionValue(group.id, event)}
            >
              <input
                className="min-w-0 flex-1 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-xs font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                onChange={(event) =>
                  setValueInput((current) => ({ ...current, [group.id]: event.target.value }))
                }
                placeholder="Nhập giá trị option mới (VD: Siêu cay, Size L...)"
                value={valueInput[group.id] ?? ""}
              />
              <input
                className="w-28 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-xs font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                min="0"
                onChange={(event) =>
                  setValuePriceInput((current) => ({ ...current, [group.id]: event.target.value }))
                }
                placeholder="Giá thêm"
                step="1"
                type="number"
                value={valuePriceInput[group.id] ?? ""}
              />
              <CasButton size="sm" type="submit" variant="outline-primary">
                Thêm
              </CasButton>
            </form>
          </section>
        ))}
      </div>
    </div>
  );
}
