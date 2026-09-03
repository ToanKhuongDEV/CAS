"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CasIcon } from "../../../components/ui/cas-icon";

type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
};

export default function ScanTableQrPage() {
  const router = useRouter();
  const params = useSearchParams();
  const video = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState("Đưa mã QR của bàn vào khung camera.");

  function open(raw: string) {
    try {
      const path = new URL(raw, window.location.origin).pathname;
      const token = path.split("/").filter(Boolean).at(-1);
      if (!token) throw new Error();
      window.sessionStorage.setItem("cas.tableQrToken", token);
      router.replace(
        `/table/${encodeURIComponent(token)}?returnTo=${encodeURIComponent(params.get("returnTo") ?? "/menu")}`,
      );
    } catch {
      setMessage("Mã QR không hợp lệ. Hãy quét mã QR của bàn CAS.");
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
              if (codes[0]) open(codes[0].rawValue);
            });
        }, 600);
      })
      .catch(() => setMessage("Không thể mở camera. Hãy cho phép quyền camera hoặc nhập mã QR."));
    return () => {
      window.clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6 text-center">
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
      <label className="mt-5 text-left text-sm font-bold">
        Nhập mã QR của bàn
        <input
          className="mt-2 w-full rounded-xl border border-cas-outline-variant bg-cas-surface p-3 font-normal"
          onKeyDown={(event) => {
            if (event.key === "Enter") open(event.currentTarget.value);
          }}
          placeholder="Ví dụ: Q12345678 hoặc dán đường dẫn QR"
        />
      </label>
      <Link className="mt-6 font-bold text-cas-primary underline" href="/">
        Trở về trang chủ
      </Link>
    </main>
  );
}
