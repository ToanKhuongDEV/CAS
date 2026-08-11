"use client";

import { useEffect, useState } from "react";

import { CasIcon } from "../../../../../components/ui/cas-icon";

type ReceiptItem = {
  name: string;
  options?: Array<{ name: string; price: string }>;
  quantity: number;
  total: string;
  unitPrice: string;
};

type PendingPayment = {
  amount: string;
  billNumber: string;
  id: string;
  items: ReceiptItem[];
  requestedAt: string;
  table: string;
};

const initialPayments: PendingPayment[] = [
  {
    amount: "170.000đ",
    billNumber: "BILL-20260811-005",
    id: "payment-table-05",
    items: [
      {
        name: "Mỳ cay hải sản",
        options: [
          { name: "Cấp độ cay: Cấp 3", price: "0đ" },
          { name: "Topping: Phô mai", price: "10.000đ" },
        ],
        quantity: 1,
        total: "75.000đ",
        unitPrice: "75.000đ",
      },
      { name: "Trà sữa truyền thống", quantity: 1, total: "35.000đ", unitPrice: "35.000đ" },
      { name: "Gà rán sốt cay Hàn Quốc", quantity: 1, total: "60.000đ", unitPrice: "60.000đ" },
    ],
    requestedAt: "19:42",
    table: "Bàn 05",
  },
  {
    amount: "245.000đ",
    billNumber: "BILL-20260811-012",
    id: "payment-table-12",
    items: [
      {
        name: "Mỳ cay bò Mỹ",
        options: [{ name: "Topping: Xúc xích", price: "15.000đ" }],
        quantity: 2,
        total: "150.000đ",
        unitPrice: "75.000đ",
      },
      { name: "Gà popcorn lắc phô mai", quantity: 1, total: "60.000đ", unitPrice: "60.000đ" },
      { name: "Nước chanh dây", quantity: 1, total: "35.000đ", unitPrice: "35.000đ" },
    ],
    requestedAt: "19:35",
    table: "Bàn 12",
  },
  {
    amount: "95.000đ",
    billNumber: "BILL-20260811-003",
    id: "payment-table-03",
    items: [
      { name: "Mỳ cay nấm rau củ", quantity: 1, total: "60.000đ", unitPrice: "60.000đ" },
      { name: "Trà chanh", quantity: 1, total: "35.000đ", unitPrice: "35.000đ" },
    ],
    requestedAt: "19:28",
    table: "Bàn 03",
  },
];

export function OperatorPaymentConfirmationList() {
  const [confirmedMessage, setConfirmedMessage] = useState<string | null>(null);
  const [payments, setPayments] = useState(initialPayments);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);

  useEffect(() => {
    if (!selectedPayment) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedPayment(null);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPayment]);

  function handleConfirmPayment() {
    if (!selectedPayment) {
      return;
    }

    setPayments((currentPayments) =>
      currentPayments.filter((payment) => payment.id !== selectedPayment.id),
    );
    setConfirmedMessage(
      `Đã xác nhận ${selectedPayment.table} thanh toán ${selectedPayment.amount}.`,
    );
    setSelectedPayment(null);
  }

  function handlePrintBill() {
    window.print();
  }

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold">Thanh toán chờ xác nhận</h1>
      </header>

      {confirmedMessage ? (
        <div
          className="mt-5 flex items-start gap-3 rounded-xl border border-cas-secondary/25 bg-cas-secondary-container/20 p-4 text-sm font-bold text-cas-secondary"
          role="status"
        >
          <CasIcon className="mt-0.5 size-5 shrink-0" name="check" />
          <p>{confirmedMessage}</p>
        </div>
      ) : null}

      {payments.length > 0 ? (
        <ul
          className="mt-7 overflow-hidden rounded-2xl border border-cas-outline-variant/25 bg-cas-glass shadow-[0_5px_18px_var(--cas-shadow-color)]"
          aria-label="Danh sách thanh toán chờ xác nhận"
        >
          {payments.map((payment) => (
            <li
              className="grid gap-3 border-b border-cas-outline-variant/25 p-5 last:border-b-0 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center"
              key={payment.id}
            >
              <p className="font-extrabold">{payment.table}</p>
              <p className="text-sm text-cas-on-surface-variant">
                Yêu cầu lúc {payment.requestedAt}
              </p>
              <p className="font-extrabold text-cas-primary">{payment.amount}</p>
              <button
                className="w-fit rounded-xl bg-cas-primary px-4 py-2 text-sm font-extrabold text-cas-on-primary transition hover:brightness-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={() => setSelectedPayment(payment)}
                type="button"
              >
                Xác nhận đã thanh toán
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-7 grid min-h-56 place-items-center rounded-2xl border border-dashed border-cas-outline-variant/50 bg-cas-glass p-8 text-center">
          <div>
            <h2 className="text-lg font-extrabold">Không còn thanh toán chờ xác nhận</h2>
            <p className="mt-1 text-sm text-cas-on-surface-variant">
              Tất cả yêu cầu thanh toán đã được xử lý.
            </p>
          </div>
        </div>
      )}

      {selectedPayment ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPayment(null);
            }
          }}
        >
          <section
            className="w-full max-w-md rounded-2xl border border-cas-outline-variant/30 bg-cas-surface p-5 shadow-2xl sm:p-6"
            aria-labelledby="payment-confirmation-title"
            aria-modal="true"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
                  {selectedPayment.table}
                </p>
                <h2 className="mt-1 text-xl font-extrabold" id="payment-confirmation-title">
                  Xác nhận thanh toán
                </h2>
              </div>
              <button
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-cas-outline-variant/35 text-cas-on-surface-variant transition hover:border-cas-primary/30 hover:text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={() => setSelectedPayment(null)}
                type="button"
                aria-label="Đóng xác nhận thanh toán"
              >
                <CasIcon className="size-5 rotate-45" name="plus" />
              </button>
            </div>

            <section aria-label="Bản in bill" className="print-bill">
              <header className="print-bill__header">
                <strong>TIỆM ĂN VẶT &amp; MỲ CAY CAS</strong>
                <span>123 Đường Ẩm Thực, Quận 1, TP. Hồ Chí Minh</span>
                <span>Hotline: 0901 234 567</span>
              </header>

              <h1>HÓA ĐƠN THANH TOÁN</h1>
              <div className="print-bill__meta">
                <span>{selectedPayment.billNumber}</span>
                <span>{selectedPayment.table}</span>
                <span>Thời gian: 11/08/2026 · {selectedPayment.requestedAt}</span>
                <span>Thu ngân: Nhân viên đang đăng nhập</span>
              </div>

              <div className="print-bill__divider" />
              <div className="print-bill__columns">
                <span>MÓN / TOPPING</span>
                <span>SL × Đ.GIÁ</span>
                <span>THÀNH TIỀN</span>
              </div>
              <div className="print-bill__divider" />

              <div className="print-bill__items">
                {selectedPayment.items.map((item) => (
                  <div className="print-bill__item" key={item.name}>
                    <strong>{item.name}</strong>
                    <div className="print-bill__item-price">
                      <span>
                        {item.quantity} × {item.unitPrice}
                      </span>
                      <strong>{item.total}</strong>
                    </div>
                    {item.options?.map((option) => (
                      <div className="print-bill__option" key={option.name}>
                        <span>+ {option.name}</span>
                        <span>{option.price}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="print-bill__divider" />
              <div className="print-bill__total">
                <span>Tạm tính</span>
                <strong>{selectedPayment.amount}</strong>
                <span>Giảm giá</span>
                <strong>0đ</strong>
                <span>TỔNG THANH TOÁN</span>
                <strong className="print-bill__grand-total">{selectedPayment.amount}</strong>
              </div>
              <div className="print-bill__divider" />
              <p>Phương thức: Chuyển khoản / Tiền mặt</p>
              <footer>Cảm ơn quý khách. Hẹn gặp lại!</footer>
            </section>

            <div className="mt-5 rounded-xl bg-cas-surface-container/70 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-cas-on-surface-variant">Số tiền</span>
                <strong className="text-xl text-cas-primary">{selectedPayment.amount}</strong>
              </div>
              <p className="mt-4 border-t border-cas-outline-variant/25 pt-4 text-sm leading-6 text-cas-on-surface">
                Bạn chỉ xác nhận khi đã kiểm tra loa bên ngoài CAS báo giao dịch thành công.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button
                className="min-h-11 rounded-xl border border-cas-outline-variant/45 px-4 text-sm font-extrabold transition hover:bg-cas-surface-container focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={() => setSelectedPayment(null)}
                type="button"
              >
                Quay lại
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cas-primary/35 px-4 text-sm font-extrabold text-cas-primary transition hover:bg-cas-primary/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={handlePrintBill}
                type="button"
              >
                <CasIcon className="size-4" name="bill" />
                In bill
              </button>
              <button
                className="min-h-11 rounded-xl bg-cas-primary px-4 text-sm font-extrabold text-cas-on-primary transition hover:brightness-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={handleConfirmPayment}
                type="button"
              >
                Xác nhận đã thanh toán
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <style jsx global>{`
        .print-bill {
          display: none;
        }

        @media print {
          @page {
            margin: 2mm 4mm;
            size: 80mm auto;
          }

          body * {
            visibility: hidden;
          }

          .print-bill,
          .print-bill * {
            visibility: visible;
          }

          .print-bill {
            box-sizing: border-box;
            color: var(--cas-on-surface);
            display: block;
            font-family: var(--font-cas);
            font-size: 10px;
            left: 0;
            line-height: 1.35;
            position: absolute;
            top: 0;
            width: 72mm;
          }

          .print-bill__header,
          .print-bill h1,
          .print-bill footer {
            display: grid;
            gap: 2px;
            text-align: center;
          }

          .print-bill__header strong,
          .print-bill h1,
          .print-bill__grand-total {
            font-size: 12px;
          }

          .print-bill h1 {
            font-size: 13px;
            margin: 12px 0 8px;
          }

          .print-bill__meta {
            display: grid;
            gap: 2px;
          }

          .print-bill__divider {
            border-top: 1px dashed var(--cas-on-surface);
            margin: 8px 0;
          }

          .print-bill__columns,
          .print-bill__item-price,
          .print-bill__option,
          .print-bill__total {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto auto;
            gap: 8px;
          }

          .print-bill__columns {
            font-size: 9px;
            font-weight: 700;
          }

          .print-bill__columns span:last-child,
          .print-bill__item-price strong,
          .print-bill__option span:last-child,
          .print-bill__total strong {
            text-align: right;
          }

          .print-bill__item + .print-bill__item {
            margin-top: 8px;
          }

          .print-bill__item-price,
          .print-bill__option {
            margin-top: 2px;
          }

          .print-bill__option {
            color: var(--cas-on-surface-variant);
            grid-template-columns: minmax(0, 1fr) auto;
            padding-left: 8px;
          }

          .print-bill__total {
            grid-template-columns: minmax(0, 1fr) auto;
            row-gap: 4px;
          }

          .print-bill__total span:nth-of-type(3),
          .print-bill__total strong:last-child {
            font-weight: 800;
            margin-top: 4px;
          }

          .print-bill > p {
            margin: 0;
          }

          .print-bill footer {
            margin-top: 16px;
          }
        }
      `}</style>
    </>
  );
}
