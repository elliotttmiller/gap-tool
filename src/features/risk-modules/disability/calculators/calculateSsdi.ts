/**
 * SSDI Benefit Estimator
 *
 * Implements the Social Security Administration's Primary Insurance Amount (PIA)
 * formula using 2025 bend points.
 *
 * Reference: https://www.ssa.gov/oact/cola/bendpoints.html
 *
 * IMPORTANT: This is an estimate only. Actual SSDI is calculated from a client's
 * complete, inflation-indexed lifetime earnings record (AIME). For a precise figure,
 * clients should review their Social Security Statement at ssa.gov/myaccount.
 */

// 2025 SSA bend points (updated annually via the national wage index)
const BEND_POINT_1 = 1_226
const BEND_POINT_2 = 7_391

// 2025 statutory maximum monthly SSDI benefit
const MAX_MONTHLY_SSDI = 3_822

/** SSA imposes a 5-month waiting period before the first benefit is paid. */
export const SSDI_WAITING_MONTHS = 5

export interface SsdiInputs {
  /**
   * Estimated career-average annual earned income used as an AIME proxy.
   * Pre-filled with the client's current income; advisor can adjust downward
   * for clients with interrupted or lower-earning histories.
   */
  careerAvgAnnualIncome: number
  /** Annual income at the time of disability onset (for replacement-rate display). */
  annualIncomeAtDisability: number
}

export interface SsdiOutputs {
  /** Proxy AIME (careerAvgAnnualIncome ÷ 12). */
  estimatedAime: number
  /** Raw Primary Insurance Amount before rounding. */
  estimatedPia: number
  /** Estimated monthly SSDI benefit (PIA rounded to nearest $0.10, capped). */
  estimatedMonthlyBenefit: number
  /** Estimated annual SSDI benefit. */
  estimatedAnnualBenefit: number
  /** Pre-disability monthly income. */
  monthlyIncomeAtDisability: number
  /** SSDI as a fraction of pre-disability monthly income (e.g. 0.32 = 32%). */
  replacementRateGross: number
  /** Monthly income not covered by SSDI. */
  monthlyGap: number
  /** Total income lost during the 5-month waiting period before SSDI begins. */
  waitingPeriodIncomeLoss: number
  /** PIA component breakdown (for an illustrative waterfall). */
  piaComponents: {
    /** 90% tier on AIME up to first bend point. */
    tier1: number
    /** 32% tier on AIME between the two bend points. */
    tier2: number
    /** 15% tier on AIME above the second bend point. */
    tier3: number
  }
}

export type SsdiResult = ({ ok: true } & SsdiOutputs) | { ok: false; error: string }

/**
 * Estimates a client's SSDI monthly benefit using the SSA PIA bend-point formula.
 *
 * Returns `{ ok: false, error }` for invalid inputs.
 */
export function calculateSsdi(inputs: SsdiInputs): SsdiResult {
  const { careerAvgAnnualIncome, annualIncomeAtDisability } = inputs

  if (careerAvgAnnualIncome <= 0) {
    return { ok: false, error: "Career average income must be greater than zero." }
  }
  if (annualIncomeAtDisability <= 0) {
    return { ok: false, error: "Income at disability must be greater than zero." }
  }

  // AIME proxy: career-average annual income ÷ 12
  const estimatedAime = Math.round(careerAvgAnnualIncome / 12)

  // PIA bend-point formula (2025 bend points)
  const tier1 = 0.9 * Math.min(estimatedAime, BEND_POINT_1)
  const tier2 = 0.32 * Math.max(0, Math.min(estimatedAime, BEND_POINT_2) - BEND_POINT_1)
  const tier3 = 0.15 * Math.max(0, estimatedAime - BEND_POINT_2)

  const rawPia = tier1 + tier2 + tier3

  // Round to nearest $0.10 per SSA convention, then apply statutory cap
  const estimatedPia = Math.round(rawPia * 10) / 10
  const estimatedMonthlyBenefit = Math.min(estimatedPia, MAX_MONTHLY_SSDI)
  const estimatedAnnualBenefit = estimatedMonthlyBenefit * 12

  const monthlyIncomeAtDisability = annualIncomeAtDisability / 12
  const replacementRateGross = estimatedMonthlyBenefit / monthlyIncomeAtDisability
  const monthlyGap = Math.max(0, monthlyIncomeAtDisability - estimatedMonthlyBenefit)

  // Total income lost during the SSA 5-month waiting period
  const waitingPeriodIncomeLoss = monthlyIncomeAtDisability * SSDI_WAITING_MONTHS

  return {
    ok: true,
    estimatedAime,
    estimatedPia,
    estimatedMonthlyBenefit,
    estimatedAnnualBenefit,
    monthlyIncomeAtDisability,
    replacementRateGross,
    monthlyGap,
    waitingPeriodIncomeLoss,
    piaComponents: { tier1, tier2, tier3 },
  }
}
