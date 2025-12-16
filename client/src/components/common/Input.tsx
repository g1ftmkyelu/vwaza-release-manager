import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="block text-gray-300 text-sm font-bold mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'glass-input w-full p-2 rounded-md focus:outline-none',
            error ? 'border-red-500 focus:ring-red-500' : '',
            className
          )}
          {...props}
        />
        {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;