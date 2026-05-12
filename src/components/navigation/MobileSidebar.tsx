import { siteConfig } from "@/lib/siteConfig"
import { cx, focusRing } from "@/lib/utils"
import {
  RiBarChartBoxLine,
  RiHome2Line,
  RiMenuLine,
  RiSettings5Line,
  RiTeamLine,
} from "@remixicon/react"
import React from "react"
import { NavLink } from "react-router-dom"
import { Button } from "@/components/Button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/Drawer"

const navigation = [
  { name: "Dashboard", href: siteConfig.baseLinks.home, icon: RiHome2Line },
  { name: "Clients", href: siteConfig.baseLinks.clients, icon: RiTeamLine },
  { name: "Reports", href: "/reports", icon: RiBarChartBoxLine },
] as const

export default function MobileSidebar() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          aria-label="open sidebar"
          className="group flex items-center rounded-md p-2 text-sm font-medium hover:bg-gray-100 data-[state=open]:bg-gray-100 hover:dark:bg-gray-800/80 data-[state=open]:dark:bg-gray-800/80 lg:hidden"
        >
          <RiMenuLine className="size-6 shrink-0 sm:size-5" aria-hidden="true" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-72">
        <DrawerHeader>
          <DrawerTitle>{siteConfig.name}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <nav aria-label="core mobile navigation links" className="flex flex-1 flex-col space-y-8">
            <ul role="list" className="space-y-1.5">
              {navigation.map((item) => (
                <li key={item.name}>
                  <DrawerClose asChild>
                    <NavLink
                      to={item.href}
                      end={item.href === "/"}
                      className={({ isActive }) =>
                        cx(
                          isActive
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
                          "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-base font-medium transition hover:bg-gray-100 sm:text-sm hover:dark:bg-gray-900",
                          focusRing,
                        )
                      }
                    >
                      <item.icon className="size-4 shrink-0" aria-hidden="true" />
                      {item.name}
                    </NavLink>
                  </DrawerClose>
                </li>
              ))}
            </ul>

            <div className="mt-auto border-t border-gray-200 pt-3 dark:border-gray-800">
              <DrawerClose asChild>
                <NavLink
                  to={siteConfig.baseLinks.settings.general}
                  className={({ isActive }) =>
                    cx(
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
                      "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-base font-medium transition hover:bg-gray-100 sm:text-sm hover:dark:bg-gray-900",
                      focusRing,
                    )
                  }
                >
                  <RiSettings5Line className="size-4 shrink-0" aria-hidden="true" />
                  Settings
                </NavLink>
              </DrawerClose>
            </div>
          </nav>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
