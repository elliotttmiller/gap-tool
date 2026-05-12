import { Badge } from "@/components/Badge"
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
import {
  ClientRecord,
  RiskModuleType,
  ScenarioRecord,
  ScenarioStatus,
  useAppStore,
} from "@/lib/store"
import { cx } from "@/lib/utils"
import {
  RiAddLine,
  RiArrowRightSLine,
  RiCalendarLine,
  RiExternalLinkLine,
  RiHeartPulseLine,
  RiMailLine,
  RiPhoneLine,
  RiScalesLine,
  RiSearchLine,
  RiShieldCheckLine,
  RiUser3Line,
  RiUserLine,
  RiUmbrellaLine,
} from "@remixicon/react"
import React, { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const moduleLabel: Record<RiskModuleType, string> = {
  disability: "Disability",
  life: "Life Insurance",
  unemployment: "Unemployment",
  liability: "Liability / Lawsuit",
}

const moduleIcon: Record<RiskModuleType, React.ElementType> = {
  disability: RiUmbrellaLine,
  life: RiHeartPulseLine,
  unemployment: RiShieldCheckLine,
  liability: RiScalesLine,
}

const moduleColor: Record<RiskModuleType, string> = {
  disability: "text-blue-400",
  life: "text-emerald-400",
  unemployment: "text-indigo-400",
  liability: "text-orange-400",
}

const scenarioStatusVariant: Record<ScenarioStatus, "success" | "warning" | "default" | "neutral"> = {
  draft: "neutral",
  inputs_needed: "warning",
  calculated: "success",
  ready_for_review: "default",
  presented: "success",
  report_generated: "success",
  archived: "neutral",
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function toDateLabel(value?: string) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function AddClientDrawer() {
  const createClient = useAppStore((state) => state.createClient)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    email: "",
    phone: "",
    age: "",
    annualIncome: "",
    monthlyExpenses: "",
  })

  const canSubmit = Boolean(form.firstName.trim() && form.lastName.trim())

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>
          <RiAddLine className="size-4" aria-hidden="true" />
          Add Client
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-xl">
        <DrawerHeader>
          <DrawerTitle className="text-gray-50">Add Client</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="space-y-4">
          <p className="text-sm text-gray-400">
            Add a real client profile to begin a risk review workflow.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="First name *"
              value={form.firstName}
              onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
            />
            <Input
              placeholder="Last name *"
              value={form.lastName}
              onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
            />
            <Input
              placeholder="Household / display name"
              value={form.displayName}
              onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
            <Input
              type="number"
              min={0}
              placeholder="Current age (recommended)"
              value={form.age}
              onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
            />
            <Input
              type="number"
              min={0}
              placeholder="Annual income (recommended)"
              value={form.annualIncome}
              onChange={(event) => setForm((prev) => ({ ...prev, annualIncome: event.target.value }))}
            />
            <Input
              type="number"
              min={0}
              placeholder="Monthly expenses (recommended)"
              value={form.monthlyExpenses}
              onChange={(event) => setForm((prev) => ({ ...prev, monthlyExpenses: event.target.value }))}
            />
          </div>
          <p className="text-xs text-gray-500">
            Required: first and last name. Clients can be saved as draft and completed later.
          </p>
        </DrawerBody>
        <DrawerFooter>
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={() => {
              if (!canSubmit) return
              createClient({
                firstName: form.firstName,
                lastName: form.lastName,
                displayName: form.displayName,
                email: form.email,
                phone: form.phone,
                age: form.age ? Number(form.age) : undefined,
                annualIncome: form.annualIncome ? Number(form.annualIncome) : undefined,
                monthlyExpenses: form.monthlyExpenses ? Number(form.monthlyExpenses) : undefined,
              })
              setOpen(false)
              setForm({
                firstName: "",
                lastName: "",
                displayName: "",
                email: "",
                phone: "",
                age: "",
                annualIncome: "",
                monthlyExpenses: "",
              })
            }}
          >
            Save Client
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function StartRiskReviewDrawer({ client }: { client: ClientRecord }) {
  const navigate = useNavigate()
  const createScenario = useAppStore((state) => state.createScenario)
  const [open, setOpen] = useState(false)
  const [scenarioName, setScenarioName] = useState(`${client.lastName} Household Risk Review`)
  const [notes, setNotes] = useState("")
  const [includedModules, setIncludedModules] = useState<RiskModuleType[]>([
    "disability",
    "life",
    "unemployment",
    "liability",
  ])
  const [activeModule, setActiveModule] = useState<RiskModuleType>("disability")

  const canSubmit = Boolean(scenarioName.trim() && includedModules.length)

  const toggleModule = (module: RiskModuleType) => {
    setIncludedModules((prev) => {
      if (prev.includes(module)) {
        const next = prev.filter((value) => value !== module)
        if (!next.length) return prev
        if (!next.includes(activeModule)) setActiveModule(next[0])
        return next
      }
      return [...prev, module]
    })
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="secondary">Start Risk Review</Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-xl">
        <DrawerHeader>
          <DrawerTitle className="text-gray-50">Start Risk Review</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="space-y-4">
          <p className="text-sm text-gray-400">
            Initialize a scenario for {client.displayName} using profile-based module prefills.
          </p>
          <Input value={scenarioName} onChange={(event) => setScenarioName(event.target.value)} />
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional notes"
            className="block h-24 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-50 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">Included modules</p>
            <div className="space-y-2">
              {(["disability", "life", "unemployment", "liability"] as RiskModuleType[]).map((module) => (
                <label
                  key={module}
                  className="flex items-center justify-between rounded-md border border-gray-800 bg-gray-900/40 px-3 py-2 text-sm text-gray-300"
                >
                  <span>{moduleLabel[module]}</span>
                  <input
                    type="checkbox"
                    checked={includedModules.includes(module)}
                    onChange={() => toggleModule(module)}
                  />
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">Starting module</p>
            <select
              value={activeModule}
              onChange={(event) => setActiveModule(event.target.value as RiskModuleType)}
              className="h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 text-sm text-gray-50 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            >
              {includedModules.map((module) => (
                <option key={module} value={module}>
                  {moduleLabel[module]}
                </option>
              ))}
            </select>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={() => {
              if (!canSubmit) return
              const scenarioId = createScenario({
                clientId: client.id,
                name: scenarioName,
                notes,
                includedModules,
                activeModule,
              })
              if (!scenarioId) return
              setOpen(false)
              navigate(`/scenarios/${scenarioId}/${activeModule}`)
            }}
          >
            Create and Start
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ClientDetailPanel({
  client,
  scenarios,
  onClose,
}: {
  client: ClientRecord
  scenarios: ScenarioRecord[]
  onClose: () => void
}) {
  const moduleRecordsByScenarioId = useAppStore((state) => state.moduleRecordsByScenarioId)
  const firstScenario = scenarios[0]
  const firstHref = firstScenario
    ? `/scenarios/${firstScenario.id}/${firstScenario.activeModule}`
    : undefined

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[#090E1A] shadow-2xl ring-1 ring-gray-800">
        <div className="flex items-start justify-between border-b border-gray-800 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-950 ring-1 ring-blue-900">
              <span className="text-sm font-semibold text-blue-300">
                {client.firstName.charAt(0)}
                {client.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-50">{client.displayName}</h2>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge variant={client.status === "active" ? "success" : "neutral"}>
                  {formatStatus(client.status)}
                </Badge>
                <span className="text-xs text-gray-600">
                  {scenarios.length} scenario{scenarios.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-800 hover:text-gray-200"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-gray-800 px-6 py-5">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Client Profile</p>
            <dl className="space-y-3.5">
              <div className="flex items-center gap-3">
                <RiMailLine className="size-4 shrink-0 text-gray-600" aria-hidden="true" />
                <dd className="text-sm text-gray-300">{client.email || "No email"}</dd>
              </div>
              <div className="flex items-center gap-3">
                <RiPhoneLine className="size-4 shrink-0 text-gray-600" aria-hidden="true" />
                <dd className="text-sm text-gray-300">{client.phone || "No phone"}</dd>
              </div>
              <div className="flex items-center gap-3">
                <RiUser3Line className="size-4 shrink-0 text-gray-600" aria-hidden="true" />
                <dd className="text-sm text-gray-300">
                  Age {client.profile.currentAge ?? "—"} · {formatStatus(client.profileCompletionStatus)}
                </dd>
              </div>
              <div className="flex items-center gap-3">
                <RiCalendarLine className="size-4 shrink-0 text-gray-600" aria-hidden="true" />
                <dd className="text-xs text-gray-500">Updated {toDateLabel(client.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Risk Reviews</p>
              <StartRiskReviewDrawer client={client} />
            </div>
            {scenarios.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-800 px-5 py-10 text-center">
                <RiUserLine className="mx-auto mb-2.5 size-6 text-gray-700" />
                <p className="text-sm font-medium text-gray-500">No scenarios yet</p>
                <p className="mt-1 text-xs text-gray-600">
                  Start a risk review to initialize prefilled module inputs.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {scenarios.map((scenario) => {
                  const Icon = moduleIcon[scenario.activeModule]
                  const href = `/scenarios/${scenario.id}/${scenario.activeModule}`
                  const record = moduleRecordsByScenarioId[scenario.id]
                  const values = [
                    record?.life?.output?.remainingGap ?? 0,
                    record?.disability?.output?.totalUncoveredGap ?? 0,
                    record?.unemployment?.output?.totalUncoveredShortfall ?? 0,
                    record?.liability?.output?.exposureGap ?? 0,
                  ].filter((value) => value > 0)
                  const gap = values.length ? Math.max(...values) : null
                  return (
                    <li key={scenario.id}>
                      <Link
                        to={href}
                        onClick={onClose}
                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-800 px-4 py-3.5 transition hover:border-gray-700 hover:bg-white/2.5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Icon className={cx("size-4 shrink-0", moduleColor[scenario.activeModule])} aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-100">{scenario.name}</p>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className="text-xs text-gray-500">{moduleLabel[scenario.activeModule]}</span>
                              {gap ? (
                                <>
                                  <span className="text-gray-700">·</span>
                                  <span className="text-xs font-semibold text-gray-300">
                                    Largest gap ${Math.round(gap).toLocaleString()}
                                  </span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant={scenarioStatusVariant[scenario.status]}>
                            {formatStatus(scenario.status)}
                          </Badge>
                          <RiArrowRightSLine className="size-4 text-gray-600" />
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 px-6 py-4">
          <div className="flex gap-3">
            {firstHref ? (
              <Button asChild className="flex-1 justify-center">
                <Link to={firstHref} onClick={onClose}>
                  <RiExternalLinkLine className="size-4" aria-hidden="true" />
                  Open Analysis
                </Link>
              </Button>
            ) : (
              <StartRiskReviewDrawer client={client} />
            )}
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export function Dashboard() {
  const clients = useAppStore((state) => state.clients.filter((client) => client.status !== "archived"))
  const scenarios = useAppStore((state) => state.scenarios.filter((scenario) => scenario.status !== "archived"))
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const selectedClient = clients.find((client) => client.id === selectedClientId) ?? null

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return clients
    return clients.filter((client) => {
      return (
        client.displayName.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(query)
      )
    })
  }, [clients, search])

  const scenariosByClientId = useMemo(() => {
    return scenarios.reduce<Record<string, ScenarioRecord[]>>((accumulator, scenario) => {
      if (!accumulator[scenario.clientId]) accumulator[scenario.clientId] = []
      accumulator[scenario.clientId].push(scenario)
      return accumulator
    }, {})
  }, [scenarios])

  const draftClients = clients.filter((client) => client.status === "draft").length
  const activeRiskReviews = scenarios.filter((scenario) => scenario.status !== "archived").length
  const incompleteAnalyses = scenarios.filter(
    (scenario) => scenario.status === "draft" || scenario.status === "inputs_needed",
  ).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-50">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">Real clients, real risk reviews, and saved scenario progress.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AddClientDrawer />
          {clients[0] ? <StartRiskReviewDrawer client={clients[0]} /> : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-widest text-gray-500">Total Clients</p>
          <p className="mt-2 text-2xl font-semibold text-gray-50">{clients.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-gray-500">Draft Clients</p>
          <p className="mt-2 text-2xl font-semibold text-gray-50">{draftClients}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-gray-500">Active Risk Reviews</p>
          <p className="mt-2 text-2xl font-semibold text-gray-50">{activeRiskReviews}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-gray-500">Incomplete Analyses</p>
          <p className="mt-2 text-2xl font-semibold text-gray-50">{incompleteAnalyses}</p>
        </Card>
      </div>

      {clients.length === 0 ? (
        <Card className="border-dashed border-gray-800 px-6 py-16 text-center">
          <RiUserLine className="mx-auto mb-3 size-8 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-100">No clients yet.</h2>
          <p className="mt-2 text-sm text-gray-500">
            Create your first client profile to begin a gap analysis.
          </p>
          <div className="mt-6 flex justify-center">
            <AddClientDrawer />
          </div>
        </Card>
      ) : (
        <>
          <div className="relative max-w-sm">
            <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 w-full rounded-lg border border-gray-700 bg-gray-900 pl-9 pr-4 text-sm text-gray-100 placeholder-gray-600 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-gray-800 px-6 py-3">
              {(["Client", "Scenarios", "Updated", "Status", ""] as const).map((heading, index) => (
                <span
                  key={heading}
                  className={cx(
                    "text-[10px] font-semibold uppercase tracking-widest text-gray-600",
                    index === 1 && "hidden sm:block",
                  )}
                >
                  {heading}
                </span>
              ))}
            </div>

            {filteredClients.length === 0 ? (
              <div className="space-y-4 px-6 py-16 text-center">
                <RiUserLine className="mx-auto size-8 text-gray-700" />
                <div>
                  <p className="text-sm text-gray-400">No clients match your search.</p>
                  <p className="text-xs text-gray-600">Create a client or clear the search query.</p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-800/60">
                {filteredClients.map((client) => {
                  const clientScenarios = scenariosByClientId[client.id] ?? []
                  return (
                    <li key={client.id}>
                      <button
                        onClick={() => setSelectedClientId(client.id)}
                        className="grid w-full grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-6 py-4 text-left transition hover:bg-white/2.5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-800 ring-1 ring-gray-700">
                            <span className="text-xs font-semibold text-gray-300">
                              {client.firstName.charAt(0)}
                              {client.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-100">{client.displayName}</p>
                            <p className="truncate text-xs text-gray-500">
                              {client.email || "No email on file"}
                            </p>
                          </div>
                        </div>
                        <span className="hidden whitespace-nowrap text-sm text-gray-400 sm:block">
                          {clientScenarios.length}{" "}
                          <span className="text-gray-600">
                            scenario{clientScenarios.length !== 1 ? "s" : ""}
                          </span>
                        </span>
                        <span className="whitespace-nowrap text-xs text-gray-500">{toDateLabel(client.updatedAt)}</span>
                        <Badge variant={client.status === "active" ? "success" : "neutral"}>
                          {formatStatus(client.status)}
                        </Badge>
                        <RiArrowRightSLine className="size-4 shrink-0 text-gray-600" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </>
      )}

      {selectedClient ? (
        <ClientDetailPanel
          client={selectedClient}
          scenarios={scenariosByClientId[selectedClient.id] ?? []}
          onClose={() => setSelectedClientId(null)}
        />
      ) : null}
    </div>
  )
}
