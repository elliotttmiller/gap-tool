import { useMemo } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Printer } from "lucide-react"
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

const moduleCopy: Record<RiskModuleType, { title: string }> = {
  life: { title: "Premature Death - Protection Gap" },
  disability: { title: "Disability / Illness - Income Collapse" },
  unemployment: { title: "Liquidity & Unemployment Risk" },
  liability: { title: "Liability / Lawsuit - Asset Exposure" },
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

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-[#090E1A] p-4 print:hidden">
          <Button variant="ghost" className="shadow-none" asChild>
            <Link to={`/scenarios/${scenarioId}/${scenario.activeModule}`} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Builder
            </Link>
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => { window.focus(); setTimeout(() => window.print(), 150) }}>
            <Printer className="h-4 w-4" /> Save as PDF
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#090E1A] shadow-lg print:border-none print:shadow-none">
          <div className="border-b border-gray-800 bg-[#0a1628] p-12 text-white">
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
            {scenario.includedModules.map((module) => (
              <div key={module}>
                <h2 className="mb-2 border-b border-gray-800 pb-2 text-xl font-semibold text-gray-50">
                  {moduleCopy[module].title}
                </h2>
                <p className="mb-6 text-sm text-gray-400">
                  Modeled gap: {formatModuleGap(module, records)}
                </p>
                {module === "life" && lifeOutputs ? <LifeOutputView outputs={lifeOutputs} /> : null}
                {module === "disability" && disabilityOutputs ? <DisabilityOutputView outputs={disabilityOutputs} /> : null}
                {module === "unemployment" && unemploymentOutputs ? <UnemploymentOutputView outputs={unemploymentOutputs} /> : null}
                {module === "liability" && liabilityOutputs ? <LiabilityOutputView outputs={liabilityOutputs} /> : null}
              </div>
            ))}

            <DisclaimerBlock />
          </div>
        </div>
      </div>
    </div>
  )
}
