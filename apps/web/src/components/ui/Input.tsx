import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[var(--sv-border-input)] bg-[var(--sv-bg-input)] px-3.5 py-2.5 text-sm text-[var(--sv-text-primary)] placeholder:text-[var(--sv-text-muted)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[var(--sv-ring-focus)]/15 focus:border-[var(--sv-primary)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
