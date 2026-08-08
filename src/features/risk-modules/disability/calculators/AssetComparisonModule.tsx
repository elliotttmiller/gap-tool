import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
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

// Axis ticks are hidden, so there's no need to snap the ceiling to a "nice"
// round number — doing so caused discontinuous jumps in headroom as a value
// crossed a magnitude boundary (e.g. $480 -> ceiling 1000, $360 -> ceiling 500),
// which made a smaller value render as a taller bar than a larger one.
// A fixed padding ratio keeps bar height continuously proportional to value.
function niceMax(value: number): number {
  if (value <= 0) return 100
  return value * 1.15
}

function ClusterTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/95 px-3 py-2.5 text-xs shadow-2xl backdrop-blur">
      <p className="font-semibold text-slate-100">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="mt-1 flex items-center gap-1.5 font-mono text-slate-200">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: entry.color }} />
          {entry.name}: {formatCurrency(Number(entry.value ?? 0))}
          {entry.dataKey === "premium" ? "/yr" : ""}
        </p>
      ))}
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

  const projectionYears = Math.max(0, (inputs?.retirementAge ?? 0) - (inputs?.currentAge ?? 0))
  const netIncomeAsset = Math.max(0, inputs?.privateDiBenefitMonthly ?? 0) * 12 * projectionYears

  // "Other assets" are persisted straight into DisabilityInputs.otherAssets so they
  // survive tab switches, saves, and reloads instead of living in transient UI state.
  // When there's no backing scenario to write into, fall back to local-only state.
  const canEditAssets = Boolean(inputs && onInputsChange)
  const [fallbackRows, setFallbackRows] = useState<AssetPremiumRow[]>(DEFAULT_ASSET_ROWS)
  const assetRows = canEditAssets ? (inputs!.otherAssets ?? DEFAULT_ASSET_ROWS) : fallbackRows

  const COLLAPSED_ASSET_LIMIT = 4
  const [assetsExpanded, setAssetsExpanded] = useState(false)
  const hasHiddenAssets = assetRows.length > COLLAPSED_ASSET_LIMIT
  const visibleAssetRows = assetsExpanded || !hasHiddenAssets ? assetRows : assetRows.slice(0, COLLAPSED_ASSET_LIMIT)

  const annualOtherAssetInsuranceCost = useMemo(
    () => assetRows.reduce((sum, row) => sum + (row.annualPremium || 0), 0),
    [assetRows],
  )
  const totalAssetValue = useMemo(
    () => assetRows.reduce((sum, row) => sum + (row.assetValue || 0), 0),
    [assetRows],
  )

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

  // "Difference": how far apart the two sides are, on value and on cost.
  const valueDifference = netIncomeAsset - totalAssetValue
  const costDifference = annualOtherAssetInsuranceCost - annualIncomeInsuranceCost

  const chartData = useMemo(
    () => [
      { name: "Other Assets", value: totalAssetValue, premium: annualOtherAssetInsuranceCost },
      { name: "Income Asset", value: netIncomeAsset, premium: annualIncomeInsuranceCost },
      { name: "Difference", value: Math.abs(valueDifference), premium: Math.abs(costDifference) },
    ],
    [totalAssetValue, annualOtherAssetInsuranceCost, netIncomeAsset, annualIncomeInsuranceCost, valueDifference, costDifference],
  )

  const chartDomainMax = useMemo(
    () => niceMax(Math.max(...chartData.flatMap((row) => [row.value, row.premium]), 1)),
    [chartData],
  )

  return (
    <div className="module-output-container space-y-4">
      <Card className="border-gray-800 bg-gray-900/25">
        <CardContent className="p-4">
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

          {assetRows.length === 0 && (
            <p className="mt-2 rounded-lg border border-gray-800 px-3 py-4 text-center text-xs text-gray-500">
              No other assets added yet.
            </p>
          )}

          {assetRows.length > 0 && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[0, 1].map((columnIndex) => (
                <div key={columnIndex} className="flex items-center gap-2 px-2.5">
                  <span className="min-w-0 flex-1 text-[9px] font-bold uppercase tracking-widest text-gray-500">Asset Name</span>
                  <span className="w-24 shrink-0 text-center text-[9px] font-bold uppercase tracking-widest text-gray-500">Value</span>
                  <span className="w-24 shrink-0 text-center text-[9px] font-bold uppercase tracking-widest text-gray-500">Insure</span>
                  <span className="w-6 shrink-0" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
            {visibleAssetRows.map((row) => (
              <div
                key={row.id}
                className="group flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-950/40 px-2.5 py-2"
              >
                <input
                  type="text"
                  value={row.label}
                  onChange={(event) => updateAssetRowLabel(row.id, event.target.value)}
                  disabled={!canEditAssets}
                  placeholder="Asset name"
                  className="h-7 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 text-sm font-semibold text-gray-100 outline-none transition focus:border-gray-700 focus:bg-gray-950 disabled:opacity-60"
                />

                <div className="flex min-w-24 shrink-0 items-center justify-center gap-1" title="Value of asset">
                  <span className="shrink-0 text-[11px] text-gray-500">$</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={row.assetValue || ""}
                    onChange={(event) => updateAssetRowValue(row.id, Math.max(0, Number(event.target.value) || 0))}
                    disabled={!canEditAssets}
                    placeholder="0"
                    className="h-7 min-w-14 max-w-40 appearance-none rounded-md border border-transparent bg-transparent px-1 text-right text-sm text-gray-100 outline-none transition field-sizing-content focus:border-gray-700 focus:bg-gray-950 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:opacity-60"
                  />
                </div>

                <div className="flex min-w-24 shrink-0 items-center justify-center gap-1" title="Annual cost to insure">
                  <span className="shrink-0 text-[11px] text-gray-500">$</span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={row.annualPremium || ""}
                    onChange={(event) => updateAssetRowPremium(row.id, Math.max(0, Number(event.target.value) || 0))}
                    disabled={!canEditAssets}
                    placeholder="0"
                    className="h-7 min-w-14 max-w-40 appearance-none rounded-md border border-transparent bg-transparent px-1 text-right text-sm font-semibold text-gray-100 outline-none transition field-sizing-content focus:border-gray-700 focus:bg-gray-950 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:opacity-60"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeAssetRow(row.id)}
                  disabled={!canEditAssets}
                  aria-label="Remove asset"
                  className="flex h-7 w-6 shrink-0 items-center justify-center rounded text-gray-600 opacity-0 transition hover:bg-red-950/50 hover:text-red-400 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {hasHiddenAssets && (
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setAssetsExpanded((expanded) => !expanded)}
                aria-label={assetsExpanded ? "Collapse asset list" : "Expand asset list"}
                className="flex h-6 w-6 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-800 hover:text-gray-300"
              >
                {assetsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="module-chart-card border-slate-800/80 bg-slate-950/60">
        <CardHeader className="px-5 pb-0 pt-4">
          <CardTitle className="text-center text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            Asset Protection Comparison
          </CardTitle>
          <p className="mt-1 text-center text-xs leading-snug text-slate-400">
            Compares insured value and annual premium for other assets versus income as an asset, and quantifies the gap.
          </p>
        </CardHeader>

        <CardContent className="px-5 pb-5 pt-4">
          <div className="mx-auto h-72 w-full max-w-2xl">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <BarChart data={chartData} margin={{ top: 26, right: 12, left: 12, bottom: 4 }} barCategoryGap="28%" barGap={0}>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} dy={6} interval={0} />
                <YAxis hide domain={[0, chartDomainMax]} />
                <Tooltip content={<ClusterTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="value" name="Value" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={56} minPointSize={(value) => (value > 0 ? 4 : 0)}>
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(value: number) => (value ? formatCurrency(value) : "")}
                    style={{ fill: "#e2e8f0", fontSize: 10, fontWeight: 700 }}
                  />
                </Bar>
                <Bar dataKey="premium" name="Premium" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={56} minPointSize={(value) => (value > 0 ? 4 : 0)}>
                  <LabelList
                    dataKey="premium"
                    position="top"
                    formatter={(value: number) => (value ? formatCurrency(value) : "")}
                    style={{ fill: "#e2e8f0", fontSize: 10, fontWeight: 700 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-slate-800/60 pt-3">
            <LegendSwatch color="#3b82f6" label="Value" />
            <LegendSwatch color="#ef4444" label="Premium" />
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
