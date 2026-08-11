"use client";

import { useState } from "react";
import { CasButton } from "../../../../components/ui/cas-button";
import { CasIcon } from "../../../../components/ui/cas-icon";

type OptionGroup = { id: number; name: string; values: string[] };

const initialGroups: OptionGroup[] = [
  { id: 1, name: "Cấp độ cay", values: ["0", "1", "2", "3", "4", "5", "6", "7"] },
  { id: 2, name: "Size", values: ["M", "L"] },
  { id: 3, name: "Topping", values: ["Phô mai", "Xúc xích"] },
];

export default function AdminOptionsPage() {
  const [groups, setGroups] = useState<OptionGroup[]>(initialGroups);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null);
  const [deleteGroupTarget, setDeleteGroupTarget] = useState<OptionGroup | null>(null);
  const [name, setName] = useState("");
  const [editName, setEditName] = useState("");
  const [valueInput, setValueInput] = useState<Record<number, string>>({});

  const addGroup = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setGroups((current) => [...current, { id: Date.now(), name: name.trim(), values: [] }]);
    setName("");
    setShowAddForm(false);
  };

  const updateGroupName = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingGroup || !editName.trim()) return;
    setGroups((current) =>
      current.map((g) => (g.id === editingGroup.id ? { ...g, name: editName.trim() } : g)),
    );
    setEditingGroup(null);
    setEditName("");
  };

  const removeGroup = () => {
    if (!deleteGroupTarget) return;
    setGroups((current) => current.filter((g) => g.id !== deleteGroupTarget.id));
    setDeleteGroupTarget(null);
  };

  const addOptionValue = (groupId: number, event: React.FormEvent) => {
    event.preventDefault();
    const nextVal = valueInput[groupId]?.trim();
    if (!nextVal) return;
    setGroups((current) =>
      current.map((g) =>
        g.id === groupId && !g.values.includes(nextVal)
          ? { ...g, values: [...g.values, nextVal] }
          : g,
      ),
    );
    setValueInput((current) => ({ ...current, [groupId]: "" }));
  };

  const removeOptionValue = (groupId: number, valToRemove: string) => {
    setGroups((current) =>
      current.map((g) =>
        g.id === groupId ? { ...g, values: g.values.filter((v) => v !== valToRemove) } : g,
      ),
    );
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

      {/* Modal Sửa tên nhóm */}
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
              <h3 className="text-base font-black text-cas-on-surface">
                Chỉnh sửa Tên Nhóm Option
              </h3>
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
                    }}
                    title="Sửa tên nhóm"
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
                      key={val}
                    >
                      <span>{val}</span>
                      <button
                        className="cursor-pointer rounded-full p-0.5 text-cas-secondary transition hover:bg-cas-secondary/20 hover:text-rose-600"
                        onClick={() => removeOptionValue(group.id, val)}
                        title={`Xóa giá trị ${val}`}
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
              className="mt-5 flex gap-2 border-t border-cas-outline-variant/15 pt-3"
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
