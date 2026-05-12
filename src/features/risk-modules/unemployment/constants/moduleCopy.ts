import { UnemploymentOutputs } from "../types"
import { formatCurrency } from "@/lib/utils"

export function getUnemploymentNarrative(outputs: UnemploymentOutputs): string {
  if (outputs.reserveDepletionMonth <= 0) {
    return `Based on the entered assumptions, severance, unemployment benefits, and emergency reserves appear sufficient to sustain the household through the projected job search period. Income protection insurance provides an additional layer — ensuring the runway stays intact even if the search runs long.`
  }

  return `Reserves are projected to run dry in month ${outputs.reserveDepletionMonth} — before the household is likely to have returned to full income. The total shortfall over the modeled search period is ${formatCurrency(outputs.totalUncoveredShortfall)}. Closing this gap before a job loss occurs — through reserve building or income protection coverage — is significantly easier than managing it mid-crisis.`
}
