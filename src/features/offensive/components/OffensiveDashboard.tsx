import { useState } from "react"
import { Link } from "react-router-dom"
import { RiArrowLeftLine } from "@remixicon/react"
import { WealthAccumulationModule } from "./WealthAccumulationModule"
import { FeeDragModule } from "./FeeDragModule"
import { calculateWealthAccumulation } from "../calculations/wealthAccumulationCalc"
import { calculateFeeDrag } from "../calculations/feeDragCalc"
import type { ClientRecord } from "@/lib/store-types"
import { useAppStore } from "@/lib/store"
import { cx } from "@/lib/utils"

// ── Tab config ────────────────────────────────────────────────────────────────

type TabId = "retirement-readiness" | "investment-cost"

const TABS: { id: TabId; label: string }[] = [
  { id: "retirement-readiness", label: "Retirement Readiness Gap" },
  { id: "investment-cost", label: "Investment Cost Impact" },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface OffensiveDashboardProps {
  client: ClientRecord
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OffensiveDashboard({ client }: OffensiveDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("retirement-readiness")

  const offensiveInputs = useAppStore((s) => s.offensiveInputsByClientId[client.id])
  const getOrCreate = useAppStore((s) => s.getOrCreateOffensiveInputs)
  const updateWealth = useAppStore((s) => s.updateOffensiveWealthAccumulationInputs)
  const updateFee = useAppStore((s) => s.updateOffensiveFeeDragInputs)

  // Lazily initialise if not yet present
  const inputs = offensiveInputs ?? getOrCreate(client.id)

  // Cross-module: when fee optimization is toggled on, pass proposedNetReturn
  // as the expectedAnnualReturn override for the Wealth module.
  const feeDragInputs = inputs.feeDrag as typeof inputs.feeDrag & { currentAge?: number }
  feeDragInputs.currentAge = inputs.wealthAccumulation.currentAge

  const feeDragApplied = inputs.feeDrag.applyFeeOptimizationToWealthGap

  // If cross-module bridge is active, compute fee drag outputs to get proposedNetReturn
  let wealthInputs = inputs.wealthAccumulation
  if (feeDragApplied) {
    const fdo = calculateFeeDrag(feeDragInputs)
    wealthInputs = { ...wealthInputs, expectedAnnualReturn: fdo.proposedNetReturn }
  }

  // Compute wealth gap for the cross-module action item in FeeDragModule
  const wealthOutputs = calculateWealthAccumulation(wealthInputs)
  const wealthAccumulationGap = wealthOutputs.wealthAccumulationGap

  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      {/* Header bar */}
      <header className="sticky top-0 z-30 border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-screen-2xl items-center gap-4 px-6 py-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300"
          >
            <RiArrowLeftLine className="size-3.5" />
            Back to Clients
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-sm font-semibold text-slate-200">{client.displayName}</span>
          <span className="rounded-full border border-cyan-800/60 bg-cyan-950/30 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-cyan-400">
            Offensive
          </span>
        </div>

        {/* Tab navigation */}
        <div className="mx-auto max-w-screen-2xl px-6">
          <nav className="-mb-px flex gap-1" aria-label="Module tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cx(
                  "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-cyan-500 text-cyan-400"
                    : "border-transparent text-slate-500 hover:border-slate-600 hover:text-slate-300",
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-6">
        {activeTab === "retirement-readiness" && (
          <WealthAccumulationModule
            inputs={wealthInputs}
            onChange={(updated) => updateWealth(client.id, updated)}
          />
        )}
        {activeTab === "investment-cost" && (
          <FeeDragModule
            inputs={inputs.feeDrag}
            onChange={(updated) => updateFee(client.id, updated)}
            wealthAccumulationGap={wealthAccumulationGap}
          />
        )}
      </main>
    </div>
  )
}
