import { DisabilityOutputs, DisabilityTimelinePoint } from "../types"

export type DisabilityGapStackPoint = {
  name: string
  Expenses: number
  Available: number
  Gap: number
}

export type DisabilityReserveTimelinePoint = {
  Month: string
  ReserveBalance: number
  Shortfall: number
}

export type DisabilityChartData = {
  maxGapPoint: Pick<DisabilityTimelinePoint, "availableIncome" | "monthlyGap" | "monthlyExpenses">
  gapStackData: DisabilityGapStackPoint[]
  reserveTimelineData: DisabilityReserveTimelinePoint[]
  animationKey: string
}

/**
 * Converts deterministic Disability outputs into chart-ready view data.
 * The transformer selects the peak-gap month for the breakdown chart and
 * maps the monthly timeline into reserve/shortfall chart points. It does not
 * perform financial calculation or alter module outputs.
 */
export function transformDisabilityChartData(outputs: DisabilityOutputs): DisabilityChartData {
  const fallback = { availableIncome: 0, monthlyGap: 0, monthlyExpenses: 0 }

  const maxGapPoint = outputs.timeline.reduce(
    (max, point) => (point.monthlyGap > max.monthlyGap ? point : max),
    outputs.timeline[0] ?? fallback,
  )

  const monthlyAvailableIncome = maxGapPoint?.availableIncome ?? 0
  const monthlyIncomeGap = maxGapPoint?.monthlyGap ?? 0

  return {
    maxGapPoint,
    gapStackData: [
      { name: "Total Expense Need", Expenses: maxGapPoint?.monthlyExpenses ?? 0, Available: 0, Gap: 0 },
      {
        name: "Available vs Gap",
        Expenses: 0,
        Available: monthlyAvailableIncome,
        Gap: monthlyIncomeGap > 0 ? monthlyIncomeGap : 0,
      },
    ],
    reserveTimelineData:
      outputs.timeline?.map((point) => ({
        Month: `M${point.month}`,
        ReserveBalance: point.endingReserve,
        Shortfall: point.monthlyGap > 0 ? point.monthlyGap : 0,
      })) ?? [],
    animationKey: [
      outputs.averageMonthlyGap,
      outputs.totalUncoveredGap,
      outputs.totalBenefitsReceived,
      outputs.timeline.length,
    ].join(":"),
  }
}
