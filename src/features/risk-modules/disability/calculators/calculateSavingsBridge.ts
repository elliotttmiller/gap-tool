/**
 * Elimination Period / Savings Bridge Calculator
 *
 * Models how quickly a client's liquid savings are depleted during the LTD
 * elimination (waiting) period — the gap between disability onset and the
 * first benefit payment.
 *
 * Typical elimination periods: 30, 60, 90, 180, or 365 days.
 * During this period, earned income drops to zero while living expenses continue.
 */

/** Average days per month (365.25 ÷ 12). */
const DAYS_PER_MONTH = 30.4375

export interface SavingsBridgeInputs {
  /** Monthly after-tax take-home income that stops at disability onset. */
  monthlyTakeHomeIncome: number
  /** Monthly living expenses (mortgage/rent, utilities, food, etc.). */
  monthlyExpenses: number
  /** Liquid savings available to cover the gap (emergency fund, taxable accounts). */
  liquidSavings: number
  /** LTD elimination period in days. */
  eliminationPeriodDays: number
  /** Monthly LTD benefit payable after the elimination period ends. */
  monthlyLtdBenefit: number
}

export interface SavingsBridgeOutputs {
  /** Elimination period expressed in months (for readability). */
  eliminationPeriodMonths: number
  /** Total income lost during the elimination period. */
  incomeLostDuringElimination: number
  /** Monthly cash-flow deficit during elimination period (full expenses, zero income). */
  monthlyDeficit: number
  /** Total savings needed to cover expenses for the full elimination period. */
  totalSavingsNeeded: number
  /** True when liquid savings can fully fund the elimination period. */
  savingsCoverPeriod: boolean
  /** Months liquid savings last at the monthly deficit burn rate. */
  savingsRunwayMonths: number
  /** Savings shortfall at the end of the elimination period (0 if fully covered). */
  savingsShortfall: number
  /** Savings remaining after covering the elimination period (0 if shortfall). */
  savingsRemaining: number
  /** Daily expense burn rate during the elimination period. */
  dailyBurnRate: number
  /** Ongoing monthly income gap *after* LTD benefits begin (expense − LTD benefit). */
  ongoingMonthlyGap: number
  /**
   * Months of remaining savings that cover the ongoing gap after LTD kicks in.
   * Returns 0 when there is no savings remainder, or a large number when there is
   * no ongoing gap.
   */
  postBridgeSavingsRunwayMonths: number
}

export type SavingsBridgeResult =
  | ({ ok: true } & SavingsBridgeOutputs)
  | { ok: false; error: string }

/**
 * Calculates the savings depletion rate and coverage during the elimination period.
 *
 * Returns `{ ok: false, error }` for invalid inputs.
 */
export function calculateSavingsBridge(inputs: SavingsBridgeInputs): SavingsBridgeResult {
  const {
    monthlyTakeHomeIncome,
    monthlyExpenses,
    liquidSavings,
    eliminationPeriodDays,
    monthlyLtdBenefit,
  } = inputs

  if (monthlyTakeHomeIncome <= 0)
    return { ok: false, error: "Monthly take-home income must be greater than zero." }
  if (monthlyExpenses <= 0)
    return { ok: false, error: "Monthly expenses must be greater than zero." }
  if (eliminationPeriodDays <= 0)
    return { ok: false, error: "Elimination period must be greater than zero." }
  if (liquidSavings < 0)
    return { ok: false, error: "Liquid savings cannot be negative." }

  const eliminationPeriodMonths = eliminationPeriodDays / DAYS_PER_MONTH

  // During elimination: earned income = 0, expenses continue at full rate
  const monthlyDeficit = monthlyExpenses
  const totalSavingsNeeded = monthlyDeficit * eliminationPeriodMonths
  const incomeLostDuringElimination = monthlyTakeHomeIncome * eliminationPeriodMonths
  const dailyBurnRate = monthlyExpenses / DAYS_PER_MONTH

  const savingsCoverPeriod = liquidSavings >= totalSavingsNeeded
  const savingsAfterElimination = liquidSavings - totalSavingsNeeded
  const savingsRemaining = Math.max(0, savingsAfterElimination)
  const savingsShortfall = Math.max(0, totalSavingsNeeded - liquidSavings)

  // How many months savings last at the full deficit burn rate
  const savingsRunwayMonths = monthlyDeficit > 0 ? liquidSavings / monthlyDeficit : Infinity

  // Ongoing monthly gap once LTD benefits begin
  const ongoingMonthlyGap = Math.max(0, monthlyExpenses - monthlyLtdBenefit)

  // Remaining savings runway covering the post-bridge gap (if any)
  let postBridgeSavingsRunwayMonths: number
  if (savingsRemaining <= 0) {
    postBridgeSavingsRunwayMonths = 0
  } else if (ongoingMonthlyGap <= 0) {
    postBridgeSavingsRunwayMonths = Infinity
  } else {
    postBridgeSavingsRunwayMonths = savingsRemaining / ongoingMonthlyGap
  }

  return {
    ok: true,
    eliminationPeriodMonths,
    incomeLostDuringElimination,
    monthlyDeficit,
    totalSavingsNeeded,
    savingsCoverPeriod,
    savingsRunwayMonths,
    savingsShortfall,
    savingsRemaining,
    dailyBurnRate,
    ongoingMonthlyGap,
    postBridgeSavingsRunwayMonths,
  }
}
