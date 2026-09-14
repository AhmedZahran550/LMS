import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 select-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-800/50',
        primary: 'border-transparent bg-indigo-600 text-white shadow-sm shadow-indigo-600/20',
        secondary: 'border-transparent bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200/60 dark:border-slate-700/60',
        success: 'border-transparent bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/50',
        warning: 'border-transparent bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/50',
        destructive: 'border-transparent bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200/50 dark:border-red-800/50',
        outline: 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        video: 'border-transparent bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200/50 dark:border-cyan-800/50',
        pdf: 'border-transparent bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/50 dark:border-rose-800/50',
        image: 'border-transparent bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/50',
        presentation: 'border-transparent bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  showDot?: boolean;
  pulseDot?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, showDot, pulseDot, children, ...props }, ref) => (
    <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props}>
      {showDot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full bg-current',
            pulseDot && 'animate-pulse'
          )}
        />
      )}
      {children}
    </div>
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
