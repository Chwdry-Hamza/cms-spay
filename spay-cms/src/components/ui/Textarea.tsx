'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-spay-md border border-line bg-surface-raised px-3 py-2 text-sm text-fg-1 placeholder:text-fg-4 transition-colors duration-150 resize-y',
          'focus:outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/15',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
