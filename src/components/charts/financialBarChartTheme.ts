export const financialBarChartTheme = {
  geometry: {
    // Annual projection series use a dense, balanced column-to-gutter ratio so
    // the projection reads as one continuous financial story rather than a row
    // of isolated sticks. Life and Disability both consume these values,
    // including the off-canvas report tree used for browser PDF export.
    projectionBarSize: 30,
    comparisonBarSize: 88,
    projectionCategoryGap: "8%",
    comparisonCategoryGap: "50%",
    // Keep the exterior silhouette subtly rounded. A small radius preserves a
    // modern finish without making the top stack segment look like a detached cap.
    stackRadius: 2,
  },
  // Semantic financial colors are shared across modules so "covered/supported"
  // and "gap/unprotected" always carry the same visual meaning. These are the
  // established Life Income Gap colors and are the authoritative chart palette.
  semantic: {
    supported: "#10b981",
    supportedGlow: "rgba(16,185,129,0.65)",
    gap: "#ef4444",
    gapGlow: "rgba(239,68,68,0.65)",
    primaryCoverage: "#1b75bc",
    secondaryCoverage: "#1db8b9",
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
