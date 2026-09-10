"use client";

import { useEffect, useState } from "react";

import {
  cancelOperatorServiceBooking,
  confirmOperatorServiceBooking,
  createOperatorServiceBooking,
  loadOperatorServiceBookings,
  type ServiceBooking as ApiServiceBooking,
  updateOperatorServiceBooking,
} from "../../lib/api/operation/service-bookings.api";
import { CasIcon } from "../ui/cas-icon";
import { useToast } from "../ui/toast-provider";

type PaymentStatus = "PAY_LATER" | "PENDING" | "PAID" | "CANCELLED";
type CreateServiceField = "clientName" | "clientPhone" | "serviceName" | "note" | "agreedPrice";

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
  note?: string;
  paymentStatus: PaymentStatus;
  serviceName: string;
};

const statusLabels: Record<PaymentStatus, string> = {
  CANCELLED: "Đã hủy",
  PAY_LATER: "Thanh toán sau",
  PENDING: "Chờ xác nhận",
  PAID: "Đã thanh toán",
};

function bookingFromApi(booking: ApiServiceBooking): ServiceBooking {
  return {
    agreedPrice: booking.agreedPrice,
    clientAccountId: booking.publicId,
    createdAt: booking.createdAt,
    createdByName: booking.createdByName,
    id: booking.publicId,
    note: booking.note ?? undefined,
    paymentStatus: booking.paymentStatus,
    serviceName: booking.serviceName,
  };
}

function clientFromApi(booking: ApiServiceBooking): ClientAccount {
  return { id: booking.publicId, name: booking.clientName, phone: booking.clientPhone };
}

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

export function OperatorServiceBookingsView({
  mode = "operator",
}: {
  mode?: "admin" | "operator";
}) {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [filter, setFilter] = useState<"ALL" | PaymentStatus>("ALL");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<ServiceBooking | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [note, setNote] = useState("");
  const [agreedPrice, setAgreedPrice] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"PAY_LATER" | "PENDING">("PAY_LATER");
  const [bookingToConfirm, setBookingToConfirm] = useState<ServiceBooking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<ServiceBooking | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [createFormErrors, setCreateFormErrors] = useState<
    Partial<Record<CreateServiceField, string>>
  >({});

  useEffect(() => {
    loadOperatorServiceBookings()
      .then((items) => {
        setBookings(items.map(bookingFromApi));
        setClients(items.map(clientFromApi));
      })
      .catch((error: unknown) => {
        showToast({
          message: error instanceof Error ? error.message : "Không thể tải dịch vụ đặt trước.",
          type: "error",
        });
      });
  }, [showToast]);

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
    else if (
      !/^[0-9\s()+.-]+$/.test(clientPhone) ||
      normalizedPhone.length === 0 ||
      normalizedPhone.length > 20
    )
      errors.clientPhone = "Số điện thoại chỉ được chứa chữ số và tối đa 20 chữ số.";

    if (!serviceName.trim()) errors.serviceName = "Vui lòng nhập tên dịch vụ.";
    else if (serviceName.trim().length > 255) errors.serviceName = "Tên dịch vụ tối đa 255 ký tự.";

    if (note.length > 65535) errors.note = "Ghi chú tối đa 65.535 ký tự.";

    if (!agreedPrice || !Number.isFinite(price) || price < 0)
      errors.agreedPrice = "Vui lòng nhập giá đã thỏa thuận hợp lệ.";
    else if (price > 9_999_999_999_999)
      errors.agreedPrice = "Giá đã thỏa thuận vượt quá giới hạn cho phép.";

    setCreateFormErrors(errors);
    return { errors, normalizedPhone, price };
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    const { errors, normalizedPhone, price } = validateCreateForm();
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    try {
      const saved = bookingToEdit
        ? await updateOperatorServiceBooking(bookingToEdit.id, {
            clientName: clientName.trim(),
            serviceName: serviceName.trim(),
            note: note.trim() || null,
            agreedPrice: price,
          })
        : await createOperatorServiceBooking({
            clientName: clientName.trim(),
            clientPhone: normalizedPhone,
            serviceName: serviceName.trim(),
            note: note.trim() || null,
            agreedPrice: price,
            paymentStatus,
          });
      const booking = bookingFromApi(saved);
      setBookings((previous) =>
        bookingToEdit
          ? previous.map((item) => (item.id === booking.id ? booking : item))
          : [booking, ...previous],
      );
      setClients((previous) => [
        clientFromApi(saved),
        ...previous.filter((item) => item.id !== booking.id),
      ]);
      setFilter("ALL");
      setClientName("");
      setClientPhone("");
      setServiceName("");
      setNote("");
      setAgreedPrice("");
      setPaymentStatus("PAY_LATER");
      setCreateFormErrors({});
      setBookingToEdit(null);
      setIsCreateDialogOpen(false);
      showToast({
        message: bookingToEdit ? "Đã cập nhật dịch vụ đặt trước." : "Đã lưu dịch vụ đặt trước.",
        type: "success",
      });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể tạo dịch vụ đặt trước.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
    return;
  }

  function openEditDialog(booking: ServiceBooking) {
    const client = getClient(booking.clientAccountId);
    setBookingToEdit(booking);
    setClientName(client?.name ?? "");
    setClientPhone(client?.phone ?? "");
    setServiceName(booking.serviceName);
    setNote(booking.note ?? "");
    setAgreedPrice(booking.agreedPrice.toLocaleString("en-US"));
    setCreateFormErrors({});
    setIsCreateDialogOpen(true);
  }

  function openCreateDialog() {
    setBookingToEdit(null);
    setClientName("");
    setClientPhone("");
    setServiceName("");
    setNote("");
    setAgreedPrice("");
    setPaymentStatus("PAY_LATER");
    setCreateFormErrors({});
    setIsCreateDialogOpen(true);
  }

  async function handleConfirmPayment(bookingId: string) {
    const booking = bookings.find((item) => item.id === bookingId)!;
    if (!booking) return;

    setIsSaving(true);
    try {
      const saved = await confirmOperatorServiceBooking(bookingId);
      const updated = bookingFromApi(saved);
      setBookings((previous) => previous.map((item) => (item.id === bookingId ? updated : item)));
      setClients((previous) => [
        clientFromApi(saved),
        ...previous.filter((item) => item.id !== bookingId),
      ]);
      setBookingToConfirm(null);
      showToast({ message: "Đã xác nhận thanh toán dịch vụ.", type: "success" });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể xác nhận thanh toán.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
    return;
  }

  async function handleCancelBooking(bookingId: string) {
    const booking = bookings.find((item) => item.id === bookingId)!;
    if (!booking) return;

    setIsSaving(true);
    try {
      const saved = await cancelOperatorServiceBooking(bookingId);
      const updated = bookingFromApi(saved);
      setBookings((previous) => previous.map((item) => (item.id === bookingId ? updated : item)));
      setClients((previous) => [
        clientFromApi(saved),
        ...previous.filter((item) => item.id !== bookingId),
      ]);
      setBookingToCancel(null);
      showToast({ message: "Đã hủy dịch vụ đặt trước.", type: "success" });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể hủy dịch vụ.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
    return;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-cas-on-surface">Các dịch vụ đặt trước</h1>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cas-primary px-4 py-2.5 text-sm font-extrabold text-cas-on-primary transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
          onClick={openCreateDialog}
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
                {booking.note ? (
                  <p className="text-sm text-cas-on-surface-variant">Ghi chú: {booking.note}</p>
                ) : null}
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
                    className="rounded-xl border border-cas-primary/40 px-3.5 py-2 text-xs font-extrabold text-cas-primary transition hover:bg-cas-primary/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                    onClick={() => openEditDialog(booking)}
                    type="button"
                  >
                    Sửa
                  </button>
                ) : null}
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
            noValidate
            onSubmit={handleCreate}
          >
            <div className="flex items-start justify-between gap-4 border-b border-cas-outline-variant/20 pb-4">
              <div>
                <p className="text-xs font-bold text-cas-secondary">Đã chốt qua Zalo</p>
                <h2
                  className="mt-1 text-xl font-black text-cas-on-surface"
                  id="create-service-title"
                >
                  {bookingToEdit ? "Cập nhật dịch vụ" : "Tạo dịch vụ thêm"}
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
                    maxLength={150}
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
                    disabled={Boolean(bookingToEdit)}
                    onChange={(event) => {
                      setClientPhone(event.target.value);
                      clearCreateFieldError("clientPhone");
                    }}
                    maxLength={40}
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
                  maxLength={255}
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
                <span className="text-xs font-bold text-cas-on-surface-variant">Ghi chú</span>
                <textarea
                  aria-describedby={createFormErrors.note ? "service-note-error" : undefined}
                  aria-invalid={Boolean(createFormErrors.note)}
                  className="mt-1.5 min-h-24 w-full resize-y rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2.5 text-sm font-medium text-cas-on-surface outline-none focus:ring-2 focus:ring-cas-primary"
                  maxLength={65535}
                  onChange={(event) => {
                    setNote(event.target.value);
                    clearCreateFieldError("note");
                  }}
                  placeholder="Ví dụ: Khách cần xác nhận thời gian trước một ngày"
                  value={note}
                />
                {createFormErrors.note ? (
                  <p className="mt-1 text-xs font-medium text-cas-error" id="service-note-error">
                    {createFormErrors.note}
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
              {!bookingToEdit ? (
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
              ) : null}
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
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? "Đang lưu..." : bookingToEdit ? "Cập nhật" : "Lưu dịch vụ"}
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
