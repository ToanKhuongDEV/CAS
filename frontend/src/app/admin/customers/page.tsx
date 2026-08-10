"use client";

import { useMemo, useState } from "react";

import { CasIcon } from "../../../components/ui/cas-icon";

type CustomerSession = {
  id: string;
  openedAt: string;
  table: string;
  totalAmount: number;
  paymentStatus: "PAID" | "UNPAID" | "PAYMENT_PENDING";
};

type Customer = {
  id: number;
  displayName: string;
  phone: string;
  lastVisitDate: string;
  lastVisitAt: string;
  sessions: CustomerSession[];
};

const mockCustomers: Customer[] = [
  {
    id: 1,
    displayName: "Nguyễn Minh Anh",
    phone: "0901234567",
    lastVisitDate: "2026-08-10",
    lastVisitAt: "10/08/2026 · 18:42",
    sessions: [
      {
        id: "SES-20260810-008",
        openedAt: "10/08/2026 · 18:42",
        table: "Bàn 08",
        totalAmount: 285000,
        paymentStatus: "PAID",
      },
      {
        id: "SES-20260724-003",
        openedAt: "24/07/2026 · 19:10",
        table: "Bàn 03",
        totalAmount: 156000,
        paymentStatus: "PAID",
      },
    ],
  },
  {
    id: 2,
    displayName: "Trần Quốc Bảo",
    phone: "0912345678",
    lastVisitDate: "2026-08-10",
    lastVisitAt: "10/08/2026 · 17:15",
    sessions: [
      {
        id: "SES-20260810-004",
        openedAt: "10/08/2026 · 17:15",
        table: "Bàn 04",
        totalAmount: 198000,
        paymentStatus: "PAYMENT_PENDING",
      },
    ],
  },
  {
    id: 3,
    displayName: "Lê Thu Hà",
    phone: "0987654321",
    lastVisitDate: "2026-08-09",
    lastVisitAt: "09/08/2026 · 20:05",
    sessions: [
      {
        id: "SES-20260809-011",
        openedAt: "09/08/2026 · 20:05",
        table: "Bàn 11",
        totalAmount: 342000,
        paymentStatus: "UNPAID",
      },
      {
        id: "SES-20260715-006",
        openedAt: "15/07/2026 · 18:30",
        table: "Bàn 06",
        totalAmount: 92000,
        paymentStatus: "PAID",
      },
      {
        id: "SES-20260628-002",
        openedAt: "28/06/2026 · 12:17",
        table: "Bàn 02",
        totalAmount: 127000,
        paymentStatus: "PAID",
      },
    ],
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function maskPhone(phone: string) {
  return `${phone.slice(0, 3)} ••• •${phone.slice(-3)}`;
}

const statusLabel: Record<CustomerSession["paymentStatus"], string> = {
  PAID: "Đã thanh toán",
  PAYMENT_PENDING: "Chờ thanh toán",
  UNPAID: "Chưa thanh toán",
};

const statusClassName: Record<CustomerSession["paymentStatus"], string> = {
  PAID: "bg-cas-secondary-container/40 text-cas-secondary",
  PAYMENT_PENDING: "bg-cas-tertiary-container/30 text-cas-tertiary",
  UNPAID: "bg-cas-error-container text-cas-on-error-container",
};

export default function AdminCustomersPage() {
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const customers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi-VN");
    return mockCustomers.filter(
      (customer) =>
        (!normalizedQuery ||
          customer.displayName.toLocaleLowerCase("vi-VN").includes(normalizedQuery) ||
          customer.phone.includes(normalizedQuery)) &&
        (!fromDate || customer.lastVisitDate >= fromDate) &&
        (!toDate || customer.lastVisitDate <= toDate),
    );
  }, [fromDate, query, toDate]);

  const selectedCustomer = mockCustomers.find((customer) => customer.id === selectedCustomerId) ?? null;
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-black text-cas-on-surface">Khách hàng</h1>
        </div>

        <div className="grid w-full gap-2 sm:grid-cols-2 xl:max-w-3xl xl:grid-cols-[minmax(15rem,1fr)_auto_auto]">
          <label className="flex items-center gap-2 rounded-xl border border-cas-outline-variant/40 bg-cas-glass px-3 py-2.5">
            <CasIcon className="size-4 shrink-0 text-cas-on-surface-variant" name="search" />
            <span className="sr-only">Tìm kiếm khách hàng</span>
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-cas-on-surface outline-none placeholder:text-cas-on-surface-variant"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên hoặc số điện thoại"
              type="search"
              value={query}
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-cas-outline-variant/40 bg-cas-glass px-3 py-2">
            <span className="shrink-0 text-xs font-bold text-cas-on-surface-variant">Từ ngày</span>
            <input
              aria-label="Lọc từ ngày"
              className="min-w-0 bg-transparent text-xs font-bold text-cas-on-surface outline-none"
              onChange={(event) => setFromDate(event.target.value)}
              type="date"
              value={fromDate}
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-cas-outline-variant/40 bg-cas-glass px-3 py-2">
            <span className="shrink-0 text-xs font-bold text-cas-on-surface-variant">Đến ngày</span>
            <input
              aria-label="Lọc đến ngày"
              className="min-w-0 bg-transparent text-xs font-bold text-cas-on-surface outline-none"
              min={fromDate || undefined}
              onChange={(event) => setToDate(event.target.value)}
              type="date"
              value={toDate}
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-cas-outline-variant/30 bg-cas-glass shadow-xs">
        <div className="border-b border-cas-outline-variant/20 px-5 py-4">
          <h2 className="text-sm font-black text-cas-on-surface">Danh sách khách hàng</h2>
          <p className="mt-1 text-xs text-cas-on-surface-variant">Chọn một khách để xem lịch sử phiên bàn.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-xs">
            <thead className="border-b border-cas-outline-variant/20 bg-cas-surface-container/60 font-extrabold uppercase text-cas-on-surface-variant">
              <tr>
                <th className="px-5 py-3">Khách hàng</th>
                <th className="px-5 py-3">Số điện thoại</th>
                <th className="px-5 py-3">Lượt mở bàn</th>
                <th className="px-5 py-3">Lần gần nhất</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cas-outline-variant/15">
              {customers.map((customer) => (
                <tr key={customer.id} className="transition hover:bg-cas-surface-container/30">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-xl bg-cas-primary/10 text-cas-primary">
                        <CasIcon className="size-4" name="user" />
                      </span>
                      <span className="font-black text-cas-on-surface">{customer.displayName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-cas-on-surface-variant">{maskPhone(customer.phone)}</td>
                  <td className="px-5 py-4 font-black text-cas-on-surface">{customer.sessions.length}</td>
                  <td className="px-5 py-4 font-bold text-cas-on-surface-variant">{customer.lastVisitAt}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      className="rounded-lg px-3 py-1.5 text-xs font-black text-cas-secondary transition hover:bg-cas-secondary-container/30 focus-visible:outline-3 focus-visible:outline-cas-focus-ring"
                      onClick={() => setSelectedCustomerId(customer.id)}
                      type="button"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {customers.length === 0 && (
          <div className="px-5 py-12 text-center">
            <CasIcon className="mx-auto size-8 text-cas-on-surface-variant" name="users" />
            <p className="mt-3 text-sm font-black text-cas-on-surface">Không tìm thấy khách hàng</p>
            <p className="mt-1 text-xs text-cas-on-surface-variant">Thử lại bằng tên hoặc số điện thoại khác.</p>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <CustomerDetail customer={selectedCustomer} onClose={() => setSelectedCustomerId(null)} />
      )}
    </div>
  );
}

function CustomerDetail({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section aria-labelledby="customer-detail-title" className="my-auto w-full max-w-3xl rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-cas-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-cas-primary/10 text-cas-primary">
              <CasIcon className="size-5" name="user" />
            </span>
            <div>
              <p className="text-xs font-bold text-cas-on-surface-variant">Hồ sơ tra cứu</p>
              <h2 id="customer-detail-title" className="text-lg font-black text-cas-on-surface">
                {customer.displayName}
              </h2>
              <p className="text-xs font-bold text-cas-on-surface-variant">{customer.phone}</p>
            </div>
          </div>
          <button
            aria-label="Đóng chi tiết khách hàng"
            className="grid size-9 place-items-center rounded-xl text-cas-on-surface-variant transition hover:bg-cas-surface-container hover:text-cas-on-surface focus-visible:outline-3 focus-visible:outline-cas-focus-ring"
            onClick={onClose}
            type="button"
          >
            <CasIcon className="size-4" name="close" />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-cas-on-surface-variant">Tổng lượt mở bàn</p>
            <p className="text-xl font-black text-cas-on-surface">{customer.sessions.length} lượt</p>
          </div>
          <p className="text-right text-xs font-bold text-cas-on-surface-variant">Gần nhất: {customer.lastVisitAt}</p>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-cas-outline-variant/25">
          <table className="w-full min-w-[36rem] text-left text-xs">
            <thead className="bg-cas-surface-container/60 font-extrabold uppercase text-cas-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Phiên bàn</th>
                <th className="px-4 py-3">Thời điểm</th>
                <th className="px-4 py-3">Bàn</th>
                <th className="px-4 py-3">Tổng tiền</th>
                <th className="px-4 py-3">Thanh toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cas-outline-variant/15">
              {customer.sessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-4 py-3 font-black text-cas-on-surface">{session.id}</td>
                  <td className="px-4 py-3 font-bold text-cas-on-surface-variant">{session.openedAt}</td>
                  <td className="px-4 py-3 font-bold text-cas-on-surface">{session.table}</td>
                  <td className="px-4 py-3 font-black text-cas-on-surface">{formatCurrency(session.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-black ${statusClassName[session.paymentStatus]}`}>
                      {statusLabel[session.paymentStatus]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-cas-on-surface-variant">
          Trang hiện dùng dữ liệu mẫu. Khi kết nối API, lịch sử hiển thị sẽ lấy từ session, order, payment và khoản chưa thanh toán thuộc đúng cửa hàng.
        </p>
      </section>
    </div>
  );
}
