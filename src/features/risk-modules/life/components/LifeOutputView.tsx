import { LifeOutputs } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { getLifeInsuranceNarrative } from "../constants/moduleCopy"

interface LifeOutputViewProps {
  outputs: LifeOutputs
}

export function LifeOutputView({ outputs }: LifeOutputViewProps) {
  const chartData = [
    { name: "Total Need", value: outputs.baseProtectionNeed, color: "#334155" }, // slate-700
    { name: "Existing", value: outputs.existingCoverageTotal, color: "#22c55e" }, // green-500
    { name: "Uncovered Gap", value: outputs.remainingGap, color: "#f59e0b" }, // amber-500
  ]

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-500 mb-1">Total Remaining Gap</div>
            <div className="text-3xl font-bold tracking-tight text-amber-600">
              {formatCurrency(outputs.remainingGap)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-500 mb-1">Coverage Offset</div>
            <div className="text-3xl font-bold tracking-tight text-slate-900">
              {formatPercent(outputs.coverageOffsetPercentage)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Protection Gap Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis 
                tickFormatter={(val) => `$${val / 1000}k`} 
                tick={{ fill: "#64748b", fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                cursor={{ fill: "transparent" }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-900 text-white border-0 shadow-md">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-400 mb-2 uppercase tracking-wider text-xs">Advisor Narrative</h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            {getLifeInsuranceNarrative(outputs)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
