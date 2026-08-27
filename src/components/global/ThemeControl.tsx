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
      className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white/75 transition hover:border-brand-400/70 hover:bg-brand-500/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  )
}

export function ThemePicker() {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <p className="text-sm font-semibold text-[#4f4f54] dark:text-white">Appearance</p>
      <p className="mt-1 text-xs text-[#4f4f54]/70 dark:text-white/65">Choose a theme or follow this device.</p>
      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-[#4f4f54]/15 bg-[#f7f7f7] p-1 dark:border-white/15 dark:bg-white/8">
        {options.map(({ value, label, icon: Icon }) => {
          const active = theme === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={active}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? "bg-white text-brand-700 shadow-sm ring-1 ring-brand-500/25 dark:bg-brand-500 dark:text-white dark:ring-brand-400/50" : "text-[#4f4f54]/70 hover:bg-brand-50 hover:text-brand-700 dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-white"}`}
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
