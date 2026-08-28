export function normalizeGroupedNumberInput(value: string): string {
  const compact = value.replace(/[,$\s]/g, "")
  const negative = compact.startsWith("-")
  const unsigned = negative ? compact.slice(1) : compact
  const cleaned = unsigned.replace(/[^\d.]/g, "")
  const decimalIndex = cleaned.indexOf(".")

  if (decimalIndex === -1) {
    return `${negative ? "-" : ""}${cleaned}`
  }

  const integer = cleaned.slice(0, decimalIndex)
  const fraction = cleaned.slice(decimalIndex + 1).replace(/\./g, "")
  return `${negative ? "-" : ""}${integer}.${fraction}`
}

export function formatGroupedNumberInput(
  value: string | number | readonly string[] | undefined,
): string {
  if (value === undefined || Array.isArray(value)) return ""

  const raw = String(value)
  if (!raw) return ""

  const negative = raw.startsWith("-")
  const unsigned = negative ? raw.slice(1) : raw
  const [integer = "", fraction] = unsigned.split(".")
  const groupedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  const sign = negative ? "-" : ""

  return fraction !== undefined
    ? `${sign}${groupedInteger}.${fraction}`
    : `${sign}${groupedInteger}`
}
