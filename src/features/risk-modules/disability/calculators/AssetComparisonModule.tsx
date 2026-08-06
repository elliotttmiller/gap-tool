import { useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { DisabilityInputs } from "../types"

interface AssetComparisonModuleProps {
  inputs?: DisabilityInputs
  onInputsChange?: (next: DisabilityInputs) => void
}

interface AssetPremiumRow {
  id: string
  label: string
  assetValue: number
  annualPremium: number
}

let rowIdCounter = 0
function nextRowId() {
  rowIdCounter += 1
  return `asset-${rowIdCounter}`
}

function niceMax(value: number): number {
  if (value <= 0) return 100
  const padded = value * 1.15
  const magnitude = Math.pow(10, Math.floor(Math.log10(padded)))
  const residual = padded / magnitude
  const niceResidual = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10
  return niceResidual * magnitude
}

function DualScaleTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const entry = payload.find((item: any) => Number(item.value) > 0) ?? payload[0]
  const value = Number(entry?.value ?? 0)
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-950/95 p-3 text-xs shadow-2xl backdrop-blur">
      <p className="font-semibold text-gray-100">{label}</p>
      <p className="mt-1 font-mono text-gray-200">{formatCurrency(value)}/yr</p>
    </div>
  )
}

function DualBarChart({
  title,
  leftName,
  leftValue,
  leftDomainMax,
  leftFill,
  rightName,
  rightValue,
  rightDomainMax,
  rightFill,
}: {
  title: string
  leftName: string
  leftValue: number
  leftDomainMax: number
  leftFill: string
  rightName: string
  rightValue: number
  rightDomainMax: number
  rightFill: string
}) {
  const data = useMemo(
    () => [
      { name: leftName, left: leftValue, right: 0 },
      { name: rightName, left: 0, right: rightValue },
    ],
    [leftName, leftValue, rightName, rightValue],
  )

  return (
    <div className="bg-gray-900/40 p-3">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">{title}</p>
      <div className="mx-auto h-64 w-full max-w-sm">
        <ResponsiveContainer width="100%" height="100%" debounce={100}>
          <BarChart data={data} margin={{ top: 28, right: 24, left: 24, bottom: 8 }} barCategoryGap="30%" barGap={0}>
            <CartesianGrid stroke="rgba(148,163,184,0.06)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }} tickLine={false} axisLine={false} dy={8} interval={0} />
            <YAxis yAxisId="left" hide domain={[0, leftDomainMax]} />
            <YAxis yAxisId="right" hide domain={[0, rightDomainMax]} />
            <Tooltip content={<DualScaleTooltip />} cursor={{ fill: "rgba(255,255,255,0.025)" }} />
            <Bar yAxisId="left" dataKey="left" name={leftName} fill={leftFill} radius={[6, 6, 0, 0]} maxBarSize={88}>
              <LabelList
                dataKey="left"
                position="top"
                formatter={(value: number) => (value ? formatCurrency(value) : "")}
                style={{ fill: "#e2e8f0", fontSize: 12, fontWeight: 700 }}
              />
            </Bar>
            <Bar yAxisId="right" dataKey="right" name={rightName} fill={rightFill} radius={[6, 6, 0, 0]} maxBarSize={88}>
              <LabelList
                dataKey="right"
                position="top"
                formatter={(value: number) => (value ? formatCurrency(value) : "")}
                style={{ fill: "#e2e8f0", fontSize: 12, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function AssetComparisonModule({ inputs, onInputsChange }: AssetComparisonModuleProps) {
  const monthlyIncomeInsurancePremium = Math.max(0, inputs?.privateDiMonthlyPremium ?? 0)
  const annualIncomeInsuranceCost = monthlyIncomeInsurancePremium * 12
  const canEditIncomePremium = Boolean(inputs && onInputsChange)

  const projectionYears = Math.max(0, (inputs?.retirementAge ?? 0) - (inputs?.currentAge ?? 0))
  const netIncomeAsset = Math.max(0, inputs?.privateDiBenefitMonthly ?? 0) * 12 * projectionYears

  const [assetRows, setAssetRows] = useState<AssetPremiumRow[]>([
    { id: nextRowId(), label: "Home", assetValue: 0, annualPremium: 0 },
    { id: nextRowId(), label: "Auto", assetValue: 0, annualPremium: 0 },
  ])

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

  const addAssetRow = () => {
    setAssetRows((rows) => [...rows, { id: nextRowId(), label: "", assetValue: 0, annualPremium: 0 }])
  }

  const removeAssetRow = (id: string) => {
    setAssetRows((rows) => rows.filter((row) => row.id !== id))
  }

  const updateAssetRowLabel = (id: string, label: string) => {
    setAssetRows((rows) => rows.map((row) => (row.id === id ? { ...row, label } : row)))
  }

  const updateAssetRowValue = (id: string, assetValue: number) => {
    setAssetRows((rows) => rows.map((row) => (row.id === id ? { ...row, assetValue } : row)))
  }

  const updateAssetRowPremium = (id: string, annualPremium: number) => {
    setAssetRows((rows) => rows.map((row) => (row.id === id ? { ...row, annualPremium } : row)))
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
                  className="inline-flex items-center gap-1 rounded-md border border-gray-700 px-2 py-1 text-[11px] font-semibold text-gray-400 transition hover:border-brand-600 hover:text-brand-300"
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
                      placeholder="Asset name"
                      className="h-8 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 text-sm text-gray-100 outline-none transition focus:border-gray-700 focus:bg-gray-950"
                    />
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-500">$</span>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={row.assetValue || ""}
                        onChange={(event) => updateAssetRowValue(row.id, Math.max(0, Number(event.target.value) || 0))}
                        placeholder="0"
                        className="h-8 w-full rounded-md border border-gray-800 bg-gray-950 pl-4 pr-2 text-right text-sm text-gray-100 outline-none transition focus:border-brand-600"
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
                        placeholder="0"
                        className="h-8 w-full rounded-md border border-gray-800 bg-gray-950 pl-4 pr-2 text-right text-sm font-semibold text-gray-100 outline-none transition focus:border-brand-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAssetRow(row.id)}
                      aria-label="Remove asset"
                      className="flex h-8 w-7 items-center justify-center rounded text-gray-600 opacity-0 transition hover:bg-red-950/50 hover:text-red-400 group-hover:opacity-100"
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

      <Card className="border-gray-800 bg-gray-900/25">
        <CardContent className="p-4">
          <div className="mb-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Asset Insurance Cost Comparison</p>
            <p className="mt-0.5 text-xs text-gray-500">What you pay annually to insure other assets compared with what you pay to insure earned income as an asset.</p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-lg border border-gray-800 bg-gray-800 md:grid-cols-2">
            <DualBarChart
              title="Other Assets"
              leftName="Asset Value"
              leftValue={totalAssetValue}
              leftDomainMax={otherAssetsSharedDomainMax}
              leftFill="#64748b"
              rightName="Insurance Cost"
              rightValue={annualOtherAssetInsuranceCost}
              rightDomainMax={otherAssetsSharedDomainMax}
              rightFill="#a855f7"
            />
            <DualBarChart
              title="Income as an Asset"
              leftName="Net Income Asset"
              leftValue={netIncomeAsset}
              leftDomainMax={netIncomeAssetDomainMax}
              leftFill="#06b6d4"
              rightName="Coverage Premium"
              rightValue={annualIncomeInsuranceCost}
              rightDomainMax={coveragePremiumDomainMax}
              rightFill="#f59e0b"
            />
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-gray-500">
            Net income asset and coverage premium each use their own scale so the premium bar stays legible.
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
