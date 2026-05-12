import { DisabilityOutputs } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts"
import { getDisabilityNarrative } from "../constants/moduleCopy"

interface DisabilityOutputViewProps {
  outputs: DisabilityOutputs
}

export function DisabilityOutputView({ outputs }: DisabilityOutputViewProps) {
  // Use the first month of maximum gap to visualize the typical need vs available
  const maxGapPoint = outputs.timeline.reduce(
    (max, point) => (point.monthlyGap > max.monthlyGap ? point : max),
    outputs.timeline[0] || { availableIncome: 0, monthlyGap: 0, monthlyExpenses: 0 }
  )
  const monthlyAvailableIncome = maxGapPoint?.availableIncome || 0
  const monthlyIncomeGap = maxGapPoint?.monthlyGap || 0

  // Chart 1: Income vs Expenses (Protection Gap Stack)
  const gapStackData = [
    {
      name: "Total Expense Need",
      Expenses: maxGapPoint?.monthlyExpenses || 0,
      Available: 0,
      Gap: 0,
    },
    {
      name: "Available vs Gap",
      Expenses: 0,
      Available: monthlyAvailableIncome,
      Gap: monthlyIncomeGap > 0 ? monthlyIncomeGap : 0,
    }
  ]
  
  // Custom tooltip for stack
  const CustomStackTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm text-sm">
          <p className="font-medium text-slate-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            entry.value > 0 && (
               <div key={index} className="flex justify-between gap-4 mb-1">
                 <span style={{ color: entry.color }}>{entry.name}:</span>
                 <span className="font-semibold">{formatCurrency(entry.value)}/mo</span>
               </div>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  const timelineData = outputs.timeline?.map((t) => ({
    Month: `M${t.month}`,
    ReserveBalance: t.endingReserve,
    Shortfall: t.monthlyGap > 0 ? t.monthlyGap : 0,
  })) || []

  return (
    <div className="space-y-6 flex flex-col h-full w-full">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Monthly Gap</div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">
              {formatCurrency(outputs.averageMonthlyGap)}<span className="text-sm font-normal text-slate-500">/mo</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reserve Depletion</div>
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {outputs.reserveDepletionMonth === null 
                ? "Infinite" 
                : `Month ${outputs.reserveDepletionMonth}`}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 sm:col-span-2 md:col-span-1">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lifestyle Compression</div>
            <div className="text-2xl font-bold tracking-tight text-rose-600">
              {formatPercent(outputs.lifestyleCompressionRequired)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Required spending cut</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Peak Gap Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapStackData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={80}>
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis 
                  tickFormatter={(val) => `$${val / 1000}k`} 
                  tick={{ fill: "#64748b", fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip content={<CustomStackTooltip />} cursor={{ fill: "transparent" }} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                <Bar dataKey="Expenses" stackId="a" fill="#334155" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Available" stackId="a" fill="#22c55e" />
                <Bar dataKey="Gap" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reserve Depletion Timeline</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorReserveDI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorShortfallDI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="Month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis 
                  tickFormatter={(val) => `$${val / 1000}k`} 
                  tick={{ fill: "#64748b", fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                <Area type="monotone" dataKey="ReserveBalance" name="Cash Reserves" stroke="#22c55e" fillOpacity={1} fill="url(#colorReserveDI)" />
                <Area type="monotone" dataKey="Shortfall" name="Unfunded Shortfall" stroke="#f43f5e" fillOpacity={1} fill="url(#colorShortfallDI)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Benefit Summary</div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-sm text-slate-600">Total Benefits</span>
                <span className="font-semibold text-slate-900">{formatCurrency(outputs.totalBenefitsReceived)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Exposure</div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-sm text-slate-600">Total Uncovered Gap</span>
                <span className="font-semibold text-amber-600">{formatCurrency(outputs.totalUncoveredGap)}</span>
              </div>
              <div className="text-xs text-slate-500">
                Assumes a modeled duration of {outputs.timeline.length} months.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 text-white border-0 shadow-md">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-400 mb-2 uppercase tracking-wider text-xs">Advisor Narrative</h4>
          <p className="text-sm text-slate-300 leading-relaxed">
             {getDisabilityNarrative(outputs)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
