import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'icon' | 'ghost'; 
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ variant = 'secondary', children, className, ...props }) => {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-accent focus:ring-offset-dark-bg-primary';

  const variantStyles = {
    primary: 'glass-button-primary',
    secondary: 'glass-button-secondary',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-glow',
    icon: 'p-2 bg-transparent border-none hover:bg-white/10 rounded-full',
    ghost: 'bg-transparent border border-transparent text-gray-300 hover:bg-white/10 hover:text-lime-light', 
  };

  return (
    <button
      className={clsx(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;