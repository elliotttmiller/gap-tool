import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, BriefcaseBusiness, FileDown, HeartPulse, Scale, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemedSelect } from "@/components/ThemedSelect"
import { ReportCoverPage } from "@/components/reporting/ReportCoverPage"
import { LifeOutputView } from "@/features/risk-modules/life/components/LifeOutputView"
import { calculateLifeInsuranceGap } from "@/features/risk-modules/life/calculations/calculateLifeInsuranceGap"
import { calculateIncomeGapScenarios } from "@/features/risk-modules/life/calculations/calculateIncomeGapScenarios"
import { sanitizeLifeInputs } from "@/features/risk-modules/life/utils/sanitizeLifeInputs"
import { DisabilityOutputView } from "@/features/risk-modules/disability/components/DisabilityOutputView"
import { calculateDisabilityGap } from "@/features/risk-modules/disability/calculations/calculateDisabilityGap"
import type { DiBenefitPeriod } from "@/features/risk-modules/disability/types"
import { UnemploymentOutputView } from "@/features/risk-modules/unemployment/components/UnemploymentOutputView"
import { calculateUnemploymentGap } from "@/features/risk-modules/unemployment/calculations/calculateUnemploymentGap"
import { LiabilityOutputView } from "@/features/risk-modules/liability/components/LiabilityOutputView"
import { calculateLiabilityGap } from "@/features/risk-modules/liability/calculations/calculateLiabilityGap"
import { RiskModuleType, ScenarioModuleRecords, useAppStore } from "@/lib/store"
import { formatGapCurrency } from "@/lib/scenarioMetrics"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { formatGroupedNumberInput, normalizeGroupedNumberInput } from "@/lib/numberInput"
import "@/styles/print.css"

const moduleCopy: Record<RiskModuleType, { title: string; tabLabel: string }> = {
  life: { title: "Premature Death - Protection Gap", tabLabel: "Life" },
  disability: { title: "Disability / Illness - Income Collapse", tabLabel: "Disability" },
  unemployment: { title: "Liquidity & Unemployment Risk", tabLabel: "Unemployment" },
  liability: { title: "Liability / Lawsuit - Asset Exposure", tabLabel: "Liability" },
}

const moduleIcons: Record<RiskModuleType, React.ComponentType<{ className?: string }>> = {
  life: HeartPulse,
  disability: ShieldAlert,
  unemployment: BriefcaseBusiness,
  liability: Scale,
}

type LifeVisualization = "safe" | "runway"
type DisabilityVisualization = "incomeGap" | "premiumVsSelfInsured" | "jobComparison" | "assetComparison"

interface ReportSection {
  key: string
  module: RiskModuleType
  title: string
  lifeVisualization?: LifeVisualization
  disabilityVisualization?: DisabilityVisualization
}

const presentationModuleTabClasses: Record<RiskModuleType, { active: string; inactive: string }> = {
  life: {
    active: "bg-[#1db8b9] text-white shadow-sm ring-1 ring-[#1db8b9]",
    inactive: "text-gray-400 hover:bg-[#1db8b9]/15 hover:text-[#1db8b9]",
  },
  liability: {
    active: "bg-[#27aae1] text-white shadow-sm ring-1 ring-[#27aae1]",
    inactive: "text-gray-400 hover:bg-[#27aae1]/15 hover:text-[#27aae1]",
  },
  unemployment: {
    active: "bg-[#f15a29] text-white shadow-sm ring-1 ring-[#f15a29]",
    inactive: "text-gray-400 hover:bg-[#f15a29]/15 hover:text-[#f15a29]",
  },
  disability: {
    active: "bg-[#44b649] text-white shadow-sm ring-1 ring-[#44b649]",
    inactive: "text-gray-400 hover:bg-[#44b649]/15 hover:text-[#44b649]",
  },
}

const moduleGapLabels: Record<RiskModuleType, string> = {
  life: "Remaining protection gap",
  disability: "Modeled income gap",
  unemployment: "Uncovered liquidity shortfall",
  liability: "Unprotected liability exposure",
}

function ReportModeledGap({ module, value }: { module: RiskModuleType; value?: number }) {
  const hasGap = typeof value === "number" && value > 0
  const isCalculated = typeof value === "number"
  const stateClass = !isCalculated
    ? "report-modeled-gap--neutral"
    : hasGap
      ? "report-modeled-gap--shortfall"
      : "report-modeled-gap--covered"

  return (
    <div className={`report-modeled-gap ${stateClass}`}>
      <div className="report-modeled-gap-copy">
        <span className="report-modeled-gap-eyebrow">Primary modeled outcome</span>
        <span className="report-modeled-gap-label">{moduleGapLabels[module]}</span>
      </div>
      <strong className="report-modeled-gap-value">{formatGapCurrency(value)}</strong>
      <span className="report-modeled-gap-status">
        {!isCalculated ? "Calculation unavailable" : hasGap ? "Remaining modeled need" : "Modeled need covered"}
      </span>
    </div>
  )
}

type InputSpec = {
  label: string
  value: string
  field: string
  editor: "currency" | "number" | "percent" | "select"
  rawValue: number | string | boolean
  options?: Array<{ value: string; label: string }>
}

type InputSpecVariant = "block" | "rail"

function getPresentationInputSpecs(module: RiskModuleType, records: ScenarioModuleRecords): InputSpec[] {
  if (module === "life" && records.life) {
    const inputs = records.life.inputs
    return [
      { label: "Annual Income", value: formatCurrency(inputs.annualIncome), field: "annualIncome", editor: "currency", rawValue: inputs.annualIncome },
      { label: "Current Age", value: String(inputs.currentAge), field: "currentAge", editor: "number", rawValue: inputs.currentAge },
      { label: "Retirement Age", value: String(inputs.retirementAge), field: "retirementAge", editor: "number", rawValue: inputs.retirementAge },
      { label: "Income Replacement Ratio", value: formatPercent(inputs.incomeReplacementRatio), field: "incomeReplacementRatio", editor: "percent", rawValue: inputs.incomeReplacementRatio },
      { label: "Group Life Coverage", value: formatCurrency(inputs.groupLifeCoverage), field: "groupLifeCoverage", editor: "currency", rawValue: inputs.groupLifeCoverage },
      { label: "Private Life Coverage", value: formatCurrency(inputs.privateLifeCoverage), field: "privateLifeCoverage", editor: "currency", rawValue: inputs.privateLifeCoverage },
    ]
  }

  if (module === "disability" && records.disability) {
    const inputs = records.disability.inputs
    const periodLabel = inputs.privateDiBenefitPeriod
      ? ({
          "2y": "2 years",
          "5y": "5 years",
          "10y": "10 years",
          A65: "To age 65",
          A67: "To age 67",
          A70: "To age 70",
        } as const)[inputs.privateDiBenefitPeriod]
      : "Until retirement"
    return [
      { label: "Annual Income", value: formatCurrency(inputs.annualEarnedIncome), field: "annualEarnedIncome", editor: "currency", rawValue: inputs.annualEarnedIncome },
      { label: "Current Age", value: String(inputs.currentAge), field: "currentAge", editor: "number", rawValue: inputs.currentAge },
      { label: "Retirement Age", value: String(inputs.retirementAge), field: "retirementAge", editor: "number", rawValue: inputs.retirementAge },
      { label: "LTD Coverage", value: formatPercent(inputs.ltdCoveragePercent), field: "ltdCoveragePercent", editor: "percent", rawValue: inputs.ltdCoveragePercent },
      { label: "LTD Monthly Cap", value: formatCurrency(inputs.ltdMonthlyCap), field: "ltdMonthlyCap", editor: "currency", rawValue: inputs.ltdMonthlyCap },
      { label: "LTD Taxable", value: inputs.ltdTaxable ? "Yes (70% net assumption)" : "No", field: "ltdTaxable", editor: "select", rawValue: String(inputs.ltdTaxable), options: [{ value: "true", label: "Yes (70% net)" }, { value: "false", label: "No" }] },
      { label: "Individual DI Benefit", value: `${formatCurrency(inputs.privateDiBenefitMonthly)}/mo`, field: "privateDiBenefitMonthly", editor: "currency", rawValue: inputs.privateDiBenefitMonthly },
      { label: "DI Benefit Period", value: periodLabel, field: "privateDiBenefitPeriod", editor: "select", rawValue: inputs.privateDiBenefitPeriod, options: [{ value: "", label: "Until retirement" }, { value: "2y", label: "2 years" }, { value: "5y", label: "5 years" }, { value: "10y", label: "10 years" }, { value: "A65", label: "To age 65" }, { value: "A67", label: "To age 67" }, { value: "A70", label: "To age 70" }] },
    ]
  }

  if (module === "unemployment" && records.unemployment) {
    const inputs = records.unemployment.inputs
    return [
      { label: "Annual Income", value: formatCurrency(inputs.annualIncome), field: "annualIncome", editor: "currency", rawValue: inputs.annualIncome },
      { label: "Spouse Income", value: formatCurrency(inputs.spouseIncome), field: "spouseIncome", editor: "currency", rawValue: inputs.spouseIncome },
      { label: "Monthly Expenses", value: formatCurrency(inputs.monthlyExpenses), field: "monthlyExpenses", editor: "currency", rawValue: inputs.monthlyExpenses },
      { label: "Emergency Savings", value: formatCurrency(inputs.emergencySavings), field: "emergencySavings", editor: "currency", rawValue: inputs.emergencySavings },
      { label: "Net Income Proxy", value: formatPercent(inputs.netIncomeRatio ?? 0.65), field: "netIncomeRatio", editor: "percent", rawValue: inputs.netIncomeRatio ?? 0.65 },
      { label: "Monthly Severance", value: formatCurrency(inputs.severanceMonthly), field: "severanceMonthly", editor: "currency", rawValue: inputs.severanceMonthly },
      { label: "Severance Duration", value: `${inputs.severanceDurationMonths} months`, field: "severanceDurationMonths", editor: "number", rawValue: inputs.severanceDurationMonths },
      { label: "Unemployment Benefit", value: formatCurrency(inputs.unemploymentBenefitMonthly), field: "unemploymentBenefitMonthly", editor: "currency", rawValue: inputs.unemploymentBenefitMonthly },
      { label: "Benefit Duration", value: `${inputs.unemploymentBenefitDurationMonths} months`, field: "unemploymentBenefitDurationMonths", editor: "number", rawValue: inputs.unemploymentBenefitDurationMonths },
      { label: "Search Duration", value: `${inputs.estimatedJobSearchMonths} months`, field: "estimatedJobSearchMonths", editor: "number", rawValue: inputs.estimatedJobSearchMonths },
    ]
  }

  if (module === "liability" && records.liability) {
    const inputs = records.liability.inputs
    return [
      { label: "Primary Annual Income", value: formatCurrency(inputs.annualIncome ?? 0), field: "annualIncome", editor: "currency", rawValue: inputs.annualIncome ?? 0 },
      { label: "Primary Current Age", value: String(inputs.currentAge ?? 0), field: "currentAge", editor: "number", rawValue: inputs.currentAge ?? 0 },
      { label: "Secondary Annual Income", value: formatCurrency(inputs.spouseAnnualIncome ?? 0), field: "spouseAnnualIncome", editor: "currency", rawValue: inputs.spouseAnnualIncome ?? 0 },
      { label: "Secondary Current Age", value: String(inputs.spouseCurrentAge ?? 0), field: "spouseCurrentAge", editor: "number", rawValue: inputs.spouseCurrentAge ?? 0 },
      { label: "Projection End Age", value: String(inputs.retirementAge ?? 0), field: "retirementAge", editor: "number", rawValue: inputs.retirementAge ?? 0 },
      { label: "Garnishment Rate", value: formatPercent(inputs.garnishmentRate ?? 0), field: "garnishmentRate", editor: "percent", rawValue: inputs.garnishmentRate ?? 0 },
      { label: "Income Growth Rate", value: formatPercent(inputs.incomeGrowthRate ?? 0), field: "incomeGrowthRate", editor: "percent", rawValue: inputs.incomeGrowthRate ?? 0 },
      { label: "Auto Liability Limit", value: formatCurrency(inputs.autoLiabilityLimit), field: "autoLiabilityLimit", editor: "currency", rawValue: inputs.autoLiabilityLimit },
      { label: "Existing Umbrella", value: formatCurrency(inputs.umbrellaCoverage), field: "umbrellaCoverage", editor: "currency", rawValue: inputs.umbrellaCoverage },
      { label: "Home Equity", value: formatCurrency(inputs.homeEquity ?? 0), field: "homeEquity", editor: "currency", rawValue: inputs.homeEquity ?? 0 },
      { label: "Investment / Taxable", value: formatCurrency(inputs.investmentAssets), field: "investmentAssets", editor: "currency", rawValue: inputs.investmentAssets },
      { label: "Business Ownership", value: formatCurrency(inputs.businessOwnershipValue ?? 0), field: "businessOwnershipValue", editor: "currency", rawValue: inputs.businessOwnershipValue ?? 0 },
      { label: "Liquid Savings", value: formatCurrency(inputs.savingsAssets), field: "savingsAssets", editor: "currency", rawValue: inputs.savingsAssets },
    ]
  }

  return []
}

function SnapshotNumberInput({ label, value, onCommit, percent = false, currency = false, compact = false, className = "mt-1" }: {
  label: string
  value: number
  onCommit: (value: number) => void
  percent?: boolean
  currency?: boolean
  compact?: boolean
  className?: string
}) {
  const displayValue = percent ? value * 100 : value
  const [draft, setDraft] = useState(String(displayValue))
  const [isEditingNumber, setIsEditingNumber] = useState(false)
  const focused = useRef(false)
  const renderedDraft = currency && !isEditingNumber ? formatGroupedNumberInput(draft) : draft

  useEffect(() => {
    if (!focused.current) setDraft(String(percent ? value * 100 : value))
  }, [percent, value])

  return (
    <div className={`relative ${className}`}>
      {currency ? <span className={`presentation-input-affix absolute left-2 top-1/2 -translate-y-1/2 ${compact ? "text-[10px]" : "text-xs"}`}>$</span> : null}
      <input
        aria-label={label}
        type={currency ? "text" : "number"}
        inputMode="decimal"
        min={0}
        step={percent ? 0.1 : 1}
        value={renderedDraft}
        onFocus={() => {
          focused.current = true
          setIsEditingNumber(true)
        }}
        onChange={(event) => {
          const next = currency ? normalizeGroupedNumberInput(event.target.value) : event.target.value
          setDraft(next)
          if (next !== "" && Number.isFinite(Number(next))) onCommit(Math.max(0, Number(next)) / (percent ? 100 : 1))
        }}
        onBlur={() => {
          focused.current = false
          setIsEditingNumber(false)
          if (draft === "") {
            setDraft("0")
            onCommit(0)
          } else {
            setDraft(String(percent ? value * 100 : value))
          }
        }}
        className={`presentation-input-control w-full rounded-md border px-2 font-semibold outline-none ${compact ? "h-6 text-xs" : "h-7 text-sm"} ${currency ? "pl-5" : ""} ${percent ? "pr-5" : ""}`}
      />
      {percent ? <span className={`presentation-input-affix absolute right-2 top-1/2 -translate-y-1/2 ${compact ? "text-[10px]" : "text-xs"}`}>%</span> : null}
    </div>
  )
}

function ModuleInputSpecs({
  module,
  records,
  variant = "block",
  onInputChange,
}: {
  module: RiskModuleType
  records: ScenarioModuleRecords
  variant?: InputSpecVariant
  onInputChange?: (field: string, value: number | string | boolean) => void
}) {
  const specs = getPresentationInputSpecs(module, records)
  if (!specs.length) return null
  const denseRail = variant === "rail" && (module === "liability" || specs.length > 9)

  if (variant === "rail") {
    return (
      <aside className={`presentation-input-rail rounded-xl border border-[#d5e2e5] bg-[#f2f2f2] shadow-sm xl:sticky xl:top-0 ${denseRail ? "p-2.5" : "p-3.5"}`}>
        <div className={`border-b border-[#d5e2e5] ${denseRail ? "mb-2 pb-1.5" : "mb-3 pb-2.5"}`}>
          <p className={`presentation-input-title font-bold uppercase text-[#607583] ${denseRail ? "text-[9px] tracking-[0.18em]" : "text-[10px] tracking-[0.22em]"}`}>
            Input Snapshot
          </p>
        </div>
        <div className={denseRail ? "grid grid-cols-2 gap-1.5" : "grid gap-2"}>
          {specs.map((spec) => (
            <div key={spec.label} className={`presentation-input-item min-w-0 rounded-lg border border-[#dfe8ea] bg-white ${denseRail ? "px-2 py-1.5" : "px-3 py-2.5"}`}>
              <p className={`presentation-input-label truncate font-semibold uppercase text-[#607583] ${denseRail ? "text-[7.5px] leading-tight tracking-[0.12em]" : "text-[9px] tracking-[0.15em]"}`} title={spec.label}>{spec.label}</p>
              {onInputChange ? (
                spec.editor === "currency" || spec.editor === "number" || spec.editor === "percent" ? (
                  <SnapshotNumberInput compact={denseRail} className={denseRail ? "mt-0.5" : "mt-1"} label={spec.label} value={Number(spec.rawValue)} currency={spec.editor === "currency"} percent={spec.editor === "percent"} onCommit={(value) => onInputChange(spec.field, value)} />
                ) : (
                  <ThemedSelect
                    ariaLabel={spec.label}
                    value={String(spec.rawValue)}
                    onValueChange={(value) => onInputChange(spec.field, spec.field === "ltdTaxable" ? value === "true" : value)}
                    options={spec.options ?? []}
                    className={`presentation-input-control w-full min-w-0 border px-2 py-0 text-xs font-semibold shadow-none ${denseRail ? "mt-0.5 h-6" : "mt-1 h-7"}`}
                    contentClassName="presentation-policy-menu z-50 border-[#c8d7db] bg-white text-[#102a3a] shadow-[0_12px_28px_rgba(15,42,58,0.16)]"
                  />
                )
              ) : (
                <p className={`presentation-input-value truncate font-semibold leading-tight text-[#102a3a] ${denseRail ? "mt-0.5 text-xs" : "mt-1 text-sm"}`} title={spec.value}>{spec.value}</p>
              )}
            </div>
          ))}
        </div>
      </aside>
    )
  }

  return (
    <div className="presentation-input-block mb-5 rounded-lg border border-[#d5e2e5] bg-[#f2f2f2] p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#607583]">
        Input Snapshot
      </p>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {specs.map((spec) => (
          <div key={spec.label} className="rounded-md border border-[#dfe8ea] bg-white px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-[#607583]">{spec.label}</p>
            <p className="mt-1 text-sm font-semibold text-[#102a3a]">{spec.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Presentation() {
  const { scenarioId } = useParams()
  const scenario = useAppStore((state) =>
    scenarioId ? state.scenarios.find((item) => item.id === scenarioId) : undefined,
  )
  const client = useAppStore((state) =>
    scenario ? state.clients.find((item) => item.id === scenario.clientId) : undefined,
  )
  const records = useAppStore((state) =>
    scenarioId ? state.moduleRecordsByScenarioId[scenarioId] : undefined,
  )
  const updateLifeInputs = useAppStore((state) => state.updateLifeInputs)
  const updateDisabilityInputs = useAppStore((state) => state.updateDisabilityInputs)
  const updateDisabilityAssumptions = useAppStore((state) => state.updateDisabilityAssumptions)
  const updateUnemploymentInputs = useAppStore((state) => state.updateUnemploymentInputs)
  const updateLiabilityInputs = useAppStore((state) => state.updateLiabilityInputs)

  const lifeOutputs = useMemo(
    () => records?.life ? (records.life.output ?? calculateLifeInsuranceGap(sanitizeLifeInputs(records.life.inputs), records.life.assumptions)) : null,
    [records?.life],
  )
  const lifeIncomeGapOutputs = useMemo(
    () => records?.life ? calculateIncomeGapScenarios(sanitizeLifeInputs(records.life.inputs), records.life.assumptions) : null,
    [records?.life],
  )
  const disabilityOutputs = useMemo(
    () => records?.disability ? (records.disability.output ?? calculateDisabilityGap(records.disability.inputs, records.disability.assumptions)) : null,
    [records?.disability],
  )
  const unemploymentOutputs = useMemo(
    () => records?.unemployment ? (records.unemployment.output ?? calculateUnemploymentGap(records.unemployment.inputs)) : null,
    [records?.unemployment],
  )
  const liabilityOutputs = useMemo(
    () => records?.liability ? (records.liability.output ?? calculateLiabilityGap(records.liability.inputs)) : null,
    [records?.liability],
  )
  const modeledGapValues: Partial<Record<RiskModuleType, number>> = {
    life: lifeOutputs?.remainingGap,
    disability: disabilityOutputs?.totalGap,
    unemployment: unemploymentOutputs?.totalUncoveredShortfall,
    liability: liabilityOutputs?.exposureGap,
  }
  const [activeModule, setActiveModule] = useState<RiskModuleType | null>(null)
  const [disabilityVisualization, setDisabilityVisualization] = useState<DisabilityVisualization>("incomeGap")
  const [reportDate, setReportDate] = useState(() => new Date())
  const [isPreparingPdf, setIsPreparingPdf] = useState(false)

  if (!scenarioId || !scenario || !client || !records) {
    return (
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-dashed border-gray-800 bg-[#090E1A] p-8 text-center">
          <p className="text-lg font-semibold text-gray-100">Presentation unavailable</p>
          <p className="mt-2 text-sm text-gray-400">
            Open a saved scenario first so presentation mode can load real client data.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  const visibleModules = scenario.includedModules.filter((module) => {
    if (module === "life") return Boolean(lifeOutputs)
    if (module === "disability") return Boolean(disabilityOutputs)
    if (module === "unemployment") return Boolean(unemploymentOutputs)
    if (module === "liability") return Boolean(liabilityOutputs)
    return false
  })
  const selectedModule = activeModule && visibleModules.includes(activeModule)
    ? activeModule
    : visibleModules.includes(scenario.activeModule)
      ? scenario.activeModule
      : visibleModules[0]
  const selectedModuleHasSnapshot = selectedModule
    ? getPresentationInputSpecs(selectedModule, records).length > 0 &&
      (selectedModule !== "disability" || disabilityVisualization === "incomeGap")
    : false
  const reportSections = visibleModules.flatMap((module): ReportSection[] => {
    if (module === "life") {
      return [
        { key: "life-safe", module, title: "Premature Death - Safe Income Coverage", lifeVisualization: "safe" },
        { key: "life-runway", module, title: "Premature Death - Covered Runway Scenario", lifeVisualization: "runway" },
      ]
    }
    if (module === "disability") {
      return [
        { key: "disability-income-gap", module, title: "Disability / Illness - Income Gap", disabilityVisualization: "incomeGap" },
        { key: "disability-premium", module, title: "Disability / Illness - Premium vs. Self-Insured", disabilityVisualization: "premiumVsSelfInsured" },
        { key: "disability-jobs", module, title: "Disability / Illness - Job A vs. Job B", disabilityVisualization: "jobComparison" },
        { key: "disability-assets", module, title: "Disability / Illness - Asset Comparison", disabilityVisualization: "assetComparison" },
      ]
    }
    return [{ key: module, module, title: moduleCopy[module].title }]
  })

  function updateSnapshotInput(module: RiskModuleType, field: string, value: number | string | boolean) {
    if (!scenarioId || !records) return
    if (module === "life" && records.life) {
      const inputs = { ...records.life.inputs }
      if (field === "annualIncome") inputs.annualIncome = Number(value)
      else if (field === "currentAge") inputs.currentAge = Number(value)
      else if (field === "retirementAge") inputs.retirementAge = Number(value)
      else if (field === "incomeReplacementRatio") inputs.incomeReplacementRatio = Number(value)
      else if (field === "groupLifeCoverage") inputs.groupLifeCoverage = Number(value)
      else if (field === "privateLifeCoverage") inputs.privateLifeCoverage = Number(value)
      updateLifeInputs(scenarioId, inputs)
      return
    }
    if (module === "disability" && records.disability) {
      const inputs = { ...records.disability.inputs }
      if (field === "annualEarnedIncome") inputs.annualEarnedIncome = Number(value)
      else if (field === "currentAge") inputs.currentAge = Number(value)
      else if (field === "retirementAge") inputs.retirementAge = Number(value)
      else if (field === "ltdCoveragePercent") inputs.ltdCoveragePercent = Number(value)
      else if (field === "ltdMonthlyCap") inputs.ltdMonthlyCap = Number(value)
      else if (field === "ltdTaxable") inputs.ltdTaxable = Boolean(value)
      else if (field === "privateDiBenefitMonthly") inputs.privateDiBenefitMonthly = Number(value)
      else if (field === "privateDiBenefitPeriod") inputs.privateDiBenefitPeriod = value as DiBenefitPeriod | ""
      updateDisabilityInputs(scenarioId, inputs)
      return
    }
    if (module === "unemployment" && records.unemployment) {
      const inputs = { ...records.unemployment.inputs }
      if (field === "annualIncome") inputs.annualIncome = Number(value)
      else if (field === "spouseIncome") inputs.spouseIncome = Number(value)
      else if (field === "monthlyExpenses") inputs.monthlyExpenses = Math.round(Number(value))
      else if (field === "emergencySavings") inputs.emergencySavings = Number(value)
      else if (field === "netIncomeRatio") inputs.netIncomeRatio = Math.min(1, Number(value))
      else if (field === "severanceMonthly") inputs.severanceMonthly = Number(value)
      else if (field === "severanceDurationMonths") inputs.severanceDurationMonths = Math.min(60, Math.floor(Number(value)))
      else if (field === "unemploymentBenefitMonthly") inputs.unemploymentBenefitMonthly = Number(value)
      else if (field === "unemploymentBenefitDurationMonths") inputs.unemploymentBenefitDurationMonths = Math.min(60, Math.floor(Number(value)))
      else if (field === "estimatedJobSearchMonths") inputs.estimatedJobSearchMonths = Math.min(60, Math.floor(Number(value)))
      updateUnemploymentInputs(scenarioId, inputs)
      return
    }
    if (module === "liability" && records.liability) {
      const inputs = { ...records.liability.inputs }
      if (field === "annualIncome") inputs.annualIncome = Number(value)
      else if (field === "currentAge") inputs.currentAge = Number(value)
      else if (field === "spouseAnnualIncome") inputs.spouseAnnualIncome = Number(value)
      else if (field === "spouseCurrentAge") inputs.spouseCurrentAge = Number(value)
      else if (field === "retirementAge") inputs.retirementAge = Number(value)
      else if (field === "garnishmentRate") inputs.garnishmentRate = Math.min(1, Number(value))
      else if (field === "incomeGrowthRate") inputs.incomeGrowthRate = Math.min(1, Number(value))
      else if (field === "autoLiabilityLimit") inputs.autoLiabilityLimit = Number(value)
      else if (field === "umbrellaCoverage") inputs.umbrellaCoverage = Number(value)
      else if (field === "homeEquity") inputs.homeEquity = Number(value)
      else if (field === "investmentAssets") inputs.investmentAssets = Number(value)
      else if (field === "businessOwnershipValue") inputs.businessOwnershipValue = Number(value)
      else if (field === "savingsAssets") inputs.savingsAssets = Number(value)
      updateLiabilityInputs(scenarioId, inputs)
    }
  }

  function renderModule(module: RiskModuleType, reportSection?: ReportSection) {
    if (module === "life" && lifeOutputs && lifeIncomeGapOutputs && records?.life) {
      return (
        <LifeOutputView
          outputs={lifeOutputs}
          inputs={records.life.inputs}
          assumptions={records.life.assumptions}
          incomeGapOutputs={lifeIncomeGapOutputs}
          mode={reportSection ? "report" : "presentation"}
          activeTab={reportSection?.lifeVisualization}
        />
      )
    }
    if (module === "disability" && disabilityOutputs) {
      return (
        <DisabilityOutputView
          outputs={disabilityOutputs}
          inputs={records?.disability?.inputs}
          assumptions={records?.disability?.assumptions}
          onAssumptionsChange={(updates) => updateDisabilityAssumptions(scenarioId, updates)}
          onInputsChange={(next) => updateDisabilityInputs(scenarioId, next)}
          mode={reportSection ? "report" : "presentation"}
          visualization={reportSection?.disabilityVisualization ?? disabilityVisualization}
          onVisualizationChange={reportSection ? undefined : setDisabilityVisualization}
        />
      )
    }
    if (module === "unemployment" && unemploymentOutputs) {
      return (
        <UnemploymentOutputView
          outputs={unemploymentOutputs}
          onReserveLevelChange={(emergencySavings) =>
            updateSnapshotInput("unemployment", "emergencySavings", emergencySavings)
          }
        />
      )
    }
    if (module === "liability" && liabilityOutputs) return <LiabilityOutputView outputs={liabilityOutputs} animate={false} />
    return null
  }

  async function exportPdf() {
    if (isPreparingPdf) return
    setIsPreparingPdf(true)
    setReportDate(new Date())

    // Give every off-screen report module a real layout pass at its final PDF
    // width. Recharts resolves ResponsiveContainer dimensions asynchronously,
    // so printing on the same task can preserve only the already-visible chart.
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()))
    await document.fonts?.ready
    window.dispatchEvent(new Event("resize"))
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve())
    }))
    await new Promise<void>((resolve) => window.setTimeout(resolve, 150))

    window.print()
    setIsPreparingPdf(false)
  }

  return (
    <div className="presentation-mode h-screen overflow-hidden bg-gray-950 p-2 text-gray-50 print:h-auto print:overflow-visible print:bg-white print:p-0">
      <div className="h-full w-full print:hidden">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-gray-800 bg-[#090E1A] shadow-lg">
          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {selectedModule ? (
              <div className="relative flex min-h-full flex-col">
                <div className="relative mb-2 flex min-h-12 shrink-0 items-center justify-between gap-3 border-b border-gray-800 pb-2">
                  <Button variant="ghost" className="h-8 w-fit gap-2 px-2 text-gray-400 shadow-none hover:text-gray-100" asChild>
                    <Link to={`/scenarios/${scenarioId}/${scenario.activeModule}`}>
                      <ArrowLeft className="h-4 w-4" /> Back to Builder
                    </Link>
                  </Button>

                  <div className="pointer-events-none absolute left-1/2 top-1/2 w-[min(42rem,calc(100%-24rem))] -translate-x-1/2 -translate-y-1/2 text-center">
                    <h2 className="truncate text-lg font-semibold leading-tight text-gray-50">{moduleCopy[selectedModule].title}</h2>
                    <p className="mt-0.5 truncate text-xs leading-tight text-gray-500">Visualization and metrics for the selected risk module.</p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    className="h-8 shrink-0 gap-2 border border-[#188a89] bg-[#188a89] px-3 text-white shadow-sm hover:border-[#1db8b9] hover:bg-[#1db8b9] hover:text-[#071f27] focus-visible:ring-[#1db8b9]/40"
                    onClick={exportPdf}
                    disabled={isPreparingPdf}
                    title="Open the print dialog to save this report as a PDF for AdviceWorks"
                  >
                    <FileDown className="h-4 w-4" aria-hidden="true" />
                    {isPreparingPdf ? "Preparing Report…" : "Export PDF"}
                  </Button>
                </div>

                <div className="presentation-module-tabs scrollbar-hide mb-2 ml-auto flex max-w-full gap-1 overflow-x-auto rounded-lg bg-gray-950/40 p-1 xl:absolute xl:right-0 xl:top-[3.75rem] xl:z-20 xl:mb-0">
                  {visibleModules.map((module) => {
                    const Icon = moduleIcons[module]
                    const selected = module === selectedModule
                    const tabClasses = presentationModuleTabClasses[module]
                    return (
                      <button
                        key={module}
                        type="button"
                        onClick={() => setActiveModule(module)}
                        className={`flex min-w-max items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                          selected ? tabClasses.active : tabClasses.inactive
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {moduleCopy[module].tabLabel}
                      </button>
                    )
                  })}
                </div>

                {selectedModuleHasSnapshot ? (
                  <div className={selectedModule === "liability" ? "grid min-h-0 gap-3 xl:grid-cols-[22rem_minmax(0,1fr)] xl:items-start" : "grid min-h-0 gap-4 xl:grid-cols-[16rem_minmax(0,1fr)] xl:items-start"}>
                    <ModuleInputSpecs module={selectedModule} records={records} variant="rail" onInputChange={(field, value) => updateSnapshotInput(selectedModule, field, value)} />
                    <div className="min-w-0">{renderModule(selectedModule)}</div>
                  </div>
                ) : (
                  <div className="min-w-0">{renderModule(selectedModule)}</div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-800 text-sm text-gray-400">
                No calculated modules are available for this presentation.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`pdf-report-staging hidden print:block${isPreparingPdf ? " pdf-report-staging--preparing" : ""}`}>
        <ReportCoverPage client={client} reportDate={reportDate} />

        <div className="print-report-body">
          <div className="space-y-16">
            {reportSections.map((section) => (
              <div key={section.key} data-report-module={section.module} data-report-visualization={section.key}>
                <h2 className="mb-2 border-b border-gray-800 pb-2 text-xl font-semibold text-gray-50">
                  {section.title}
                </h2>
                <ReportModeledGap module={section.module} value={modeledGapValues[section.module]} />
                <ModuleInputSpecs module={section.module} records={records} />
                {renderModule(section.module, section)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
