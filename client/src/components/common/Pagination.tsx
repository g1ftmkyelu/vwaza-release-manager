import React from 'react';
import Button from './Button';
import clsx from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, className }) => {
  const pageNumbers = [];
  const maxPagesToShow = 5; // Number of page buttons to display

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className={clsx("flex items-center justify-center space-x-2", className)}>
      <Button
        variant="secondary"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm"
      >
        First
      </Button>
      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm"
      >
        Prev
      </Button>

      {startPage > 1 && (
        <>
          <Button variant="secondary" onClick={() => onPageChange(1)} className="px-3 py-1 text-sm">1</Button>
          {startPage > 2 && <span className="text-gray-400">...</span>}
        </>
      )}

      {pageNumbers.map(number => (
        <Button
          key={number}
          variant={number === currentPage ? 'primary' : 'secondary'}
          onClick={() => onPageChange(number)}
          className={clsx("px-3 py-1 text-sm", number === currentPage ? 'bg-lime-accent text-dark-bg-primary' : 'bg-white/10 text-gray-100')}
        >
          {number}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-gray-400">...</span>}
          <Button variant="secondary" onClick={() => onPageChange(totalPages)} className="px-3 py-1 text-sm">{totalPages}</Button>
        </>
      )}

      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm"
      >
        Next
      </Button>
      <Button
        variant="secondary"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm"
      >
        Last
      </Button>
    </div>
  );
};

export default Pagination;