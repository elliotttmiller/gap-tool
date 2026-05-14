import * as React from "react"
import { Button } from "@/components/Button"
import { DisclaimerBlock } from "@/components/global/DisclaimerBlock"
import { Link, useParams } from "react-router-dom"
import { RiSlideshow3Line } from "@remixicon/react"

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
  headerActions?: React.ReactNode
  formSlot: React.ReactNode
  outputSlot: React.ReactNode
}

/**
 * Shared layout shell for all four risk-module pages.
 * Provides the header/save-button row, the 5/7 input+output grid, and the
 * disclaimer block. Each module page supplies its own form and output slots.
 */
export function RiskModulePage({ title, subtitle, headerActions, formSlot, outputSlot }: RiskModulePageProps) {
  const { scenarioId } = useParams()

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-gray-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-50">{title}</h2>
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto sm:justify-end">
          {headerActions}
          {scenarioId ? (
            <Button variant="secondary" asChild className="h-10 w-10 rounded-xl p-0">
              <Link to={`/present/${scenarioId}`} aria-label="Presentation mode" title="Presentation mode">
                <RiSlideshow3Line className="size-5" aria-hidden="true" />
                <span className="sr-only">Presentation mode</span>
              </Link>
            </Button>
          ) : null}
        </div>
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
