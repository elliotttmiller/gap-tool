import { Button } from "@/components/Button"
import { ModuleErrorBoundary } from "@/components/global/ModuleErrorBoundary"
import { RiskModuleType, useAppStore } from "@/lib/store"
import { formatDate } from "@/lib/utils"
import { RiCalendarLine } from "@remixicon/react"
import { Link, Navigate, Outlet, useLocation, useParams } from "react-router-dom"

const tabConfig: Record<RiskModuleType, { label: string }> = {
  disability: { label: "Disability" },
  life: { label: "Life Insurance" },
  unemployment: { label: "Unemployment" },
  liability: { label: "Liability / Lawsuit" },
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
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
    <div className="space-y-6">
      <ModuleErrorBoundary>
        <Outlet />
      </ModuleErrorBoundary>
    </div>
  )
}
