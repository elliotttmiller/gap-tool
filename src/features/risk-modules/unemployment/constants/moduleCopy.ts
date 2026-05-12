import { UnemploymentOutputs } from "../types"
import { formatCurrency } from "@/lib/utils"

export function getUnemploymentNarrative(outputs: UnemploymentOutputs): string {
  if (outputs.reserveDepletionMonth <= 0) {
    return `In this scenario, severance, unemployment benefits, and existing emergency reserves appear sufficient to cover the household's monthly burn rate during the estimated job search period without depleting savings.`
  }

  return `This scenario illustrates the liquidity risk during a prolonged job loss. Based on the projected monthly burn rate and available offsets (severance, unemployment), emergency reserves are estimated to fully deplete in month ${outputs.reserveDepletionMonth}. The total projected shortfall over the assumed search period is ${formatCurrency(outputs.totalUncoveredShortfall)}.`
}
