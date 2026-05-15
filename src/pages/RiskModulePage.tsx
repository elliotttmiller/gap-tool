import * as React from "react"
import { Button } from "@/components/Button"
import { DisclaimerBlock } from "@/components/global/DisclaimerBlock"
import { Link, NavLink, useParams } from "react-router-dom"
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiHeartPulseLine,
  RiScalesLine,
  RiShieldCheckLine,
  RiSlideshow3Line,
  RiUmbrellaLine,
} from "@remixicon/react"
import { useAppStore, RiskModuleType } from "@/lib/store"
import { cx } from "@/lib/utils"

const tabConfig: Record<RiskModuleType, { label: string; icon: typeof RiUmbrellaLine }> = {
  life: { label: "Life Insurance", icon: RiHeartPulseLine },
  disability: { label: "Disability", icon: RiUmbrellaLine },
  unemployment: { label: "Unemployment", icon: RiShieldCheckLine },
  liability: { label: "Liability / Lawsuit", icon: RiScalesLine },
}

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
  const [inputsOpen, setInputsOpen] = React.useState(true)
  const scenario = useAppStore((state) =>
    scenarioId ? state.scenarios.find((s) => s.id === scenarioId) : undefined,
  )
  const setActiveModule = useAppStore((state) => state.setScenarioActiveModule)
  const includedTabs = scenario?.includedModules ?? []

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-gray-800 pb-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-gray-50">{title}</h2>
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {includedTabs.length > 1 && scenarioId ? (
            <div className="scrollbar-hide flex max-w-full items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-1.5">
              {includedTabs.map((module) => {
                const tab = tabConfig[module]
                if (!tab) return null
                return (
                  <NavLink
                    key={module}
                    to={`/scenarios/${scenarioId}/${module}`}
                    onClick={() => setActiveModule(scenarioId, module)}
                    className={({ isActive }) =>
                      cx(
                        "inline-flex min-h-9 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                        isActive
                          ? "bg-brand-950/70 text-white shadow-sm ring-1 ring-brand-700/70"
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-100",
                      )
                    }
                  >
                    <span>{tab.label}</span>
                  </NavLink>
                )
              })}
            </div>
          ) : null}

          <div className="flex items-center gap-2">
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
      </div>

      <div
        className={cx(
          "relative grid w-full min-w-0 items-start gap-5 transition-[grid-template-columns,gap] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:gap-6",
          inputsOpen
            ? "xl:grid-cols-[minmax(24rem,28rem)_1.75rem_minmax(0,1fr)]"
            : "xl:grid-cols-[0rem_1.75rem_minmax(0,1fr)] xl:gap-x-3",
        )}
      >
        <div
          className={cx(
            "min-w-0 overflow-hidden transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            inputsOpen ? "opacity-100 translate-x-0" : "pointer-events-none -translate-x-3 opacity-0",
          )}
          aria-hidden={!inputsOpen}
        >
          <div className="w-full min-w-[24rem] max-w-[28rem]">{formSlot}</div>
        </div>
        <div className="sticky top-24 z-20 hidden h-10 items-center xl:flex">
          <button
            type="button"
            aria-label={inputsOpen ? "Collapse input forms" : "Expand input forms"}
            aria-expanded={inputsOpen}
            onClick={() => setInputsOpen((open) => !open)}
            className="flex h-9 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-950/95 text-slate-400 shadow-lg shadow-black/30 transition-colors hover:border-brand-600 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
          >
            {inputsOpen ? (
              <RiArrowLeftSLine className="size-5" aria-hidden="true" />
            ) : (
              <RiArrowRightSLine className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="min-w-0 w-full">
          {outputSlot}
        </div>
      </div>

      <div className="pt-6 sm:pt-8">
        <DisclaimerBlock />
      </div>
    </div>
  )
}
