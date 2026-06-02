import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/Drawer"
import { Input } from "@/components/Input"
import type { DiBenefitPeriod } from "@/features/risk-modules/disability/types"
import { ClientRecord, RiskModuleType, useAppStore } from "@/lib/store"
import { cx, formatDate } from "@/lib/utils"
import {
  ClientFormState,
  emptyClientForm,
  formToPayload,
  isClientFormValid,
  validateClientForm,
} from "@/lib/clientFormSchema"
import { RiAddLine, RiAlertLine, RiArrowRightSLine, RiDeleteBinLine, RiEyeLine, RiRefreshLine, RiSearchLine, RiUserLine } from "@remixicon/react"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const moduleLabel: Record<RiskModuleType, string> = {
  life: "Life Insurance / Death",
  liability: "Liability / Lawsuit",
  unemployment: "Unemployment",
  disability: "Disability",
}

const advisorReferenceModules: RiskModuleType[] = ["life", "liability", "unemployment", "disability"]
const selectClass = "h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 text-sm text-gray-50"

const BENEFIT_PERIOD_OPTIONS: { value: DiBenefitPeriod | ""; label: string }[] = [
  { value: "", label: "Select a period…" },
  { value: "2y", label: "2 Years" },
  { value: "5y", label: "5 Years" },
  { value: "10y", label: "10 Years" },
  { value: "A65", label: "To Age 65" },
  { value: "A67", label: "To Age 67" },
  { value: "A70", label: "To Age 70" },
]

function SectionTitle({ children, description }: { children: React.ReactNode; description?: string }) {
  return (
    <div className="space-y-1 pt-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{children}</p>
      {description ? <p className="text-xs leading-5 text-gray-500">{description}</p> : null}
    </div>
  )
}

function AddClientDrawer() {
  const createClient = useAppStore((state) => state.createClient)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<ClientFormState>(emptyClientForm)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const isCouple = form.clientType === "couple"
  const validationErrors = validateClientForm(form)
  const canSubmit = isClientFormValid(form)

  function setField<K extends keyof ClientFormState>(field: K, value: ClientFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 dark:text-white">
          <RiAddLine className="size-4" aria-hidden="true" />
          Add Client
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-4xl">
        <DrawerHeader>
          <DrawerTitle>Client Setup</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="space-y-5">
          <SectionTitle>Client Type</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["individual", "couple"] as const).map((type) => (
              <button key={type} type="button" onClick={() => setField("clientType", type)} className={cx("rounded-lg border px-4 py-2 text-sm font-semibold capitalize transition", form.clientType === type ? "border-cyan-500 bg-cyan-500/15 text-white" : "border-gray-700 bg-gray-900/60 text-gray-400 hover:text-gray-200")}>{type === "individual" ? "Individual" : "Couple"}</button>
            ))}
          </div>

          <SectionTitle description="Core fields used across Life, Liability, Unemployment, Disability, and planning modules.">Primary Earner</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input placeholder="First name *" value={form.firstName} onChange={(event) => setField("firstName", event.target.value)} />
            <Input placeholder="Last name *" value={form.lastName} onChange={(event) => setField("lastName", event.target.value)} />
            <Input placeholder="Household / display name" value={form.displayName} onChange={(event) => setField("displayName", event.target.value)} />
            <Input type="number" min={18} max={100} placeholder="Current age *" value={form.age} onChange={(event) => setField("age", event.target.value)} />
            <Input type="number" min={18} max={100} placeholder="Projection end age *" value={form.expectedRetirementAge} onChange={(event) => setField("expectedRetirementAge", event.target.value)} />
            <Input type="number" min={0} placeholder="Annual income ($) *" value={form.annualIncome} onChange={(event) => setField("annualIncome", event.target.value)} />
            <Input type="number" min={0} placeholder="Monthly household expenses ($)" value={form.monthlyExpenses} onChange={(event) => setField("monthlyExpenses", event.target.value)} />
          </div>

          <SectionTitle description="These values feed Life Insurance, Unemployment, and Liability assumptions.">Household Cash / Assets</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input type="number" min={0} placeholder="Emergency savings ($)" value={form.emergencySavings} onChange={(event) => setField("emergencySavings", event.target.value)} />
            <Input type="number" min={0} placeholder="Non-qualified assets ($)" value={form.nonQualifiedAssets} onChange={(event) => setField("nonQualifiedAssets", event.target.value)} />
            <Input type="number" min={0} placeholder="Home equity ($)" value={form.homeEquity} onChange={(event) => setField("homeEquity", event.target.value)} />
          </div>

          <SectionTitle>Existing Life Coverage — Primary Earner</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input type="number" min={0} placeholder="Group Life death benefit ($)" value={form.groupLifeCoverage} onChange={(event) => setField("groupLifeCoverage", event.target.value)} />
            <Input type="number" min={0} placeholder="Private Life death benefit ($)" value={form.privateLifeCoverage} onChange={(event) => setField("privateLifeCoverage", event.target.value)} />
            <select value={form.privateLifePolicyType} onChange={(event) => setField("privateLifePolicyType", event.target.value as "term" | "permanent")} className={selectClass}><option value="term">Term</option><option value="permanent">Permanent</option></select>
            {form.privateLifePolicyType === "term" ? <Input type="number" min={0} placeholder="Term length (years)" value={form.privateLifeTermYears} onChange={(event) => setField("privateLifeTermYears", event.target.value)} /> : null}
          </div>

          <SectionTitle>Group Long Term Disability (LTD)</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input type="number" min={0} max={100} step={1} placeholder="Coverage of Income (%)" value={form.ltdCoveragePercent} onChange={(event) => setField("ltdCoveragePercent", event.target.value)} />
            <Input type="number" min={0} placeholder="Monthly Cap ($)" value={form.ltdMonthlyCap} onChange={(event) => setField("ltdMonthlyCap", event.target.value)} />
            <select value={form.ltdTaxable ? "true" : "false"} onChange={(event) => setField("ltdTaxable", event.target.value === "true")} className={selectClass}><option value="true">Taxable? Yes — 70% of gross</option><option value="false">Taxable? No — full benefit</option></select>
          </div>

          <SectionTitle>Individual Disability Insurance</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input type="number" min={0} placeholder="Monthly Benefit ($)" value={form.privateDisabilityBenefitMonthly} onChange={(event) => setField("privateDisabilityBenefitMonthly", event.target.value)} />
            <Input type="number" min={0} placeholder="Monthly Premium ($)" value={form.privateDisabilityMonthlyPremium} onChange={(event) => setField("privateDisabilityMonthlyPremium", event.target.value)} />
            <select value={form.privateDisabilityBenefitPeriod} onChange={(event) => setField("privateDisabilityBenefitPeriod", event.target.value as DiBenefitPeriod | "")} className={selectClass}>{BENEFIT_PERIOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
            <Input type="number" min={0} max={30} step={0.1} placeholder="Break-Even Rate of Return (%)" value={form.disabilityBreakEvenRateOfReturn} onChange={(event) => setField("disabilityBreakEvenRateOfReturn", event.target.value)} />
            <Input type="number" min={1} step={1} placeholder="Months Without Income" value={form.disabilityBreakEvenMonthsWithoutIncome} onChange={(event) => setField("disabilityBreakEvenMonthsWithoutIncome", event.target.value)} />
          </div>

          {isCouple ? <><SectionTitle description="Secondary income feeds unemployment reserve logic and household liability exposure modeling.">Secondary Earner</SectionTitle><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Input placeholder="Secondary earner full name" value={form.spouseName} onChange={(event) => setField("spouseName", event.target.value)} /><Input type="number" min={18} max={100} placeholder="Secondary current age" value={form.spouseAge} onChange={(event) => setField("spouseAge", event.target.value)} /><Input type="number" min={0} placeholder="Secondary annual income ($)" value={form.spouseAnnualIncome} onChange={(event) => setField("spouseAnnualIncome", event.target.value)} /><Input type="number" min={0} placeholder="Secondary Group Life ($)" value={form.spouseGroupLifeCoverage} onChange={(event) => setField("spouseGroupLifeCoverage", event.target.value)} /><Input type="number" min={0} placeholder="Secondary Private Life ($)" value={form.spousePrivateLifeCoverage} onChange={(event) => setField("spousePrivateLifeCoverage", event.target.value)} /><Input type="number" min={0} placeholder="Secondary non-qualified assets ($)" value={form.spouseNonQualifiedAssets} onChange={(event) => setField("spouseNonQualifiedAssets", event.target.value)} /><select value={form.spousePrivateLifePolicyType} onChange={(event) => setField("spousePrivateLifePolicyType", event.target.value as "term" | "permanent")} className={selectClass}><option value="term">Secondary Term</option><option value="permanent">Secondary Permanent</option></select>{form.spousePrivateLifePolicyType === "term" ? <Input type="number" min={0} placeholder="Secondary term length (years)" value={form.spousePrivateLifeTermYears} onChange={(event) => setField("spousePrivateLifeTermYears", event.target.value)} /> : null}</div></> : null}

          <SectionTitle description="Umbrella fields are illustrative and shown in $1M blocks inside the Liability module.">Household Liability Coverage</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input type="number" min={0} placeholder="Underlying Auto Liability Limit ($)" value={form.autoLiabilityLimit} onChange={(event) => setField("autoLiabilityLimit", event.target.value)} />
            <Input type="number" min={0} step={1_000_000} placeholder="Existing Umbrella Coverage ($)" value={form.umbrellaCoverage} onChange={(event) => setField("umbrellaCoverage", event.target.value)} />
          </div>
        </DrawerBody>
        <DrawerFooter>
          {submitAttempted && validationErrors.length > 0 ? <ul role="alert" aria-live="polite" className="mr-auto space-y-1">{validationErrors.map((error) => <li key={error} className="flex items-center gap-1.5 text-xs text-red-400"><RiAlertLine className="size-3.5 shrink-0" aria-hidden="true" />{error}</li>)}</ul> : null}
          <Button variant="secondary" onClick={() => { setOpen(false); setSubmitAttempted(false) }}>Cancel</Button>
          <Button onClick={() => { setSubmitAttempted(true); if (!canSubmit) return; createClient(formToPayload(form)); setOpen(false); setSubmitAttempted(false); setForm(emptyClientForm) }}>Save Client</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function RiskReviewDrawer({ client, mode = "generate" }: { client: ClientRecord; mode?: "generate" | "regenerate" }) {
  const navigate = useNavigate()
  const createScenario = useAppStore((state) => state.createScenario)
  const isRegenerate = mode === "regenerate"
  function handleClick() {
    const scenarioId = createScenario({ clientId: client.id, name: `${client.lastName} Household Risk Review`, includedModules: advisorReferenceModules, activeModule: "life" })
    if (scenarioId) navigate(`/scenarios/${scenarioId}/life`)
  }
  return isRegenerate ? <button aria-label={`Regenerate risk review for ${client.displayName}`} title="Regenerate risk review" className="rounded-md p-1.5 text-blue-400 transition-colors hover:bg-blue-950/30 hover:text-blue-300" onClick={handleClick}><RiRefreshLine className="size-4" aria-hidden="true" /></button> : <Button variant="secondary" onClick={handleClick}>Generate Risk Review</Button>
}

function RemoveClientDrawer({ client, scenarioCount }: { client: ClientRecord; scenarioCount: number }) {
  const archiveClient = useAppStore((state) => state.archiveClient)
  const [open, setOpen] = useState(false)
  return <Drawer open={open} onOpenChange={setOpen}><DrawerTrigger asChild><button aria-label={`Remove ${client.displayName}`} className="rounded-md p-1.5 text-red-500/60 transition-colors hover:bg-red-950/30 hover:text-red-400"><RiDeleteBinLine className="size-4" aria-hidden="true" /></button></DrawerTrigger><DrawerContent className="sm:max-w-xl"><DrawerHeader><DrawerTitle>Remove Client</DrawerTitle></DrawerHeader><DrawerBody className="space-y-5"><div className="rounded-2xl border border-red-900/60 bg-red-950/20 p-4"><div className="flex items-start gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-950 text-red-300 ring-1 ring-red-800/80"><RiAlertLine className="size-5" aria-hidden="true" /></div><div><p className="font-semibold text-red-100">Remove {client.displayName} from the dashboard?</p><p className="mt-1 text-sm leading-6 text-red-200/70">This will archive the client profile and hide it from active client setup and review workflows.</p></div></div></div><div className="rounded-xl border border-gray-800 bg-gray-950/70 p-4"><p className="text-sm font-medium text-gray-100">{client.displayName}</p><p className="mt-1 text-xs text-gray-500">{client.profile.clientType === "couple" ? "Couple" : "Individual"} · {scenarioCount} risk review{scenarioCount === 1 ? "" : "s"}</p></div></DrawerBody><DrawerFooter><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button variant="destructive" onClick={() => { archiveClient(client.id); setOpen(false) }}><RiDeleteBinLine className="size-4" />Remove Client</Button></DrawerFooter></DrawerContent></Drawer>
}

export function Dashboard() {
  const allClients = useAppStore((state) => state.clients)
  const allScenarios = useAppStore((state) => state.scenarios)
  const [search, setSearch] = useState("")
  const clients = useMemo(() => allClients.filter((client) => client.status !== "archived"), [allClients])
  const scenarios = useMemo(() => allScenarios.filter((scenario) => scenario.status !== "archived"), [allScenarios])
  const scenariosByClientId = useMemo(() => scenarios.reduce<Record<string, number>>((acc, scenario) => ({ ...acc, [scenario.clientId]: (acc[scenario.clientId] ?? 0) + 1 }), {}), [scenarios])
  const firstScenarioByClientId = useMemo(() => scenarios.reduce<Record<string, { id: string; activeModule: RiskModuleType }>>((acc, scenario) => { if (!acc[scenario.clientId]) acc[scenario.clientId] = { id: scenario.id, activeModule: scenario.activeModule }; return acc }, {}), [scenarios])
  const filteredClients = useMemo(() => { const query = search.trim().toLowerCase(); return query ? clients.filter((client) => client.displayName.toLowerCase().includes(query)) : clients }, [clients, search])

  return <div className="space-y-6"><div className="flex items-center justify-between gap-6"><div><h1 className="text-2xl font-semibold text-gray-50">Client Setup</h1><p className="mt-1 text-sm text-gray-400">Enter client information to generate a personalized gap analysis across all advisor modules.</p></div><AddClientDrawer /></div>{clients.length ? <div className="relative max-w-sm"><RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clients..." className="h-9 w-full rounded-lg border border-gray-700 bg-gray-900 pl-9 pr-4 text-sm text-gray-100 outline-none" /></div> : null}{clients.length === 0 ? <Card className="border-dashed border-gray-800 px-6 py-16 text-center"><RiUserLine className="mx-auto mb-3 size-8 text-gray-700" /><h2 className="text-lg font-semibold text-gray-100">No clients yet.</h2><div className="mt-6 flex justify-center"><AddClientDrawer /></div></Card> : <Card className="overflow-hidden p-0"><ul className="divide-y divide-gray-800/60">{filteredClients.map((client) => { const scenarioCount = scenariosByClientId[client.id] ?? 0; const firstScenario = firstScenarioByClientId[client.id]; const hasGeneratedReview = scenarioCount > 0; return <li key={client.id} className="flex items-center gap-4 px-6 py-4"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Link to={`/clients/${client.id}/overview`} className="font-medium text-gray-100 transition-colors hover:text-cyan-300 hover:underline" title="View client overview">{client.displayName}</Link><Link to={`/clients/${client.id}/overview`} title="View and edit client overview" className="rounded-md p-1 text-cyan-400 transition-colors hover:bg-cyan-950/30 hover:text-cyan-300"><RiEyeLine className="size-3.5" aria-hidden="true" /></Link></div><p className="text-xs text-gray-500">Updated {formatDate(client.updatedAt)}</p></div><div className="flex items-center gap-2">{firstScenario ? <Link to={`/scenarios/${firstScenario.id}/${firstScenario.activeModule}`} className="text-sm text-blue-400 hover:text-blue-300">Open Review</Link> : null}{hasGeneratedReview ? <RiskReviewDrawer client={client} mode="regenerate" /> : <RiskReviewDrawer client={client} mode="generate" />}<RemoveClientDrawer client={client} scenarioCount={scenarioCount} /></div><RiArrowRightSLine className="size-4 text-gray-700" /></li>})}</ul></Card>}</div>
}
