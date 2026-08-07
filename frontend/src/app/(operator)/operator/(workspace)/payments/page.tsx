import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thanh toán chờ xác nhận | CAS",
};

const payments = [
  { amount: "170.000đ", requestedAt: "19:42", table: "Bàn 05" },
  { amount: "245.000đ", requestedAt: "19:35", table: "Bàn 12" },
  { amount: "95.000đ", requestedAt: "19:28", table: "Bàn 03" },
];

export default function OperatorPaymentsPage() {
  return (
    <>
      <header>
        <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
          Vận hành
        </p>
        <h1 className="mt-1 text-3xl font-extrabold">
          Thanh toán chờ xác nhận
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-cas-on-surface-variant">
          Chỉ xác nhận sau khi loa bên ngoài CAS đã báo giao dịch thành công.
        </p>
      </header>

      <ul className="mt-7 overflow-hidden rounded-2xl border border-cas-outline-variant/25 bg-cas-glass shadow-[0_5px_18px_var(--cas-shadow-color)]">
        {payments.map((payment) => (
          <li
            className="grid gap-3 border-b border-cas-outline-variant/25 p-5 last:border-b-0 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center"
            key={payment.table}
          >
            <p className="font-extrabold">{payment.table}</p>
            <p className="text-sm text-cas-on-surface-variant">
              Yêu cầu lúc {payment.requestedAt}
            </p>
            <p className="font-extrabold text-cas-primary">
              {payment.amount}
            </p>
            <button
              className="w-fit rounded-xl bg-cas-primary px-4 py-2 text-sm font-extrabold text-cas-on-primary"
              type="button"
            >
              Kiểm tra payment
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
