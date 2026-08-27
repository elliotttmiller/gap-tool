// Tremor Raw Input [v1.0.3]

import { RiEyeFill, RiEyeOffFill, RiSearchLine } from "@remixicon/react"
import React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cx, focusInput, focusRing, hasErrorInput } from "@/lib/utils"

const inputStyles = tv({
  base: [
    "relative block w-full appearance-none truncate rounded-md border px-2.5 py-2 shadow-sm outline-none transition sm:text-sm",
    "border-gray-300 dark:border-white/20",
    "text-[#4f4f54] dark:text-white",
    "placeholder:text-gray-500 dark:placeholder:text-white/50",
    "bg-white dark:bg-white/8",
    "hover:border-brand-500/50",
    "disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:dark:border-white/10 disabled:dark:bg-white/5 disabled:dark:text-white/40",
    [
      "file:-my-2 file:-ml-2.5 file:cursor-pointer file:rounded-l-[5px] file:rounded-r-none file:border-0 file:px-3 file:py-2 file:outline-none focus:outline-none disabled:pointer-events-none file:disabled:pointer-events-none",
      "file:border-solid file:border-gray-300 file:bg-gray-50 file:text-[#4f4f54] file:hover:bg-brand-50 file:dark:border-white/20 file:dark:bg-white/8 file:dark:text-white file:hover:dark:bg-white/12",
      "file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem]",
    ],
    focusInput,
    "[&::--webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
  ],
  variants: {
    hasError: {
      true: hasErrorInput,
    },
    enableStepper: {
      false: "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
  },
})

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputStyles> {
  inputClassName?: string
}

function normalizeNumericInput(value: string) {
  const compact = value.replaceAll(",", "").replace(/\s/g, "")
  const negative = compact.startsWith("-")
  const unsigned = compact.replaceAll("-", "")
  const decimalIndex = unsigned.indexOf(".")
  const integerPart = (decimalIndex >= 0 ? unsigned.slice(0, decimalIndex) : unsigned).replace(/\D/g, "")
  const fractionalPart = (decimalIndex >= 0 ? unsigned.slice(decimalIndex + 1) : "").replace(/\D/g, "")
  const decimal = decimalIndex >= 0
  const sign = negative ? "-" : ""

  if (!integerPart && !decimal) return sign
  return `${sign}${integerPart}${decimal ? `.${fractionalPart}` : ""}`
}

function formatNumericInput(value: React.InputHTMLAttributes<HTMLInputElement>["value"]) {
  if (value === undefined || value === null || Array.isArray(value)) return value
  const normalized = normalizeNumericInput(String(value))
  if (!normalized || normalized === "-") return normalized

  const negative = normalized.startsWith("-")
  const unsigned = negative ? normalized.slice(1) : normalized
  const [integerPart, fractionalPart] = unsigned.split(".")
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  const decimal = unsigned.includes(".")

  return `${negative ? "-" : ""}${groupedInteger}${decimal ? `.${fractionalPart ?? ""}` : ""}`
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      inputClassName,
      hasError,
      enableStepper = true,
      type,
      value,
      defaultValue,
      onChange,
      inputMode,
      placeholder,
      max,
      ...props
    },
    forwardedRef,
  ) => {
    const [typeState, setTypeState] = React.useState(type)
    const isPassword = type === "password"
    const isSearch = type === "search"
    const isNumeric = type === "number"
    const usesGroupedNumberDisplay = isNumeric && max === undefined
    const formattedValue = usesGroupedNumberDisplay ? formatNumericInput(value) : value
    const formattedDefaultValue = usesGroupedNumberDisplay ? formatNumericInput(defaultValue) : defaultValue
    const showPersistentNumericLabel = Boolean(isNumeric && placeholder && value !== undefined && String(value).length > 0)

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      if (!usesGroupedNumberDisplay) {
        onChange?.(event)
        return
      }

      const input = event.currentTarget
      const normalized = normalizeNumericInput(input.value)
      input.value = normalized
      onChange?.(event)

      if (value === undefined) {
        input.value = String(formatNumericInput(normalized) ?? "")
      }
    }

    return (
      <div className={cx("relative w-full", className)}>
        <input
          ref={forwardedRef}
          type={isPassword ? typeState : usesGroupedNumberDisplay ? "text" : type}
          inputMode={inputMode ?? (usesGroupedNumberDisplay ? "decimal" : undefined)}
          value={formattedValue}
          defaultValue={formattedDefaultValue}
          placeholder={placeholder}
          max={max}
          onChange={handleChange}
          className={cx(
            inputStyles({ hasError, enableStepper }),
            {
              "pl-8": isSearch,
              "pr-10": isPassword,
              "pb-1 pt-5": showPersistentNumericLabel,
            },
            inputClassName,
          )}
          {...props}
        />
        {showPersistentNumericLabel ? (
          <span className="pointer-events-none absolute left-2.5 top-1 text-[9px] font-semibold leading-none text-[#4f4f54]/60 dark:text-white/55">
            {placeholder}
          </span>
        ) : null}
        {isSearch && (
          <div className={cx("pointer-events-none absolute bottom-0 left-2 flex h-full items-center justify-center", "text-gray-500 dark:text-white/50")}>
            <RiSearchLine className="size-4.5 shrink-0" aria-hidden="true" />
          </div>
        )}
        {isPassword && (
          <div className={cx("absolute bottom-0 right-0 flex h-full items-center justify-center px-3")}>
            <button
              aria-label="Change password visibility"
              className={cx("h-fit w-fit rounded-sm outline-none transition-all", "text-gray-500 dark:text-white/50", "hover:text-brand-700 hover:dark:text-brand-300", focusRing)}
              type="button"
              onClick={() => setTypeState(typeState === "password" ? "text" : "password")}
            >
              <span className="sr-only">{typeState === "password" ? "Show password" : "Hide password"}</span>
              {typeState === "password" ? (
                <RiEyeFill aria-hidden="true" className="size-5 shrink-0" />
              ) : (
                <RiEyeOffFill aria-hidden="true" className="size-5 shrink-0" />
              )}
            </button>
          </div>
        )}
      </div>
    )
  },
)

Input.displayName = "Input"

export { Input, inputStyles, type InputProps }
