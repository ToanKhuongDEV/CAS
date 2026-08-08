"use client";

import { useState } from "react";
import { CasButton } from "../../../../components/ui/cas-button";

export default function AdminTagsPage() {
  const [tags, setTags] = useState(["Bán chạy", "Cay", "Đặc sản", "Giải nhiệt"]);
  const [newTag, setNewTag] = useState("");
  const addTag = (event: React.FormEvent) => { event.preventDefault(); if (newTag.trim() && !tags.includes(newTag.trim())) { setTags((current) => [...current, newTag.trim()]); setNewTag(""); } };
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-black text-cas-on-surface">Nhãn món</h1><p className="text-xs text-cas-on-surface-variant">Tạo nhãn để gắn cho món; việc gán nhãn thực hiện trong phần món ăn.</p></div>
    <form onSubmit={addTag} className="flex flex-wrap gap-3 rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-4"><input value={newTag} onChange={(event) => setNewTag(event.target.value)} placeholder="Ví dụ: Món mới" className="min-w-56 flex-1 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-xs font-bold" /><CasButton type="submit" icon="plus" size="sm">Tạo nhãn</CasButton></form>
    <div className="flex flex-wrap gap-3">{tags.map((tag) => <div key={tag} className="flex items-center gap-3 rounded-xl border border-cas-outline-variant/30 bg-cas-glass px-4 py-3"><span className="rounded-md bg-cas-secondary/15 px-2 py-1 text-xs font-black text-cas-secondary">{tag}</span><button type="button" aria-label={`Xóa nhãn ${tag}`} onClick={() => setTags((current) => current.filter((item) => item !== tag))} className="text-xs font-black text-cas-primary">×</button></div>)}</div>
  </div>;
}
