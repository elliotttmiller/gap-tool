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
import { ThemedSelect } from "@/components/ThemedSelect"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/Dropdown"
import { ImportClientsDrawer } from "@/features/client-profiles/ClientProfileActions"
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
import { RiAddLine, RiAlertLine, RiDeleteBinLine, RiMore2Line, RiSearchLine, RiUserLine } from "@remixicon/react"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const moduleLabel: Record<RiskModuleType, string> = {
  life: "Life Insurance / Death",
  liability: "Liability / Lawsuit",
  unemployment: "Unemployment",
  disability: "Disability",
}

const advisorReferenceModules: RiskModuleType[] = ["life", "liability", "unemployment", "disability"]

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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="block text-xs font-medium text-[#415b6d] dark:text-gray-300">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] leading-4 text-gray-500">{hint}</span> : null}
    </label>
  )
}

function EarnerPanel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[#d5e2e5] bg-[#f2f2f2] p-4 dark:border-gray-800 dark:bg-gray-950/35">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[#102a3a] dark:text-gray-100">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-[#607583] dark:text-gray-500">{description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
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
        <Button className="bg-brand-500 hover:bg-[#188a89] dark:bg-brand-500 dark:hover:bg-[#188a89] dark:text-white">
          <RiAddLine className="size-4" aria-hidden="true" />
          Add Client
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-5xl">
        <DrawerHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DrawerTitle>Client Setup</DrawerTitle>
            <ImportClientsDrawer compact />
          </div>
        </DrawerHeader>
        <DrawerBody className="space-y-5">
          <SectionTitle>Client Type</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["individual", "couple"] as const).map((type) => (
              <button key={type} type="button" onClick={() => setField("clientType", type)} className={cx("rounded-lg border px-4 py-2 text-sm font-semibold capitalize transition", form.clientType === type ? "border-[#188a89] bg-[#188a89] text-white shadow-sm" : "border-[#c8d7db] bg-[#f2f2f2] text-[#415b6d] hover:border-[#188a89] hover:bg-[#188a89]/10 hover:text-[#188a89] dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-400 dark:hover:bg-[#188a89]/15 dark:hover:text-white")}>{type === "individual" ? "Individual" : "Couple"}</button>
            ))}
          </div>

          <SectionTitle description={isCouple ? "Enter both earners together so income, assets, and Life coverage are reviewed consistently across the household." : "Primary client information used across the advisor risk modules."}>{isCouple ? "Household Earners" : "Primary Earner"}</SectionTitle>
          <div className={cx("grid gap-3", isCouple && "xl:grid-cols-2")}>
            <EarnerPanel title="Primary Earner" description="Primary insured and income source for the household review.">
              <Field label="First name *"><Input value={form.firstName} onChange={(event) => setField("firstName", event.target.value)} /></Field>
              <Field label="Last name *"><Input value={form.lastName} onChange={(event) => setField("lastName", event.target.value)} /></Field>
              <Field label="Current age *"><Input type="number" min={18} max={100} value={form.age} onChange={(event) => setField("age", event.target.value)} /></Field>
              <Field label="Annual income to replace ($) *"><Input type="number" min={0} groupThousands value={form.annualIncome} onChange={(event) => setField("annualIncome", event.target.value)} /></Field>
              <Field label="Non-qualified assets ($)"><Input type="number" min={0} groupThousands value={form.nonQualifiedAssets} onChange={(event) => setField("nonQualifiedAssets", event.target.value)} /></Field>
              <Field label="Group Life death benefit ($)"><Input type="number" min={0} groupThousands value={form.groupLifeCoverage} onChange={(event) => setField("groupLifeCoverage", event.target.value)} /></Field>
              <Field label="Private Life death benefit ($)"><Input type="number" min={0} groupThousands value={form.privateLifeCoverage} onChange={(event) => setField("privateLifeCoverage", event.target.value)} /></Field>
            </EarnerPanel>

            {isCouple ? (
              <EarnerPanel title="Secondary Earner" description="Secondary insured and income source included in household replacement needs.">
                <Field label="First name *"><Input value={form.spouseFirstName} onChange={(event) => setField("spouseFirstName", event.target.value)} /></Field>
                <Field label="Last name *"><Input value={form.spouseLastName} onChange={(event) => setField("spouseLastName", event.target.value)} /></Field>
                <Field label="Current age *"><Input type="number" min={18} max={100} value={form.spouseAge} onChange={(event) => setField("spouseAge", event.target.value)} /></Field>
                <Field label="Annual income to replace ($) *"><Input type="number" min={0} groupThousands value={form.spouseAnnualIncome} onChange={(event) => setField("spouseAnnualIncome", event.target.value)} /></Field>
                <Field label="Non-qualified assets ($)"><Input type="number" min={0} groupThousands value={form.spouseNonQualifiedAssets} onChange={(event) => setField("spouseNonQualifiedAssets", event.target.value)} /></Field>
                <Field label="Group Life death benefit ($)"><Input type="number" min={0} groupThousands value={form.spouseGroupLifeCoverage} onChange={(event) => setField("spouseGroupLifeCoverage", event.target.value)} /></Field>
                <Field label="Private Life death benefit ($)"><Input type="number" min={0} groupThousands value={form.spousePrivateLifeCoverage} onChange={(event) => setField("spousePrivateLifeCoverage", event.target.value)} /></Field>
              </EarnerPanel>
            ) : null}
          </div>

          <SectionTitle description="Shared household values used to prefill projection, liquidity, and liability assumptions.">Household Planning</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Household / display name"><Input value={form.displayName} onChange={(event) => setField("displayName", event.target.value)} /></Field>
            <Field label="Projection end age *"><Input type="number" min={18} max={100} value={form.expectedRetirementAge} onChange={(event) => setField("expectedRetirementAge", event.target.value)} /></Field>
            <Field label="Monthly household expenses ($)"><Input type="number" min={0} groupThousands value={form.monthlyExpenses} onChange={(event) => setField("monthlyExpenses", event.target.value)} /></Field>
            <Field label="Emergency savings ($)"><Input type="number" min={0} groupThousands value={form.emergencySavings} onChange={(event) => setField("emergencySavings", event.target.value)} /></Field>
            <Field label="Home equity ($)"><Input type="number" min={0} groupThousands value={form.homeEquity} onChange={(event) => setField("homeEquity", event.target.value)} /></Field>
          </div>

          <SectionTitle description="Disability coverage is modeled for the primary earner and prefills the Disability module.">Primary Earner Disability Coverage</SectionTitle>
          <div className="rounded-xl border border-[#d5e2e5] bg-[#f2f2f2] p-4 dark:border-gray-800 dark:bg-gray-950/25">
            <p className="mb-3 text-xs font-semibold text-[#102a3a] dark:text-gray-200">Group Long Term Disability (LTD)</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Coverage of Income (%)"><Input type="number" min={0} max={100} step={1} value={form.ltdCoveragePercent} onChange={(event) => setField("ltdCoveragePercent", event.target.value)} /></Field>
              <Field label="Monthly Cap ($)"><Input type="number" min={0} groupThousands value={form.ltdMonthlyCap} onChange={(event) => setField("ltdMonthlyCap", event.target.value)} /></Field>
              <Field label="Taxable?"><ThemedSelect value={form.ltdTaxable ? "true" : "false"} onValueChange={(value) => setField("ltdTaxable", value === "true")} options={[{ value: "true", label: "Yes - 70% of gross" }, { value: "false", label: "No - full benefit" }]} /></Field>
            </div>
          </div>

          <div className="rounded-xl border border-[#d5e2e5] bg-[#f2f2f2] p-4 dark:border-gray-800 dark:bg-gray-950/25">
            <p className="mb-3 text-xs font-semibold text-[#102a3a] dark:text-gray-200">Individual Disability Insurance</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Monthly Benefit ($)"><Input type="number" min={0} groupThousands value={form.privateDisabilityBenefitMonthly} onChange={(event) => setField("privateDisabilityBenefitMonthly", event.target.value)} /></Field>
              <Field label="Monthly Premium ($)"><Input type="number" min={0} groupThousands value={form.privateDisabilityMonthlyPremium} onChange={(event) => setField("privateDisabilityMonthlyPremium", event.target.value)} /></Field>
              <Field label="Benefit Period"><ThemedSelect value={form.privateDisabilityBenefitPeriod} onValueChange={(value) => setField("privateDisabilityBenefitPeriod", value as DiBenefitPeriod | "")} options={BENEFIT_PERIOD_OPTIONS} /></Field>
              <Field label="Break-Even Rate of Return (%)" hint="Default assumption: 6% annual return."><Input type="number" min={0} max={30} step={0.1} value={form.disabilityBreakEvenRateOfReturn} onChange={(event) => setField("disabilityBreakEvenRateOfReturn", event.target.value)} /></Field>
              <Field label="Months Without Income" hint="Default scenario: 12 months without earned income."><Input type="number" min={1} step={1} value={form.disabilityBreakEvenMonthsWithoutIncome} onChange={(event) => setField("disabilityBreakEvenMonthsWithoutIncome", event.target.value)} /></Field>
            </div>
          </div>

          <SectionTitle description="Umbrella fields are illustrative and shown in $1M blocks inside the Liability module.">Household Liability Coverage</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Underlying Auto Liability Limit ($)"><Input type="number" min={0} groupThousands value={form.autoLiabilityLimit} onChange={(event) => setField("autoLiabilityLimit", event.target.value)} /></Field>
            <Field label="Existing Umbrella Coverage ($)"><Input type="number" min={0} step={1_000_000} groupThousands value={form.umbrellaCoverage} onChange={(event) => setField("umbrellaCoverage", event.target.value)} /></Field>
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

function ClientActionsMenu({ client, scenarioCount }: { client: ClientRecord; scenarioCount: number }) {
  const navigate = useNavigate()
  const createScenario = useAppStore((state) => state.createScenario)
  const [removeOpen, setRemoveOpen] = useState(false)
  const hasGeneratedReview = scenarioCount > 0

  function handleGenerateReview() {
    const scenarioId = createScenario({ clientId: client.id, name: `${client.lastName} Household Risk Review`, includedModules: advisorReferenceModules, activeModule: "life" })
    if (scenarioId) navigate(`/scenarios/${scenarioId}/life`)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`More actions for ${client.displayName}`}
            className="relative z-20 flex size-9 items-center justify-center rounded-lg border border-transparent text-[#607583] transition-all hover:border-[#188a89]/35 hover:bg-[#188a89]/15 hover:text-[#188a89] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#188a89] group-hover:text-white/80 dark:text-[#9fb8c4] dark:hover:text-white"
          >
            <RiMore2Line className="size-5" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={handleGenerateReview}>
            {hasGeneratedReview ? "Generate Another Review" : "Generate Review"}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate(`/clients/${client.id}/overview`)}>
            Client Profile
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setRemoveOpen(true)} className="text-red-500 focus:text-red-500">
            <RiDeleteBinLine className="size-4" aria-hidden="true" /> Remove Client
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Drawer open={removeOpen} onOpenChange={setRemoveOpen}>
        <DrawerContent className="sm:max-w-md">
          <DrawerHeader><DrawerTitle>Remove {client.displayName}?</DrawerTitle></DrawerHeader>
          <DrawerBody><p className="text-sm text-gray-400">This archives the client from the active list. Existing reviews remain stored.</p></DrawerBody>
          <DrawerFooter>
            <Button variant="secondary" onClick={() => setRemoveOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { useAppStore.getState().archiveClient(client.id); setRemoveOpen(false) }}>Remove</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

function DashboardWatermark() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute right-[-18rem] top-[-10rem] h-[44rem] w-[44rem] opacity-[0.035] dark:opacity-[0.025]" viewBox="0 0 1254 1254" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="dashboard-solid-grey" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0 0 0 0 0.454902 0 0 0 0 0.482353 0 0 0 0 0.521569 0 0 0 1 0" />
          </filter>
        </defs>
        <image
          href={`${import.meta.env.BASE_URL}favicon.svg`}
          x="0"
          y="0"
          width="1254"
          height="1254"
          preserveAspectRatio="xMidYMid meet"
          filter="url(#dashboard-solid-grey)"
        />
      </svg>
    </div>
  )
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

  return (
    <div className="relative isolate min-h-[calc(100vh-3.75rem)]">
      <DashboardWatermark />
      <div className="relative z-10 mx-auto max-w-400 space-y-6 px-8 py-8 sm:px-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-50">Client Setup</h1>
          <p className="mt-1 text-sm text-gray-400">Enter client information to generate a personalized gap analysis across all advisor modules.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AddClientDrawer />
        </div>
      </div>

      {clients.length ? (
        <div className="relative max-w-sm">
          <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clients..." className="h-9 w-full rounded-lg border border-gray-700 bg-gray-900 pl-9 pr-4 text-sm text-gray-100 outline-none" />
        </div>
      ) : null}

      {clients.length === 0 ? (
        <Card className="border-dashed border-gray-800 px-6 py-16 text-center">
          <RiUserLine className="mx-auto mb-3 size-8 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-100">No clients yet.</h2>
          <div className="mt-6 flex justify-center"><AddClientDrawer /></div>
        </Card>
      ) : (
        <Card className="overflow-hidden border-[#d5e2e5] bg-white p-0 shadow-[0_14px_34px_rgba(13,27,42,0.14)] dark:border-gray-800 dark:bg-[#111821] dark:shadow-sm">
          {filteredClients.length ? (
            <ul className="divide-y divide-[#d5e2e5] dark:divide-gray-800/60">
              {filteredClients.map((client) => {
                const scenarioCount = scenariosByClientId[client.id] ?? 0
                const firstScenario = firstScenarioByClientId[client.id]
                const cardDestination = firstScenario
                  ? `/scenarios/${firstScenario.id}/${firstScenario.activeModule}`
                  : `/clients/${client.id}/overview`
                return (
                  <li key={client.id} className="group relative flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#188a89]">
                    <Link to={cardDestination} aria-label={`${firstScenario ? "Open review for" : "Open client profile for"} ${client.displayName}`} className="absolute inset-0 z-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#188a89]" />
                    <div className="pointer-events-none relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-600 shadow-inner transition-colors group-hover:border-white/25 group-hover:bg-white/10 group-hover:text-white dark:text-brand-300">
                      <RiUserLine className="size-5" aria-hidden="true" />
                    </div>
                    <div className="pointer-events-none relative z-10 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold text-[#102a3a] transition-colors group-hover:text-white dark:text-[#f1f7f8]">{client.displayName}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-[#607583] transition-colors group-hover:text-white/75 dark:text-[#9fb8c4]">
                        <span>Updated {formatDate(client.updatedAt)}</span>
                        <span aria-hidden="true">•</span>
                        <span>{scenarioCount} review{scenarioCount === 1 ? "" : "s"}</span>
                      </div>
                    </div>
                    <div className="relative z-20 flex items-center">
                      <ClientActionsMenu client={client} scenarioCount={scenarioCount} />
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="px-6 py-12 text-center">
              <RiSearchLine className="mx-auto size-6 text-[#607583] dark:text-[#7896a5]" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-[#102a3a] dark:text-[#f1f7f8]">No clients match “{search}”</p>
              <button type="button" onClick={() => setSearch("")} className="mt-2 text-xs font-medium text-brand-600 hover:text-brand-500 dark:text-brand-300 dark:hover:text-brand-200">Clear search</button>
            </div>
          )}
        </Card>
      )}
        </div>
    </div>
  )
}
