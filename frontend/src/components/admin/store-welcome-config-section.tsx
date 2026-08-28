"use client";

import { useEffect, useState } from "react";
import { uploadImage } from "../../lib/api/catalog/cloudinary-upload";
import {
  createEmptyStoreWelcomeConfig,
  loadStoreWelcomeConfig,
  saveStoreWelcomeConfig,
  type StoreWelcomeConfig,
} from "../../lib/api/store/store-welcome-config.api";
import { CasButton } from "../ui/cas-button";
import { CasIcon } from "../ui/cas-icon";
import { useToast } from "../ui/toast-provider";

type ImageSlot = {
  description: string;
  label: string;
  storageKey: keyof StoreWelcomeConfig;
  urlKey: keyof StoreWelcomeConfig;
};

const imageSlots: ImageSlot[] = [
  {
    label: "Hero chính",
    description: "Ảnh nổi bật đầu trang Welcome.",
    urlKey: "heroPrimaryImageUrl",
    storageKey: "heroPrimaryImageStorageKey",
  },
  {
    label: "Hero phụ",
    description: "Ảnh hỗ trợ khu vực giới thiệu đầu trang.",
    urlKey: "heroSecondaryImageUrl",
    storageKey: "heroSecondaryImageStorageKey",
  },
  ...Array.from({ length: 5 }, (_, index) => ({
    label: `Ảnh menu ${index + 1}`,
    description: "Ảnh xem trước khu vực menu.",
    urlKey: `menuPreview${index + 1}ImageUrl` as keyof StoreWelcomeConfig,
    storageKey: `menuPreview${index + 1}ImageStorageKey` as keyof StoreWelcomeConfig,
  })),
  {
    label: "Banner",
    description: "Ảnh banner trên trang Welcome.",
    urlKey: "bannerImageUrl",
    storageKey: "bannerImageStorageKey",
  },
];

export function StoreWelcomeConfigSection() {
  const { showToast } = useToast();
  const [config, setConfig] = useState<StoreWelcomeConfig>(createEmptyStoreWelcomeConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingSlots, setUploadingSlots] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    void loadStoreWelcomeConfig()
      .then((savedConfig) => {
        if (active && savedConfig) setConfig({ ...savedConfig, status: "ACTIVE" });
      })
      .catch((error) => {
        if (active) {
          showToast({
            message: error instanceof Error ? error.message : "Không thể tải cấu hình Welcome.",
            type: "error",
          });
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [showToast]);

  const setSlotUploading = (slot: ImageSlot, isUploading: boolean) => {
    setUploadingSlots((current) => {
      const next = new Set(current);
      if (isUploading) next.add(String(slot.urlKey));
      else next.delete(String(slot.urlKey));
      return next;
    });
  };

  const handleImageChange = async (slot: ImageSlot, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setSlotUploading(slot, true);
    try {
      const uploadedImage = await uploadImage(file, "WELCOME");
      setConfig((current) => ({
        ...current,
        [slot.urlKey]: uploadedImage.imageUrl,
        [slot.storageKey]: uploadedImage.imageStorageKey,
      }));
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : `Không thể tải ${slot.label.toLowerCase()}.`,
        type: "error",
      });
    } finally {
      setSlotUploading(slot, false);
    }
  };

  const clearImage = (slot: ImageSlot) => {
    setConfig((current) => ({ ...current, [slot.urlKey]: null, [slot.storageKey]: null }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (uploadingSlots.size > 0) {
      showToast({ message: "Hãy chờ ảnh tải xong trước khi lưu.", type: "warning" });
      return;
    }

    setIsSaving(true);
    try {
      const savedConfig = await saveStoreWelcomeConfig({ ...config, status: "ACTIVE" });
      setConfig(savedConfig);
      showToast({ message: "Đã lưu cấu hình trang Welcome.", type: "success" });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể lưu cấu hình Welcome.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs sm:p-8">
      <div className="flex flex-col gap-3 border-b border-cas-outline-variant/15 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-cas-primary/10 text-cas-primary">
            <CasIcon name="sparkle" className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-cas-on-surface">Trang Welcome</h2>
            <p className="text-xs text-cas-on-surface-variant">
              Quản lý 2 ảnh Hero, 5 ảnh menu và 1 banner hiển thị cho khách.
            </p>
          </div>
        </div>
      </div>

      <form className="mt-6 space-y-6" onSubmit={handleSave}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {imageSlots.map((slot) => {
            const imageUrl = config[slot.urlKey] as string | null;
            const isUploading = uploadingSlots.has(String(slot.urlKey));
            return (
              <article
                className={`overflow-hidden rounded-2xl border border-cas-outline-variant/35 bg-cas-surface ${slot.urlKey === "bannerImageUrl" ? "sm:col-span-2" : ""}`}
                key={String(slot.urlKey)}
              >
                <div
                  className={`relative bg-cas-surface-container ${slot.urlKey === "bannerImageUrl" ? "aspect-[11/4]" : "aspect-[16/9]"}`}
                >
                  {imageUrl ? (
                    <div
                      aria-label={slot.label}
                      className="size-full bg-cover bg-center"
                      role="img"
                      style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-2 text-cas-on-surface-variant">
                      <CasIcon name="sparkle" className="size-7 text-cas-primary" />
                      <span className="text-xs font-bold">Chưa có ảnh</span>
                    </div>
                  )}
                  {isUploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-cas-surface/85 text-cas-primary">
                      <span className="size-7 animate-spin rounded-full border-2 border-cas-primary/25 border-t-cas-primary" />
                    </div>
                  ) : null}
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="font-extrabold text-cas-on-surface">{slot.label}</h3>
                    <p className="mt-1 text-xs text-cas-on-surface-variant">{slot.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-cas-primary px-3 py-2 text-xs font-extrabold text-cas-on-primary transition hover:brightness-110">
                      <CasIcon name="edit" className="size-3.5" />
                      {imageUrl ? "Thay ảnh" : "Chọn ảnh"}
                      <input
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        disabled={isUploading || isSaving}
                        onChange={(event) => void handleImageChange(slot, event)}
                        type="file"
                      />
                    </label>
                    {imageUrl ? (
                      <CasButton
                        disabled={isUploading || isSaving}
                        icon="trash"
                        onClick={() => clearImage(slot)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        Bỏ ảnh
                      </CasButton>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-cas-outline-variant/15 pt-5">
          <CasButton
            disabled={isLoading || isSaving || uploadingSlots.size > 0}
            icon={
              isSaving ? (
                <span className="size-4 animate-spin rounded-full border-2 border-cas-on-primary/30 border-t-cas-on-primary" />
              ) : (
                "check"
              )
            }
            size="sm"
            type="submit"
          >
            {isSaving ? "Đang lưu..." : "Lưu trang Welcome"}
          </CasButton>
          <p className="text-xs text-cas-on-surface-variant">
            Ảnh cũ chỉ được xóa sau khi cấu hình mới được lưu thành công.
          </p>
        </div>
      </form>
    </section>
  );
}
