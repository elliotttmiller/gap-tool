import { NavLink, Outlet, useParams, Link } from "react-router-dom"
import { 
  FileText, 
  ArrowLeft, 
  LayoutDashboard, 
  ClipboardList, 
  ShieldAlert, 
  TrendingUp, 
  BarChart3, 
  Presentation as PresentationIcon, 
  SearchCheck 
} from "lucide-react"

export function ScenarioDetailShell() {
  const { scenarioId } = useParams()

  const tabs = [
    { name: "Overview", href: `/scenarios/${scenarioId}/overview`, icon: LayoutDashboard },
    { name: "Inputs", href: `/scenarios/${scenarioId}/inputs`, icon: ClipboardList },
    { name: "Assumptions", href: `/scenarios/${scenarioId}/assumptions`, icon: ShieldAlert },
    { name: "Outputs", href: `/scenarios/${scenarioId}/outputs`, icon: TrendingUp },
    { name: "Charts", href: `/scenarios/${scenarioId}/charts`, icon: BarChart3 },
    { name: "Presentation", href: `/scenarios/${scenarioId}/presentation`, icon: PresentationIcon },
    { name: "Report", href: `/scenarios/${scenarioId}/report`, icon: FileText },
    { name: "Audit", href: `/scenarios/${scenarioId}/audit`, icon: SearchCheck },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-4 lg:pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 overflow-x-auto pb-1 min-w-max hidden-scrollbar">
            <Link to="/clients" className="hover:text-slate-900 flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Clients
            </Link>
            <span className="text-slate-300">/</span>
            <span className="truncate">Elliott Miller</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium truncate">Risk Review Scenario</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Miller Household - Risk Review</h1>
              <p className="text-slate-500 mt-1">Reviewing coverage gaps and financial exposure.</p>
            </div>
            <div className="flex items-center w-full sm:w-auto">
              <Link to={`/present/${scenarioId}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 h-10 px-4 py-2 gap-2 w-full sm:w-auto shadow-sm">
                <FileText className="w-4 h-4 text-slate-400" />
                Presentation Mode
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
        <div className="max-w-6xl mx-auto overflow-x-auto hidden-scrollbar">
          <nav className="flex space-x-6 sm:space-x-8 min-w-max" aria-label="Tabs">
            {tabs.map((tab) => (
              <NavLink
                key={tab.name}
                to={tab.href}
                className={({ isActive }) =>
                  `whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm transition-all flex items-center gap-2 group ${
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <tab.icon size={14} className={isActive ? "text-blue-500" : "text-slate-400 group-hover:text-slate-600"} />
                    {tab.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 pb-20">
        <Outlet />
      </div>
    </div>
  )
}
