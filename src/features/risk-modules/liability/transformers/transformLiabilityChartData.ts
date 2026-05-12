import { LiabilityOutputs } from "../types"

export type LiabilityProtectionStackPoint = {
  name: string
  Coverage: number
  ExposureGap: number
}

export type LiabilityChartData = {
  protectionStackData: LiabilityProtectionStackPoint[]
  animationKey: string
}

/**
 * Converts deterministic Liability outputs into chart-ready display data.
 * The primary chart now follows the advisor-reference lawsuit model: total
 * household liability risk offset by household auto liability coverage.
 */
export function transformLiabilityChartData(outputs: LiabilityOutputs): LiabilityChartData {
  return {
    protectionStackData: [
      {
        name: "Household Liability Risk",
        Coverage: outputs.householdAutoLiabilityCoverage,
        ExposureGap: outputs.householdLiabilityGap,
      },
    ],
    animationKey: [
      outputs.householdAutoLiabilityCoverage,
      outputs.householdLiabilityGap,
      outputs.totalHouseholdLiabilityRisk,
    ].join(":"),
  }
}
