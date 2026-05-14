import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { useAppStore } from "@/lib/store"
import { cx } from "@/lib/utils"
import { ClientFormState, formFromClient, formToPayload, isClientFormValid } from "@/lib/clientFormSchema"
import { RiArrowLeftLine, RiSave3Line } from "@remixicon/react"
import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-gray-800 pb-3">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-cyan-500">{title}</h2>
      {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      {children}
    </label>
  )
}

export function ClientOverview() {
  const { clientId } = useParams()
  const client = useAppStore((state) => state.clients.find((item) => item.id === clientId))
  const scenarios = useAppStore((state) => state.scenarios)
  const updateClient = useAppStore((state) => state.updateClient)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [form, setForm] = useState<ClientFormState | null>(() => client ? formFromClient(client) : null)

  const scenarioCount = useMemo(() => scenarios.filter((scenario) => scenario.clientId === clientId && scenario.status !== "archived").length, [clientId, scenarios])

  if (!client || !form || client.status === "archived") {
    return (
      <div className="rounded-2xl border border-dashed border-gray-800 p-10 text-center">
        <p className="text-lg font-semibold text-gray-100">Client not found</p>
        <p className="mt-1 text-sm text-gray-500">Return to Dashboard and select an active client.</p>
        <Button asChild className="mt-6"><Link to="/">Back to Dashboard</Link></Button>
      </div>
    )
  }

  const isCouple = form.clientType === "couple"
  const canSave = isClientFormValid(form)

  function setField<K extends keyof ClientFormState>(field: K, value: ClientFormState[K]) {
    setForm((current) => current ? { ...current, [field]: value } : current)
    setSavedAt(null)
  }

  function saveChanges() {
    if (!clientId || !canSave) return
    updateClient(clientId, formToPayload(form))
    setSavedAt(new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-8 rounded-2xl border border-gray-800 bg-[#090E1A] px-8 py-6">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-200">
            <RiArrowLeftLine className="size-4" />
            Dashboard
          </Link>
          <h1 className="mt-4 text-3xl font-semibold text-gray-50">{client.displayName} Overview</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400">
            View and edit the client setup details used to generate risk reviews. Saving changes updates the client profile, resets existing scenario outputs, and re-prefills scenario module inputs from the revised profile.
          </p>
          <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
            <span>{isCouple ? "Couple" : "Individual"}</span>
            <span>·</span>
            <span>{scenarioCount} active risk review{scenarioCount === 1 ? "" : "s"}</span>
            <span>·</span>
            <span>Status: {client.profileCompletionStatus.replaceAll("_", " ")}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {savedAt ? <span className="text-sm text-emerald-400">Saved {savedAt}</span> : null}
          <Button disabled={!canSave} onClick={saveChanges}>
            <RiSave3Line className="size-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Card className="space-y-8 p-8">
        <div className="space-y-4">
          <SectionTitle title="Client Type" description="Matches the advisor reference workflow." />
          <div className="grid grid-cols-2 gap-3">
            {(["individual", "couple"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setField("clientType", type)}
                className={cx(
                  "rounded-xl border px-5 py-3 text-sm font-semibold capitalize transition",
                  form.clientType === type ? "border-cyan-500 bg-cyan-500/15 text-white" : "border-gray-700 bg-gray-900/60 text-gray-400 hover:text-gray-200",
                )}
              >
                {type === "individual" ? "Individual" : "Couple"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <SectionTitle title="Primary Earner" />
          <div className="grid grid-cols-4 gap-4">
            <Field label="First name *"><Input value={form.firstName} onChange={(event) => setField("firstName", event.target.value)} /></Field>
            <Field label="Last name *"><Input value={form.lastName} onChange={(event) => setField("lastName", event.target.value)} /></Field>
            <Field label="Household / display name"><Input value={form.displayName} onChange={(event) => setField("displayName", event.target.value)} /></Field>
            <Field label="Current age *"><Input type="number" min={18} max={64} value={form.age} onChange={(event) => setField("age", event.target.value)} /></Field>
            <Field label="Annual income ($) *"><Input type="number" min={0} value={form.annualIncome} onChange={(event) => setField("annualIncome", event.target.value)} /></Field>
            <Field label="Monthly expenses ($)"><Input type="number" min={0} value={form.monthlyExpenses} onChange={(event) => setField("monthlyExpenses", event.target.value)} /></Field>
            <Field label="Email"><Input value={form.email} onChange={(event) => setField("email", event.target.value)} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(event) => setField("phone", event.target.value)} /></Field>
          </div>
        </div>

        <div className="space-y-4">
          <SectionTitle title="Existing Coverage — Primary Earner" />
          <div className="grid grid-cols-5 gap-4">
            <Field label="Group Life death benefit ($)"><Input type="number" min={0} value={form.groupLifeCoverage} onChange={(event) => setField("groupLifeCoverage", event.target.value)} /></Field>
            <Field label="Private Life death benefit ($)"><Input type="number" min={0} value={form.privateLifeCoverage} onChange={(event) => setField("privateLifeCoverage", event.target.value)} /></Field>
            <Field label="Policy Type"><select value={form.privateLifePolicyType} onChange={(event) => setField("privateLifePolicyType", event.target.value as "term" | "permanent")} className="h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 text-sm text-gray-50"><option value="term">Term</option><option value="permanent">Permanent</option></select></Field>
            <Field label="Term Length">{form.privateLifePolicyType === "term" ? <Input type="number" min={0} value={form.privateLifeTermYears} onChange={(event) => setField("privateLifeTermYears", event.target.value)} /> : <Input value="Permanent" disabled />}</Field>
            <Field label="Non-qualified assets ($)"><Input type="number" min={0} value={form.nonQualifiedAssets} onChange={(event) => setField("nonQualifiedAssets", event.target.value)} /></Field>
          </div>
        </div>

        {isCouple ? (
          <div className="space-y-4">
            <SectionTitle title="Secondary Earner" description="Shown only when the client type is Couple." />
            <div className="grid grid-cols-4 gap-4">
              <Field label="Full name"><Input value={form.spouseName} onChange={(event) => setField("spouseName", event.target.value)} /></Field>
              <Field label="Current age"><Input type="number" min={18} max={64} value={form.spouseAge} onChange={(event) => setField("spouseAge", event.target.value)} /></Field>
              <Field label="Annual income ($)"><Input type="number" min={0} value={form.spouseAnnualIncome} onChange={(event) => setField("spouseAnnualIncome", event.target.value)} /></Field>
              <Field label="Non-qualified assets ($)"><Input type="number" min={0} value={form.spouseNonQualifiedAssets} onChange={(event) => setField("spouseNonQualifiedAssets", event.target.value)} /></Field>
              <Field label="Group Life death benefit ($)"><Input type="number" min={0} value={form.spouseGroupLifeCoverage} onChange={(event) => setField("spouseGroupLifeCoverage", event.target.value)} /></Field>
              <Field label="Private Life death benefit ($)"><Input type="number" min={0} value={form.spousePrivateLifeCoverage} onChange={(event) => setField("spousePrivateLifeCoverage", event.target.value)} /></Field>
              <Field label="Policy Type"><select value={form.spousePrivateLifePolicyType} onChange={(event) => setField("spousePrivateLifePolicyType", event.target.value as "term" | "permanent")} className="h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 text-sm text-gray-50"><option value="term">Term</option><option value="permanent">Permanent</option></select></Field>
              <Field label="Term Length">{form.spousePrivateLifePolicyType === "term" ? <Input type="number" min={0} value={form.spousePrivateLifeTermYears} onChange={(event) => setField("spousePrivateLifeTermYears", event.target.value)} /> : <Input value="Permanent" disabled />}</Field>
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          <SectionTitle title="Household Liability Coverage" />
          <div className="grid grid-cols-4 gap-4">
            <Field label="Underlying Auto Liability Limit ($)"><Input type="number" min={0} value={form.autoLiabilityLimit} onChange={(event) => setField("autoLiabilityLimit", event.target.value)} /></Field>
          </div>
        </div>
      </Card>
    </div>
  )
}
