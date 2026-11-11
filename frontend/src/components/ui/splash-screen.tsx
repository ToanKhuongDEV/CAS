"use client";

import { useEffect, useState } from "react";

import { CasIcon } from "./cas-icon";

export function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const startedAt = Date.now();
    let readyAt: number | null = null;
    let readyProgress = 0;
    const markReady = () => {
      if (readyAt !== null) return;
      readyAt = Date.now();
      readyProgress = Math.min(99, ((readyAt - startedAt) / 5000) * 99);
    };

    if (document.readyState === "complete") markReady();
    else window.addEventListener("load", markReady);

    const timer = window.setInterval(() => {
      const now = Date.now();
      if (readyAt === null) {
        setProgress(Math.min(99, ((now - startedAt) / 5000) * 99));
      } else {
        const completion = Math.min(1, (now - readyAt) / 500);
        setProgress(readyProgress + (100 - readyProgress) * completion);
        if (completion === 1) {
          window.clearInterval(timer);
          setFinished(true);
        }
      }
    }, 50);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("load", markReady);
    };
  }, []);

  if (finished) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-gradient-to-b from-cas-garden-deep via-cas-garden-mid to-cas-garden-dark text-cas-on-scrim">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full text-cas-garden-mint/20"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 400 850"
      >
        <path
          d="M-20 900C15 650 5 420-15 180S-10 0-10 0M420 880C380 620 395 380 415 80"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="14"
        />
        <path
          d="M-15 680Q10 670 12 684M-2 460Q20 452 24 464M-20 240Q0 230 4 242M382 600Q410 592 418 604M388 360Q416 350 422 364"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <path
          d="M12 460C60 440 95 400 115 360C80 390 40 430 12 460ZM10 462C40 490 85 510 130 520C85 490 50 475 10 462ZM-10 240C35 210 70 180 90 130C60 170 25 200-10 240ZM385 600C330 580 290 530 270 480C305 520 350 565 385 600ZM388 598C340 630 295 650 240 660C290 635 340 615 388 598Z"
          fill="currentColor"
        />
      </svg>
      <div className="relative flex min-h-dvh flex-col items-center px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 rounded-full bg-cas-on-scrim/10 px-4 py-2 text-center text-xs font-bold tracking-widest text-cas-garden-mint uppercase">
          <span className="size-1.5 rounded-full bg-cas-garden-mint motion-safe:animate-pulse" />
          Cafee đồ ngọt chill chill
        </div>

        <div className="my-auto flex w-full max-w-xs flex-col items-center py-8 text-center">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-cas-garden-mint via-cas-garden-peach to-cas-garden-mint opacity-40 blur-md motion-safe:animate-pulse" />
            <div className="relative grid size-32 place-items-center rounded-full bg-gradient-to-b from-cas-on-scrim/40 via-cas-garden-mint/20 to-cas-garden-dark/50 p-1 shadow-2xl">
              <img
                alt="Logo Bambu Garden"
                className="size-full rounded-full object-cover"
                src="/images/bambu-garden-logo.png"
              />
            </div>
            <span
              className="absolute -right-1 -bottom-1 -translate-y-[5px] text-cas-garden-mint drop-shadow-lg"
              aria-hidden="true"
            >
              <svg
                className="size-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4.5 12a1.3 1.3 0 0 1 1.84-1.84l3.15 3.15 8.16-8.16a1.3 1.3 0 0 1 1.84 1.84l-9.08 9.08a1.3 1.3 0 0 1-1.84 0Z" />
              </svg>
            </span>
          </div>
          <p className="mt-8 flex flex-wrap justify-center gap-x-2 text-[1.375rem] font-extrabold tracking-[0.22em] uppercase">
            <span>Bambu</span>
            <span>Garden</span>
          </p>
          <p className="mt-4 max-w-65 text-sm leading-relaxed text-cas-on-scrim/90">
            Món ngon gọi nhanh, vui trọn từng bàn
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-[0.6875rem] font-bold text-cas-garden-mint/80">
            <span className="rounded-full bg-cas-garden-green/40 px-2.5 py-1">Sảng khoái</span>
            <span className="rounded-full bg-cas-garden-green/40 px-2.5 py-1">Trẻ trung</span>
            <span className="rounded-full bg-cas-garden-green/40 px-2.5 py-1">
              Dịch vụ đỉnh chóp
            </span>
          </div>
        </div>

        <div className="w-full max-w-xs pt-6" role="status" aria-label="Đang tải ứng dụng">
          <div className="mb-3 flex items-center justify-between gap-3 text-sm font-semibold">
            <span className="flex items-center gap-1.5">
              <CasIcon
                name="restaurant"
                className="size-4 shrink-0 text-cas-garden-peach motion-safe:animate-spin"
              />
              Đang chuẩn bị không gian ẩm thực...
            </span>
            <span className="text-cas-garden-peach" aria-hidden="true">
              {Math.floor(progress)}%
            </span>
          </div>
          <div
            aria-label="Tiến độ tải ứng dụng"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.floor(progress)}
            className="h-1.5 overflow-hidden rounded-full bg-cas-on-scrim/20"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-cas-garden-mint to-cas-garden-peach"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-6 text-center text-[0.6875rem] font-bold tracking-wider text-cas-on-scrim/50">
            © 2026 Bambu Garden
          </p>
        </div>
      </div>
    </div>
  );
}
