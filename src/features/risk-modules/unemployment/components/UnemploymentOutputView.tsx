import { UnemploymentOutputs } from "../types"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { getUnemploymentNarrative } from "../constants/moduleCopy"
import { AnimatedSection } from "@/components/ui/animated-section"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface UnemploymentOutputViewProps {
  outputs: UnemploymentOutputs
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function formatMonths(value: number): string {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value)} mo`
}

function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: string
  tone?: "neutral" | "good" | "warn" | "bad"
}) {
  const color = {
    neutral: "text-slate-50",
    good: "text-emerald-300",
    warn: "text-amber-300",
    bad: "text-red-300",
  }[tone]

  return (
    <Card className="h-full border-slate-800/90 bg-slate-950/70">
      <CardContent className="p-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
        <div className={`mt-2 text-2xl font-bold tracking-tight ${color}`}>{value}</div>
      </CardContent>
    </Card>
  )
}

function TimelineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload

  return (
    <div className="min-w-52 rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs shadow-xl">
      <p className="mb-2 font-semibold text-slate-100">Month {label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Reserve Balance</span>
          <span className="font-mono text-slate-100">{formatCurrency(point.reserveBalance)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Available Income</span>
          <span className="font-mono text-slate-100">{formatCurrency(point.availableIncome)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-red-300">Shortfall</span>
          <span className="font-mono text-slate-100">{formatCurrency(point.shortfall)}</span>
        </div>
      </div>
    </div>
  )
}

function ReserveRangePanel({ outputs }: { outputs: UnemploymentOutputs }) {
  const reserveMonths = outputs.reserveMonthsCurrent
  const reservePct = Math.min(Math.max(reserveMonths / 6, 0), 1) * 100
  const status =
    reserveMonths >= 6
      ? { label: "Optimal", color: "text-emerald-300", bar: "bg-emerald-400" }
      : reserveMonths >= 3
        ? { label: "In Range", color: "text-cyan-300", bar: "bg-cyan-400" }
        : { label: "Below Minimum", color: "text-red-300", bar: "bg-red-400" }

  return (
    <Card className="h-full border-slate-800/90 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.96))]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Reserve Position</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-50">{formatMonths(reserveMonths)}</span>
              <span className={`text-sm font-semibold uppercase tracking-wider ${status.color}`}>{status.label}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Current Reserve</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{formatCompactCurrency(outputs.currentReserveLevel)}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="relative h-4 overflow-hidden rounded-full bg-slate-800">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-red-500/20" />
            <div className="absolute inset-y-0 left-1/2 w-1/2 bg-emerald-500/20" />
            <div
              className={`relative h-full rounded-full ${status.bar} shadow-[0_0_18px_rgba(34,211,238,0.28)] transition-[width] duration-700`}
              style={{ width: `${reservePct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <span>0 mo</span>
            <span className="text-center">3 mo minimum</span>
            <span className="text-right">6 mo optimal</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-amber-900/40 bg-amber-950/10 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">Minimum Target</p>
            <p className="mt-1 text-xl font-bold text-slate-50">{formatCompactCurrency(outputs.minimumReserveTarget)}</p>
          </div>
          <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/10 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Optimal Target</p>
            <p className="mt-1 text-xl font-bold text-slate-50">{formatCompactCurrency(outputs.optimalReserveTarget)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ReserveTimelineChart({ outputs }: { outputs: UnemploymentOutputs }) {
  const data = outputs.timeline.map((point) => ({
    ...point,
    minimumTarget: outputs.minimumReserveTarget,
  }))

  return (
    <Card className="h-full border-slate-800/90 bg-slate-950/70">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Reserve Runway</p>
            <p className="mt-1 text-xs text-slate-500">Projected balance through the job-search period.</p>
          </div>
          <p className="text-xs font-semibold text-slate-400">
            {outputs.reserveDepletionMonth < 0 ? "No depletion" : `Depletes month ${outputs.reserveDepletionMonth}`}
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="reserveBalanceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.42} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                width={56}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}
              />
              <Tooltip content={<TimelineTooltip />} cursor={{ stroke: "#475569", strokeDasharray: "4 4" }} />
              <ReferenceLine y={outputs.minimumReserveTarget} stroke="#f59e0b" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="reserveBalance"
                stroke="#22d3ee"
                strokeWidth={3}
                fill="url(#reserveBalanceFill)"
                dot={false}
                activeDot={{ r: 4, stroke: "#a5f3fc", strokeWidth: 2, fill: "#0891b2" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function UnemploymentOutputView({ outputs }: UnemploymentOutputViewProps) {
  const reserveTone = outputs.reserveMonthsCurrent >= 3 ? "good" : "bad"
  const depletionTone = outputs.reserveDepletionMonth < 0 ? "good" : "warn"
  const shortfallTone = outputs.totalUncoveredShortfall > 0 ? "bad" : "good"

  return (
    <div className="flex h-full w-full flex-col space-y-4">
      <AnimatedSection delay={0}>
        <div className="grid gap-3 xl:grid-cols-4">
          <MetricCard label="Current Reserve" value={formatCompactCurrency(outputs.currentReserveLevel)} tone={reserveTone} />
          <MetricCard label="Reserve Months" value={formatMonths(outputs.reserveMonthsCurrent)} tone={reserveTone} />
          <MetricCard label="Cash Depletion" value={outputs.reserveDepletionMonth < 0 ? "Never" : `Month ${outputs.reserveDepletionMonth}`} tone={depletionTone} />
          <MetricCard label="Total Shortfall" value={formatCompactCurrency(outputs.totalUncoveredShortfall)} tone={shortfallTone} />
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.12}>
        <div className="grid gap-4 2xl:grid-cols-[0.95fr_1.05fr]">
          <ReserveRangePanel outputs={outputs} />
          <ReserveTimelineChart outputs={outputs} />
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.24}>
        <div className="grid gap-3 xl:grid-cols-[repeat(4,minmax(0,1fr))]">
          <MetricCard label="Monthly Income" value={formatCompactCurrency(outputs.monthlyIncome)} />
          <MetricCard label="Monthly Burn Rate" value={formatCompactCurrency(outputs.monthlyBurnRate)} />
          <MetricCard label="Minimum Reserve" value={formatCompactCurrency(outputs.minimumReserveTarget)} />
          <MetricCard label="Optimal Reserve" value={formatCompactCurrency(outputs.optimalReserveTarget)} />
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.32}>
        <Card className="border border-slate-800/90 bg-[#090E1A]">
          <CardContent className="p-5">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-400">Advisor Narrative</h4>
            <p className="text-sm leading-relaxed text-gray-300">{getUnemploymentNarrative(outputs)}</p>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  )
}
