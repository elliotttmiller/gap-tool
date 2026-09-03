import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { ModuleMetricCard } from "@/features/risk-modules/core/ModuleMetricCard"
import { financialBarChartTheme, topStackCellRadius } from "@/components/charts/financialBarChartTheme"
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

interface JobChartDatum {
  name: string
  "Group LTD": number
  "IDI Benefit": number
  "Income Gap": number
  totalBar: number
}

function JobPrintSummary({ label, job }: { label: string; job: JobState }) {
  const groupCap = parseWholeNumberInput(job.groupCap)
  const fields = [
    { label: "Annual Income", value: `${formatCurrency(job.salary)}/yr` },
    { label: "Group LTD", value: `${job.groupPct}% of income` },
    { label: "Group LTD Cap", value: groupCap > 0 ? `${formatCurrency(groupCap)}/mo` : "No monthly cap" },
    { label: "Individual DI", value: job.hasIdi ? "Included" : "Not included" },
    ...(job.hasIdi ? [
      { label: "IDI Premium", value: `${formatCurrency(job.monthlyPremium)}/mo` },
      { label: "IDI Benefit", value: `${formatCurrency(job.idiBenefit)}/mo` },
    ] : []),
  ]

  return (
    <section className="job-comparison-print-card">
      <h3>{label}</h3>
      <div className="job-comparison-print-fields">
        {fields.map((field) => (
          <div key={field.label}>
            <p>{field.label}</p>
            <strong>{field.value}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

type JobChartSeriesKey = "Group LTD" | "IDI Benefit" | "Income Gap"

function roundedStackCells(
  data: JobChartDatum[],
  dataKey: JobChartSeriesKey,
  isTopSegment: (row: JobChartDatum) => boolean,
) {
  return data.map((row) => (
    <Cell
      key={`${row.name}-${dataKey}`}
      radius={topStackCellRadius(isTopSegment(row))}
    />
  ))
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
  return Number(value.replace(/[^\d]/g, "")) || 0
}

function formatWholeNumberInput(value: number | string, showZeroAsEmpty = false): string {
  const numeric = typeof value === "number" ? value : parseWholeNumberInput(value)
  if (showZeroAsEmpty && numeric === 0) return ""
  if (!Number.isFinite(numeric)) return ""
  return Math.max(0, Math.round(numeric)).toLocaleString("en-US")
}

function binaryOptionClass(selected: boolean): string {
  return `rounded-md px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#188a89] ${
    selected
      ? "bg-[#188a89] text-white shadow-sm"
      : "bg-gray-800 text-gray-400 hover:bg-[#188a89]/15 hover:text-[#188a89] dark:hover:text-white"
  }`
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
  const currencyLike = Boolean(prefix)
  const displayValue = currencyLike
    ? formatWholeNumberInput(value, showZeroAsEmpty)
    : showZeroAsEmpty && value === 0 ? "" : value

  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-gray-400">{label}</span>
      <div className="relative flex items-center">
        {prefix ? <span className="pointer-events-none absolute left-2.5 text-xs text-gray-500">{prefix}</span> : null}
        <input
          type={currencyLike ? "text" : "number"}
          inputMode={currencyLike ? "numeric" : undefined}
          value={displayValue}
          min={currencyLike ? undefined : min}
          step={currencyLike ? undefined : step}
          onChange={(event) => {
            const rawValue = currencyLike ? event.target.value.replace(/[^\d]/g, "") : event.target.value
            onChange(Math.max(min, Number(rawValue) || 0))
          }}
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
          value={formatWholeNumberInput(value, true)}
          onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ""))}
          className="h-9 w-full rounded-md border border-gray-700 bg-gray-950 pl-6 pr-2.5 text-sm text-gray-100 outline-none transition focus:border-brand-600"
        />
      </div>
    </label>
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

  const chartData: JobChartDatum[] = [
    { name: "Job A", "Group LTD": jobAChartCovered, "IDI Benefit": 0, "Income Gap": jobAChartGap, totalBar: jobAIncome },
    { name: "Job B", "Group LTD": jobBGroupChart, "IDI Benefit": jobBIDIChart, "Income Gap": jobBChartGap, totalBar: jobBIncome },
  ]

  return (
    <div className="module-output-container">
      <div className="space-y-4">
        <div className="job-comparison-editor grid items-start gap-4 xl:grid-cols-2">
          <Card className="border-t-4 border-gray-800 border-t-[#188a89] bg-gray-900/25">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#188a89] dark:text-[#1db8b9]">Job A</p>
                <span className="text-[11px] font-medium text-gray-400">Group LTD only</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NumberField label="Annual income" value={jobA.salary} step={5000} prefix="$" onChange={(salary) => setJobA({ ...jobA, salary })} />
                <NumberField label="Group LTD (% of income)" value={jobA.groupPct} step={1} suffix="%" onChange={(groupPct) => setJobA({ ...jobA, groupPct })} />
                <GroupCapField label="Group LTD cap ($/mo)" value={jobA.groupCap} onChange={(groupCap) => setJobA({ ...jobA, groupCap })} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-gray-800 border-t-[#188a89] bg-gray-900/25">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#188a89] dark:text-[#1db8b9]">Job B</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">Has IDI policy?</span>
                  <div className="flex gap-1">
                    {(["Yes", "No"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setJobB({ ...jobB, hasIdi: option === "Yes" })}
                        className={binaryOptionClass((option === "Yes") === jobB.hasIdi)}
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

        <div className="job-comparison-print-inputs hidden">
          <JobPrintSummary label="Job A" job={jobA} />
          <JobPrintSummary label="Job B" job={jobB} />
        </div>

        <div className="job-comparison-results grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
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
                  <BarChart
                    data={chartData}
                    margin={{ top: 16, right: 40, left: 12, bottom: 32 }}
                    barSize={financialBarChartTheme.geometry.comparisonBarSize}
                    barCategoryGap={financialBarChartTheme.geometry.comparisonCategoryGap}
                  >
                    <CartesianGrid stroke={financialBarChartTheme.grid.stroke} strokeDasharray={financialBarChartTheme.grid.strokeDasharray} vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: financialBarChartTheme.axis.tickFill, fontSize: 12, fontWeight: 600 }}
                      tickLine={{ stroke: financialBarChartTheme.axis.lineStroke, strokeOpacity: financialBarChartTheme.axis.lineOpacity }}
                      axisLine={{ stroke: financialBarChartTheme.axis.lineStroke, strokeOpacity: financialBarChartTheme.axis.lineOpacity }}
                      dy={6}
                      label={{ value: "Job Scenario", position: "insideBottom", offset: -18, fill: financialBarChartTheme.axis.tickFill, fontSize: 10, fontWeight: 600 }}
                    />
                    <YAxis
                      tick={{ fill: financialBarChartTheme.axis.tickFill, fontSize: 11 }}
                      tickLine={{ stroke: financialBarChartTheme.axis.lineStroke, strokeOpacity: financialBarChartTheme.axis.lineOpacity }}
                      axisLine={{ stroke: financialBarChartTheme.axis.lineStroke, strokeOpacity: financialBarChartTheme.axis.lineOpacity }}
                      width={62}
                      domain={[0, (dataMax: number) => Math.max(1, Math.ceil((dataMax * 1.15) / 1000) * 1000)]}
                      tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}
                      label={{ value: "Annual Income ($)", angle: -90, position: "insideLeft", offset: 2, fill: financialBarChartTheme.axis.tickFill, fontSize: 10, fontWeight: 600 }}
                    />
                    <Tooltip content={<ComparisonTooltip />} cursor={{ fill: financialBarChartTheme.cursor.fill }} />
                    <Bar dataKey="Group LTD" stackId="stack" fill="#3b82f6" shapeRendering="geometricPrecision">
                      {roundedStackCells(chartData, "Group LTD", (row) => row["IDI Benefit"] <= 0 && row["Income Gap"] <= 0)}
                      <LabelList dataKey="Group LTD" position="center" formatter={(value: number) => value > 0 ? formatCurrency(value) : ""} style={{ fill: "#fff", fontSize: 11, fontWeight: 600 }} />
                    </Bar>
                    <Bar dataKey="IDI Benefit" stackId="stack" fill="#06b6d4" shapeRendering="geometricPrecision">
                      {roundedStackCells(chartData, "IDI Benefit", (row) => row["Income Gap"] <= 0)}
                      <LabelList dataKey="IDI Benefit" position="center" formatter={(value: number) => value > 0 ? formatCurrency(value) : ""} style={{ fill: "#fff", fontSize: 11, fontWeight: 600 }} />
                    </Bar>
                    <Bar dataKey="Income Gap" stackId="stack" fill="#ef4444" shapeRendering="geometricPrecision">
                      {roundedStackCells(chartData, "Income Gap", (row) => row["Income Gap"] > 0)}
                      <LabelList dataKey="Income Gap" position="center" formatter={(value: number) => value > 0 ? formatCurrency(value) : ""} style={{ fill: "#fff", fontSize: 11, fontWeight: 600 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="job-comparison-metrics flex flex-col gap-3 xl:justify-center">
            <ModuleMetricCard label="Job A Income" value={`${formatCurrency(jobAIncome)}/yr`} description="Income input" accent="neutral" />
            <ModuleMetricCard label="Job B Income" value={`${formatCurrency(jobBIncome)}/yr`} description="Income input − annual Individual DI premium" accent="neutral" />
            <ModuleMetricCard label="Job A Income if Disabled" value={`${formatCurrency(jobAIncomeIfDisabled)}/yr`} description="Group LTD benefit" accent="primary" />
            <ModuleMetricCard label="Job B Income if Disabled" value={`${formatCurrency(jobBIncomeIfDisabled)}/yr`} description="Group LTD benefit + Individual DI benefit" accent="primary" />
          </div>
        </div>
      </div>
    </div>
  )
}
