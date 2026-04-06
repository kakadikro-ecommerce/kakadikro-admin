import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  loading = false
}) => {
  const effectiveTotalPages = totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 0;
  const safeCurrentPage =
    effectiveTotalPages > 0 ? Math.min(currentPage, effectiveTotalPages) : 1;

  if (effectiveTotalPages <= 1) {
    if (totalItems === 0) return null;
    return (
      <div className="mt-8 flex w-full justify-center border-t border-gray-100 pt-6 sm:mt-10 sm:pt-8">
        <p className="px-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
          Showing all <span className="text-[#3E2723]">{totalItems}</span> items
        </p>
      </div>
    );
  }

  const getPageNumbers = () => {
    const pages = [];
    if (effectiveTotalPages <= 5) {
      for (let i = 1; i <= effectiveTotalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, '...', effectiveTotalPages);
      } else if (safeCurrentPage >= effectiveTotalPages - 2) {
        pages.push(1, '...', effectiveTotalPages - 2, effectiveTotalPages - 1, effectiveTotalPages);
      } else {
        pages.push(1, '...', safeCurrentPage, '...', effectiveTotalPages);
      }
    }
    return pages;
  };

  return (
    <div className="mt-8 flex w-full flex-col items-center justify-center gap-5 border-t border-gray-100 pt-6 sm:mt-10 sm:gap-6 sm:pt-8">
      <div className="flex w-full items-center justify-center gap-2 overflow-x-auto px-1 pb-1 sm:gap-3">
        <button
          disabled={safeCurrentPage === 1 || loading}
          onClick={() => onPageChange(safeCurrentPage - 1)}
          className={`shrink-0 p-3 bg-gray-50 text-gray-600 rounded-2xl ${safeCurrentPage === 1 ? 'opacity-30' : 'hover:bg-gray-100'
            }`}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <div className="shrink-0 px-1 text-gray-300">
                  <MoreHorizontal size={16} />
                </div>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`h-[42px] min-w-[42px] shrink-0 flex items-center justify-center rounded-2xl text-[11px] font-bold transition-all ${safeCurrentPage === page
                      ? 'bg-[#3E2723] text-white shadow-lg shadow-[#3E2723]/20'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                >
                  {String(page).padStart(2, '0')}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          disabled={safeCurrentPage === effectiveTotalPages || loading}
          onClick={() => onPageChange(safeCurrentPage + 1)}
          className={`shrink-0 p-3 bg-gray-50 text-gray-600 rounded-2xl ${safeCurrentPage === effectiveTotalPages ? 'opacity-30' : 'hover:bg-gray-100'
            }`}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <p className="px-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
        Showing <span className="text-[#3E2723]">{(safeCurrentPage - 1) * itemsPerPage + 1}</span> - <span className="text-[#3E2723]">{Math.min(safeCurrentPage * itemsPerPage, totalItems)}</span> of {totalItems} entries
      </p>
    </div>
  );
};

export default Pagination;
