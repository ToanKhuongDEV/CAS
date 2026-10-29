"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { getCurrentOperationalAccount } from "../../lib/auth/operational-auth";
import { getFirebaseAuth } from "../../lib/auth/firebase";
import { uploadImage } from "../../lib/api/catalog/cloudinary-upload";
import {
  loadBrandSettings,
  loadStoreSettings,
  updateBrandSettings,
} from "../../lib/api/store/store-settings.api";
import { STORE_LOGO } from "../../lib/store-logo";
import { CasButton } from "../ui/cas-button";
import { CasIcon } from "../ui/cas-icon";
import { useToast } from "../ui/toast-provider";

export function BrandSettingsSection() {
  const { showToast } = useToast();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [name, setName] = useState("");
  const [welcomeSlogan, setWelcomeSlogan] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoStorageKey, setLogoStorageKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    let revision = 0;
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      const currentRevision = ++revision;
      setIsLoaded(false);
      setIsSuperAdmin(false);
      setLoadError("");
      if (!user) return;
      void getCurrentOperationalAccount(user)
        .then(async (account) => {
          if (account.role !== "SUPER_ADMIN" && account.role !== "ADMIN") return;
          const superAdmin = account.role === "SUPER_ADMIN";
          const brand = superAdmin ? await loadBrandSettings() : await loadStoreSettings();
          if (!active || currentRevision !== revision) return;
          setIsSuperAdmin(superAdmin);
          setName(
            superAdmin
              ? "name" in brand
                ? (brand.name ?? "")
                : ""
              : "brandName" in brand
                ? (brand.brandName ?? "")
                : "",
          );
          setWelcomeSlogan(brand.welcomeSlogan ?? "");
          setLogoUrl(brand.logoUrl);
          setLogoStorageKey(brand.logoStorageKey);
          setIsLoaded(true);
        })
        .catch((error) => {
          if (active && currentRevision === revision)
            setLoadError(
              error instanceof Error ? error.message : "Không thể tải thương hiệu chung.",
            );
        });
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!isLoaded || !isSuperAdmin) return;
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

  if (loadError)
    return (
      <p role="alert" className="text-sm text-cas-error">
        {loadError}
      </p>
    );
  if (!isLoaded) return null;

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
            <img alt="Logo thương hiệu" className="size-full object-cover" src={STORE_LOGO} />
          </span>
          <label className="cursor-not-allowed rounded-xl border border-cas-outline-variant/40 px-3 py-2 font-extrabold text-cas-on-surface-variant opacity-60">
            Tải logo chung
            <input
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="sr-only"
              disabled
              onChange={uploadLogo}
              type="file"
            />
          </label>
          {logoUrl ? (
            <button
              className="cursor-not-allowed font-bold text-cas-on-surface-variant opacity-60"
              disabled
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
            disabled={!isSuperAdmin}
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
            disabled={!isSuperAdmin}
            onChange={(event) => setWelcomeSlogan(event.target.value)}
            value={welcomeSlogan}
          />
        </div>
        <CasButton
          disabled={!isSuperAdmin || isSaving}
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
