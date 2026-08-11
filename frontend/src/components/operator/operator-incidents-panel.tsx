"use client";

import { useState } from "react";

import { CasButton } from "../ui/cas-button";
import { CasIcon } from "../ui/cas-icon";

export type OperationalIncident = {
  createdAt: string;
  createdByName: string;
  description: string;
  id: string;
};

const initialIncidents: OperationalIncident[] = [
  {
    createdAt: "17:15 - Hôm nay",
    createdByName: "Nguyễn Văn A (Nhân viên ca trực)",
    description:
      "Máy in bếp 1 bị kẹt giấy trong 10 phút, đã xử lý xong và in lại các phiếu order bị hoãn.",
    id: "inc-1",
  },
  {
    createdAt: "15:40 - Hôm nay",
    createdByName: "Trần Thị B (Thu ngân)",
    description: "Bàn 04 vô tình làm vỡ 1 ly nước. Đã dọn dẹp sạch sẽ và đổi ly mới cho khách.",
    id: "inc-2",
  },
];

export function OperatorIncidentsPanel() {
  const [incidents, setIncidents] = useState<OperationalIncident[]>(initialIncidents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [createdByName, setCreatedByName] = useState("Nhân viên ca trực");
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleOpenModal = () => {
    setDescription("");
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Vui lòng nhập nội dung mô tả sự cố.");
      return;
    }

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} - Vừa xong`;

    const newIncident: OperationalIncident = {
      createdAt: timeStr,
      createdByName: createdByName.trim() || "Nhân viên ca trực",
      description: description.trim(),
      id: `inc-${Date.now()}`,
    };

    setIncidents([newIncident, ...incidents]);
    setIsModalOpen(false);
    setFeedback("Đã ghi nhận báo cáo sự cố thành công.");

    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <>
      <section
        className="rounded-2xl border border-cas-outline-variant/20 bg-cas-glass p-5 shadow-[0_5px_18px_var(--cas-shadow-color)]"
        aria-labelledby="incidents-title"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold" id="incidents-title">
              Sự cố phát sinh
            </h2>
            <span className="rounded-full bg-cas-error/10 px-2.5 py-0.5 text-xs font-extrabold text-cas-error">
              {incidents.length} sự cố
            </span>
          </div>

          <CasButton size="sm" variant="outline" onClick={handleOpenModal}>
            <CasIcon className="size-4" name="plus" />
            <span>Báo cáo sự cố</span>
          </CasButton>
        </div>

        {feedback ? (
          <div
            className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-cas-secondary/25 bg-cas-secondary-container/20 p-3 text-xs font-bold text-cas-secondary"
            role="status"
          >
            <div className="flex items-center gap-2">
              <CasIcon className="size-4 shrink-0" name="check" />
              <span>{feedback}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="opacity-75 hover:opacity-100"
              type="button"
            >
              ✕
            </button>
          </div>
        ) : null}

        {incidents.length > 0 ? (
          <ul className="mt-4 divide-y divide-cas-outline-variant/20">
            {incidents.map((inc) => (
              <li className="py-3 first:pt-1 last:pb-0" key={inc.id}>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-extrabold text-cas-on-surface">
                    {inc.createdByName}
                  </span>
                  <time className="text-[0.7rem] text-cas-on-surface-variant shrink-0">
                    {inc.createdAt}
                  </time>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-cas-on-surface-variant/90">
                  {inc.description}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-center text-xs text-cas-on-surface-variant py-4">
            Chưa có sự cố nào được ghi nhận trong ca.
          </p>
        )}
      </section>

      {/* MODAL TẠO BÁO CÁO SỰ CỐ */}
      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <section
            className="w-full max-w-lg rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl"
            aria-labelledby="create-incident-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold tracking-wider text-cas-error uppercase">
                  Vận hành ca trực
                </span>
                <h2 className="mt-1 text-xl font-extrabold" id="create-incident-title">
                  Báo cáo sự cố phát sinh
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="grid size-9 place-items-center rounded-xl border border-cas-outline-variant/30 text-cas-on-surface-variant hover:text-cas-primary"
                type="button"
              >
                <CasIcon name="plus" className="size-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  className="block text-xs font-bold text-cas-on-surface mb-1.5"
                  htmlFor="incident-creator-input"
                >
                  Người tạo báo cáo
                </label>
                <input
                  id="incident-creator-input"
                  type="text"
                  value={createdByName}
                  onChange={(e) => setCreatedByName(e.target.value)}
                  placeholder="Tên nhân viên..."
                  className="w-full rounded-xl border border-cas-outline-variant/30 bg-cas-surface-container/60 px-3.5 py-2.5 text-sm font-medium focus:border-cas-primary focus:outline-none"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-bold text-cas-on-surface mb-1.5"
                  htmlFor="incident-description-input"
                >
                  Mô tả chi tiết sự cố <span className="text-cas-error">*</span>
                </label>
                <textarea
                  id="incident-description-input"
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Nhập nội dung sự cố phát sinh trong ca..."
                  className="w-full rounded-xl border border-cas-outline-variant/30 bg-cas-surface-container/60 px-3.5 py-2.5 text-sm font-medium focus:border-cas-primary focus:outline-none resize-none"
                />
                {error ? <p className="mt-1.5 text-xs font-bold text-cas-error">{error}</p> : null}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <CasButton type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </CasButton>
                <CasButton type="submit" variant="primary">
                  Gửi báo cáo
                </CasButton>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
