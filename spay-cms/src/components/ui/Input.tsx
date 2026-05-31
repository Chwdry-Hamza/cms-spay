'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-3 [&_svg]:size-4">
            {leftIcon}
          </span>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded-spay-md border border-line bg-surface-raised px-3 py-1.5 text-sm text-fg-1 placeholder:text-fg-4 transition-colors duration-150',
            'focus:outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/15',
            'disabled:cursor-not-allowed disabled:opacity-50',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-3 [&_svg]:size-4">
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
