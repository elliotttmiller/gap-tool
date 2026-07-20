import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import { cx } from "@/lib/utils"

const EMPTY_VALUE = "__northstar_empty_value__"

export type ThemedSelectOption = { value: string; label: string }

export function ThemedSelect({ value, options, onValueChange, placeholder, className, contentClassName, ariaLabel, id, disabled }: {
  value: string
  options: ThemedSelectOption[]
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  contentClassName?: string
  ariaLabel?: string
  id?: string
  disabled?: boolean
}) {
  const normalizedValue = value === "" ? EMPTY_VALUE : value
  return (
    <Select value={normalizedValue} onValueChange={(next) => onValueChange(next === EMPTY_VALUE ? "" : next)} disabled={disabled}>
      <SelectTrigger id={id} aria-label={ariaLabel} className={cx("min-w-0", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((option) => <SelectItem key={option.value || EMPTY_VALUE} value={option.value || EMPTY_VALUE}>{option.label}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}
