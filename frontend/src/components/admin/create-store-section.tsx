"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  copyStoreMenu,
  createStore,
  loadAdminStores,
  type AdminStore,
} from "../../lib/api/store/store-settings.api";
import { getFirebaseAuth } from "../../lib/auth/firebase";
import { getCurrentOperationalAccount } from "../../lib/auth/operational-auth";
import { CasButton } from "../ui/cas-button";
import { useToast } from "../ui/toast-provider";

export function CreateStoreSection() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [storesError, setStoresError] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    let active = true;
    let revision = 0;
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      const current = ++revision;
      setIsSuperAdmin(false);
      if (!user) return;
      void getCurrentOperationalAccount(user)
        .then((account) => {
          if (active && current === revision) setIsSuperAdmin(account.role === "SUPER_ADMIN");
        })
        .catch(() => undefined);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let active = true;
    function refresh() {
      void loadAdminStores()
        .then((items) => {
          if (active) {
            setStores(items);
            setStoresError("");
          }
        })
        .catch(() => {
          if (active) setStoresError("Không thể tải danh sách chi nhánh.");
        });
    }
    refresh();
    window.addEventListener("cas:stores-updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("cas:stores-updated", refresh);
    };
  }, [isSuperAdmin]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setSaving(true);
    try {
      await createStore({
        branchName: String(data.get("branchName")).trim(),
        address: String(data.get("address")).trim(),
        phone: String(data.get("phone")).trim(),
        email: String(data.get("email")).trim(),
        googleMapsLocation: String(data.get("googleMapsLocation")).trim() || null,
        openTime: String(data.get("openTime")),
        closeTime: String(data.get("closeTime")),
      });
      form.reset();
      window.dispatchEvent(new Event("cas:stores-updated"));
      showToast({ message: "Đã tạo chi nhánh.", type: "success" });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể tạo chi nhánh.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function copyMenu(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (copying || !sourceId || !targetId || sourceId === targetId) return;
    setCopying(true);
    try {
      await copyStoreMenu(Number(sourceId), Number(targetId));
      showToast({ message: "Đã sao chép thực đơn.", type: "success" });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể sao chép thực đơn.",
        type: "error",
      });
    } finally {
      setCopying(false);
    }
  }

  if (!isSuperAdmin) return null;
  const inputClass =
    "w-full rounded-lg border border-cas-outline-variant bg-cas-surface px-3 py-2 text-cas-on-surface";
  return (
    <section className="rounded-sm border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs sm:p-8">
      <h2 className="text-lg font-black text-cas-on-surface">Tạo chi nhánh</h2>
      <form className="mt-4 grid gap-4 text-sm sm:grid-cols-2" onSubmit={submit}>
        {(
          [
            ["branchName", "Tên chi nhánh", "text", 150],
            ["address", "Địa chỉ", "text", 500],
            ["phone", "Số điện thoại", "tel", 20],
            ["email", "Email", "email", 254],
            ["googleMapsLocation", "Google Maps (không bắt buộc)", "url", 2048],
            ["openTime", "Giờ mở cửa", "time", undefined],
            ["closeTime", "Giờ đóng cửa", "time", undefined],
          ] as const
        ).map(([name, label, type, maxLength]) => (
          <label className="space-y-1 font-bold" key={name}>
            <span>{label}</span>
            <input
              className={inputClass}
              name={name}
              type={type}
              maxLength={maxLength}
              required={name !== "googleMapsLocation"}
            />
          </label>
        ))}
        <div className="sm:col-span-2">
          <CasButton disabled={saving} type="submit">
            {saving ? "Đang tạo..." : "Tạo chi nhánh"}
          </CasButton>
        </div>
      </form>
      <form
        className="mt-8 grid gap-4 border-t border-cas-outline-variant/30 pt-6 text-sm sm:grid-cols-2"
        onSubmit={copyMenu}
      >
        <h3 className="text-lg font-black sm:col-span-2">Sao chép thực đơn</h3>
        <p className="text-cas-on-surface-variant sm:col-span-2">
          Chỉ sao chép vào chi nhánh chưa có thực đơn.
        </p>
        {storesError && (
          <p role="alert" className="text-cas-error sm:col-span-2">
            {storesError}
          </p>
        )}
        <label className="space-y-1 font-bold">
          <span>Chi nhánh nguồn</span>
          <select
            className={inputClass}
            value={sourceId}
            onChange={(event) => setSourceId(event.target.value)}
            required
          >
            <option value="">Chọn chi nhánh</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.branchName ?? store.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 font-bold">
          <span>Chi nhánh đích</span>
          <select
            className={inputClass}
            value={targetId}
            onChange={(event) => setTargetId(event.target.value)}
            required
          >
            <option value="">Chọn chi nhánh</option>
            {stores
              .filter((store) => String(store.id) !== sourceId)
              .map((store) => (
                <option key={store.id} value={store.id}>
                  {store.branchName ?? store.name}
                </option>
              ))}
          </select>
        </label>
        <div className="sm:col-span-2">
          <CasButton
            disabled={copying || !sourceId || !targetId || sourceId === targetId}
            type="submit"
          >
            {copying ? "Đang sao chép..." : "Sao chép thực đơn"}
          </CasButton>
        </div>
      </form>
    </section>
  );
}
