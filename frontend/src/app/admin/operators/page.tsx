"use client";

import { useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";

type OperatorAccount = {
  email: string;
  id: number;
  fullName: string;
  phone: string;
  role: "OPERATOR";
  status: "ACTIVE" | "LOCKED";
  createdAt: string;
};

const mockOperators: OperatorAccount[] = [
  {
    email: "nguyenvana@example.com",
    id: 1,
    fullName: "Nguyễn Văn A",
    phone: "0901234567",
    role: "OPERATOR",
    status: "ACTIVE",
    createdAt: "2026-01-15",
  },
  {
    email: "tranthib@example.com",
    id: 2,
    fullName: "Trần Thị B",
    phone: "0912345678",
    role: "OPERATOR",
    status: "ACTIVE",
    createdAt: "2026-02-01",
  },
  {
    email: "lethib@example.com",
    id: 3,
    fullName: "Lê Văn C",
    phone: "0987654321",
    role: "OPERATOR",
    status: "LOCKED",
    createdAt: "2026-03-10",
  },
];

type CreateOperatorErrors = {
  displayName?: string;
  email?: string;
  phone?: string;
};

export default function AdminOperatorsPage() {
  const [operators, setOperators] = useState<OperatorAccount[]>(mockOperators);
  const [showAddForm, setShowAddForm] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [createErrors, setCreateErrors] = useState<CreateOperatorErrors>({});

  const toggleLock = (id: number) => {
    setOperators((prev) =>
      prev.map((op) =>
        op.id === id ? { ...op, status: op.status === "ACTIVE" ? "LOCKED" : "ACTIVE" } : op,
      ),
    );
  };

  const handleAddOperator = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedDisplayName = displayName.trim();
    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();
    const nextErrors: CreateOperatorErrors = {};

    if (!normalizedDisplayName) {
      nextErrors.displayName = "Vui lòng nhập họ và tên nhân viên.";
    } else if (normalizedDisplayName.length > 150) {
      nextErrors.displayName = "Họ và tên tối đa 150 ký tự.";
    }

    if (!normalizedEmail) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      nextErrors.email = "Email không hợp lệ.";
    } else if (normalizedEmail.length > 254) {
      nextErrors.email = "Email tối đa 254 ký tự.";
    }

    if (!normalizedPhone) {
      nextErrors.phone = "Vui lòng nhập số điện thoại liên hệ.";
    } else if (normalizedPhone.length > 20) {
      nextErrors.phone = "Số điện thoại tối đa 20 ký tự.";
    }

    setCreateErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const newOp: OperatorAccount = {
      email: normalizedEmail,
      id: Date.now(),
      fullName: normalizedDisplayName,
      phone: normalizedPhone,
      role: "OPERATOR",
      status: "ACTIVE",
      createdAt: "2026-08-08",
    };
    setOperators([...operators, newOp]);
    setDisplayName("");
    setEmail("");
    setPhone("");
    setCreateErrors({});
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-cas-on-surface">
            Quản lý Tài khoản Nhân viên (OPERATOR)
          </h1>
          <p className="text-xs text-cas-on-surface-variant">
            Tạo, kích hoạt hoặc khóa tài khoản nhân viên phục vụ/thu ngân qua Firebase
            Authentication.
          </p>
        </div>
        <CasButton onClick={() => setShowAddForm(true)} icon="plus" variant="primary" size="md">
          Tạo tài khoản Nhân viên
        </CasButton>
      </div>

      {/* Form modal tạo nhân viên */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAddForm(false);
          }}
        >
          <form
            onSubmit={handleAddOperator}
            noValidate
            className="my-auto w-full max-w-lg space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
              <h3 className="text-base font-black text-cas-on-surface">
                Thêm Tài khoản Nhân viên Mới
              </h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs font-bold text-cas-on-surface-variant hover:text-cas-primary"
              >
                Hủy
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-cas-on-surface-variant" htmlFor="operator-display-name">
                  Họ và Tên Nhân viên:
                </label>
                <input
                  aria-describedby={createErrors.displayName ? "operator-display-name-error" : undefined}
                  aria-invalid={Boolean(createErrors.displayName)}
                  type="text"
                  id="operator-display-name"
                  placeholder="Nhập họ tên..."
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                  required
                />
                {createErrors.displayName ? (
                  <p className="mt-1 text-cas-error" id="operator-display-name-error">
                    {createErrors.displayName}
                  </p>
                ) : null}
              </div>
              <div>
                <label className="block font-bold text-cas-on-surface-variant" htmlFor="operator-email">
                  Email đăng nhập:
                </label>
                <input
                  aria-describedby={createErrors.email ? "operator-email-error" : undefined}
                  aria-invalid={Boolean(createErrors.email)}
                  type="email"
                  id="operator-email"
                  placeholder="Nhập email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                  maxLength={254}
                  required
                />
                {createErrors.email ? (
                  <p className="mt-1 text-cas-error" id="operator-email-error">
                    {createErrors.email}
                  </p>
                ) : null}
              </div>
              <div>
                <label className="block font-bold text-cas-on-surface-variant" htmlFor="operator-phone">
                  Số điện thoại liên hệ:
                </label>
                <input
                  aria-describedby={createErrors.phone ? "operator-phone-error" : undefined}
                  aria-invalid={Boolean(createErrors.phone)}
                  type="text"
                  id="operator-phone"
                  placeholder="Nhập SĐT..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                  maxLength={20}
                  required
                />
                {createErrors.phone ? (
                  <p className="mt-1 text-cas-error" id="operator-phone-error">
                    {createErrors.phone}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <CasButton
                type="button"
                onClick={() => setShowAddForm(false)}
                variant="outline"
                size="sm"
              >
                Hủy
              </CasButton>
              <CasButton type="submit" variant="primary" size="sm">
                Xác nhận Tạo
              </CasButton>
            </div>
          </form>
        </div>
      )}

      {/* Table Nhân viên */}
      <div className="overflow-x-auto rounded-3xl border border-cas-outline-variant/30 bg-cas-glass shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-cas-outline-variant/25 bg-cas-surface-container/60 text-cas-on-surface-variant font-extrabold uppercase">
            <tr>
              <th className="px-6 py-4">Họ và Tên</th>
              <th className="px-6 py-4">Số điện thoại</th>
              <th className="px-6 py-4">Quyền (Role)</th>
              <th className="px-6 py-4">Ngày tạo</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cas-outline-variant/15 font-bold">
            {operators.map((op) => (
              <tr key={op.id} className="hover:bg-cas-surface-container/30 transition">
                <td className="px-6 py-4 text-sm font-black text-cas-on-surface">{op.fullName}</td>
                <td className="px-6 py-4 text-cas-on-surface-variant">{op.phone}</td>
                <td className="px-6 py-4">
                  <span className="rounded-md bg-cas-secondary/15 px-2 py-0.5 text-[0.68rem] font-extrabold text-cas-secondary">
                    OPERATOR
                  </span>
                </td>
                <td className="px-6 py-4 text-cas-on-surface-variant">{op.createdAt}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[0.68rem] font-black ${op.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/15 text-rose-600 dark:text-rose-400"}`}
                  >
                    {op.status === "ACTIVE" ? "ĐANG HOẠT ĐỘNG" : "ĐÃ KHÓA"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <CasButton
                    onClick={() => toggleLock(op.id)}
                    variant={op.status === "ACTIVE" ? "danger" : "outline-primary"}
                    size="sm"
                  >
                    {op.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
                  </CasButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
