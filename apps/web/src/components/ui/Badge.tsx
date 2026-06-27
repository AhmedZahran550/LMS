import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[var(--sv-primary-container)] text-[var(--sv-on-primary-container)]',
        secondary: 'border-transparent bg-[var(--sv-surface-container-high)] text-[var(--sv-on-surface-variant)]',
        destructive: 'border-transparent bg-[var(--sv-error)]/15 text-[var(--sv-error)]',
        outline: 'text-[var(--sv-on-surface-variant)] border-[var(--sv-border)]',
        video: 'border-transparent bg-[var(--sv-accent-100)] text-[var(--sv-accent-800)]',
        pdf: 'border-transparent bg-[var(--sv-error-100)] text-[var(--sv-error-800)]',
        image: 'border-transparent bg-[var(--sv-success-100)] text-[var(--sv-success-800)]',
        presentation: 'border-transparent bg-[var(--sv-warning-100)] text-[var(--sv-warning-800)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
