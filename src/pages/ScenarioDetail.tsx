import { TabNavigation, TabNavigationLink } from "@/components/TabNavigation"
import { Button } from "@/components/Button"
import {
  RiArrowLeftLine,
  RiFileTextLine,
  RiHeartPulseLine,
  RiPresentationLine,
  RiScalesLine,
  RiShieldCheckLine,
  RiUmbrellaLine,
} from "@remixicon/react"
import { NavLink, Outlet, useLocation, useParams, Link } from "react-router-dom"

export function ScenarioDetailShell() {
  const { scenarioId } = useParams()
  const location = useLocation()

  const tabs = [
    { name: "Disability", href: `/scenarios/${scenarioId}/disability`, icon: RiUmbrellaLine },
    { name: "Life Insurance", href: `/scenarios/${scenarioId}/life`, icon: RiHeartPulseLine },
    { name: "Unemployment", href: `/scenarios/${scenarioId}/unemployment`, icon: RiShieldCheckLine },
    { name: "Liability", href: `/scenarios/${scenarioId}/liability`, icon: RiScalesLine },
  ]

  return (
    <div className="space-y-0">
      {/* Page header */}
      <div className="mb-6">
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Link
            to="/clients"
            className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-50 transition-colors"
          >
            <RiArrowLeftLine className="size-3.5" aria-hidden="true" />
            Clients
          </Link>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <span className="text-gray-500 dark:text-gray-400">Elliott Miller</span>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <span className="font-medium text-gray-900 dark:text-gray-50">Risk Review</span>
        </nav>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              Miller Household – Risk Review
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Reviewing coverage gaps and financial exposure across all risk modules.
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

      {/* Module tabs */}
      <TabNavigation>
        {tabs.map((tab) => (
          <TabNavigationLink
            key={tab.name}
            asChild
            active={location.pathname === tab.href}
          >
            <NavLink to={tab.href} className="flex items-center gap-1.5">
              <tab.icon className="size-4 shrink-0" aria-hidden="true" />
              {tab.name}
            </NavLink>
          </TabNavigationLink>
        ))}
      </TabNavigation>

      {/* Active module content */}
      <div className="pt-6">
        <Outlet />
      </div>
    </div>
  )
}
