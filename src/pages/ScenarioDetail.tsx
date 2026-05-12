import { Button } from "@/components/Button"
import { RiskModuleType, useAppStore } from "@/lib/store"
import { cx } from "@/lib/utils"
import {
  RiArrowLeftLine,
  RiHeartPulseLine,
  RiPresentationLine,
  RiScalesLine,
  RiShieldCheckLine,
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
    subtitle: "Job loss runway",
    icon: RiShieldCheckLine,
  },
  liability: {
    label: "Liability / Lawsuit",
    subtitle: "Asset exposure",
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
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
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
    <div className="space-y-0">
      <div className="mb-6">
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-gray-500">
          <Link to="/" className="flex items-center gap-1 transition-colors hover:text-gray-200">
            <RiArrowLeftLine className="size-3.5" aria-hidden="true" />
            Dashboard
          </Link>
          <span className="text-gray-700">/</span>
          <span>{client.displayName}</span>
          <span className="text-gray-700">/</span>
          <span className="font-medium text-gray-200">{scenario.name}</span>
        </nav>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-950 px-2.5 py-0.5 text-xs font-medium text-blue-300 ring-1 ring-blue-900">
                {formatStatus(scenario.status)}
              </span>
              <span className="text-xs text-gray-600">Updated: {toDateLabel(scenario.updatedAt)}</span>
              <span className="text-xs text-gray-600">Calculated: {toDateLabel(scenario.lastCalculatedAt)}</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-50">{scenario.name}</h1>
            <p className="mt-1 text-sm text-gray-400">
              {client.displayName} · Risk review modules selected for this client scenario.
            </p>
          </div>
          <Button variant="secondary" asChild className="shrink-0">
            <Link to={`/present/${scenarioId}`}>
              <RiPresentationLine className="size-4" aria-hidden="true" />
              Presentation Mode
            </Link>
          </Button>
        </div>
      </div>

      <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-xl bg-gray-900 p-1 ring-1 ring-gray-800">
        {includedTabs.map((module) => {
          const tab = tabConfig[module]
          return (
            <NavLink
              key={module}
              to={`/scenarios/${scenarioId}/${module}`}
              onClick={() => setActiveModule(scenarioId, module)}
              className={({ isActive }) =>
                cx(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#0a1628] text-white shadow-sm ring-1 ring-blue-900"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-100",
                )
              }
            >
              <tab.icon className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{tab.label}</span>
            </NavLink>
          )
        })}
      </div>

      {activeTab ? (
        <p className="mt-3 text-xs text-gray-500">{tabConfig[activeTab].subtitle}</p>
      ) : null}

      <div className="pt-6">
        <Outlet />
      </div>
    </div>
  )
}
