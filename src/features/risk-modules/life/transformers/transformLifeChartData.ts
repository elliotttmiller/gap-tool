import { LifeOutputs } from "../types"

export type LifeYearlyCoverageChartPoint = {
  age: number
  totalNeed: number
  gliCovered: number
  privateCovered: number
  survivorGap: number
}

export type LifeCoverageChartData = {
  yearlyCoverageData: LifeYearlyCoverageChartPoint[]
  tickAges: Set<number>
  chartTitle: string
  animationKey: string
}

/**
 * Converts deterministic Life module outputs into chart-ready display data.
 * This layer owns visualization labels and derived chart helpers only.
 * It must not change the financial meaning of the calculation outputs.
 */
export function transformLifeCoverageChartData(outputs: LifeOutputs): LifeCoverageChartData {
  const yearlyCoverageData = outputs.yearlyBreakdown ?? []
  const tickAges = new Set(yearlyCoverageData.filter((_, index) => index % 2 === 0).map((point) => point.age))
  const finalAge = yearlyCoverageData.at(-1)?.age

  return {
    yearlyCoverageData,
    tickAges,
    chartTitle: `Household Income to Age ${(finalAge ?? 64) + 1} — Life Insurance Coverage`,
    animationKey: [
      outputs.remainingGap,
      outputs.existingCoverageTotal,
      outputs.coverageOffsetPercentage,
      yearlyCoverageData.length,
    ].join(":"),
  }
}
