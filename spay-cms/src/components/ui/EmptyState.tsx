import React from 'react';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-16 rounded-spay-lg border border-dashed border-line bg-surface/50',
        className
      )}
    >
      {icon && (
        <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-spay-lg border border-line-strong bg-surface-raised text-cyan-300 shadow-glow-sm [&_svg]:size-6">
          {icon}
        </div>
      )}
      <h3 className="font-display font-semibold text-base text-fg-1 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-fg-3 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
