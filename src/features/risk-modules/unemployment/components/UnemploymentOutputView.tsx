import { UnemploymentOutputs } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { getUnemploymentNarrative } from "../constants/moduleCopy"
import { motion } from "framer-motion"
import { AnimatedSection } from "@/components/ui/animated-section"

interface UnemploymentOutputViewProps {
  outputs: UnemploymentOutputs
}

function ReserveBucketGauge({ outputs }: { outputs: UnemploymentOutputs }) {
  const { currentReserveLevel, optimalReserveTarget, minimumReserveTarget, monthlyIncome } = outputs

  const fillRatio = Math.min(optimalReserveTarget > 0 ? currentReserveLevel / optimalReserveTarget : 0, 1)
  const minimumPct = 50 // 3mo / 6mo = 50%
  const fillFromTopPct = (1 - fillRatio) * 100

  const fillColor =
    currentReserveLevel < minimumReserveTarget
      ? "#ef4444"
      : currentReserveLevel < optimalReserveTarget * 0.75
      ? "#22c55e"
      : "#16a34a"

  const svgHeight = 280
  const svgWidth = 480
  const bucketX = 40
  const bucketY = 20
  const bucketW = 180
  const bucketH = 220

  const minLineY = bucketY + bucketH * (minimumPct / 100)
  const fillTopY = bucketY + bucketH * (fillFromTopPct / 100)

  return (
    <div className="flex flex-col items-center w-full">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full"
        aria-label="Emergency reserve savings bucket gauge"
      >
        {/* Danger zone background (bottom half) */}
        <rect x={bucketX} y={bucketY + bucketH * 0.5} width={bucketW} height={bucketH * 0.5} fill="#7f1d1d" fillOpacity={0.3} />
        {/* Ideal zone background (top half) */}
        <rect x={bucketX} y={bucketY} width={bucketW} height={bucketH * 0.5} fill="#14532d" fillOpacity={0.3} />

        {/* Current reserve fill — animates from empty to actual level on mount */}
        {fillRatio > 0 && (
          <motion.rect
            x={bucketX + 2}
            y={Math.max(fillTopY, bucketY + 2)}
            width={bucketW - 4}
            height={Math.min(bucketH * fillRatio, bucketH - 4)}
            fill={fillColor}
            fillOpacity={0.8}
            rx={2}
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: `${bucketX + bucketW / 2}px ${Math.max(fillTopY, bucketY + 2) + Math.min(bucketH * fillRatio, bucketH - 4)}px` }}
          />
        )}

        {/* Bucket border */}
        <rect x={bucketX} y={bucketY} width={bucketW} height={bucketH} fill="none" stroke="#374151" strokeWidth={1.5} rx={4} />

        {/* Minimum reserve dashed line */}
        <line x1={bucketX} y1={minLineY} x2={bucketX + bucketW} y2={minLineY} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 4" />

        {/* Y-axis month labels */}
        {[0, 1, 2, 3, 4, 5, 6].map((mo) => {
          const y = bucketY + bucketH - (mo / 6) * bucketH
          return (
            <text key={mo} x={bucketX - 8} y={y + 4} textAnchor="end" fill="#6b7280" fontSize={11}>
              {mo}mo
            </text>
          )
        })}

        {/* Zone labels inside bucket */}
        <text x={bucketX + bucketW / 2} y={bucketY + bucketH * 0.22} textAnchor="middle" fill="#86efac" fontSize={13} fontWeight="700">IDEAL RANGE</text>
        <text x={bucketX + bucketW / 2} y={bucketY + bucketH * 0.22 + 16} textAnchor="middle" fill="#86efac" fontSize={11}>3 to 6 months</text>
        <text x={bucketX + bucketW / 2} y={bucketY + bucketH * 0.78} textAnchor="middle" fill="#fca5a5" fontSize={12} fontWeight="600">MINIMUM</text>

        {/* Right-side: Optimal target */}
        <line x1={bucketX + bucketW} y1={bucketY + 8} x2={bucketX + bucketW + 18} y2={bucketY + 8} stroke="#22c55e" strokeWidth={1} />
        <text x={bucketX + bucketW + 22} y={bucketY + 5} fill="#22c55e" fontSize={10} fontWeight="700">OPTIMAL TARGET</text>
        <text x={bucketX + bucketW + 22} y={bucketY + 19} fill="#22c55e" fontSize={14} fontWeight="800">{formatCurrency(optimalReserveTarget)}</text>
        <text x={bucketX + bucketW + 22} y={bucketY + 32} fill="#6b7280" fontSize={10}>6 months of income</text>

        {/* Right-side: Minimum reserve */}
        <line x1={bucketX + bucketW} y1={minLineY} x2={bucketX + bucketW + 18} y2={minLineY} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" />
        <text x={bucketX + bucketW + 22} y={minLineY - 7} fill="#f59e0b" fontSize={10} fontWeight="700">MINIMUM RESERVE</text>
        <text x={bucketX + bucketW + 22} y={minLineY + 5} fill="#f59e0b" fontSize={14} fontWeight="800">{formatCurrency(minimumReserveTarget)}</text>
        <text x={bucketX + bucketW + 22} y={minLineY + 18} fill="#6b7280" fontSize={10}>3 months of income</text>

        {/* Right-side: Danger zone */}
        <line x1={bucketX + bucketW} y1={bucketY + bucketH - 8} x2={bucketX + bucketW + 18} y2={bucketY + bucketH - 8} stroke="#ef4444" strokeWidth={1} />
        <text x={bucketX + bucketW + 22} y={bucketY + bucketH - 16} fill="#ef4444" fontSize={10} fontWeight="700">DANGER ZONE</text>
        <text x={bucketX + bucketW + 22} y={bucketY + bucketH - 4} fill="#6b7280" fontSize={10}>Below 3 months</text>

        {/* Current level line */}
        {fillRatio > 0 && fillRatio < 1 && (
          <line x1={bucketX - 4} y1={fillTopY} x2={bucketX + bucketW + 4} y2={fillTopY} stroke="#ffffff" strokeWidth={1} strokeOpacity={0.35} strokeDasharray="3 3" />
        )}

        {/* Bottom label */}
        <text x={bucketX + bucketW / 2} y={svgHeight - 4} textAnchor="middle" fill="#4b5563" fontSize={10} fontWeight="600" letterSpacing="1">
          EMERGENCY RESERVE SAVINGS BUCKET
        </text>
      </svg>

      {/* Monthly income stat */}
      <div className="mt-3 text-left w-full px-2">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Monthly Income</div>
        <div className="text-3xl font-bold tracking-tight text-gray-50 mt-0.5">{formatCurrency(monthlyIncome)}</div>
      </div>
    </div>
  )
}

export function UnemploymentOutputView({ outputs }: UnemploymentOutputViewProps) {
  return (
    <div className="space-y-6 flex flex-col h-full w-full">
      {/* Reserve Bucket — primary visualization */}
      <AnimatedSection delay={0}>
        <Card className="border-gray-800 bg-[#090E1A]">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Emergency Reserve Savings Bucket</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-2">
            <ReserveBucketGauge outputs={outputs} />
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <AnimatedSection delay={0.18}>
          <Card className="border-gray-800">
            <CardContent className="p-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Reserve</div>
              <div className="text-2xl font-bold tracking-tight text-gray-50">{formatCurrency(outputs.currentReserveLevel)}</div>
              <p className="text-[10px] text-gray-600 mt-1">Emergency savings on hand</p>
            </CardContent>
          </Card>
        </AnimatedSection>
        <AnimatedSection delay={0.26}>
          <Card className="border-gray-800">
            <CardContent className="p-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cash Depletion</div>
              <div className="text-2xl font-bold tracking-tight text-amber-500">
                {outputs.reserveDepletionMonth < 0 ? "Never" : `Month ${outputs.reserveDepletionMonth}`}
              </div>
              <p className="text-[10px] text-gray-600 mt-1">Months until $0 savings</p>
            </CardContent>
          </Card>
        </AnimatedSection>
        <AnimatedSection delay={0.34}>
          <Card className="border-gray-800">
            <CardContent className="p-5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Shortfall</div>
              <div className="text-2xl font-bold tracking-tight text-rose-500">{formatCurrency(outputs.totalUncoveredShortfall)}</div>
              <p className="text-[10px] text-gray-600 mt-1">Unfunded gap across search</p>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      {/* Advisor narrative */}
      <AnimatedSection delay={0.44}>
        <Card className="bg-[#090E1A] border border-gray-800">
          <CardContent className="p-6">
            <h4 className="font-semibold text-blue-400 mb-2 uppercase tracking-wider text-xs">Advisor Narrative</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{getUnemploymentNarrative(outputs)}</p>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  )
}
