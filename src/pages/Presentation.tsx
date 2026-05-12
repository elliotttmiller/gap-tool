import { useParams, Link } from "react-router-dom"
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
import { useScenarioStore } from "@/lib/store"

export function Presentation() {
  const { scenarioId } = useParams()

  const lifeInputs = useScenarioStore(state => state.lifeInputs)
  const disabilityInputs = useScenarioStore(state => state.disabilityInputs)
  const unemploymentInputs = useScenarioStore(state => state.unemploymentInputs)
  const liabilityInputs = useScenarioStore(state => state.liabilityInputs)

  const lifeOutputs = calculateLifeInsuranceGap(lifeInputs, useScenarioStore(state => state.lifeAssumptions))
  const disabilityOutputs = calculateDisabilityGap(disabilityInputs, useScenarioStore(state => state.disabilityAssumptions))
  const unemploymentOutputs = calculateUnemploymentGap(unemploymentInputs)
  const liabilityOutputs = calculateLiabilityGap(liabilityInputs)

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Presentation Toolbar - Hidden on print */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
          <Button variant="ghost" className="shadow-none" asChild>
            <Link to={`/scenarios/${scenarioId}/life`} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Builder
            </Link>
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print / PDF
          </Button>
        </div>

        {/* Presentation Slide */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden print:shadow-none print:border-none">
          <div className="p-12 border-b border-slate-100 bg-slate-900 text-white">
            <h1 className="text-3xl font-bold tracking-tight">Financial Exposure Analysis</h1>
            <p className="text-slate-400 mt-2 text-lg">Miller Household</p>
          </div>
          
          <div className="p-12 space-y-16">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-6">Premature Death - Protection Gap</h2>
              <LifeOutputView outputs={lifeOutputs} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-6">Disability / Illness - Income Collapse</h2>
              <DisabilityOutputView outputs={disabilityOutputs} />
            </div>

            <div className="break-before-page">
              <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-6">Liquidity & Unemployment Risk</h2>
              <UnemploymentOutputView outputs={unemploymentOutputs} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-6">Asset Exposure & Liability</h2>
              <LiabilityOutputView outputs={liabilityOutputs} />
            </div>

            <DisclaimerBlock />
          </div>
        </div>
      </div>
    </div>
  )
}
