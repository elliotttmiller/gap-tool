import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'danger'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const variants = {
      default: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm",
      outline: "border border-gray-300 bg-white text-[#4f4f54] hover:border-brand-500/50 hover:bg-brand-50 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/8",
      ghost: "text-[#4f4f54] hover:bg-brand-50 hover:text-brand-700 dark:text-white/75 dark:hover:bg-white/8 dark:hover:text-white",
      secondary: "bg-gray-100 text-[#4f4f54] hover:bg-brand-50 dark:bg-white/8 dark:text-white dark:hover:bg-white/12",
      danger: "bg-red-500 text-white hover:bg-red-600",
    }
    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    }

    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
