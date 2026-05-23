import { LiabilityOutputs } from "../types"

export type LiabilityProtectionStackPoint = {
  name: string
  AutoCoverage: number
  UmbrellaCoverage: number
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
  const preUmbrellaGap = Math.max(outputs.totalHouseholdLiabilityRisk - outputs.householdAutoLiabilityCoverage, 0)
  return {
    protectionStackData: [
      {
        name: "Current (Auto Only)",
        AutoCoverage: outputs.householdAutoLiabilityCoverage,
        UmbrellaCoverage: 0,
        ExposureGap: preUmbrellaGap,
      },
      {
        name: "With Umbrella",
        AutoCoverage: outputs.householdAutoLiabilityCoverage,
        UmbrellaCoverage: outputs.householdUmbrellaCoverage,
        ExposureGap: outputs.householdLiabilityGap,
      },
    ],
    animationKey: [
      outputs.householdAutoLiabilityCoverage,
      outputs.householdUmbrellaCoverage,
      outputs.householdLiabilityGap,
      outputs.totalHouseholdLiabilityRisk,
    ].join(":"),
  }
}
