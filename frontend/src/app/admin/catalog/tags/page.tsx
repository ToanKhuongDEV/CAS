"use client";

import { useCallback, useEffect, useState } from "react";
import { CasButton } from "../../../../components/ui/cas-button";
import {
  createCatalogTag,
  deleteCatalogTag,
  loadAdminCatalog,
  updateCatalogTag,
  type CatalogTag,
} from "../../../../lib/api/catalog/catalog.api";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<CatalogTag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const refreshTags = useCallback(async () => {
    try {
      const data = await loadAdminCatalog();
      setTags(data.tags);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load tags.");
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void refreshTags(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [refreshTags]);

  const addTag = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newTag.trim()) {
      setIsSaving(true);
      try {
        await createCatalogTag({ name: newTag.trim(), status: "ACTIVE" });
        await refreshTags();
        setNewTag("");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to create tag.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const toggleTagStatus = async (tag: CatalogTag) => {
    setIsSaving(true);
    try {
      await updateCatalogTag(tag.id, {
        name: tag.name,
        status: tag.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });
      await refreshTags();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update tag.");
    } finally {
      setIsSaving(false);
    }
  };

  const removeTag = async (tag: CatalogTag) => {
    setIsSaving(true);
    try {
      await deleteCatalogTag(tag.id);
      await refreshTags();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete tag.");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-cas-on-surface">Nhãn món</h1>
        <p className="text-xs text-cas-on-surface-variant">
          Tạo nhãn để gắn cho món; việc gán nhãn thực hiện trong phần món ăn.
        </p>
      </div>
      {error ? <p className="text-sm font-semibold text-cas-error">{error}</p> : null}
      <form
        onSubmit={addTag}
        className="flex flex-wrap gap-3 rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-4"
      >
        <input
          value={newTag}
          onChange={(event) => setNewTag(event.target.value)}
          placeholder="Ví dụ: Món mới"
          className="min-w-56 flex-1 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-xs font-bold"
        />
        <CasButton type="submit" icon="plus" size="sm">
          Tạo nhãn
        </CasButton>
      </form>
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-3 rounded-xl border border-cas-outline-variant/30 bg-cas-glass px-4 py-3"
          >
            <span className="rounded-md bg-cas-secondary/15 px-2 py-1 text-xs font-black text-cas-secondary">
              {tag.name}
            </span>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void toggleTagStatus(tag)}
              className="text-xs font-black text-cas-primary"
            >
              {tag.status === "ACTIVE" ? "Ẩn" : "Hiện"}
            </button>
            <button
              type="button"
              disabled={isSaving}
              aria-label={`Xóa nhãn ${tag.name}`}
              onClick={() => void removeTag(tag)}
              className="text-xs font-black text-cas-primary"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
