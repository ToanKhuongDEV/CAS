"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./scan.module.css";

import { CasIcon } from "../../../components/ui/cas-icon";
import { CasButton } from "../../../components/ui/cas-button";
import { CustomerInformationFormFields } from "../../../components/customer/customer-information-form-fields";
import { useToast } from "../../../components/ui/toast-provider";
import { loadCustomerNotifications } from "../../../lib/api/notification/notification.api";
import {
  loadPublicStores,
  rememberPublicStoreId,
  type PublicStore,
} from "../../../lib/api/store/public-store.api";
import {
  resolveCustomerSalesSession,
  resolveCustomerSalesSessionByTable,
  type SalesSessionResolution,
} from "../../../lib/customer/sales-session";

type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
};

function distanceInMeters(origin: GeolocationCoordinates, store: PublicStore) {
  if (store.latitude === null || store.longitude === null) return Number.POSITIVE_INFINITY;
  const radians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = radians(store.latitude - origin.latitude);
  const longitudeDelta = radians(store.longitude - origin.longitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(origin.latitude)) *
      Math.cos(radians(store.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 2 * 6_371_000 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export default function ScanTableQrPage() {
  const router = useRouter();
  const params = useSearchParams();
  const video = useRef<HTMLVideoElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const isResolving = useRef(false);
  const { showToast } = useToast();
  const [message, setMessage] = useState("Đưa mã QR của bàn vào khung camera.");
  const [scanMode, setScanMode] = useState(true);
  const [manualQrValue, setManualQrValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [tableCode, setTableCode] = useState("");
  const [tableResolution, setTableResolution] = useState<SalesSessionResolution | null>(null);
  const [resolvedQrToken, setResolvedQrToken] = useState<string | null>(null);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const storeDropdownReference = useRef<HTMLDivElement>(null);

  const selectedStore = stores.find((store) => store.id === storeId);

  async function open(raw: string) {
    if (isResolving.current) return;
    try {
      const path = new URL(raw, window.location.origin).pathname;
      const token = path.split("/").filter(Boolean).at(-1);
      if (!token) throw new Error();

      isResolving.current = true;
      setSubmitting(true);
      const resolution = await resolveCustomerSalesSession(token, {
        ...(storeId ? { storeId } : {}),
      });
      window.sessionStorage.setItem("cas.tableQrToken", token);
      if (resolution.customerInformationRequired || resolution.joinSessionRequired) {
        setResolvedQrToken(token);
        setTableResolution(resolution);
        return;
      }
      if (resolution.sessionStatus === "PAYMENT_PENDING") {
        router.replace("/payment");
        return;
      }
      if (resolution.sessionStatus === "OPEN") {
        router.replace(params.get("returnTo") ?? "/menu");
        return;
      }
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error && error.message.trim()
            ? error.message
            : "Không thể xác thực mã QR.",
      });
      input.current?.focus();
    } finally {
      isResolving.current = false;
      setSubmitting(false);
    }
  }

  async function resolveManualTable(input?: {
    customerName?: string;
    customerPhone?: string | null;
    joinSessionId?: string;
  }) {
    if (isResolving.current) return;
    const normalizedTableCode = Number(tableCode);
    if (
      !resolvedQrToken &&
      (!storeId || !Number.isSafeInteger(normalizedTableCode) || normalizedTableCode <= 0)
    ) {
      showToast({ type: "error", message: "Vui lòng nhập số bàn hợp lệ." });
      return;
    }
    try {
      isResolving.current = true;
      setSubmitting(true);
      let resolution: SalesSessionResolution;
      if (resolvedQrToken) {
        resolution = await resolveCustomerSalesSession(resolvedQrToken, {
          ...(storeId ? { storeId } : {}),
          ...input,
          sessionType: "DINE_IN",
        });
      } else {
        if (!storeId) return;
        resolution = await resolveCustomerSalesSessionByTable({
          storeId,
          tableCode: normalizedTableCode,
          ...input,
        });
      }
      if (resolution.customerInformationRequired || resolution.joinSessionRequired) {
        setTableResolution(resolution);
        return;
      }
      void loadCustomerNotifications().catch(() => undefined);
      router.replace(
        resolution.sessionStatus === "PAYMENT_PENDING"
          ? "/payment"
          : (params.get("returnTo") ?? "/menu"),
      );
    } catch (cause) {
      showToast({
        type: "error",
        message: cause instanceof Error ? cause.message : "Không thể xác thực bàn đã chọn.",
      });
    } finally {
      isResolving.current = false;
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!scanMode || tableResolution) return;
    let stream: MediaStream | null = null;
    let timer = 0;
    let active = true;
    const Detector = (
      window as typeof window & {
        BarcodeDetector?: new (options: { formats: string[] }) => BarcodeDetectorLike;
      }
    ).BarcodeDetector;
    if (!Detector) {
      setMessage("");
      return;
    }
    void navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((next) => {
        if (!active) {
          next.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = next;
        if (!video.current) return;
        video.current.srcObject = next;
        const detector = new Detector({ formats: ["qr_code"] });
        timer = window.setInterval(() => {
          if (video.current)
            void detector.detect(video.current).then((codes) => {
              if (codes[0]) void open(codes[0].rawValue);
            });
        }, 600);
      })
      .catch(() => setMessage("Không thể mở camera. Hãy cho phép quyền camera hoặc nhập mã QR."));
    return () => {
      active = false;
      window.clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [scanMode, storeId, tableResolution]);

  useEffect(() => {
    if (storeId || stores.length < 2 || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = stores
          .filter((store) => store.latitude !== null && store.longitude !== null)
          .toSorted(
            (left, right) =>
              distanceInMeters(position.coords, left) - distanceInMeters(position.coords, right),
          )[0];
        if (nearest) setStoreId(nearest.id);
      },
      () => undefined,
      { maximumAge: 300_000, timeout: 8_000 },
    );
  }, [storeId, stores]);

  useEffect(() => {
    if (storeId) rememberPublicStoreId(storeId);
  }, [storeId]);

  useEffect(() => {
    void loadPublicStores()
      .then((result) => {
        setStores(result);
        const requestedStoreId = Number(params.get("storeId"));
        if (result.some((store) => store.id === requestedStoreId)) setStoreId(requestedStoreId);
        else if (result.length === 1) setStoreId(result[0].id);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    function closeStoreDropdown(event: MouseEvent) {
      if (!storeDropdownReference.current?.contains(event.target as Node)) {
        setIsStoreDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", closeStoreDropdown);
    return () => document.removeEventListener("mousedown", closeStoreDropdown);
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 pt-24 pb-8">
      <Link
        className="mb-6 inline-flex w-fit items-center gap-2 text-sm font-bold text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
        href={`/start?returnTo=${encodeURIComponent(params.get("returnTo") ?? "/menu")}`}
      >
        <CasIcon className="size-4 -scale-x-100" name="arrow" />
        Quay lại chọn loại đơn
      </Link>
      <div className="mt-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Xác nhận vị trí bàn</h1>
        <span className="rounded-full bg-cas-primary/10 px-3 py-1 text-xs font-bold text-cas-primary">
          Bước 2 / 2
        </span>
      </div>
      <p className="mt-2 text-sm text-cas-on-surface-variant">
        Gọi món nhanh, phục vụ chu đáo tận bàn.
      </p>
      <nav
        aria-label="Phương thức nhập bàn"
        className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-cas-surface-container p-1"
      >
        <button
          aria-pressed={scanMode}
          className={`rounded-xl px-2 py-3 text-sm font-bold focus-visible:outline-3 focus-visible:outline-cas-focus-ring ${scanMode ? "bg-cas-surface text-cas-primary shadow-sm" : "text-cas-on-surface-variant"}`}
          onClick={() => setScanMode(true)}
          type="button"
        >
          Quét mã QR bàn
        </button>
        <button
          aria-pressed={!scanMode}
          className={`rounded-xl px-2 py-3 text-sm font-bold focus-visible:outline-3 focus-visible:outline-cas-focus-ring ${!scanMode ? "bg-cas-surface text-cas-primary shadow-sm" : "text-cas-on-surface-variant"}`}
          onClick={() => setScanMode(false)}
          type="button"
        >
          Nhập số bàn thủ công
        </button>
      </nav>
      {scanMode ? (
        <section className="mt-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-cas-on-surface">
            <video autoPlay className="size-full object-cover" muted playsInline ref={video} />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[20%] overflow-hidden text-cas-primary"
            >
              <span className="absolute top-0 left-0 size-8 rounded-tl-xl border-t-4 border-l-4" />
              <span className="absolute top-0 right-0 size-8 rounded-tr-xl border-t-4 border-r-4" />
              <span className="absolute bottom-0 left-0 size-8 rounded-bl-xl border-b-4 border-l-4" />
              <span className="absolute right-0 bottom-0 size-8 rounded-br-xl border-r-4 border-b-4" />
              <span
                className={`${styles.scanLine} absolute inset-x-2 top-1/2 h-1 bg-linear-to-r from-transparent via-cas-primary to-transparent`}
              />
            </div>
          </div>
          <p className="mt-4 text-center text-sm leading-relaxed text-cas-on-surface-variant">
            Căn chỉnh mã QR in trên bàn vào khung để tự động nhận diện.
          </p>
          {message ? (
            <p className="mt-2 text-center text-sm text-cas-on-surface-variant">{message}</p>
          ) : null}
        </section>
      ) : null}
      <div className="mt-6 flex items-center gap-3 text-xs font-bold tracking-wider text-cas-on-surface-variant uppercase">
        <span className="h-px flex-1 bg-cas-outline-variant" />
        Hoặc nhập chi tiết
        <span className="h-px flex-1 bg-cas-outline-variant" />
      </div>
      <section className="mt-4 rounded-2xl border border-cas-outline-variant/40 bg-cas-surface-container p-4 text-left">
        <h2 className="text-sm font-bold">Chi nhánh phục vụ</h2>
        <div className="relative mt-4 w-full" ref={storeDropdownReference}>
          <button
            aria-expanded={isStoreDropdownOpen}
            aria-haspopup="listbox"
            className="flex min-h-12 w-full items-center rounded-xl border border-cas-outline-variant bg-cas-surface px-3 text-left text-sm text-cas-on-surface"
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
              {stores.map((store) => (
                <button
                  aria-selected={store.id === storeId}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm leading-snug whitespace-normal break-words text-cas-on-surface hover:bg-cas-primary/10"
                  key={store.id}
                  onClick={() => {
                    setStoreId(store.id);
                    setIsStoreDropdownOpen(false);
                    setTableResolution(null);
                    setResolvedQrToken(null);
                  }}
                  role="option"
                  type="button"
                >
                  <span className="block font-bold">
                    {store.branchName ?? store.name ?? "Chi nhánh"}
                  </span>
                  <span className="block text-xs text-cas-on-surface-variant">{store.address}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {!tableResolution ? (
          <>
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-2 min-w-0">
                <label
                  className="mt-4 flex min-h-10 items-end text-sm font-bold"
                  htmlFor="table-code"
                >
                  Số bàn
                </label>
                <input
                  className="mt-2 min-h-12 w-full rounded-xl border border-cas-outline-variant bg-cas-surface px-3"
                  id="table-code"
                  inputMode="numeric"
                  onChange={(event) => setTableCode(event.target.value.replace(/\D/g, ""))}
                  pattern="[0-9]*"
                  placeholder="Ví dụ: 1"
                  type="text"
                  value={tableCode}
                />
              </div>
              <div className="col-span-3 min-w-0">
                <label
                  className="mt-4 flex min-h-10 flex-wrap items-end gap-x-1 text-sm font-bold"
                  htmlFor="manual-qr-token"
                >
                  Nhập mã QR của bàn{" "}
                  <span className="font-normal text-cas-on-surface-variant">(nếu có)</span>
                </label>
                <input
                  className="mt-2 min-h-12 w-full rounded-xl border border-cas-outline-variant bg-cas-surface px-3"
                  id="manual-qr-token"
                  onChange={(event) => setManualQrValue(event.target.value)}
                  placeholder="Mã hoặc đường dẫn QR"
                  ref={input}
                  value={manualQrValue}
                />
              </div>
            </div>
            <p className="mt-4 text-sm text-cas-on-surface-variant">
              Chọn cơ sở và nhập số bàn hoặc mã QR để tiếp tục.
            </p>
            <CasButton
              className="mt-3 min-h-12 w-full rounded-xl"
              onClick={() =>
                manualQrValue.trim() ? void open(manualQrValue) : void resolveManualTable()
              }
              disabled={submitting}
              type="button"
            >
              {submitting ? "Đang kiểm tra mã..." : "Xác nhận vào bàn gọi món"}
            </CasButton>
          </>
        ) : null}
        {tableResolution?.customerInformationRequired ? (
          <div className="mt-4">
            <CustomerInformationFormFields
              onSubmitCustomerInfo={(information) => void resolveManualTable(information)}
              phoneRequired={false}
            />
          </div>
        ) : null}
        {tableResolution?.joinSessionRequired ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-cas-on-surface-variant">
              Bạn có đang chung bàn với ai dưới đây không?
            </p>
            {tableResolution.joinableSessions.map((session) => (
              <button
                className="flex w-full items-center justify-between rounded-xl border border-cas-outline-variant px-4 py-3 text-left"
                key={session.sessionId}
                onClick={() => void resolveManualTable({ joinSessionId: session.sessionId })}
                type="button"
              >
                <span className="font-bold">{session.customerName}</span>
                <span className="text-sm font-bold text-cas-primary">Chung bàn</span>
              </button>
            ))}
            <button
              className="w-full rounded-xl border border-cas-outline-variant px-4 py-3 text-sm font-bold"
              onClick={() =>
                setTableResolution((current) =>
                  current
                    ? { ...current, customerInformationRequired: true, joinSessionRequired: false }
                    : current,
                )
              }
              type="button"
            >
              Không chung bàn
            </button>
          </div>
        ) : null}
      </section>
      <p className="mt-5 text-center text-sm font-bold text-cas-primary">
        {selectedStore?.phone ? (
          <a
            className="inline-flex items-center gap-2 underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
            href={`tel:${selectedStore.phone}`}
          >
            <CasIcon className="size-4" name="phone" />
            Không tìm thấy mã bàn? Bấm gọi phục vụ ngay
          </a>
        ) : (
          "Không tìm thấy mã bàn? Vui lòng liên hệ nhân viên phục vụ."
        )}
      </p>
      <Link className="mt-6 font-bold text-cas-primary underline" href="/">
        Trở về trang chủ
      </Link>
    </main>
  );
}
