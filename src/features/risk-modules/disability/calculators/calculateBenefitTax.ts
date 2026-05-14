/**
 * LTD Benefit Taxation Calculator
 *
 * Converts a client's gross group LTD benefit into a real after-tax number using
 * 2025 federal income tax brackets and an optional state income tax rate.
 *
 * Core rule (IRS Publication 525):
 *   - If the *employer* pays the LTD premium, ALL benefits are taxable as ordinary income.
 *   - If the *employee* pays premiums with after-tax dollars, benefits are tax-free.
 *
 * Method: We compute the marginal federal tax on LTD benefits by calculating
 * total tax (benefit income - standard deduction) using the piecewise bracket table.
 * This reflects the real world scenario where disability benefit is the only income
 * during the claim period.
 */

export type FilingStatus = "single" | "mfj" | "hoh" | "mfs"

// 2025 federal income tax brackets: [marginal rate, upper taxable income bound]
// Upper bound of the final bracket is Infinity.
const BRACKETS_2025: Record<FilingStatus, Array<[number, number]>> = {
  single: [
    [0.10, 11_925],
    [0.12, 48_475],
    [0.22, 103_350],
    [0.24, 197_300],
    [0.32, 250_525],
    [0.35, 626_350],
    [0.37, Infinity],
  ],
  mfj: [
    [0.10, 23_850],
    [0.12, 96_950],
    [0.22, 206_700],
    [0.24, 394_600],
    [0.32, 501_050],
    [0.35, 751_600],
    [0.37, Infinity],
  ],
  hoh: [
    [0.10, 17_000],
    [0.12, 64_300],
    [0.22, 103_350],
    [0.24, 197_300],
    [0.32, 250_500],
    [0.35, 626_350],
    [0.37, Infinity],
  ],
  mfs: [
    [0.10, 11_925],
    [0.12, 48_475],
    [0.22, 103_350],
    [0.24, 197_300],
    [0.32, 250_525],
    [0.35, 313_800],
    [0.37, Infinity],
  ],
}

// 2025 standard deductions
const STANDARD_DEDUCTIONS_2025: Record<FilingStatus, number> = {
  single: 15_000,
  mfj: 30_000,
  hoh: 22_500,
  mfs: 15_000,
}

/** Compute federal income tax on taxable income using piecewise bracket math. */
function computeFederalTax(taxableIncome: number, status: FilingStatus): number {
  if (taxableIncome <= 0) return 0
  const brackets = BRACKETS_2025[status]
  let tax = 0
  let prev = 0
  for (const [rate, upper] of brackets) {
    const slice = Math.min(taxableIncome, upper) - prev
    if (slice <= 0) break
    tax += rate * slice
    prev = upper
  }
  return tax
}

/** Returns the marginal bracket rate that applies at the given taxable income level. */
function getMarginalRate(taxableIncome: number, status: FilingStatus): number {
  if (taxableIncome <= 0) return 0
  const brackets = BRACKETS_2025[status]
  let prev = 0
  for (const [rate, upper] of brackets) {
    if (taxableIncome <= upper) return rate
    prev = upper
  }
  // Unreachable (last bracket is Infinity), but satisfies TypeScript
  return brackets[brackets.length - 1][0]
  void prev
}

export interface BenefitTaxInputs {
  /** Client's pre-disability annual earned income. */
  annualIncome: number
  /** Gross monthly LTD benefit (as stated in the policy). */
  grossMonthlyBenefit: number
  /** LTD coverage percent (e.g. 0.60) — used only for display labelling. */
  coveragePercent: number
  /**
   * True when the employer pays the LTD premium.
   * This is the case for virtually all group plans and makes benefits taxable.
   */
  employerPaidPremium: boolean
  /** Federal tax filing status. */
  filingStatus: FilingStatus
  /** State income tax rate on benefits (0–1). Use 0 for states with no income tax. */
  stateTaxRate: number
}

export interface BenefitTaxOutputs {
  /** Annual gross LTD benefit. */
  annualGrossBenefit: number
  /** Annual LTD benefit subject to federal income tax. */
  federalTaxableBenefitAnnual: number
  /** Federal income tax attributable to the LTD benefit. */
  federalTaxOnBenefit: number
  /** State income tax on benefits. */
  stateTaxOnBenefit: number
  /** Combined federal + state tax on benefits. */
  totalTaxOnBenefit: number
  /** Monthly federal tax reduction from LTD taxability. */
  monthlyFederalTax: number
  /** Monthly state tax on benefits. */
  monthlyStateTax: number
  /** Net monthly LTD benefit after all income taxes. */
  netMonthlyBenefit: number
  /** Net annual LTD benefit. */
  netAnnualBenefit: number
  /** Effective tax rate on the gross LTD benefit (fraction, e.g. 0.18). */
  effectiveTaxRateOnBenefit: number
  /** Marginal federal bracket rate applicable to LTD income. */
  marginalFederalRate: number
  /** Pre-disability annual after-tax take-home income. */
  preTaxAnnualIncome: number
  /** Pre-disability monthly after-tax take-home income. */
  preTaxMonthlyIncome: number
  /** Gross LTD replacement rate vs pre-disability gross income. */
  grossReplacementRate: number
  /** True net replacement rate: after-tax LTD ÷ after-tax pre-disability income. */
  netReplacementRate: number
}

export type BenefitTaxResult = ({ ok: true } & BenefitTaxOutputs) | { ok: false; error: string }

/**
 * Calculates the real after-tax value of a group LTD benefit.
 *
 * Returns `{ ok: false, error }` for invalid inputs.
 */
export function calculateBenefitTax(inputs: BenefitTaxInputs): BenefitTaxResult {
  const {
    annualIncome,
    grossMonthlyBenefit,
    employerPaidPremium,
    filingStatus,
    stateTaxRate,
  } = inputs

  if (annualIncome <= 0) return { ok: false, error: "Annual income must be greater than zero." }
  if (grossMonthlyBenefit <= 0) return { ok: false, error: "Monthly LTD benefit must be greater than zero." }

  const stdDeduction = STANDARD_DEDUCTIONS_2025[filingStatus]

  // ── Pre-disability after-tax income ─────────────────────────────────────────
  const preTaxableIncome = Math.max(0, annualIncome - stdDeduction)
  const preFederalTax = computeFederalTax(preTaxableIncome, filingStatus)
  const preStateIncomeTax = annualIncome * stateTaxRate
  const preTaxAnnualIncome = annualIncome - preFederalTax - preStateIncomeTax
  const preTaxMonthlyIncome = preTaxAnnualIncome / 12

  // ── LTD benefit taxation ─────────────────────────────────────────────────────
  const annualGrossBenefit = grossMonthlyBenefit * 12

  // When on disability, earned income is replaced by LTD benefit only.
  // Employer-paid premiums make the benefit fully taxable as ordinary income.
  const federalTaxableBenefitAnnual = employerPaidPremium ? annualGrossBenefit : 0

  // Tax on LTD income modelled as LTD-as-sole-income scenario (after deduction)
  const ltdTaxableAfterDeduction = Math.max(0, federalTaxableBenefitAnnual - stdDeduction)
  const federalTaxOnBenefit = computeFederalTax(ltdTaxableAfterDeduction, filingStatus)
  const marginalFederalRate = getMarginalRate(ltdTaxableAfterDeduction, filingStatus)

  const stateTaxOnBenefit = federalTaxableBenefitAnnual * stateTaxRate
  const totalTaxOnBenefit = federalTaxOnBenefit + stateTaxOnBenefit

  const netAnnualBenefit = annualGrossBenefit - totalTaxOnBenefit
  const netMonthlyBenefit = netAnnualBenefit / 12
  const monthlyFederalTax = federalTaxOnBenefit / 12
  const monthlyStateTax = stateTaxOnBenefit / 12

  const effectiveTaxRateOnBenefit =
    annualGrossBenefit > 0 ? totalTaxOnBenefit / annualGrossBenefit : 0

  const grossReplacementRate = annualGrossBenefit / annualIncome
  const netReplacementRate = preTaxAnnualIncome > 0 ? netAnnualBenefit / preTaxAnnualIncome : 0

  return {
    ok: true,
    annualGrossBenefit,
    federalTaxableBenefitAnnual,
    federalTaxOnBenefit,
    stateTaxOnBenefit,
    totalTaxOnBenefit,
    monthlyFederalTax,
    monthlyStateTax,
    netMonthlyBenefit,
    netAnnualBenefit,
    effectiveTaxRateOnBenefit,
    marginalFederalRate,
    preTaxAnnualIncome,
    preTaxMonthlyIncome,
    grossReplacementRate,
    netReplacementRate,
  }
}
