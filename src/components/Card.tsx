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
          "relative w-full rounded-xl border p-6 text-left",
          "border-[#d5e2e5] bg-white text-[#102a3a] shadow-[0_1px_2px_rgba(15,42,58,0.04),0_10px_28px_rgba(15,42,58,0.06)] dark:border-[#59616b] dark:bg-[#32373f] dark:text-[#f7fafb] dark:shadow-[0_8px_22px_rgba(0,0,0,0.16)]",
          className,
        )}
        {...props}
      />
    )
  },
)

Card.displayName = "Card"

export { Card, type CardProps }
