import { DisabilityOutputs, DisabilityIncomeProjectionPoint } from "../types"

export type DisabilityProjectionChartPoint = {
  age: number
  "Group LTD": number
  "Individual DI": number
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
      "Group LTD": point.ltdAnnualBenefit,
      "Individual DI": point.individualDIAnnualBenefit,
      "Income Gap": point.annualGap,
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
