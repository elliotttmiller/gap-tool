import { useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { DisabilityInputs } from "../types"

interface AssetComparisonModuleProps {
  inputs?: DisabilityInputs
}

function ComparisonTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const value = Number(payload[0]?.value ?? 0)
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-950/95 p-3 text-xs shadow-2xl backdrop-blur">
      <p className="font-semibold text-gray-100">{label}</p>
      <p className="mt-1 font-mono text-gray-200">{formatCurrency(value)}/yr</p>
    </div>
  )
}

export function AssetComparisonModule({ inputs }: AssetComparisonModuleProps) {
  const annualIncomeInsuranceCost = Math.max(0, inputs?.privateDiMonthlyPremium ?? 0) * 12
  const [annualOtherAssetInsuranceCost, setAnnualOtherAssetInsuranceCost] = useState(0)

  const chartData = useMemo(() => [
    { name: "Other Assets", annualCost: annualOtherAssetInsuranceCost },
    { name: "Income as an Asset", annualCost: annualIncomeInsuranceCost },
  ], [annualIncomeInsuranceCost, annualOtherAssetInsuranceCost])

  const costDifference = annualOtherAssetInsuranceCost - annualIncomeInsuranceCost

  return (
    <div className="module-output-container space-y-4">
      <Card className="border-gray-800 bg-gray-900/25">
        <CardContent className="p-4">
          <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                Annual Cost to Insure Other Assets
              </span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={annualOtherAssetInsuranceCost || ""}
                  onChange={(event) => setAnnualOtherAssetInsuranceCost(Math.max(0, Number(event.target.value) || 0))}
                  placeholder="Enter annual premiums"
                  className="h-10 w-full rounded-md border border-gray-700 bg-gray-950 pl-7 pr-3 text-sm font-semibold text-gray-100 outline-none transition focus:border-brand-600"
                />
              </div>
              <span className="text-[10px] leading-relaxed text-gray-500">
                Combined annual premiums used to insure assets such as home, auto, valuables, or other property.
              </span>
            </label>

            <div className="rounded-lg border border-gray-800 bg-gray-950/60 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Annual Cost to Insure Income</p>
              <p className="mt-1 text-xl font-semibold text-cyan-300">{formatCurrency(annualIncomeInsuranceCost)}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">Individual DI monthly premium × 12</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <Card className="border-gray-800 bg-gray-900/25">
          <CardContent className="p-4">
            <div className="mb-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Asset Insurance Cost Comparison</p>
              <p className="mt-0.5 text-xs text-gray-500">What you pay annually to insure other assets compared with what you pay to insure earned income as an asset.</p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <BarChart data={chartData} margin={{ top: 28, right: 40, left: 0, bottom: 12 }} barSize={110} barCategoryGap="45%">
                  <CartesianGrid stroke="rgba(148,163,184,0.06)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }} tickLine={false} axisLine={false} dy={6} />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={58}
                    domain={[0, (dataMax: number) => Math.max(1, Math.ceil((dataMax * 1.2) / 100) * 100)]}
                    tickFormatter={(value) => formatCurrency(Number(value))}
                  />
                  <Tooltip content={<ComparisonTooltip />} cursor={{ fill: "rgba(255,255,255,0.025)" }} />
                  <Bar dataKey="annualCost" name="Annual Insurance Cost" fill="#06b6d4" radius={[7, 7, 0, 0]}>
                    <LabelList
                      dataKey="annualCost"
                      position="top"
                      formatter={(value: number) => formatCurrency(Number(value))}
                      style={{ fill: "#e2e8f0", fontSize: 12, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 xl:justify-center">
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Other Asset Insurance</p>
            <p className="mt-1 text-lg font-semibold text-gray-100">{formatCurrency(annualOtherAssetInsuranceCost)}/yr</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Income Insurance</p>
            <p className="mt-1 text-lg font-semibold text-cyan-300">{formatCurrency(annualIncomeInsuranceCost)}/yr</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Annual Cost Difference</p>
            <p className={`mt-1 text-lg font-semibold ${costDifference >= 0 ? "text-emerald-300" : "text-amber-300"}`}>
              {formatCurrency(Math.abs(costDifference))}/yr
            </p>
            <p className="mt-0.5 text-[11px] text-gray-500">
              {costDifference >= 0 ? "More spent insuring other assets" : "More spent insuring income"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
