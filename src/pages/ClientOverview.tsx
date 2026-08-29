import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { ThemedSelect } from "@/components/ThemedSelect"
import type { DiBenefitPeriod } from "@/features/risk-modules/disability/types"
import { ClientFormState, formFromClient, formToPayload, isClientFormValid } from "@/lib/clientFormSchema"
import { useAppStore } from "@/lib/store"
import { cx } from "@/lib/utils"
import { RiArrowLeftLine, RiSave3Line } from "@remixicon/react"
import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"

const BENEFIT_PERIOD_OPTIONS: { value: DiBenefitPeriod | ""; label: string }[] = [
  { value: "", label: "Select a period…" },
  { value: "2y", label: "2 Years" },
  { value: "5y", label: "5 Years" },
  { value: "10y", label: "10 Years" },
  { value: "A65", label: "To Age 65" },
  { value: "A67", label: "To Age 67" },
  { value: "A70", label: "To Age 70" },
]

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-[#d5e2e5] pb-3 dark:border-gray-800">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-[#0e9f9a] dark:text-cyan-500">{title}</h2>
      {description ? <p className="mt-1 text-sm text-[#607583] dark:text-gray-500">{description}</p> : null}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-medium text-[#29495b] dark:text-gray-300">{label}</span>
      {children}
    </label>
  )
}

function EarnerPanel({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-[#d5e2e5] bg-[#f8fbfb] p-5 shadow-[0_4px_14px_rgba(16,42,58,0.06)] dark:border-gray-800 dark:bg-gray-950/35 dark:shadow-none">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#102a3a] dark:text-gray-100">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-[#607583] dark:text-gray-500">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

const LIGHT_PANEL_CLASS = "rounded-xl border border-[#d5e2e5] bg-[#f8fbfb] p-5 shadow-[0_4px_14px_rgba(16,42,58,0.06)] dark:border-gray-800 dark:bg-gray-950/25 dark:shadow-none"

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
      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-gray-800 bg-[#090E1A] px-5 py-6 sm:px-8 lg:flex-row lg:gap-8">
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

      <Card className="space-y-8 border-[#d5e2e5] bg-white p-8 shadow-[0_14px_34px_rgba(13,27,42,0.08)] dark:border-gray-800 dark:bg-[#111821] dark:shadow-sm">
        <div className="space-y-4">
          <SectionTitle title="Client Type" />
          <div className="grid grid-cols-2 gap-3">
            {(["individual", "couple"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setField("clientType", type)}
                className={cx(
                  "rounded-xl border px-5 py-3 text-sm font-semibold capitalize transition",
                  form.clientType === type ? "border-[#188a89] bg-[#188a89] text-white shadow-sm" : "border-[#cbdadd] bg-[#f8fbfb] text-[#415b6d] hover:border-[#188a89] hover:bg-[#eaf7f6] hover:text-[#188a89] dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-400 dark:hover:border-[#188a89] dark:hover:bg-[#188a89]/15 dark:hover:text-white",
                )}
              >
                {type === "individual" ? "Individual" : "Couple"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <SectionTitle
            title={isCouple ? "Household Earners" : "Primary Earner"}
            description={isCouple ? "Keep both earners together so income, assets, and Life coverage can be reviewed consistently across the household." : "Primary client information used across the advisor risk modules."}
          />
          <div className={cx("grid gap-4", isCouple && "xl:grid-cols-2")}>
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
        </div>

        <div className="space-y-4">
          <SectionTitle title="Household Planning" description="Shared household values used to prefill projection, liquidity, and liability assumptions." />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="Household / display name"><Input value={form.displayName} onChange={(event) => setField("displayName", event.target.value)} /></Field>
            <Field label="Projection end age *"><Input type="number" min={18} max={100} value={form.expectedRetirementAge} onChange={(event) => setField("expectedRetirementAge", event.target.value)} /></Field>
            <Field label="Monthly household expenses ($)"><Input type="number" min={0} groupThousands value={form.monthlyExpenses} onChange={(event) => setField("monthlyExpenses", event.target.value)} /></Field>
            <Field label="Emergency savings ($)"><Input type="number" min={0} groupThousands value={form.emergencySavings} onChange={(event) => setField("emergencySavings", event.target.value)} /></Field>
            <Field label="Home equity ($)"><Input type="number" min={0} groupThousands value={form.homeEquity} onChange={(event) => setField("homeEquity", event.target.value)} /></Field>
          </div>
        </div>

        <div className="space-y-4">
          <SectionTitle title="Primary Earner Disability Coverage" description="Disability coverage is modeled for the primary earner and prefills the Disability module when a risk review is generated or refreshed." />
          <div className={LIGHT_PANEL_CLASS}>
            <h3 className="mb-4 text-sm font-semibold text-[#102a3a] dark:text-gray-100">Group Long Term Disability (LTD)</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Field label="Coverage of Income (%)"><Input type="number" min={0} max={100} step={1} value={form.ltdCoveragePercent} onChange={(event) => setField("ltdCoveragePercent", event.target.value)} /></Field>
              <Field label="Monthly Cap ($)"><Input type="number" min={0} groupThousands value={form.ltdMonthlyCap} onChange={(event) => setField("ltdMonthlyCap", event.target.value)} /></Field>
              <Field label="Taxable?"><ThemedSelect value={form.ltdTaxable ? "true" : "false"} onValueChange={(value) => setField("ltdTaxable", value === "true")} options={[{ value: "true", label: "Yes - 70% of gross" }, { value: "false", label: "No - full benefit" }]} /></Field>
            </div>
          </div>

          <div className={LIGHT_PANEL_CLASS}>
            <h3 className="mb-4 text-sm font-semibold text-[#102a3a] dark:text-gray-100">Individual Disability Insurance</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <Field label="Monthly Benefit ($)"><Input type="number" min={0} groupThousands value={form.privateDisabilityBenefitMonthly} onChange={(event) => setField("privateDisabilityBenefitMonthly", event.target.value)} /></Field>
              <Field label="Monthly Premium ($)"><Input type="number" min={0} groupThousands value={form.privateDisabilityMonthlyPremium} onChange={(event) => setField("privateDisabilityMonthlyPremium", event.target.value)} /></Field>
              <Field label="Benefit Period"><ThemedSelect value={form.privateDisabilityBenefitPeriod} onValueChange={(value) => setField("privateDisabilityBenefitPeriod", value as DiBenefitPeriod | "")} options={BENEFIT_PERIOD_OPTIONS} /></Field>
              <Field label="Break-Even Rate of Return (%)"><Input type="number" min={0} max={30} step={0.1} value={form.disabilityBreakEvenRateOfReturn} onChange={(event) => setField("disabilityBreakEvenRateOfReturn", event.target.value)} /></Field>
              <Field label="Months Without Income"><Input type="number" min={1} step={1} value={form.disabilityBreakEvenMonthsWithoutIncome} onChange={(event) => setField("disabilityBreakEvenMonthsWithoutIncome", event.target.value)} /></Field>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SectionTitle title="Household Liability Coverage" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Field label="Underlying Auto Liability Limit ($)"><Input type="number" min={0} groupThousands value={form.autoLiabilityLimit} onChange={(event) => setField("autoLiabilityLimit", event.target.value)} /></Field>
            <Field label="Existing Umbrella Coverage ($)"><Input type="number" min={0} step={1_000_000} groupThousands value={form.umbrellaCoverage} onChange={(event) => setField("umbrellaCoverage", event.target.value)} /></Field>
          </div>
        </div>
      </Card>
    </div>
  )
}
