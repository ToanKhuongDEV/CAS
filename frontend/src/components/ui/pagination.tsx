import { CasButton } from "./cas-button";

type PaginationProps = {
  onPageChange: (page: number) => void;
  page: number;
  size: number;
  total: number;
};

export function Pagination({ onPageChange, page, size, total }: PaginationProps) {
  const pageCount = Math.ceil(total / size);

  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Phân trang" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-cas-on-surface-variant">
        Trang {page + 1}/{pageCount} · {total} kết quả
      </p>
      <div className="flex items-center gap-2">
        <CasButton
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          size="sm"
          variant="outline"
        >
          Trước
        </CasButton>
        <CasButton
          disabled={page + 1 >= pageCount}
          onClick={() => onPageChange(page + 1)}
          size="sm"
          variant="outline"
        >
          Sau
        </CasButton>
      </div>
    </nav>
  );
}
