import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, BriefcaseBusiness, HeartPulse, Printer, Scale, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LifeOutputView } from "@/features/risk-modules/life/components/LifeOutputView"
import { calculateLifeInsuranceGap } from "@/features/risk-modules/life/calculations/calculateLifeInsuranceGap"
import { DisabilityOutputView } from "@/features/risk-modules/disability/components/DisabilityOutputView"
import { calculateDisabilityGap } from "@/features/risk-modules/disability/calculations/calculateDisabilityGap"
import { UnemploymentOutputView } from "@/features/risk-modules/unemployment/components/UnemploymentOutputView"
import { calculateUnemploymentGap } from "@/features/risk-modules/unemployment/calculations/calculateUnemploymentGap"
import { LiabilityOutputView } from "@/features/risk-modules/liability/components/LiabilityOutputView"
import { calculateLiabilityGap } from "@/features/risk-modules/liability/calculations/calculateLiabilityGap"
import { DisclaimerBlock } from "@/components/global/DisclaimerBlock"
import { RiskModuleType, ScenarioModuleRecords, useAppStore } from "@/lib/store"
import { formatGapCurrency, getModuleGapValue } from "@/lib/scenarioMetrics"
import "@/styles/print.css"

const moduleCopy: Record<RiskModuleType, { title: string; tabLabel: string; accent: string }> = {
  life: { title: "Premature Death - Protection Gap", tabLabel: "Life", accent: "text-red-300" },
  disability: { title: "Disability / Illness - Income Collapse", tabLabel: "Disability", accent: "text-blue-300" },
  unemployment: { title: "Liquidity & Unemployment Risk", tabLabel: "Unemployment", accent: "text-emerald-300" },
  liability: { title: "Liability / Lawsuit - Asset Exposure", tabLabel: "Liability", accent: "text-amber-300" },
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

  // Memoize all module calculations so they don't re-run on every render.
  const lifeOutputs = useMemo(
    () => records?.life ? (records.life.output ?? calculateLifeInsuranceGap(records.life.inputs, records.life.assumptions)) : null,
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

  function renderModule(module: RiskModuleType) {
    if (module === "life" && lifeOutputs) return <LifeOutputView outputs={lifeOutputs} />
    if (module === "disability" && disabilityOutputs) return <DisabilityOutputView outputs={disabilityOutputs} />
    if (module === "unemployment" && unemploymentOutputs) return <UnemploymentOutputView outputs={unemploymentOutputs} />
    if (module === "liability" && liabilityOutputs) return <LiabilityOutputView outputs={liabilityOutputs} />
    return null
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-950 p-4 text-gray-50 print:h-auto print:overflow-visible print:bg-white print:p-0">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-4 print:hidden">
        <div className="flex shrink-0 items-center justify-between rounded-lg border border-gray-800 bg-[#090E1A] px-4 py-3">
          <Button variant="ghost" className="shadow-none" asChild>
            <Link to={`/scenarios/${scenarioId}/${scenario.activeModule}`} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Builder
            </Link>
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => { window.focus(); setTimeout(() => window.print(), 150) }}>
            <Printer className="h-4 w-4" /> Save as PDF
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-800 bg-[#090E1A] shadow-lg">
          <div className="shrink-0 border-b border-gray-800 bg-[#0a1628] px-8 py-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-300">Presentation Mode</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">{scenario.name}</h1>
                <p className="mt-1 text-sm text-gray-400">{client.displayName}</p>
              </div>
              {selectedModule ? (
                <div className="rounded-lg border border-gray-700 bg-gray-950/40 px-4 py-3 text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Modeled Gap</p>
                  <p className={`mt-1 text-2xl font-bold ${moduleCopy[selectedModule].accent}`}>
                    {formatModuleGap(selectedModule, records)}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 border-b border-gray-800 px-6 py-3">
            <div className="scrollbar-hide flex max-w-full gap-2 overflow-x-auto rounded-lg bg-gray-950/40 p-1">
              {visibleModules.map((module) => {
                const Icon = moduleIcons[module]
                const selected = module === selectedModule
                return (
                  <button
                    key={module}
                    type="button"
                    onClick={() => setActiveModule(module)}
                    className={`flex min-w-max items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                      selected ? "bg-brand-600 text-white shadow-sm" : "text-gray-400 hover:bg-gray-900 hover:text-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {moduleCopy[module].tabLabel}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-8 py-6">
            {selectedModule ? (
              <div className="flex min-h-full flex-col">
                <div className="mb-5 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-50">{moduleCopy[selectedModule].title}</h2>
                    <p className="mt-1 text-sm text-gray-500">Visualization and metrics for the selected risk module.</p>
                  </div>
                </div>
                {renderModule(selectedModule)}
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
