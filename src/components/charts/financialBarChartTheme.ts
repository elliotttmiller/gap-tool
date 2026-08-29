export const financialBarChartTheme = {
  geometry: {
    // Annual projection series use a balanced column-to-gutter ratio so each
    // year remains distinct without reading as a row of thin sticks. Life and
    // Disability both consume these values, including the off-canvas report
    // tree used for browser PDF export, keeping screen and PDF geometry aligned.
    projectionBarSize: 28,
    comparisonBarSize: 88,
    projectionCategoryGap: "10%",
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
