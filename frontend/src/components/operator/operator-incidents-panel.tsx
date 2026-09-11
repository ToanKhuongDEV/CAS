"use client";

import { useState, type FormEvent } from "react";

import { createOperationalIncident } from "../../lib/api/operation/operational-incidents.api";
import { CasButton } from "../ui/cas-button";
import { CasIcon } from "../ui/cas-icon";

export function OperatorIncidentsPanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("Nhân viên ca trực");
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = () => {
    setDescription("");
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!description.trim()) {
      setError("Vui lòng nhập nội dung mô tả sự cố.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createOperationalIncident({
        reporterName: reporterName.trim() || "Nhân viên ca trực",
        description: description.trim(),
      });
      setIsModalOpen(false);
      setFeedback("Đã ghi nhận báo cáo sự cố thành công.");
      setTimeout(() => setFeedback(null), 4000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể gửi báo cáo sự cố.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CasButton variant="outline" onClick={handleOpenModal}>
        <CasIcon className="size-4" name="plus" />
        <span>Báo cáo sự cố</span>
      </CasButton>

      {feedback ? (
        <div
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-cas-secondary/25 bg-cas-secondary-container px-4 py-3 text-sm font-bold text-cas-secondary shadow-[0_5px_18px_var(--cas-shadow-color)]"
          role="status"
        >
          <CasIcon className="size-4 shrink-0" name="check" />
          <span>{feedback}</span>
        </div>
      ) : null}

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsModalOpen(false);
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
                <span className="text-xs font-extrabold uppercase tracking-wider text-cas-error">
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
                  className="mb-1.5 block text-xs font-bold text-cas-on-surface"
                  htmlFor="incident-creator-input"
                >
                  Người tạo báo cáo
                </label>
                <input
                  id="incident-creator-input"
                  type="text"
                  value={reporterName}
                  onChange={(event) => setReporterName(event.target.value)}
                  placeholder="Tên nhân viên..."
                  className="w-full rounded-xl border border-cas-outline-variant/30 bg-cas-surface-container/60 px-3.5 py-2.5 text-sm font-medium focus:border-cas-primary focus:outline-none"
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-bold text-cas-on-surface"
                  htmlFor="incident-description-input"
                >
                  Mô tả chi tiết sự cố <span className="text-cas-error">*</span>
                </label>
                <textarea
                  id="incident-description-input"
                  rows={4}
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Nhập nội dung sự cố phát sinh trong ca..."
                  className="w-full resize-none rounded-xl border border-cas-outline-variant/30 bg-cas-surface-container/60 px-3.5 py-2.5 text-sm font-medium focus:border-cas-primary focus:outline-none"
                />
                {error ? <p className="mt-1.5 text-xs font-bold text-cas-error">{error}</p> : null}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <CasButton type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </CasButton>
                <CasButton disabled={isSubmitting} type="submit" variant="primary">
                  {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
                </CasButton>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
