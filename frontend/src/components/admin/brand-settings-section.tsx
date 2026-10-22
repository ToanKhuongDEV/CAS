"use client";

import { useEffect, useState } from "react";

import { getCurrentOperationalAccount } from "../../lib/auth/operational-auth";
import { getFirebaseAuth } from "../../lib/auth/firebase";
import { uploadImage } from "../../lib/api/catalog/cloudinary-upload";
import { loadBrandSettings, updateBrandSettings } from "../../lib/api/store/store-settings.api";
import { CasButton } from "../ui/cas-button";
import { CasIcon } from "../ui/cas-icon";
import { useToast } from "../ui/toast-provider";

export function BrandSettingsSection() {
  const { showToast } = useToast();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [name, setName] = useState("");
  const [welcomeSlogan, setWelcomeSlogan] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoStorageKey, setLogoStorageKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const user = getFirebaseAuth().currentUser;
    if (!user) return;
    void getCurrentOperationalAccount(user)
      .then(async (account) => {
        if (account.role !== "SUPER_ADMIN") return;
        const brand = await loadBrandSettings();
        setIsSuperAdmin(true);
        setName(brand.name);
        setWelcomeSlogan(brand.welcomeSlogan ?? "");
        setLogoUrl(brand.logoUrl);
        setLogoStorageKey(brand.logoStorageKey);
      })
      .catch(() => undefined);
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await updateBrandSettings({
        name,
        logoUrl,
        logoStorageKey,
        welcomeSlogan: welcomeSlogan || null,
      });
      window.dispatchEvent(new Event("cas:brand-updated"));
      showToast({ message: "Đã lưu thương hiệu chung.", type: "success" });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể lưu thương hiệu chung.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadLogo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const uploaded = await uploadImage(file, "BRAND_LOGO");
      setLogoUrl(uploaded.imageUrl);
      setLogoStorageKey(uploaded.imageStorageKey);
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể tải logo lên.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (!isSuperAdmin) return null;

  return (
    <section className="rounded-sm border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs sm:p-8">
      <div className="flex items-center gap-3 border-b border-cas-outline-variant/15 pb-4">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-cas-primary/10 text-cas-primary">
          <CasIcon className="size-5" name="restaurant" />
        </div>
        <div>
          <h2 className="text-lg font-black text-cas-on-surface">Thương hiệu chung</h2>
          <p className="text-xs text-cas-on-surface-variant">
            Logo, tên và slogan này áp dụng cho toàn bộ cơ sở.
          </p>
        </div>
      </div>

      <form className="mt-6 space-y-5 text-xs" onSubmit={save}>
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-cas-primary/10 text-cas-primary">
            {logoUrl ? (
              <img alt="Logo thương hiệu" className="size-full object-cover" src={logoUrl} />
            ) : (
              <CasIcon className="size-8" name="restaurant" />
            )}
          </span>
          <label className="cursor-pointer rounded-xl border border-cas-outline-variant/40 px-3 py-2 font-extrabold text-cas-primary hover:bg-cas-primary/10">
            Tải logo chung
            <input
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="sr-only"
              onChange={uploadLogo}
              type="file"
            />
          </label>
          {logoUrl ? (
            <button
              className="font-bold text-cas-on-surface-variant hover:text-cas-on-surface"
              onClick={() => {
                setLogoUrl(null);
                setLogoStorageKey(null);
              }}
              type="button"
            >
              Bỏ logo
            </button>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block font-extrabold text-cas-on-surface" htmlFor="brand-name">
            Tên thương hiệu
          </label>
          <input
            className="w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3.5 py-2.5 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
            id="brand-name"
            maxLength={150}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </div>
        <div>
          <label className="mb-1 block font-extrabold text-cas-on-surface" htmlFor="brand-slogan">
            Slogan chung
          </label>
          <input
            className="w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3.5 py-2.5 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
            id="brand-slogan"
            maxLength={500}
            onChange={(event) => setWelcomeSlogan(event.target.value)}
            value={welcomeSlogan}
          />
        </div>
        <CasButton
          disabled={isSaving}
          icon={isSaving ? undefined : "check"}
          size="sm"
          type="submit"
          variant="primary"
        >
          {isSaving ? "Đang lưu..." : "Lưu thương hiệu chung"}
        </CasButton>
      </form>
    </section>
  );
}
