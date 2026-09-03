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
  semantic: {
    supported: "#44b649",
    supportedGlow: "rgba(68,182,73,0.65)",
    gap: "#f15a29",
    gapGlow: "rgba(241,90,41,0.65)",
    primaryCoverage: "#1b75bc",
    primaryCoverageGlow: "rgba(27,117,188,0.72)",
    secondaryCoverage: "#1db8b9",
    secondaryCoverageGlow: "rgba(29,184,185,0.72)",
  },
  grid: {
    stroke: "rgba(100,116,139,0.12)",
    strokeDasharray: "3 5",
  },
  cursor: {
    fill: "rgba(24,138,137,0.08)",
  },
  axis: {
    tickFill: "#64748b",
    lineStroke: "#64748b",
    lineOpacity: 0.52,
    xTickFontSize: 10,
    yTickFontSize: 10,
    xTickFontWeight: 600,
    xTickMargin: 9,
    yTickMargin: 7,
    xPadding: 10,
    yWidth: 50,
    minTickGap: 8,
  },
  projection: {
    responsiveDebounce: 100,
    margin: { top: 10, right: 18, left: 8, bottom: 10 },
    barGap: 0,
  },
  interaction: {
    dimOpacity: 0.28,
    transition: "opacity 180ms ease, filter 180ms ease",
    selectedGlowRadius: 5,
  },
  animation: {
    duration: 1200,
    easing: "ease-out",
    staggerMs: 100,
  },
} as const

export type ProjectionBarRadius = [number, number, number, number]

export function topStackRadius(isTopSegment: boolean): ProjectionBarRadius {
  return isTopSegment
    ? [financialBarChartTheme.geometry.stackRadius, financialBarChartTheme.geometry.stackRadius, 0, 0]
    : [0, 0, 0, 0]
}

/**
 * Recharts renders Cell bars through Rectangle, which supports a four-corner
 * radius tuple, but Cell's React SVG prop type only exposes a scalar radius.
 * Keep that upstream type mismatch isolated here instead of casting at every
 * projection cell call site.
 */
export function topStackCellRadius(isTopSegment: boolean): number {
  return topStackRadius(isTopSegment) as unknown as number
}

export function formatProjectionCurrencyTick(value: number): string {
  return `$${Math.round(Number(value) / 1000)}k`
}

/**
 * Produces stable age ticks with a human-readable 1/2/5/10 step. Keeping this
 * algorithm shared prevents Life, Disability, Presentation, and PDF from
 * choosing different tick geometry for the same projection horizon.
 */
export function buildProjectionAgeTicks(data: { age: number }[], targetTickCount = 10): number[] {
  if (data.length === 0) return []

  const firstAge = data[0].age
  const lastAge = data[data.length - 1].age
  if (firstAge === lastAge) return [firstAge]

  const span = lastAge - firstAge
  const rawStep = Math.max(1, Math.ceil(span / Math.max(1, targetTickCount - 1)))
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const normalized = rawStep / magnitude
  const snappedBase = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  const step = snappedBase * magnitude

  const ticks = [firstAge]
  for (let age = firstAge + step; age < lastAge; age += step) ticks.push(age)
  ticks.push(lastAge)
  return ticks
}

export function projectionCellVisualState(selectedAge: number | null, age: number, glowColor: string) {
  const isSelected = selectedAge === age
  const isDimmed = selectedAge !== null && !isSelected

  return {
    opacity: isDimmed ? financialBarChartTheme.interaction.dimOpacity : 1,
    style: {
      transition: financialBarChartTheme.interaction.transition,
      filter: isSelected
        ? `drop-shadow(0 0 ${financialBarChartTheme.interaction.selectedGlowRadius}px ${glowColor})`
        : "none",
    },
  }
}

export const financialProjectionXAxisProps = {
  interval: 0 as const,
  minTickGap: financialBarChartTheme.axis.minTickGap,
  tickMargin: financialBarChartTheme.axis.xTickMargin,
  padding: {
    left: financialBarChartTheme.axis.xPadding,
    right: financialBarChartTheme.axis.xPadding,
  },
  tick: {
    fill: financialBarChartTheme.axis.tickFill,
    fontSize: financialBarChartTheme.axis.xTickFontSize,
    fontWeight: financialBarChartTheme.axis.xTickFontWeight,
  },
  axisLine: {
    stroke: financialBarChartTheme.axis.lineStroke,
    strokeOpacity: financialBarChartTheme.axis.lineOpacity,
  },
  tickLine: {
    stroke: financialBarChartTheme.axis.lineStroke,
    strokeOpacity: financialBarChartTheme.axis.lineOpacity,
  },
} as const

export const financialProjectionYAxisProps = {
  tickFormatter: formatProjectionCurrencyTick,
  tick: {
    fill: financialBarChartTheme.axis.tickFill,
    fontSize: financialBarChartTheme.axis.yTickFontSize,
  },
  axisLine: {
    stroke: financialBarChartTheme.axis.lineStroke,
    strokeOpacity: financialBarChartTheme.axis.lineOpacity,
  },
  tickLine: {
    stroke: financialBarChartTheme.axis.lineStroke,
    strokeOpacity: financialBarChartTheme.axis.lineOpacity,
  },
  tickMargin: financialBarChartTheme.axis.yTickMargin,
  width: financialBarChartTheme.axis.yWidth,
} as const
