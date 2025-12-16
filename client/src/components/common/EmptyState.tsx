import React from 'react';
import { FaBoxOpen } from 'react-icons/fa';
import Card from './Card';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, icon, className }) => {
  return (
    <Card className={`flex flex-col items-center justify-center p-8 text-center space-y-4 ${className}`}>
      <div className="text-lime-accent text-6xl">
        {icon || <FaBoxOpen />}
      </div>
      <p className="text-gray-300 text-lg font-medium">{message}</p>
    </Card>
  );
};

export default EmptyState;