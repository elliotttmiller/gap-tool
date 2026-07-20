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
  compactForm?: boolean
  formSlot: React.ReactNode
  outputSlot: React.ReactNode | ((inputsOpen: boolean, setInputsOpen: (open: boolean) => void) => React.ReactNode)
}

/**
 * Shared layout shell for all four risk-module pages.
 * Provides the header/save-button row, the input+output grid, and the
 * disclaimer block. Each module page supplies its own form and output slots.
 */
export function RiskModulePage({ title, subtitle, headerActions, compactForm = false, formSlot, outputSlot }: RiskModulePageProps) {
  const { scenarioId } = useParams()
  const [inputsOpen, setInputsOpen] = React.useState(true)
  const scenario = useAppStore((state) =>
    scenarioId ? state.scenarios.find((s) => s.id === scenarioId) : undefined,
  )
  const client = useAppStore((state) =>
    scenario ? state.clients.find((c) => c.id === scenario.clientId) : undefined,
  )
  const setActiveModule = useAppStore((state) => state.setScenarioActiveModule)
  const includedTabs = scenario?.includedModules ?? []

  return (
    <div className="builder-mode w-full max-w-full space-y-3 overflow-x-hidden">
      {/* ── Module header ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-gray-800 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,42,58,0.04),0_12px_32px_rgba(15,42,58,0.06)] dark:bg-[#090E1A]">
        {/* Left: title + subtitle */}
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-tight text-gray-50">{title}</h2>
          <p className="mt-0.5 text-xs leading-tight text-gray-500">{subtitle}</p>
        </div>

        {/* Centre: client name + updated */}
        {client && scenario ? (
          <div className="flex flex-col items-center gap-0.5 text-center">
            <span className="text-xs font-semibold leading-tight tracking-tight text-slate-300">
              {client.displayName} Household Review
            </span>
            <span className="text-[10px] leading-tight text-slate-600">
              Updated: {new Date(scenario.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        ) : null}

        {/* Right: module tabs + actions */}
        <div className="flex flex-wrap items-center gap-2">
          {includedTabs.length > 1 && scenarioId ? (
            <div className="scrollbar-hide flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/70 p-1">
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
                        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                        isActive
                          ? "bg-brand-700 text-white shadow-sm ring-1 ring-brand-600 dark:bg-brand-950/70 dark:ring-brand-700/70"
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

          <div className="flex items-center gap-1.5">
            {headerActions}
            {scenarioId ? (
              <Button variant="secondary" asChild className="h-8 w-8 rounded-lg p-0">
                <Link to={`/present/${scenarioId}`} aria-label="Presentation mode" title="Presentation mode">
                  <RiSlideshow3Line className="size-4" aria-hidden="true" />
                  <span className="sr-only">Presentation mode</span>
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label={inputsOpen ? "Collapse input forms" : "Expand input forms"}
        aria-expanded={inputsOpen}
        title={inputsOpen ? "Hide input panel" : "Show input panel"}
        onClick={() => setInputsOpen((open) => !open)}
        className={cx(
          "fixed top-1/2 z-40 hidden h-14 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-brand-600/40 bg-white text-brand-700 shadow-[0_8px_24px_rgba(15,42,58,0.16)] ring-4 ring-[#eaf1f3] transition-[left,transform,background-color,border-color,color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-brand-600 hover:bg-brand-50 hover:text-brand-800 hover:shadow-[0_10px_28px_rgba(0,153,168,0.18)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:ring-[#0d1b2a] dark:hover:border-brand-500 dark:hover:bg-brand-950 dark:hover:text-white xl:flex",
          inputsOpen
            ? "left-[max(1rem,calc((100vw-100rem)/2+1rem))]"
            : "left-4",
        )}
      >
        {inputsOpen ? (
          <RiArrowLeftSLine className="size-5" aria-hidden="true" />
        ) : (
          <RiArrowRightSLine className="size-5" aria-hidden="true" />
        )}
      </button>

      <div
        className={cx(
          "relative grid w-full min-w-0 items-start gap-3 overflow-visible transition-[grid-template-columns,gap] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          inputsOpen
            ? compactForm
              ? "xl:grid-cols-[22rem_minmax(0,1fr)]"
              : "xl:grid-cols-[24rem_minmax(0,1fr)]"
            : "xl:grid-cols-[0rem_minmax(0,1fr)] xl:gap-x-0",
        )}
      >
        <div
          className={cx(
            "relative min-w-0 overflow-visible transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            inputsOpen ? "opacity-100 translate-x-0" : "translate-x-0 opacity-100",
          )}
        >
          <div
            className={cx(
              "w-full min-w-0 max-w-none overflow-hidden transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              compactForm ? "xl:max-w-[22rem]" : "xl:max-w-md",
              inputsOpen ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-3 opacity-0",
            )}
            aria-hidden={!inputsOpen}
          >
            {formSlot}
          </div>
        </div>
        <div className="min-w-0 w-full">
          {typeof outputSlot === "function" ? outputSlot(inputsOpen, setInputsOpen) : outputSlot}
        </div>
      </div>

      <div className="pt-6 sm:pt-8">
        <DisclaimerBlock />
      </div>
    </div>
  )
}
