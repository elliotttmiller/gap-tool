import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { DisabilityInputs } from "../types"

type CompareView = "monthly" | "gap" | "coverage"

interface JobComparisonModuleProps {
  inputs?: DisabilityInputs
}

interface JobState {
  salary: number
  bonus: number
  groupPct: number
  groupCap: number
  hasIdi: boolean
  idiBenefit: number
}

interface JobResult {
  gross: number
  taxRate: number
  netMonthly: number
  groupDiMonthly: number
  idiMonthly: number
  totalDiMonthly: number
  gapMonthly: number
  coveragePct: number
}

const BRACKETS_MFJ = [
  { rate: 0.10, up: 23200 },
  { rate: 0.12, up: 94300 },
  { rate: 0.22, up: 201050 },
  { rate: 0.24, up: 383900 },
  { rate: 0.32, up: 487450 },
  { rate: 0.35, up: 731200 },
  { rate: 0.37, up: Infinity },
]

function marginalRate(income: number): number {
  for (const bracket of BRACKETS_MFJ) {
    if (income <= bracket.up) return bracket.rate
  }
  return 0.37
}

function formatCompactCurrency(value: number): string {
  if (Math.abs(value) >= 1000) return `$${Math.round(value / 1000)}k`
  return formatCurrency(value)
}

function calculateJob(job: JobState): JobResult {
  const gross = job.salary + job.bonus
  const taxRate = marginalRate(gross)
  const netMonthly = gross * (1 - taxRate) / 12
  const groupDiMonthly = Math.min((job.salary * (job.groupPct / 100)) / 12, job.groupCap || 999999)
  const idiMonthly = job.hasIdi ? job.idiBenefit : 0
  const totalDiMonthly = groupDiMonthly + idiMonthly
  const gapMonthly = Math.max(netMonthly - totalDiMonthly, 0)
  const coveragePct = netMonthly > 0 ? Math.min((totalDiMonthly / netMonthly) * 100, 100) : 0

  return { gross, taxRate, netMonthly, groupDiMonthly, idiMonthly, totalDiMonthly, gapMonthly, coveragePct }
}

function getInitialJobs(inputs?: DisabilityInputs): { jobA: JobState; jobB: JobState } {
  const baseSalary = inputs?.annualEarnedIncome && inputs.annualEarnedIncome > 0 ? inputs.annualEarnedIncome : 100000
  const basePct = inputs?.ltdCoveragePercent ? Math.round(inputs.ltdCoveragePercent * 100) : 60
  const baseCap = inputs?.ltdMonthlyCap && inputs.ltdMonthlyCap > 0 ? inputs.ltdMonthlyCap : 6000
  const baseIdi = inputs?.privateDiBenefitMonthly && inputs.privateDiBenefitMonthly > 0 ? inputs.privateDiBenefitMonthly : 2000

  return {
    jobA: {
      salary: Math.round(baseSalary),
      bonus: 0,
      groupPct: basePct,
      groupCap: baseCap,
      hasIdi: false,
      idiBenefit: baseIdi,
    },
    jobB: {
      salary: Math.round(baseSalary * 1.3),
      bonus: Math.round(baseSalary * 0.15),
      groupPct: Math.max(0, basePct - 10),
      groupCap: Math.max(0, baseCap - 1000),
      hasIdi: false,
      idiBenefit: baseIdi,
    },
  }
}

function NumberField({ label, value, step = 1000, min = 0, onChange }: { label: string; value: number; step?: number; min?: number; onChange: (value: number) => void }) {
  return (
    <label className="space-y-1">
      <span className="text-[11px] text-gray-400">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="h-9 w-full rounded-md border border-gray-700 bg-gray-950 px-2.5 text-sm text-gray-100 outline-none transition focus:border-brand-600 focus:ring-0"
      />
    </label>
  )
}

function JobCard({
  title,
  accent,
  job,
  setJob,
}: {
  title: string
  accent: "green" | "blue"
  job: JobState
  setJob: (job: JobState) => void
}) {
  const accentClass = accent === "green" ? "border-t-[#1D9E75] text-[#1D9E75]" : "border-t-[#378ADD] text-[#378ADD]"

  return (
    <Card className={`border-gray-800 border-t-4 ${accentClass} bg-gray-900/25`}>
      <CardContent className="p-4">
        <div className={`mb-3 text-sm font-semibold ${accentClass}`}>{title}</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="Annual salary" value={job.salary} step={5000} onChange={(salary) => setJob({ ...job, salary })} />
          <NumberField label="Annual bonus" value={job.bonus} step={1000} onChange={(bonus) => setJob({ ...job, bonus })} />
          <NumberField label="Group DI (% of salary)" value={job.groupPct} step={1} onChange={(groupPct) => setJob({ ...job, groupPct })} />
          <NumberField label="Group DI cap ($/mo)" value={job.groupCap} step={500} onChange={(groupCap) => setJob({ ...job, groupCap })} />
          <label className="space-y-1">
            <span className="text-[11px] text-gray-400">Has IDI policy?</span>
            <select
              value={job.hasIdi ? "1" : "0"}
              onChange={(event) => setJob({ ...job, hasIdi: event.target.value === "1" })}
              className="h-9 w-full rounded-md border border-gray-700 bg-gray-950 px-2.5 text-sm text-gray-100 outline-none transition focus:border-brand-600 focus:ring-0"
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </label>
          <NumberField label="IDI monthly benefit" value={job.idiBenefit} step={500} onChange={(idiBenefit) => setJob({ ...job, idiBenefit })} />
        </div>
      </CardContent>
    </Card>
  )
}

function StatRow({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "good" | "gap" | "blue" }) {
  const toneClass = tone === "good" ? "text-[#1D9E75]" : tone === "gap" ? "text-[#D85A30]" : tone === "blue" ? "text-[#378ADD]" : "text-gray-100"
  return (
    <div className="flex items-baseline justify-between border-b border-gray-800 py-1 last:border-b-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-right font-mono text-xs font-semibold ${toneClass}`}>{value}</span>
    </div>
  )
}

function CompareTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-950/95 p-3 text-xs shadow-2xl backdrop-blur">
      <p className="mb-2 font-semibold text-gray-100">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-mono text-gray-100">{entry.payload?.unit === "%" ? `${entry.value}%` : formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function JobComparisonModule({ inputs }: JobComparisonModuleProps) {
  const initial = useMemo(() => getInitialJobs(inputs), [inputs])
  const [jobA, setJobA] = useState<JobState>(initial.jobA)
  const [jobB, setJobB] = useState<JobState>(initial.jobB)
  const [view, setView] = useState<CompareView>("monthly")

  const a = useMemo(() => calculateJob(jobA), [jobA])
  const b = useMemo(() => calculateJob(jobB), [jobB])
  const winner = a.gapMonthly <= b.gapMonthly ? "A" : "B"
  const winnerColor = winner === "A" ? "text-[#1D9E75]" : "text-[#378ADD]"
  const betterGap = Math.abs(a.gapMonthly - b.gapMonthly)

  const chartData = useMemo(() => {
    if (view === "monthly") {
      return [
        { label: "Take-home", "Job A": Math.round(a.netMonthly), "Job B": Math.round(b.netMonthly), unit: "$" },
        { label: "Group DI", "Job A": Math.round(a.groupDiMonthly), "Job B": Math.round(b.groupDiMonthly), unit: "$" },
        { label: "IDI benefit", "Job A": Math.round(a.idiMonthly), "Job B": Math.round(b.idiMonthly), unit: "$" },
        { label: "Total DI", "Job A": Math.round(a.totalDiMonthly), "Job B": Math.round(b.totalDiMonthly), unit: "$" },
        { label: "Gap", "Job A": Math.round(a.gapMonthly), "Job B": Math.round(b.gapMonthly), unit: "$" },
      ]
    }
    if (view === "gap") {
      return [
        { label: "Monthly income", "Job A": Math.round(a.netMonthly), "Job B": Math.round(b.netMonthly), unit: "$" },
        { label: "DI benefit", "Job A": Math.round(a.totalDiMonthly), "Job B": Math.round(b.totalDiMonthly), unit: "$" },
        { label: "Unprotected gap", "Job A": Math.round(a.gapMonthly), "Job B": Math.round(b.gapMonthly), unit: "$" },
      ]
    }
    return [
      { label: "Coverage %", "Job A": Math.round(a.coveragePct), "Job B": Math.round(b.coveragePct), unit: "%" },
      { label: "Gap %", "Job A": Math.round(100 - a.coveragePct), "Job B": Math.round(100 - b.coveragePct), unit: "%" },
    ]
  }, [a, b, view])

  return (
    <div className="module-output-container">
      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-2">
          <JobCard title="Job A" accent="green" job={jobA} setJob={setJobA} />
          <JobCard title="Job B" accent="blue" job={jobB} setJob={setJobB} />
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/25 px-4 py-3 text-sm text-gray-400">
          <span className={`text-lg ${winnerColor}`}>●</span>
          <span>
            Job <strong className="font-semibold text-gray-100">{winner}</strong> provides better disability protection — <strong className="font-semibold text-gray-100">{formatCurrency(betterGap)}/mo</strong> smaller income gap. Coverage: Job A <strong className="font-semibold text-gray-100">{Math.round(a.coveragePct)}%</strong> · Job B <strong className="font-semibold text-gray-100">{Math.round(b.coveragePct)}%</strong>
          </span>
        </div>

        <Card className="border-gray-800 bg-gray-900/25">
          <CardContent className="p-4">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">View</div>
              <select
                value={view}
                onChange={(event) => setView(event.target.value as CompareView)}
                className="h-8 rounded-md border border-gray-700 bg-gray-950 px-3 text-xs text-gray-100 outline-none focus:border-brand-600 focus:ring-0"
              >
                <option value="monthly">Monthly income comparison</option>
                <option value="gap">Income gap comparison</option>
                <option value="coverage">Coverage % comparison</option>
              </select>
              <div className="ml-auto flex gap-4 text-[11px] text-gray-500">
                <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[#1D9E75]" />Job A</span>
                <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[#378ADD]" />Job B</span>
              </div>
            </div>
            <div className="chart-reveal h-64">
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }} barCategoryGap="22%">
                  <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={54}
                    tickFormatter={(value) => (view === "coverage" ? `${value}%` : `$${Math.round(Number(value) / 1000)}k`)}
                  />
                  <Tooltip content={<CompareTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="Job A" fill="#1D9E75" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={550} />
                  <Bar dataKey="Job B" fill="#378ADD" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={550} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1D9E75]">Job A Breakdown</div>
            <Card className="border-gray-800 bg-gray-900/25"><CardContent className="p-4">
              <StatRow label="Gross income" value={formatCurrency(a.gross)} />
              <StatRow label="Tax bracket" value={`${Math.round(a.taxRate * 100)}%`} />
              <StatRow label="Monthly take-home" value={formatCurrency(a.netMonthly)} tone="good" />
              <StatRow label="Group DI benefit" value={formatCurrency(a.groupDiMonthly)} />
              {a.idiMonthly > 0 ? <StatRow label="IDI benefit" value={formatCurrency(a.idiMonthly)} tone="blue" /> : null}
              <StatRow label="Total DI coverage" value={formatCurrency(a.totalDiMonthly)} />
              <StatRow label="Monthly income gap" value={formatCurrency(a.gapMonthly)} tone="gap" />
              <StatRow label="Coverage rate" value={`${Math.round(a.coveragePct)}%`} />
            </CardContent></Card>
          </div>
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#378ADD]">Job B Breakdown</div>
            <Card className="border-gray-800 bg-gray-900/25"><CardContent className="p-4">
              <StatRow label="Gross income" value={formatCurrency(b.gross)} />
              <StatRow label="Tax bracket" value={`${Math.round(b.taxRate * 100)}%`} />
              <StatRow label="Monthly take-home" value={formatCurrency(b.netMonthly)} tone="good" />
              <StatRow label="Group DI benefit" value={formatCurrency(b.groupDiMonthly)} />
              {b.idiMonthly > 0 ? <StatRow label="IDI benefit" value={formatCurrency(b.idiMonthly)} tone="blue" /> : null}
              <StatRow label="Total DI coverage" value={formatCurrency(b.totalDiMonthly)} />
              <StatRow label="Monthly income gap" value={formatCurrency(b.gapMonthly)} tone="gap" />
              <StatRow label="Coverage rate" value={`${Math.round(b.coveragePct)}%`} />
            </CardContent></Card>
          </div>
        </div>
      </div>
    </div>
  )
}
