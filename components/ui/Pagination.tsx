import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(renderPageButton(i));
      }
    } else {
      // Always show first page
      pages.push(renderPageButton(1));

      if (currentPage > 3) {
        pages.push(<MoreHorizontal key="ellipsis-start" className="text-slate-300 w-5 h-5 mx-1" />);
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(renderPageButton(i));
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push(<MoreHorizontal key="ellipsis-end" className="text-slate-300 w-5 h-5 mx-1" />);
      }

      // Always show last page
      pages.push(renderPageButton(totalPages));
    }

    return pages;
  };

  const renderPageButton = (page: number) => (
    <button
      key={page}
      onClick={() => onPageChange(page)}
      className={`w-10 h-10 rounded-[4px] flex items-center justify-center font-bold text-sm transition-all duration-200 ${currentPage === page
          ? 'bg-[#3b7cf4] text-white'
          : 'bg-white text-[#475569] hover:bg-[#f4f6fb] border border-[#e2e8f0]'
        }`}
    >
      {page}
    </button>
  );

  return (
    <div className={`flex items-center justify-center gap-2 py-8 ${className}`}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-[4px] bg-white border border-[#e2e8f0] flex items-center justify-center text-slate-400 hover:bg-[#f4f6fb] hover:text-[#3b7cf4] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronLeft size={20} strokeWidth={2.5} />
      </button>

      <div className="flex items-center gap-1.5">
        {renderPageNumbers()}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-[4px] bg-white border border-[#e2e8f0] flex items-center justify-center text-slate-400 hover:bg-[#f4f6fb] hover:text-[#3b7cf4] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronRight size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default Pagination;
