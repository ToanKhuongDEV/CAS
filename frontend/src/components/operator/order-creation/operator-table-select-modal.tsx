"use client";

import { useState } from "react";
import { CasIcon } from "../../ui/cas-icon";

export type TableOption = {
  id: string;
  code: string;
  label: string;
  customerName?: string;
  customerPhone?: string;
  activeOrdersCount: number;
  status: "OPEN" | "EMPTY" | "PAYMENT_PENDING";
  openedAt?: string;
};

export const availableTables: TableOption[] = [
  {
    id: "table-01",
    code: "01",
    label: "Bàn 01",
    customerName: "Trần Minh Quân",
    customerPhone: "0901***123",
    activeOrdersCount: 2,
    status: "OPEN",
    openedAt: "18:45",
  },
  {
    id: "table-02",
    code: "02",
    label: "Bàn 02",
    activeOrdersCount: 0,
    status: "EMPTY",
  },
  {
    id: "table-03",
    code: "03",
    label: "Bàn 03",
    customerName: "Lê Thị Hoa",
    customerPhone: "0988***456",
    activeOrdersCount: 1,
    status: "OPEN",
    openedAt: "18:55",
  },
  {
    id: "table-05",
    code: "05",
    label: "Bàn 05",
    customerName: "Nguyễn Văn An",
    customerPhone: "0912***789",
    activeOrdersCount: 3,
    status: "OPEN",
    openedAt: "19:05",
  },
  {
    id: "table-07",
    code: "07",
    label: "Bàn 07",
    activeOrdersCount: 0,
    status: "EMPTY",
  },
  {
    id: "table-08",
    code: "08",
    label: "Bàn 08",
    customerName: "Phạm Hải Đăng",
    customerPhone: "0977***221",
    activeOrdersCount: 1,
    status: "OPEN",
    openedAt: "19:16",
  },
  {
    id: "table-12",
    code: "12",
    label: "Bàn 12",
    customerName: "Vũ Phương Linh",
    customerPhone: "0934***888",
    activeOrdersCount: 1,
    status: "OPEN",
    openedAt: "19:11",
  },
  {
    id: "table-14",
    code: "14",
    label: "Bàn 14",
    customerName: "Hoàng Anh Tuấn",
    customerPhone: "0945***999",
    activeOrdersCount: 1,
    status: "PAYMENT_PENDING",
    openedAt: "18:30",
  },
];

type OperatorTableSelectModalProps = {
  isOpen: boolean;
  selectedTableId: string;
  onClose: () => void;
  onSelectTable: (table: TableOption) => void;
};

export function OperatorTableSelectModal({
  isOpen,
  selectedTableId,
  onClose,
  onSelectTable,
}: OperatorTableSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredTables = availableTables.filter(
    (t) =>
      t.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.includes(searchTerm) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-cas-on-surface/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="table-select-modal-title"
    >
      <div className="w-full max-w-xl rounded-2xl border border-cas-outline-variant/30 bg-cas-surface p-5 shadow-2xl transition sm:p-6">
        <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-4">
          <div>
            <h2
              className="text-xl font-extrabold text-cas-on-surface"
              id="table-select-modal-title"
            >
              Chọn bàn phục vụ
            </h2>
            <p className="mt-0.5 text-xs text-cas-on-surface-variant">
              Chọn bàn có phiên đang mở để tạo hoặc gọi thêm món
            </p>
          </div>

          <button
            className="grid size-9 place-items-center rounded-xl bg-cas-glass text-cas-on-surface-variant transition hover:bg-cas-outline-variant/20 hover:text-cas-on-surface focus-visible:outline-2 focus-visible:outline-cas-focus-ring"
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ chọn bàn"
          >
            <CasIcon className="size-5" name="minus" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-3.5 text-cas-on-surface-variant">
              <CasIcon className="size-4" name="search" />
            </span>
            <input
              className="w-full rounded-xl border border-cas-outline-variant/40 bg-cas-glass py-2.5 pr-4 pl-10 text-sm text-cas-on-surface placeholder:text-cas-on-surface-variant/60 focus:border-cas-secondary focus:outline-none focus:ring-2 focus:ring-cas-focus-ring"
              type="search"
              placeholder="Tìm theo số bàn hoặc tên khách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Tables Grid */}
        <div className="mt-4 max-h-80 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {filteredTables.map((table) => {
              const isSelected = table.id === selectedTableId;
              const isOpenSession = table.status === "OPEN";
              const isPendingPayment = table.status === "PAYMENT_PENDING";
              const isEmpty = table.status === "EMPTY";

              return (
                <button
                  key={table.id}
                  type="button"
                  disabled={!isOpenSession}
                  onClick={() => {
                    if (isOpenSession) {
                      onSelectTable(table);
                      onClose();
                    }
                  }}
                  className={`flex flex-col items-start justify-between rounded-xl border p-3.5 text-left transition ${
                    isSelected
                      ? "border-cas-secondary bg-cas-secondary-container/20 ring-2 ring-cas-secondary"
                      : isOpenSession
                        ? "border-cas-outline-variant/30 bg-cas-glass hover:border-cas-secondary hover:bg-cas-secondary-container/10"
                        : isPendingPayment
                          ? "cursor-not-allowed border-amber-500/30 bg-amber-500/5 opacity-70"
                          : "cursor-not-allowed border-dashed border-cas-outline-variant/40 bg-cas-glass/40 opacity-60"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-base font-extrabold text-cas-on-surface">
                      {table.label}
                    </span>
                    {isOpenSession ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.68rem] font-bold text-emerald-600 dark:text-emerald-400">
                        Đang mở • {table.activeOrdersCount} đơn
                      </span>
                    ) : isPendingPayment ? (
                      <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[0.68rem] font-bold text-amber-600 dark:text-amber-400">
                        Chờ thanh toán
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-cas-outline-variant/20 px-2 py-0.5 text-[0.68rem] font-bold text-cas-on-surface-variant">
                        Bàn trống
                      </span>
                    )}
                  </div>

                  {isOpenSession && table.customerName && (
                    <div className="mt-2 text-xs text-cas-on-surface-variant">
                      <p className="font-semibold text-cas-on-surface">{table.customerName}</p>
                      <p className="text-[0.7rem] text-cas-on-surface-variant/80">
                        {table.customerPhone} • Mở lúc {table.openedAt}
                      </p>
                    </div>
                  )}

                  {isPendingPayment && (
                    <p className="mt-2 text-[0.7rem] text-amber-600 dark:text-amber-400">
                      Đang khóa gọi món do chờ xác nhận thanh toán
                    </p>
                  )}

                  {isEmpty && (
                    <p className="mt-2 text-[0.7rem] text-cas-on-surface-variant/70">
                      Chưa có khách quét QR mở bàn
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {filteredTables.length === 0 && (
            <div className="py-8 text-center text-sm text-cas-on-surface-variant">
              Không tìm thấy bàn phù hợp với từ khóa &ldquo;{searchTerm}&rdquo;
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end border-t border-cas-outline-variant/20 pt-3.5">
          <button
            type="button"
            className="rounded-xl border border-cas-outline-variant/40 bg-cas-glass px-4 py-2 text-sm font-bold text-cas-on-surface transition hover:bg-cas-outline-variant/20 focus-visible:outline-2 focus-visible:outline-cas-focus-ring"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
