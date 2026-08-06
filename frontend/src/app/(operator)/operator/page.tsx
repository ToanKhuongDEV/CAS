import type { Metadata } from "next";
import Link from "next/link";

import { OperatorBottomNavigation } from "../../../components/operator/operator-bottom-navigation";
import { CasIcon } from "../../../components/ui/cas-icon";

export const metadata: Metadata = {
  title: "Bảng điều khiển nhân viên | CAS",
  description: "Theo dõi các yêu cầu vận hành cần xử lý tại CAS.",
};

type SummaryCard = {
  description: string;
  label: string;
  value: string;
};

const summaryCards: SummaryCard[] = [
  {
    label: "Thanh toán chờ xác nhận",
    value: "03",
    description: "Cần kiểm tra tại quầy",
  },
  {
    label: "Yêu cầu hủy món",
    value: "02",
    description: "Đang chờ phản hồi",
  },
  {
    label: "Khoản chưa thanh toán",
    value: "01",
    description: "Cần theo dõi",
  },
];

const paymentRequests = [
  { table: "Bàn 05", amount: "170.000đ", requestedAt: "19:42", items: "4 món · 3 loại" },
  { table: "Bàn 12", amount: "245.000đ", requestedAt: "19:35", items: "6 món · 5 loại" },
  { table: "Bàn 03", amount: "95.000đ", requestedAt: "19:28", items: "2 món · 2 loại" },
];

const cancellationRequests = [
  {
    table: "Bàn 08",
    item: "Mỳ cay đặc biệt 7 cấp độ",
    quantity: "1 phần",
    requestedAt: "19:40",
  },
  {
    table: "Bàn 01",
    item: "Trà sữa Trân châu Đường đen",
    quantity: "1 ly",
    requestedAt: "19:31",
  },
];

function SectionHeading({
  eyebrow,
  title,
  actionLabel,
  headingId,
}: {
  actionLabel: string;
  eyebrow: string;
  headingId: string;
  title: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[0.68rem] font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight" id={headingId}>{title}</h2>
      </div>
      <button
        className="rounded-lg px-2 py-1 text-sm font-extrabold text-cas-primary transition hover:bg-cas-primary/8 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
        type="button"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export default function OperatorDashboardPage() {
  return (
    <main className="min-h-screen bg-cas-surface text-cas-on-surface">
      <div className="mx-auto grid min-h-screen max-w-[96rem] lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-cas-outline-variant/35 bg-cas-surface-container/60 px-5 py-7 lg:block">
          <div className="flex items-center justify-between gap-4 lg:block">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-cas-primary text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)]">
                <CasIcon className="size-6" name="restaurant" />
              </span>
              <div>
                <p className="text-sm font-extrabold">CAS Snail & Bar</p>
                <p className="text-xs text-cas-on-surface-variant">Khu vực vận hành</p>
              </div>
            </div>
            <span className="rounded-full bg-cas-secondary-container/25 px-3 py-1 text-xs font-extrabold text-cas-secondary">
              Đang trực
            </span>
          </div>

          <nav className="mt-10 flex flex-col gap-2" aria-label="Điều hướng nhân viên">
            <Link className="flex items-center gap-3 rounded-xl bg-cas-primary px-4 py-3 text-sm font-extrabold text-cas-on-primary" href="/operator">
              <CasIcon className="size-5" name="table" />
              Tổng quan
            </Link>
            <a className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-cas-on-surface-variant transition hover:bg-cas-primary/8" href="#pending-payments-title">
              <CasIcon className="size-5" name="payment" />
              Thanh toán
            </a>
            <a className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-cas-on-surface-variant transition hover:bg-cas-primary/8" href="#cancellation-requests-title">
              <CasIcon className="size-5" name="minus" />
              Hủy món
            </a>
          </nav>

          <div className="mt-5 hidden rounded-2xl bg-cas-secondary-container/20 p-4 lg:block">
            <p className="text-sm font-extrabold">Lưu ý thanh toán</p>
            <p className="mt-2 text-xs leading-relaxed text-cas-on-surface-variant">
              Chỉ xác nhận sau khi đã kiểm tra tín hiệu chuyển khoản thành công tại quầy.
            </p>
          </div>
        </aside>

        <div className="px-5 pt-7 pb-28 sm:px-8 lg:px-10 lg:py-9">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-cas-on-surface-variant">06 tháng 08</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Bảng điều khiển</h1>
              <p className="mt-2 text-sm text-cas-on-surface-variant">Theo dõi các yêu cầu cần xử lý trong ca làm việc.</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-cas-surface-container px-3 py-2 shadow-[0_5px_18px_var(--cas-shadow-color)]">
              <span className="grid size-9 place-items-center rounded-xl bg-cas-primary/10 text-cas-primary">
                <CasIcon className="size-5" name="user" />
              </span>
              <div className="pr-2">
                <p className="text-sm font-extrabold">Nhân viên CAS</p>
                <p className="text-xs text-cas-on-surface-variant">Vận hành</p>
              </div>
            </div>
          </header>

          <section className="mt-8 grid gap-3 lg:grid-cols-3" aria-label="Tổng quan ca làm">
            {summaryCards.map((card) => (
              <article className="rounded-2xl bg-cas-surface-container px-5 py-4 shadow-[0_5px_18px_var(--cas-shadow-color)]" key={card.label}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-extrabold">{card.label}</p>
                    <p className="mt-1 text-xs text-cas-on-surface-variant">{card.description}</p>
                  </div>
                  <strong className="text-2xl font-extrabold tracking-tight text-cas-primary">{card.value}</strong>
                </div>
              </article>
            ))}
          </section>

          <div className="mt-9 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.8fr)]">
            <section aria-labelledby="pending-payments-title">
              <SectionHeading actionLabel="Xem tất cả" eyebrow="Ưu tiên xử lý" headingId="pending-payments-title" title="Thanh toán chờ xác nhận" />
              <div className="mt-4 overflow-hidden rounded-2xl bg-cas-surface-container shadow-[0_5px_18px_var(--cas-shadow-color)]">
                <div className="hidden grid-cols-[1.1fr_1fr_0.8fr_auto] gap-4 border-b border-cas-outline-variant/35 px-5 py-3 text-[0.68rem] font-extrabold tracking-[0.1em] text-cas-on-surface-variant uppercase sm:grid">
                  <span>Bàn</span>
                  <span>Yêu cầu lúc</span>
                  <span>Số tiền</span>
                  <span className="text-right">Trạng thái</span>
                </div>
                <ul className="divide-y divide-cas-outline-variant/35">
                  {paymentRequests.map((request) => (
                    <li className="grid gap-3 px-5 py-4 sm:grid-cols-[1.1fr_1fr_0.8fr_auto] sm:items-center sm:gap-4" key={request.table}>
                      <div>
                        <p className="font-extrabold">{request.table}</p>
                        <p className="mt-1 text-xs text-cas-on-surface-variant">{request.items}</p>
                      </div>
                      <p className="text-sm text-cas-on-surface-variant">{request.requestedAt}</p>
                      <p className="text-base font-extrabold text-cas-primary">{request.amount}</p>
                      <span className="w-fit rounded-full bg-cas-tertiary-container/15 px-3 py-1 text-xs font-extrabold text-cas-tertiary">Chờ xác nhận</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section aria-labelledby="cancellation-requests-title">
              <SectionHeading actionLabel="Xem tất cả" eyebrow="Cần phản hồi" headingId="cancellation-requests-title" title="Yêu cầu hủy món" />
              <ul className="mt-4 space-y-3">
                {cancellationRequests.map((request) => (
                  <li className="rounded-2xl border border-cas-outline-variant/35 bg-cas-surface-container p-4 shadow-[0_5px_18px_var(--cas-shadow-color)]" key={`${request.table}-${request.item}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-cas-primary/10 text-cas-primary">
                          <CasIcon className="size-5" name="minus" />
                        </span>
                        <div>
                          <p className="font-extrabold">{request.table}</p>
                          <p className="text-xs text-cas-on-surface-variant">Gửi lúc {request.requestedAt}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-cas-primary/10 px-2.5 py-1 text-xs font-extrabold text-cas-primary">Chờ xác nhận</span>
                    </div>
                    <p className="mt-4 text-sm font-bold">{request.item}</p>
                    <p className="mt-1 text-xs text-cas-on-surface-variant">Số lượng yêu cầu hủy: {request.quantity}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="mt-8 rounded-2xl border border-cas-outline-variant/35 bg-cas-surface-container/65 p-5" aria-label="Nhắc nhở vận hành">
            <div className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-cas-secondary-container/25 text-cas-secondary">
                <CasIcon className="size-5" name="info" />
              </span>
              <div>
                <h2 className="font-extrabold">Nhắc nhở trong ca</h2>
                <p className="mt-1 text-sm leading-relaxed text-cas-on-surface-variant">
                  Các số liệu trên là dữ liệu mẫu cho giao diện. Dashboard sẽ nhận dữ liệu và cập nhật trạng thái từ API khi backend sẵn sàng.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <OperatorBottomNavigation />
    </main>
  );
}
