// Tremor Raw Card [v0.0.1]

import { Slot } from "@radix-ui/react-slot"
import React from "react"

import { cx } from "@/lib/utils"

interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, asChild, ...props }, forwardedRef) => {
    const Component = asChild ? Slot : "div"
    return (
      <Component
        ref={forwardedRef}
        className={cx(
          "relative w-full rounded-lg border p-6 text-left shadow-sm",
          "border-[#a7c0c9] bg-[#e7f0f2] shadow-[0_10px_28px_rgba(13,27,42,0.11)] dark:border-gray-800 dark:bg-[#090E1A] dark:shadow-sm",
          className,
        )}
        {...props}
      />
    )
  },
)

Card.displayName = "Card"

export { Card, type CardProps }
