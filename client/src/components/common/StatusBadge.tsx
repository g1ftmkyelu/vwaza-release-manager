import React from 'react';
import clsx from 'clsx';
import LoadingSpinner from './LoadingSpinner';
import { ReleaseStatus } from '@shared/types';

interface StatusBadgeProps {
  status: ReleaseStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusColors = {
    DRAFT: 'bg-status-draft text-gray-100',
    PROCESSING: 'bg-status-processing text-dark-bg-primary',
    PENDING_REVIEW: 'bg-status-pending text-white',
    PUBLISHED: 'bg-status-published text-white',
    REJECTED: 'bg-status-rejected text-white',
  };

  const statusText = status.replace(/_/g, ' ');

  return (
    <span
      className={clsx(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize gap-2",
        statusColors[status],
        className
      )}
    >
      {status === 'PROCESSING' && <LoadingSpinner size="sm" className="!border-white" />}
      {statusText}
    </span>
  );
};

export default StatusBadge;