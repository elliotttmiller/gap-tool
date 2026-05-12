import { useState, useRef, useEffect } from "react"
import { Link, Outlet } from "react-router-dom"
import { LayoutDashboard, Settings, X } from "lucide-react"
import { AssumptionsPage } from "@/pages/Assumptions"

export function AppShell() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!settingsOpen) return
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [settingsOpen])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSettingsOpen(false)
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  return (
    <div className="min-h-screen min-w-7xl bg-[#0d1b2a]">
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-brand-500/30 bg-linear-to-br from-[#0d1b2a] to-[#1e3248] shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="mx-auto flex h-full max-w-400 items-center px-8">
          <div className="flex flex-1 justify-start">
            <Link
              to="/"
              aria-label="Dashboard"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
          </div>

          <div className="flex flex-1 justify-center">
            <Link to="/" aria-label="Home">
              <img
                src={`${import.meta.env.BASE_URL}northstar-logo.svg`}
                alt="North Star Resource Group"
                className="h-11 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex flex-1 justify-end">
            <button
              ref={buttonRef}
              aria-label="Settings"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen((v) => !v)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <span className="text-sm font-medium">Settings</span>
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {settingsOpen && (
        <div
          ref={panelRef}
          className="fixed inset-x-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-brand-500/30 bg-[#0d1b2a] shadow-2xl"
        >
          <div className="mx-auto max-w-5xl px-8 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-50">Settings</h2>
                <p className="mt-0.5 text-sm text-gray-400">Model assumptions and governance configuration.</p>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                aria-label="Close settings"
                className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <AssumptionsPage />
          </div>
        </div>
      )}

      <main className="pt-16">
        <div className="mx-auto max-w-400 px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
