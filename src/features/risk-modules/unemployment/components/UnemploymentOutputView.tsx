import { UnemploymentOutputs } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { getUnemploymentNarrative } from "../constants/moduleCopy"
import { AnimatedSection } from "@/components/ui/animated-section"
import { transformUnemploymentReserveGaugeData } from "../transformers/transformUnemploymentChartData"

interface UnemploymentOutputViewProps {
  outputs: UnemploymentOutputs
}

function ReserveBucketGauge({ outputs }: { outputs: UnemploymentOutputs }) {
  const chartData = transformUnemploymentReserveGaugeData(outputs)
  const { bucket, svg } = chartData

  return (
    <div className="flex flex-col items-center w-full">
      <svg viewBox={`0 0 ${svg.width} ${svg.height}`} className="w-full" aria-label="Emergency reserve savings bucket gauge">
        <rect x={bucket.x} y={bucket.y + bucket.height * 0.5} width={bucket.width} height={bucket.height * 0.5} fill="#7f1d1d" fillOpacity={0.3} />
        <rect x={bucket.x} y={bucket.y} width={bucket.width} height={bucket.height * 0.5} fill="#14532d" fillOpacity={0.3} />

        {chartData.fillRatio > 0 && (
          <rect x={bucket.x + 2} y={chartData.fillY} width={bucket.width - 4} height={chartData.fillHeight} fill={chartData.fillColor} fillOpacity={0.8} rx={2}>
            <animate attributeName="height" from="0" to={chartData.fillHeight} dur="900ms" begin="250ms" fill="freeze" />
            <animate attributeName="y" from={bucket.y + bucket.height - 2} to={chartData.fillY} dur="900ms" begin="250ms" fill="freeze" />
            <animate attributeName="opacity" from="0.25" to="1" dur="700ms" begin="250ms" fill="freeze" />
          </rect>
        )}

        <rect x={bucket.x} y={bucket.y} width={bucket.width} height={bucket.height} fill="none" stroke="#374151" strokeWidth={1.5} rx={4} />
        <line x1={bucket.x} y1={chartData.minLineY} x2={bucket.x + bucket.width} y2={chartData.minLineY} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 4" />

        {chartData.monthLabels.map((label) => (
          <text key={label.month} x={bucket.x - 8} y={label.y + 4} textAnchor="end" fill="#6b7280" fontSize={11}>{label.month}mo</text>
        ))}

        <text x={bucket.x + bucket.width / 2} y={bucket.y + bucket.height * 0.22} textAnchor="middle" fill="#86efac" fontSize={13} fontWeight="700">IDEAL RANGE</text>
        <text x={bucket.x + bucket.width / 2} y={bucket.y + bucket.height * 0.22 + 16} textAnchor="middle" fill="#86efac" fontSize={11}>3 to 6 months</text>
        <text x={bucket.x + bucket.width / 2} y={bucket.y + bucket.height * 0.78} textAnchor="middle" fill="#fca5a5" fontSize={12} fontWeight="600">MINIMUM</text>

        <line x1={bucket.x + bucket.width} y1={bucket.y + 8} x2={bucket.x + bucket.width + 18} y2={bucket.y + 8} stroke="#22c55e" strokeWidth={1} />
        <text x={bucket.x + bucket.width + 22} y={bucket.y + 5} fill="#22c55e" fontSize={10} fontWeight="700">OPTIMAL TARGET</text>
        <text x={bucket.x + bucket.width + 22} y={bucket.y + 19} fill="#22c55e" fontSize={14} fontWeight="800">{formatCurrency(outputs.optimalReserveTarget)}</text>
        <text x={bucket.x + bucket.width + 22} y={bucket.y + 32} fill="#6b7280" fontSize={10}>6 months of income</text>

        <line x1={bucket.x + bucket.width} y1={chartData.minLineY} x2={bucket.x + bucket.width + 18} y2={chartData.minLineY} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" />
        <text x={bucket.x + bucket.width + 22} y={chartData.minLineY - 7} fill="#f59e0b" fontSize={10} fontWeight="700">MINIMUM RESERVE</text>
        <text x={bucket.x + bucket.width + 22} y={chartData.minLineY + 5} fill="#f59e0b" fontSize={14} fontWeight="800">{formatCurrency(outputs.minimumReserveTarget)}</text>
        <text x={bucket.x + bucket.width + 22} y={chartData.minLineY + 18} fill="#6b7280" fontSize={10}>3 months of income</text>

        <line x1={bucket.x + bucket.width} y1={bucket.y + bucket.height - 8} x2={bucket.x + bucket.width + 18} y2={bucket.y + bucket.height - 8} stroke="#ef4444" strokeWidth={1} />
        <text x={bucket.x + bucket.width + 22} y={bucket.y + bucket.height - 16} fill="#ef4444" fontSize={10} fontWeight="700">LOW RESERVE ZONE</text>
        <text x={bucket.x + bucket.width + 22} y={bucket.y + bucket.height - 4} fill="#6b7280" fontSize={10}>Below 3 months</text>

        {chartData.fillRatio > 0 && chartData.fillRatio < 1 && (
          <line x1={bucket.x - 4} y1={chartData.fillY} x2={bucket.x + bucket.width + 4} y2={chartData.fillY} stroke="#ffffff" strokeWidth={1} strokeOpacity={0.35} strokeDasharray="3 3">
            <animate attributeName="stroke-opacity" from="0" to="0.35" dur="500ms" begin="1000ms" fill="freeze" />
          </line>
        )}

        <text x={bucket.x + bucket.width / 2} y={svg.height - 4} textAnchor="middle" fill="#4b5563" fontSize={10} fontWeight="600" letterSpacing="1">EMERGENCY RESERVE SAVINGS BUCKET</text>
      </svg>

      <div className="mt-3 text-left w-full px-2">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Monthly Income</div>
        <div className="text-3xl font-bold tracking-tight text-gray-50 mt-0.5">{formatCurrency(outputs.monthlyIncome)}</div>
      </div>
    </div>
  )
}

export function UnemploymentOutputView({ outputs }: UnemploymentOutputViewProps) {
  return (
    <div className="space-y-6 flex flex-col h-full w-full">
      <AnimatedSection delay={0}>
        <Card className="border-gray-800 bg-[#090E1A]">
          <CardHeader><CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Emergency Reserve Savings Bucket</CardTitle></CardHeader>
          <CardContent className="flex justify-center py-2"><ReserveBucketGauge outputs={outputs} /></CardContent>
        </Card>
      </AnimatedSection>
      <div className="grid gap-4 sm:grid-cols-3">
        <AnimatedSection delay={0.18}><Card className="border-gray-800"><CardContent className="p-5"><div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Reserve</div><div className="text-2xl font-bold tracking-tight text-gray-50">{formatCurrency(outputs.currentReserveLevel)}</div><p className="text-[10px] text-gray-600 mt-1">Emergency savings on hand</p></CardContent></Card></AnimatedSection>
        <AnimatedSection delay={0.26}><Card className="border-gray-800"><CardContent className="p-5"><div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cash Depletion</div><div className="text-2xl font-bold tracking-tight text-amber-500">{outputs.reserveDepletionMonth < 0 ? "Never" : `Month ${outputs.reserveDepletionMonth}`}</div><p className="text-[10px] text-gray-600 mt-1">Months until $0 savings</p></CardContent></Card></AnimatedSection>
        <AnimatedSection delay={0.34}><Card className="border-gray-800"><CardContent className="p-5"><div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Shortfall</div><div className="text-2xl font-bold tracking-tight text-rose-500">{formatCurrency(outputs.totalUncoveredShortfall)}</div><p className="text-[10px] text-gray-600 mt-1">Unfunded gap across search</p></CardContent></Card></AnimatedSection>
      </div>
      <AnimatedSection delay={0.44}>
        <Card className="bg-[#090E1A] border border-gray-800"><CardContent className="p-6"><h4 className="font-semibold text-blue-400 mb-2 uppercase tracking-wider text-xs">Advisor Narrative</h4><p className="text-sm text-gray-300 leading-relaxed">{getUnemploymentNarrative(outputs)}</p></CardContent></Card>
      </AnimatedSection>
    </div>
  )
}
