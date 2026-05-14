/**
 * Disability Insurance Plan Break-Even Calculator
 *
 * Determines the break-even period between two disability insurance plans that
 * differ in elimination period length and premium.
 *
 * Plan A = Shorter Elimination Period (higher premium, less income at risk)
 * Plan B = Longer Elimination Period (lower premium, more income at risk)
 *
 * "Elimination Period Exposure" is the estimated income / expenses at risk
 * during the elimination period (monthly expenses × EP months). The break-even
 * point shows how many claim-free months are needed before Plan B's lower
 * premiums offset the additional exposure.
 */

export type PremiumFrequency = "monthly" | "yearly"

export interface BreakEvenInputs {
  /** Plan A (shorter elimination period) premium amount. */
  planAPremium: number
  /** Plan A elimination period exposure in dollars (expenses × EP months). */
  planADeductible: number
  /** Plan B (longer elimination period) premium amount. */
  planBPremium: number
  /** Plan B elimination period exposure in dollars (expenses × EP months). */
  planBDeductible: number
  /** Whether the entered premium amounts are monthly or yearly. */
  premiumFrequency: PremiumFrequency
}

export type BreakEvenResult =
  | { ok: true } & BreakEvenOutputs
  | { ok: false; error: string }

export interface BreakEvenOutputs {
  /** Monthly premium savings from choosing Plan B (longer EP, lower premium). */
  monthlySavings: number
  /** Annualized premium savings from choosing Plan B. */
  yearlySavings: number
  /** Additional elimination period exposure by choosing Plan B (the "risk gap"). */
  riskGap: number
  /** Claim-free months needed before Plan B's premium savings offset the added exposure. */
  breakEvenMonths: number
  /** Break-even period expressed in years (one decimal place). */
  breakEvenYears: string
  /** Total Year-1 cost on Plan A if a disability occurs immediately (premium + EP exposure). */
  costWithClaimA: number
  /** Total Year-1 cost on Plan B if a disability occurs immediately (premium + EP exposure). */
  costWithClaimB: number
  /** Extra first-year cost if a disability occurs immediately and Plan B was chosen. */
  claimDifference: number
  /** Which plan is statistically better given the break-even period. */
  recommendation: string
}

/**
 * Calculates the disability plan break-even point between two plans.
 *
 * Returns `{ ok: false, error }` when the inputs are logically inconsistent
 * (e.g. Plan B is not cheaper, or does not have a longer elimination period).
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
      error: "Plan B (Longer Elimination Period) must have a lower premium than Plan A to calculate break-even.",
    }
  }

  const riskGap = planBDeductible - planADeductible

  if (riskGap <= 0) {
    return {
      ok: false,
      error: "Plan B must have a greater elimination period exposure than Plan A to assess the income risk gap.",
    }
  }

  const breakEvenMonths = Math.ceil(riskGap / monthlySavings)
  const breakEvenYearsNum = breakEvenMonths / 12
  const breakEvenYears = breakEvenYearsNum.toFixed(1)

  const costWithClaimA = planAYearly + planADeductible
  const costWithClaimB = planBYearly + planBDeductible
  const claimDifference = costWithClaimB - costWithClaimA

  const recommendation = breakEvenYearsNum < 2
    ? "Longer Elimination Period (Plan B)"
    : "Shorter Elimination Period (Plan A)"

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
