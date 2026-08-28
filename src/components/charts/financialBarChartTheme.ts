export const financialBarChartTheme = {
  geometry: {
    projectionBarSize: 24,
    comparisonBarSize: 88,
    projectionCategoryGap: "18%",
    comparisonCategoryGap: "50%",
    stackRadius: 4,
  },
  grid: {
    stroke: "rgba(100,116,139,0.12)",
    strokeDasharray: "3 5",
  },
  cursor: {
    fill: "rgba(255,255,255,0.025)",
  },
  axis: {
    tickFill: "#64748b",
    lineStroke: "#64748b",
    lineOpacity: 0.35,
  },
} as const

export function topStackRadius(isTopSegment: boolean): [number, number, number, number] {
  return isTopSegment
    ? [financialBarChartTheme.geometry.stackRadius, financialBarChartTheme.geometry.stackRadius, 0, 0]
    : [0, 0, 0, 0]
}
