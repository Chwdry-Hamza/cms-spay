import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-spay-pill border px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.04em] uppercase font-display whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        default:    'border-line bg-white/[0.04] text-fg-2',
        cyan:       'border-cyan-300/30 bg-cyan-300/10 text-cyan-300',
        success:    'border-success/30 bg-success/10 text-success',
        warning:    'border-warning/30 bg-warning/10 text-warning',
        danger:     'border-danger/30 bg-danger/10 text-danger',
        magenta:    'border-magenta/30 bg-magenta/10 text-magenta',
        outline:    'border-line-strong bg-transparent text-fg-2',
        solid:      'border-transparent bg-fg-1 text-navy-950',
      },
      size: {
        sm: 'h-5 text-[10px] px-2',
        md: 'h-6 text-[11px]',
        lg: 'h-7 text-xs px-3',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };

export function StatusBadge({ status }: { status: 'draft' | 'published' | 'scheduled' }) {
  if (status === 'published') {
    return (
      <Badge variant="success">
        <span className="size-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(58,230,176,0.6)]" />
        Published
      </Badge>
    );
  }
  if (status === 'scheduled') {
    return (
      <Badge variant="warning">
        <span className="size-1.5 rounded-full bg-warning" />
        Scheduled
      </Badge>
    );
  }
  return (
    <Badge variant="default">
      <span className="size-1.5 rounded-full bg-fg-3" />
      Draft
    </Badge>
  );
}
