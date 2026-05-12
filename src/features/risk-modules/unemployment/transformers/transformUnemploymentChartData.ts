import { UnemploymentOutputs } from "../types"

export type UnemploymentReserveGaugeData = {
  fillRatio: number
  minimumPct: number
  fillFromTopPct: number
  fillColor: string
  fillY: number
  fillHeight: number
  minLineY: number
  bucket: {
    x: number
    y: number
    width: number
    height: number
  }
  svg: {
    width: number
    height: number
  }
  monthLabels: Array<{ month: number; y: number }>
  animationKey: string
}

/**
 * Converts Unemployment outputs into reserve-gauge display geometry.
 * This keeps SVG layout math outside the component while preserving the
 * calculation module as the only source of financial truth.
 */
export function transformUnemploymentReserveGaugeData(outputs: UnemploymentOutputs): UnemploymentReserveGaugeData {
  const fillRatio = Math.min(outputs.optimalReserveTarget > 0 ? outputs.currentReserveLevel / outputs.optimalReserveTarget : 0, 1)
  const minimumPct = 50
  const fillFromTopPct = (1 - fillRatio) * 100

  const fillColor =
    outputs.currentReserveLevel < outputs.minimumReserveTarget
      ? "#ef4444"
      : outputs.currentReserveLevel < outputs.optimalReserveTarget * 0.75
      ? "#22c55e"
      : "#16a34a"

  const svgWidth = 480
  const svgHeight = 280
  const bucketX = 40
  const bucketY = 20
  const bucketW = 180
  const bucketH = 220
  const minLineY = bucketY + bucketH * (minimumPct / 100)
  const fillTopY = bucketY + bucketH * (fillFromTopPct / 100)
  const fillHeight = Math.min(bucketH * fillRatio, bucketH - 4)
  const fillY = Math.max(fillTopY, bucketY + 2)

  return {
    fillRatio,
    minimumPct,
    fillFromTopPct,
    fillColor,
    fillY,
    fillHeight,
    minLineY,
    bucket: {
      x: bucketX,
      y: bucketY,
      width: bucketW,
      height: bucketH,
    },
    svg: {
      width: svgWidth,
      height: svgHeight,
    },
    monthLabels: [0, 1, 2, 3, 4, 5, 6].map((month) => ({
      month,
      y: bucketY + bucketH - (month / 6) * bucketH,
    })),
    animationKey: [
      outputs.currentReserveLevel,
      outputs.optimalReserveTarget,
      outputs.minimumReserveTarget,
      outputs.reserveDepletionMonth,
    ].join(":"),
  }
}
