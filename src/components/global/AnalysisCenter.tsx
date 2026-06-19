import * as Dialog from "@radix-ui/react-dialog"
import { useEffect, useMemo, useState } from "react"
import { Calculator, ChevronDown, Database, Download, FileCode2, FileSearch, ShieldCheck, Table2, X } from "lucide-react"
import { advisorFormulaRegistry } from "@/domain/formulas/formulaRegistry"
import { calculateLifeInsuranceGap } from "@/features/risk-modules/life/calculations/calculateLifeInsuranceGap"
import { calculateIncomeGapScenarios } from "@/features/risk-modules/life/calculations/calculateIncomeGapScenarios"
import { sanitizeLifeInputs } from "@/features/risk-modules/life/utils/sanitizeLifeInputs"
import { calculateDisabilityGap } from "@/features/risk-modules/disability/calculations/calculateDisabilityGap"
import { calculateUnemploymentGap } from "@/features/risk-modules/unemployment/calculations/calculateUnemploymentGap"
import { calculateLiabilityGap } from "@/features/risk-modules/liability/calculations/calculateLiabilityGap"
import { type RiskModuleType, useAppStore } from "@/lib/store"
import { ThemedSelect } from "@/components/ThemedSelect"

type JsonObject = Record<string, unknown>

type AnalysisModule = {
  module: RiskModuleType
  formulaVersion: string
  lastSavedCalculationAt: string | null
  inputs: unknown
  assumptions: unknown
  outputs: unknown
  supplementalOutputs: unknown
}

const moduleLabels: Record<RiskModuleType, string> = {
  life: "Life Insurance",
  disability: "Disability",
  unemployment: "Unemployment",
  liability: "Liability / Lawsuit",
}

const formulaVersions: Record<RiskModuleType, string> = {
  life: "life-v1.0.0",
  disability: "di-v1.0.0",
  unemployment: "unemployment-v1.0.0",
  liability: "liability-v1.0.0",
}

function titleCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_.-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function scalarRows(value: unknown, prefix = ""): Array<[string, unknown]> {
  if (!isObject(value)) return []
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (Array.isArray(child)) return []
    return isObject(child) ? scalarRows(child, path) : [[path, child]]
  })
}

function arrayTables(value: unknown, prefix = ""): Array<{ path: string; rows: unknown[] }> {
  if (!isObject(value)) return []
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (Array.isArray(child)) return [{ path, rows: child }]
    return isObject(child) ? arrayTables(child, path) : []
  })
}

function exactValue(value: unknown) {
  if (value === null) return "null"
  if (value === undefined) return "undefined"
  if (typeof value === "boolean") return value ? "true" : "false"
  return String(value)
}

function displayValue(key: string, value: unknown) {
  if (value === null || value === undefined) return "Not provided"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value !== "number") return /id$/i.test(key) ? String(value) : titleCase(String(value))
  if (/age|yearIndex|years|months|duration/i.test(key)) return value.toLocaleString("en-US", { maximumFractionDigits: 2 })
  if (/rate|ratio|percentage|percent|pct/i.test(key)) {
    const isAlreadyPercent = /reserveCoveragePct/i.test(key)
    const percentage = !isAlreadyPercent && Math.abs(value) <= 1 ? value * 100 : value
    return `${percentage.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`
  }
  if (/income|benefit|coverage|expense|asset|saving|gap|need|resource|offset|premium|cash|reserve|shortfall|equity|risk|value|withdrawal|burn|balance|debt|education|exposure|garnish/i.test(key)) {
    return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
  }
  return value.toLocaleString("en-US", { maximumFractionDigits: 4 })
}

function KeyValuePanel({ title, description, data }: { title: string; description: string; data: unknown }) {
  const rows = scalarRows(data)
  if (!rows.length) return null
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950/40">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900/60">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800/70">
        {rows.map(([key, value]) => (
          <div key={key} className="grid gap-1 px-5 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,0.8fr)] sm:items-center sm:gap-5">
            <div className="min-w-0"><p className="text-xs font-medium text-gray-600 dark:text-gray-300">{titleCase(key)}</p><p className="mt-0.5 truncate font-mono text-[9px] text-gray-400" title={key}>{key}</p></div>
            <div className="min-w-0 sm:text-right"><p className="break-words text-sm font-semibold text-gray-950 dark:text-gray-100">{displayValue(key, value)}</p><p className="mt-0.5 break-all font-mono text-[9px] text-gray-400" title="Exact stored value">raw: {exactValue(value)}</p></div>
          </div>
        ))}
      </div>
    </section>
  )
}

function DataTable({ path, rows }: { path: string; rows: unknown[] }) {
  if (!rows.length) return null
  const columns = Array.from(new Set(rows.flatMap((row) => isObject(row) ? Object.keys(row) : ["value"])))
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950/40">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/60">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">{titleCase(path)}</h4>
        <span className="text-[10px] font-medium text-gray-500">{rows.length} rows</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full whitespace-nowrap text-left text-[11px]">
          <thead className="sticky top-0 bg-white text-gray-500 shadow-[0_1px_0_#e5e7eb] dark:bg-gray-950 dark:text-gray-400 dark:shadow-[0_1px_0_#1f2937]">
            <tr>{columns.map((column) => <th key={column} className="px-3 py-2 font-semibold">{titleCase(column)}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono text-gray-800 dark:divide-gray-800/70 dark:text-gray-200">
            {rows.map((row, index) => (
              <tr key={index}>{columns.map((column) => { const value = isObject(row) ? row[column] : row; return <td key={column} className="px-3 py-2" title={`Exact: ${exactValue(value)}`}>{displayValue(column, value)}</td> })}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function SectionHeading({ number, title, description, icon: Icon }: { number: string; title: string; description: string; icon: typeof Calculator }) {
  return <div className="flex items-start gap-3"><div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-700 ring-1 ring-brand-500/20 dark:text-brand-300"><Icon className="size-4" /></div><div><div className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Step {number}</span><h4 className="text-sm font-semibold text-gray-950 dark:text-gray-100">{title}</h4></div><p className="mt-1 text-xs leading-5 text-gray-500">{description}</p></div></div>
}

function ModuleAudit({ item, defaultOpen }: { item: AnalysisModule; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const formulas = advisorFormulaRegistry.filter((formula) => formula.module === item.module)
  const tables = [...arrayTables(item.outputs), ...arrayTables(item.supplementalOutputs)]
  const inputCount = scalarRows(item.inputs).length
  const outputCount = scalarRows(item.outputs).length + scalarRows(item.supplementalOutputs).length
  return (
    <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950/30">
      <summary className="analysis-module-summary flex cursor-pointer list-none items-center gap-4 px-5 py-4 transition hover:brightness-110 dark:hover:bg-gray-900/50 [&::-webkit-details-marker]:hidden">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-sm font-bold text-brand-700 ring-1 ring-brand-500/20 dark:text-brand-300">{moduleLabels[item.module].slice(0, 1)}</div>
        <div className="min-w-0 flex-1"><h3 className="font-semibold text-gray-950 dark:text-gray-50">{moduleLabels[item.module]}</h3><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500"><span>Formula {item.formulaVersion}</span><span>{inputCount} inputs</span><span>{outputCount} outputs</span><span>{tables.reduce((total, table) => total + table.rows.length, 0)} schedule rows</span></div></div>
        <div className="hidden text-right text-[10px] text-gray-500 sm:block"><p>Last saved calculation</p><p className="mt-1 font-medium text-gray-700 dark:text-gray-300">{item.lastSavedCalculationAt ? new Date(item.lastSavedCalculationAt).toLocaleString() : "Not previously saved"}</p></div>
        <ChevronDown className="size-5 text-gray-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-8 border-t border-gray-200 p-5 lg:p-6 dark:border-gray-800">
        <section className="space-y-4"><SectionHeading number="1" title="Methodology and formulas" description="Review the approved calculation logic and disclosures applied to this module." icon={FileCode2} /><div className="grid gap-3 lg:grid-cols-2">{formulas.map((formula, index) => <div key={formula.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40"><div className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-[10px] font-bold text-brand-700 dark:text-brand-300">{index + 1}</span><div><p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formula.label}</p><p className="mt-1 text-xs leading-5 text-gray-500">{formula.description}</p></div></div><code className="mt-3 block overflow-x-auto rounded-lg border border-gray-200 bg-white p-3 text-[11px] leading-5 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-brand-200">{formula.formulaText}</code>{formula.disclosure ? <p className="mt-2 text-[10px] leading-4 text-gray-500">Disclosure: {formula.disclosure}</p> : null}</div>)}</div></section>
        <section className="space-y-4"><SectionHeading number="2" title="Source data" description="Verify the client inputs and methodology assumptions supplied to the calculation engine." icon={Database} /><div className="grid items-start gap-4 lg:grid-cols-2"><KeyValuePanel title="Client and scenario inputs" description={`${inputCount} exact values supplied to this module.`} data={item.inputs} /><KeyValuePanel title="Model assumptions" description="Rates and methodology controls applied to the calculation." data={item.assumptions} /></div></section>
        <section className="space-y-4"><SectionHeading number="3" title="Calculated results" description="Review the human-readable results; each row retains its exact machine value for reconciliation." icon={Calculator} /><div className="grid items-start gap-4 lg:grid-cols-2"><KeyValuePanel title="Primary outputs" description="Deterministic results generated from the source data above." data={item.outputs} /><KeyValuePanel title="Supplemental analysis" description="Additional module calculations and scenario results." data={item.supplementalOutputs} /></div></section>
        {tables.length ? <section className="space-y-4"><SectionHeading number="4" title="Calculation schedules" description="Inspect every period-level record used by charts and aggregate results. Hover a value to see its exact machine representation." icon={Table2} /><div className="grid gap-4">{tables.map((table) => <DataTable key={table.path} path={table.path} rows={table.rows} />)}</div></section> : null}
      </div>
    </details>
  )
}

export function AnalysisCenter() {
  const clients = useAppStore((state) => state.clients)
  const scenarios = useAppStore((state) => state.scenarios)
  const records = useAppStore((state) => state.moduleRecordsByScenarioId)
  const activeScenarios = useMemo(
    () => scenarios.filter((scenario) => scenario.status !== "archived"),
    [scenarios],
  )
  const [scenarioId, setScenarioId] = useState(activeScenarios[0]?.id ?? "")
  const [moduleFilter, setModuleFilter] = useState<RiskModuleType | "all">("all")

  useEffect(() => {
    if (!activeScenarios.some((scenario) => scenario.id === scenarioId)) {
      setScenarioId(activeScenarios[0]?.id ?? "")
      setModuleFilter("all")
    }
  }, [activeScenarios, scenarioId])

  const snapshot = useMemo(() => {
    const scenario = activeScenarios.find((item) => item.id === scenarioId) ?? activeScenarios[0]
    if (!scenario) return null
    const client = clients.find((item) => item.id === scenario.clientId)
    const scenarioRecords = records[scenario.id]
    const modules = scenario.includedModules.flatMap<AnalysisModule>((module): AnalysisModule[] => {
      if (module === "life") {
        const record = scenarioRecords?.life
        if (!record) return []
        const inputs = sanitizeLifeInputs(record.inputs)
        return [{ module, formulaVersion: formulaVersions[module], lastSavedCalculationAt: record.lastCalculatedAt ?? null, inputs: record.inputs, assumptions: record.assumptions, outputs: calculateLifeInsuranceGap(inputs, record.assumptions), supplementalOutputs: { incomeGapAnalysis: calculateIncomeGapScenarios(inputs, record.assumptions) } }]
      }
      if (module === "disability") {
        const record = scenarioRecords?.disability
        if (!record) return []
        return [{ module, formulaVersion: formulaVersions[module], lastSavedCalculationAt: record.lastCalculatedAt ?? null, inputs: record.inputs, assumptions: record.assumptions, outputs: calculateDisabilityGap(record.inputs, record.assumptions), supplementalOutputs: undefined }]
      }
      if (module === "unemployment") {
        const record = scenarioRecords?.unemployment
        if (!record) return []
        return [{ module, formulaVersion: formulaVersions[module], lastSavedCalculationAt: record.lastCalculatedAt ?? null, inputs: record.inputs, assumptions: null, outputs: calculateUnemploymentGap(record.inputs), supplementalOutputs: undefined }]
      }
      const record = scenarioRecords?.liability
      if (!record) return []
      return [{ module, formulaVersion: formulaVersions[module], lastSavedCalculationAt: record.lastCalculatedAt ?? null, inputs: record.inputs, assumptions: null, outputs: calculateLiabilityGap(record.inputs), supplementalOutputs: undefined }]
    })
    return {
      generatedAt: new Date().toISOString(),
      engine: "Deterministic, version-controlled TypeScript calculation engine",
      client: client ? { id: client.id, displayName: client.displayName, updatedAt: client.updatedAt } : null,
      scenario: { id: scenario.id, name: scenario.name, status: scenario.status, updatedAt: scenario.updatedAt, lastCalculatedAt: scenario.lastCalculatedAt ?? null },
      modules,
    }
  }, [activeScenarios, clients, records, scenarioId])

  const visibleModules = snapshot?.modules.filter((item) => moduleFilter === "all" || item.module === moduleFilter) ?? []

  function downloadSnapshot() {
    if (!snapshot) return
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `northstar-analysis-${snapshot.scenario.id}-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:bg-brand-500 dark:hover:bg-brand-600">
          <FileSearch className="size-4" aria-hidden="true" /> Open Analysis Center
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm data-[state=open]:animate-dialogOverlayShow" />
        <Dialog.Content data-analysis-center className="fixed inset-0 z-[90] flex flex-col overflow-hidden bg-gray-50 shadow-2xl outline-none dark:bg-[#0d1b2a]">
          <header className="flex flex-wrap items-center gap-4 border-b border-brand-500/25 bg-linear-to-r from-[#081423] to-[#14283b] px-5 py-4 text-white shadow-lg">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30"><ShieldCheck className="size-5" /></div><div><Dialog.Title className="text-lg font-semibold text-white">Calculation Analysis Center</Dialog.Title><Dialog.Description className="mt-0.5 text-xs text-[#94a3b8]">Structured evidence for methodology, source data, results, and schedules.</Dialog.Description></div></div>
            </div>
            <label className="w-full sm:w-80 lg:w-104"><span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-[#94a3b8]">Review scenario</span><ThemedSelect ariaLabel="Review scenario" value={scenarioId} onValueChange={(value) => { setScenarioId(value); setModuleFilter("all") }} options={activeScenarios.map((scenario) => ({ value: scenario.id, label: `${clients.find((item) => item.id === scenario.clientId)?.displayName ?? "Unknown client"} - ${scenario.name}` }))} disabled={activeScenarios.length === 0} contentClassName="z-[100]" className="border-white/15 bg-white/5 text-white hover:bg-white/10 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10" /></label>
            <button onClick={downloadSnapshot} disabled={!snapshot} className="inline-flex items-center gap-2 self-end rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-semibold text-[#cbd5e1] transition hover:border-brand-500/50 hover:bg-brand-500/10 hover:text-white disabled:opacity-40"><Download className="size-4" /> Export evidence</button>
            <Dialog.Close asChild><button aria-label="Close analysis center" className="self-end rounded-full p-2.5 text-[#94a3b8] transition hover:bg-white/10 hover:text-white"><X className="size-5" /></button></Dialog.Close>
          </header>

          {!snapshot ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center"><div><FileSearch className="mx-auto size-9 text-gray-400" /><p className="mt-3 font-semibold text-gray-800 dark:text-gray-100">No active scenarios to analyze</p><p className="mt-1 text-sm text-gray-500">Create a client risk review first.</p></div></div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="border-b border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="flex flex-wrap items-center gap-2"><span className="mr-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Review scope</span>
                  {(["all", ...snapshot.modules.map((item) => item.module)] as const).map((module) => (
                    <button key={module} onClick={() => setModuleFilter(module)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${moduleFilter === module ? "bg-brand-50 text-brand-800 ring-1 ring-brand-200 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-500/30" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"}`}>{module === "all" ? "All modules" : moduleLabels[module]}</button>
                  ))}
                  <span className="ml-auto hidden text-[10px] text-gray-500 sm:block">Evidence generated {new Date(snapshot.generatedAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-7xl space-y-5 p-5 lg:p-7">
                  <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950/30"><div className="grid sm:grid-cols-2 xl:grid-cols-4"><div className="border-b border-gray-200 p-4 sm:border-r xl:border-b-0 dark:border-gray-800"><p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Client</p><p className="mt-1 text-sm font-semibold text-gray-950 dark:text-gray-100">{snapshot.client?.displayName ?? "Unknown client"}</p></div><div className="border-b border-gray-200 p-4 xl:border-b-0 xl:border-r dark:border-gray-800"><p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Scenario status</p><p className="mt-1 text-sm font-semibold text-gray-950 dark:text-gray-100">{titleCase(snapshot.scenario.status)}</p></div><div className="border-b border-gray-200 p-4 sm:border-b-0 sm:border-r dark:border-gray-800"><p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Modules in scope</p><p className="mt-1 text-sm font-semibold text-gray-950 dark:text-gray-100">{snapshot.modules.length} calculation modules</p></div><div className="p-4"><p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Evidence generated</p><p className="mt-1 text-sm font-semibold text-gray-950 dark:text-gray-100">{new Date(snapshot.generatedAt).toLocaleString()}</p></div></div></section>
                  <div className="space-y-4">{visibleModules.map((item, index) => <ModuleAudit key={item.module} item={item} defaultOpen={moduleFilter !== "all" || index === 0} />)}</div>
                </div>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
