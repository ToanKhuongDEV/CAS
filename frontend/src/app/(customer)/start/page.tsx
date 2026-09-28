"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CustomerInformationFormFields } from "../../../components/customer/customer-information-form-fields";
import { CasIcon } from "../../../components/ui/cas-icon";
import { loadPublicStores, type PublicStore } from "../../../lib/api/store/public-store.api";
import { openCustomerTakeawaySalesSession } from "../../../lib/customer/sales-session";

export default function StartOrderPage() {
  const router = useRouter();
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadPublicStores()
      .then((result) => {
        setStores(result);
        if (result.length === 1) setStoreId(result[0].id);
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Không thể tải chi nhánh."),
      );
  }, []);

  async function createTakeaway(input: { customerName: string; customerPhone: string | null }) {
    if (!storeId || !input.customerPhone) return;
    try {
      setError(null);
      await openCustomerTakeawaySalesSession({
        ...input,
        customerPhone: input.customerPhone,
        storeId,
      });
      router.push("/menu");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tạo đơn mang về.");
    }
  }

  if (error && stores.length === 0) return <main className="p-6 text-cas-error">{error}</main>;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <span className="grid size-14 place-items-center rounded-2xl bg-cas-primary/10 text-cas-primary">
        <CasIcon className="size-7" name="restaurant" />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold">Bắt đầu gọi món</h1>
      <p className="mt-2 text-sm text-cas-on-surface-variant">
        Chọn chi nhánh và hình thức phục vụ.
      </p>
      <label className="mt-6 text-sm font-bold" htmlFor="store">
        Chi nhánh
      </label>
      <select
        className="mt-2 min-h-12 rounded-xl border border-cas-outline-variant bg-cas-surface px-3"
        id="store"
        onChange={(event) => setStoreId(Number(event.target.value) || null)}
        value={storeId ?? ""}
      >
        <option value="">Chọn chi nhánh</option>
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name} — {store.address}
          </option>
        ))}
      </select>
      {storeId && !orderType ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            className="min-h-20 rounded-xl bg-cas-primary px-3 font-bold text-cas-on-primary"
            onClick={() => setOrderType("DINE_IN")}
            type="button"
          >
            Ăn tại quán
          </button>
          <button
            className="min-h-20 rounded-xl border border-cas-primary px-3 font-bold text-cas-primary"
            onClick={() => setOrderType("TAKEAWAY")}
            type="button"
          >
            Mang về
          </button>
        </div>
      ) : null}
      {orderType === "DINE_IN" ? (
        <button
          className="mt-5 min-h-12 rounded-xl bg-cas-primary px-4 font-bold text-cas-on-primary"
          onClick={() => router.push(`/scan?storeId=${storeId}`)}
          type="button"
        >
          Quét mã QR bàn
        </button>
      ) : null}
      {orderType === "TAKEAWAY" ? (
        <div className="mt-5">
          <CustomerInformationFormFields
            onSubmitCustomerInfo={createTakeaway}
            phoneRequired
            submitLabel="Tạo đơn mang về"
          />
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm text-cas-error">{error}</p> : null}
    </main>
  );
}
