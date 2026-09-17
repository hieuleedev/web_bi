import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  itemsName?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  itemsName = 'sản phẩm',
  className = '',
}) => {
  if (totalPages <= 1) return null;

  // Thuật toán hiển thị các trang kèm dấu '...'
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const startItem = pageSize ? (currentPage - 1) * pageSize + 1 : undefined;
  const endItem = pageSize && totalItems ? Math.min(currentPage * pageSize, totalItems) : undefined;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-4 bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}
    >
      {/* Thông tin số mục */}
      <div className="text-xs text-gray-500 font-medium">
        {totalItems && pageSize ? (
          <span>
            Hiển thị <strong className="text-gray-800">{startItem}</strong> -{' '}
            <strong className="text-gray-800">{endItem}</strong> trên tổng số{' '}
            <strong className="text-brand-600">{totalItems}</strong> {itemsName}
          </span>
        ) : (
          <span>
            Trang <strong className="text-gray-800">{currentPage}</strong> /{' '}
            <strong className="text-gray-800">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Nút bấm chuyển trang */}
      <div className="flex items-center gap-1.5">
        {/* Về trang đầu */}
        <button
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1}
          aria-label="Trang đầu"
          className={`p-2 rounded-xl border text-xs transition-colors flex items-center justify-center ${
            currentPage === 1
              ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50/50'
              : 'border-gray-200 text-gray-600 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700'
          }`}
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Lùi 1 trang */}
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Trang trước"
          className={`p-2 rounded-xl border text-xs transition-colors flex items-center justify-center ${
            currentPage === 1
              ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50/50'
              : 'border-gray-200 text-gray-600 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Danh sách các số trang */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-gray-400 text-xs font-bold select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(page);
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => handlePageClick(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-[36px] h-9 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-200 scale-105'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Tiến 1 trang */}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Trang sau"
          className={`p-2 rounded-xl border text-xs transition-colors flex items-center justify-center ${
            currentPage === totalPages
              ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50/50'
              : 'border-gray-200 text-gray-600 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Tới trang cuối */}
        <button
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Trang cuối"
          className={`p-2 rounded-xl border text-xs transition-colors flex items-center justify-center ${
            currentPage === totalPages
              ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50/50'
              : 'border-gray-200 text-gray-600 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700'
          }`}
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
