import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yêu cầu hủy món | CAS",
};

const requests = [
  {
    item: "Mỳ cay đặc biệt 7 cấp độ",
    quantity: "1 phần",
    requestedAt: "19:40",
    table: "Bàn 08",
  },
  {
    item: "Trà sữa Trân châu Đường đen",
    quantity: "1 ly",
    requestedAt: "19:31",
    table: "Bàn 01",
  },
];

export default function OperatorCancellationsPage() {
  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold">Yêu cầu hủy món</h1>
        <p className="mt-2 text-sm text-cas-on-surface-variant">
          Xem các yêu cầu đang chờ nhân viên đồng ý hoặc từ chối.
        </p>
      </header>

      <ul className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {requests.map((request) => (
          <li
            className="rounded-2xl border border-cas-outline-variant/25 bg-cas-glass p-5 shadow-[0_5px_18px_var(--cas-shadow-color)]"
            key={`${request.table}-${request.item}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-extrabold">{request.table}</p>
                <p className="mt-1 text-xs text-cas-on-surface-variant">
                  Gửi lúc {request.requestedAt}
                </p>
              </div>
              <span className="rounded-full bg-cas-primary/10 px-3 py-1 text-xs font-extrabold text-cas-primary">
                Chờ xác nhận
              </span>
            </div>
            <p className="mt-5 text-sm font-bold">{request.item}</p>
            <p className="mt-1 text-xs text-cas-on-surface-variant">
              Số lượng yêu cầu hủy: {request.quantity}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                className="rounded-xl bg-cas-secondary px-4 py-2 text-sm font-extrabold text-cas-on-primary"
                type="button"
              >
                Đồng ý
              </button>
              <button
                className="rounded-xl border border-cas-outline-variant px-4 py-2 text-sm font-extrabold"
                type="button"
              >
                Từ chối
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
