"use client";

import { useEffect, useState } from "react";

import {
  loadAdminOperationalIncidents,
  type OperationalIncident,
} from "../../../lib/api/operation/operational-incidents.api";

const displayTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(value),
  );

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<OperationalIncident[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadAdminOperationalIncidents()
      .then((value) => {
        setIncidents(value);
        setError(null);
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : "Không thể tải báo cáo sự cố.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-cas-on-surface">
          Báo cáo Sự cố ca trực (Operational Incidents)
        </h1>
        <p className="text-xs text-cas-on-surface-variant">
          Tiếp nhận và tra cứu các báo cáo sự cố do nhân viên OPERATOR gửi về trong ca làm việc.
        </p>
      </header>

      {isLoading ? (
        <p className="text-sm text-cas-on-surface-variant">Đang tải báo cáo sự cố...</p>
      ) : null}
      {error ? <p className="text-sm font-bold text-cas-error">{error}</p> : null}
      {!isLoading && !error && incidents.length === 0 ? (
        <p className="text-sm text-cas-on-surface-variant">Chưa có báo cáo sự cố nào.</p>
      ) : null}

      <div className="space-y-4">
        {incidents.map((incident) => (
          <article
            key={incident.publicId}
            className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs transition hover:shadow-md"
          >
            <div className="flex flex-col gap-3 border-b border-cas-outline-variant/15 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-extrabold text-cas-on-surface">
                Người báo cáo: {incident.reporterName}
              </span>
              <time className="text-[0.7rem] font-bold text-cas-on-surface-variant">
                {displayTime(incident.createdAt)}
              </time>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-cas-on-surface-variant">
              {incident.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
