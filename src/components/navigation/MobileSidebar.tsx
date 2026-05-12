import { siteConfig } from "@/lib/siteConfig"
import { cx, focusRing } from "@/lib/utils"
import {
  RiBarChartBoxLine,
  RiEqualizerLine,
  RiHome2Line,
  RiMenuLine,
  RiSettings5Line,
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
  { name: "Reports", href: "/reports", icon: RiBarChartBoxLine },
  { name: "Assumptions", href: siteConfig.baseLinks.assumptions, icon: RiEqualizerLine },
] as const

export default function MobileSidebar() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          aria-label="open sidebar"
          className="group flex items-center rounded-md p-2 text-sm font-medium text-blue-200/70 hover:bg-blue-900/30 hover:text-white lg:hidden"
        >
          <RiMenuLine className="size-6 shrink-0 sm:size-5" aria-hidden="true" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-72 bg-[#0a1628] border-blue-950">
        <DrawerHeader>
          <DrawerTitle className="text-white">{siteConfig.name}</DrawerTitle>
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
                            ? "bg-blue-900/40 text-white"
                            : "text-blue-200/70 hover:text-white hover:bg-blue-900/30",
                          "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-base font-medium transition sm:text-sm",
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

            <div className="mt-auto border-t border-blue-950 pt-3">
              <DrawerClose asChild>
                <NavLink
                  to={siteConfig.baseLinks.settings.general}
                  className={({ isActive }) =>
                    cx(
                      isActive
                        ? "bg-blue-900/40 text-white"
                        : "text-blue-200/70 hover:text-white hover:bg-blue-900/30",
                      "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-base font-medium transition sm:text-sm",
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
