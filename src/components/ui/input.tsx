import * as React from "react"
import { cn } from "@/lib/utils"
import { formatGroupedNumberInput, normalizeGroupedNumberInput } from "@/lib/numberInput"

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  inputClassName?: string
  groupThousands?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputClassName, prefix, suffix, type, groupThousands, value, onChange, ...props }, ref) => {
    const shouldGroupThousands = groupThousands ?? (type === "number" && prefix === "$")
    const displayValue = shouldGroupThousands ? formatGroupedNumberInput(value) : value

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      if (!onChange) return
      if (shouldGroupThousands) {
        event.currentTarget.value = normalizeGroupedNumberInput(event.currentTarget.value)
      }
      onChange(event)
    }

    const input = (
      <input
        {...props}
        type={shouldGroupThousands ? "text" : type}
        inputMode={shouldGroupThousands ? "decimal" : props.inputMode}
        value={displayValue}
        onChange={handleChange}
        className={cn(
          "flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm leading-none text-[#4f4f54] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-white/8 dark:text-white dark:placeholder:text-white/50",
          prefix && "pl-7",
          suffix && "pr-11",
          prefix || suffix ? inputClassName : className
        )}
        ref={ref}
      />
    )

    if (prefix || suffix) {
      return (
        <div className={cn("relative", className)}>
          {prefix ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-white/50">{prefix}</span> : null}
          {input}
          {suffix ? <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-white/50">{suffix}</span> : null}
        </div>
      )
    }

    return input
  }
)
Input.displayName = "Input"

export { Input }
