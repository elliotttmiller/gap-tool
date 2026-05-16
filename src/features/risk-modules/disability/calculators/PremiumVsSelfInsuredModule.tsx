import { useEffect, useMemo, useState } from "react"
import { RiAlertLine } from "@remixicon/react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { calculateBreakEven } from "./calculateBreakEven"

interface PremiumVsSelfInsuredModuleProps {
  monthlyPremium: number
  monthlyBenefit: number
  annualRateOfReturn: number
  monthsWithoutIncome: number
}

interface PremiumVsSelfInsuredState {
  monthlyPremium: number
  monthlyBenefit: number
  annualRateOfReturn: number
  monthsWithoutIncome: number
}

interface PremiumChartPoint {
  month: number
  "Self-Insurance Fund": number
  "Benefit Needed": number
  remainingGap: number
}

interface DisabilityScenario {
  year: number
  fund: number
  covered: boolean
  delta: number
  label: string
}

function roundToStep(value: number, step: number): number {
  if (!Number.isFinite(value)) return step
  return Math.round(value / step) * step
}

function formatDecimal(value: number, digits = 1): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}

function formatPlainPercent(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value)
}

function formatCompactCurrency(value: number): string {
  if (Math.abs(value) >= 1000) return `$${Math.round(value / 1000)}k`
  return formatCurrency(value)
}

function getInitialState({
  monthlyPremium,
  monthlyBenefit,
  annualRateOfReturn,
  monthsWithoutIncome,
}: PremiumVsSelfInsuredModuleProps): PremiumVsSelfInsuredState {
  return {
    monthlyPremium: Math.max(100, roundToStep(monthlyPremium > 0 ? monthlyPremium : 450, 50)),
    monthlyBenefit: Math.max(1000, roundToStep(monthlyBenefit > 0 ? monthlyBenefit : 10000, 500)),
    annualRateOfReturn: Number.isFinite(annualRateOfReturn) && annualRateOfReturn >= 0 ? annualRateOfReturn : 0.06,
    monthsWithoutIncome: Math.min(60, Math.max(3, Math.round(monthsWithoutIncome > 0 ? monthsWithoutIncome : 12))),
  }
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  displayValue: string
  onChange: (value: number) => void
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-950/50 px-3 py-2.5">
      <span className="w-36 shrink-0 text-xs text-gray-400">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-gray-800 accent-brand-500 outline-none transition focus-visible:ring-2 focus-visible:ring-brand-500/50"
      />
      <span className="w-24 text-right font-mono text-xs font-semibold text-gray-100">{displayValue}</span>
    </label>
  )
}

function PremiumTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload as PremiumChartPoint
  return (
    <div className="min-w-60 rounded-xl border border-gray-700 bg-gray-950/95 p-3 text-xs shadow-2xl backdrop-blur">
      <p className="mb-2 font-semibold text-gray-100">Month {label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <span className="text-emerald-300">Self-insurance fund</span>
          <span className="font-mono text-gray-100">{formatCurrency(point["Self-Insurance Fund"])}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-orange-300">Benefit needed</span>
          <span className="font-mono text-gray-100">{formatCurrency(point["Benefit Needed"])}</span>
        </div>
        <div className="flex justify-between gap-4 border-t border-gray-800 pt-1.5">
          <span className="text-gray-400">Remaining gap</span>
          <span className={point.remainingGap > 0 ? "font-mono text-amber-300" : "font-mono text-emerald-300"}>
            {formatCurrency(point.remainingGap)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function PremiumVsSelfInsuredModule(props: PremiumVsSelfInsuredModuleProps) {
  const [values, setValues] = useState<PremiumVsSelfInsuredState>(() => getInitialState(props))

  useEffect(() => {
    setValues(getInitialState(props))
  }, [props.monthlyPremium, props.monthlyBenefit, props.annualRateOfReturn, props.monthsWithoutIncome])

  const result = useMemo(() => calculateBreakEven(values), [values])

  if (result.ok === false) {
    return (
      <div className="module-output-container">
        <Card className="border-red-800/60 bg-red-950/20">
          <CardContent className="flex items-start gap-3 p-4">
            <RiAlertLine className="mt-0.5 size-4 shrink-0 text-red-400" aria-hidden="true" />
            <p className="text-sm text-red-300">{result.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const premiumMax = Math.max(2000, roundToStep(values.monthlyPremium * 2, 50))
  const benefitMax = Math.max(20000, roundToStep(values.monthlyBenefit * 2, 500))
  const chartEndMonth = 240
  const chartData: PremiumChartPoint[] = result.schedule
    .filter((row) => row.month <= chartEndMonth)
    .map((row) => ({
      month: row.month,
      "Self-Insurance Fund": row.investmentBalance,
      "Benefit Needed": result.benefitsReceived,
      remainingGap: Math.max(result.benefitsReceived - row.investmentBalance, 0),
    }))
  const yearOneFund = result.schedule[11]?.investmentBalance ?? 0
  const yearOneGap = Math.max(result.benefitsReceived - yearOneFund, 0)
  const scenarioYears = [1, 2, 5, 10]
  const disabilityScenarios: DisabilityScenario[] = scenarioYears.map((year) => {
    const fund = result.schedule[Math.min(year * 12 - 1, result.schedule.length - 1)]?.investmentBalance ?? 0
    const covered = fund >= result.benefitsReceived
    const delta = Math.abs(result.benefitsReceived - fund)
    return {
      year,
      fund,
      covered,
      delta,
      label: covered ? "Covered" : "Short",
    }
  })

  return (
    <div className="module-output-container">
      <div className="space-y-4">
        <Card className="border-gray-800 bg-gray-900/25">
          <CardContent className="p-4">
            <div className="mb-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Policy Parameters</p>
              <p className="mt-1 text-sm text-gray-500">Move the sliders live with the client to compare policy protection against self-funding the same disability event.</p>
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              <SliderRow
                label="Monthly premium"
                min={100}
                max={premiumMax}
                step={50}
                value={values.monthlyPremium}
                displayValue={`${formatCurrency(values.monthlyPremium)}/mo`}
                onChange={(monthlyPremium) => setValues((current) => ({ ...current, monthlyPremium }))}
              />
              <SliderRow
                label="Monthly DI benefit"
                min={1000}
                max={benefitMax}
                step={500}
                value={values.monthlyBenefit}
                displayValue={`${formatCurrency(values.monthlyBenefit)}/mo`}
                onChange={(monthlyBenefit) => setValues((current) => ({ ...current, monthlyBenefit }))}
              />
              <SliderRow
                label="Disability duration"
                min={3}
                max={60}
                step={1}
                value={values.monthsWithoutIncome}
                displayValue={`${values.monthsWithoutIncome} months`}
                onChange={(monthsWithoutIncome) => setValues((current) => ({ ...current, monthsWithoutIncome }))}
              />
              <SliderRow
                label="Investment return"
                min={0.02}
                max={0.12}
                step={0.005}
                value={values.annualRateOfReturn}
                displayValue={formatPlainPercent(values.annualRateOfReturn)}
                onChange={(annualRateOfReturn) => setValues((current) => ({ ...current, annualRateOfReturn }))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_13rem]">
          <Card className="border-gray-800 bg-gray-900/25">
            <CardContent className="p-4">
              <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#1D9E75]" />Self-insurance fund</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#D85A30]" />Benefit needed</span>
              </div>
              <div className="chart-reveal h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                  <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      tickFormatter={(value) => (Number(value) % 24 === 0 ? `Yr ${Number(value) / 12}` : "")}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      width={52}
                      tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}
                    />
                    <Tooltip content={<PremiumTooltip />} cursor={{ stroke: "#475569", strokeDasharray: "4 4" }} />
                    {result.roundedBreakEvenMonths <= chartEndMonth ? (
                      <ReferenceLine
                        x={result.roundedBreakEvenMonths}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                        label={{ value: "Break-even", fill: "#fbbf24", fontSize: 11, position: "insideTopRight" }}
                      />
                    ) : null}
                    <Line
                      type="monotone"
                      dataKey="Self-Insurance Fund"
                      stroke="#1D9E75"
                      strokeWidth={2.5}
                      dot={false}
                      strokeDasharray="5 3"
                      activeDot={{ r: 4, stroke: "#a7f3d0", strokeWidth: 2, fill: "#1D9E75" }}
                      isAnimationActive
                      animationDuration={650}
                    />
                    <Line
                      type="monotone"
                      dataKey="Benefit Needed"
                      stroke="#D85A30"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={false}
                      isAnimationActive
                      animationDuration={650}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 rounded-r-xl border-l-4 border-[#D85A30] bg-gray-950/60 px-4 py-3 text-xs leading-5 text-gray-400">
                Policy pays <strong className="font-semibold text-gray-100">{formatCurrency(result.benefitsReceived)}</strong> starting day one. Self-insuring at the selected assumptions reaches the same amount around <strong className="font-semibold text-amber-300">year {formatDecimal(result.breakEvenYears, 1)}</strong>, leaving a <strong className="font-semibold text-gray-100">{formatCurrency(yearOneGap)}</strong> year-1 gap.
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Key Metrics</div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <Card className="border-gray-800 bg-gray-900/25"><CardContent className="p-3"><p className="text-lg font-semibold text-emerald-300">{formatCurrency(result.benefitsReceived)}</p><p className="text-[10px] text-gray-500">Benefits with insurance</p></CardContent></Card>
              <Card className="border-gray-800 bg-gray-900/25"><CardContent className="p-3"><p className="text-lg font-semibold text-gray-100">{formatCurrency(result.totalPremiumsToBreakEven)}</p><p className="text-[10px] text-gray-500">Premiums paid to break-even</p></CardContent></Card>
              <Card className="border-gray-800 bg-gray-900/25"><CardContent className="p-3"><p className="text-lg font-semibold text-[#D85A30]">{formatCurrency(yearOneGap)}</p><p className="text-[10px] text-gray-500">Self-insure gap at year 1</p></CardContent></Card>
              <Card className="border-gray-800 bg-gray-900/25"><CardContent className="p-3"><p className="text-lg font-semibold text-gray-100">Month {result.roundedBreakEvenMonths}</p><p className="text-[10px] text-gray-500">Break-even month</p></CardContent></Card>
            </div>
          </div>
        </div>

        <Card className="border-gray-800 bg-gray-900/25">
          <CardContent className="p-4">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">If disabled after...</p>
                <p className="mt-1 text-sm text-gray-500">How much of the modeled benefit need could be self-funded at each timing point.</p>
              </div>
              <div className="rounded-full border border-gray-800 bg-gray-950 px-3 py-1 text-[11px] font-semibold text-gray-400">
                Benefit need: <span className="text-gray-100">{formatCurrency(result.benefitsReceived)}</span>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {disabilityScenarios.map((scenario) => {
                const coveragePct = result.benefitsReceived > 0 ? Math.min((scenario.fund / result.benefitsReceived) * 100, 100) : 0
                return (
                  <div key={scenario.year} className="rounded-xl border border-gray-800 bg-gray-950/55 p-3">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-600">Year {scenario.year}</p>
                        <p className={`mt-1 text-sm font-semibold ${scenario.covered ? "text-emerald-300" : "text-[#D85A30]"}`}>{scenario.label}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-100">{scenario.covered ? "+" : "-"}{formatCompactCurrency(scenario.delta)}</p>
                        <p className="text-[10px] text-gray-600">{scenario.covered ? "surplus" : "gap"}</p>
                      </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                      <div
                        className={`h-full transition-all duration-500 ${scenario.covered ? "bg-[#1D9E75]" : "bg-[#D85A30]"}`}
                        style={{ width: `${coveragePct}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
                      <span>Self-funded</span>
                      <span className="font-mono text-gray-300">{formatCompactCurrency(scenario.fund)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
