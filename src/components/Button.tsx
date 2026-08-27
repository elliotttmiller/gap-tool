// Tremor Raw Button [v0.1.1]

import { Slot } from "@radix-ui/react-slot"
import { RiLoader2Fill } from "@remixicon/react"
import React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cx, focusRing } from "@/lib/utils"

const buttonVariants = tv({
  base: [
    "relative inline-flex items-center justify-center whitespace-nowrap rounded-md border px-3 py-2 text-center text-sm font-semibold shadow-sm transition-all duration-100 ease-in-out",
    "disabled:pointer-events-none disabled:shadow-none",
    focusRing,
  ],
  variants: {
    variant: {
      primary: [
        "border-transparent",
        "text-white",
        "bg-brand-500",
        "hover:bg-brand-600",
        "disabled:bg-brand-100 disabled:text-gray-500",
        "disabled:dark:bg-brand-800 disabled:dark:text-brand-200",
      ],
      secondary: [
        "border-gray-300 dark:border-white/20",
        "text-[#4f4f54] dark:text-white",
        "bg-white dark:bg-white/8",
        "hover:border-brand-500/50 hover:bg-brand-50 dark:hover:bg-white/12",
        "disabled:text-gray-500",
      ],
      light: [
        "shadow-none",
        "border-transparent",
        "text-[#4f4f54] dark:text-white",
        "bg-gray-100 dark:bg-white/8",
        "hover:bg-brand-50 dark:hover:bg-white/12",
        "disabled:bg-gray-100 disabled:text-gray-500",
      ],
      ghost: [
        "shadow-none",
        "border-transparent",
        "text-[#4f4f54] dark:text-white/80",
        "bg-transparent hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-white/8 dark:hover:text-white",
        "disabled:text-gray-500",
      ],
      destructive: [
        "text-white",
        "border-transparent",
        "bg-red-500",
        "hover:bg-red-600",
        "disabled:bg-red-300 disabled:text-white",
      ],
    },
  },
  defaultVariants: {
    variant: "primary",
  },
})

interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild,
      isLoading = false,
      loadingText,
      className,
      disabled,
      variant,
      children,
      ...props
    }: ButtonProps,
    forwardedRef,
  ) => {
    const Component = asChild ? Slot : "button"
    return (
      <Component
        ref={forwardedRef}
        className={cx(buttonVariants({ variant }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="pointer-events-none flex shrink-0 items-center justify-center gap-1.5">
            <RiLoader2Fill
              className="size-4 shrink-0 animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">
              {loadingText ? loadingText : "Loading"}
            </span>
            {loadingText ? loadingText : children}
          </span>
        ) : (
          children
        )}
      </Component>
    )
  },
)

Button.displayName = "Button"

export { Button, buttonVariants, type ButtonProps }
