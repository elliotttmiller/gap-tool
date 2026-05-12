import { Button } from "@/components/Button"
import { RiskModuleType, useAppStore } from "@/lib/store"
import { cx } from "@/lib/utils"
import {
  RiArrowLeftLine,
  RiCalendarLine,
  RiHeartPulseLine,
  RiPresentationLine,
  RiScalesLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiUmbrellaLine,
} from "@remixicon/react"
import { Link, NavLink, Navigate, Outlet, useLocation, useParams } from "react-router-dom"

const tabConfig: Record<
  RiskModuleType,
  { label: string; subtitle: string; icon: typeof RiUmbrellaLine }
> = {
  disability: {
    label: "Disability",
    subtitle: "Illness or injury income gap",
    icon: RiUmbrellaLine,
  },
  life: {
    label: "Life Insurance",
    subtitle: "Premature death income gap",
    icon: RiHeartPulseLine,
  },
  unemployment: {
    label: "Unemployment",
    subtitle: "Job loss reserve runway",
    icon: RiShieldCheckLine,
  },
  liability: {
    label: "Liability / Lawsuit",
    subtitle: "Asset and income exposure",
    icon: RiScalesLine,
  },
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function toDateLabel(value?: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function ScenarioMetaItem({ icon: Icon, label, value }: { icon: typeof RiCalendarLine; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-500">
      <Icon className="size-3.5 text-slate-600" aria-hidden="true" />
      <span className="text-slate-600">{label}:</span>
      <span className="text-slate-400">{value}</span>
    </span>
  )
}

export function ScenarioDetailShell() {
  const { scenarioId } = useParams()
  const location = useLocation()
  const scenario = useAppStore((state) =>
    scenarioId ? state.scenarios.find((item) => item.id === scenarioId) : undefined,
  )
  const client = useAppStore((state) =>
    scenario ? state.clients.find((item) => item.id === scenario.clientId) : undefined,
  )
  const setActiveModule = useAppStore((state) => state.setScenarioActiveModule)

  if (!scenarioId || !scenario || !client) {
    return (
      <div className="space-y-4 rounded-xl border border-dashed border-gray-800 p-8 text-center">
        <p className="text-lg font-semibold text-gray-100">Scenario not found</p>
        <p className="text-sm text-gray-500">Start from Dashboard to create or select a saved risk review.</p>
        <div>
          <Button asChild>
            <Link to="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  const includedTabs = scenario.includedModules
  if (!includedTabs.length) {
    return (
      <div className="space-y-4 rounded-xl border border-dashed border-gray-800 p-8 text-center">
        <p className="text-lg font-semibold text-gray-100">No modules selected</p>
        <p className="text-sm text-gray-500">
          This scenario has no included modules. Start a new risk review from Dashboard.
        </p>
        <div>
          <Button asChild>
            <Link to="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }
  const firstTab = includedTabs[0]
  const activeTab = includedTabs.find((module) => location.pathname.endsWith(`/${module}`))
  if (!activeTab && firstTab) {
    return <Navigate to={`/scenarios/${scenarioId}/${firstTab}`} replace />
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800/90 bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(2,6,23,0.48))] px-5 py-5 shadow-xl shadow-black/10 sm:px-7 sm:py-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
          <Link to="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-200">
            <RiArrowLeftLine className="size-4" aria-hidden="true" />
            Dashboard
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-slate-400">{client.displayName}</span>
          <span className="text-slate-700">/</span>
          <span className="font-medium text-slate-200">{scenario.name}</span>
        </nav>

        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center rounded-full bg-blue-950/90 px-3 py-1 text-xs font-semibold text-blue-300 ring-1 ring-blue-800/80">
                {formatStatus(scenario.status)}
              </span>
              <ScenarioMetaItem icon={RiCalendarLine} label="Updated" value={toDateLabel(scenario.updatedAt)} />
              <ScenarioMetaItem icon={RiTimeLine} label="Calculated" value={toDateLabel(scenario.lastCalculatedAt)} />
            </div>

            <div className="space-y-2">
              <h1 className="max-w-5xl text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
                {scenario.name}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-400">
                {client.displayName} · Advisor-guided risk review modules selected for this client scenario.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-start xl:justify-end">
            <Button variant="secondary" asChild className="h-11 rounded-xl px-5 text-base">
              <Link to={`/present/${scenarioId}`}>
                <RiPresentationLine className="size-4" aria-hidden="true" />
                Presentation Mode
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-7 border-t border-slate-800/80 pt-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600">Risk Modules</p>
              {activeTab ? (
                <p className="mt-1 text-sm text-slate-400">{tabConfig[activeTab].subtitle}</p>
              ) : null}
            </div>

            <div className="flex w-full max-w-full flex-wrap items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-950/70 p-1.5 lg:w-auto">
              {includedTabs.map((module) => {
                const tab = tabConfig[module]
                return (
                  <NavLink
                    key={module}
                    to={`/scenarios/${scenarioId}/${module}`}
                    onClick={() => setActiveModule(scenarioId, module)}
                    className={({ isActive }) =>
                      cx(
                        "inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all sm:px-4",
                        isActive
                          ? "bg-blue-950/70 text-white shadow-sm ring-1 ring-blue-700/70"
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-100",
                      )
                    }
                  >
                    <tab.icon className="size-4 shrink-0" aria-hidden="true" />
                    <span>{tab.label}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <Outlet />
    </div>
  )
}
