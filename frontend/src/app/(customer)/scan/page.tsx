"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CasIcon } from "../../../components/ui/cas-icon";
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
  const [manualQrValue, setManualQrValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [tableCode, setTableCode] = useState("");
  const [tableResolution, setTableResolution] = useState<SalesSessionResolution | null>(null);
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
      const storeId = Number(params.get("storeId"));
      const resolution = await resolveCustomerSalesSession(token, {
        ...(Number.isSafeInteger(storeId) && storeId > 0 ? { storeId } : {}),
      });
      window.sessionStorage.setItem("cas.tableQrToken", token);
      if (resolution.sessionStatus === "PAYMENT_PENDING") {
        router.replace("/payment");
        return;
      }
      if (resolution.sessionStatus === "OPEN") {
        router.replace(params.get("returnTo") ?? "/menu");
        return;
      }
      router.replace(
        `/table/${encodeURIComponent(token)}?returnTo=${encodeURIComponent(params.get("returnTo") ?? "/menu")}`,
      );
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
    const normalizedTableCode = Number(tableCode);
    if (!storeId || !Number.isSafeInteger(normalizedTableCode) || normalizedTableCode <= 0) {
      showToast({ type: "error", message: "Vui lòng nhập số bàn hợp lệ." });
      return;
    }
    try {
      const resolution = await resolveCustomerSalesSessionByTable({
        storeId,
        tableCode: normalizedTableCode,
        ...input,
      });
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
    }
  }

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer = 0;
    const Detector = (
      window as typeof window & {
        BarcodeDetector?: new (options: { formats: string[] }) => BarcodeDetectorLike;
      }
    ).BarcodeDetector;
    if (!Detector) {
      setMessage(
        "Trình duyệt chưa hỗ trợ quét QR tự động. Hãy mở bằng Chrome hoặc nhập mã bên dưới.",
      );
      return;
    }
    void navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((next) => {
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
      window.clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

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
        if (result.length === 1) setStoreId(result[0].id);
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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6 text-center">
      <Link
        className="mb-6 inline-flex w-fit items-center gap-2 text-sm font-bold text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
        href={`/start?returnTo=${encodeURIComponent(params.get("returnTo") ?? "/menu")}`}
      >
        <CasIcon className="size-4 -scale-x-100" name="arrow" />
        Quay lại chọn loại đơn
      </Link>
      <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-cas-primary/10 text-cas-primary">
        <CasIcon className="size-8" name="table" />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold">Quét mã QR của bàn</h1>
      <p className="mt-2 text-sm text-cas-on-surface-variant">{message}</p>
      <video
        autoPlay
        className="mt-6 aspect-square w-full rounded-3xl bg-cas-surface-container object-cover"
        muted
        playsInline
        ref={video}
      />
      <form
        className="mt-5"
        onSubmit={(event) => {
          event.preventDefault();
          void open(manualQrValue);
        }}
      >
        <label className="text-left text-sm font-bold" htmlFor="manual-qr-token">
          Nhập mã QR của bàn
        </label>
        <input
          aria-describedby="manual-qr-help"
          className="mt-2 w-full rounded-xl border border-cas-outline-variant bg-cas-surface p-3 font-normal"
          id="manual-qr-token"
          onChange={(event) => setManualQrValue(event.target.value)}
          placeholder="Ví dụ: Q12345678 hoặc dán đường dẫn QR"
          ref={input}
          value={manualQrValue}
        />
        <p className="mt-2 text-left text-xs text-cas-on-surface-variant" id="manual-qr-help">
          Mã sẽ được kiểm tra trước khi chuyển sang bước tiếp theo.
        </p>
        <button
          className="mt-3 min-h-12 w-full rounded-xl bg-cas-primary px-4 text-sm font-extrabold text-cas-on-primary disabled:opacity-60"
          disabled={!manualQrValue.trim() || submitting}
          type="submit"
        >
          {submitting ? "Đang kiểm tra mã..." : "Tiếp tục"}
        </button>
      </form>
      <section className="mt-8 border-t border-cas-outline-variant pt-6 text-left">
        <h2 className="text-lg font-extrabold">Hoặc chọn số bàn</h2>
        <p className="mt-1 text-sm text-cas-on-surface-variant">
          Chọn cơ sở rồi nhập số bàn nếu không thể quét QR.
        </p>
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
              {stores.map((store) => (
                <button
                  aria-selected={store.id === storeId}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm leading-snug whitespace-normal break-words text-cas-on-surface hover:bg-cas-primary/10"
                  key={store.id}
                  onClick={() => {
                    setStoreId(store.id);
                    setIsStoreDropdownOpen(false);
                    setTableResolution(null);
                  }}
                  role="option"
                  type="button"
                >
                  <span className="block font-bold">{store.name}</span>
                  <span className="block text-xs text-cas-on-surface-variant">{store.address}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {!tableResolution ? (
          <>
            <label className="mt-4 block text-sm font-bold" htmlFor="table-code">
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
            <button
              className="mt-3 min-h-12 w-full rounded-xl bg-cas-primary px-4 font-extrabold text-cas-on-primary"
              onClick={() => void resolveManualTable()}
              type="button"
            >
              Tiếp tục với số bàn
            </button>
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
      <Link className="mt-6 font-bold text-cas-primary underline" href="/">
        Trở về trang chủ
      </Link>
    </main>
  );
}
