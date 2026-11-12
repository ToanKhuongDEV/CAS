"use client";

import { useAdminOperationalIncidentsQuery } from "../../../lib/api/operation/operation.query";
import { CasIcon } from "../../../components/ui/cas-icon";

const displayDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(value),
  );
const displayTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", { timeStyle: "short" }).format(new Date(value));

export default function AdminIncidentsPage() {
  const { data: incidents = [], error, isLoading } = useAdminOperationalIncidentsQuery();
  const incidentsByDate = new Map<string, typeof incidents>();
  for (const incident of incidents) {
    const date = displayDate(incident.createdAt);
    const group = incidentsByDate.get(date) ?? [];
    group.push(incident);
    incidentsByDate.set(date, group);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-cas-on-surface">
          Báo cáo Sự cố ca trực (Operational Incidents)
        </h1>
      </header>

      {isLoading ? (
        <p className="text-sm text-cas-on-surface-variant">Đang tải báo cáo sự cố...</p>
      ) : null}
      {error ? <p className="text-sm font-bold text-cas-error">{error.message}</p> : null}
      {!isLoading && !error && incidents.length === 0 ? (
        <p className="text-sm text-cas-on-surface-variant">Chưa có báo cáo sự cố nào.</p>
      ) : null}

      {incidents.length > 0 && (
        <div className="rounded-2xl border border-cas-outline-variant/30 bg-cas-surface-container p-5">
          <div className="overflow-x-auto rounded-xl border border-cas-outline-variant/30">
            <table className="w-full min-w-[640px] table-fixed text-left text-sm">
              <thead className="bg-cas-surface text-xs font-bold text-cas-on-surface-variant">
                <tr>
                  <th className="w-28 px-5 py-3" scope="col">
                    Giờ báo cáo
                  </th>
                  <th className="w-48 px-5 py-3" scope="col">
                    Người báo cáo
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Nội dung sự cố
                  </th>
                </tr>
              </thead>
              {Array.from(incidentsByDate, ([date, group]) => (
                <tbody key={date}>
                  <tr className="border-t border-cas-outline-variant/25 bg-cas-primary-container/40">
                    <th className="px-5 py-3" colSpan={3} scope="rowgroup">
                      <span className="flex items-center gap-2 text-cas-on-surface">
                        <CasIcon
                          aria-hidden="true"
                          className="size-4 text-cas-primary"
                          name="calendar"
                        />
                        {date}
                        <span className="font-normal text-cas-on-surface-variant">
                          · {group.length} sự cố
                        </span>
                      </span>
                    </th>
                  </tr>
                  {group.map((incident) => (
                    <tr
                      key={incident.publicId}
                      className="border-t border-cas-outline-variant/15 align-top"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-cas-on-surface-variant">
                        <time dateTime={incident.createdAt}>{displayTime(incident.createdAt)}</time>
                      </td>
                      <td className="break-words px-5 py-4 font-semibold text-cas-on-surface">
                        {incident.reporterName}
                      </td>
                      <td className="whitespace-pre-wrap break-words px-5 py-4 leading-6 text-cas-on-surface">
                        {incident.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
