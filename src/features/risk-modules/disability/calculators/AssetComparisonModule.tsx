import { useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
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

function PanelTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  const value = Number(entry?.value ?? 0)
  const suffix = entry?.payload?.unit ?? ""
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
}: ComparisonBarPanelProps) {
  const data = useMemo(
    () => [
      { name: leftName, value: leftValue, fill: leftFill, unit: leftUnit },
      { name: rightName, value: rightValue, fill: rightFill, unit: rightUnit },
    ],
    [leftName, leftValue, leftFill, leftUnit, rightName, rightValue, rightFill, rightUnit],
  )

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{category}</p>
      <div className="mx-auto h-56 w-full max-w-55">
        <ResponsiveContainer width="100%" height="100%" debounce={100}>
          <BarChart data={data} margin={{ top: 26, right: 12, left: 12, bottom: 4 }} barCategoryGap="30%" barGap={0}>
            <CartesianGrid stroke="rgba(148,163,184,0.08)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} dy={6} interval={0} />
            <YAxis hide domain={[0, domainMax]} />
            <Tooltip content={<PanelTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={90} minPointSize={(value) => (value > 0 ? 4 : 0)}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="value"
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

  const netIncomeAssetDomainMax = useMemo(
    () => niceMax(Math.max(netIncomeAsset, annualIncomeInsuranceCost, 1)),
    [netIncomeAsset, annualIncomeInsuranceCost],
  )

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

          <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
            {assetRows.map((row) => (
              <div
                key={row.id}
                className="group relative rounded-lg border border-gray-800 bg-gray-950/40 p-2.5"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={row.label}
                    onChange={(event) => updateAssetRowLabel(row.id, event.target.value)}
                    disabled={!canEditAssets}
                    placeholder="Asset name"
                    className="h-7 w-full min-w-0 rounded-md border border-transparent bg-transparent px-1.5 text-sm font-semibold text-gray-100 outline-none transition focus:border-gray-700 focus:bg-gray-950 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => removeAssetRow(row.id)}
                    disabled={!canEditAssets}
                    aria-label="Remove asset"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-600 opacity-0 transition hover:bg-red-950/50 hover:text-red-400 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Value of Asset</span>
                    <div className="relative mt-1">
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
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Annual Cost to Insure</span>
                    <div className="relative mt-1">
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
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-2 text-[10px] leading-relaxed text-gray-500">
            Add or remove assets such as home, auto, valuables, or other property to insure.
          </p>
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
              leftName="Value"
              leftValue={totalAssetValue}
              leftFill="#64748b"
              rightName="Cost"
              rightValue={annualOtherAssetInsuranceCost}
              rightUnit="/yr"
              rightFill="#a855f7"
              domainMax={otherAssetsSharedDomainMax}
            />
            <ComparisonBarPanel
              category="Income Asset"
              leftName="Asset"
              leftValue={netIncomeAsset}
              leftFill="#06b6d4"
              rightName="Premium"
              rightValue={annualIncomeInsuranceCost}
              rightUnit="/yr"
              rightFill="#f59e0b"
              domainMax={netIncomeAssetDomainMax}
            />
            <ComparisonBarPanel
              category="Difference"
              leftName="Other"
              leftValue={otherAssetsCombinedTotal}
              leftFill="#64748b"
              rightName="Income"
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
            Each panel's bars share one scale, so bar height is proportional to actual value —{" "}
            {combinedTotalsDifference >= 0 ? "income" : "other assets"} lead
            {" "}by {formatCurrency(Math.abs(combinedTotalsDifference))}.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
