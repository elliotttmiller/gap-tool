import { useEffect, useMemo, useState } from "react"
import { RiAlertLine } from "@remixicon/react"
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { ModuleMetricCard } from "@/features/risk-modules/core/ModuleMetricCard"
import { calculateBreakEven } from "./calculateBreakEven"
import type { DisabilityInputs } from "../types"

interface PremiumVsSelfInsuredModuleProps {
  monthlyPremium: number
  monthlyBenefit: number
  annualRateOfReturn: number
  monthsWithoutIncome: number
  inputs?: DisabilityInputs
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
  lowerBound: number
  dangerZone: number
  safetyZone: number
  remainingGap: number
}

type HighlightMetric = "benefits" | "breakeven" | "none"

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
  helperText,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  displayValue: string
  onChange: (value: number) => void
  helperText?: string
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950/50 px-3 py-2.5">
      <label className="flex items-center gap-3">
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
      {helperText ? <p className="mt-1.5 pl-[9.2rem] text-[11px] leading-snug text-slate-500">{helperText}</p> : null}
    </div>
  )
}

function PremiumTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload as PremiumChartPoint
  const month = Number(label ?? point.month)
  const year = month / 12
  return (
    <div className="min-w-60 rounded-xl border border-gray-700 bg-gray-950/95 p-3 text-xs shadow-2xl backdrop-blur">
      <p className="mb-2 font-semibold text-gray-100">Year {formatDecimal(year, 1)} (Month {month})</p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <span className="text-emerald-400">Self-insurance fund</span>
          <span className="font-mono text-gray-100">{formatCurrency(point["Self-Insurance Fund"])}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-rose-400">Benefit needed</span>
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
  const [highlightMetric, setHighlightMetric] = useState<HighlightMetric>("none")

  useEffect(() => {
    setValues(getInitialState(props))
  }, [props.monthlyPremium, props.monthlyBenefit, props.annualRateOfReturn, props.monthsWithoutIncome])

  useEffect(() => {
    if (highlightMetric === "none") return
    const timeoutId = window.setTimeout(() => setHighlightMetric("none"), 700)
    return () => window.clearTimeout(timeoutId)
  }, [highlightMetric])

  const result = useMemo(() => calculateBreakEven(values), [values])

  // Derive retirement age from benefit period (A65/A67/A70) or fall back to retirementAge input.
  const currentAge = props.inputs?.currentAge ?? 0
  const benefitPeriod = props.inputs?.privateDiBenefitPeriod ?? ""
  const retirementAge = benefitPeriod === "A65" ? 65
    : benefitPeriod === "A67" ? 67
    : benefitPeriod === "A70" ? 70
    : props.inputs?.retirementAge ?? 65
  const yearsToRetirement = Math.max(retirementAge - currentAge, 0)

  // Card A: FV of investing the monthly premium until retirement at the slider's rate of return.
  // Using FV of annuity: PMT * [((1 + r/12)^n - 1) / (r/12)]
  const monthlyRate = values.annualRateOfReturn / 12
  const nMonths = yearsToRetirement * 12
  const investedPremiumFV = monthlyRate > 0
    ? values.monthlyPremium * ((Math.pow(1 + monthlyRate, nMonths) - 1) / monthlyRate)
    : values.monthlyPremium * nMonths

  // Card B: FV ÷ monthly premium = how many months of benefit the fund could cover.
  const monthsOfCoverage = values.monthlyPremium > 0 ? investedPremiumFV / values.monthlyBenefit : 0

  // Card C: months ÷ 12 = years of disability coverage.
  const yearsOfCoverage = monthsOfCoverage / 12

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
  const durationEndMonth = Math.min(values.monthsWithoutIncome, chartEndMonth)
  const chartData: PremiumChartPoint[] = result.schedule
    .filter((row) => row.month <= chartEndMonth)
    .map((row) => ({
      month: row.month,
      "Self-Insurance Fund": row.investmentBalance,
      "Benefit Needed": result.benefitsReceived,
      lowerBound: Math.min(row.investmentBalance, result.benefitsReceived),
      dangerZone: Math.max(result.benefitsReceived - row.investmentBalance, 0),
      safetyZone: Math.max(row.investmentBalance - result.benefitsReceived, 0),
      remainingGap: Math.max(result.benefitsReceived - row.investmentBalance, 0),
    }))
  const yearOneFund = result.schedule[11]?.investmentBalance ?? 0
  const netInsuranceCostAtBreakEven = result.totalPremiumsToBreakEven - result.benefitsReceived
  const insuranceWinsBeforeYear = result.breakEvenYears

  function handleSliderChange(
    key: keyof PremiumVsSelfInsuredState,
    value: number,
    metricToHighlight: HighlightMetric = "none",
  ) {
    setValues((current) => ({ ...current, [key]: value }))
    setHighlightMetric(metricToHighlight)
  }

  const metricPulseClass = "transition-all duration-300 ring-1 ring-transparent"
  const benefitsPulseClass = highlightMetric === "benefits"
    ? "animate-pulse ring-emerald-500/70 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]"
    : ""
  const breakEvenPulseClass = highlightMetric === "breakeven"
    ? "animate-pulse ring-amber-500/70 shadow-[0_0_0_1px_rgba(245,158,11,0.35)]"
    : ""

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
                onChange={(monthlyPremium) => handleSliderChange("monthlyPremium", monthlyPremium, "breakeven")}
              />
              <SliderRow
                label="Monthly DI benefit"
                min={1000}
                max={benefitMax}
                step={500}
                value={values.monthlyBenefit}
                displayValue={`${formatCurrency(values.monthlyBenefit)}/mo`}
                onChange={(monthlyBenefit) => handleSliderChange("monthlyBenefit", monthlyBenefit, "benefits")}
              />
              <SliderRow
                label="Disability duration"
                min={3}
                max={60}
                step={1}
                value={values.monthsWithoutIncome}
                displayValue={`${values.monthsWithoutIncome} months`}
                onChange={(monthsWithoutIncome) => handleSliderChange("monthsWithoutIncome", monthsWithoutIncome, "benefits")}
                helperText="~30% of disabilities exceed 12 months."
              />
              <SliderRow
                label="Investment return"
                min={0.02}
                max={0.12}
                step={0.005}
                value={values.annualRateOfReturn}
                displayValue={formatPlainPercent(values.annualRateOfReturn)}
                onChange={(annualRateOfReturn) => handleSliderChange("annualRateOfReturn", annualRateOfReturn, "breakeven")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="flex flex-col gap-3">
            <Card className="border-gray-800 bg-gray-900/25">
              <CardContent className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400">
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-400" />Self-insurance fund</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-rose-500" />Benefit needed</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-rose-500/30" />Risk zone</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-cyan-400/25" />Surplus zone</span>
                </div>
                <div className="chart-reveal h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                      <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="month"
                        type="number"
                        domain={[0, chartEndMonth]}
                        tick={{ fill: "#64748b", fontSize: 10 }}
                        tickLine={{ stroke: "#1f2937" }}
                        axisLine={{ stroke: "#1f2937" }}
                        ticks={Array.from({ length: Math.floor(chartEndMonth / 12) + 1 }, (_, i) => i * 12).filter((m) => m % 24 === 0)}
                        tickFormatter={(value) => `Yr ${Number(value) / 12}`}
                      />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        width={52}
                        tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}
                      />
                      <Tooltip content={<PremiumTooltip />} cursor={{ stroke: "#475569", strokeDasharray: "4 4" }} />
                      {durationEndMonth > 0 ? (
                        <ReferenceArea
                          x1={0}
                          x2={durationEndMonth}
                          fill="#0f172a"
                          fillOpacity={0.35}
                          ifOverflow="extendDomain"
                        />
                      ) : null}
                      <Area
                        type="monotone"
                        dataKey="lowerBound"
                        stackId="risk-zone"
                        stroke="none"
                        fill="transparent"
                        isAnimationActive
                        animationDuration={650}
                        animationEasing="ease-out"
                      />
                      <Area
                        type="monotone"
                        dataKey="dangerZone"
                        stackId="risk-zone"
                        stroke="none"
                        fill="#f43f5e"
                        fillOpacity={0.2}
                        isAnimationActive
                        animationDuration={650}
                        animationEasing="ease-out"
                      />
                      <Area
                        type="monotone"
                        dataKey="safetyZone"
                        stackId="risk-zone"
                        stroke="none"
                        fill="#22d3ee"
                        fillOpacity={0.15}
                        isAnimationActive
                        animationDuration={650}
                        animationEasing="ease-out"
                      />
                      {durationEndMonth > 0 ? (
                        <>
                          <ReferenceLine
                            x={0}
                            stroke="#60a5fa"
                            strokeDasharray="3 3"
                            label={{ value: "Disability starts", fill: "#93c5fd", fontSize: 10, position: "insideTopLeft" }}
                          />
                          <ReferenceLine
                            x={durationEndMonth}
                            stroke="#60a5fa"
                            strokeDasharray="3 3"
                            label={{ value: "Disability ends", fill: "#93c5fd", fontSize: 10, position: "insideTopRight" }}
                          />
                        </>
                      ) : null}
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
                        stroke="#34d399"
                        strokeWidth={2.5}
                        dot={false}
                        strokeDasharray="5 3"
                        activeDot={{ r: 4, stroke: "#6ee7b7", strokeWidth: 2, fill: "#34d399" }}
                        isAnimationActive
                        animationDuration={650}
                        animationEasing="ease-out"
                      />
                      <Line
                        type="monotone"
                        dataKey="Benefit Needed"
                        stroke="#f43f5e"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={false}
                        isAnimationActive
                        animationDuration={650}
                        animationEasing="ease-out"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-3">
              <ModuleMetricCard
                label={`Premium invested to age ${retirementAge}`}
                value={formatCurrency(investedPremiumFV)}
                description={`${yearsToRetirement} yrs · ${formatCurrency(values.monthlyPremium)}/mo · ${formatPlainPercent(values.annualRateOfReturn)} return`}
                accent="green"
              />
              <ModuleMetricCard
                label="Months of disability funded"
                value={<>{formatDecimal(monthsOfCoverage, 1)} <span className="text-sm font-normal text-slate-400">months</span></>}
                description={`Fund value ÷ ${formatCurrency(values.monthlyBenefit)}/mo benefit`}
                accent="blue"
              />
              <ModuleMetricCard
                label="Years of disability funded"
                value={<>{formatDecimal(yearsOfCoverage, 1)} <span className="text-sm font-normal text-slate-400">years</span></>}
                description="Months of coverage ÷ 12"
                accent="cyan"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Key Metrics</div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <ModuleMetricCard
                label="Benefits with insurance"
                value={formatCurrency(result.benefitsReceived)}
                description="Monthly DI benefit × disability duration"
                accent="green"
                className={`${metricPulseClass} ${benefitsPulseClass}`}
              />
              <ModuleMetricCard
                label="Insurance wins if disabled before"
                value={`Yr ${formatDecimal(insuranceWinsBeforeYear, 1)}`}
                description={`≈ Month ${result.roundedBreakEvenMonths} break-even point`}
                accent="amber"
                className={`${metricPulseClass} ${breakEvenPulseClass}`}
              />
              <ModuleMetricCard
                label="Net insurance cost @ break-even"
                value={formatCurrency(netInsuranceCostAtBreakEven)}
                description="Total premiums to break-even − benefits received"
                accent={netInsuranceCostAtBreakEven > 0 ? "red" : "green"}
                className={`${metricPulseClass} ${breakEvenPulseClass}`}
              />
              <ModuleMetricCard label="Break-even month" value={`Month ${result.roundedBreakEvenMonths}`} description="Break-even years × 12 months" accent="slate" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
