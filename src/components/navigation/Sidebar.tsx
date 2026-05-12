import { siteConfig } from "@/lib/siteConfig"
import { cx, focusRing } from "@/lib/utils"
import {
  RiBarChartBoxLine,
  RiHome2Line,
  RiSettings5Line,
  RiTeamLine,
} from "@remixicon/react"
import { NavLink } from "react-router-dom"

const navigation = [
  { name: "Dashboard", href: siteConfig.baseLinks.home, icon: RiHome2Line },
  { name: "Clients", href: siteConfig.baseLinks.clients, icon: RiTeamLine },
  { name: "Reports", href: "/reports", icon: RiBarChartBoxLine },
] as const

export function Sidebar() {
  return (
    <nav className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <aside className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-4 pb-4 pt-5 dark:border-gray-800 dark:bg-gray-950">
        {/* Logo */}
        <div className="flex items-center gap-x-3 px-1">
          <div className="flex size-9 items-center justify-center rounded-md bg-indigo-600 dark:bg-indigo-500">
            <RiBarChartBoxLine className="size-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              {siteConfig.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {siteConfig.advisor.firm}
            </p>
          </div>
        </div>

        {/* Core navigation */}
        <nav aria-label="core navigation links" className="flex flex-1 flex-col">
          <ul role="list" className="space-y-0.5">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive: active }) =>
                    cx(
                      active
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-700 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
                      "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition hover:bg-gray-100 hover:dark:bg-gray-900",
                      focusRing,
                    )
                  }
                >
                  <item.icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Settings at bottom */}
        <div className="mt-auto border-t border-gray-200 pt-3 dark:border-gray-800">
          <NavLink
            to={siteConfig.baseLinks.settings.general}
            className={({ isActive: active }) =>
              cx(
                active
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-700 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
                "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition hover:bg-gray-100 hover:dark:bg-gray-900",
                focusRing,
              )
            }
          >
            <RiSettings5Line className="size-4 shrink-0" aria-hidden="true" />
            Settings
          </NavLink>
        </div>
      </aside>
    </nav>
  )
}
