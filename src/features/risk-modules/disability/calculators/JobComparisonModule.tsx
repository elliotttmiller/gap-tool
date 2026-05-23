import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { DisabilityInputs } from "../types"

interface JobComparisonModuleProps {
  inputs?: DisabilityInputs
}

interface JobAState {
  salary: number
  groupPct: number
  groupCap: string
  hasIdi: boolean
  monthlyPremium: number
  idiBenefit: number
}

interface JobBState {
  salary: number
  groupPct: number
  groupCap: string
  hasIdi: boolean
  monthlyPremium: number
  idiBenefit: number
}

function getInitialJobs(inputs?: DisabilityInputs): { jobA: JobAState; jobB: JobBState } {
  const salary = inputs?.annualEarnedIncome ?? 100000
  const groupPct = inputs?.ltdCoveragePercent ? Math.round(inputs.ltdCoveragePercent * 100) : 60
  const groupCap = (inputs?.ltdMonthlyCap ?? 0) > 0 ? String(inputs?.ltdMonthlyCap) : ""
  const idiBenefit = inputs?.privateDiBenefitMonthly ?? 0
  const monthlyPremium = inputs?.privateDiMonthlyPremium ?? 0
  return {
    jobA: { salary, groupPct, groupCap, hasIdi: false, monthlyPremium: 0, idiBenefit: 0 },
    jobB: { salary, groupPct, groupCap, hasIdi: idiBenefit > 0 || monthlyPremium > 0, monthlyPremium, idiBenefit },
  }
}

function calcGroupLTDAnnual(salary: number, groupPct: number, groupCap: number): number {
  const uncapped = salary * (groupPct / 100)
  return groupCap > 0 ? Math.min(uncapped, groupCap * 12) : uncapped
}

function parseWholeNumberInput(value: string): number {
  return Number(value) || 0
}

function NumberField({
  label,
  value,
  step = 1000,
  min = 0,
  prefix,
  suffix,
  showZeroAsEmpty = false,
  onChange,
}: {
  label: string
  value: number
  step?: number
  min?: number
  prefix?: string
  suffix?: string
  showZeroAsEmpty?: boolean
  onChange: (v: number) => void
}) {
  const displayValue = showZeroAsEmpty && value === 0 ? "" : value

  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-gray-400">{label}</span>
      <div className="relative flex items-center">
        {prefix && (
          <span className="pointer-events-none absolute left-2.5 text-xs text-gray-500">{prefix}</span>
        )}
        <input
          type="number"
          value={displayValue}
          min={min}
          step={step}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={`h-9 w-full rounded-md border border-gray-700 bg-gray-950 text-sm text-gray-100 outline-none transition focus:border-brand-600 ${prefix ? "pl-6 pr-2.5" : suffix ? "pl-2.5 pr-6" : "px-2.5"}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2.5 text-xs text-gray-500">{suffix}</span>
        )}
      </div>
    </label>
  )
}

function GroupCapField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-gray-400">{label}</span>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-2.5 text-xs text-gray-500">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const next = e.target.value.replace(/[^\d]/g, "")
            onChange(next)
          }}
          className="h-9 w-full rounded-md border border-gray-700 bg-gray-950 pl-6 pr-2.5 text-sm text-gray-100 outline-none transition focus:border-brand-600"
        />
      </div>
    </label>
  )
}

function GapTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const stackedTotal = payload.reduce((sum: number, p: any) => sum + (p.value ?? 0), 0)
  const netTotalBar = payload[0]?.payload?.totalBar ?? stackedTotal
  return (
    <div className="min-w-52 rounded-xl border border-gray-700 bg-gray-950/95 p-3 text-xs shadow-2xl backdrop-blur">
      <p className="mb-2 font-semibold text-gray-100">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-mono text-gray-100">{formatCurrency(entry.value)}/yr</span>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-gray-800 pt-1.5">
          <span className="text-gray-400">Total bar</span>
          <span className="font-mono text-gray-100">{formatCurrency(netTotalBar)}/yr</span>
        </div>
      </div>
    </div>
  )
}

function renderAdaptiveSegmentLabel(props: any) {
  const { x = 0, y = 0, width = 0, height = 0, value } = props ?? {}
  if (!value || Number(value) <= 0) return null

  const cx = Number(x) + Number(width) / 2
  const h = Number(height)
  const canFitInside = h >= 14

  if (canFitInside) {
    return (
      <text
        x={cx}
        y={Number(y) + h / 2 + 4}
        textAnchor="middle"
        fill="#ffffff"
        fontSize={11}
        fontWeight={600}
      >
        {formatCurrency(Number(value))}
      </text>
    )
  }

  return (
    <g>
      <line
        x1={cx}
        y1={Number(y)}
        x2={cx}
        y2={Number(y) - 6}
        stroke="#94a3b8"
        strokeWidth={1}
      />
      <text
        x={cx}
        y={Number(y) - 8}
        textAnchor="middle"
        fill="#ffffff"
        fontSize={10}
        fontWeight={600}
      >
        {formatCurrency(Number(value))}
      </text>
    </g>
  )
}

function MetricCard({
  label,
  value,
  sub,
  accent = "default",
}: {
  label: string
  value: string
  sub?: string
  accent?: "green" | "red" | "cyan" | "default"
}) {
  const valClass =
    accent === "green" ? "text-emerald-300"
    : accent === "red" ? "text-[#ef4444]"
    : accent === "cyan" ? "text-cyan-300"
    : "text-gray-100"
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${valClass}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-gray-500">{sub}</p>}
    </div>
  )
}

export function JobComparisonModule({ inputs }: JobComparisonModuleProps) {
  const initial = useMemo(() => getInitialJobs(inputs), [inputs])
  const [jobA, setJobA] = useState<JobAState>(initial.jobA)
  const [jobB, setJobB] = useState<JobBState>(initial.jobB)

  // ── Job A ──────────────────────────────────────────────────────────────────
  const incomeBase_A = Math.max(jobA.salary, 0)
  const groupLTD_A = calcGroupLTDAnnual(incomeBase_A, jobA.groupPct, parseWholeNumberInput(jobA.groupCap))
  const annualIDI_A = jobA.hasIdi ? Math.max(jobA.idiBenefit, 0) * 12 : 0
  const totalBar_A = Math.round(incomeBase_A)
  const groupCovered_A_raw = Math.min(groupLTD_A, totalBar_A)
  const idiCovered_A_raw = Math.min(annualIDI_A, Math.max(totalBar_A - groupCovered_A_raw, 0))
  const incomeGap_A_raw = Math.max(totalBar_A - groupCovered_A_raw - idiCovered_A_raw, 0)
  const groupCovered_A = Math.round(groupCovered_A_raw)
  const idiCovered_A = Math.round(idiCovered_A_raw)
  const incomeGap_A = Math.round(incomeGap_A_raw)

  // ── Job B ──────────────────────────────────────────────────────────────────
  const incomeBase_B = Math.max(jobB.salary, 0)
  const annualPremium_B = jobB.hasIdi ? Math.max(jobB.monthlyPremium, 0) * 12 : 0
  const annualIDI = jobB.hasIdi ? Math.max(jobB.idiBenefit, 0) * 12 : 0
  const groupLTD_B = calcGroupLTDAnnual(incomeBase_B, jobB.groupPct, parseWholeNumberInput(jobB.groupCap))
  const totalBar_B = Math.max(totalBar_A - annualPremium_B, 0)
  const groupCovered_B_raw = Math.min(groupLTD_B, totalBar_B)
  const idiCapacityAfterPremium = Math.max(totalBar_B - groupCovered_B_raw - annualPremium_B, 0)
  const idiCovered_B_raw = Math.min(annualIDI, idiCapacityAfterPremium)
  const incomeGap_B_raw = Math.max(totalBar_B - groupCovered_B_raw - idiCovered_B_raw, 0)
  const groupCovered_B = Math.round(groupCovered_B_raw)
  const idiCovered_B = Math.round(idiCovered_B_raw)
  const incomeGap_B = Math.round(incomeGap_B_raw)

  const chartData = [
    {
      name: "Job A",
      "Group LTD": groupCovered_A,
      "IDI Benefit": idiCovered_A,
      "Income Gap": incomeGap_A,
      totalBar: totalBar_A,
    },
    {
      name: "Job B",
      "Group LTD": groupCovered_B,
      "IDI Benefit": idiCovered_B,
      "Income Gap": incomeGap_B,
      totalBar: totalBar_B,
    },
  ]
  return (
    <div className="module-output-container">
      <div className="space-y-4">

        {/* ── Input cards ────────────────────────────────────────────────────── */}
        <div className="grid items-start gap-4 xl:grid-cols-2">
          <Card className="border-t-4 border-gray-800 border-t-emerald-500 bg-gray-900/25">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-emerald-400">Job A</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">Has IDI policy?</span>
                  <div className="flex gap-1">
                    {(["Yes", "No"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setJobA({ ...jobA, hasIdi: opt === "Yes" })}
                        className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                          (opt === "Yes") === jobA.hasIdi
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NumberField label="Annual income" value={jobA.salary} step={5000} prefix="$" onChange={(salary) => setJobA({ ...jobA, salary })} />
                <NumberField label="Group LTD (% of income)" value={jobA.groupPct} step={1} suffix="%" onChange={(groupPct) => setJobA({ ...jobA, groupPct })} />
                <GroupCapField label="Group LTD cap ($/mo)" value={jobA.groupCap} onChange={(groupCap) => setJobA({ ...jobA, groupCap })} />
              </div>
              {jobA.hasIdi && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <NumberField label="IDI monthly premium" value={jobA.monthlyPremium} step={50} prefix="$" showZeroAsEmpty onChange={(monthlyPremium) => setJobA({ ...jobA, monthlyPremium })} />
                  <NumberField label="IDI monthly benefit" value={jobA.idiBenefit} step={500} prefix="$" showZeroAsEmpty onChange={(idiBenefit) => setJobA({ ...jobA, idiBenefit })} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-t-4 border-gray-800 border-t-[#378ADD] bg-gray-900/25">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#378ADD]">Job B</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">Has IDI policy?</span>
                  <div className="flex gap-1">
                    {(["Yes", "No"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setJobB({ ...jobB, hasIdi: opt === "Yes" })}
                        className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                          (opt === "Yes") === jobB.hasIdi
                            ? "bg-[#378ADD] text-white"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NumberField label="Annual income" value={jobB.salary} step={5000} prefix="$" onChange={(salary) => setJobB({ ...jobB, salary })} />
                <NumberField label="Group LTD (% of income)" value={jobB.groupPct} step={1} suffix="%" onChange={(groupPct) => setJobB({ ...jobB, groupPct })} />
                <GroupCapField label="Group LTD cap ($/mo)" value={jobB.groupCap} onChange={(groupCap) => setJobB({ ...jobB, groupCap })} />
              </div>
              {jobB.hasIdi && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <NumberField label="IDI monthly premium" value={jobB.monthlyPremium} step={50} prefix="$" showZeroAsEmpty onChange={(monthlyPremium) => setJobB({ ...jobB, monthlyPremium })} />
                  <NumberField label="IDI monthly benefit" value={jobB.idiBenefit} step={500} prefix="$" showZeroAsEmpty onChange={(idiBenefit) => setJobB({ ...jobB, idiBenefit })} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Stacked bar chart + metrics ───────────────────────────────────── */}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <Card className="border-gray-800 bg-gray-900/25">
            <CardContent className="p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Income Gap Comparison</p>
                  <p className="mt-0.5 text-xs text-gray-500">Annual income breakdown — covered vs. unprotected</p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">
                  <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-[#3b82f6]" />Group LTD</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-[#06b6d4]" />IDI Benefit</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-[#ef4444]" />Income Gap</span>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 16, right: 40, left: 0, bottom: 12 }}
                    barSize={96}
                    barCategoryGap="50%"
                  >
                    <CartesianGrid stroke="rgba(148,163,184,0.06)" strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                      dy={6}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={54}
                      domain={[0, (dataMax: number) => Math.max(1, Math.ceil((dataMax * 1.15) / 1000) * 1000)]}
                      tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
                    />
                    <Tooltip content={<GapTooltip />} cursor={{ fill: "rgba(255,255,255,0.025)" }} />

                    <Bar
                      dataKey="Group LTD"
                      stackId="stack"
                      fill="#3b82f6"
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={1400}
                      animationEasing="ease-out"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`group-${index}`} />
                      ))}
                      <LabelList
                        dataKey="Group LTD"
                        position="center"
                        formatter={(v: number) => v > 0 ? formatCurrency(v) : ""}
                        style={{ fill: "#fff", fontSize: 11, fontWeight: 600 }}
                      />
                    </Bar>

                    <Bar
                      dataKey="IDI Benefit"
                      stackId="stack"
                      fill="#06b6d4"
                      isAnimationActive={true}
                      animationBegin={140}
                      animationDuration={1400}
                      animationEasing="ease-out"
                    >
                      {chartData.map((entry, index) => {
                        return (
                          <Cell
                            key={`idi-${index}`}
                            fill={entry["IDI Benefit"] > 0 ? "#06b6d4" : "transparent"}
                          />
                        )
                      })}
                      <LabelList
                        dataKey="IDI Benefit"
                        position="center"
                        formatter={(v: number) => v > 0 ? formatCurrency(v) : ""}
                        style={{ fill: "#fff", fontSize: 11, fontWeight: 600 }}
                      />
                    </Bar>

                    <Bar
                      dataKey="Income Gap"
                      stackId="stack"
                      fill="#ef4444"
                      radius={[6, 6, 0, 0]}
                      isAnimationActive={true}
                      animationBegin={200}
                      animationDuration={1400}
                      animationEasing="ease-out"
                    >
                      <LabelList
                        dataKey="Income Gap"
                        content={renderAdaptiveSegmentLabel}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* ── Side metric cards ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 xl:justify-center">
            <MetricCard
              label="IDI benefit"
              value={`${formatCurrency(annualIDI)}/yr`}
              sub="IDI monthly benefit × 12 months"
              accent="cyan"
            />
            <MetricCard
              label="Income difference"
              value={`${formatCurrency(Math.abs(totalBar_A - totalBar_B))}/yr`}
              sub="Job A total bar − Job B total bar"
              accent={totalBar_A >= totalBar_B ? "default" : "green"}
            />
            <MetricCard
              label="Gap difference"
              value={`${formatCurrency(Math.abs(incomeGap_A - incomeGap_B))}/yr`}
              sub="Job A income gap − Job B income gap"
              accent={incomeGap_A > incomeGap_B ? "red" : "green"}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
