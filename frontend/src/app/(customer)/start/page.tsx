"use client";

import Link from "next/link";
import { STORE_LOGO } from "../../../lib/store-logo";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { CustomerInformationFormFields } from "../../../components/customer/customer-information-form-fields";
import { CasIcon } from "../../../components/ui/cas-icon";
import { CasButton } from "../../../components/ui/cas-button";
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
  const [loadedStore, setLoadedStore] = useState<{ id: number; details: StoreSettings } | null>(
    null,
  );
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY">("DINE_IN");
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
        if (active) setLoadedStore({ id: effectiveStoreId, details: nextStore });
      })
      .catch(() => {
        if (active) setLoadedStore(null);
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
  const store =
    loadedStore && loadedStore.id === (storeId ?? stores[0]?.id) ? loadedStore.details : null;
  const selectedStoreDetails = loadedStore?.id === storeId ? loadedStore.details : null;

  if (error && stores.length === 0) return <main className="p-6 text-cas-error">{error}</main>;
  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pt-24 pb-8">
      <Link
        className="mb-6 inline-flex w-fit items-center gap-2 text-sm font-bold text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
        href="/"
      >
        <CasIcon className="size-4 -scale-x-100" name="arrow" />
        Quay lại trang chủ
      </Link>
      <div className="flex items-center gap-4 rounded-2xl border border-cas-outline-variant/40 bg-cas-surface-container p-4">
        <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-cas-primary/10 text-lg font-extrabold text-cas-primary">
          <img
            alt={`Logo ${store?.brandName ?? store?.branchName ?? "CAS"}`}
            className="size-full object-cover"
            src={STORE_LOGO}
          />
        </span>
        <div>
          <p className="font-extrabold">
            {store?.brandName ? `Chào mừng bạn đến với ${store.brandName}!` : "Chào mừng bạn!"}
          </p>
          <p className="mt-1 text-sm text-cas-on-surface-variant">
            Vui lòng chọn hình thức dùng món và xác nhận chi nhánh để bắt đầu gọi món.
          </p>
          {store?.welcomeSlogan ? (
            <p className="mt-1 text-sm font-bold text-cas-primary">{store.welcomeSlogan}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold">Hình thức phục vụ</h1>
        <span className="rounded-full bg-cas-primary/10 px-3 py-1 text-xs font-bold text-cas-primary">
          Bước 1 / {orderType === "DINE_IN" ? 2 : 1}
        </span>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3" aria-label="Hình thức phục vụ">
        <button
          aria-pressed={orderType === "DINE_IN"}
          className={`flex min-h-32 flex-col items-start gap-3 rounded-2xl border p-4 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring ${orderType === "DINE_IN" ? "border-cas-primary bg-cas-primary/10 text-cas-primary" : "border-cas-outline-variant bg-cas-surface-container"}`}
          onClick={() => setOrderType("DINE_IN")}
          type="button"
        >
          <CasIcon className="size-7" name="restaurant" />
          <span className="font-bold">Ăn tại quán</span>
          <span className="text-sm text-cas-on-surface-variant">
            Dùng trực tiếp, phục vụ chu đáo ngay tại bàn
          </span>
        </button>
        <button
          aria-pressed={orderType === "TAKEAWAY"}
          className={`flex min-h-32 flex-col items-start gap-3 rounded-2xl border p-4 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring ${orderType === "TAKEAWAY" ? "border-cas-primary bg-cas-primary/10 text-cas-primary" : "border-cas-outline-variant bg-cas-surface-container"}`}
          onClick={() => setOrderType("TAKEAWAY")}
          type="button"
        >
          <CasIcon className="size-7" name="basket" />
          <span className="font-bold">Mang về</span>
          <span className="text-sm text-cas-on-surface-variant">Đặt món để mang về</span>
        </button>
      </div>
      <section className="mt-6 rounded-2xl border border-cas-outline-variant/40 bg-cas-surface-container p-4">
        <p className="text-sm font-bold" id="store-label">
          Chi nhánh phục vụ
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
                ? `${selectedStore.branchName ?? selectedStore.name ?? "Chi nhánh"} — ${selectedStore.address}`
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
                  <span className="block font-bold">{candidate.branchName ?? candidate.name}</span>
                  <span className="mt-0.5 block text-xs text-cas-on-surface-variant">
                    {candidate.address}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {selectedStore ? (
          <div className="mt-4 space-y-2 border-t border-cas-outline-variant/40 pt-4 text-sm text-cas-on-surface-variant">
            <p>
              <span className="font-bold text-cas-on-surface">Địa chỉ: </span>
              {selectedStore.address}
            </p>
            {selectedStoreDetails?.openTime && selectedStoreDetails.closeTime ? (
              <p>
                <span className="font-bold text-cas-on-surface">Giờ mở cửa: </span>
                {selectedStoreDetails.openTime.slice(0, 5)} –{" "}
                {selectedStoreDetails.closeTime.slice(0, 5)}
              </p>
            ) : null}
            {selectedStoreDetails?.googleMapsLocation &&
            /^https?:\/\//i.test(selectedStoreDetails.googleMapsLocation) ? (
              <a
                className="inline-block font-bold text-cas-primary underline"
                href={selectedStoreDetails.googleMapsLocation}
                target="_blank"
                rel="noopener noreferrer"
              >
                Xem bản đồ
              </a>
            ) : null}
          </div>
        ) : null}
      </section>
      {orderType === "DINE_IN" ? (
        <>
          {!selectedStore ? (
            <p className="mt-4 text-sm text-cas-on-surface-variant">
              Vui lòng chọn chi nhánh để tiếp tục.
            </p>
          ) : null}
          <CasButton
            className="mt-6 min-h-12 w-full rounded-xl"
            disabled={!selectedStore}
            onClick={() =>
              router.push(
                `/scan?returnTo=${encodeURIComponent(destination())}${storeId ? `&storeId=${storeId}` : ""}`,
              )
            }
            type="button"
          >
            Tiếp tục chọn bàn
          </CasButton>
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
      <Link
        className="mt-5 block text-center text-sm font-bold text-cas-primary underline"
        href="/menu"
      >
        Khám phá toàn bộ thực đơn trước
      </Link>
      {error ? <p className="mt-3 text-sm text-cas-error">{error}</p> : null}
    </main>
  );
}
