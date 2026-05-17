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
  groupCap: number
  hasIdi: boolean
  monthlyPremium: number
  idiBenefit: number
}

interface JobBState {
  salary: number
  groupPct: number
  groupCap: number
  hasIdi: boolean
  monthlyPremium: number
  idiBenefit: number
}

function getInitialJobs(inputs?: DisabilityInputs): { jobA: JobAState; jobB: JobBState } {
  const salary = inputs?.annualEarnedIncome ?? 100000
  const groupPct = inputs?.ltdCoveragePercent ? Math.round(inputs.ltdCoveragePercent * 100) : 60
  const groupCap = inputs?.ltdMonthlyCap ?? 0
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

function NumberField({
  label,
  value,
  step = 1000,
  min = 0,
  prefix,
  suffix,
  onChange,
}: {
  label: string
  value: number
  step?: number
  min?: number
  prefix?: string
  suffix?: string
  onChange: (v: number) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-gray-400">{label}</span>
      <div className="relative flex items-center">
        {prefix && (
          <span className="pointer-events-none absolute left-2.5 text-xs text-gray-500">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
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

function GapTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((sum: number, p: any) => sum + (p.value ?? 0), 0)
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
          <span className="font-mono text-gray-100">{formatCurrency(total)}/yr</span>
        </div>
      </div>
    </div>
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
  const groupLTD_A = calcGroupLTDAnnual(jobA.salary, jobA.groupPct, jobA.groupCap)
  const annualIDI_A = jobA.hasIdi ? jobA.idiBenefit * 12 : 0
  const annualPremium_A = jobA.hasIdi ? jobA.monthlyPremium * 12 : 0
  const totalBar_A = Math.max(jobA.salary - annualPremium_A, 0)
  const incomeGap_A = Math.max(totalBar_A - groupLTD_A - annualIDI_A, 0)

  // ── Job B ──────────────────────────────────────────────────────────────────
  const annualPremium = jobB.hasIdi ? jobB.monthlyPremium * 12 : 0
  const annualIDI = jobB.hasIdi ? jobB.idiBenefit * 12 : 0
  const groupLTD_B = calcGroupLTDAnnual(jobB.salary, jobB.groupPct, jobB.groupCap)
  const totalBar_B = Math.max(jobB.salary - annualPremium, 0)
  const incomeGap_B = Math.max(totalBar_B - groupLTD_B - annualIDI, 0)

  const chartData = [
    {
      name: "Job A",
      "Group LTD": Math.round(groupLTD_A),
      "IDI Benefit": Math.round(annualIDI_A),
      "Income Gap": Math.round(incomeGap_A),
    },
    {
      name: "Job B",
      "Group LTD": Math.round(groupLTD_B),
      "IDI Benefit": Math.round(annualIDI),
      "Income Gap": Math.round(incomeGap_B),
    },
  ]

  return (
    <div className="module-output-container">
      <div className="space-y-4">

        {/* ── Input cards ────────────────────────────────────────────────────── */}
        <div className="grid gap-4 xl:grid-cols-2">
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
              <div className="grid gap-3 sm:grid-cols-2">
                <NumberField label="Annual income" value={jobA.salary} step={5000} prefix="$" onChange={(salary) => setJobA({ ...jobA, salary })} />
                <NumberField label="Group LTD (% of income)" value={jobA.groupPct} step={1} suffix="%" onChange={(groupPct) => setJobA({ ...jobA, groupPct })} />
                {jobA.hasIdi && (
                  <>
                    <NumberField label="IDI monthly premium" value={jobA.monthlyPremium} step={50} prefix="$" onChange={(monthlyPremium) => setJobA({ ...jobA, monthlyPremium })} />
                    <NumberField label="IDI monthly benefit" value={jobA.idiBenefit} step={500} prefix="$" onChange={(idiBenefit) => setJobA({ ...jobA, idiBenefit })} />
                  </>
                )}
              </div>
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
              <div className="grid gap-3 sm:grid-cols-2">
                <NumberField label="Annual income" value={jobB.salary} step={5000} prefix="$" onChange={(salary) => setJobB({ ...jobB, salary })} />
                <NumberField label="Group LTD (% of income)" value={jobB.groupPct} step={1} suffix="%" onChange={(groupPct) => setJobB({ ...jobB, groupPct })} />
                {jobB.hasIdi && (
                  <>
                    <NumberField label="IDI monthly premium" value={jobB.monthlyPremium} step={50} prefix="$" onChange={(monthlyPremium) => setJobB({ ...jobB, monthlyPremium })} />
                    <NumberField label="IDI monthly benefit" value={jobB.idiBenefit} step={500} prefix="$" onChange={(idiBenefit) => setJobB({ ...jobB, idiBenefit })} />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Stacked bar chart + metrics ───────────────────────────────────── */}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_11rem]">
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

              <div className="chart-reveal h-80">
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 16, right: 16, left: 0, bottom: 4 }}
                    barCategoryGap="40%"
                  >
                    <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#94a3b8", fontSize: 13, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: "#1f2937" }}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      width={56}
                      tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
                    />
                    <Tooltip content={<GapTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />

                    <Bar dataKey="Group LTD" stackId="stack" fill="#3b82f6" isAnimationActive animationDuration={550}>
                      <LabelList
                        dataKey="Group LTD"
                        position="center"
                        formatter={(v: number) => v > 0 ? formatCurrency(v) : ""}
                        style={{ fill: "#fff", fontSize: 11, fontWeight: 600 }}
                      />
                    </Bar>

                    <Bar dataKey="IDI Benefit" stackId="stack" isAnimationActive animationDuration={550}>
                      {chartData.map((entry, index) => (
                        <Cell key={`idi-${index}`} fill={entry["IDI Benefit"] > 0 ? "#06b6d4" : "transparent"} />
                      ))}
                      <LabelList
                        dataKey="IDI Benefit"
                        position="center"
                        formatter={(v: number) => v > 0 ? formatCurrency(v) : ""}
                        style={{ fill: "#fff", fontSize: 11, fontWeight: 600 }}
                      />
                    </Bar>

                    <Bar dataKey="Income Gap" stackId="stack" fill="#ef4444" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={550}>
                      <LabelList
                        dataKey="Income Gap"
                        position="center"
                        formatter={(v: number) => v > 0 ? formatCurrency(v) : ""}
                        style={{ fill: "#fff", fontSize: 11, fontWeight: 600 }}
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
              accent="cyan"
            />
            <MetricCard
              label="Income difference"
              value={`${formatCurrency(Math.abs(jobA.salary - totalBar_B))}/yr`}
              accent={jobA.salary >= totalBar_B ? "default" : "green"}
            />
            <MetricCard
              label="Gap difference"
              value={`${formatCurrency(Math.abs(incomeGap_A - incomeGap_B))}/yr`}
              accent={incomeGap_A > incomeGap_B ? "red" : "green"}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
