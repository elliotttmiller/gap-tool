import { siteConfig } from "@/lib/siteConfig"
import { cx, focusRing } from "@/lib/utils"
import {
  RiHome2Line,
  RiSettings5Line,
  RiEqualizerLine,
} from "@remixicon/react"
import { NavLink } from "react-router-dom"

const navigation = [
  { name: "Dashboard", href: siteConfig.baseLinks.home, icon: RiHome2Line },
  { name: "Assumptions", href: siteConfig.baseLinks.assumptions, icon: RiEqualizerLine },
] as const

export function Sidebar() {
  return (
    <nav className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <aside className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-blue-950 bg-[#0a1628] px-4 pb-4 pt-5">
        {/* Logo */}
        <div className="flex items-center px-1 pb-3 pt-1">
          <img
            src={`${import.meta.env.BASE_URL}northstar-logo.svg`}
            alt="North Star Resource Group"
            className="h-20 w-auto max-w-full object-contain"
          />
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
                        ? "bg-blue-900/40 text-white"
                        : "text-blue-200/70 hover:text-white hover:bg-blue-900/30",
                      "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition",
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
        <div className="mt-auto border-t border-blue-950 pt-3">
          <NavLink
            to={siteConfig.baseLinks.settings.general}
            className={({ isActive: active }) =>
              cx(
                active
                  ? "bg-blue-900/40 text-white"
                  : "text-blue-200/70 hover:text-white hover:bg-blue-900/30",
                "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition",
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
