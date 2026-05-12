import { Sidebar } from "@/components/navigation/Sidebar"
import MobileSidebar from "@/components/navigation/MobileSidebar"
import { siteConfig } from "@/lib/siteConfig"
import { Outlet } from "react-router-dom"

export function AppShell() {
  return (
    <div className="mx-auto max-w-screen-2xl">
      <Sidebar />
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-950 sm:px-6 lg:hidden">
        <MobileSidebar />
        <div className="flex items-center gap-x-3">
          <img
            src="/northstar-logo.svg"
            alt="North Star Resource Group"
            className="h-8 w-auto object-contain"
          />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            {siteConfig.name}
          </span>
        </div>
      </div>
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
