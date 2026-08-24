"use client";

import { useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";
import { createAdmin } from "../../../lib/api/operation/operational-management.api";

export default function AdminAccountsPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [firebaseUid, setFirebaseUid] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await createAdmin({
        displayName: displayName.trim(),
        email: email.trim(),
        firebaseUid: firebaseUid.trim(),
        phone: phone.trim(),
      });
      setMessage(`Đã tạo tài khoản ADMIN: ${created.displayName}.`);
      setDisplayName("");
      setEmail("");
      setFirebaseUid("");
      setPhone("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể tạo tài khoản ADMIN.");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-cas-on-surface">Tạo tài khoản ADMIN</h1>
        <p className="mt-1 text-xs text-cas-on-surface-variant">
          Firebase UID phải thuộc tài khoản Firebase đã được cấp cho quản trị viên.
        </p>
      </div>
      <form
        className="space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs"
        onSubmit={submit}
      >
        <label className="block text-xs font-bold text-cas-on-surface-variant">
          Họ tên
          <input
            className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface"
            maxLength={150}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            value={displayName}
          />
        </label>
        <label className="block text-xs font-bold text-cas-on-surface-variant">
          Email
          <input
            className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface"
            maxLength={254}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="block text-xs font-bold text-cas-on-surface-variant">
          Firebase UID
          <input
            className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface"
            maxLength={128}
            onChange={(event) => setFirebaseUid(event.target.value)}
            required
            value={firebaseUid}
          />
        </label>
        <label className="block text-xs font-bold text-cas-on-surface-variant">
          Số điện thoại
          <input
            className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-cas-on-surface"
            maxLength={20}
            onChange={(event) => setPhone(event.target.value)}
            required
            value={phone}
          />
        </label>
        <CasButton type="submit" variant="primary">
          Tạo ADMIN
        </CasButton>
        {message ? (
          <p className="text-xs font-bold text-cas-on-surface-variant">{message}</p>
        ) : null}
      </form>
    </div>
  );
}
