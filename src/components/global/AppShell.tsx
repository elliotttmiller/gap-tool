import { useState, useRef, useEffect } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { ArrowLeft, Settings, X } from "lucide-react"
import { AssumptionsPage } from "@/pages/Assumptions"
import { InstallPWAButton } from "./InstallPWAButton"
import { PWAUpdateToast } from "./PWAUpdateToast"
import { ThemePicker, ThemeToggle } from "./ThemeControl"

export function AppShell() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()

  const scenarioMatch = location.pathname.match(/^\/scenarios\/([^/]+)/)
  const isInScenario = Boolean(scenarioMatch)

  useEffect(() => {
    if (!settingsOpen) return
    function handleClick(e: MouseEvent) {
      // Radix select menus are portaled outside both the dialog and settings
      // panel. Keep the settings tree mounted for every interaction while the
      // Analysis Center is open so scenario selection cannot dismiss the panel.
      if (document.querySelector("[data-analysis-center]")) return
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
      if (e.key === "Escape" && !document.querySelector("[data-analysis-center]")) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  return (
    <div className="app-shell-surface min-h-screen min-w-7xl text-[#4f4f54] transition-colors dark:text-white">
      <PWAUpdateToast />
      <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-white/15 bg-[#4f4f54]/98 shadow-[0_4px_18px_rgba(79,79,84,0.22)] backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-400 items-center px-8">
          <div className="flex flex-1 justify-start">
            {isInScenario ? (
              <Link
                to="/"
                aria-label="Back to Dashboard"
                className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-semibold">Back</span>
              </Link>
            ) : null}
          </div>

          <div className="flex flex-1 justify-center">
            <Link
              to="/"
              aria-label="North Star Resource Group home"
              className="flex h-20 items-center justify-center px-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
            >
              <img
                src={`${import.meta.env.BASE_URL}northstar-logo.svg`}
                alt="North Star Resource Group"
                className="h-7 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex flex-1 justify-end gap-1">
            <InstallPWAButton />
            <button
              ref={buttonRef}
              aria-label="Settings"
              title="Settings"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen((v) => !v)}
              className="flex size-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
            >
              <Settings className="h-4 w-4" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {settingsOpen && (
        <div
          ref={panelRef}
          className="fixed inset-x-0 top-20 z-40 max-h-[calc(100vh-5rem)] overflow-y-auto border-b border-[#4f4f54]/20 bg-white/98 shadow-[0_24px_60px_rgba(79,79,84,0.16)] backdrop-blur-xl dark:border-white/15 dark:bg-[#4f4f54]"
        >
          <div className="mx-auto max-w-5xl px-8 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#4f4f54] dark:text-white">Settings</h2>
                <p className="mt-0.5 text-sm text-[#4f4f54]/70 dark:text-white/65">Model assumptions and governance configuration.</p>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                aria-label="Close settings"
                className="rounded-md p-1.5 text-[#4f4f54]/70 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-8 max-w-sm">
              <ThemePicker />
            </div>
            <AssumptionsPage />
          </div>
        </div>
      )}

      <main className="pt-20">
        <div className={isInScenario ? "mx-auto max-w-400 px-4 py-4 sm:px-6 2xl:px-8" : "mx-auto max-w-400 px-8 py-8 sm:px-12"}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
