import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Primary class merge utility (Tremor-style)
export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args))
}

// Alias for shadcn/radix compatibility
export const cn = cx

// ── Focus helpers ────────────────────────────────────────────────────────────

export const focusInput = [
  "focus:ring-2",
  "focus:ring-indigo-200 focus:dark:ring-indigo-700/30",
  "focus:border-indigo-500 focus:dark:border-indigo-700",
]

export const focusRing = [
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  "outline-indigo-500 dark:outline-indigo-500",
]

export const hasErrorInput = [
  "ring-2",
  "border-red-500 dark:border-red-700",
  "ring-red-200 dark:ring-red-700/30",
]

// ── Number / currency formatters ─────────────────────────────────────────────

export const usNumberformatter = (number: number, decimals = 0) =>
  Intl.NumberFormat("us", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
    .format(Number(number))
    .toString()

export const percentageFormatter = (number: number, decimals = 1) => {
  const formattedNumber = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
  const symbol = number > 0 && number !== Infinity ? "+" : ""
  return `${symbol}${formattedNumber}`
}

export const millionFormatter = (number: number, decimals = 1) => {
  const formattedNumber = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
  return `${formattedNumber}M`
}

export const formatters: { [key: string]: (number: number, extra?: string) => string } = {
  currency: (number: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(number),
  unit: (number: number) => `${usNumberformatter(number)}`,
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value)
}

// ── Form helpers ─────────────────────────────────────────────────────────────

/** Parse a form string value to a number. Returns undefined for empty or non-finite strings. */
export function toNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

/** Format a number (or undefined) as a form string value. */
export function numberToInput(value?: number): string {
  return value === undefined || value === null ? "" : String(value)
}

/** Format an ISO date string for display (e.g. "Jan 1, 2026"). Returns "—" for missing/invalid values. */
export function formatDate(value?: string): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}
