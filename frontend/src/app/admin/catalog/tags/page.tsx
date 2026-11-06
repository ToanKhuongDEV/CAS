"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CasButton } from "../../../../components/ui/cas-button";
import {
  createCatalogTag,
  deleteCatalogTag,
  updateCatalogTag,
  type CatalogTag,
} from "../../../../lib/api/catalog/catalog.api";
import {
  adminCatalogQueryKey,
  useAdminCatalogQuery,
} from "../../../../lib/api/catalog/catalog.query";

export default function AdminTagsPage() {
  const queryClient = useQueryClient();
  const { data: catalog, error: queryError } = useAdminCatalogQuery();
  const tags = catalog?.tags ?? [];
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const displayedError = error ?? queryError?.message ?? null;

  const addTag = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newTag.trim()) {
      setIsSaving(true);
      try {
        await createCatalogTag({ name: newTag.trim(), status: "ACTIVE" });
        await queryClient.invalidateQueries({ queryKey: adminCatalogQueryKey });
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
      await queryClient.invalidateQueries({ queryKey: adminCatalogQueryKey });
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
      await queryClient.invalidateQueries({ queryKey: adminCatalogQueryKey });
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
      </div>
      {displayedError ? (
        <p className="text-sm font-semibold text-cas-error">{displayedError}</p>
      ) : null}
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
