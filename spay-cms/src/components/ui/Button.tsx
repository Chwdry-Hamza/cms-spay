'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-spay-md font-sans font-semibold text-sm leading-none transition-all duration-150 ease-spay-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-deepest [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-cyan-300 text-navy-950 hover:bg-cyan-200 active:bg-cyan-400 shadow-[0_0_0_1px_rgba(111,227,255,0.4),0_4px_16px_rgba(78,203,255,0.18)]',
        secondary:
          'bg-surface-raised text-fg-1 border border-line hover:border-line-strong hover:bg-surface',
        ghost:
          'text-fg-2 hover:bg-white/[0.04] hover:text-fg-1',
        outline:
          'border border-line-strong text-fg-1 hover:bg-cyan-300/5 hover:border-cyan-300/50',
        danger:
          'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20',
        success:
          'bg-success/10 text-success border border-success/30 hover:bg-success/20',
        link:
          'text-cyan-300 hover:underline underline-offset-4 px-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-10 px-5',
        xl: 'h-11 px-6 text-base',
        icon: 'h-9 w-9 px-0',
        iconSm: 'h-8 w-8 px-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
