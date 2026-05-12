import { UnemploymentOutputs } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts"
import { getUnemploymentNarrative } from "../constants/moduleCopy"

interface UnemploymentOutputViewProps {
  outputs: UnemploymentOutputs
}

export function UnemploymentOutputView({ outputs }: UnemploymentOutputViewProps) {
  const chartData = outputs.timeline.map((t) => ({
    Month: `M${t.month}`,
    ReserveBalance: t.reserveBalance,
    Shortfall: t.shortfall,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-3 border border-gray-700 rounded-lg shadow-sm text-sm">
          <p className="font-medium text-gray-100 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
             <div key={index} className="flex justify-between gap-4 mb-1">
               <span style={{ color: entry.color }}>{entry.name}:</span>
               <span className="font-semibold">{formatCurrency(entry.value)}</span>
             </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 flex flex-col h-full w-full">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card className="border-gray-800">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Severance & Assets</div>
            <div className="text-2xl font-bold tracking-tight text-gray-50">
              {formatCurrency(outputs.severanceTotal + (outputs.timeline[0]?.reserveBalance || 0) - outputs.severanceTotal)}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Starting liquidity buffer</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cash Depletion Month</div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">
              {outputs.reserveDepletionMonth < 0 ? "Infinite" : `Month ${outputs.reserveDepletionMonth}`}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Months until $0 savings</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 sm:col-span-2 md:col-span-1">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Search Shortfall</div>
            <div className="text-2xl font-bold tracking-tight text-rose-600">
              {formatCurrency(outputs.totalUncoveredShortfall)}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Unfunded gap across search</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reserve Depletion Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-75 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorReserve" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorShortfall" x1="0" y1="0" x2="0" y2="1">
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
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
              <Area type="monotone" dataKey="ReserveBalance" name="Cash Reserves" stroke="#22c55e" fillOpacity={1} fill="url(#colorReserve)" />
              <Area type="monotone" dataKey="Shortfall" name="Unfunded Shortfall" stroke="#f43f5e" fillOpacity={1} fill="url(#colorShortfall)" />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#090E1A] text-white border border-gray-800">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-400 mb-2 uppercase tracking-wider text-xs">Advisor Narrative</h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            {getUnemploymentNarrative(outputs)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
