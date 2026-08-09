import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ModuleMetricCard, type MetricCardAccent } from "@/features/risk-modules/core/ModuleMetricCard"
import { formatCurrency } from "@/lib/utils"
import type { DisabilityInputs, DisabilityOtherAsset } from "../types"

interface AssetComparisonModuleProps {
  inputs?: DisabilityInputs
  onInputsChange?: (next: DisabilityInputs) => void
}

type AssetPremiumRow = DisabilityOtherAsset

type ComparisonDatum = {
  name: string
  value: number
  premium: number
  valueColor: string
  premiumColor: string
}

const DEFAULT_ASSET_ROWS: AssetPremiumRow[] = [
  { id: "asset-default-home", label: "Home", assetValue: 0, annualPremium: 0 },
  { id: "asset-default-auto", label: "Auto", assetValue: 0, annualPremium: 0 },
]

const PAIR_COLORS = [
  { valueColor: "#93c5fd", premiumColor: "#f87171" },
  { valueColor: "#67e8f9", premiumColor: "#fb923c" },
  { valueColor: "#34d399", premiumColor: "#fbbf24" },
]

function nextRowId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function formatRate(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Not available"
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function safeAmount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0
}

function formatMultiplier(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Not available"
  if (value >= 100) return `${value.toFixed(0)}×`
  if (value >= 10) return `${value.toFixed(1)}×`
  return `${value.toFixed(2)}×`
}

function barHeight(value: number, max: number): string {
  if (value <= 0 || max <= 0) return "0%"
  return `${Math.max(8, (value / max) * 100)}%`
}

function InteractiveBar({ category, metric, value, max, color }: { category: string; metric: string; value: number; max: number; color: string }) {
  const formattedValue = formatCurrency(value)
  return (
    <div
      role="img"
      tabIndex={0}
      aria-label={`${category} ${metric.toLowerCase()}: ${formattedValue}`}
      className="group/bar relative mx-auto w-full max-w-20 cursor-default rounded-t-md outline-none transition duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:-translate-y-0.5 focus-visible:brightness-110"
      style={{ height: barHeight(value, max), backgroundColor: color }}
    >
      <span className="pointer-events-none absolute inset-0 rounded-t-md opacity-0 shadow-[0_0_22px_currentColor] transition-opacity duration-200 group-hover/bar:opacity-30 group-focus-visible/bar:opacity-30" style={{ color }} />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-44 -translate-x-1/2 translate-y-1 rounded-lg border border-slate-700/80 bg-slate-950/95 px-2.5 py-2 text-center opacity-0 shadow-xl backdrop-blur-sm transition-all duration-150 group-hover/bar:translate-y-0 group-hover/bar:opacity-100 group-focus-visible/bar:translate-y-0 group-focus-visible/bar:opacity-100">
        <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">{category} · {metric}</span>
        <span className="mt-0.5 block text-xs font-bold tabular-nums text-slate-100">{formattedValue}</span>
      </span>
    </div>
  )
}

function EfficiencyCard({ label, rate, accent }: { label: string; rate: number | null; accent: MetricCardAccent }) {
  return (
    <ModuleMetricCard
      className="mt-3"
      label={label}
      value={formatRate(rate)}
      description="Annual cost per $1,000 protected"
      accent={accent}
    />
  )
}

function ComparisonCard({ ratio }: { ratio: number | null }) {
  let description = "Enter non-zero values and premiums to calculate the comparison."
  if (ratio !== null && Number.isFinite(ratio)) {
    if (Math.abs(ratio - 1) < 0.005) description = "Both assets have approximately the same annual cost per $1,000 protected."
    else if (ratio > 1) description = `Other assets cost ${formatMultiplier(ratio)} more per $1,000 protected.`
    else if (ratio > 0) description = `Income protection costs ${formatMultiplier(1 / ratio)} more per $1,000 protected.`
  }

  return (
    <ModuleMetricCard
      className="mt-3"
      label="Cost comparison"
      value={formatMultiplier(ratio)}
      description={description}
      accent="green"
    />
  )
}

function ComparisonColumn({ datum, valueMax, premiumMax, children }: { datum: ComparisonDatum; valueMax: number; premiumMax: number; children: React.ReactNode }) {
  return (
    <section className="min-w-0 px-3 py-1 first:pl-0 last:pr-0 lg:border-l lg:border-slate-800/80 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0">
      <h3 className="text-center text-[11px] font-bold uppercase tracking-[0.17em] text-slate-100">{datum.name}</h3>
      <div className="mt-4 grid h-52 grid-cols-2 items-end gap-4 border-b border-slate-700/80 px-4">
        <div className="flex h-full min-w-0 flex-col justify-end">
          <div className="mb-2 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Value</p>
            <p className="mt-1 text-xs font-bold tabular-nums text-slate-100">{formatCurrency(datum.value)}</p>
          </div>
          <InteractiveBar category={datum.name} metric="Value" value={datum.value} max={valueMax} color={datum.valueColor} />
        </div>
        <div className="flex h-full min-w-0 flex-col justify-end">
          <div className="mb-2 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Annual premium</p>
            <p className="mt-1 text-xs font-bold tabular-nums text-slate-100">{formatCurrency(datum.premium)}</p>
          </div>
          <InteractiveBar category={datum.name} metric="Annual premium" value={datum.premium} max={premiumMax} color={datum.premiumColor} />
        </div>
      </div>
      {children}
    </section>
  )
}

export function AssetComparisonModule({ inputs, onInputsChange }: AssetComparisonModuleProps) {
  const monthlyIncomeInsurancePremium = Math.max(0, inputs?.privateDiMonthlyPremium ?? 0)
  const annualIncomeInsuranceCost = monthlyIncomeInsurancePremium * 12
  const projectionYears = Math.max(0, (inputs?.retirementAge ?? 0) - (inputs?.currentAge ?? 0))
  const netIncomeAsset = Math.max(0, inputs?.privateDiBenefitMonthly ?? 0) * 12 * projectionYears
  const canEditAssets = Boolean(inputs && onInputsChange)
  const [fallbackRows, setFallbackRows] = useState<AssetPremiumRow[]>(DEFAULT_ASSET_ROWS)
  const assetRows = canEditAssets ? (inputs!.otherAssets ?? DEFAULT_ASSET_ROWS) : fallbackRows
  const [assetsExpanded, setAssetsExpanded] = useState(false)
  const collapsedAssetLimit = 4
  const hasHiddenAssets = assetRows.length > collapsedAssetLimit
  const visibleAssetRows = assetsExpanded || !hasHiddenAssets ? assetRows : assetRows.slice(0, collapsedAssetLimit)

  const annualOtherAssetInsuranceCost = useMemo(() => assetRows.reduce((sum, row) => sum + (row.annualPremium || 0), 0), [assetRows])
  const totalAssetValue = useMemo(() => assetRows.reduce((sum, row) => sum + (row.assetValue || 0), 0), [assetRows])
  const valueDifference = safeAmount(Math.abs(netIncomeAsset - totalAssetValue))
  const costDifference = safeAmount(Math.abs(annualOtherAssetInsuranceCost - annualIncomeInsuranceCost))
  const otherCostPerThousand = totalAssetValue > 0 ? (annualOtherAssetInsuranceCost / totalAssetValue) * 1_000 : null
  const incomeCostPerThousand = netIncomeAsset > 0 ? (annualIncomeInsuranceCost / netIncomeAsset) * 1_000 : null
  const costRatio = otherCostPerThousand !== null && incomeCostPerThousand !== null && incomeCostPerThousand > 0 ? otherCostPerThousand / incomeCostPerThousand : null

  const chartData: ComparisonDatum[] = [
    { name: "Other Assets", value: safeAmount(totalAssetValue), premium: safeAmount(annualOtherAssetInsuranceCost), ...PAIR_COLORS[0] },
    { name: "Income Asset", value: safeAmount(netIncomeAsset), premium: safeAmount(annualIncomeInsuranceCost), ...PAIR_COLORS[1] },
    { name: "Difference", value: valueDifference, premium: costDifference, ...PAIR_COLORS[2] },
  ]
  const valueMax = Math.max(...chartData.map((row) => row.value), 1)
  const premiumMax = Math.max(...chartData.map((row) => row.premium), 1)

  const commitAssetRows = (next: AssetPremiumRow[]) => {
    if (canEditAssets) onInputsChange!({ ...inputs!, otherAssets: next })
    else setFallbackRows(next)
  }

  const addAssetRow = () => commitAssetRows([...assetRows, { id: nextRowId(), label: "", assetValue: 0, annualPremium: 0 }])
  const removeAssetRow = (id: string) => commitAssetRows(assetRows.filter((row) => row.id !== id))
  const updateAssetRowLabel = (id: string, label: string) => commitAssetRows(assetRows.map((row) => row.id === id ? { ...row, label } : row))
  const updateAssetRowValue = (id: string, assetValue: number) => commitAssetRows(assetRows.map((row) => row.id === id ? { ...row, assetValue } : row))
  const updateAssetRowPremium = (id: string, annualPremium: number) => commitAssetRows(assetRows.map((row) => row.id === id ? { ...row, annualPremium } : row))

  return (
    <div className="module-output-container space-y-4">
      <Card className="border-gray-800 bg-gray-900/25">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">Other Asset Premiums</span>
            <button type="button" onClick={addAssetRow} disabled={!canEditAssets} className="inline-flex items-center gap-1 rounded-md border border-gray-700 px-2 py-1 text-[11px] font-semibold text-gray-400 transition hover:border-brand-600 hover:text-brand-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-700 disabled:hover:text-gray-400">
              <Plus className="h-3.5 w-3.5" /> Add Asset
            </button>
          </div>

          {assetRows.length === 0 ? <p className="mt-2 rounded-lg border border-gray-800 px-3 py-4 text-center text-xs text-gray-500">No other assets added yet.</p> : null}
          {assetRows.length > 0 ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{[0, 1].map((columnIndex) => <div key={columnIndex} className="flex items-center gap-2 px-2.5"><span className="min-w-0 flex-1 text-[9px] font-bold uppercase tracking-widest text-gray-500">Asset Name</span><span className="w-24 shrink-0 text-center text-[9px] font-bold uppercase tracking-widest text-gray-500">Value</span><span className="w-24 shrink-0 text-center text-[9px] font-bold uppercase tracking-widest text-gray-500">Insure</span><span className="w-6 shrink-0" /></div>)}</div> : null}

          <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
            {visibleAssetRows.map((row) => (
              <div key={row.id} className="group flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-950/40 px-2.5 py-2 transition duration-200 focus-within:border-cyan-500/50 focus-within:shadow-[0_0_18px_rgba(34,211,238,0.10)]">
                <input type="text" value={row.label} onChange={(event) => updateAssetRowLabel(row.id, event.target.value)} disabled={!canEditAssets} placeholder="Asset name" className="h-7 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 text-sm font-semibold text-gray-100 outline-none transition focus:border-gray-700 focus:bg-gray-950 disabled:opacity-60" />
                <div className="flex min-w-24 shrink-0 items-center justify-center gap-1" title="Value of asset"><span className="shrink-0 text-[11px] text-gray-500">$</span><input type="number" min={0} step={1000} value={row.assetValue || ""} onChange={(event) => updateAssetRowValue(row.id, Math.max(0, Number(event.target.value) || 0))} disabled={!canEditAssets} placeholder="0" className="h-7 min-w-14 max-w-40 appearance-none rounded-md border border-transparent bg-transparent px-1 text-right text-sm text-gray-100 outline-none transition field-sizing-content focus:border-gray-700 focus:bg-gray-950 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:opacity-60" /></div>
                <div className="flex min-w-24 shrink-0 items-center justify-center gap-1" title="Annual cost to insure"><span className="shrink-0 text-[11px] text-gray-500">$</span><input type="number" min={0} step={50} value={row.annualPremium || ""} onChange={(event) => updateAssetRowPremium(row.id, Math.max(0, Number(event.target.value) || 0))} disabled={!canEditAssets} placeholder="0" className="h-7 min-w-14 max-w-40 appearance-none rounded-md border border-transparent bg-transparent px-1 text-right text-sm font-semibold text-gray-100 outline-none transition field-sizing-content focus:border-gray-700 focus:bg-gray-950 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:opacity-60" /></div>
                <button type="button" onClick={() => removeAssetRow(row.id)} disabled={!canEditAssets} aria-label="Remove asset" className="flex h-7 w-6 shrink-0 items-center justify-center rounded text-gray-600 opacity-0 transition hover:bg-red-950/50 hover:text-red-400 group-hover:opacity-100 focus-visible:opacity-100 disabled:pointer-events-none disabled:opacity-0"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
          {hasHiddenAssets ? (
            <div className="mt-2 flex justify-center">
              <button type="button" onClick={() => setAssetsExpanded((expanded) => !expanded)} aria-label={assetsExpanded ? "Collapse asset list" : "Expand asset list"} className="flex h-6 w-6 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-800 hover:text-gray-300">{assetsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="module-chart-card border-slate-800/80 bg-slate-950/60">
        <CardContent className="p-5">
          <div className="border-b border-slate-800/70 pb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">Asset Protection Comparison</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Compare annual protection cost for other assets with the value of protected income.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-3 lg:gap-0">
            <ComparisonColumn datum={chartData[0]} valueMax={valueMax} premiumMax={premiumMax}>
              <EfficiencyCard label="Other asset efficiency" rate={otherCostPerThousand} accent="blue" />
            </ComparisonColumn>
            <ComparisonColumn datum={chartData[1]} valueMax={valueMax} premiumMax={premiumMax}>
              <EfficiencyCard label="Income asset efficiency" rate={incomeCostPerThousand} accent="cyan" />
            </ComparisonColumn>
            <ComparisonColumn datum={chartData[2]} valueMax={valueMax} premiumMax={premiumMax}>
              <ComparisonCard ratio={costRatio} />
            </ComparisonColumn>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
