import { DisabilityOutputs } from "../types"
import { formatCurrency } from "@/lib/utils"

export function getDisabilityNarrative(outputs: DisabilityOutputs): string {
  const replacementPct = Math.round(outputs.peakIncomeReplacementRate * 100)
  const gapPct = Math.round(outputs.incomeGapRate * 100)

  if (outputs.averageMonthlyGap <= 0) {
    return `Existing employer and private disability benefits replace approximately ${replacementPct}% of pre-disability income — appearing sufficient to cover projected household expenses under the entered assumptions. Private DI can provide additional certainty, particularly if employer benefits are subject to change or elimination.`
  }

  const depletionNote = outputs.reserveDepletionMonth !== null
    ? `Emergency reserves are projected to run out by month ${outputs.reserveDepletionMonth}, after which the gap must be met through asset liquidation or lifestyle cuts.`
    : `Without additional coverage, the ongoing shortfall requires sustained asset liquidation or lifestyle adjustment throughout the disability period.`

  return `Existing benefits replace only ${replacementPct}% of pre-disability income at peak — leaving a ${gapPct}% income gap of approximately ${formatCurrency(outputs.averageMonthlyGap)}/month from the point of disability. ${depletionNote} Private disability insurance is designed to bridge this gap, protecting the household's income and lifestyle when employer benefits alone fall short.`
}
