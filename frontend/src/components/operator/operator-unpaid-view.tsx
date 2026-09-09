"use client";

import { useEffect, useState } from "react";

import {
  confirmOperatorPayment,
  loadEligibleUnpaidSessions,
  loadOperatorUnpaidRecords,
  recordOperatorUnpaid,
  type EligibleUnpaidSession,
  type UnpaidRecord,
} from "../../lib/api/payment/payment.api";
import { CasButton } from "../ui/cas-button";
import { CasIcon } from "../ui/cas-icon";
import { useToast } from "../ui/toast-provider";

type UnpaidViewMode = "admin" | "operator";
const storageKey = "cas.unpaid.minimum-open-minutes";

function money(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function date(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(
        new Date(value),
      )
    : "—";
}

export function OperatorUnpaidView({ mode = "operator" }: { mode?: UnpaidViewMode }) {
  const { showToast } = useToast();
  const [records, setRecords] = useState<UnpaidRecord[]>([]);
  const [sessions, setSessions] = useState<EligibleUnpaidSession[]>([]);
  const [status, setStatus] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
  const [minimumMinutes, setMinimumMinutes] = useState(120);
  const [sessionId, setSessionId] = useState("");
  const [reason, setReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<UnpaidRecord | null>(null);
  const [recordToConfirm, setRecordToConfirm] = useState<UnpaidRecord | null>(null);

  async function refresh(nextStatus = status, nextMinutes = minimumMinutes) {
    setLoading(true);
    setError(null);
    try {
      const [nextRecords, nextSessions] = await Promise.all([
        loadOperatorUnpaidRecords(nextStatus === "ALL" ? undefined : nextStatus),
        loadEligibleUnpaidSessions(nextMinutes),
      ]);
      setRecords(nextRecords);
      setSessions(nextSessions);
      setSessionId((current) => current || nextSessions[0]?.sessionId || "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải khoản chưa thanh toán.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const storedValue = window.sessionStorage.getItem(storageKey);
    if (storedValue === null) return;
    const stored = Number(storedValue);
    if (Number.isInteger(stored) && stored >= 0 && stored <= 10000) setMinimumMinutes(stored);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(storageKey, String(minimumMinutes));
      void refresh(status, minimumMinutes);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [minimumMinutes, status]);

  const openAmount = records
    .filter((record) => record.status === "OPEN")
    .reduce((total, record) => total + record.amount, 0);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionId) return;
    setSaving(true);
    try {
      await recordOperatorUnpaid({ sessionId, reason: reason.trim() || null });
      showToast({
        type: "success",
        message: "Đã đóng phiên bàn và ghi nhận khoản chưa thanh toán.",
      });
      setReason("");
      setDialogOpen(false);
      await refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không thể ghi nhận khoản chưa thanh toán.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirm(record: UnpaidRecord) {
    setSaving(true);
    try {
      await confirmOperatorPayment(record.paymentId);
      showToast({
        type: "success",
        message: `Đã xác nhận thanh toán cho Bàn ${record.tableCode}.`,
      });
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xác nhận thanh toán.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-cas-on-surface">Không thanh toán</h1>
          <p className="mt-1 text-sm text-cas-on-surface-variant">
            Theo dõi các phiên bàn đã rời đi nhưng chưa thanh toán.
          </p>
        </div>
        <CasButton disabled={sessions.length === 0} onClick={() => setDialogOpen(true)}>
          <CasIcon className="size-4" name="plus" /> Ghi nhận không được thanh toán
        </CasButton>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <Summary
          label="Khoản đang mở"
          value={String(records.filter((r) => r.status === "OPEN").length)}
        />
        <Summary label="Tổng tiền chưa thu" value={money(openAmount)} />
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <label
          className="text-xs font-bold text-cas-on-surface-variant"
          htmlFor="minimum-open-minutes"
        >
          Chỉ hiện phiên mở từ
        </label>
        <MinimumOpenMinutesTooltip />
        <input
          className="w-24 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-sm"
          id="minimum-open-minutes"
          max="10000"
          min="0"
          onChange={(event) =>
            setMinimumMinutes(Math.max(0, Math.min(10000, Number(event.target.value) || 0)))
          }
          type="number"
          value={minimumMinutes}
        />
        <span className="text-xs text-cas-on-surface-variant">phút</span>
      </div>
      <div className="flex gap-2">
        {(["ALL", "OPEN", "RESOLVED"] as const).map((item) => (
          <button
            className={`rounded-xl px-3 py-2 text-xs font-bold ${status === item ? "bg-cas-secondary text-cas-on-secondary" : "bg-cas-surface-container text-cas-on-surface-variant"}`}
            key={item}
            onClick={() => setStatus(item)}
            type="button"
          >
            {item === "ALL" ? "Tất cả" : item === "OPEN" ? "Chưa thu" : "Đã thu"}
          </button>
        ))}
      </div>
      {error ? <Feedback tone="error">{error}</Feedback> : null}
      {loading ? (
        <p className="text-sm text-cas-on-surface-variant">Đang tải dữ liệu…</p>
      ) : (
        <RecordList
          records={records}
          saving={saving}
          onRequestConfirm={setRecordToConfirm}
          onView={setSelectedRecord}
        />
      )}

      {dialogOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <form
            className="w-full max-w-lg rounded-2xl bg-cas-surface p-6 shadow-2xl"
            onSubmit={submit}
          >
            <h2 className="text-xl font-black">Ghi nhận không được thanh toán</h2>
            <p className="mt-1 text-sm text-cas-on-surface-variant">
              Payment vẫn chờ xác nhận; khi xác nhận đã thu, record tự chuyển sang đã xử lý.
            </p>
            <label className="mt-5 block text-sm font-bold" htmlFor="unpaid-session">
              Phiên bàn
            </label>
            <select
              className="mt-2 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface p-3"
              id="unpaid-session"
              onChange={(event) => setSessionId(event.target.value)}
              value={sessionId}
            >
              {sessions.map((session) => (
                <option key={session.sessionId} value={session.sessionId}>
                  Bàn {session.tableCode} · {money(session.amount)} · mở {date(session.openedAt)}
                </option>
              ))}
            </select>
            <label className="mt-4 block text-sm font-bold" htmlFor="unpaid-reason">
              Lý do (tùy chọn)
            </label>
            <textarea
              className="mt-2 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface p-3"
              id="unpaid-reason"
              maxLength={1000}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              value={reason}
            />
            <div className="mt-5 flex justify-end gap-3">
              <CasButton onClick={() => setDialogOpen(false)} type="button" variant="outline">
                Hủy
              </CasButton>
              <CasButton disabled={saving || !sessionId} type="submit">
                {saving ? "Đang lưu…" : "Xác nhận ghi nhận"}
              </CasButton>
            </div>
          </form>
        </div>
      ) : null}
      {selectedRecord ? (
        <BillSnapshot record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      ) : null}
      {recordToConfirm ? (
        <ConfirmCollectedPaymentDialog
          isSaving={saving}
          record={recordToConfirm}
          onCancel={() => setRecordToConfirm(null)}
          onConfirm={async () => {
            await confirm(recordToConfirm);
            setRecordToConfirm(null);
          }}
        />
      ) : null}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-4">
      <p className="text-xs font-bold text-cas-on-surface-variant">{label}</p>
      <p className="mt-2 text-2xl font-black text-cas-on-surface">{value}</p>
    </article>
  );
}

function MinimumOpenMinutesTooltip() {
  return (
    <span className="group relative inline-flex">
      <button
        aria-label="Giải thích thời gian mở phiên"
        className="grid size-4 place-items-center rounded-full border border-cas-outline-variant/70 text-[0.65rem] font-black leading-none text-cas-on-surface-variant transition-colors hover:border-cas-primary hover:text-cas-primary focus:outline-none focus:ring-2 focus:ring-cas-primary"
        type="button"
      >
        ?
      </button>
      <span
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-xl border border-cas-outline-variant/30 bg-cas-surface px-3 py-2 text-left text-xs font-medium leading-5 text-cas-on-surface-variant opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        role="tooltip"
      >
        Chỉ các phiên đã mở quá thời gian này mới được hiển thị để thêm vào danh sách không thanh
        toán, tránh xử lý nhầm bàn vẫn đang phục vụ.
      </span>
    </span>
  );
}

function Feedback({ children, tone }: { children: React.ReactNode; tone: "error" }) {
  return (
    <p
      className="rounded-xl border border-cas-error/30 bg-cas-error-container/20 p-3 text-sm text-cas-error"
      role="alert"
    >
      {children}
    </p>
  );
}

function RecordList({
  records,
  saving,
  onRequestConfirm,
  onView,
}: {
  records: UnpaidRecord[];
  saving: boolean;
  onRequestConfirm: (record: UnpaidRecord) => void;
  onView: (record: UnpaidRecord) => void;
}) {
  if (records.length === 0)
    return (
      <p className="rounded-2xl bg-cas-surface-container/50 p-6 text-center text-sm text-cas-on-surface-variant">
        Chưa có khoản chưa thanh toán phù hợp.
      </p>
    );
  return (
    <ul className="space-y-3">
      {records.map((record) => (
        <li
          className="rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-4"
          key={record.publicId}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-black">
                Bàn {record.tableCode} · {money(record.amount)}
              </p>
              <p className="mt-1 text-xs text-cas-on-surface-variant">
                {record.reportedByName} · {date(record.createdAt)}
              </p>
              <p className="mt-2 text-sm text-cas-on-surface-variant">
                {record.reason || "Không có lý do"}
              </p>
              <button
                className="mt-3 text-xs font-bold text-cas-primary underline underline-offset-4"
                onClick={() => onView(record)}
                type="button"
              >
                Xem bill snapshot
              </button>
            </div>
            <div className="text-right">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${record.status === "OPEN" ? "bg-cas-error-container/40 text-cas-error" : "bg-cas-secondary-container/40 text-cas-secondary"}`}
              >
                {record.status === "OPEN" ? "Chưa thu" : "Đã thu"}
              </span>
              {record.status === "OPEN" ? (
                <CasButton
                  className="mt-3"
                  disabled={saving}
                  onClick={() => onRequestConfirm(record)}
                  size="sm"
                >
                  Xác nhận đã thu
                </CasButton>
              ) : (
                <p className="mt-3 text-xs text-cas-on-surface-variant">
                  {date(record.resolvedAt)}
                </p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ConfirmCollectedPaymentDialog({
  isSaving,
  record,
  onCancel,
  onConfirm,
}: {
  isSaving: boolean;
  record: UnpaidRecord;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <section
        aria-describedby="confirm-collected-payment-description"
        aria-labelledby="confirm-collected-payment-title"
        className="w-full max-w-md rounded-2xl bg-cas-surface p-6 shadow-2xl"
        role="alertdialog"
      >
        <h2 className="text-xl font-black" id="confirm-collected-payment-title">
          Xác nhận đã thu tiền
        </h2>
        <p
          className="mt-3 text-sm leading-6 text-cas-on-surface-variant"
          id="confirm-collected-payment-description"
        >
          Xác nhận đã thu {money(record.amount)} của Bàn {record.tableCode}? Thao tác này không thể
          hoàn tác.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <CasButton disabled={isSaving} onClick={onCancel} type="button" variant="outline">
            Hủy
          </CasButton>
          <CasButton disabled={isSaving} onClick={() => void onConfirm()} type="button">
            {isSaving ? "Đang xác nhận…" : "Xác nhận đã thu"}
          </CasButton>
        </div>
      </section>
    </div>
  );
}

function BillSnapshot({ record, onClose }: { record: UnpaidRecord; onClose: () => void }) {
  let snapshot: unknown = record.billSnapshot;
  try {
    snapshot = JSON.parse(record.billSnapshot);
  } catch {
    // Keep the immutable legacy snapshot visible if it is not valid JSON.
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <section
        aria-modal="true"
        className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-2xl bg-cas-surface p-6 shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-cas-on-surface-variant">Bàn {record.tableCode}</p>
            <h2 className="text-xl font-black">Bill snapshot</h2>
            <p className="mt-1 text-sm text-cas-on-surface-variant">
              Tổng cần thu: {money(record.amount)}
            </p>
          </div>
          <CasButton aria-label="Đóng bill snapshot" onClick={onClose} size="sm" variant="outline">
            Đóng
          </CasButton>
        </div>
        <pre className="mt-5 whitespace-pre-wrap break-words rounded-xl bg-cas-surface-container p-4 text-xs text-cas-on-surface">
          {typeof snapshot === "string" ? snapshot : JSON.stringify(snapshot, null, 2)}
        </pre>
      </section>
    </div>
  );
}
