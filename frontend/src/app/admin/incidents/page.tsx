"use client";

type Incident = {
  id: number;
  reporter: string;
  table: string;
  title: string;
  description: string;
  createdAt: string;
};

const mockIncidents: Incident[] = [
  {
    id: 1,
    reporter: "Nguyễn Văn A (OPERATOR)",
    table: "Bàn 08",
    title: "Mỳ cay mặn quá ngưỡng, khách yêu cầu nấu lại",
    description: "Đã làm lại món mới kèm cờ is_remade = TRUE để bù trừ tiền chính xác.",
    createdAt: "17:35 08/08/2026",
  },
  {
    id: 2,
    reporter: "Trần Thị B (OPERATOR)",
    table: "Bàn 03",
    title: "Vỡ 1 ly thủy tinh khi phục vụ",
    description: "Khách lỡ tay làm vỡ, đã dọn dẹp sạch sẽ và ghi nhận hao hụt thiết bị.",
    createdAt: "15:20 08/08/2026",
  },
];

export default function AdminIncidentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-cas-on-surface">
            Báo cáo Sự cố ca trực (Operational Incidents)
          </h1>
          <p className="text-xs text-cas-on-surface-variant">
            Tiếp nhận và tra cứu các báo cáo sự cố do nhân viên OPERATOR gửi về trong ca làm việc.
          </p>
        </div>
      </div>

      {/* Danh sách Sự cố */}
      <div className="space-y-4">
        {mockIncidents.map((inc) => (
          <div
            key={inc.id}
            className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs transition hover:shadow-md"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-cas-outline-variant/15 pb-3">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-cas-primary/10 px-3 py-1 text-xs font-black text-cas-primary">
                  {inc.table}
                </span>
                <span className="text-xs font-extrabold text-cas-on-surface">
                  Người báo cáo: {inc.reporter}
                </span>
                <span className="text-[0.7rem] font-bold text-cas-on-surface-variant">
                  • {inc.createdAt}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <h3 className="text-base font-black text-cas-on-surface">{inc.title}</h3>
              <p className="text-xs font-medium text-cas-on-surface-variant leading-relaxed">
                {inc.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
