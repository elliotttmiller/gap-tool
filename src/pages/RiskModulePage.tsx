import * as React from "react"
import { Button } from "@/components/Button"
import { DisclaimerBlock } from "@/components/global/DisclaimerBlock"
import { RiSaveLine } from "@remixicon/react"

// ── Not-included fallback ─────────────────────────────────────────────────────

interface ModuleNotIncludedProps {
  moduleName: string
}

export function ModuleNotIncluded({ moduleName }: ModuleNotIncludedProps) {
  return (
    <div className="rounded-xl border border-dashed border-gray-800 p-8 text-center">
      <p className="text-sm text-gray-400">
        {moduleName} module is not included in this scenario.
      </p>
    </div>
  )
}

// ── Shared module page layout ─────────────────────────────────────────────────

interface RiskModulePageProps {
  title: string
  subtitle: string
  onSave: () => void
  formSlot: React.ReactNode
  outputSlot: React.ReactNode
}

/**
 * Shared layout shell for all four risk-module pages.
 * Provides the header/save-button row, the 5/7 input+output grid, and the
 * disclaimer block. Each module page supplies its own form and output slots.
 */
export function RiskModulePage({ title, subtitle, onSave, formSlot, outputSlot }: RiskModulePageProps) {
  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-50">{title}</h2>
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        </div>
        <Button
          variant="secondary"
          className="gap-2 w-full sm:w-auto"
          onClick={onSave}
        >
          <RiSaveLine className="size-4" aria-hidden="true" /> Save Scenario
        </Button>
      </div>

      <div className="grid xl:grid-cols-12 gap-5 lg:gap-6 items-start w-full">
        <div className="xl:col-span-4 w-full">{formSlot}</div>
        <div className="xl:col-span-8 xl:sticky xl:top-6 w-full">{outputSlot}</div>
      </div>

      <div className="pt-6 sm:pt-8">
        <DisclaimerBlock />
      </div>
    </div>
  )
}
