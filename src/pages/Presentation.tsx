import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, BriefcaseBusiness, HeartPulse, Scale, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LifeOutputView } from "@/features/risk-modules/life/components/LifeOutputView"
import { calculateLifeInsuranceGap } from "@/features/risk-modules/life/calculations/calculateLifeInsuranceGap"
import { calculateIncomeGapScenarios } from "@/features/risk-modules/life/calculations/calculateIncomeGapScenarios"
import { sanitizeLifeInputs } from "@/features/risk-modules/life/utils/sanitizeLifeInputs"
import { DisabilityOutputView } from "@/features/risk-modules/disability/components/DisabilityOutputView"
import { calculateDisabilityGap } from "@/features/risk-modules/disability/calculations/calculateDisabilityGap"
import { UnemploymentOutputView } from "@/features/risk-modules/unemployment/components/UnemploymentOutputView"
import { calculateUnemploymentGap } from "@/features/risk-modules/unemployment/calculations/calculateUnemploymentGap"
import { LiabilityOutputView } from "@/features/risk-modules/liability/components/LiabilityOutputView"
import { calculateLiabilityGap } from "@/features/risk-modules/liability/calculations/calculateLiabilityGap"
import { DisclaimerBlock } from "@/components/global/DisclaimerBlock"
import { RiskModuleType, ScenarioModuleRecords, useAppStore } from "@/lib/store"
import { formatGapCurrency, getModuleGapValue } from "@/lib/scenarioMetrics"
import { formatCurrency, formatPercent } from "@/lib/utils"
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

function formatModuleGap(module: RiskModuleType, record: ScenarioModuleRecords) {
  return formatGapCurrency(getModuleGapValue(module, record))
}

type InputSpec = { label: string; value: string }

type InputSpecVariant = "block" | "rail"

function getPresentationInputSpecs(module: RiskModuleType, records: ScenarioModuleRecords): InputSpec[] {
  if (module === "life" && records.life) {
    const inputs = records.life.inputs
    return [
      { label: "Annual Income", value: formatCurrency(inputs.annualIncome) },
      { label: "Current Age", value: String(inputs.currentAge) },
      { label: "Retirement Age", value: String(inputs.retirementAge) },
      { label: "Income Replacement Ratio", value: formatPercent(inputs.incomeReplacementRatio) },
      { label: "Group Life Coverage", value: formatCurrency(inputs.groupLifeCoverage) },
      { label: "Private Life Coverage", value: formatCurrency(inputs.privateLifeCoverage) },
      {
        label: "Private Policy",
        value: inputs.privateLifePolicyType === "term"
          ? `Term${inputs.privateLifeTermYears ? ` (${inputs.privateLifeTermYears} yrs)` : ""}`
          : "Permanent",
      },
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
      { label: "Annual Income", value: formatCurrency(inputs.annualEarnedIncome) },
      { label: "Current Age", value: String(inputs.currentAge) },
      { label: "Retirement Age", value: String(inputs.retirementAge) },
      { label: "LTD Coverage", value: formatPercent(inputs.ltdCoveragePercent) },
      { label: "LTD Monthly Cap", value: formatCurrency(inputs.ltdMonthlyCap) },
      { label: "LTD Taxable", value: inputs.ltdTaxable ? "Yes (70% net assumption)" : "No" },
      { label: "Individual DI Benefit", value: `${formatCurrency(inputs.privateDiBenefitMonthly)}/mo` },
      { label: "DI Benefit Period", value: periodLabel },
    ]
  }

  return []
}

function ModuleInputSpecs({
  module,
  records,
  variant = "block",
}: {
  module: RiskModuleType
  records: ScenarioModuleRecords
  variant?: InputSpecVariant
}) {
  const specs = getPresentationInputSpecs(module, records)
  if (!specs.length) return null

  if (variant === "rail") {
    return (
      <aside className="presentation-input-rail rounded-xl border border-gray-800 bg-gray-950/55 p-3.5 shadow-inner shadow-black/20 xl:sticky xl:top-0">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-gray-800 pb-2.5">
          <p className="presentation-input-title text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
            Input Snapshot
          </p>
          <span className="presentation-input-badge rounded-full border border-gray-800 bg-[#090E1A] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-500">
            Live Data
          </span>
        </div>
        <div className="grid gap-2">
          {specs.map((spec) => (
            <div key={spec.label} className="presentation-input-item rounded-lg border border-gray-800/90 bg-[#090E1A] px-3 py-2.5">
              <p className="presentation-input-label text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-600">{spec.label}</p>
              <p className="presentation-input-value mt-1 truncate text-sm font-semibold leading-tight text-gray-100" title={spec.value}>{spec.value}</p>
            </div>
          ))}
        </div>
      </aside>
    )
  }

  return (
    <div className="mb-5 rounded-lg border border-gray-800 bg-gray-950/60 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
        Input Snapshot
      </p>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {specs.map((spec) => (
          <div key={spec.label} className="rounded-md border border-gray-800 bg-[#090E1A] px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">{spec.label}</p>
            <p className="mt-1 text-sm font-semibold text-gray-100">{spec.value}</p>
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
  const [activeModule, setActiveModule] = useState<RiskModuleType | null>(null)
  const [disabilityVisualization, setDisabilityVisualization] = useState<"incomeGap" | "premiumVsSelfInsured" | "jobComparison">("incomeGap")

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

  function renderModule(module: RiskModuleType) {
    if (module === "life" && lifeOutputs && lifeIncomeGapOutputs && records?.life) {
      return (
        <LifeOutputView
          outputs={lifeOutputs}
          inputs={records.life.inputs}
          assumptions={records.life.assumptions}
          incomeGapOutputs={lifeIncomeGapOutputs}
          mode="presentation"
        />
      )
    }
    if (module === "disability" && disabilityOutputs) {
      return <DisabilityOutputView outputs={disabilityOutputs} inputs={records?.disability?.inputs} mode="presentation" visualization={disabilityVisualization} onVisualizationChange={setDisabilityVisualization} />
    }
    if (module === "unemployment" && unemploymentOutputs) return <UnemploymentOutputView outputs={unemploymentOutputs} />
    if (module === "liability" && liabilityOutputs) return <LiabilityOutputView outputs={liabilityOutputs} />
    return null
  }

  return (
    <div className="presentation-mode relative h-screen overflow-hidden bg-gray-950 p-3 text-gray-50 print:h-auto print:overflow-visible print:bg-white print:p-0">
      <Button variant="ghost" className="absolute left-4 top-4 z-20 h-9 px-2 shadow-none print:hidden" asChild>
        <Link to={`/scenarios/${scenarioId}/${scenario.activeModule}`} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Builder
        </Link>
      </Button>

      <div className="mx-auto h-full max-w-7xl print:hidden">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-gray-800 bg-[#090E1A] shadow-lg">
          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {selectedModule ? (
              <div className="flex min-h-full flex-col">
                <div className="mb-3 grid shrink-0 items-center gap-3 border-b border-gray-800 pb-3 pl-28 lg:grid-cols-[minmax(0,1fr)_auto] 2xl:pl-0">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-semibold text-gray-50">{moduleCopy[selectedModule].title}</h2>
                    <p className="mt-0.5 text-xs text-gray-500">Visualization and metrics for the selected risk module.</p>
                  </div>
                  <div className="presentation-module-tabs scrollbar-hide flex max-w-full gap-1 overflow-x-auto rounded-lg bg-gray-950/40 p-1 lg:justify-self-end">
                    {visibleModules.map((module) => {
                      const Icon = moduleIcons[module]
                      const selected = module === selectedModule
                      return (
                        <button
                          key={module}
                          type="button"
                          onClick={() => setActiveModule(module)}
                          className={`flex min-w-max items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                            selected ? "bg-brand-700 text-white shadow-sm ring-1 ring-brand-600 dark:bg-brand-950/70 dark:ring-brand-700/70" : "text-gray-400 hover:bg-gray-900 hover:text-gray-100"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {moduleCopy[module].tabLabel}
                        </button>
                      )
                    })}
                  </div>
                </div>
                {selectedModuleHasSnapshot ? (
                  <div className="grid min-h-0 gap-4 xl:grid-cols-[16rem_minmax(0,1fr)] xl:items-start">
                    <ModuleInputSpecs module={selectedModule} records={records} variant="rail" />
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

      <div className="hidden print:block">
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#090E1A] shadow-lg print:border-none print:shadow-none">
          <div className="print-cover-header border-b border-gray-800 bg-[#0a1628] p-12 text-white">
            <div className="mb-6 hidden items-center gap-3 print:flex">
              <img
                src={`${import.meta.env.BASE_URL}northstar-logo.svg`}
                alt="North Star Resource Group"
                className="h-8 w-auto object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{scenario.name}</h1>
            <p className="mt-2 text-lg text-gray-400">{client.displayName}</p>
            <p className="mt-1 text-sm text-gray-500">
              Advisor-facing risk review presentation based on saved scenario state.
            </p>
            <p className="mt-3 hidden text-xs text-gray-500 print:block">
              Generated {new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })} &nbsp;·&nbsp; North Star Resource Group &nbsp;·&nbsp; Confidential
            </p>
          </div>

          <div className="space-y-16 p-12">
            {visibleModules.map((module) => (
              <div key={module}>
                <h2 className="mb-2 border-b border-gray-800 pb-2 text-xl font-semibold text-gray-50">
                  {moduleCopy[module].title}
                </h2>
                <p className="mb-6 text-sm text-gray-400">
                  Modeled gap: {formatModuleGap(module, records)}
                </p>
                <ModuleInputSpecs module={module} records={records} />
                {renderModule(module)}
              </div>
            ))}

            <DisclaimerBlock />
          </div>
        </div>
      </div>
    </div>
  )
}
