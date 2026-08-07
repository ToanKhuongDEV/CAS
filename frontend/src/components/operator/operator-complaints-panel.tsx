"use client";

import { useEffect, useState } from "react";

import { CasIcon } from "../ui/cas-icon";

type Complaint = {
  description: string;
  id: string;
  table: string;
  time: string;
};

const complaints: Complaint[] = [
  {
    description:
      "Khách phản ánh món mang ra còn thiếu so với số lượng đã gọi và muốn nhân viên kiểm tra lại toàn bộ món trên bàn trước khi tiếp tục phục vụ.",
    id: "complaint-table-12",
    table: "Bàn 12",
    time: "3 phút trước",
  },
  {
    description:
      "Khách cần kiểm tra lại mức chín của phần bò vì món vừa phục vụ chưa đúng với lựa chọn ban đầu của bàn.",
    id: "complaint-table-05",
    table: "Bàn 05",
    time: "8 phút trước",
  },
  {
    description:
      "Khách cần nhân viên kiểm tra lại món vừa phục vụ và xác nhận các lựa chọn đi kèm trước khi mang phần tiếp theo ra bàn.",
    id: "complaint-table-03",
    table: "Bàn 03",
    time: "12 phút trước",
  },
];

export function OperatorComplaintsPanel() {
  const [selectedComplaint, setSelectedComplaint] =
    useState<Complaint | null>(null);

  useEffect(() => {
    if (!selectedComplaint) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedComplaint(null);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedComplaint]);

  return (
    <>
      <section
        className="rounded-2xl border border-cas-outline-variant/20 bg-cas-glass p-5 shadow-[0_5px_18px_var(--cas-shadow-color)]"
        aria-labelledby="complaints-title"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold" id="complaints-title">
            Khiếu nại
          </h2>
          <span className="rounded-full bg-cas-primary/10 px-3 py-1 text-xs font-extrabold text-cas-primary">
            {complaints.length} phản ánh
          </span>
        </div>

        <ul className="mt-3 divide-y divide-cas-outline-variant/25">
          {complaints.map((complaint) => (
            <li className="py-2" key={complaint.id}>
              <button
                className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-cas-primary/5 focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-cas-focus-ring"
                onClick={() => setSelectedComplaint(complaint)}
                type="button"
                aria-label={`Xem khiếu nại của ${complaint.table}`}
              >
                <span className="grid size-9 place-items-center rounded-xl bg-cas-primary/10 text-cas-primary">
                  <CasIcon className="size-4.5" name="info" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold">
                    {complaint.table}
                  </span>
                  <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-cas-on-surface-variant">
                    {complaint.description}
                  </span>
                </span>
                <time className="pt-0.5 text-xs whitespace-nowrap text-cas-on-surface-variant">
                  {complaint.time}
                </time>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {selectedComplaint ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedComplaint(null);
            }
          }}
        >
          <section
            className="w-full max-w-lg rounded-2xl border border-cas-outline-variant/30 bg-cas-surface p-5 shadow-2xl sm:p-6"
            aria-labelledby="complaint-dialog-title"
            aria-modal="true"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
                  {selectedComplaint.table}
                </p>
                <h2
                  className="mt-1 text-xl font-extrabold"
                  id="complaint-dialog-title"
                >
                  Chi tiết khiếu nại
                </h2>
                <time className="mt-1 block text-xs text-cas-on-surface-variant">
                  Gửi {selectedComplaint.time}
                </time>
              </div>
              <button
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-cas-outline-variant/35 text-cas-on-surface-variant transition hover:border-cas-primary/30 hover:text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={() => setSelectedComplaint(null)}
                type="button"
                aria-label="Đóng chi tiết khiếu nại"
              >
                <CasIcon className="size-5 rotate-45" name="plus" />
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-cas-surface-container/70 p-4">
              <p className="text-sm leading-7 text-cas-on-surface">
                {selectedComplaint.description}
              </p>
            </div>

            <button
              className="mt-5 min-h-11 w-full rounded-xl bg-cas-primary px-4 text-sm font-extrabold text-cas-on-primary transition hover:brightness-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
              onClick={() => setSelectedComplaint(null)}
              type="button"
            >
              Đóng
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}
