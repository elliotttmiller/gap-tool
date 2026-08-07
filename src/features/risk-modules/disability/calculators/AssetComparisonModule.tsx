import { useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { DisabilityInputs, DisabilityOtherAsset } from "../types"

interface AssetComparisonModuleProps {
  inputs?: DisabilityInputs
  onInputsChange?: (next: DisabilityInputs) => void
}

type AssetPremiumRow = DisabilityOtherAsset

function nextRowId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Shown until the advisor enters real data; not written to inputs until edited.
const DEFAULT_ASSET_ROWS: AssetPremiumRow[] = [
  { id: "asset-default-home", label: "Home", assetValue: 0, annualPremium: 0 },
  { id: "asset-default-auto", label: "Auto", assetValue: 0, annualPremium: 0 },
]

function niceMax(value: number): number {
  if (value <= 0) return 100
  const padded = value * 1.15
  const magnitude = Math.pow(10, Math.floor(Math.log10(padded)))
  const residual = padded / magnitude
  const niceResidual = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10
  return niceResidual * magnitude
}

function PanelTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const entry = payload.find((item: any) => Number(item.value) > 0) ?? payload[0]
  const value = Number(entry?.value ?? 0)
  const suffix = entry?.payload?.[`${entry.dataKey}Unit`] ?? ""
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/95 px-3 py-2.5 text-xs shadow-2xl backdrop-blur">
      <p className="font-semibold text-slate-100">{label}</p>
      <p className="mt-1 font-mono text-slate-200">{formatCurrency(value)}{suffix}</p>
    </div>
  )
}

interface ComparisonBarPanelProps {
  category: string
  leftName: string
  leftValue: number
  leftFill: string
  leftUnit?: string
  rightName: string
  rightValue: number
  rightFill: string
  rightUnit?: string
  domainMax: number
  rightDomainMax?: number
}

function ComparisonBarPanel({
  category,
  leftName,
  leftValue,
  leftFill,
  leftUnit = "",
  rightName,
  rightValue,
  rightFill,
  rightUnit = "",
  domainMax,
  rightDomainMax,
}: ComparisonBarPanelProps) {
  const effectiveRightDomainMax = rightDomainMax ?? domainMax
  const data = useMemo(
    () => [
      { name: leftName, left: leftValue, right: 0, leftUnit, rightUnit },
      { name: rightName, left: 0, right: rightValue, leftUnit, rightUnit },
    ],
    [leftName, leftValue, leftUnit, rightName, rightValue, rightUnit],
  )

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{category}</p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%" debounce={100}>
          <BarChart data={data} margin={{ top: 26, right: 12, left: 12, bottom: 4 }} barCategoryGap="28%" barGap={0}>
            <CartesianGrid stroke="rgba(148,163,184,0.08)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} dy={6} interval={0} />
            <YAxis yAxisId="left" hide domain={[0, domainMax]} />
            <YAxis yAxisId="right" hide domain={[0, effectiveRightDomainMax]} />
            <Tooltip content={<PanelTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar yAxisId="left" dataKey="left" name={leftName} fill={leftFill} radius={[6, 6, 0, 0]} maxBarSize={72} isAnimationActive={false}>
              <LabelList
                dataKey="left"
                position="top"
                formatter={(value: number) => (value ? formatCurrency(value) : "")}
                style={{ fill: "#e2e8f0", fontSize: 11, fontWeight: 700 }}
              />
            </Bar>
            <Bar yAxisId="right" dataKey="right" name={rightName} fill={rightFill} radius={[6, 6, 0, 0]} maxBarSize={72} isAnimationActive={false}>
              <LabelList
                dataKey="right"
                position="top"
                formatter={(value: number) => (value ? formatCurrency(value) : "")}
                style={{ fill: "#e2e8f0", fontSize: 11, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
      <span className="inline-block h-2.5 w-4 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

export function AssetComparisonModule({ inputs, onInputsChange }: AssetComparisonModuleProps) {
  const monthlyIncomeInsurancePremium = Math.max(0, inputs?.privateDiMonthlyPremium ?? 0)
  const annualIncomeInsuranceCost = monthlyIncomeInsurancePremium * 12
  const canEditIncomePremium = Boolean(inputs && onInputsChange)

  const projectionYears = Math.max(0, (inputs?.retirementAge ?? 0) - (inputs?.currentAge ?? 0))
  const netIncomeAsset = Math.max(0, inputs?.privateDiBenefitMonthly ?? 0) * 12 * projectionYears

  // "Other assets" are persisted straight into DisabilityInputs.otherAssets so they
  // survive tab switches, saves, and reloads instead of living in transient UI state.
  // When there's no backing scenario to write into, fall back to local-only state.
  const canEditAssets = Boolean(inputs && onInputsChange)
  const [fallbackRows, setFallbackRows] = useState<AssetPremiumRow[]>(DEFAULT_ASSET_ROWS)
  const assetRows = canEditAssets ? (inputs!.otherAssets ?? DEFAULT_ASSET_ROWS) : fallbackRows

  const annualOtherAssetInsuranceCost = useMemo(
    () => assetRows.reduce((sum, row) => sum + (row.annualPremium || 0), 0),
    [assetRows],
  )
  const totalAssetValue = useMemo(
    () => assetRows.reduce((sum, row) => sum + (row.assetValue || 0), 0),
    [assetRows],
  )

  const updateMonthlyIncomePremium = (value: number) => {
    if (!inputs || !onInputsChange) return
    onInputsChange({ ...inputs, privateDiMonthlyPremium: Math.max(0, value) })
  }

  const commitAssetRows = (next: AssetPremiumRow[]) => {
    if (canEditAssets) {
      onInputsChange!({ ...inputs!, otherAssets: next })
    } else {
      setFallbackRows(next)
    }
  }

  const addAssetRow = () => {
    commitAssetRows([...assetRows, { id: nextRowId(), label: "", assetValue: 0, annualPremium: 0 }])
  }

  const removeAssetRow = (id: string) => {
    commitAssetRows(assetRows.filter((row) => row.id !== id))
  }

  const updateAssetRowLabel = (id: string, label: string) => {
    commitAssetRows(assetRows.map((row) => (row.id === id ? { ...row, label } : row)))
  }

  const updateAssetRowValue = (id: string, assetValue: number) => {
    commitAssetRows(assetRows.map((row) => (row.id === id ? { ...row, assetValue } : row)))
  }

  const updateAssetRowPremium = (id: string, annualPremium: number) => {
    commitAssetRows(assetRows.map((row) => (row.id === id ? { ...row, annualPremium } : row)))
  }

  const otherAssetsSharedDomainMax = useMemo(
    () => niceMax(Math.max(totalAssetValue, annualOtherAssetInsuranceCost, 1)),
    [totalAssetValue, annualOtherAssetInsuranceCost],
  )

  const netIncomeAssetDomainMax = useMemo(() => niceMax(Math.max(netIncomeAsset, 1)), [netIncomeAsset])

  const coveragePremiumDomainMax = useMemo(
    () => niceMax(Math.max(annualIncomeInsuranceCost, 1)),
    [annualIncomeInsuranceCost],
  )

  const costDifference = annualOtherAssetInsuranceCost - annualIncomeInsuranceCost

  // "Difference" panel: the two other-asset and income-asset totals (value + its
  // insurance cost) placed head-to-head on one shared scale for direct comparison.
  const otherAssetsCombinedTotal = totalAssetValue + annualOtherAssetInsuranceCost
  const incomeAssetCombinedTotal = netIncomeAsset + annualIncomeInsuranceCost
  const combinedTotalsDomainMax = useMemo(
    () => niceMax(Math.max(otherAssetsCombinedTotal, incomeAssetCombinedTotal, 1)),
    [otherAssetsCombinedTotal, incomeAssetCombinedTotal],
  )
  const combinedTotalsDifference = incomeAssetCombinedTotal - otherAssetsCombinedTotal

  return (
    <div className="module-output-container space-y-4">
      <Card className="border-gray-800 bg-gray-900/25">
        <CardContent className="p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_10rem]">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Other Asset Premiums
                </span>
                <button
                  type="button"
                  onClick={addAssetRow}
                  disabled={!canEditAssets}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-700 px-2 py-1 text-[11px] font-semibold text-gray-400 transition hover:border-brand-600 hover:text-brand-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-700 disabled:hover:text-gray-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Asset
                </button>
              </div>

              <div className="max-w-lg overflow-hidden rounded-lg border border-gray-800">
                <div className="grid grid-cols-[10rem_7rem_7rem_1.75rem] gap-2 border-b border-gray-800 bg-gray-950/60 px-2.5 py-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Asset Name</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Value of Asset</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Annual Cost to Insure</span>
                  <span />
                </div>

                {assetRows.length === 0 && (
                  <p className="px-3 py-4 text-center text-xs text-gray-500">
                    No other assets added yet.
                  </p>
                )}

                {assetRows.map((row, index) => (
                  <div
                    key={row.id}
                    className={`group grid grid-cols-[10rem_7rem_7rem_1.75rem] items-center gap-2 px-2.5 py-1.5 ${index > 0 ? "border-t border-gray-800/70" : ""}`}
                  >
                    <input
                      type="text"
                      value={row.label}
                      onChange={(event) => updateAssetRowLabel(row.id, event.target.value)}
                      disabled={!canEditAssets}
                      placeholder="Asset name"
                      className="h-8 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 text-sm text-gray-100 outline-none transition focus:border-gray-700 focus:bg-gray-950 disabled:opacity-60"
                    />
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-500">$</span>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={row.assetValue || ""}
                        onChange={(event) => updateAssetRowValue(row.id, Math.max(0, Number(event.target.value) || 0))}
                        disabled={!canEditAssets}
                        placeholder="0"
                        className="h-8 w-full rounded-md border border-gray-800 bg-gray-950 pl-4 pr-2 text-right text-sm text-gray-100 outline-none transition focus:border-brand-600 disabled:opacity-60"
                      />
                    </div>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-500">$</span>
                      <input
                        type="number"
                        min={0}
                        step={50}
                        value={row.annualPremium || ""}
                        onChange={(event) => updateAssetRowPremium(row.id, Math.max(0, Number(event.target.value) || 0))}
                        disabled={!canEditAssets}
                        placeholder="0"
                        className="h-8 w-full rounded-md border border-gray-800 bg-gray-950 pl-4 pr-2 text-right text-sm font-semibold text-gray-100 outline-none transition focus:border-brand-600 disabled:opacity-60"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAssetRow(row.id)}
                      disabled={!canEditAssets}
                      aria-label="Remove asset"
                      className="flex h-8 w-7 items-center justify-center rounded text-gray-600 opacity-0 transition hover:bg-red-950/50 hover:text-red-400 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-[10px] leading-relaxed text-gray-500">
                Add or remove assets such as home, auto, valuables, or other property to insure.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                Income Insurance
              </span>

              <div className="w-40 rounded-lg border border-gray-800 bg-gray-950/50 p-2.5">
                <p className="truncate text-xs font-semibold text-gray-200">Individual DI</p>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-500">$</span>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={monthlyIncomeInsurancePremium || ""}
                    onChange={(event) => updateMonthlyIncomePremium(Number(event.target.value) || 0)}
                    disabled={!canEditIncomePremium}
                    placeholder="0"
                    className="h-7 w-full rounded-md border border-gray-800 bg-gray-950 pl-4 pr-7 text-right text-sm font-semibold text-cyan-300 outline-none transition focus:border-brand-600 disabled:opacity-50"
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">/mo</span>
                </div>
                <p className="mt-1.5 text-[11px] text-gray-500">{formatCurrency(annualIncomeInsuranceCost)}/yr</p>
              </div>

              <p className="text-[10px] leading-relaxed text-gray-500">Synced with the Individual DI form.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="module-chart-card border-slate-800/80 bg-slate-950/60">
        <CardHeader className="px-5 pb-0 pt-4">
          <CardTitle className="text-center text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            Asset Protection Comparison
          </CardTitle>
          <p className="mt-1 text-center text-xs leading-snug text-slate-400">
            What it costs to insure other assets versus income as an asset, and the two combined totals head-to-head.
          </p>
        </CardHeader>

        <CardContent className="px-5 pb-5 pt-4">
          <div className="grid gap-3 md:grid-cols-3">
            <ComparisonBarPanel
              category="Other Assets"
              leftName="Asset Value"
              leftValue={totalAssetValue}
              leftFill="#64748b"
              rightName="Insurance Cost"
              rightValue={annualOtherAssetInsuranceCost}
              rightUnit="/yr"
              rightFill="#a855f7"
              domainMax={otherAssetsSharedDomainMax}
            />
            <ComparisonBarPanel
              category="Income Asset"
              leftName="Net Income Asset"
              leftValue={netIncomeAsset}
              leftFill="#06b6d4"
              rightName="Coverage Premium"
              rightValue={annualIncomeInsuranceCost}
              rightUnit="/yr"
              rightFill="#f59e0b"
              domainMax={netIncomeAssetDomainMax}
              rightDomainMax={coveragePremiumDomainMax}
            />
            <ComparisonBarPanel
              category="Difference"
              leftName="Other Assets Total"
              leftValue={otherAssetsCombinedTotal}
              leftFill="#64748b"
              rightName="Income Asset Total"
              rightValue={incomeAssetCombinedTotal}
              rightFill="#06b6d4"
              domainMax={combinedTotalsDomainMax}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-slate-800/60 pt-3">
            <LegendSwatch color="#64748b" label="Other Assets Value" />
            <LegendSwatch color="#a855f7" label="Other Assets Insurance Cost" />
            <LegendSwatch color="#06b6d4" label="Income Asset Value" />
            <LegendSwatch color="#f59e0b" label="Income Asset Coverage Premium" />
          </div>

          <p className="mt-2 text-center text-[10px] leading-relaxed text-slate-500">
            Other Assets and Income Asset each use their own value-vs-cost scale so the smaller premium bar stays legible.
            Difference shares one scale so the two combined totals compare directly — {combinedTotalsDifference >= 0 ? "income" : "other assets"} lead
            {" "}by {formatCurrency(Math.abs(combinedTotalsDifference))}.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-800 bg-gray-950/40 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Other Asset Insurance</p>
              <p className="mt-0.5 text-lg font-semibold text-gray-100">{formatCurrency(annualOtherAssetInsuranceCost)}/yr</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-950/40 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Income Insurance</p>
              <p className="mt-0.5 text-lg font-semibold text-cyan-300">{formatCurrency(annualIncomeInsuranceCost)}/yr</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-950/40 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Cost Difference</p>
              <p className={`mt-0.5 text-lg font-semibold ${costDifference >= 0 ? "text-emerald-300" : "text-amber-300"}`}>
                {formatCurrency(Math.abs(costDifference))}/yr
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
