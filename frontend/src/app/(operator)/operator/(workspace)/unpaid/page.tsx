import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Khoản chưa thanh toán | CAS",
};

const unpaidRecords = [
  { amount: "320.000đ", closedAt: "18:15", table: "Bàn 09" },
];

export default function OperatorUnpaidPage() {
  return (
    <>
      <header>
        <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
          Vận hành
        </p>
        <h1 className="mt-1 text-3xl font-extrabold">
          Khoản chưa thanh toán
        </h1>
        <p className="mt-2 text-sm text-cas-on-surface-variant">
          Theo dõi các phiên bàn đã đóng khi payment vẫn còn `PENDING`.
        </p>
      </header>

      <ul className="mt-7">
        {unpaidRecords.map((record) => (
          <li
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cas-outline-variant/25 bg-cas-glass p-5 shadow-[0_5px_18px_var(--cas-shadow-color)]"
            key={`${record.table}-${record.closedAt}`}
          >
            <div>
              <p className="font-extrabold">{record.table}</p>
              <p className="mt-1 text-xs text-cas-on-surface-variant">
                Đóng phiên lúc {record.closedAt}
              </p>
            </div>
            <p className="font-extrabold text-cas-primary">{record.amount}</p>
            <button
              className="rounded-xl border border-cas-outline-variant px-4 py-2 text-sm font-extrabold"
              type="button"
            >
              Xem bill snapshot
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
