import * as Dialog from "@radix-ui/react-dialog"
import { useMemo, useState } from "react"
import { Download, FileSearch, X } from "lucide-react"
import { advisorFormulaRegistry } from "@/domain/formulas/formulaRegistry"
import { calculateLifeInsuranceGap } from "@/features/risk-modules/life/calculations/calculateLifeInsuranceGap"
import { calculateIncomeGapScenarios } from "@/features/risk-modules/life/calculations/calculateIncomeGapScenarios"
import { sanitizeLifeInputs } from "@/features/risk-modules/life/utils/sanitizeLifeInputs"
import { calculateDisabilityGap } from "@/features/risk-modules/disability/calculations/calculateDisabilityGap"
import { calculateUnemploymentGap } from "@/features/risk-modules/unemployment/calculations/calculateUnemploymentGap"
import { calculateLiabilityGap } from "@/features/risk-modules/liability/calculations/calculateLiabilityGap"
import { type RiskModuleType, useAppStore } from "@/lib/store"

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

function KeyValueTable({ title, data }: { title: string; data: unknown }) {
  const rows = scalarRows(data)
  if (!rows.length) return null
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950/40">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/60">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">{title}</h4>
      </div>
      <div className="max-h-80 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-white text-gray-500 dark:bg-gray-950 dark:text-gray-400">
            <tr><th className="px-4 py-2 font-semibold">Field</th><th className="px-4 py-2 font-semibold">Exact value</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70">
            {rows.map(([key, value]) => (
              <tr key={key}>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-300"><span title={key}>{titleCase(key)}</span></td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-950 dark:text-gray-100">{exactValue(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
      <div className="max-h-96 overflow-auto">
        <table className="min-w-full whitespace-nowrap text-left text-[11px]">
          <thead className="sticky top-0 bg-white text-gray-500 shadow-[0_1px_0_#e5e7eb] dark:bg-gray-950 dark:text-gray-400 dark:shadow-[0_1px_0_#1f2937]">
            <tr>{columns.map((column) => <th key={column} className="px-3 py-2 font-semibold">{titleCase(column)}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono text-gray-800 dark:divide-gray-800/70 dark:text-gray-200">
            {rows.map((row, index) => (
              <tr key={index}>{columns.map((column) => <td key={column} className="px-3 py-2">{exactValue(isObject(row) ? row[column] : row)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function AnalysisCenter() {
  const clients = useAppStore((state) => state.clients)
  const scenarios = useAppStore((state) => state.scenarios)
  const records = useAppStore((state) => state.moduleRecordsByScenarioId)
  const activeScenarios = scenarios.filter((scenario) => scenario.status !== "archived")
  const [scenarioId, setScenarioId] = useState(activeScenarios[0]?.id ?? "")
  const [moduleFilter, setModuleFilter] = useState<RiskModuleType | "all">("all")

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
          <header className="flex flex-wrap items-center gap-4 border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-950/70">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-lg font-semibold text-gray-950 dark:text-gray-50">Calculation Analysis Center</Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Compliance review of exact inputs, formulas, outputs, and schedules.</Dialog.Description>
            </div>
            <select value={snapshot?.scenario.id ?? ""} onChange={(event) => { setScenarioId(event.target.value); setModuleFilter("all") }} className="max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
              {activeScenarios.map((scenario) => {
                const client = clients.find((item) => item.id === scenario.clientId)
                return <option key={scenario.id} value={scenario.id}>{client?.displayName ?? "Unknown client"} - {scenario.name}</option>
              })}
            </select>
            <button onClick={downloadSnapshot} disabled={!snapshot} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"><Download className="size-4" /> Export evidence</button>
            <Dialog.Close asChild><button aria-label="Close analysis center" className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-950 dark:hover:bg-gray-800 dark:hover:text-white"><X className="size-5" /></button></Dialog.Close>
          </header>

          {!snapshot ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center"><div><FileSearch className="mx-auto size-9 text-gray-400" /><p className="mt-3 font-semibold text-gray-800 dark:text-gray-100">No active scenarios to analyze</p><p className="mt-1 text-sm text-gray-500">Create a client risk review first.</p></div></div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="border-b border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="flex flex-wrap items-center gap-2">
                  {(["all", ...snapshot.modules.map((item) => item.module)] as const).map((module) => (
                    <button key={module} onClick={() => setModuleFilter(module)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${moduleFilter === module ? "bg-brand-50 text-brand-800 ring-1 ring-brand-200 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-500/30" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"}`}>{module === "all" ? "All modules" : moduleLabels[module]}</button>
                  ))}
                  <span className="ml-auto text-[10px] text-gray-500">Generated {new Date(snapshot.generatedAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto p-5 lg:p-6">
                <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-xs text-brand-900 dark:border-brand-800 dark:bg-brand-950/30 dark:text-brand-200"><strong>Calculation provenance:</strong> {snapshot.engine}. AI does not determine or alter the values shown in this evidence snapshot.</div>
                {visibleModules.map((item) => {
                  const formulas = advisorFormulaRegistry.filter((formula) => formula.module === item.module)
                  const tables = [...arrayTables(item.outputs), ...arrayTables(item.supplementalOutputs)]
                  return (
                    <article key={item.module} className="space-y-4">
                      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 pb-3 dark:border-gray-800">
                        <div><h3 className="text-base font-semibold text-gray-950 dark:text-gray-50">{moduleLabels[item.module]}</h3><p className="mt-1 text-xs text-gray-500">Formula version <span className="font-mono text-gray-700 dark:text-gray-300">{item.formulaVersion}</span></p></div>
                        <p className="text-[10px] text-gray-500">Last saved calculation: {item.lastSavedCalculationAt ? new Date(item.lastSavedCalculationAt).toLocaleString() : "Not previously saved"}</p>
                      </div>
                      <div className="grid gap-3 lg:grid-cols-2">
                        {formulas.map((formula) => <div key={formula.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950/40"><p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formula.label}</p><p className="mt-1 text-xs leading-5 text-gray-500">{formula.description}</p><code className="mt-3 block overflow-x-auto rounded-lg bg-gray-100 p-3 text-[11px] leading-5 text-gray-800 dark:bg-gray-900 dark:text-brand-200">{formula.formulaText}</code>{formula.disclosure ? <p className="mt-2 text-[10px] text-gray-500">{formula.disclosure}</p> : null}</div>)}
                      </div>
                      <div className="grid gap-4 xl:grid-cols-3"><KeyValueTable title="Input snapshot" data={item.inputs} /><KeyValueTable title="Assumption snapshot" data={item.assumptions} /><KeyValueTable title="Calculated outputs" data={{ outputs: item.outputs, supplemental: item.supplementalOutputs }} /></div>
                      <div className="grid gap-4">{tables.map((table) => <DataTable key={table.path} path={table.path} rows={table.rows} />)}</div>
                    </article>
                  )
                })}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
