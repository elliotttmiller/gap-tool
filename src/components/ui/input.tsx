import * as React from "react"
import { formatGroupedNumberInput, normalizeGroupedNumberInput } from "@/lib/numberInput"
import { cn, formatNumberInputValue } from "@/lib/utils"

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  inputClassName?: string
  groupThousands?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputClassName, prefix, suffix, type, value, onChange, onFocus, onBlur, inputMode, groupThousands, ...props }, ref) => {
    const [isEditingNumber, setIsEditingNumber] = React.useState(false)
    const isNumber = type === "number"
    const shouldGroupThousands = groupThousands ?? (isNumber && prefix === "$")
    const renderedType = shouldGroupThousands ? "text" : isNumber && !isEditingNumber ? "text" : type
    const renderedValue = shouldGroupThousands
      ? isEditingNumber
        ? normalizeGroupedNumberInput(String(value ?? ""))
        : formatGroupedNumberInput(value)
      : isNumber && !isEditingNumber
        ? formatNumberInputValue(value)
        : value

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      if (shouldGroupThousands) {
        event.currentTarget.value = normalizeGroupedNumberInput(event.currentTarget.value)
      }
      onChange?.(event)
    }

    const input = (
      <input
        type={renderedType}
        inputMode={isNumber ? (inputMode ?? "decimal") : inputMode}
        value={renderedValue}
        onChange={handleChange}
        onFocus={(event) => {
          if (isNumber) setIsEditingNumber(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          if (isNumber) setIsEditingNumber(false)
          onBlur?.(event)
        }}
        className={cn(
          "flex h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-1 text-sm leading-none text-gray-100 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50",
          prefix && "pl-7",
          suffix && "pr-11",
          prefix || suffix ? inputClassName : className
        )}
        ref={ref}
        {...props}
      />
    )

    if (prefix || suffix) {
      return (
        <div className={cn("relative", className)}>
          {prefix ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{prefix}</span> : null}
          {input}
          {suffix ? <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{suffix}</span> : null}
        </div>
      )
    }

    return (
      input
    )
  }
)
Input.displayName = "Input"

export { Input }
