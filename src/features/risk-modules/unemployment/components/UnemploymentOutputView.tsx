import { UnemploymentOutputs } from "../types"
import { ModuleMetricCard, MetricGroup, MetricGroupDivider } from "@/features/risk-modules/core/ModuleMetricCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UnemploymentOutputViewProps {
  outputs: UnemploymentOutputs
}

function formatAdvisorCurrency(value: number): string {
  return `$${Math.round(value / 1000)}K`
}

function AdvisorReserveVisualization({ outputs }: { outputs: UnemploymentOutputs }) {
  return (
    <Card className="module-visual-panel flex flex-col border-slate-800/80 bg-slate-950/60">
      <CardHeader className="shrink-0 px-6 pb-0 pt-5 text-center">
        <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          Emergency Reserve Dashboard
        </CardTitle>
        <p className="mt-1 text-sm leading-snug text-slate-400">
          Optimal savings runway target based on monthly income
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col min-h-0 items-center justify-center px-6 pb-6 pt-4">
        <div className="mx-auto w-full max-w-176">
            <svg viewBox="0 0 620 318" className="h-auto w-full overflow-hidden" role="img" aria-label="Emergency reserve range from zero to six months">
          <defs>
            <linearGradient id="unemploymentIdealFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.82" />
            </linearGradient>
            <linearGradient id="unemploymentMinimumFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.34" />
            </linearGradient>
            <linearGradient id="unemploymentGlass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="48%" stopColor="#ffffff" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
            </linearGradient>
            <filter id="unemploymentSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#020617" floodOpacity="0.34" />
            </filter>
          </defs>

          {[0, 1, 2, 3, 4, 5, 6].map((month) => {
            const y = 238 - month * 31
            const isKey = month === 0 || month === 3 || month === 6
            return (
              <g key={month}>
                <line x1={isKey ? 150 : 162} y1={y} x2="178" y2={y} stroke={isKey ? "rgba(248,250,252,0.9)" : "rgba(148,163,184,0.3)"} strokeWidth={isKey ? 1.5 : 1} />
                <text x="144" y={y + 4} textAnchor="end" fontSize={isKey ? 12 : 10} fontWeight={isKey ? 700 : 600} fill={isKey ? "#f8fafc" : "#94a3b8"}>
                  {month}mo
                </text>
              </g>
            )
          })}

          <rect x="180" y="52" width="260" height="186" rx="18" fill="rgba(2,6,23,0.36)" stroke="rgba(226,232,240,0.16)" strokeWidth="2" filter="url(#unemploymentSoftShadow)" />
          <clipPath id="unemploymentBucketClip">
            <rect x="180" y="52" width="260" height="186" rx="18" />
          </clipPath>
          <g clipPath="url(#unemploymentBucketClip)">
            <rect x="180" y="52" width="260" height="93" fill="url(#unemploymentIdealFill)" />
            <rect x="180" y="145" width="260" height="93" fill="url(#unemploymentMinimumFill)" />
            <rect x="180" y="52" width="260" height="186" fill="url(#unemploymentGlass)" />
          </g>
          <line x1="172" y1="145" x2="448" y2="145" stroke="rgba(248,250,252,0.7)" strokeWidth="2" strokeDasharray="7 5" />
          <rect x="180" y="52" width="260" height="186" rx="18" fill="none" stroke="rgba(226,232,240,0.24)" strokeWidth="2" />

          <text x="310" y="120" textAnchor="middle" fontSize="15" fontWeight="800" letterSpacing="1.6" fill="#ffffff">IDEAL RANGE</text>
          <text x="310" y="139" textAnchor="middle" fontSize="11" fontWeight="700" fill="rgba(255,255,255,0.76)">3 to 6 months</text>
          <text x="310" y="196" textAnchor="middle" fontSize="12" fontWeight="800" letterSpacing="1.3" fill="rgba(255,255,255,0.64)">MINIMUM</text>

          <line x1="440" y1="62" x2="465" y2="62" stroke="#22c55e" strokeWidth="2" />
          <text x="474" y="64" fontSize="11" fontWeight="800" letterSpacing="1.2" fill="#22c55e">OPTIMAL TARGET</text>
          <text x="474" y="84" fontSize="20" fontWeight="800" fill="#ffffff">{formatAdvisorCurrency(outputs.optimalReserveTarget)}</text>
          <text x="474" y="102" fontSize="10" fontWeight="700" fill="rgba(226,232,240,0.66)">6 months of income</text>

          <line x1="440" y1="145" x2="465" y2="145" stroke="#22d3ee" strokeWidth="2" />
          <text x="474" y="141" fontSize="11" fontWeight="800" letterSpacing="1.2" fill="#22d3ee">MINIMUM RESERVE</text>
          <text x="474" y="161" fontSize="20" fontWeight="800" fill="#ffffff">{formatAdvisorCurrency(outputs.minimumReserveTarget)}</text>
          <text x="474" y="179" fontSize="10" fontWeight="700" fill="rgba(226,232,240,0.66)">3 months of income</text>

          <line x1="440" y1="226" x2="465" y2="226" stroke="#fb7185" strokeWidth="2" />
          <text x="474" y="220" fontSize="11" fontWeight="800" letterSpacing="1.2" fill="#fb7185">DANGER ZONE</text>
          <text x="474" y="238" fontSize="10" fontWeight="700" fill="rgba(226,232,240,0.66)">Below 3 months</text>

          <text x="310" y="292" textAnchor="middle" fontSize="11" fontWeight="800" letterSpacing="1.6" fill="rgba(226,232,240,0.48)">EMERGENCY RESERVE SAVINGS BUCKET</text>
        </svg>
        </div>
      </CardContent>
    </Card>
  )
}

function AdvisorReserveDashboard({ outputs }: { outputs: UnemploymentOutputs }) {
  return (
    <div className="module-visual-dashboard">
      <AdvisorReserveVisualization outputs={outputs} />

      <div className="module-metric-rail">
        <MetricGroup title="Income">
          <ModuleMetricCard label="Monthly Income" value={formatAdvisorCurrency(outputs.monthlyIncome)} description="Current monthly earnings" accent="slate" />
        </MetricGroup>
        <MetricGroupDivider />
        <MetricGroup title="Reserve Targets">
          <ModuleMetricCard label="Minimum Reserve" value={formatAdvisorCurrency(outputs.minimumReserveTarget)} description="3 months — floor of the goal range" accent="cyan" />
          <ModuleMetricCard label="Optimal Reserve" value={formatAdvisorCurrency(outputs.optimalReserveTarget)} description="6 months — top of the goal range" accent="green" />
        </MetricGroup>
        <MetricGroupDivider />
        <MetricGroup title="Exposure">
          <ModuleMetricCard label="Annual Income at Risk" value={formatAdvisorCurrency(outputs.annualIncomeAtRisk)} description="Full income exposure during unemployment" accent="amber" />
        </MetricGroup>
      </div>
    </div>
  )
}

export function UnemploymentOutputView({ outputs }: UnemploymentOutputViewProps) {
  return (
    <div className="module-output-container">
      <AdvisorReserveDashboard outputs={outputs} />
    </div>
  )
}
