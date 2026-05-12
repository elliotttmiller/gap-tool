import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { cx } from "@/lib/utils"
import {
  RiAddLine,
  RiArrowRightSLine,
  RiCalendarLine,
  RiCloseLine,
  RiExternalLinkLine,
  RiHeartPulseLine,
  RiMailLine,
  RiPhoneLine,
  RiScalesLine,
  RiSearchLine,
  RiShieldCheckLine,
  RiUmbrellaLine,
  RiUser3Line,
  RiUserLine,
} from "@remixicon/react"
import React, { useState } from "react"
import { Link } from "react-router-dom"

type ScenarioStatus =
  | "Draft"
  | "Inputs Needed"
  | "Calculated"
  | "Ready for Review"
  | "Presented"
  | "Report Generated"

type ClientStatus = "Active" | "Draft" | "Pending"

interface Scenario {
  id: string
  name: string
  module: "Disability" | "Life Insurance" | "Unemployment" | "Liability"
  gap: string
  status: ScenarioStatus
  lastUpdated: string
}

interface Client {
  id: string
  name: string
  initials: string
  email: string
  phone: string
  age: number
  household: string
  status: ClientStatus
  lastUpdated: string
  scenarios: Scenario[]
}

const clients: Client[] = [
  {
    id: "1",
    name: "Elliott Miller",
    initials: "EM",
    email: "elliott@example.com",
    phone: "(415) 555-0192",
    age: 42,
    household: "Married, 2 dependents",
    status: "Active",
    lastUpdated: "Today",
    scenarios: [
      { id: "s1", name: "Miller Household Risk Review", module: "Disability", gap: "$8,150/mo", status: "Calculated", lastUpdated: "Today" },
      { id: "s2", name: "Life Insurance Review", module: "Life Insurance", gap: "$5,200/mo", status: "Ready for Review", lastUpdated: "May 10" },
      { id: "s3", name: "Liability Exposure", module: "Liability", gap: "—", status: "Draft", lastUpdated: "May 8" },
    ],
  },
  {
    id: "2",
    name: "Sarah Davis",
    initials: "SD",
    email: "sarah@example.com",
    phone: "(310) 555-0847",
    age: 38,
    household: "Single",
    status: "Active",
    lastUpdated: "Yesterday",
    scenarios: [
      { id: "s4", name: "Davis Protection Update", module: "Life Insurance", gap: "$5,400/mo", status: "Inputs Needed", lastUpdated: "Yesterday" },
    ],
  },
  {
    id: "3",
    name: "Robert Chen",
    initials: "RC",
    email: "robert@example.com",
    phone: "(212) 555-0365",
    age: 55,
    household: "Married, no dependents",
    status: "Active",
    lastUpdated: "May 10",
    scenarios: [
      { id: "s5", name: "Chen Retirement Income", module: "Disability", gap: "$3,100/mo", status: "Ready for Review", lastUpdated: "May 10" },
      { id: "s6", name: "Unemployment Reserve", module: "Unemployment", gap: "$2,200/mo", status: "Calculated", lastUpdated: "May 9" },
    ],
  },
  {
    id: "4",
    name: "Maria Lopez",
    initials: "ML",
    email: "maria@example.com",
    phone: "(713) 555-0529",
    age: 47,
    household: "Married, 3 dependents",
    status: "Draft",
    lastUpdated: "May 8",
    scenarios: [
      { id: "s7", name: "Lopez Family Review", module: "Liability", gap: "—", status: "Draft", lastUpdated: "May 8" },
    ],
  },
  {
    id: "5",
    name: "James Nguyen",
    initials: "JN",
    email: "james@example.com",
    phone: "(617) 555-0731",
    age: 34,
    household: "Single",
    status: "Pending",
    lastUpdated: "May 6",
    scenarios: [],
  },
]

const clientStatusVariant: Record<ClientStatus, "success" | "neutral" | "warning"> = {
  Active: "success",
  Draft: "neutral",
  Pending: "warning",
}

const scenarioStatusVariant: Record<ScenarioStatus, "success" | "warning" | "default" | "neutral" | "error"> = {
  Draft: "neutral",
  "Inputs Needed": "warning",
  Calculated: "success",
  "Ready for Review": "default",
  Presented: "success",
  "Report Generated": "success",
}

const moduleIcon: Record<Scenario["module"], React.ElementType> = {
  Disability: RiUmbrellaLine,
  "Life Insurance": RiHeartPulseLine,
  Unemployment: RiShieldCheckLine,
  Liability: RiScalesLine,
}

const moduleColor: Record<Scenario["module"], string> = {
  Disability: "text-blue-400",
  "Life Insurance": "text-emerald-400",
  Unemployment: "text-indigo-400",
  Liability: "text-orange-400",
}

const moduleSlug: Record<Scenario["module"], string> = {
  Disability: "disability",
  "Life Insurance": "life",
  Unemployment: "unemployment",
  Liability: "liability",
}

function ClientDetailPanel({ client, onClose }: { client: Client; onClose: () => void }) {
  const firstHref = client.scenarios[0]
    ? `/scenarios/${client.id}/${moduleSlug[client.scenarios[0].module]}`
    : `/scenarios/${client.id}/disability`

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[#090E1A] shadow-2xl ring-1 ring-gray-800">
        <div className="flex items-start justify-between border-b border-gray-800 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-950 ring-1 ring-blue-900">
              <span className="text-sm font-semibold text-blue-300">{client.initials}</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-50">{client.name}</h2>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge variant={clientStatusVariant[client.status]}>{client.status}</Badge>
                <span className="text-xs text-gray-600">{client.scenarios.length} scenario{client.scenarios.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-800 hover:text-gray-200" aria-label="Close">
            <RiCloseLine className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-gray-800 px-6 py-5">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Client Profile</p>
            <dl className="space-y-3.5">
              <div className="flex items-center gap-3">
                <RiMailLine className="size-4 shrink-0 text-gray-600" aria-hidden="true" />
                <dd className="text-sm text-gray-300">{client.email}</dd>
              </div>
              <div className="flex items-center gap-3">
                <RiPhoneLine className="size-4 shrink-0 text-gray-600" aria-hidden="true" />
                <dd className="text-sm text-gray-300">{client.phone}</dd>
              </div>
              <div className="flex items-center gap-3">
                <RiUser3Line className="size-4 shrink-0 text-gray-600" aria-hidden="true" />
                <dd className="text-sm text-gray-300">Age {client.age} · {client.household}</dd>
              </div>
              <div className="flex items-center gap-3">
                <RiCalendarLine className="size-4 shrink-0 text-gray-600" aria-hidden="true" />
                <dd className="text-xs text-gray-500">Last updated {client.lastUpdated}</dd>
              </div>
            </dl>
          </div>

          <div className="px-6 py-5">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Risk Scenarios</p>
            {client.scenarios.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-800 px-5 py-10 text-center">
                <RiUserLine className="mx-auto mb-2.5 size-6 text-gray-700" />
                <p className="text-sm font-medium text-gray-500">No scenarios yet</p>
                <p className="mt-1 text-xs text-gray-600">Open the analysis workspace to begin modeling.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {client.scenarios.map((scenario) => {
                  const Icon = moduleIcon[scenario.module]
                  const href = `/scenarios/${client.id}/${moduleSlug[scenario.module]}`
                  return (
                    <li key={scenario.id}>
                      <Link to={href} onClick={onClose} className="flex items-center justify-between gap-3 rounded-xl border border-gray-800 px-4 py-3.5 transition hover:border-gray-700 hover:bg-white/2.5">
                        <div className="flex min-w-0 items-center gap-3">
                          <Icon className={cx("size-4 shrink-0", moduleColor[scenario.module])} aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-100">{scenario.name}</p>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className="text-xs text-gray-500">{scenario.module}</span>
                              {scenario.gap !== "—" && (
                                <>
                                  <span className="text-gray-700">·</span>
                                  <span className="text-xs font-semibold text-gray-300">{scenario.gap}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant={scenarioStatusVariant[scenario.status]}>{scenario.status}</Badge>
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
            <Button asChild className="flex-1 justify-center">
              <Link to={firstHref} onClick={onClose}>
                <RiExternalLinkLine className="size-4" aria-hidden="true" />
                Open Analysis
              </Link>
            </Button>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
          <p className="mt-3 text-center text-[10px] leading-relaxed text-gray-700">
            Outputs are illustrative planning scenarios only — not financial or insurance advice.
          </p>
        </div>
      </div>
    </>
  )
}

export function Dashboard() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [search, setSearch] = useState("")

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-50">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">Client roster and risk analysis workspace.</p>
        </div>
        <Button>
          <RiAddLine className="size-4" aria-hidden="true" />
          Add Client
        </Button>
      </div>

      <div className="relative max-w-sm">
        <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-gray-700 bg-gray-900 pl-9 pr-4 text-sm text-gray-100 placeholder-gray-600 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-gray-800 px-6 py-3">
          {(["Client", "Scenarios", "Last Updated", "Status", ""] as const).map((h, i) => (
            <span key={i} className={cx("text-[10px] font-semibold uppercase tracking-widest text-gray-600", i === 1 && "hidden sm:block")}>
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <RiUserLine className="mx-auto mb-3 size-8 text-gray-700" />
            <p className="text-sm text-gray-500">No clients match your search.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-800/60">
            {filtered.map((client) => (
              <li key={client.id}>
                <button
                  onClick={() => setSelectedClient(client)}
                  className="grid w-full grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-6 py-4 text-left transition hover:bg-white/2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-800 ring-1 ring-gray-700">
                      <span className="text-xs font-semibold text-gray-300">{client.initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-100">{client.name}</p>
                      <p className="truncate text-xs text-gray-500">{client.email}</p>
                    </div>
                  </div>
                  <span className="hidden whitespace-nowrap text-sm text-gray-400 sm:block">
                    {client.scenarios.length} <span className="text-gray-600">scenario{client.scenarios.length !== 1 ? "s" : ""}</span>
                  </span>
                  <span className="whitespace-nowrap text-xs text-gray-500">{client.lastUpdated}</span>
                  <Badge variant={clientStatusVariant[client.status]}>{client.status}</Badge>
                  <RiArrowRightSLine className="size-4 shrink-0 text-gray-600" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-gray-800 px-6 py-3">
          <p className="text-xs text-gray-600">
            {filtered.length} of {clients.length} clients — <span className="text-gray-700">click any row to view profile and scenarios</span>
          </p>
        </div>
      </Card>

      {selectedClient && (
        <ClientDetailPanel client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
    </div>
  )
}
