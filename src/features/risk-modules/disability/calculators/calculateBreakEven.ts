/**
 * Insurance Break-Even Calculator
 *
 * Determines the break-even period between two insurance plans with different
 * premium and deductible combinations (Plan A = Low Deductible, Plan B = High
 * Deductible). Implements the exact formula used by the reference source:
 * https://smart-calculator.org/insurance-break-even-calculator
 */

export type PremiumFrequency = "monthly" | "yearly"

export interface BreakEvenInputs {
  /** Plan A (low deductible) premium amount. */
  planAPremium: number
  /** Plan A deductible. */
  planADeductible: number
  /** Plan B (high deductible) premium amount. */
  planBPremium: number
  /** Plan B deductible. */
  planBDeductible: number
  /** Whether the entered premium amounts are monthly or yearly. */
  premiumFrequency: PremiumFrequency
}

export type BreakEvenResult =
  | { ok: true } & BreakEvenOutputs
  | { ok: false; error: string }

export interface BreakEvenOutputs {
  /** Monthly savings from choosing Plan B (lower premium, higher deductible). */
  monthlySavings: number
  /** Annualised savings from choosing Plan B. */
  yearlySavings: number
  /** Additional deductible exposure by choosing Plan B (the "risk gap"). */
  riskGap: number
  /** Months without a claim needed before Plan B saves money. */
  breakEvenMonths: number
  /** Break-even period expressed in years (one decimal place). */
  breakEvenYears: string
  /** Total out-of-pocket on Plan A if a maximum claim occurs this year. */
  costWithClaimA: number
  /** Total out-of-pocket on Plan B if a maximum claim occurs this year. */
  costWithClaimB: number
  /** Extra cost incurred if a major claim happens immediately and Plan B was chosen. */
  claimDifference: number
  /** Which plan is statistically better given the break-even period. */
  recommendation: string
}

/**
 * Calculates the insurance break-even point between two plans.
 *
 * Returns `{ ok: false, error }` when the inputs are logically inconsistent
 * (e.g. Plan B is not cheaper, or does not have a higher deductible).
 */
export function calculateBreakEven(inputs: BreakEvenInputs): BreakEvenResult {
  const { planAPremium, planADeductible, planBPremium, planBDeductible, premiumFrequency } = inputs

  // Normalise to yearly amounts for consistent comparison
  const planAYearly = premiumFrequency === "monthly" ? planAPremium * 12 : planAPremium
  const planBYearly = premiumFrequency === "monthly" ? planBPremium * 12 : planBPremium

  const yearlySavings = planAYearly - planBYearly
  const monthlySavings = yearlySavings / 12

  if (yearlySavings <= 0) {
    return {
      ok: false,
      error: "Plan B (High Deductible) must be cheaper than Plan A to calculate break-even.",
    }
  }

  const riskGap = planBDeductible - planADeductible

  if (riskGap <= 0) {
    return {
      ok: false,
      error: "Plan B must have a higher deductible to assess the risk gap.",
    }
  }

  const breakEvenMonths = Math.ceil(riskGap / monthlySavings)
  const breakEvenYearsNum = breakEvenMonths / 12
  const breakEvenYears = breakEvenYearsNum.toFixed(1)

  const costWithClaimA = planAYearly + planADeductible
  const costWithClaimB = planBYearly + planBDeductible
  const claimDifference = costWithClaimB - costWithClaimA

  const recommendation = breakEvenYearsNum < 2
    ? "High Deductible (Plan B)"
    : "Low Deductible (Plan A)"

  return {
    ok: true,
    monthlySavings,
    yearlySavings,
    riskGap,
    breakEvenMonths,
    breakEvenYears,
    costWithClaimA,
    costWithClaimB,
    claimDifference,
    recommendation,
  }
}
