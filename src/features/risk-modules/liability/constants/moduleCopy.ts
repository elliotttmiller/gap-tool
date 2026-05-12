import { LiabilityOutputs } from "../types"
import { formatCurrency, formatPercent } from "@/lib/utils"

export function getLiabilityNarrative(outputs: LiabilityOutputs): string {
  if (outputs.exposureGap <= 0) {
    return `This scenario illustrates that current base liability and umbrella limits appear sufficient to cover the estimated lawsuit exposure of ${formatCurrency(outputs.exposureGap + outputs.totalCoverage)} without exposing at-risk personal assets.`
  }

  return `This scenario illustrates a potential liability coverage gap of ${formatCurrency(outputs.exposureGap)}. In the event of a significant lawsuit exceeding primary auto or homeowner limits, unprotected personal assets—including home equity and investments—could be targeted, potentially eroding ${formatPercent(outputs.wealthErosionPercentage)} of the household's liquid and tied net worth.`
}
