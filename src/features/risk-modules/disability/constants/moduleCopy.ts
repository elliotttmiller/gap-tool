import { DisabilityOutputs } from "../types"
import { formatCurrency, formatPercent } from "@/lib/utils"

export function getDisabilityNarrative(outputs: DisabilityOutputs): string {
  const coveragePct = Math.round(outputs.averageCoverageRate * 100)
  const gapPct = Math.max(0, Math.round((1 - outputs.averageCoverageRate) * 100))

  const ltdMonthly = outputs.ltdNetMonthlyBenefit
  const diMonthly = outputs.privateDiMonthlyBenefit
  const totalMonthly = outputs.totalNetMonthlyBenefit
  const currentMonthlyGap = Math.max(0, outputs.incomeLossNet)
  const currentMonthlyGapSentence = currentMonthlyGap > 0
    ? ` Closing the current-age monthly net gap would require approximately ${formatCurrency(currentMonthlyGap)}/mo of additional modeled monthly benefit.`
    : " The current-age monthly net income gap is closed under the assumptions entered."

  if (totalMonthly <= 0) {
    return `No disability coverage has been entered. The modeled disability event would show projected income exposure through retirement, with income projected to ${formatCurrency(outputs.projectedIncomeAtRetirement)}/yr at the projection end.${currentMonthlyGapSentence} This is an illustrative gap analysis, not a formal recommendation.`
  }

  const coverageSource =
    ltdMonthly > 0 && diMonthly > 0
      ? `Group LTD (${formatCurrency(ltdMonthly)}/mo net) combined with individual DI (${formatCurrency(diMonthly)}/mo)`
      : ltdMonthly > 0
        ? `Group LTD providing ${formatCurrency(ltdMonthly)}/mo net`
        : `Individual DI providing ${formatCurrency(diMonthly)}/mo`

  if (outputs.totalGap <= 0) {
    return `${coverageSource} covers projected net income through retirement — resulting in a ${formatPercent(outputs.averageCoverageRate)} lifetime coverage rate against income growing to ${formatCurrency(outputs.projectedIncomeAtRetirement)}/yr.${currentMonthlyGapSentence} This is an illustrative gap analysis, not a formal recommendation.`
  }

  return `${coverageSource} covers approximately ${coveragePct}% of projected lifetime net income, leaving a ${gapPct}% gap totaling ${formatCurrency(outputs.totalGap)} over the projection period. Income is projected to grow to ${formatCurrency(outputs.projectedIncomeAtRetirement)}/yr at the projection end.${currentMonthlyGapSentence} This is an illustrative gap analysis, not a formal recommendation.`
}
