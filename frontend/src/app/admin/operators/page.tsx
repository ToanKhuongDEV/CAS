"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CasButton } from "../../../components/ui/cas-button";
import { useToast } from "../../../components/ui/toast-provider";
import {
  createOperator,
  createAdmin,
  deactivateOperator,
  activateOperator,
  deactivateAdmin,
  activateAdmin,
} from "../../../lib/api/operation/operational-management.api";
import {
  adminOperatorsQueryKey,
  adminAccountsQueryKey,
  useAdminAccountsQuery,
  useAdminOperatorsQuery,
} from "../../../lib/api/operation/operation.query";
import { getFirebaseAuth } from "../../../lib/auth/firebase";
import { getCurrentOperationalAccount } from "../../../lib/auth/operational-auth";

type OperatorAccount = {
  email: string;
  id: number;
  fullName: string;
  phone: string;
  role: "ADMIN" | "OPERATOR";
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

type CreateOperatorErrors = {
  displayName?: string;
  email?: string;
  phone?: string;
};

export default function AdminOperatorsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { data: accounts = [], error: loadError } = useAdminOperatorsQuery();
  const { data: admins = [], error: adminLoadError } = useAdminAccountsQuery(isSuperAdmin);
  const operators: OperatorAccount[] = [
    ...accounts.map((account) => ({
      ...account,
      fullName: account.displayName,
      role: "OPERATOR" as const,
    })),
    ...admins.map((account) => ({
      ...account,
      fullName: account.displayName,
      role: "ADMIN" as const,
    })),
  ];
  const [showAddForm, setShowAddForm] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"ADMIN" | "OPERATOR">("OPERATOR");
  const [createErrors, setCreateErrors] = useState<CreateOperatorErrors>({});

  useEffect(() => {
    if (loadError)
      showToast({
        message:
          loadError instanceof Error ? loadError.message : "Không thể tải tài khoản nhân viên.",
        type: "error",
      });
  }, [loadError, showToast]);

  useEffect(() => {
    if (adminLoadError)
      showToast({
        message:
          adminLoadError instanceof Error
            ? adminLoadError.message
            : "Không thể tải tài khoản quản trị viên.",
        type: "error",
      });
  }, [adminLoadError, showToast]);

  useEffect(() => {
    const user = getFirebaseAuth().currentUser;
    if (!user) return;
    void getCurrentOperationalAccount(user)
      .then((account) => setIsSuperAdmin(account.role === "SUPER_ADMIN"))
      .catch(() => undefined);
  }, []);

  const deactivate = async (id: number, accountRole: OperatorAccount["role"]) => {
    try {
      await (accountRole === "ADMIN" ? deactivateAdmin(id) : deactivateOperator(id));
      await queryClient.invalidateQueries({
        queryKey: accountRole === "ADMIN" ? adminAccountsQueryKey : adminOperatorsQueryKey,
      });
      showToast({ message: "Đã khóa tài khoản.", type: "success" });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể khóa tài khoản.",
        type: "error",
      });
    }
  };

  const activate = async (id: number, accountRole: OperatorAccount["role"]) => {
    try {
      await (accountRole === "ADMIN" ? activateAdmin(id) : activateOperator(id));
      await queryClient.invalidateQueries({
        queryKey: accountRole === "ADMIN" ? adminAccountsQueryKey : adminOperatorsQueryKey,
      });
      showToast({ message: "Đã kích hoạt tài khoản.", type: "success" });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể kích hoạt tài khoản.",
        type: "error",
      });
    }
  };

  const handleAddOperator = async (e: React.FormEvent) => {
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

    try {
      const input = {
        displayName: normalizedDisplayName,
        email: normalizedEmail,
        phone: normalizedPhone,
      };
      const created = await (role === "ADMIN" ? createAdmin(input) : createOperator(input));
      await queryClient.invalidateQueries({
        queryKey: role === "ADMIN" ? adminAccountsQueryKey : adminOperatorsQueryKey,
      });
      setDisplayName("");
      setEmail("");
      setPhone("");
      setCreateErrors({});
      showToast({ message: `Đã tạo tài khoản ${role}: ${created.displayName}.`, type: "success" });
      setShowAddForm(false);
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể tạo tài khoản nhân viên.",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-cas-on-surface">
            {isSuperAdmin
              ? "Quản lý Tài khoản Admin và Nhân viên"
              : "Quản lý Tài khoản Nhân viên (OPERATOR)"}
          </h1>
        </div>
        <CasButton onClick={() => setShowAddForm(true)} icon="plus" variant="primary" size="md">
          Tạo tài khoản Nhân viên
        </CasButton>
      </div>

      {/* Form modal tạo nhân viên */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-cas-scrim/55 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAddForm(false);
          }}
        >
          <form
            onSubmit={handleAddOperator}
            noValidate
            className="my-auto w-full max-w-lg space-y-4 rounded-sm border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
              <h3 className="text-base font-black text-cas-on-surface">
                {role === "ADMIN"
                  ? "Thêm Tài khoản Quản trị viên Mới"
                  : "Thêm Tài khoản Nhân viên Mới"}
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
              {isSuperAdmin ? (
                <label className="block font-bold text-cas-on-surface-variant">
                  Loại tài khoản
                  <select
                    className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface"
                    value={role}
                    onChange={(e) => setRole(e.target.value as "ADMIN" | "OPERATOR")}
                  >
                    <option value="OPERATOR">Operator</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </label>
              ) : null}
              <div>
                <label
                  className="block font-bold text-cas-on-surface-variant"
                  htmlFor="operator-display-name"
                >
                  {role === "ADMIN" ? "Họ và Tên Quản trị viên:" : "Họ và Tên Nhân viên:"}
                </label>
                <input
                  aria-describedby={
                    createErrors.displayName ? "operator-display-name-error" : undefined
                  }
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
                <label
                  className="block font-bold text-cas-on-surface-variant"
                  htmlFor="operator-email"
                >
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
                <label
                  className="block font-bold text-cas-on-surface-variant"
                  htmlFor="operator-phone"
                >
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
      <div className="overflow-x-auto rounded-sm border border-cas-outline-variant/30 bg-cas-glass shadow-xs">
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
                    {op.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-cas-on-surface-variant">{op.createdAt}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[0.68rem] font-black ${op.status === "ACTIVE" ? "bg-cas-secondary-container/25 text-cas-secondary" : "bg-cas-error-container/35 text-cas-error"}`}
                  >
                    {op.status === "ACTIVE" ? "ĐANG HOẠT ĐỘNG" : "ĐÃ KHÓA"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {op.status === "ACTIVE" ? (
                    <CasButton
                      onClick={() => void deactivate(op.id, op.role)}
                      variant="danger"
                      size="sm"
                    >
                      Khóa tài khoản
                    </CasButton>
                  ) : (
                    <CasButton
                      onClick={() => void activate(op.id, op.role)}
                      variant="outline"
                      size="sm"
                    >
                      Kích hoạt
                    </CasButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
