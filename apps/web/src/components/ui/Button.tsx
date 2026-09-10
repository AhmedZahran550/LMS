import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white dark:ring-offset-slate-900 active:scale-[0.98] cursor-pointer select-none',
  {
    variants: {
      variant: {
        default: 'bg-[var(--sv-primary)] text-[var(--sv-on-primary)] hover:brightness-105 shadow-sm hover:shadow-md hover:shadow-indigo-500/20',
        destructive: 'bg-[var(--sv-error)] text-[var(--sv-on-error)] hover:brightness-105 shadow-sm hover:shadow-red-500/20',
        outline: 'border border-[var(--sv-outline-variant)]/60 hover:bg-[var(--sv-surface-container-high)] text-[var(--sv-on-surface)]',
        secondary: 'border border-[var(--sv-primary)]/40 text-[var(--sv-primary)] hover:bg-[var(--sv-primary-container)]/10',
        soft: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/50 dark:border-indigo-800/50',
        warm: 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20',
        ghost: 'hover:bg-[var(--sv-surface-container-high)] text-[var(--sv-on-surface)]',
        link: 'underline-offset-4 hover:underline text-[var(--sv-primary)]',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-8 px-3 rounded-lg text-xs',
        lg: 'h-12 px-8 rounded-2xl text-base',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
