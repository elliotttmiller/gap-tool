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
 * This transformer owns visual grouping only and does not alter exposure logic.
 */
export function transformLiabilityChartData(outputs: LiabilityOutputs): LiabilityChartData {
  return {
    protectionStackData: [
      {
        name: "Total Asset Exposure",
        Coverage: outputs.totalCoverage,
        ExposureGap: outputs.exposureGap,
      },
    ],
    animationKey: [outputs.totalCoverage, outputs.exposureGap, outputs.totalAtRiskAssets].join(":"),
  }
}
