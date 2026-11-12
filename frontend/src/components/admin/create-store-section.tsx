"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import {
  createStore,
  loadAdminStores,
  type AdminStore,
} from "../../lib/api/store/store-settings.api";
import { getFirebaseAuth } from "../../lib/auth/firebase";
import { getCurrentOperationalAccount } from "../../lib/auth/operational-auth";
import { CasButton } from "../ui/cas-button";
import { MaterialSymbol } from "../ui/material-symbol";
import { useToast } from "../ui/toast-provider";

export function CreateStoreSection() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [storesError, setStoresError] = useState("");
  const [sourceId, setSourceId] = useState("");
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
    if (savingRef.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setSaving(true);
    savingRef.current = true;
    try {
      await createStore({
        branchName: String(data.get("branchName")).trim(),
        address: String(data.get("address")).trim(),
        phone: String(data.get("phone")).trim(),
        email: String(data.get("email")).trim(),
        googleMapsLocation: String(data.get("googleMapsLocation")).trim() || null,
        openTime: String(data.get("openTime")),
        closeTime: String(data.get("closeTime")),
        sourceStoreId: sourceId ? Number(sourceId) : null,
      });
      form.reset();
      setSourceId("");
      window.dispatchEvent(new Event("cas:stores-updated"));
      showToast({
        message: sourceId ? "Đã tạo chi nhánh và sao chép thực đơn." : "Đã tạo chi nhánh.",
        type: "success",
      });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể tạo chi nhánh.",
        type: "error",
      });
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  }

  if (!isSuperAdmin) return null;
  const inputClass =
    "w-full rounded-lg border border-cas-outline-variant bg-cas-surface px-3 py-2 text-cas-on-surface";
  return (
    <section className="rounded-2xl border border-cas-outline-variant/30 bg-cas-surface-container p-5 shadow-xs sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cas-primary/10 text-cas-primary">
          <MaterialSymbol name="add_business" />
        </span>
        <h2 className="text-lg font-black text-cas-on-surface">Tạo chi nhánh</h2>
      </div>
      <form className="mt-4 grid gap-4 text-sm sm:grid-cols-6" onSubmit={submit}>
        {(
          [
            ["branchName", "Tên chi nhánh", "text", 150, "sm:col-span-2"],
            ["address", "Địa chỉ", "text", 500, "sm:col-span-4"],
            ["phone", "Số điện thoại", "tel", 20, "sm:col-span-2"],
            ["openTime", "Giờ mở cửa", "time", undefined, "sm:col-span-2"],
            ["closeTime", "Giờ đóng cửa", "time", undefined, "sm:col-span-2"],
            ["googleMapsLocation", "Google Maps (không bắt buộc)", "url", 2048, "sm:col-span-6"],
            ["email", "Email", "email", 254, "sm:col-span-3"],
          ] as const
        ).map(([name, label, type, maxLength, width]) => (
          <label className={`min-w-0 space-y-1 font-bold ${width}`} key={name}>
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
        <label className="min-w-0 space-y-1 font-bold sm:col-span-3">
          <span>Sao chép thực đơn từ chi nhánh</span>
          <select
            className={inputClass}
            value={sourceId}
            onChange={(event) => setSourceId(event.target.value)}
            disabled={saving}
          >
            <option value="">Không sao chép thực đơn</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.branchName ?? store.name}
              </option>
            ))}
          </select>
        </label>
        {storesError && (
          <p role="alert" className="text-cas-error sm:col-span-6">
            {storesError}
          </p>
        )}
        <div className="sm:col-span-6">
          <CasButton disabled={saving} type="submit">
            {saving ? "Đang tạo..." : "Tạo chi nhánh"}
          </CasButton>
        </div>
      </form>
    </section>
  );
}
