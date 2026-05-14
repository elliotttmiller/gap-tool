import { DisabilityOutputs } from "../types"
import { formatCurrency, formatPercent } from "@/lib/utils"

export function getDisabilityNarrative(outputs: DisabilityOutputs): string {
  const coveragePct = Math.round(outputs.averageCoverageRate * 100)
  const gapPct = Math.round((1 - outputs.averageCoverageRate) * 100)

  const ltdMonthly = outputs.ltdNetMonthlyBenefit
  const diMonthly = outputs.privateDiMonthlyBenefit
  const totalMonthly = outputs.totalNetMonthlyBenefit

  if (totalMonthly <= 0) {
    return `No disability coverage has been entered. Without group LTD or individual DI, a disability event would leave 100% of earned income — projected to ${formatCurrency(outputs.projectedIncomeAtRetirement)}/yr at retirement — entirely unprotected. An individual disability insurance policy is designed to replace a portion of lost income and preserve financial stability.`
  }

  const coverageSource =
    ltdMonthly > 0 && diMonthly > 0
      ? `Group LTD (${formatCurrency(ltdMonthly)}/mo net) combined with individual DI (${formatCurrency(diMonthly)}/mo)`
      : ltdMonthly > 0
        ? `Group LTD providing ${formatCurrency(ltdMonthly)}/mo net`
        : `Individual DI providing ${formatCurrency(diMonthly)}/mo`

  if (outputs.totalGap <= 0) {
    return `${coverageSource} covers projected income through retirement — resulting in a ${coveragePct}% lifetime coverage rate against income growing to ${formatCurrency(outputs.projectedIncomeAtRetirement)}/yr. While existing coverage appears sufficient at current income levels, individual DI can provide additional certainty and portability if group benefits change.`
  }

  return `${coverageSource} covers approximately ${coveragePct}% of projected lifetime income, leaving a ${gapPct}% gap totaling ${formatCurrency(outputs.totalGap)} over the projection period. Income is projected to grow to ${formatCurrency(outputs.projectedIncomeAtRetirement)}/yr at retirement, widening the coverage gap over time. An individual disability insurance supplement is designed to bridge this shortfall and protect the client's income replacement target throughout the disability benefit period.`
}
