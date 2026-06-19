import { Monitor, Moon, Sun } from "lucide-react"
import { type ThemePreference, useTheme } from "@/lib/theme"

const options: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const Icon = resolvedTheme === "dark" ? Sun : Moon
  const destination = resolvedTheme === "dark" ? "light" : "dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${destination} theme`}
      title={`Switch to ${destination} theme`}
      className="flex size-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:shadow-none dark:hover:border-brand-500/50 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  )
}

export function ThemePicker() {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Appearance</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Choose a theme or follow this device.</p>
      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
        {options.map(({ value, label, icon: Icon }) => {
          const active = theme === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={active}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? "bg-white text-brand-700 shadow-sm ring-1 ring-black/5 dark:bg-gray-800 dark:text-brand-300 dark:ring-white/10" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"}`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
