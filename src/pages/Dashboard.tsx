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

const advisorReferenceModules: RiskModuleType[] = ["life", "liability", "unemployment"]
const allModuleTypes: RiskModuleType[] = ["life", "liability", "unemployment", "disability"]


function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="pt-2 text-xs font-semibold uppercase tracking-widest text-gray-500">{children}</p>
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
      <DrawerContent className="sm:max-w-3xl">
        <DrawerHeader>
          <DrawerTitle>Client Setup</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="space-y-5">
          <p className="text-sm text-gray-400">
            Matches the advisor reference workflow: client type, income earners, existing life coverage, non-qualified assets, and household auto liability.
          </p>

          <SectionTitle>Client Type</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["individual", "couple"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setField("clientType", type)}
                className={cx(
                  "rounded-lg border px-4 py-2 text-sm font-semibold capitalize transition",
                  form.clientType === type ? "border-cyan-500 bg-cyan-500/15 text-white" : "border-gray-700 bg-gray-900/60 text-gray-400 hover:text-gray-200",
                )}
              >
                {type === "individual" ? "Individual" : "Couple"}
              </button>
            ))}
          </div>

          <SectionTitle>Primary Earner</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="First name *" value={form.firstName} onChange={(event) => setField("firstName", event.target.value)} />
            <Input placeholder="Last name *" value={form.lastName} onChange={(event) => setField("lastName", event.target.value)} />
            <Input placeholder="Household / display name" value={form.displayName} onChange={(event) => setField("displayName", event.target.value)} />
            <Input type="number" min={18} max={64} placeholder="Current age *" value={form.age} onChange={(event) => setField("age", event.target.value)} />
            <Input type="number" min={0} placeholder="Annual income ($) *" value={form.annualIncome} onChange={(event) => setField("annualIncome", event.target.value)} />
            <Input type="number" min={0} placeholder="Monthly expenses ($)" value={form.monthlyExpenses} onChange={(event) => setField("monthlyExpenses", event.target.value)} />
            <Input placeholder="Email" value={form.email} onChange={(event) => setField("email", event.target.value)} />
            <Input placeholder="Phone" value={form.phone} onChange={(event) => setField("phone", event.target.value)} />
          </div>

          <SectionTitle>Existing Coverage — Primary Earner</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input type="number" min={0} placeholder="Group Life death benefit ($)" value={form.groupLifeCoverage} onChange={(event) => setField("groupLifeCoverage", event.target.value)} />
            <Input type="number" min={0} placeholder="Private Life death benefit ($)" value={form.privateLifeCoverage} onChange={(event) => setField("privateLifeCoverage", event.target.value)} />
            <div className="col-span-2 grid grid-cols-2 gap-3">
              <select value={form.privateLifePolicyType} onChange={(event) => setField("privateLifePolicyType", event.target.value as "term" | "permanent")} className="h-9 rounded-md border border-gray-700 bg-gray-900 px-3 text-sm text-gray-50">
                <option value="term">Term</option>
                <option value="permanent">Permanent</option>
              </select>
              {form.privateLifePolicyType === "term" ? <Input type="number" min={0} placeholder="Term length (years)" value={form.privateLifeTermYears} onChange={(event) => setField("privateLifeTermYears", event.target.value)} /> : <div />}
            </div>
            <Input type="number" min={0} placeholder="Non-qualified assets ($)" value={form.nonQualifiedAssets} onChange={(event) => setField("nonQualifiedAssets", event.target.value)} />
          </div>

          {isCouple ? (
            <>
              <SectionTitle>Secondary Earner</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Secondary earner full name" value={form.spouseName} onChange={(event) => setField("spouseName", event.target.value)} />
                <Input type="number" min={18} max={64} placeholder="Secondary current age" value={form.spouseAge} onChange={(event) => setField("spouseAge", event.target.value)} />
                <Input type="number" min={0} placeholder="Secondary annual income ($)" value={form.spouseAnnualIncome} onChange={(event) => setField("spouseAnnualIncome", event.target.value)} />
                <Input type="number" min={0} placeholder="Secondary Group Life ($)" value={form.spouseGroupLifeCoverage} onChange={(event) => setField("spouseGroupLifeCoverage", event.target.value)} />
                <Input type="number" min={0} placeholder="Secondary Private Life ($)" value={form.spousePrivateLifeCoverage} onChange={(event) => setField("spousePrivateLifeCoverage", event.target.value)} />
                <Input type="number" min={0} placeholder="Secondary non-qualified assets ($)" value={form.spouseNonQualifiedAssets} onChange={(event) => setField("spouseNonQualifiedAssets", event.target.value)} />
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <select value={form.spousePrivateLifePolicyType} onChange={(event) => setField("spousePrivateLifePolicyType", event.target.value as "term" | "permanent")} className="h-9 rounded-md border border-gray-700 bg-gray-900 px-3 text-sm text-gray-50">
                    <option value="term">Term</option>
                    <option value="permanent">Permanent</option>
                  </select>
                  {form.spousePrivateLifePolicyType === "term" ? <Input type="number" min={0} placeholder="Secondary term length (years)" value={form.spousePrivateLifeTermYears} onChange={(event) => setField("spousePrivateLifeTermYears", event.target.value)} /> : <div />}
                </div>
              </div>
            </>
          ) : null}

          <SectionTitle>Household Liability Coverage</SectionTitle>
          <Input type="number" min={0} placeholder="Underlying Auto Liability Limit ($)" value={form.autoLiabilityLimit} onChange={(event) => setField("autoLiabilityLimit", event.target.value)} />
        </DrawerBody>
        <DrawerFooter>
          {submitAttempted && validationErrors.length > 0 ? (
            <ul role="alert" aria-live="polite" className="mr-auto space-y-1">
              {validationErrors.map((error) => (
                <li key={error} className="flex items-center gap-1.5 text-xs text-red-400">
                  <RiAlertLine className="size-3.5 shrink-0" aria-hidden="true" />
                  {error}
                </li>
              ))}
            </ul>
          ) : null}
          <Button variant="secondary" onClick={() => { setOpen(false); setSubmitAttempted(false) }}>Cancel</Button>
          <Button
            onClick={() => {
              setSubmitAttempted(true)
              if (!canSubmit) return
              createClient(formToPayload(form))
              setOpen(false)
              setSubmitAttempted(false)
              setForm(emptyClientForm)
            }}
          >
            Save Client
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function RiskReviewDrawer({ client, mode = "generate" }: { client: ClientRecord; mode?: "generate" | "regenerate" }) {
  const navigate = useNavigate()
  const createScenario = useAppStore((state) => state.createScenario)
  const [open, setOpen] = useState(false)
  const [scenarioName, setScenarioName] = useState(`${client.lastName} Household Risk Review`)
  const [includedModules, setIncludedModules] = useState<RiskModuleType[]>(advisorReferenceModules)
  const [activeModule, setActiveModule] = useState<RiskModuleType>("life")
  const isRegenerate = mode === "regenerate"

  function toggleModule(module: RiskModuleType) {
    setIncludedModules((current) => {
      if (current.includes(module)) {
        const next = current.filter((item) => item !== module)
        if (!next.length) return current
        if (!next.includes(activeModule)) setActiveModule(next[0])
        return next
      }
      return [...current, module]
    })
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {isRegenerate ? (
          <button
            aria-label={`Regenerate risk review for ${client.displayName}`}
            title="Regenerate risk review"
            className="rounded-md p-1.5 text-blue-400 transition-colors hover:bg-blue-950/30 hover:text-blue-300"
          >
            <RiRefreshLine className="size-4" aria-hidden="true" />
          </button>
        ) : (
          <Button variant="secondary">Generate Risk Review</Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-xl">
        <DrawerHeader><DrawerTitle>{isRegenerate ? "Regenerate Income Gap Analysis" : "Generate Income Gap Analysis"}</DrawerTitle></DrawerHeader>
        <DrawerBody className="space-y-4">
          <p className="text-sm text-gray-400">
            {isRegenerate
              ? "Create a fresh risk review from the client’s current setup fields. Existing reviews remain available until removed."
              : "Creates the advisor-reference modules first: Death/Life, Lawsuit, and Unemployment. Disability can be added when needed."}
          </p>
          <Input value={scenarioName} onChange={(event) => setScenarioName(event.target.value)} />
          <div className="space-y-2">
            {allModuleTypes.map((module) => (
              <label key={module} className="flex items-center justify-between rounded-md border border-gray-800 bg-gray-900/40 px-3 py-2 text-sm text-gray-300">
                <span>{moduleLabel[module]}</span>
                <input type="checkbox" checked={includedModules.includes(module)} onChange={() => toggleModule(module)} />
              </label>
            ))}
          </div>
          <select value={activeModule} onChange={(event) => setActiveModule(event.target.value as RiskModuleType)} className="h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 text-sm text-gray-50">
            {includedModules.map((module) => <option key={module} value={module}>{moduleLabel[module]}</option>)}
          </select>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            const scenarioId = createScenario({ clientId: client.id, name: scenarioName, includedModules, activeModule })
            if (!scenarioId) return
            setOpen(false)
            navigate(`/scenarios/${scenarioId}/${activeModule}`)
          }}>{isRegenerate ? "Regenerate Review" : "Create and Start"}</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function RemoveClientDrawer({ client, scenarioCount }: { client: ClientRecord; scenarioCount: number }) {
  const archiveClient = useAppStore((state) => state.archiveClient)
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          aria-label={`Remove ${client.displayName}`}
          className="rounded-md p-1.5 text-red-500/60 transition-colors hover:bg-red-950/30 hover:text-red-400"
        >
          <RiDeleteBinLine className="size-4" aria-hidden="true" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-w-115">
        <DrawerHeader>
          <DrawerTitle>Remove Client</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="space-y-5">
          <div className="rounded-2xl border border-red-900/60 bg-red-950/20 p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-950 text-red-300 ring-1 ring-red-800/80">
                <RiAlertLine className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-red-100">Remove {client.displayName} from the dashboard?</p>
                <p className="mt-1 text-sm leading-6 text-red-200/70">
                  This will archive the client profile and hide it from active client setup and review workflows.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
            <p className="text-sm font-medium text-gray-100">{client.displayName}</p>
            <p className="mt-1 text-xs text-gray-500">
              {client.profile.clientType === "couple" ? "Couple" : "Individual"} · {scenarioCount} risk review{scenarioCount === 1 ? "" : "s"}
            </p>
          </div>

          <p className="text-xs leading-5 text-gray-500">
            This is a soft remove for MVP/local usage. Existing persisted data is marked archived rather than permanently deleted.
          </p>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => {
              archiveClient(client.id)
              setOpen(false)
            }}
          >
            <RiDeleteBinLine className="size-4" aria-hidden="true" />
            Remove Client
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export function Dashboard() {
  const allClients = useAppStore((state) => state.clients)
  const allScenarios = useAppStore((state) => state.scenarios)
  const [search, setSearch] = useState("")
  const clients = useMemo(() => allClients.filter((client) => client.status !== "archived"), [allClients])
  const scenarios = useMemo(() => allScenarios.filter((scenario) => scenario.status !== "archived"), [allScenarios])
  const scenariosByClientId = useMemo(() => scenarios.reduce<Record<string, number>>((acc, scenario) => ({ ...acc, [scenario.clientId]: (acc[scenario.clientId] ?? 0) + 1 }), {}), [scenarios])
  const firstScenarioByClientId = useMemo(() =>
    scenarios.reduce<Record<string, { id: string; activeModule: RiskModuleType }>>((acc, scenario) => {
      if (!acc[scenario.clientId]) acc[scenario.clientId] = { id: scenario.id, activeModule: scenario.activeModule }
      return acc
    }, {}),
    [scenarios],
  )
  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return clients
    return clients.filter((client) => client.displayName.toLowerCase().includes(query) || client.email.toLowerCase().includes(query))
  }, [clients, search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-50">Client Setup</h1>
          <p className="mt-1 text-sm text-gray-400">Enter client information to generate a personalized income gap analysis across all risk modules.</p>
        </div>
        <AddClientDrawer />
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
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-gray-800/60">
            {filteredClients.map((client) => {
              const scenarioCount = scenariosByClientId[client.id] ?? 0
              const firstScenario = firstScenarioByClientId[client.id]
              const firstScenarioId = firstScenario?.id
              const hasGeneratedReview = scenarioCount > 0

              return (
                <li key={client.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-100">{client.displayName}</p>
                      <Link to={`/clients/${client.id}/overview`} title="View and edit client overview" className="rounded-md p-1 text-cyan-400 transition-colors hover:bg-cyan-950/30 hover:text-cyan-300">
                        <RiEyeLine className="size-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500">Updated {formatDate(client.updatedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {firstScenario && firstScenarioId ? (
                      <Link
                        to={`/scenarios/${firstScenarioId}/${firstScenario.activeModule}`}
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        Open Review
                      </Link>
                    ) : null}
                    {hasGeneratedReview ? (
                      <RiskReviewDrawer client={client} mode="regenerate" />
                    ) : (
                      <RiskReviewDrawer client={client} mode="generate" />
                    )}
                    <RemoveClientDrawer client={client} scenarioCount={scenarioCount} />
                  </div>
                  <RiArrowRightSLine className="size-4 text-gray-700" />
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </div>
  )
}
