"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CasIcon } from "../ui/cas-icon";
import { CasButton } from "../ui/cas-button";
import {
  loadOperatorCancellationRequest,
  loadOperatorCancellationRequests,
  resolveOperatorCancellationRequest,
  type CancellationTransferCandidate,
} from "../../lib/api/ordering/cancellation.api";

export type CancellationRequest = {
  id: string;
  table: string;
  item: string;
  quantity: string;
  requestedQuantity: number;
  requestedAt: string;
  unitPrice: number;
  options: Array<{
    groupName: string;
    name: string;
    unitPrice: number;
  }>;
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

const initialRequests: CancellationRequest[] = [
  {
    id: "req-01",
    table: "Bàn 08",
    item: "Mỳ cay đặc biệt 7 cấp độ",
    quantity: "1 phần",
    requestedQuantity: 1,
    requestedAt: "19:40",
    unitPrice: 65000,
    options: [
      { groupName: "Cấp độ cay", name: "Cấp 7", unitPrice: 0 },
      { groupName: "Topping", name: "Thêm phô mai", unitPrice: 10000 },
    ],
    reason: "Khách muốn đổi sang món khác",
    status: "PENDING",
  },
  {
    id: "req-02",
    table: "Bàn 01",
    item: "Trà sữa Trân châu Đường đen",
    quantity: "1 ly",
    requestedQuantity: 1,
    requestedAt: "19:31",
    unitPrice: 35000,
    options: [
      { groupName: "Kích thước", name: "Size L", unitPrice: 10000 },
      { groupName: "Topping", name: "Trân châu đen", unitPrice: 5000 },
    ],
    reason: "Gửi nhầm số lượng",
    status: "PENDING",
  },
  {
    id: "req-03",
    table: "Bàn 05",
    item: "Gà rán giòn rụm",
    quantity: "2 phần",
    requestedQuantity: 2,
    requestedAt: "19:25",
    unitPrice: 55000,
    options: [],
    reason: "Đợi chế biến lâu",
    status: "PENDING",
  },
];

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function CancellationItemDetails({ request }: { request: CancellationRequest }) {
  const optionsAmount = request.options.reduce((total, option) => total + option.unitPrice, 0);
  const unitAmount = request.unitPrice + optionsAmount;
  const requestedAmount = unitAmount * request.requestedQuantity;

  return (
    <div className="mt-4 rounded-2xl border border-cas-outline-variant/25 bg-cas-surface-container/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-cas-on-surface-variant">Món yêu cầu hủy</p>
          <p className="mt-1 text-sm font-extrabold text-cas-on-surface">{request.item}</p>
        </div>
        <span className="rounded-lg bg-cas-primary/10 px-2.5 py-1 text-xs font-black text-cas-primary">
          {request.table}
        </span>
      </div>

      <div className="mt-3 space-y-2 border-y border-cas-outline-variant/20 py-3 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-cas-on-surface-variant">Món gốc</span>
          <span className="font-bold text-cas-on-surface">{formatCurrency(request.unitPrice)}</span>
        </div>
        {request.options.map((option) => (
          <div className="flex justify-between gap-4" key={`${option.groupName}-${option.name}`}>
            <span className="text-cas-on-surface-variant">
              {option.groupName}: <strong className="text-cas-on-surface">{option.name}</strong>
            </span>
            <span className="font-bold text-cas-on-surface">
              {option.unitPrice > 0 ? `+${formatCurrency(option.unitPrice)}` : "Miễn phí"}
            </span>
          </div>
        ))}
        <div className="flex justify-between gap-4">
          <span className="text-cas-on-surface-variant">Đơn giá mỗi phần</span>
          <span className="font-bold text-cas-on-surface">{formatCurrency(unitAmount)}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 text-sm">
        <span className="font-bold text-cas-on-surface-variant">
          Số lượng yêu cầu: {request.quantity}
        </span>
        <span className="font-black text-cas-primary">{formatCurrency(requestedAmount)}</span>
      </div>
    </div>
  );
}

export function OperatorCancellationRequestsView() {
  const [requests, setRequests] = useState<CancellationRequest[]>(initialRequests);
  const [activeModal, setActiveModal] = useState<{
    type: "APPROVE" | "REJECT";
    request: CancellationRequest;
  } | null>(null);

  const [isRemade, setIsRemade] = useState<boolean | null>(null);
  const [staffNote, setStaffNote] = useState("");
  const [rejectReason, setRejectReason] = useState("Món đã chế biến xong");
  const [modalError, setModalError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [transferCandidates, setTransferCandidates] = useState<CancellationTransferCandidate[]>([]);
  const [targetOrderItemId, setTargetOrderItemId] = useState("");
  const [transferQuantity, setTransferQuantity] = useState(0);

  useEffect(() => {
    void loadOperatorCancellationRequests()
      .then((items) =>
        setRequests(
          items.map((item) => ({
            id: item.cancellationRequestId,
            table: `Bàn ${String(item.tableCode).padStart(2, "0")}`,
            item: item.itemName,
            quantity: `${item.requestedQuantity} phần`,
            requestedQuantity: item.requestedQuantity,
            requestedAt: new Date(item.requestedAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            unitPrice: 0,
            options: [],
            reason: item.reason ?? undefined,
            status: "PENDING",
          })),
        ),
      )
      .catch(() => undefined);
  }, []);

  // Esc key & overflow hidden for modal
  useEffect(() => {
    if (!activeModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveModal(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModal]);

  const openApproveModal = (request: CancellationRequest) => {
    setIsRemade(null);
    setStaffNote("");
    setModalError(null);
    setTransferCandidates([]);
    setTargetOrderItemId("");
    setTransferQuantity(0);
    setActiveModal({ type: "APPROVE", request });
    void loadOperatorCancellationRequest(request.id)
      .then((detail) => setTransferCandidates(detail.candidates))
      .catch(() => setModalError("Không thể tải các bàn có thể nhận món."));
  };

  const openRejectModal = (request: CancellationRequest) => {
    setRejectReason("Món đã chế biến xong");
    setModalError(null);
    setActiveModal({ type: "REJECT", request });
  };

  const handleConfirmApprove = () => {
    if (!activeModal) return;
    if (isRemade === null) {
      setModalError("Vui lòng chọn Có hoặc Không cho mục Làm lại món bù.");
      return;
    }
    const req = activeModal.request;

    void resolveOperatorCancellationRequest(req.id, {
      decision: "APPROVE",
      isRemade,
      targetOrderItemId: targetOrderItemId || null,
      transferQuantity,
    })
      .then(() => {
        setRequests((prev) => prev.filter((item) => item.id !== req.id));
        setFeedbackMessage(`Đã đồng ý hủy món "${req.item}" của ${req.table}.`);
        setActiveModal(null);
      })
      .catch((error: unknown) =>
        setModalError(error instanceof Error ? error.message : "Không thể xử lý yêu cầu."),
      );
  };

  const handleConfirmReject = () => {
    if (!activeModal) return;
    const req = activeModal.request;

    void resolveOperatorCancellationRequest(req.id, { decision: "REJECT" })
      .then(() => {
        setRequests((prev) => prev.filter((item) => item.id !== req.id));
        setFeedbackMessage(`Đã từ chối yêu cầu hủy của ${req.table} với lý do: "${rejectReason}".`);
        setActiveModal(null);
      })
      .catch((error: unknown) =>
        setModalError(error instanceof Error ? error.message : "Không thể xử lý yêu cầu."),
      );
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Yêu cầu hủy món</h1>
        </div>

        <CasButton href="/operator/cancellations/new" variant="outline" icon="trash">
          Hủy món do sự cố
        </CasButton>
      </div>

      {feedbackMessage ? (
        <div
          className="mt-6 flex items-start gap-3 rounded-2xl border border-cas-secondary/25 bg-cas-secondary-container/20 p-4 text-sm font-bold text-cas-secondary"
          role="status"
        >
          <CasIcon className="mt-0.5 size-5 shrink-0" name="check" />
          <p className="flex-1 leading-relaxed">{feedbackMessage}</p>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs opacity-75 hover:opacity-100"
            type="button"
          >
            ✕
          </button>
        </div>
      ) : null}

      {pendingRequests.length > 0 ? (
        <ul className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {pendingRequests.map((request) => (
            <li
              className="flex flex-col justify-between rounded-2xl border border-cas-outline-variant/25 bg-cas-glass p-5 shadow-[0_5px_18px_var(--cas-shadow-color)]"
              key={request.id}
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <strong className="text-base font-extrabold">{request.table}</strong>
                    <p className="mt-0.5 text-xs text-cas-on-surface-variant">
                      Gửi lúc {request.requestedAt}
                    </p>
                  </div>
                  <span className="rounded-full bg-cas-primary/10 px-3 py-1 text-xs font-extrabold text-cas-primary">
                    Chờ xác nhận
                  </span>
                </div>

                <div className="mt-4 rounded-xl border border-cas-outline-variant/20 bg-cas-surface/60 p-3.5">
                  <p className="text-sm font-extrabold text-cas-on-surface">{request.item}</p>
                  <p className="mt-1 text-xs font-bold text-cas-primary">
                    Số lượng yêu cầu: {request.quantity}
                  </p>
                  {request.reason ? (
                    <p className="mt-2 text-xs leading-relaxed text-cas-on-surface-variant">
                      <span className="font-semibold text-cas-on-surface">Lý do:</span>{" "}
                      {request.reason}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <CasButton
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => openApproveModal(request)}
                >
                  Đồng ý hủy
                </CasButton>
                <CasButton
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openRejectModal(request)}
                >
                  Từ chối
                </CasButton>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 grid min-h-60 place-items-center rounded-2xl border border-dashed border-cas-outline-variant/40 bg-cas-glass p-8 text-center">
          <div>
            <CasIcon name="check" className="mx-auto size-10 text-cas-secondary" />
            <h2 className="mt-3 text-lg font-extrabold">Không có yêu cầu hủy món nào</h2>
            <p className="mt-1 text-sm text-cas-on-surface-variant">
              Tất cả các yêu cầu từ phía bàn đã được xử lý xong.
            </p>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN ĐỒNG Ý HỦY */}
      {activeModal?.type === "APPROVE" ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <section
            className="w-full max-w-xl rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl"
            aria-labelledby="approve-dialog-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold tracking-wider text-cas-primary uppercase">
                  Xác nhận hệ thống
                </span>
                <h2 className="mt-1 text-xl font-extrabold" id="approve-dialog-title">
                  Đồng ý hủy món?
                </h2>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="grid size-9 place-items-center rounded-xl border border-cas-outline-variant/30 text-cas-on-surface-variant hover:text-cas-primary"
                type="button"
              >
                <CasIcon name="plus" className="size-5 rotate-45" />
              </button>
            </div>

            <CancellationItemDetails request={activeModal.request} />

            <div className="mt-4 space-y-4">
              <div>
                <span className="mb-2 block text-xs font-bold text-cas-on-surface">
                  Làm lại món bù <span className="text-cas-error">*</span>
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRemade(true);
                      setModalError(null);
                    }}
                    className={`flex flex-col rounded-xl border p-3 text-left transition ${isRemade === true ? "border-cas-secondary bg-cas-secondary-container/20 font-bold text-cas-secondary" : "border-cas-outline-variant/30 bg-cas-surface text-cas-on-surface-variant"}`}
                  >
                    <span className="text-xs font-extrabold">Có</span>
                    <span className="mt-0.5 text-[0.7rem] leading-tight opacity-80">
                      Chế biến suất đền bù mới
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRemade(false);
                      setModalError(null);
                    }}
                    className={`flex flex-col rounded-xl border p-3 text-left transition ${isRemade === false ? "border-cas-primary bg-cas-primary/10 font-bold text-cas-primary" : "border-cas-outline-variant/30 bg-cas-surface text-cas-on-surface-variant"}`}
                  >
                    <span className="text-xs font-extrabold">Không</span>
                    <span className="mt-0.5 text-[0.7rem] leading-tight opacity-80">
                      Trừ khỏi đơn, không làm lại
                    </span>
                  </button>
                </div>
                {modalError ? (
                  <p className="mt-1.5 text-xs font-bold text-cas-error">{modalError}</p>
                ) : null}
              </div>

              {transferCandidates.length > 0 ? (
                <div className="rounded-xl border border-cas-outline-variant/30 bg-cas-surface-container/50 p-3">
                  <p className="text-xs font-extrabold text-cas-on-surface">
                    Điều chuyển phần đã làm
                  </p>
                  <p className="mt-1 text-xs text-cas-on-surface-variant">
                    Chỉ chọn khi món và toàn bộ option ở bàn nhận trùng khớp.
                  </p>
                  <select
                    className="mt-3 h-10 w-full rounded-lg border border-cas-outline-variant/40 bg-cas-surface px-2 text-xs"
                    value={targetOrderItemId}
                    onChange={(event) => setTargetOrderItemId(event.target.value)}
                  >
                    <option value="">Không điều chuyển</option>
                    {transferCandidates.map((candidate) => (
                      <option value={candidate.orderItemId} key={candidate.orderItemId}>
                        Bàn {String(candidate.tableCode).padStart(2, "0")} — còn{" "}
                        {candidate.remainingQuantity} phần
                      </option>
                    ))}
                  </select>
                  {targetOrderItemId ? (
                    <input
                      aria-label="Số phần điều chuyển"
                      className="mt-2 h-10 w-full rounded-lg border border-cas-outline-variant/40 bg-cas-surface px-2 text-xs"
                      min={0}
                      type="number"
                      value={transferQuantity}
                      onChange={(event) => setTransferQuantity(Number(event.target.value))}
                    />
                  ) : null}
                </div>
              ) : null}

              <label className="block text-xs font-bold">
                <span className="mb-1.5 block text-cas-on-surface-variant">
                  Ghi chú xử lý của nhân viên (không bắt buộc)
                </span>
                <input
                  type="text"
                  value={staffNote}
                  onChange={(e) => setStaffNote(e.target.value)}
                  placeholder="Ví dụ: Đã báo Bếp dừng làm món..."
                  className="h-11 w-full rounded-xl border border-cas-outline-variant/45 bg-cas-surface px-3 text-xs outline-none focus:border-cas-primary focus:ring-2 focus:ring-cas-primary/15"
                />
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <CasButton variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                Hủy bỏ
              </CasButton>
              <CasButton variant="primary" size="sm" icon="check" onClick={handleConfirmApprove}>
                Xác nhận đồng ý
              </CasButton>
            </div>
          </section>
        </div>
      ) : null}

      {/* MODAL XÁC NHẬN TỪ CHỐI */}
      {activeModal?.type === "REJECT" ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <section
            className="w-full max-w-xl rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl"
            aria-labelledby="reject-dialog-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold tracking-wider text-cas-error uppercase">
                  Từ chối yêu cầu
                </span>
                <h2 className="mt-1 text-xl font-extrabold" id="reject-dialog-title">
                  Từ chối hủy món?
                </h2>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="grid size-9 place-items-center rounded-xl border border-cas-outline-variant/30 text-cas-on-surface-variant hover:text-cas-primary"
                type="button"
              >
                <CasIcon name="plus" className="size-5 rotate-45" />
              </button>
            </div>

            <CancellationItemDetails request={activeModal.request} />

            <div className="mt-4">
              <label className="block text-xs font-bold">
                <span className="mb-2 block text-cas-on-surface-variant">Lý do từ chối</span>
                <input
                  type="text"
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ví dụ: Món đã chế biến xong, không thể hủy..."
                  className="h-11 w-full rounded-xl border border-cas-outline-variant/45 bg-cas-surface px-3 text-xs outline-none focus:border-cas-primary focus:ring-2 focus:ring-cas-primary/15"
                />
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <CasButton variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                Quay lại
              </CasButton>
              <CasButton variant="danger" size="sm" onClick={handleConfirmReject}>
                Xác nhận từ chối
              </CasButton>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
