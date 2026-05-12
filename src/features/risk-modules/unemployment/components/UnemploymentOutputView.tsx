import { UnemploymentOutputs } from "../types"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { getUnemploymentNarrative } from "../constants/moduleCopy"
import { AnimatedSection } from "@/components/ui/animated-section"

interface UnemploymentOutputViewProps {
  outputs: UnemploymentOutputs
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(value)
}

function ReserveBucketGauge({ outputs }: { outputs: UnemploymentOutputs }) {
  const maxTarget = Math.max(outputs.optimalReserveTarget, 1)
  const reserveRatio = Math.min(Math.max(outputs.currentReserveLevel / maxTarget, 0), 1)
  const reserveHeight = reserveRatio * 256
  const reserveY = 288 - reserveHeight
  const currentReserveMonths = outputs.monthlyIncome > 0 ? outputs.currentReserveLevel / outputs.monthlyIncome : 0

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-800/90 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.10),rgba(15,23,42,0)_42%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-5 shadow-2xl shadow-black/20">
      <svg viewBox="0 0 760 420" className="h-auto w-full" role="img" aria-label="Emergency reserve savings bucket showing minimum and optimal reserve targets">
        <defs>
          <linearGradient id="reserveBucketFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.98" />
            <stop offset="48%" stopColor="#22d3ee" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.86" />
          </linearGradient>
          <linearGradient id="reserveBucketShell" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="idealRange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="dangerRange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.24" />
          </linearGradient>
          <filter id="bucketGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.06 0 0 0 0 0.70 0 0 0 0 0.90 0 0 0 .26 0" />
            <feBlend in="SourceGraphic" />
          </filter>
        </defs>

        <g transform="translate(92 44)">
          <text x="-14" y="12" textAnchor="end" fill="#e5e7eb" fontSize="20" fontWeight="800">6mo</text>
          <text x="-14" y="144" textAnchor="end" fill="#e5e7eb" fontSize="20" fontWeight="800">3mo</text>
          <text x="-14" y="276" textAnchor="end" fill="#94a3b8" fontSize="16" fontWeight="700">0mo</text>

          <rect x="0" y="0" width="294" height="288" rx="32" fill="url(#reserveBucketShell)" stroke="#334155" strokeWidth="1.5" />
          <rect x="12" y="12" width="270" height="132" rx="24" fill="url(#idealRange)" />
          <rect x="12" y="144" width="270" height="132" rx="24" fill="url(#dangerRange)" />
          <line x1="0" y1="144" x2="294" y2="144" stroke="#e2e8f0" strokeOpacity="0.72" strokeWidth="2" strokeDasharray="10 10" />

          <clipPath id="bucketClip">
            <rect x="12" y="12" width="270" height="264" rx="23" />
          </clipPath>
          <g clipPath="url(#bucketClip)">
            <rect x="12" y={reserveY} width="270" height={reserveHeight} fill="url(#reserveBucketFill)" filter="url(#bucketGlow)">
              <animate attributeName="height" from="0" to={reserveHeight} dur="900ms" begin="180ms" fill="freeze" />
              <animate attributeName="y" from="288" to={reserveY} dur="900ms" begin="180ms" fill="freeze" />
            </rect>
            <rect x="12" y="12" width="270" height="264" fill="url(#idealRange)" opacity="0.16" />
          </g>

          <text x="147" y="90" textAnchor="middle" fill="#f8fafc" fontSize="22" fontWeight="900" letterSpacing="1.8">IDEAL RANGE</text>
          <text x="147" y="116" textAnchor="middle" fill="#cbd5e1" fontSize="15" fontWeight="600">3 to 6 months</text>
          <text x="147" y="218" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="800" letterSpacing="1.2">MINIMUM</text>
          <text x="147" y="314" textAnchor="middle" fill="#64748b" fontSize="13" fontWeight="800" letterSpacing="3.2">EMERGENCY RESERVE SAVINGS BUCKET</text>
        </g>

        <g transform="translate(440 48)">
          <line x1="0" y1="0" x2="42" y2="0" stroke="#22c55e" strokeWidth="2" />
          <text x="54" y="-8" fill="#22c55e" fontSize="15" fontWeight="900" letterSpacing="1.2">OPTIMAL TARGET</text>
          <text x="54" y="25" fill="#f8fafc" fontSize="34" fontWeight="900">{formatCompactCurrency(outputs.optimalReserveTarget)}</text>
          <text x="54" y="50" fill="#94a3b8" fontSize="16" fontWeight="600">6 months of income</text>
        </g>

        <g transform="translate(440 182)">
          <line x1="0" y1="0" x2="42" y2="0" stroke="#f59e0b" strokeWidth="2" strokeDasharray="7 7" />
          <text x="54" y="-8" fill="#22d3ee" fontSize="15" fontWeight="900" letterSpacing="1.2">MINIMUM RESERVE</text>
          <text x="54" y="25" fill="#f8fafc" fontSize="34" fontWeight="900">{formatCompactCurrency(outputs.minimumReserveTarget)}</text>
          <text x="54" y="50" fill="#94a3b8" fontSize="16" fontWeight="600">3 months of income</text>
        </g>

        <g transform="translate(440 316)">
          <line x1="0" y1="0" x2="42" y2="0" stroke="#ef4444" strokeWidth="2" />
          <text x="54" y="-8" fill="#ef4444" fontSize="15" fontWeight="900" letterSpacing="1.2">DANGER ZONE</text>
          <text x="54" y="22" fill="#94a3b8" fontSize="16" fontWeight="600">Below 3 months</text>
        </g>

        <text x="92" y="390" fill="#64748b" fontSize="13" fontWeight="700">
          Current reserve: {formatCompactCurrency(outputs.currentReserveLevel)} ({currentReserveMonths.toFixed(1)} months)
        </text>
      </svg>
    </div>
  )
}

function MetricCard({ label, value, hint, delay }: { label: string; value: string; hint: string; delay: number }) {
  return (
    <AnimatedSection delay={delay}>
      <Card className="h-full border-slate-800/90 bg-slate-950/70 shadow-lg shadow-black/10">
        <CardContent className="flex h-full flex-col justify-between p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</div>
          <div className="mt-3 text-3xl font-black tracking-tight text-slate-50">{value}</div>
          <p className="mt-2 text-xs font-medium text-slate-400">{hint}</p>
        </CardContent>
      </Card>
    </AnimatedSection>
  )
}

export function UnemploymentOutputView({ outputs }: UnemploymentOutputViewProps) {
  return (
    <div className="flex h-full w-full flex-col space-y-6">
      <AnimatedSection delay={0}>
        <ReserveBucketGauge outputs={outputs} />
      </AnimatedSection>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Monthly Income" value={formatCompactCurrency(outputs.monthlyIncome)} hint="Current monthly earnings" delay={0.12} />
        <MetricCard label="Minimum Reserve" value={formatCompactCurrency(outputs.minimumReserveTarget)} hint="3 months - floor of the goal range" delay={0.2} />
        <MetricCard label="Optimal Reserve" value={formatCompactCurrency(outputs.optimalReserveTarget)} hint="6 months - top of the goal range" delay={0.28} />
        <MetricCard label="Annual Income at Risk" value={formatCompactCurrency(outputs.annualIncomeAtRisk)} hint="Full income exposure during unemployment" delay={0.36} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Current Reserve" value={formatCurrency(outputs.currentReserveLevel)} hint={`${outputs.reserveMonthsCurrent.toFixed(1)} months of income currently held`} delay={0.44} />
        <MetricCard label="Cash Depletion" value={outputs.reserveDepletionMonth < 0 ? "Never" : `Month ${outputs.reserveDepletionMonth}`} hint="Months until $0 savings" delay={0.52} />
        <MetricCard label="Total Shortfall" value={formatCurrency(outputs.totalUncoveredShortfall)} hint="Unfunded gap across modeled period" delay={0.6} />
      </div>

      <AnimatedSection delay={0.68}>
        <Card className="border border-slate-800/90 bg-[#090E1A]">
          <CardContent className="p-6">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-400">Advisor Narrative</h4>
            <p className="text-sm leading-relaxed text-gray-300">{getUnemploymentNarrative(outputs)}</p>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  )
}
