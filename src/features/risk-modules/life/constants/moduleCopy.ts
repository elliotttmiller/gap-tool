import { LifeOutputs } from "../types"
import { formatCurrency } from "@/lib/utils"

export function getLifeInsuranceNarrative(outputs: LifeOutputs): string {
  if (outputs.remainingGap <= 0) {
    return "This scenario illustrates that current coverage appears sufficient to replace lost income and cover immediate final expenses or debt obligations based on the assumptions entered."
  }

  return `This scenario illustrates a potential protection gap of ${formatCurrency(outputs.remainingGap)} after accounting for existing group and private coverage. In the event of a premature death, this shortfall could impact the household's ability to maintain its lifestyle, fund education goals, and retire debt. This is an illustrative planning estimate based on the assumptions entered.`
}
