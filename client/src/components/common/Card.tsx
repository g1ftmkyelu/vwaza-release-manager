import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx('glass-card rounded-lg', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;