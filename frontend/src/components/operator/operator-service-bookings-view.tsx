"use client";

import { useState } from "react";

import { CasIcon } from "../ui/cas-icon";

type PaymentStatus = "PAY_LATER" | "PENDING" | "PAID" | "CANCELLED";
type CreateServiceField = "clientName" | "clientPhone" | "serviceName" | "agreedPrice";

type ClientAccount = {
  id: string;
  name: string;
  phone: string;
};

type ServiceBooking = {
  agreedPrice: number;
  clientAccountId: string;
  createdAt: string;
  createdByName: string;
  id: string;
  paymentStatus: PaymentStatus;
  serviceName: string;
};

const clientAccounts: ClientAccount[] = [
  { id: "client-001", name: "Nguyễn Minh Anh", phone: "0901 234 567" },
  { id: "client-002", name: "Trần Quốc Bảo", phone: "0912 345 678" },
  { id: "client-003", name: "Lê Hoài Phương", phone: "0987 654 321" },
];

const initialBookings: ServiceBooking[] = [
  {
    agreedPrice: 1500000,
    clientAccountId: "client-001",
    createdAt: "09:20 11/08/2026",
    createdByName: "Nguyễn Văn A",
    id: "service-001",
    paymentStatus: "PAY_LATER",
    serviceName: "Đặt tiệc sinh nhật 12 khách",
  },
  {
    agreedPrice: 2800000,
    clientAccountId: "client-002",
    createdAt: "14:05 10/08/2026",
    createdByName: "Nguyễn Văn A",
    id: "service-002",
    paymentStatus: "PENDING",
    serviceName: "Set trang trí sự kiện tại bàn",
  },
  {
    agreedPrice: 950000,
    clientAccountId: "client-003",
    createdAt: "11:40 09/08/2026",
    createdByName: "Trần Thị B",
    id: "service-003",
    paymentStatus: "PAID",
    serviceName: "Đặt trước combo liên hoan",
  },
];

const statusLabels: Record<PaymentStatus, string> = {
  CANCELLED: "Đã hủy",
  PAY_LATER: "Thanh toán sau",
  PENDING: "Chờ xác nhận",
  PAID: "Đã thanh toán",
};

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function formatMoneyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("en-US") : "";
}

function getStatusClass(status: PaymentStatus) {
  if (status === "CANCELLED") {
    return "bg-cas-error-container/40 text-cas-error";
  }

  if (status === "PAID") {
    return "bg-cas-secondary-container/40 text-cas-secondary";
  }

  if (status === "PENDING") {
    return "bg-cas-primary/10 text-cas-primary";
  }

  return "bg-cas-surface-container text-cas-on-surface-variant";
}

export function OperatorServiceBookingsView() {
  const [bookings, setBookings] = useState<ServiceBooking[]>(initialBookings);
  const [clients, setClients] = useState<ClientAccount[]>(clientAccounts);
  const [filter, setFilter] = useState<"ALL" | PaymentStatus>("ALL");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [agreedPrice, setAgreedPrice] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"PAY_LATER" | "PENDING">("PAY_LATER");
  const [message, setMessage] = useState<string | null>(null);
  const [bookingToConfirm, setBookingToConfirm] = useState<ServiceBooking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<ServiceBooking | null>(null);
  const [createFormErrors, setCreateFormErrors] = useState<
    Partial<Record<CreateServiceField, string>>
  >({});

  const visibleBookings = bookings.filter(
    (booking) => filter === "ALL" || booking.paymentStatus === filter,
  );
  const pendingCount = bookings.filter((booking) => booking.paymentStatus === "PENDING").length;
  const outstandingAmount = bookings
    .filter((booking) => booking.paymentStatus !== "PAID" && booking.paymentStatus !== "CANCELLED")
    .reduce((total, booking) => total + booking.agreedPrice, 0);

  function getClient(clientAccountId: string) {
    return clients.find((client) => client.id === clientAccountId);
  }

  function clearCreateFieldError(field: CreateServiceField) {
    setCreateFormErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateCreateForm() {
    const errors: Partial<Record<CreateServiceField, string>> = {};
    const normalizedPhone = normalizePhone(clientPhone);
    const price = Number(agreedPrice.replace(/,/g, ""));

    if (!clientName.trim()) errors.clientName = "Vui lòng nhập tên khách hàng.";
    else if (clientName.trim().length > 150) errors.clientName = "Tên khách hàng tối đa 150 ký tự.";

    if (!clientPhone.trim()) errors.clientPhone = "Vui lòng nhập số điện thoại.";
    else if (!/^[0-9\s()+.-]+$/.test(clientPhone) || normalizedPhone.length > 20)
      errors.clientPhone = "Số điện thoại chỉ được chứa chữ số và tối đa 20 chữ số.";

    if (!serviceName.trim()) errors.serviceName = "Vui lòng nhập tên dịch vụ.";
    else if (serviceName.trim().length > 255) errors.serviceName = "Tên dịch vụ tối đa 255 ký tự.";

    if (!agreedPrice || !Number.isFinite(price) || price < 0)
      errors.agreedPrice = "Vui lòng nhập giá đã thỏa thuận hợp lệ.";
    else if (price > 9_999_999_999_999)
      errors.agreedPrice = "Giá đã thỏa thuận vượt quá giới hạn cho phép.";

    setCreateFormErrors(errors);
    return { errors, normalizedPhone, price };
  }

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { errors, normalizedPhone, price } = validateCreateForm();
    if (Object.keys(errors).length > 0) return;

    const existingClient = clients.find(
      (client) => normalizePhone(client.phone) === normalizedPhone,
    );
    const clientAccount = existingClient ?? {
      id: `client-${Date.now()}`,
      name: clientName.trim(),
      phone: clientPhone.trim(),
    };

    const now = new Date();
    const createdAt = `${now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ${now.toLocaleDateString("vi-VN")}`;
    const newBooking: ServiceBooking = {
      agreedPrice: price,
      clientAccountId: clientAccount.id,
      createdAt,
      createdByName: "Nhân viên đang đăng nhập",
      id: `service-${Date.now()}`,
      paymentStatus,
      serviceName: serviceName.trim(),
    };

    if (!existingClient) {
      setClients((previous) => [...previous, clientAccount]);
    }
    setBookings((previous) => [newBooking, ...previous]);
    setFilter("ALL");
    setClientName("");
    setClientPhone("");
    setServiceName("");
    setAgreedPrice("");
    setPaymentStatus("PAY_LATER");
    setCreateFormErrors({});
    setIsCreateDialogOpen(false);
    setMessage(
      paymentStatus === "PENDING"
        ? "Đã tạo dịch vụ và chuyển sang chờ xác nhận thanh toán."
        : "Đã tạo dịch vụ với trạng thái thanh toán sau.",
    );
  }

  function handleConfirmPayment(bookingId: string) {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) return;

    setBookings((previous) =>
      previous.map((item) => (item.id === bookingId ? { ...item, paymentStatus: "PAID" } : item)),
    );
    setBookingToConfirm(null);
    setMessage(`Đã xác nhận thanh toán cho “${booking.serviceName}”.`);
  }

  function handleCancelBooking(bookingId: string) {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) return;

    setBookings((previous) =>
      previous.map((item) =>
        item.id === bookingId ? { ...item, paymentStatus: "CANCELLED" } : item,
      ),
    );
    setBookingToCancel(null);
    setMessage(`Đã hủy dịch vụ “${booking.serviceName}” vì khách không tiếp tục đặt.`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-cas-on-surface">Các dịch vụ đặt trước</h1>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cas-primary px-4 py-2.5 text-sm font-extrabold text-cas-on-primary transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
          onClick={() => setIsCreateDialogOpen(true)}
          type="button"
        >
          <CasIcon className="size-4" name="plus" />
          Tạo dịch vụ
        </button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="Tóm tắt dịch vụ thêm">
        <article className="rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-4 shadow-xs">
          <p className="text-xs font-bold text-cas-on-surface-variant">Chờ xác nhận thanh toán</p>
          <p className="mt-2 text-2xl font-black text-cas-primary">{pendingCount}</p>
        </article>
        <article className="rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-4 shadow-xs">
          <p className="text-xs font-bold text-cas-on-surface-variant">
            Tổng giá trị chưa hoàn tất
          </p>
          <p className="mt-2 text-2xl font-black text-cas-on-surface">
            {outstandingAmount.toLocaleString("vi-VN")}đ
          </p>
        </article>
      </section>

      <div className="flex flex-wrap items-center gap-2 border-b border-cas-outline-variant/20 pb-4">
        <span className="mr-1 text-xs font-bold text-cas-on-surface-variant">Trạng thái:</span>
        {(["ALL", "PAY_LATER", "PENDING", "PAID", "CANCELLED"] as const).map((status) => (
          <button
            className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
              filter === status
                ? "bg-cas-secondary text-cas-on-secondary shadow-xs"
                : "bg-cas-surface-container/60 text-cas-on-surface-variant hover:text-cas-on-surface"
            }`}
            key={status}
            onClick={() => setFilter(status)}
            type="button"
          >
            {status === "ALL" ? "Tất cả" : statusLabels[status]}
          </button>
        ))}
      </div>

      {message ? (
        <div
          className="flex items-center justify-between gap-3 rounded-xl border border-cas-secondary/30 bg-cas-secondary-container/20 p-4 text-sm font-bold text-cas-secondary"
          role="status"
        >
          <span className="flex items-center gap-2">
            <CasIcon className="size-5" name="check" />
            {message}
          </span>
          <button
            className="text-xs underline hover:no-underline"
            onClick={() => setMessage(null)}
            type="button"
          >
            Ẩn
          </button>
        </div>
      ) : null}

      <ul className="grid gap-4" aria-label="Danh sách dịch vụ thêm">
        {visibleBookings.map((booking) => {
          const client = getClient(booking.clientAccountId);
          return (
            <li
              className="flex flex-col gap-4 rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between"
              key={booking.id}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-black text-cas-on-surface">
                    {booking.serviceName}
                  </h2>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-[0.7rem] font-black ${getStatusClass(booking.paymentStatus)}`}
                  >
                    {statusLabels[booking.paymentStatus]}
                  </span>
                </div>
                <p className="text-sm font-bold text-cas-on-surface-variant">
                  {client?.name} <span className="font-medium">· {client?.phone}</span>
                </p>
                <p className="text-xs text-cas-on-surface-variant">
                  Tạo bởi {booking.createdByName} · {booking.createdAt}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <p className="text-xl font-black text-cas-primary">
                  {booking.agreedPrice.toLocaleString("vi-VN")}đ
                </p>
                {booking.paymentStatus !== "PAID" && booking.paymentStatus !== "CANCELLED" ? (
                  <button
                    className="rounded-xl border border-cas-secondary/40 px-3.5 py-2 text-xs font-extrabold text-cas-secondary transition hover:bg-cas-secondary-container/30 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                    onClick={() => setBookingToConfirm(booking)}
                    type="button"
                  >
                    Xác nhận đã thanh toán
                  </button>
                ) : null}
                {booking.paymentStatus !== "PAID" && booking.paymentStatus !== "CANCELLED" ? (
                  <button
                    className="rounded-xl border border-cas-error/40 px-3.5 py-2 text-xs font-extrabold text-cas-error transition hover:bg-cas-error-container/30 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                    onClick={() => setBookingToCancel(booking)}
                    type="button"
                  >
                    Hủy dịch vụ
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      {isCreateDialogOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsCreateDialogOpen(false);
          }}
        >
          <form
            aria-labelledby="create-service-title"
            className="my-auto w-full max-w-lg rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl"
            onSubmit={handleCreate}
          >
            <div className="flex items-start justify-between gap-4 border-b border-cas-outline-variant/20 pb-4">
              <div>
                <p className="text-xs font-bold text-cas-secondary">Đã chốt qua Zalo</p>
                <h2
                  className="mt-1 text-xl font-black text-cas-on-surface"
                  id="create-service-title"
                >
                  Tạo dịch vụ thêm
                </h2>
              </div>
              <button
                aria-label="Đóng hộp thoại tạo dịch vụ"
                className="grid size-9 place-items-center rounded-xl text-cas-on-surface-variant transition hover:bg-cas-surface-container"
                onClick={() => setIsCreateDialogOpen(false)}
                type="button"
              >
                <CasIcon className="size-4 rotate-45" name="plus" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold text-cas-on-surface-variant">Tên khách *</span>
                  <input
                    aria-describedby={createFormErrors.clientName ? "client-name-error" : undefined}
                    aria-invalid={Boolean(createFormErrors.clientName)}
                    className="mt-1.5 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2.5 text-sm font-medium text-cas-on-surface outline-none focus:ring-2 focus:ring-cas-primary"
                    onChange={(event) => {
                      setClientName(event.target.value);
                      clearCreateFieldError("clientName");
                    }}
                    placeholder="Ví dụ: Nguyễn Minh Anh"
                    required
                    value={clientName}
                  />
                  {createFormErrors.clientName ? (
                    <p className="mt-1 text-xs font-medium text-cas-error" id="client-name-error">
                      {createFormErrors.clientName}
                    </p>
                  ) : null}
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-cas-on-surface-variant">
                    Số điện thoại *
                  </span>
                  <input
                    aria-describedby={
                      createFormErrors.clientPhone ? "client-phone-error" : undefined
                    }
                    aria-invalid={Boolean(createFormErrors.clientPhone)}
                    className="mt-1.5 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2.5 text-sm font-medium text-cas-on-surface outline-none focus:ring-2 focus:ring-cas-primary"
                    inputMode="tel"
                    onChange={(event) => {
                      setClientPhone(event.target.value);
                      clearCreateFieldError("clientPhone");
                    }}
                    placeholder="Ví dụ: 0901 234 567"
                    required
                    type="tel"
                    value={clientPhone}
                  />
                  {createFormErrors.clientPhone ? (
                    <p className="mt-1 text-xs font-medium text-cas-error" id="client-phone-error">
                      {createFormErrors.clientPhone}
                    </p>
                  ) : null}
                </label>
              </div>
              <p className="text-xs text-cas-on-surface-variant">
                Số điện thoại dùng để tìm hoặc tạo tài khoản khách; tên không dùng để nhận diện.
              </p>
              <label className="block">
                <span className="text-xs font-bold text-cas-on-surface-variant">
                  Tên dịch vụ đã chốt *
                </span>
                <input
                  aria-describedby={createFormErrors.serviceName ? "service-name-error" : undefined}
                  aria-invalid={Boolean(createFormErrors.serviceName)}
                  className="mt-1.5 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2.5 text-sm font-bold text-cas-on-surface outline-none focus:ring-2 focus:ring-cas-primary"
                  onChange={(event) => {
                    setServiceName(event.target.value);
                    clearCreateFieldError("serviceName");
                  }}
                  placeholder="Ví dụ: Đặt tiệc sinh nhật 12 khách"
                  required
                  value={serviceName}
                />
                {createFormErrors.serviceName ? (
                  <p className="mt-1 text-xs font-medium text-cas-error" id="service-name-error">
                    {createFormErrors.serviceName}
                  </p>
                ) : null}
              </label>
              <label className="block">
                <span className="text-xs font-bold text-cas-on-surface-variant">
                  Giá đã thỏa thuận (VNĐ) *
                </span>
                <input
                  aria-describedby={createFormErrors.agreedPrice ? "agreed-price-error" : undefined}
                  aria-invalid={Boolean(createFormErrors.agreedPrice)}
                  className="mt-1.5 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2.5 text-sm font-medium text-cas-on-surface outline-none focus:ring-2 focus:ring-cas-primary"
                  inputMode="numeric"
                  onChange={(event) => {
                    setAgreedPrice(formatMoneyInput(event.target.value));
                    clearCreateFieldError("agreedPrice");
                  }}
                  placeholder="Ví dụ: 1,500,000"
                  required
                  type="text"
                  value={agreedPrice}
                />
                {createFormErrors.agreedPrice ? (
                  <p className="mt-1 text-xs font-medium text-cas-error" id="agreed-price-error">
                    {createFormErrors.agreedPrice}
                  </p>
                ) : null}
              </label>
              <fieldset>
                <legend className="text-xs font-bold text-cas-on-surface-variant">
                  Thanh toán
                </legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-cas-outline-variant/35 p-3 text-sm">
                    <input
                      checked={paymentStatus === "PAY_LATER"}
                      name="service-payment-status"
                      onChange={() => setPaymentStatus("PAY_LATER")}
                      type="radio"
                    />
                    <span>
                      <strong className="block text-cas-on-surface">Thanh toán sau</strong>
                      <span className="text-xs text-cas-on-surface-variant">
                        Lưu trạng thái PAY_LATER.
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-cas-outline-variant/35 p-3 text-sm">
                    <input
                      checked={paymentStatus === "PENDING"}
                      name="service-payment-status"
                      onChange={() => setPaymentStatus("PENDING")}
                      type="radio"
                    />
                    <span>
                      <strong className="block text-cas-on-surface">Thanh toán ngay</strong>
                      <span className="text-xs text-cas-on-surface-variant">
                        Tạo trạng thái PENDING để xác nhận.
                      </span>
                    </span>
                  </label>
                </div>
              </fieldset>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="rounded-xl border border-cas-outline-variant/40 px-4 py-2.5 text-sm font-extrabold text-cas-on-surface transition hover:bg-cas-surface-container"
                onClick={() => setIsCreateDialogOpen(false)}
                type="button"
              >
                Hủy
              </button>
              <button
                className="rounded-xl bg-cas-primary px-4 py-2.5 text-sm font-extrabold text-cas-on-primary transition hover:bg-cas-primary-hover"
                type="submit"
              >
                Lưu dịch vụ
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {bookingToConfirm ? (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setBookingToConfirm(null);
          }}
        >
          <section
            aria-describedby="confirm-service-payment-description"
            aria-labelledby="confirm-service-payment-title"
            aria-modal="true"
            className="w-full max-w-md rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl"
            role="alertdialog"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cas-primary/10 text-cas-primary">
                <CasIcon className="size-5" name="payment" />
              </span>
              <div>
                <h2
                  className="text-lg font-black text-cas-on-surface"
                  id="confirm-service-payment-title"
                >
                  Xác nhận đã thanh toán?
                </h2>
                <p
                  className="mt-1 text-sm text-cas-on-surface-variant"
                  id="confirm-service-payment-description"
                >
                  Hãy chỉ xác nhận sau khi đã kiểm tra khoản tiền của khách.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 rounded-2xl border border-cas-outline-variant/25 bg-cas-surface-container/40 p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-cas-on-surface-variant">Dịch vụ</span>
                <strong className="text-right text-cas-on-surface">
                  {bookingToConfirm.serviceName}
                </strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-cas-on-surface-variant">Khách hàng</span>
                <strong className="text-cas-on-surface">
                  {getClient(bookingToConfirm.clientAccountId)?.name}
                </strong>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-cas-outline-variant/20 pt-2">
                <span className="text-cas-on-surface-variant">Số tiền</span>
                <strong className="text-lg text-cas-primary">
                  {bookingToConfirm.agreedPrice.toLocaleString("vi-VN")}đ
                </strong>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="rounded-xl border border-cas-outline-variant/40 px-4 py-2.5 text-sm font-extrabold text-cas-on-surface transition hover:bg-cas-surface-container"
                onClick={() => setBookingToConfirm(null)}
                type="button"
              >
                Hủy
              </button>
              <button
                className="rounded-xl bg-cas-secondary px-4 py-2.5 text-sm font-extrabold text-cas-on-secondary transition hover:brightness-95"
                onClick={() => handleConfirmPayment(bookingToConfirm.id)}
                type="button"
              >
                Xác nhận đã thanh toán
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {bookingToCancel ? (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setBookingToCancel(null);
          }}
        >
          <section
            aria-describedby="cancel-service-description"
            aria-labelledby="cancel-service-title"
            aria-modal="true"
            className="w-full max-w-md rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl"
            role="alertdialog"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cas-error-container/40 text-cas-error">
                <CasIcon className="size-5" name="close" />
              </span>
              <div>
                <h2 className="text-lg font-black text-cas-on-surface" id="cancel-service-title">
                  Hủy dịch vụ?
                </h2>
                <p
                  className="mt-1 text-sm text-cas-on-surface-variant"
                  id="cancel-service-description"
                >
                  Dịch vụ sẽ được đánh dấu đã hủy và không thể xác nhận thanh toán.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-cas-outline-variant/25 bg-cas-surface-container/40 p-4 text-sm">
              <p className="font-extrabold text-cas-on-surface">{bookingToCancel.serviceName}</p>
              <p className="mt-1 text-cas-on-surface-variant">
                {getClient(bookingToCancel.clientAccountId)?.name} ·{" "}
                {bookingToCancel.agreedPrice.toLocaleString("vi-VN")}đ
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="rounded-xl border border-cas-outline-variant/40 px-4 py-2.5 text-sm font-extrabold text-cas-on-surface transition hover:bg-cas-surface-container"
                onClick={() => setBookingToCancel(null)}
                type="button"
              >
                Giữ dịch vụ
              </button>
              <button
                className="rounded-xl bg-cas-error px-4 py-2.5 text-sm font-extrabold text-cas-on-error transition hover:brightness-95"
                onClick={() => handleCancelBooking(bookingToCancel.id)}
                type="button"
              >
                Xác nhận hủy
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
