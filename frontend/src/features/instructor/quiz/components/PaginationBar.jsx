import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationBar({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
}) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate numbered pages array
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface px-5 py-3 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
      {/* Counter summary */}
      <div className="text-xs text-muted">
        Showing <span className="font-semibold text-brand-purple">{startItem}</span>{" "}
        to <span className="font-semibold text-brand-purple">{endItem}</span> of{" "}
        <span className="font-semibold text-brand-purple">{totalItems}</span> quizzes
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center justify-center p-2 rounded-xl border border-main bg-elevated text-main hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`min-w-8 h-8 px-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                currentPage === page
                  ? "bg-brand-purple text-white font-semibold shadow-sm"
                  : "text-muted hover:bg-elevated hover:text-main"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center justify-center p-2 rounded-xl border border-main bg-elevated text-main hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
