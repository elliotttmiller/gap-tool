import { DisabilityOutputs } from "../types"
import { formatCurrency } from "@/lib/utils"

export function getDisabilityNarrative(outputs: DisabilityOutputs): string {
  if (outputs.averageMonthlyGap <= 0) {
    return `This scenario illustrates that current available income and employer/private disability benefits appear sufficient to cover the projected household expenses.`
  }

  const timeframe = outputs.reserveDepletionMonth !== null 
    ? `Without additional coverage, household reserves may be fully depleted in month ${outputs.reserveDepletionMonth}.`
    : `While reserves may last indefinitely, the ongoing shortfall will require asset liquidation or prolonged lifestyle changes.`

  return `This scenario illustrates an average monthly household income gap of ${formatCurrency(outputs.averageMonthlyGap)} if earned income is disrupted due to illness or injury. ${timeframe} This result depends on the entered income, expenses, savings, benefits, and duration assumptions.`
}
