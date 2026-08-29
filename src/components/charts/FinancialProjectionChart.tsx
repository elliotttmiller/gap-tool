import type { ReactNode } from "react"
import {
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import {
  financialBarChartTheme,
  financialProjectionXAxisProps,
  financialProjectionYAxisProps,
} from "./financialBarChartTheme"

interface FinancialProjectionChartProps {
  data: Record<string, any>[]
  ticks: number[]
  children: ReactNode
  onSelectAge?: (age: number) => void
}

/**
 * Authoritative Recharts frame for annual financial projections.
 *
 * Life and Disability provide only their series/tooltip children. Plot margins,
 * axis geometry, grid, responsiveness, click selection, and bar spacing live
 * here so builder, presentation, and the off-screen PDF tree cannot drift.
 */
export function FinancialProjectionChart({
  data,
  ticks,
  children,
  onSelectAge,
}: FinancialProjectionChartProps) {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      debounce={financialBarChartTheme.projection.responsiveDebounce}
    >
      <BarChart
        data={data}
        margin={financialBarChartTheme.projection.margin}
        barGap={financialBarChartTheme.projection.barGap}
        barCategoryGap={financialBarChartTheme.geometry.projectionCategoryGap}
        onClick={(state: any) => {
          if (!onSelectAge || !state?.activePayload?.length) return
          const age = Number(state.activeLabel)
          if (Number.isFinite(age)) onSelectAge(age)
        }}
        style={onSelectAge ? { cursor: "pointer" } : undefined}
      >
        <CartesianGrid
          stroke={financialBarChartTheme.grid.stroke}
          strokeDasharray={financialBarChartTheme.grid.strokeDasharray}
          vertical={false}
        />
        <XAxis dataKey="age" ticks={ticks} {...financialProjectionXAxisProps} />
        <YAxis {...financialProjectionYAxisProps} />
        {children}
      </BarChart>
    </ResponsiveContainer>
  )
}
