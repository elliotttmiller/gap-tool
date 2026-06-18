import { DisabilityOutputs, DisabilityIncomeProjectionPoint } from "../types"

export type DisabilityProjectionChartPoint = {
  age: number
  "Assumed Income (Gross)": number
  "Assumed Income (Net)": number
  "Group LTD (Net)": number
  "Group LTD (Gross)": number
  "Individual DI": number
  "Income Gap (Net)": number
  "Income Gap (Gross)": number
  /** Backward-compatible alias for the net gap. */
  "Income Gap": number
}

export type DisabilityChartData = {
  projectionChartData: DisabilityProjectionChartPoint[]
  /** Income at each age, kept separate for the line overlay. */
  incomeData: { age: number; annualIncome: number }[]
  animationKey: string
}

/**
 * Converts disability outputs into chart-ready view data for the income
 * projection chart.  Does not perform financial calculation.
 */
export function transformDisabilityChartData(outputs: DisabilityOutputs): DisabilityChartData {
  const projectionChartData: DisabilityProjectionChartPoint[] = outputs.incomeProjection.map(
    (point: DisabilityIncomeProjectionPoint) => ({
      age: point.age,
      "Assumed Income (Gross)": point.annualIncome,
      "Assumed Income (Net)": point.annualIncomeNet,
      "Group LTD (Net)": point.ltdAnnualBenefit,
      "Group LTD (Gross)": point.ltdAnnualBenefitGross,
      "Individual DI": point.individualDIAnnualBenefit,
      "Income Gap (Net)": point.annualGapNet,
      "Income Gap (Gross)": point.annualGapGross,
      "Income Gap": point.annualGapNet,
    }),
  )

  const incomeData = outputs.incomeProjection.map((p) => ({
    age: p.age,
    annualIncome: p.annualIncome,
  }))

  return {
    projectionChartData,
    incomeData,
    animationKey: [
      outputs.totalGap,
      outputs.totalCoverage,
      outputs.averageCoverageRate,
      outputs.incomeProjection.length,
    ].join(":"),
  }
}
