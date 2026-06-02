export type AnnualIncomeGapPoint = {
  yearIndex: number
  age: number
  projectedNeed: number
  availableCoverage: number
  annualGap: number
  cumulativeGap: number
}

export type LiabilityExposurePoint = {
  yearIndex: number
  age: number
  grossIncome: number
  disposableIncome: number
  garnishableIncome: number
  cumulativeExposure: number
}

export type MonthlyReserveGapPoint = {
  month: number
  expenses: number
  remainingIncome: number
  severance: number
  unemploymentBenefit: number
  requiredSavingsDraw: number
  endingReserveBalance: number
  shortfall: number
}

export function summarizeAnnualGapSchedule(schedule: AnnualIncomeGapPoint[]) {
  const projectedNeedTotal = schedule.reduce((sum, point) => sum + point.projectedNeed, 0)
  const totalCovered = schedule.reduce((sum, point) => sum + point.availableCoverage, 0)
  const survivorGap = schedule.reduce((sum, point) => sum + point.annualGap, 0)
  return {
    projectedNeedTotal,
    totalCovered,
    survivorGap,
    isFullyCovered: schedule.every((point) => point.annualGap <= 0),
  }
}
