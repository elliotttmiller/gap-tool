import { LifeOutputs } from "../types"
import { formatCurrency } from "@/lib/utils"

export function getLifeInsuranceNarrative(outputs: LifeOutputs): string {
  if (outputs.remainingGap <= 0) {
    return "Based on the assumptions entered, existing Group Life and private coverage appear sufficient to replace lost income, retire outstanding debts, and fund education goals. Review this projection whenever income, coverage, or family circumstances change."
  }

  const coveragePct = Math.round(outputs.coverageOffsetPercentage * 100)

  return `A protection gap of ${formatCurrency(outputs.remainingGap)} remains after applying existing coverage (${formatCurrency(outputs.existingCoverageTotal)} total — ${coveragePct}% of the need). This gap represents the income, debts, and goals that would go unfunded if the client passed away today. Private life insurance is designed to close exactly this shortfall — providing the household with the financial continuity to maintain its lifestyle and meet long-term obligations.`
}
