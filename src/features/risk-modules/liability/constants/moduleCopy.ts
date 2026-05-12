import { LiabilityOutputs } from "../types"
import { formatCurrency, formatPercent } from "@/lib/utils"

export function getLiabilityNarrative(outputs: LiabilityOutputs): string {
  if (outputs.exposureGap <= 0) {
    return `Based on the entered assumptions, current base liability and umbrella limits appear sufficient to cover the estimated lawsuit exposure without touching personal assets. An umbrella policy keeps the protection stack current as assets grow — regular review ensures coverage keeps pace with net worth.`
  }

  return `A liability coverage gap of ${formatCurrency(outputs.exposureGap)} remains after primary auto and homeowner limits are exhausted. In the event of a major lawsuit, ${formatCurrency(outputs.erodedAssets)} of personal assets — ${formatPercent(outputs.wealthErosionPercentage)} of the household's at-risk net worth — could be directly targeted by a judgment. An umbrella policy is the most cost-effective way to extend the coverage stack and keep personal assets protected.`
}
