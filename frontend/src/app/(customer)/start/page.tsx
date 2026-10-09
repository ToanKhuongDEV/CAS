"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { CustomerInformationFormFields } from "../../../components/customer/customer-information-form-fields";
import { CasIcon } from "../../../components/ui/cas-icon";
import {
  loadPublicStore,
  loadPublicStores,
  rememberPublicStoreId,
  type PublicStore,
} from "../../../lib/api/store/public-store.api";
import type { StoreSettings } from "../../../lib/api/store/store-settings.api";
import { openCustomerTakeawaySalesSession } from "../../../lib/customer/sales-session";

const earthRadiusMeters = 6_371_000;

function distanceInMeters(
  origin: GeolocationCoordinates,
  store: Pick<PublicStore, "latitude" | "longitude">,
) {
  if (store.latitude === null || store.longitude === null) return Number.POSITIVE_INFINITY;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(store.latitude - origin.latitude);
  const longitudeDelta = toRadians(store.longitude - origin.longitude);
  const latitudeOrigin = toRadians(origin.latitude);
  const latitudeStore = toRadians(store.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeOrigin) * Math.cos(latitudeStore) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export default function StartOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [store, setStore] = useState<Pick<StoreSettings, "name" | "logoUrl"> | null>(null);
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const storeDropdownReference = useRef<HTMLDivElement>(null);

  function destination() {
    const returnTo = searchParams.get("returnTo");
    return returnTo?.startsWith("/") ? returnTo : "/menu";
  }

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

  useEffect(() => {
    if (storeId || stores.length === 0) return;
    const requestedStoreId = Number(searchParams.get("storeId"));
    if (
      Number.isSafeInteger(requestedStoreId) &&
      stores.some((store) => store.id === requestedStoreId)
    ) {
      setStoreId(requestedStoreId);
      return;
    }
    if (stores.length === 1) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearestStore = stores
          .filter((store) => store.latitude !== null && store.longitude !== null)
          .toSorted(
            (left, right) =>
              distanceInMeters(position.coords, left) - distanceInMeters(position.coords, right),
          )[0];
        if (nearestStore) setStoreId(nearestStore.id);
      },
      () => undefined,
      { maximumAge: 300_000, timeout: 8_000 },
    );
  }, [searchParams, storeId, stores]);

  useEffect(() => {
    if (storeId) rememberPublicStoreId(storeId);
  }, [storeId]);

  useEffect(() => {
    const effectiveStoreId = storeId ?? stores[0]?.id;
    if (!effectiveStoreId) return;

    let active = true;
    void loadPublicStore(effectiveStoreId)
      .then((nextStore) => {
        if (active) setStore(nextStore);
      })
      .catch(() => {
        if (active) setStore(null);
      });
    return () => {
      active = false;
    };
  }, [storeId, stores]);

  useEffect(() => {
    function closeStoreDropdown(event: MouseEvent) {
      if (!storeDropdownReference.current?.contains(event.target as Node)) {
        setIsStoreDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", closeStoreDropdown);
    return () => document.removeEventListener("mousedown", closeStoreDropdown);
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
      router.push(destination());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tạo đơn mang về.");
    }
  }

  const selectedStore = stores.find((candidate) => candidate.id === storeId);

  if (error && stores.length === 0) return <main className="p-6 text-cas-error">{error}</main>;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <Link
        className="mb-6 inline-flex w-fit items-center gap-2 text-sm font-bold text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
        href="/"
      >
        <CasIcon className="size-4 -scale-x-100" name="arrow" />
        Quay lại
      </Link>
      <div className="flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-cas-primary/10 text-lg font-extrabold text-cas-primary">
          {store?.logoUrl ? (
            <img
              alt={`Logo ${store.name}`}
              className="size-full object-cover"
              src={store.logoUrl}
            />
          ) : (
            store?.name.slice(0, 1)
          )}
        </span>
        <p className="text-xl leading-tight font-extrabold text-cas-primary">
          {store?.name ?? "Đang tải cửa hàng..."}
        </p>
      </div>
      <h1 className="mt-6 text-2xl font-extrabold">
        {orderType === "TAKEAWAY" ? "Mang về" : "Bắt đầu gọi món"}
      </h1>
      <p className="mt-2 text-sm text-cas-on-surface-variant">Chọn hình thức phục vụ.</p>
      {!orderType ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            className="min-h-20 rounded-xl bg-cas-primary px-3 font-bold text-cas-on-primary"
            onClick={() => {
              router.push(`/scan?returnTo=${encodeURIComponent(destination())}`);
            }}
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
      ) : orderType === "TAKEAWAY" ? (
        <>
          <p className="mt-6 text-sm font-bold" id="store-label">
            Chi nhánh
          </p>
          <div className="relative mt-2 w-full" ref={storeDropdownReference}>
            <button
              aria-expanded={isStoreDropdownOpen}
              aria-haspopup="listbox"
              aria-labelledby="store-label"
              className="flex min-h-12 w-full items-center rounded-xl border border-cas-outline-variant bg-cas-surface px-3 text-left text-sm text-cas-on-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
              onClick={() => setIsStoreDropdownOpen((current) => !current)}
              type="button"
            >
              <span className="min-w-0 flex-1 whitespace-normal break-words">
                {selectedStore
                  ? `${selectedStore.name} — ${selectedStore.address}`
                  : "Chọn chi nhánh"}
              </span>
              <span aria-hidden="true" className="ml-3 shrink-0 text-cas-on-surface-variant">
                ▾
              </span>
            </button>
            {isStoreDropdownOpen ? (
              <div
                className="absolute inset-x-0 z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-cas-outline-variant bg-cas-surface p-1 shadow-[0_10px_28px_var(--cas-shadow-color)]"
                role="listbox"
              >
                {stores.map((candidate) => (
                  <button
                    aria-selected={candidate.id === storeId}
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm leading-snug whitespace-normal break-words text-cas-on-surface transition hover:bg-cas-primary/10 focus-visible:bg-cas-primary/10 focus-visible:outline-none"
                    key={candidate.id}
                    onClick={() => {
                      setStoreId(candidate.id);
                      setIsStoreDropdownOpen(false);
                    }}
                    role="option"
                    type="button"
                  >
                    <span className="block font-bold">{candidate.name}</span>
                    <span className="mt-0.5 block text-xs text-cas-on-surface-variant">
                      {candidate.address}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </>
      ) : null}
      {orderType === "TAKEAWAY" && storeId ? (
        <div className="mt-5">
          <CustomerInformationFormFields
            onSubmitCustomerInfo={createTakeaway}
            phoneRequired
            submitLabel="Tạo đơn mang về"
          />
        </div>
      ) : null}
      {orderType === "TAKEAWAY" ? (
        <button
          className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-bold text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
          onClick={() => {
            setOrderType(null);
            setError(null);
          }}
          type="button"
        >
          <CasIcon className="size-4 -scale-x-100" name="arrow" />
          Quay lại chọn loại đơn
        </button>
      ) : null}
      {error ? <p className="mt-3 text-sm text-cas-error">{error}</p> : null}
    </main>
  );
}
