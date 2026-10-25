type Props = {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  label?: string;
};

// 1 … 4 5 [6] 7 8 … 20 хэлбэрээр хуудасны дугаарыг товчилно.
function buildPages(current: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages: (number | "gap")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 2) pages.push("gap");
  for (let value = start; value <= end; value += 1) pages.push(value);
  if (end < totalPages - 1) pages.push("gap");
  pages.push(totalPages);
  return pages;
}

export function Pagination({ page, pageSize, total, onChange, label = "Хуудаслалт" }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  if (totalPages <= 1) return null;
  const go = (next: number) => {
    const target = Math.min(totalPages, Math.max(1, next));
    if (target !== page) onChange(target);
  };

  return (
    <nav className="site-pagination" aria-label={label}>
      <button type="button" className="site-page-btn site-page-nav" onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Өмнөх хуудас">
        ‹ <span>Өмнөх</span>
      </button>
      {buildPages(page, totalPages).map((value, index) =>
        value === "gap" ? (
          <span key={`gap-${index}`} className="site-page-gap" aria-hidden="true">…</span>
        ) : (
          <button
            type="button"
            key={value}
            className={`site-page-btn ${value === page ? "is-active" : ""}`}
            onClick={() => go(value)}
            aria-current={value === page ? "page" : undefined}
            aria-label={`${value}-р хуудас`}
          >
            {value}
          </button>
        ),
      )}
      <button type="button" className="site-page-btn site-page-nav" onClick={() => go(page + 1)} disabled={page >= totalPages} aria-label="Дараагийн хуудас">
        <span>Дараах</span> ›
      </button>
    </nav>
  );
}

// URL-ын ?page= параметрийг уншина (буруу утга бол 1).
export function readPageParam(params: URLSearchParams) {
  const value = Number(params.get("page") || "1");
  return Number.isInteger(value) && value > 0 ? value : 1;
}
