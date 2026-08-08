"use client";

import { useState } from "react";
import { CasButton } from "../../../../components/ui/cas-button";

type OptionGroup = { id: number; name: string; values: string[] };
const initialGroups: OptionGroup[] = [{ id: 1, name: "Cấp độ cay", values: ["0", "1", "2", "3", "4", "5", "6", "7"] }, { id: 2, name: "Size", values: ["M", "L"] }, { id: 3, name: "Topping", values: ["Phô mai", "Xúc xích"] }];
export default function AdminOptionsPage() {
  const [groups, setGroups] = useState(initialGroups); const [name, setName] = useState(""); const [value, setValue] = useState<Record<number, string>>({});
  const addGroup = (event: React.FormEvent) => { event.preventDefault(); if (!name.trim()) return; setGroups((current) => [...current, { id: Date.now(), name: name.trim(), values: [] }]); setName(""); };
  return <div className="space-y-6"><div><h1 className="text-2xl font-black text-cas-on-surface">Nhóm và giá trị option</h1><p className="text-xs text-cas-on-surface-variant">Quản lý riêng các lựa chọn để liên kết với món ăn.</p></div>
    <form onSubmit={addGroup} className="flex flex-wrap gap-3 rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-4"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên nhóm option" className="min-w-56 flex-1 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-xs font-bold" /><CasButton type="submit" icon="plus" size="sm">Tạo nhóm option</CasButton></form>
    <div className="grid gap-4 lg:grid-cols-2">{groups.map((group) => <section key={group.id} className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-5"><h2 className="font-black text-cas-on-surface">{group.name}</h2><div className="mt-3 flex flex-wrap gap-2">{group.values.map((item) => <span key={item} className="rounded-lg bg-cas-secondary/15 px-2.5 py-1 text-xs font-bold text-cas-secondary">{item}</span>)}</div><form onSubmit={(event) => { event.preventDefault(); const next = value[group.id]?.trim(); if (!next) return; setGroups((current) => current.map((item) => item.id === group.id ? { ...item, values: [...item.values, next] } : item)); setValue((current) => ({ ...current, [group.id]: "" })); }} className="mt-4 flex gap-2"><input value={value[group.id] ?? ""} onChange={(event) => setValue((current) => ({ ...current, [group.id]: event.target.value }))} placeholder="Giá trị option" className="min-w-0 flex-1 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-xs" /><CasButton type="submit" variant="outline-primary" size="sm">Thêm</CasButton></form></section>)}</div>
  </div>;
}
