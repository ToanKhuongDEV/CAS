"use client";

import { useState } from "react";
import { CasButton } from "../../../../components/ui/cas-button";

type OptionGroup = { id: number; name: string; values: string[] };
const initialGroups: OptionGroup[] = [
  { id: 1, name: "Cấp độ cay", values: ["0", "1", "2", "3", "4", "5", "6", "7"] },
  { id: 2, name: "Size", values: ["M", "L"] },
  { id: 3, name: "Topping", values: ["Phô mai", "Xúc xích"] },
];

export default function AdminOptionsPage() {
  const [groups, setGroups] = useState(initialGroups);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState<Record<number, string>>({});

  const addGroup = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setGroups((current) => [...current, { id: Date.now(), name: name.trim(), values: [] }]);
    setName("");
    setShowAddForm(false);
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

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <section
            className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-5"
            key={group.id}
          >
            <h2 className="font-black text-cas-on-surface">{group.name}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.values.map((item) => (
                <span
                  className="rounded-lg bg-cas-secondary/15 px-2.5 py-1 text-xs font-bold text-cas-secondary"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const next = value[group.id]?.trim();
                if (!next) return;
                setGroups((current) =>
                  current.map((item) =>
                    item.id === group.id ? { ...item, values: [...item.values, next] } : item,
                  ),
                );
                setValue((current) => ({ ...current, [group.id]: "" }));
              }}
            >
              <input
                className="min-w-0 flex-1 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-xs"
                onChange={(event) =>
                  setValue((current) => ({ ...current, [group.id]: event.target.value }))
                }
                placeholder="Giá trị option"
                value={value[group.id] ?? ""}
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
