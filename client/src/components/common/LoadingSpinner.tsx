import React from 'react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className }) => {
  const spinnerSize = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={clsx(
        "inline-block animate-spin rounded-full border-solid border-r-transparent",
        spinnerSize[size],
        "border-lime-accent",
        className
      )}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;