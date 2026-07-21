import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { DisabilityInputs } from "../types"

interface JobComparisonModuleProps {
  inputs?: DisabilityInputs
}

interface JobState {
  salary: number
  groupPct: number
  groupCap: string
  hasIdi: boolean
  monthlyPremium: number
  idiBenefit: number
}

function getInitialJobs(inputs?: DisabilityInputs): { jobA: JobState; jobB: JobState } {
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
  const uncapped = Math.max(0, salary) * (Math.max(0, groupPct) / 100)
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
  onChange: (value: number) => void
}) {
  const displayValue = showZeroAsEmpty && value === 0 ? "" : value

  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-gray-400">{label}</span>
      <div className="relative flex items-center">
        {prefix ? <span className="pointer-events-none absolute left-2.5 text-xs text-gray-500">{prefix}</span> : null}
        <input
          type="number"
          value={displayValue}
          min={min}
          step={step}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          className={`h-9 w-full rounded-md border border-gray-700 bg-gray-950 text-sm text-gray-100 outline-none transition focus:border-brand-600 ${prefix ? "pl-6 pr-2.5" : suffix ? "pl-2.5 pr-6" : "px-2.5"}`}
        />
        {suffix ? <span className="pointer-events-none absolute right-2.5 text-xs text-gray-500">{suffix}</span> : null}
      </div>
    </label>
  )
}

function GroupCapField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-gray-400">{label}</span>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-2.5 text-xs text-gray-500">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ""))}
          className="h-9 w-full rounded-md border border-gray-700 bg-gray-950 pl-6 pr-2.5 text-sm text-gray-100 outline-none transition focus:border-brand-600"
        />
      </div>
    </label>
  )
}

function MetricCard({ label, value, sub, accent = "default" }: {
  label: string
  value: string
  sub?: string
  accent?: "green" | "red" | "cyan" | "default"
}) {
  const valueClass = accent === "green"
    ? "text-emerald-300"
    : accent === "red"
      ? "text-red-400"
      : accent === "cyan"
        ? "text-cyan-300"
        : "text-gray-100"

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${valueClass}`}>{value}</p>
      {sub ? <p className="mt-0.5 text-[11px] text-gray-500">{sub}</p> : null}
    </div>
  )
}

function ComparisonTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  const groupLTD = Number(point?.["Group LTD"] ?? 0)
  const idiBenefit = Number(point?.["IDI Benefit"] ?? 0)
  const incomeGap = Number(point?.["Income Gap"] ?? 0)
  const annualIncome = Number(point?.totalBar ?? 0)

  return (
    <div className="min-w-52 rounded-xl border border-gray-700 bg-gray-950/95 p-3 text-xs shadow-2xl backdrop-blur">
      <p className="mb-2 font-semibold text-gray-100">{label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-4 border-b border-gray-800 pb-1.5">
          <span className="text-gray-400">Annual Income</span>
          <span className="font-mono text-gray-100">{formatCurrency(annualIncome)}/yr</span>
        </div>
        <div className="flex justify-between gap-4"><span className="text-blue-400">Group LTD</span><span className="font-mono text-gray-100">{formatCurrency(groupLTD)}/yr</span></div>
        <div className="flex justify-between gap-4"><span className="text-cyan-400">IDI Benefit</span><span className="font-mono text-gray-100">{formatCurrency(idiBenefit)}/yr</span></div>
        <div className="flex justify-between gap-4"><span className="text-red-400">Income Gap</span><span className="font-mono text-gray-100">{formatCurrency(incomeGap)}/yr</span></div>
      </div>
    </div>
  )
}

export function JobComparisonModule({ inputs }: JobComparisonModuleProps) {
  const initial = useMemo(() => getInitialJobs(inputs), [inputs])
  const [jobA, setJobA] = useState<JobState>(initial.jobA)
  const [jobB, setJobB] = useState<JobState>(initial.jobB)

  useEffect(() => {
    const next = getInitialJobs(inputs)
    setJobA(next.jobA)
    setJobB(next.jobB)
  }, [inputs])

  const jobAIncome = Math.max(0, jobA.salary)
  const jobBAnnualPremium = jobB.hasIdi ? Math.max(0, jobB.monthlyPremium) * 12 : 0
  const jobBIncome = Math.max(0, jobB.salary - jobBAnnualPremium)

  const jobAGroupLTD = Math.round(calcGroupLTDAnnual(jobA.salary, jobA.groupPct, parseWholeNumberInput(jobA.groupCap)))
  const jobBGroupLTD = Math.round(calcGroupLTDAnnual(jobB.salary, jobB.groupPct, parseWholeNumberInput(jobB.groupCap)))
  const jobBIDIAnnual = jobB.hasIdi ? Math.round(Math.max(0, jobB.idiBenefit) * 12) : 0

  const jobAIncomeIfDisabled = jobAGroupLTD
  const jobBIncomeIfDisabled = jobBGroupLTD + jobBIDIAnnual

  const jobAChartCovered = Math.min(jobAIncomeIfDisabled, jobAIncome)
  const jobAChartGap = Math.max(0, jobAIncome - jobAChartCovered)
  const jobBGroupChart = Math.min(jobBGroupLTD, jobBIncome)
  const jobBIDIChart = Math.min(jobBIDIAnnual, Math.max(0, jobBIncome - jobBGroupChart))
  const jobBChartGap = Math.max(0, jobBIncome - jobBGroupChart - jobBIDIChart)

  const chartData = [
    { name: "Job A", "Group LTD": jobAChartCovered, "IDI Benefit": 0, "Income Gap": jobAChartGap, totalBar: jobAIncome },
    { name: "Job B", "Group LTD": jobBGroupChart, "IDI Benefit": jobBIDIChart, "Income Gap": jobBChartGap, totalBar: jobBIncome },
  ]

  return (
    <div className="module-output-container">
      <div className="space-y-4">
        <div className="grid items-start gap-4 xl:grid-cols-2">
          <Card className="border-t-4 border-gray-800 border-t-emerald-500 bg-gray-900/25">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-emerald-400">Job A</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">Has IDI policy?</span>
                  <div className="flex gap-1">
                    {(["Yes", "No"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setJobA({ ...jobA, hasIdi: option === "Yes" })}
                        className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${(option === "Yes") === jobA.hasIdi ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                      >
                        {option}
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
              {jobA.hasIdi ? (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <NumberField label="IDI monthly premium" value={jobA.monthlyPremium} step={50} prefix="$" showZeroAsEmpty onChange={(monthlyPremium) => setJobA({ ...jobA, monthlyPremium })} />
                  <NumberField label="IDI monthly benefit" value={jobA.idiBenefit} step={500} prefix="$" showZeroAsEmpty onChange={(idiBenefit) => setJobA({ ...jobA, idiBenefit })} />
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-t-4 border-gray-800 border-t-cyan-500 bg-gray-900/25">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-cyan-400">Job B</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">Has IDI policy?</span>
                  <div className="flex gap-1">
                    {(["Yes", "No"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setJobB({ ...jobB, hasIdi: option === "Yes" })}
                        className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${(option === "Yes") === jobB.hasIdi ? "bg-cyan-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                      >
                        {option}
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
              {jobB.hasIdi ? (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <NumberField label="IDI monthly premium" value={jobB.monthlyPremium} step={50} prefix="$" showZeroAsEmpty onChange={(monthlyPremium) => setJobB({ ...jobB, monthlyPremium })} />
                  <NumberField label="IDI monthly benefit" value={jobB.idiBenefit} step={500} prefix="$" showZeroAsEmpty onChange={(idiBenefit) => setJobB({ ...jobB, idiBenefit })} />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <Card className="border-gray-800 bg-gray-900/25">
            <CardContent className="p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Income Gap Comparison</p>
                  <p className="mt-0.5 text-xs text-gray-500">Annual income breakdown — covered vs. unprotected</p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">
                  <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-blue-500" />Group LTD</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-cyan-500" />IDI Benefit</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-red-500" />Income Gap</span>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                  <BarChart data={chartData} margin={{ top: 16, right: 40, left: 0, bottom: 12 }} barSize={96} barCategoryGap="50%">
                    <CartesianGrid stroke="rgba(148,163,184,0.06)" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }} tickLine={false} axisLine={false} dy={6} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} width={54} domain={[0, (dataMax: number) => Math.max(1, Math.ceil((dataMax * 1.15) / 1000) * 1000)]} tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`} />
                    <Tooltip content={<ComparisonTooltip />} cursor={{ fill: "rgba(255,255,255,0.025)" }} />
                    <Bar dataKey="Group LTD" stackId="stack" fill="#3b82f6"><LabelList dataKey="Group LTD" position="center" formatter={(value: number) => value > 0 ? formatCurrency(value) : ""} style={{ fill: "#fff", fontSize: 11, fontWeight: 600 }} /></Bar>
                    <Bar dataKey="IDI Benefit" stackId="stack" fill="#06b6d4"><LabelList dataKey="IDI Benefit" position="center" formatter={(value: number) => value > 0 ? formatCurrency(value) : ""} style={{ fill: "#fff", fontSize: 11, fontWeight: 600 }} /></Bar>
                    <Bar dataKey="Income Gap" stackId="stack" fill="#ef4444" radius={[6, 6, 0, 0]}><LabelList dataKey="Income Gap" position="center" formatter={(value: number) => value > 0 ? formatCurrency(value) : ""} style={{ fill: "#fff", fontSize: 11, fontWeight: 600 }} /></Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 xl:justify-center">
            <MetricCard label="Job A Income" value={`${formatCurrency(jobAIncome)}/yr`} sub="Income input" />
            <MetricCard label="Job B Income" value={`${formatCurrency(jobBIncome)}/yr`} sub="Income input − annual Individual DI premium" accent="cyan" />
            <MetricCard label="Job A Income if Disabled" value={`${formatCurrency(jobAIncomeIfDisabled)}/yr`} sub="Group LTD benefit" />
            <MetricCard label="Job B Income if Disabled" value={`${formatCurrency(jobBIncomeIfDisabled)}/yr`} sub="Group LTD benefit + Individual DI benefit" accent="green" />
          </div>
        </div>
      </div>
    </div>
  )
}
