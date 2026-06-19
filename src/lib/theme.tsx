import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type ThemePreference = "light" | "dark" | "system"
type ResolvedTheme = Exclude<ThemePreference, "system">

type ThemeContextValue = {
  theme: ThemePreference
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemePreference) => void
  toggleTheme: () => void
}

const STORAGE_KEY = "northstar-theme"
const mediaQuery = "(prefers-color-scheme: dark)"

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getStoredTheme(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("theme")
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system"
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(mediaQuery).matches ? "dark" : "light"
}

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  root.classList.toggle("light", theme === "light")
  root.style.colorScheme = theme
  root.dataset.theme = theme
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute(
    "content",
    theme === "dark" ? "#0d1b2a" : "#c8dae0",
  )
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> }
}

function transitionTheme(theme: ResolvedTheme, updateState: () => void) {
  const root = document.documentElement
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const startViewTransition = (document as ViewTransitionDocument).startViewTransition?.bind(document)

  if (startViewTransition && !reduceMotion) {
    startViewTransition(() => {
      applyTheme(theme)
      updateState()
    })
    return
  }

  root.classList.add("theme-transitioning")
  applyTheme(theme)
  updateState()
  window.setTimeout(() => root.classList.remove("theme-transitioning"), 420)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(getStoredTheme)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)
  const resolvedTheme = theme === "system" ? systemTheme : theme

  useEffect(() => {
    const query = window.matchMedia(mediaQuery)
    const handleChange = (event: MediaQueryListEvent) => {
      const nextSystemTheme = event.matches ? "dark" : "light"
      if (theme === "system") transitionTheme(nextSystemTheme, () => setSystemTheme(nextSystemTheme))
      else setSystemTheme(nextSystemTheme)
    }
    query.addEventListener("change", handleChange)
    return () => query.removeEventListener("change", handleChange)
  }, [theme])

  useEffect(() => applyTheme(resolvedTheme), [resolvedTheme])

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    resolvedTheme,
    setTheme(nextTheme) {
      const nextResolvedTheme = nextTheme === "system" ? getSystemTheme() : nextTheme
      transitionTheme(nextResolvedTheme, () => setThemeState(nextTheme))
      localStorage.setItem(STORAGE_KEY, nextTheme)
      localStorage.removeItem("theme")
    },
    toggleTheme() {
      const nextTheme = resolvedTheme === "dark" ? "light" : "dark"
      transitionTheme(nextTheme, () => setThemeState(nextTheme))
      localStorage.setItem(STORAGE_KEY, nextTheme)
      localStorage.removeItem("theme")
    },
  }), [resolvedTheme, theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
