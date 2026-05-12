import { TabNavigation, TabNavigationLink } from "@/components/TabNavigation"
import { Card } from "@/components/Card"
import { siteConfig } from "@/lib/siteConfig"
import { Outlet, NavLink, useLocation } from "react-router-dom"

const tabs = [
  { name: "General", href: siteConfig.baseLinks.settings.general },
  { name: "Billing", href: siteConfig.baseLinks.settings.billing },
  { name: "Users", href: siteConfig.baseLinks.settings.users },
]

export function SettingsLayout() {
  const location = useLocation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Settings</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your advisor profile, billing, and team access.
        </p>
      </div>

      <TabNavigation>
        {tabs.map((tab) => (
          <TabNavigationLink
            key={tab.name}
            asChild
            active={location.pathname === tab.href}
          >
            <NavLink to={tab.href}>{tab.name}</NavLink>
          </TabNavigationLink>
        ))}
      </TabNavigation>

      <Card className="p-6">
        <Outlet />
      </Card>
    </div>
  )
}
