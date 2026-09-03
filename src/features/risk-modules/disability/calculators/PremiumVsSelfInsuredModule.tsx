import { useEffect, useMemo, useState, type CSSProperties } from "react"
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
import { financialBarChartTheme } from "@/components/charts/financialBarChartTheme"
import { calculateBreakEven } from "./calculateBreakEven"
import type { DisabilityInputs } from "../types"

interface PremiumVsSelfInsuredModuleProps {
  monthlyPremium: number
  monthlyBenefit: number
  annualRateOfReturn: number
  monthsWithoutIncome: number
  benefitColaRate?: number
  mode?: "builder" | "presentation"
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
  remainingGap: number
}

type HighlightMetric = "benefits" | "breakeven" | "none"

function buildChartYearTicks(endMonth: number): number[] {
  const totalYears = endMonth / 12
  const step = totalYears <= 12 ? 1 : totalYears <= 25 ? 2 : totalYears <= 50 ? 5 : 10
  const ticks: number[] = []
  for (let yr = 0; yr * 12 <= endMonth; yr += step) ticks.push(yr * 12)
  return ticks
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
  const progress = ((value - min) / Math.max(max - min, Number.EPSILON)) * 100

  return (
    <div className="premium-slider-row rounded-xl border border-[#cbdadd] bg-[#f8fbfb] px-3 py-2.5 shadow-[0_1px_2px_rgba(15,42,58,0.05)] dark:border-[#59616b] dark:bg-[#343a42] dark:shadow-[0_5px_14px_rgba(0,0,0,0.14)]">
      <div className="grid grid-cols-[minmax(7.75rem,8.75rem)_minmax(0,1fr)_max-content] items-center gap-x-3 gap-y-1.5">
        <span className="truncate text-xs font-medium text-[#415b6d] dark:text-[#d9e1e5]">{label}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(event) => onChange(Number(event.target.value))}
          style={{ "--slider-progress": `${progress}%` } as CSSProperties}
          className="premium-slider-control h-2 w-full min-w-0 cursor-pointer appearance-none rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-[#1db8b9]/45 focus-visible:ring-offset-2"
        />
        <span className="w-27 text-right font-mono text-xs font-semibold tabular-nums text-[#102a3a] dark:text-[#f7fafb]">{displayValue}</span>
        {helperText ? <p className="col-start-2 col-end-4 text-[11px] leading-snug text-[#607583] dark:text-[#b5c1c8]">{helperText}</p> : null}
      </div>
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
          <span className="text-red-400">Benefit needed</span>
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
  const mode = props.mode ?? "builder"
  const isPresentationMode = mode === "presentation"
  const animateChart = !isPresentationMode
  const [values, setValues] = useState<PremiumVsSelfInsuredState>(() => getInitialState(props))
  const [highlightMetric, setHighlightMetric] = useState<HighlightMetric>("none")
  const benefitColaRate = Number.isFinite(props.benefitColaRate) ? Math.max(0, props.benefitColaRate ?? 0) : 0

  useEffect(() => {
    setValues(getInitialState(props))
  }, [props.monthlyPremium, props.monthlyBenefit, props.annualRateOfReturn, props.monthsWithoutIncome])

  useEffect(() => {
    if (highlightMetric === "none") return
    const timeoutId = window.setTimeout(() => setHighlightMetric("none"), 700)
    return () => window.clearTimeout(timeoutId)
  }, [highlightMetric])

  const result = useMemo(() => calculateBreakEven({ ...values, colaRate: benefitColaRate }), [values, benefitColaRate])

  const currentAge = props.inputs?.currentAge ?? 0
  const benefitPeriod = props.inputs?.privateDiBenefitPeriod ?? ""
  const retirementAge = benefitPeriod === "A65" ? 65
    : benefitPeriod === "A67" ? 67
    : benefitPeriod === "A70" ? 70
    : props.inputs?.retirementAge ?? 65
  const yearsToRetirement = Math.max(retirementAge - currentAge, 0)

  const monthlyRate = values.annualRateOfReturn / 12
  const nMonths = yearsToRetirement * 12
  const investedPremiumFV = monthlyRate > 0
    ? values.monthlyPremium * ((Math.pow(1 + monthlyRate, nMonths) - 1) / monthlyRate)
    : values.monthlyPremium * nMonths
  const monthsOfCoverage = values.monthlyBenefit > 0 ? investedPremiumFV / values.monthlyBenefit : 0
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
  const MIN_CHART_YEARS = 10
  const breakEvenPaddedYears = Math.ceil((result.roundedBreakEvenMonths / 12) * 1.3)
  const chartEndYears = Math.max(MIN_CHART_YEARS, yearsToRetirement, breakEvenPaddedYears)
  const chartEndMonth = Math.min(chartEndYears * 12, 1200)
  const durationEndMonth = Math.min(values.monthsWithoutIncome, chartEndMonth)
  const breakEvenMonth = Math.min(result.roundedBreakEvenMonths, chartEndMonth)

  const chartData: PremiumChartPoint[] = result.schedule
    .filter((row) => row.month <= chartEndMonth)
    .map((row) => ({
      month: row.month,
      "Self-Insurance Fund": row.investmentBalance,
      "Benefit Needed": result.benefitsReceived,
      remainingGap: Math.max(result.benefitsReceived - row.investmentBalance, 0),
    }))

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

  const eventLabelColor = isPresentationMode ? "#607583" : "#7896a5"
  const eventLabelFontSize = isPresentationMode ? 11 : 10
  const eventStartLabel = isPresentationMode ? "Event starts" : "Disability starts"
  const eventEndLabel = isPresentationMode ? "Event ends" : "Disability ends"

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
                <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[#607583] dark:text-[#aebdc5]">
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#188a89] ring-2 ring-[#1db8b9]/20" />Self-insurance fund</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#f15a29]" />Benefit needed</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#f15a29]/25 ring-1 ring-[#f15a29]/35" />Before break-even</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#1db8b9]/20 ring-1 ring-[#188a89]/35" />After break-even</span>
                </div>

                <div className="chart-reveal h-60 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%" debounce={80}>
                    <ComposedChart data={chartData} margin={{ top: 12, right: 18, left: 8, bottom: 8 }}>
                      <defs>
                        <linearGradient id="selfInsuranceFundFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1db8b9" stopOpacity={0.34} />
                          <stop offset="48%" stopColor="#188a89" stopOpacity={0.14} />
                          <stop offset="100%" stopColor="#188a89" stopOpacity={0.015} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid stroke="#91a5ae" strokeOpacity={0.22} strokeDasharray="2 5" vertical={false} />
                      <XAxis
                        dataKey="month"
                        type="number"
                        domain={[0, chartEndMonth]}
                        tick={{ fill: "#607583", fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: "#8da3ad", strokeOpacity: 0.75 }}
                        ticks={buildChartYearTicks(chartEndMonth)}
                        tickFormatter={(value) => `Yr ${Number(value) / 12}`}
                      />
                      <YAxis
                        tick={{ fill: "#607583", fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: "#8da3ad", strokeOpacity: 0.75 }}
                        width={52}
                        tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}
                      />

                      <Tooltip
                        content={<PremiumTooltip />}
                        cursor={{ stroke: "#8da3ad", strokeWidth: 1, strokeDasharray: "3 4", strokeOpacity: 0.7 }}
                      />

                      {breakEvenMonth > 0 ? (
                        <ReferenceArea
                          x1={0}
                          x2={breakEvenMonth}
                          fill="#f15a29"
                          fillOpacity={0.025}
                          ifOverflow="hidden"
                        />
                      ) : null}

                      {result.roundedBreakEvenMonths < chartEndMonth ? (
                        <ReferenceArea
                          x1={result.roundedBreakEvenMonths}
                          x2={chartEndMonth}
                          fill="#1db8b9"
                          fillOpacity={0.035}
                          ifOverflow="hidden"
                        />
                      ) : null}

                      {durationEndMonth > 0 ? (
                        <ReferenceArea
                          x1={0}
                          x2={durationEndMonth}
                          fill="#64748b"
                          fillOpacity={0.055}
                          ifOverflow="hidden"
                        />
                      ) : null}

                      <Area
                        type="monotone"
                        dataKey="Self-Insurance Fund"
                        stroke="none"
                        fill="url(#selfInsuranceFundFill)"
                        isAnimationActive={animateChart}
                        animationDuration={financialBarChartTheme.animation.duration}
                        animationEasing={financialBarChartTheme.animation.easing}
                      />

                      {durationEndMonth > 0 ? (
                        <>
                          <ReferenceLine
                            x={0}
                            stroke="#7896a5"
                            strokeOpacity={0.55}
                            strokeDasharray="3 4"
                            label={{ value: eventStartLabel, fill: eventLabelColor, fontSize: eventLabelFontSize, position: "insideTopLeft" }}
                          />
                          <ReferenceLine
                            x={durationEndMonth}
                            stroke="#7896a5"
                            strokeOpacity={0.55}
                            strokeDasharray="3 4"
                            label={{ value: eventEndLabel, fill: eventLabelColor, fontSize: eventLabelFontSize, position: "insideTopRight" }}
                          />
                        </>
                      ) : null}

                      {result.roundedBreakEvenMonths <= chartEndMonth ? (
                        <ReferenceLine
                          x={result.roundedBreakEvenMonths}
                          stroke="#f15a29"
                          strokeWidth={1.5}
                          strokeDasharray="5 5"
                          label={{ value: "Break-even", fill: "#f15a29", fontSize: 11, position: "insideTopRight" }}
                        />
                      ) : null}

                      <Line
                        type="monotone"
                        dataKey="Self-Insurance Fund"
                        stroke="#188a89"
                        strokeWidth={2.75}
                        dot={false}
                        activeDot={{ r: 4.5, stroke: "#ffffff", strokeWidth: 2, fill: "#1db8b9" }}
                        isAnimationActive={animateChart}
                        animationBegin={financialBarChartTheme.animation.staggerMs}
                        animationDuration={financialBarChartTheme.animation.duration}
                        animationEasing={financialBarChartTheme.animation.easing}
                      />
                      <Line
                        type="monotone"
                        dataKey="Benefit Needed"
                        stroke="#f15a29"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={false}
                        isAnimationActive={animateChart}
                        animationBegin={financialBarChartTheme.animation.staggerMs * 2}
                        animationDuration={financialBarChartTheme.animation.duration}
                        animationEasing={financialBarChartTheme.animation.easing}
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
                accent="primary"
              />
              <ModuleMetricCard
                label="Months of disability funded"
                value={<>{formatDecimal(monthsOfCoverage, 1)} <span className="text-sm font-normal text-slate-400">months</span></>}
                description={`Fund value ÷ ${formatCurrency(values.monthlyBenefit)}/mo benefit`}
                accent="primary"
              />
              <ModuleMetricCard
                label="Years of disability funded"
                value={<>{formatDecimal(yearsOfCoverage, 1)} <span className="text-sm font-normal text-slate-400">years</span></>}
                description="Months of coverage ÷ 12"
                accent="primary"
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
                accent="primary"
                className={`${metricPulseClass} ${benefitsPulseClass}`}
              />
              <ModuleMetricCard
                label="Insurance wins if disabled before"
                value={`Year ${formatDecimal(insuranceWinsBeforeYear, 1)}`}
                description={`≈ Month ${result.roundedBreakEvenMonths} break-even point`}
                accent="warning"
                className={`${metricPulseClass} ${breakEvenPulseClass}`}
              />
              <ModuleMetricCard
                label="Break-even month"
                value={`Month ${result.roundedBreakEvenMonths}`}
                description="Break-even years × 12 months"
                accent="neutral"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
