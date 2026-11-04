"use client";

import { formatMoney as money } from "../../lib/format-money";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "../../lib/auth/firebase";
import { getCurrentOperationalAccount } from "../../lib/auth/operational-auth";
import type { BillAdjustment, BillAdjustmentInput } from "../../lib/api/payment/payment.api";

export function OperatorBillAdjustmentForm({
  items,
  savedIds,
  onChange,
  disabled,
}: {
  items: BillAdjustment[];
  savedIds: string[];
  onChange: (items: BillAdjustment[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [type, setType] = useState<BillAdjustmentInput["adjustmentType"]>("INCREASE");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const user = getFirebaseAuth().currentUser;
    if (user)
      void getCurrentOperationalAccount(user)
        .then((account) => {
          if (active) setAdmin(account.role === "ADMIN" || account.role === "SUPER_ADMIN");
        })
        .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  function clear() {
    setAmount("");
    setReason("");
    setType("INCREASE");
    setEditing(null);
    setError(null);
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || !reason.trim()) {
      setError("Nhập số tiền hợp lệ và lý do điều chỉnh.");
      return;
    }
    const id = editing ?? crypto.randomUUID();
    const item: BillAdjustment = {
      publicId: id,
      adjustmentType: type,
      amount: value,
      reason: reason.trim(),
      createdAt: "",
    };
    onChange(
      editing
        ? items.map((current) => (current.publicId === id ? item : current))
        : [...items, item],
    );
    setError(null);
    if (!editing) setOpen(false);
    clear();
  }
  return (
    <div className="print:hidden">
      <button
        aria-expanded={open}
        className="text-sm font-bold text-cas-primary hover:underline"
        onClick={() => {
          clear();
          setOpen(!open);
        }}
        type="button"
      >
        Điều chỉnh hóa đơn
      </button>
      {items.map((item) => {
        const saved = savedIds.includes(item.publicId);
        return (
          <div
            className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 text-sm"
            key={item.publicId}
          >
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="min-w-0 break-words">{item.reason}</span>
              {(!saved || admin) && (
                <span className="shrink-0 text-cas-primary">
                  {admin && saved && (
                    <>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          if (open && editing === item.publicId) {
                            clear();
                            setOpen(false);
                            return;
                          }
                          setError(null);
                          setOpen(true);
                          setEditing(item.publicId);
                          setType(item.adjustmentType);
                          setAmount(String(item.amount));
                          setReason(item.reason);
                        }}
                      >
                        Sửa
                      </button>
                      {" · "}
                    </>
                  )}
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={`Xóa điều chỉnh ${item.reason}`}
                    onClick={() =>
                      onChange(items.filter((current) => current.publicId !== item.publicId))
                    }
                  >
                    Xóa
                  </button>
                </span>
              )}
            </div>
            <strong className="text-right">
              {item.adjustmentType === "INCREASE" ? "+" : "−"}
              {money(item.amount)}
            </strong>
          </div>
        );
      })}
      {open && (
        <form className="mt-4 grid gap-3" onSubmit={submit}>
          <label className="grid gap-1 text-sm font-bold">
            Loại điều chỉnh
            <select
              className="min-h-11 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3"
              value={type}
              onChange={(event) =>
                setType(event.target.value as BillAdjustmentInput["adjustmentType"])
              }
            >
              <option value="INCREASE">Tăng tiền</option>
              <option value="DECREASE">Giảm tiền</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Số tiền
            <input
              className="min-h-11 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Lý do
            <textarea
              className="min-h-20 rounded-xl border border-cas-outline-variant/40 bg-cas-surface p-3"
              maxLength={1000}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
            />
          </label>
          <button
            className="min-h-11 rounded-xl bg-cas-primary px-4 text-sm font-bold text-cas-on-primary"
            disabled={disabled}
            type="submit"
          >
            {editing ? "Lưu điều chỉnh" : "Thêm điều chỉnh"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                clear();
                setOpen(false);
              }}
            >
              Hủy sửa
            </button>
          )}
        </form>
      )}
      {error && (
        <p className="mt-2 text-sm text-cas-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
