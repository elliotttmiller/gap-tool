import { Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Layers, 
  FileText, 
  Activity, 
  Plus, 
  Presentation, 
  ClipboardCheck, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  History,
  ArrowRight
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell
} from "recharts"
import { formatCurrency } from "@/lib/utils"

export function Dashboard() {
  const summaryMetrics = [
    { label: "Total Clients", value: "32", detail: "+2 this month", icon: Users },
    { label: "Active Scenarios", value: "14", detail: "4 pending review", icon: Layers },
    { label: "Reports Generated", value: "128", detail: "8 this week", icon: FileText },
    { label: "Avg. Modeled Gap", value: "$4.2k", detail: "Per month", icon: Activity },
  ]

  const riskExposureData = [
    { module: "Disability", gap: 4200, color: "#f59e0b" },
    { module: "Life Ins.", gap: 3100, color: "#3b82f6" },
    { module: "Unemployment", gap: 1500, color: "#10b981" },
    { module: "Liability", gap: 800, color: "#ef4444" },
  ]

  const recentScenarios = [
    { client: "Elliott Miller", scenario: "Miller Household - Risk Review", module: "Disability", gap: "$4,250", status: "Calculated", action: "Review Results", id: "1" },
    { client: "Sarah Davis", scenario: "Davis Protection Update", module: "Life Insurance", gap: "$2,800", status: "Incomplete", action: "Continue", id: "2" },
    { client: "Robert Chen", scenario: "Chen Retirement Income", module: "Disability", gap: "$1,100", status: "Ready", action: "Open Presentation", id: "3" },
  ]

  const taskQueue = [
    { task: "Finish inputs for Chen scenario", priority: "High", due: "Today" },
    { task: "Generate report for Miller family", priority: "Med", due: "Tomorrow" },
    { task: "Review new DI assumption standard", priority: "Low", due: "May 15" },
  ]

  return (
    <div className="flex flex-col h-full bg-slate-50/50 overflow-y-auto scrollbar-hide">
      {/* Advisor Workspace Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Advisor Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm">Advisor income gap analysis and risk visualization workspace.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Create Client
            </Button>
            <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
              <Activity className="w-4 h-4 mr-2 text-slate-400" />
              Start Scenario
            </Button>
            <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
              <FileText className="w-4 h-4 mr-2 text-slate-400" />
              Reports
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Book-of-Business Summary Metrics */}
        <section>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {summaryMetrics.map((metric, i) => (
              <Card key={i} className="border-slate-200/60 shadow-sm overflow-hidden group hover:border-blue-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <metric.icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{metric.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
                  <div className="text-xs text-slate-500 mt-1 font-medium italic">{metric.detail}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Risk Exposure Overview */}
          <Card className="lg:col-span-2 border-slate-200/60 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-500" />
                  Risk Exposure Overview
                </CardTitle>
                <Link to="/scenarios/list" className="text-xs text-blue-600 hover:underline font-medium">View Analysis</Link>
              </div>
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskExposureData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="module" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [formatCurrency(value), 'Avg. Gap']}
                  />
                  <Bar dataKey="gap" radius={[0, 4, 4, 0]} barSize={24}>
                    {riskExposureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Advisor Task Queue */}
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/30">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <ClipboardCheck size={16} className="text-emerald-500" />
                Action Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {taskQueue.map((t, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      t.priority === 'High' ? 'bg-rose-500' : t.priority === 'Med' ? 'bg-amber-500' : 'bg-slate-300'
                    }`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-700">{t.task}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Due: {t.due}</div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 mt-1" />
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                <Button variant="ghost" size="sm" className="w-full text-slate-500 text-xs hover:text-slate-900 border border-slate-200 bg-white">
                  View Full Task Queue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client / Scenario Tracking Table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 font-sans tracking-tight">Active Workspaces</h2>
            <Link to="/scenarios/list" className="text-sm text-blue-600 hover:underline font-medium inline-flex items-center gap-1 group">
              View all scenarios
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client & Scenario</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Module</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Modeled Gap</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentScenarios.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{row.client}</div>
                        <div className="text-xs text-slate-500">{row.scenario}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                          {row.module}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-amber-600">{row.gap}</div>
                        <div className="text-[10px] text-slate-400">Monthly protection gap</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.status === 'Calculated' || row.status === 'Ready' 
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' 
                            : 'text-amber-700 bg-amber-50 border border-amber-100'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold text-xs" asChild>
                          <Link to={`/scenarios/${row.id}/disability`}>
                            {row.action}
                            <ChevronRight size={14} className="ml-1" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Governance / Assumptions Card */}
          <Card className="border-slate-200/60 shadow-sm bg-slate-900 border-none">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2 text-xs">
                <ShieldCheck size={16} />
                Model Governance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="text-xs text-slate-400">Formula Version</div>
                  <div className="text-xs text-white font-mono bg-white/10 px-2 py-0.5 rounded">v1.0.4-di</div>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="text-xs text-slate-400">Assumption Set</div>
                  <div className="text-xs text-emerald-400 font-medium">Firm Standard</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">Last Engine Sync</div>
                  <div className="text-xs text-slate-500">May 12, 2026</div>
                </div>
                <Button className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white text-xs border border-white/5" asChild>
                  <Link to="/assumptions">Audit Model Logic</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Presentations and Reports */}
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Presentation size={16} className="text-purple-500" />
                Recent Presentations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <History size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Presentation History</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
                    Client presentations generated in the last 7 days will appear here.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="text-xs border-slate-200">
                  Access Archive
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
