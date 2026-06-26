import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white active:shadow-inner',
  {
    variants: {
      variant: {
        default: 'bg-[var(--sv-primary)] text-[var(--sv-on-primary)] hover:brightness-110',
        destructive: 'bg-[var(--sv-error)] text-[var(--sv-on-error)] hover:brightness-110',
        outline: 'border border-[var(--sv-outline-variant)] hover:bg-[var(--sv-surface-container-high)] text-[var(--sv-on-surface)]',
        secondary: 'border border-[var(--sv-primary)] text-[var(--sv-primary)] hover:bg-[var(--sv-primary-container)]/10',
        ghost: 'hover:bg-[var(--sv-surface-container-high)] text-[var(--sv-on-surface)]',
        link: 'underline-offset-4 hover:underline text-[var(--sv-primary)]',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-lg',
        lg: 'h-11 px-8 rounded-lg',
        icon: 'h-10 w-10 rounded-lg',
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
