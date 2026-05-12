import { LiabilityOutputs } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { getLiabilityNarrative } from "../constants/moduleCopy"

interface LiabilityOutputViewProps {
  outputs: LiabilityOutputs
}

export function LiabilityOutputView({ outputs }: LiabilityOutputViewProps) {
  
  const chartData = [
    {
      name: "Total Asset Exposure",
      Coverage: outputs.totalCoverage,
      ExposureGap: outputs.exposureGap,
    }
  ]

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
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">At-Risk Assets</div>
            <div className="text-2xl font-bold tracking-tight text-gray-50">
              {formatCurrency(outputs.totalAtRiskAssets)}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Exposed net worth</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Coverage Limit</div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">
              {formatCurrency(outputs.totalCoverage)}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Base + Umbrella</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 sm:col-span-2 md:col-span-1">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Wealth Erosion</div>
            <div className="text-2xl font-bold tracking-tight text-rose-600">
              {formatPercent(outputs.wealthErosionPercentage)}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Percent of assets lost</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Liability Protection Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-75 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={80}>
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis 
                tickFormatter={(val) => `$${val / 1000}k`} 
                tick={{ fill: "#64748b", fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
              <Bar dataKey="Coverage" stackId="a" fill="#22c55e" radius={outputs.exposureGap > 0 ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
              <Bar dataKey="ExposureGap" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#090E1A] text-white border border-gray-800">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-400 mb-2 uppercase tracking-wider text-xs">Advisor Narrative</h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            {getLiabilityNarrative(outputs)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
