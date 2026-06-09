/**
 * Disability "Why Use Insurance?" break-even calculator.
 *
 * Mirrors docs/advisor-references/Calculator.xlsx:
 * - Presentation!H44 = 'Prem v Self'!T7
 * - Prem v Self!T7 = VLOOKUP(monthsWithoutIncome, Q3:R82, 2) // capped at 80 months
 * - Presentation!H46 = NPER(rateOfReturn / 12, monthlyPremium, 0, -benefitsReceived)
 * - Presentation!H48 = breakEvenMonths / 12
 */

export interface BreakEvenInputs {
  /** Presentation!H39 */
  monthlyPremium: number
  /** Presentation!H40 */
  monthlyBenefit: number
  /** Presentation!H41, entered as a decimal (6% = 0.06). */
  annualRateOfReturn: number
  /** Presentation!H42 */
  monthsWithoutIncome: number
  /**
   * Annual COLA applied to the DI benefit during a disability claim.
   * Each 12-month anniversary the benefit steps up by this factor.
   * e.g. 0.03 = 3%.  Defaults to 0 (flat benefit).
   */
  colaRate?: number
}

export interface BreakEvenMonthRow {
  month: number
  monthlyPremium: number
  monthlyReturnFactor: number
  investmentBalance: number
  cumulativeBenefits: number
}

export type BreakEvenResult =
  | ({ ok: true } & BreakEvenOutputs)
  | { ok: false; error: string }

export interface BreakEvenOutputs {
  monthlyPremium: number
  monthlyBenefit: number
  annualRateOfReturn: number
  monthlyRateOfReturn: number
  monthlyReturnFactor: number
  monthsWithoutIncome: number
  /** Annual COLA rate applied to benefits during the disability period. */
  colaRate: number
  benefitsReceived: number
  breakEvenMonths: number
  breakEvenYears: number
  roundedBreakEvenMonths: number
  totalPremiumsToBreakEven: number
  investmentAtRoundedBreakEven: number
  schedule: BreakEvenMonthRow[]
}

const MAX_SCHEDULE_MONTH = 1200
const MAX_BENEFIT_LOOKUP_MONTH = 80

function excelNper(rate: number, payment: number, presentValue: number, futureValue: number): number {
  if (rate === 0) {
    return -(presentValue + futureValue) / payment
  }

  return Math.log((payment - futureValue * rate) / (payment + presentValue * rate)) / Math.log(1 + rate)
}

function lookupBenefitsReceived(monthlyBenefit: number, monthsWithoutIncome: number, colaRate = 0): number {
  const lookupMonth = Math.min(monthsWithoutIncome, MAX_BENEFIT_LOOKUP_MONTH)
  if (colaRate <= 0) return monthlyBenefit * lookupMonth

  // Annual COLA step-up: benefit for month m = base × (1 + cola)^floor((m-1)/12)
  let total = 0
  for (let m = 1; m <= lookupMonth; m++) {
    total += monthlyBenefit * Math.pow(1 + colaRate, Math.floor((m - 1) / 12))
  }
  return Math.round(total * 100) / 100
}

function buildSchedule(inputs: {
  monthlyPremium: number
  monthlyBenefit: number
  monthlyReturnFactor: number
  months: number
}): BreakEvenMonthRow[] {
  const { monthlyPremium, monthlyBenefit, monthlyReturnFactor, months } = inputs
  const rows: BreakEvenMonthRow[] = []
  let investmentBalance = 0

  for (let month = 1; month <= months; month += 1) {
    investmentBalance = (investmentBalance + monthlyPremium) * monthlyReturnFactor

    rows.push({
      month,
      monthlyPremium,
      monthlyReturnFactor,
      investmentBalance,
      cumulativeBenefits: monthlyBenefit * month,
    })
  }

  return rows
}

function futureValueOfPremiums(monthlyPremium: number, monthlyReturnFactor: number, months: number): number {
  if (months <= 0) return 0

  let balance = 0
  for (let month = 1; month <= months; month += 1) {
    balance = (balance + monthlyPremium) * monthlyReturnFactor
  }
  return balance
}

/**
 * Calculates the self-insurance break-even point from the source spreadsheet.
 */
export function calculateBreakEven(inputs: BreakEvenInputs): BreakEvenResult {
  const monthlyPremium = Number(inputs.monthlyPremium)
  const monthlyBenefit = Number(inputs.monthlyBenefit)
  const annualRateOfReturn = Number(inputs.annualRateOfReturn)
  const monthsWithoutIncome = Math.floor(Number(inputs.monthsWithoutIncome))

  if (!Number.isFinite(monthlyPremium) || monthlyPremium <= 0) {
    return { ok: false, error: "Monthly premium must be greater than $0." }
  }

  if (!Number.isFinite(monthlyBenefit) || monthlyBenefit <= 0) {
    return { ok: false, error: "Monthly benefit must be greater than $0." }
  }

  if (!Number.isFinite(annualRateOfReturn) || annualRateOfReturn < 0) {
    return { ok: false, error: "Rate of return must be 0% or greater." }
  }

  if (!Number.isFinite(monthsWithoutIncome) || monthsWithoutIncome <= 0) {
    return { ok: false, error: "Months without income must be at least 1." }
  }

  const monthlyRateOfReturn = annualRateOfReturn / 12
  const monthlyReturnFactor = 1 + monthlyRateOfReturn
  const colaRate = Math.max(0, Number(inputs.colaRate ?? 0))
  const benefitsReceived = lookupBenefitsReceived(monthlyBenefit, monthsWithoutIncome, colaRate)
  const breakEvenMonths = excelNper(monthlyRateOfReturn, monthlyPremium, 0, -benefitsReceived)

  if (!Number.isFinite(breakEvenMonths) || breakEvenMonths <= 0) {
    return { ok: false, error: "These inputs do not produce a valid break-even month." }
  }

  const roundedBreakEvenMonths = Math.ceil(breakEvenMonths)
  const scheduleMonths = MAX_SCHEDULE_MONTH
  const schedule = buildSchedule({
    monthlyPremium,
    monthlyBenefit,
    monthlyReturnFactor,
    months: scheduleMonths,
  })
  const investmentAtRoundedBreakEven =
    schedule[roundedBreakEvenMonths - 1]?.investmentBalance ??
    futureValueOfPremiums(monthlyPremium, monthlyReturnFactor, roundedBreakEvenMonths)

  return {
    ok: true,
    monthlyPremium,
    monthlyBenefit,
    annualRateOfReturn,
    monthlyRateOfReturn,
    monthlyReturnFactor,
    monthsWithoutIncome,
    colaRate,
    benefitsReceived,
    breakEvenMonths,
    breakEvenYears: breakEvenMonths / 12,
    roundedBreakEvenMonths,
    totalPremiumsToBreakEven: monthlyPremium * breakEvenMonths,
    investmentAtRoundedBreakEven,
    schedule,
  }
}
