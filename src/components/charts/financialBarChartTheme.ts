export const financialBarChartTheme = {
  geometry: {
    // Annual projection series are intentionally denser than comparison charts.
    // Keep the projection bars slightly narrower than their category bands so
    // the first/last columns do not visually crowd the chart axes. Life and
    // Disability both consume these values, including the off-canvas
    // pre-rendered report tree used for browser PDF export, so screen and PDF
    // geometry remain identical.
    projectionBarSize: 24,
    comparisonBarSize: 88,
    projectionCategoryGap: "14%",
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
