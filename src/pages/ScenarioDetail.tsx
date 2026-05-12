import { Button } from "@/components/Button"
import { cx } from "@/lib/utils"
import {
  RiArrowLeftLine,
  RiHeartPulseLine,
  RiPresentationLine,
  RiScalesLine,
  RiShieldCheckLine,
  RiUmbrellaLine,
} from "@remixicon/react"
import { NavLink, Outlet, useParams, Link } from "react-router-dom"

export function ScenarioDetailShell() {
  const { scenarioId } = useParams()

  const tabs = [
    { name: "Disability",     href: `/scenarios/${scenarioId}/disability`,   icon: RiUmbrellaLine },
    { name: "Life Insurance", href: `/scenarios/${scenarioId}/life`,         icon: RiHeartPulseLine },
    { name: "Unemployment",   href: `/scenarios/${scenarioId}/unemployment`, icon: RiShieldCheckLine },
    { name: "Liability",      href: `/scenarios/${scenarioId}/liability`,    icon: RiScalesLine },
  ]

  return (
    <div className="space-y-0">
      {/* Breadcrumb + header */}
      <div className="mb-6">
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-gray-500">
          <Link
            to="/clients"
            className="flex items-center gap-1 transition-colors hover:text-gray-200"
          >
            <RiArrowLeftLine className="size-3.5" aria-hidden="true" />
            Clients
          </Link>
          <span className="text-gray-700">/</span>
          <span>Elliott Miller</span>
          <span className="text-gray-700">/</span>
          <span className="font-medium text-gray-200">Risk Review</span>
        </nav>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-950 px-2.5 py-0.5 text-xs font-medium text-blue-300 ring-1 ring-blue-900">
                Calculated
              </span>
              <span className="text-xs text-gray-600">Last updated: Jan 15, 2025</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-50">
              Miller Household – Risk Review
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Income gap analysis across all risk modules. Outputs are illustrative planning scenarios
              based on advisor-entered data and selected assumptions.
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

      {/* Pill tab nav */}
      <div className="inline-flex items-center gap-0.5 rounded-xl bg-gray-900 p-1 ring-1 ring-gray-800">
        {tabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.href}
            className={({ isActive }) =>
              cx(
                "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-[#0a1628] text-white shadow-sm ring-1 ring-blue-900"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-100",
              )
            }
          >
            <tab.icon className="size-3.5 shrink-0" aria-hidden="true" />
            {tab.name}
          </NavLink>
        ))}
      </div>

      {/* Active module content */}
      <div className="pt-6">
        <Outlet />
      </div>
    </div>
  )
}