import { NavLink, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  FileText, 
  Settings, 
  X,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Umbrella,
  Heart,
  Briefcase,
  Scale
} from "lucide-react"
import { useState } from "react"

export function SidebarNav({ onClose }: { onClose?: () => void }) {
  const location = useLocation()
  const [isRiskModulesOpen, setIsRiskModulesOpen] = useState(true)

  const routes = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Scenarios", href: "/scenarios/list", icon: Layers },
  ]

  const riskModules = [
    { name: "Disability", href: "/scenarios/1/disability", icon: Umbrella },
    { name: "Life Insurance", href: "/scenarios/1/life", icon: Heart },
    { name: "Unemployment", href: "/scenarios/1/unemployment", icon: Briefcase },
    { name: "Liability", href: "/scenarios/1/liability", icon: Scale },
  ]

  return (
    <aside className="w-full h-full bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-white/5">
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800">
        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Navigation</span>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 px-2">Main</div>
        {routes.map((route) => (
          <NavLink
            key={route.href}
            to={route.href}
            end={route.href === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer group ${
                isActive
                  ? "bg-blue-600 shadow-lg shadow-blue-600/20 text-white font-medium"
                  : "hover:bg-white/5 text-slate-400 hover:text-white"
              }`
            }
          >
            <route.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
            <span className="text-sm">{route.name}</span>
          </NavLink>
        ))}

        <div className="pt-4">
          <button 
            onClick={() => setIsRiskModulesOpen(!isRiskModulesOpen)}
            className="w-full flex items-center justify-between px-2 mb-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold hover:text-slate-300 transition-colors"
          >
            Risk Modules
            {isRiskModulesOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          
          {isRiskModulesOpen && (
            <div className="space-y-1 ml-1 border-l border-slate-800 pl-3 mt-2">
              {riskModules.map((module) => (
                <NavLink
                  key={module.href}
                  to={module.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-1.5 rounded-md transition-all text-sm ${
                      isActive
                        ? "text-blue-400 font-medium"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    }`
                  }
                >
                  <module.icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{module.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 px-2">Workspace</div>
          <NavLink
            to="/reports"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
                isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <FileText className="h-4 w-4" />
            <span>Reports</span>
          </NavLink>
          <NavLink
            to="/assumptions"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
                isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Assumptions</span>
          </NavLink>
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
                isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>
      <div className="p-4 border-t border-white/5 bg-slate-900/50">
        <div className="bg-slate-800/40 rounded-lg border border-white/5 p-3">
          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">NorthStar Engine</div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 font-mono">v1.2.0-stable</div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse"></div>
          </div>
        </div>
      </div>
    </aside>
  )
}
