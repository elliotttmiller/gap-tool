import { Card } from "@/components/Card"
import { cx } from "@/lib/utils"
import {
  RiFileTextLine,
  RiHeartPulseLine,
  RiLockLine,
  RiScalesLine,
  RiShieldCheckLine,
  RiUmbrellaLine,
} from "@remixicon/react"

// ─── Static default assumption sets (will connect to store/API) ──────────────

const moduleSets = [
  {
    module: "Disability Insurance",
    icon: RiUmbrellaLine,
    color: "text-blue-400",
    borderColor: "border-blue-900/40",
    version: "v1.0.0",
    lastUpdated: "May 12, 2026",
    assumptions: [
      { label: "Income replacement ratio", value: "60%", editable: true, description: "Percentage of pre-disability earned income targeted for replacement." },
      { label: "Modeled disability duration", value: "36 months", editable: true, description: "Total number of months modeled for income disruption scenario." },
      { label: "Effective tax rate", value: "28%", editable: true, description: "Estimated marginal effective tax rate applied to taxable benefit streams." },
      { label: "Employer STD waiting period", value: "14 days", editable: true, description: "Days before short-term disability benefits begin." },
      { label: "SSDI inclusion", value: "Excluded", editable: true, description: "Whether Social Security Disability income is included as an offset. Must be advisor-entered; not predicted." },
      { label: "Expense inflation rate", value: "0% (flat)", editable: true, description: "Annual rate applied to monthly expenses over the modeled period." },
    ],
  },
  {
    module: "Life Insurance",
    icon: RiHeartPulseLine,
    color: "text-emerald-400",
    borderColor: "border-emerald-900/30",
    version: "v1.0.0",
    lastUpdated: "May 12, 2026",
    assumptions: [
      { label: "Income replacement ratio", value: "75%", editable: true, description: "Percentage of annual income to be replaced for the survivor household." },
      { label: "Income replacement years", value: "20 years", editable: true, description: "Number of years of income replacement modeled." },
      { label: "Discount rate", value: "0% (nominal)", editable: true, description: "Rate used to discount future income replacement need to present value." },
      { label: "Inflation rate", value: "0% (nominal)", editable: true, description: "Annual income growth or inflation assumption." },
      { label: "Liquid asset offset", value: "Included", editable: true, description: "Whether advisor-specified liquid assets reduce the modeled protection gap." },
      { label: "Final expense estimate", value: "$15,000", editable: true, description: "Flat estimate for final expenses included in capital needs calculation." },
    ],
  },
  {
    module: "Unemployment",
    icon: RiShieldCheckLine,
    color: "text-indigo-400",
    borderColor: "border-indigo-900/30",
    version: "v1.0.0",
    lastUpdated: "May 12, 2026",
    assumptions: [
      { label: "Modeled unemployment duration", value: "6 months", editable: true, description: "Total months of income disruption modeled for the scenario." },
      { label: "State UI benefit inclusion", value: "Included", editable: true, description: "Whether state unemployment insurance benefits are included as an offset." },
      { label: "Spouse income offset", value: "Included", editable: true, description: "Whether spouse/partner income is included as an available resource." },
      { label: "Reserve drawdown priority", value: "Emergency savings first", editable: false, description: "Order in which reserves are drawn down during the modeled period." },
    ],
  },
  {
    module: "Liability / Lawsuit",
    icon: RiScalesLine,
    color: "text-orange-400",
    borderColor: "border-orange-900/30",
    version: "v1.0.0",
    lastUpdated: "May 12, 2026",
    assumptions: [
      { label: "Existing liability coverage", value: "Advisor-entered", editable: true, description: "Current liability coverage limits entered by the advisor for this client." },
      { label: "Asset exposure scope", value: "Liquid assets only", editable: true, description: "Which asset categories are included in the modeled exposure estimate." },
      { label: "Umbrella policy inclusion", value: "Included if entered", editable: true, description: "Whether a personal umbrella policy is counted as an offset when entered." },
    ],
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AssumptionsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-50">Assumptions & Model Governance</h1>
        <p className="text-sm text-gray-400">
          Default modeling assumptions used across all NorthStar risk modules. These values are
          applied to new scenarios unless the advisor specifies scenario-level overrides.
        </p>
      </div>

      {/* Governance notice */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-900/40 bg-blue-950/20 px-5 py-4">
        <RiFileTextLine className="mt-0.5 size-4 shrink-0 text-blue-400" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-300">Formula versioning active</p>
          <p className="text-xs text-gray-400">
            All NorthStar calculations are deterministic and version-controlled. Every calculation run
            records the formula version, input snapshot, and assumption snapshot used. Historical
            scenarios remain reproducible even after assumptions or formulas are updated.
          </p>
        </div>
      </div>

      {/* Per-module assumption cards */}
      <div className="space-y-6">
        {moduleSets.map((mod) => (
          <Card key={mod.module} className={cx("overflow-hidden p-0 border", mod.borderColor)}>
            {/* Module header */}
            <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <mod.icon className={cx("size-5 shrink-0", mod.color)} aria-hidden="true" />
                <div>
                  <h2 className="text-sm font-semibold text-gray-100">{mod.module}</h2>
                  <p className="text-xs text-gray-500">Formula {mod.version} · Updated {mod.lastUpdated}</p>
                </div>
              </div>
            </div>

            {/* Assumption rows */}
            <div className="divide-y divide-gray-800/50">
              {mod.assumptions.map((a) => (
                <div key={a.label} className="grid grid-cols-[1fr_auto_auto] items-start gap-4 px-6 py-3.5 sm:grid-cols-[1fr_auto_auto]">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-200">{a.label}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{a.description}</p>
                  </div>
                  <span className="whitespace-nowrap rounded-md bg-gray-800 px-2.5 py-1 text-sm font-semibold text-gray-100">
                    {a.value}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    {a.editable ? (
                      <span className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-400">Editable</span>
                    ) : (
                      <span className="flex items-center gap-1 rounded bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-600">
                        <RiLockLine className="size-3" aria-hidden="true" />
                        Locked
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Compliance footer */}
      <div className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-900/40 px-5 py-4">
        <RiFileTextLine className="mt-0.5 size-4 shrink-0 text-gray-600" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-gray-600">
          <span className="font-semibold text-gray-500">Assumption governance.</span>{" "}
          All assumption values shown here are system defaults used for illustrative scenario modeling only.
          They do not represent guaranteed results, tax advice, legal advice, underwriting determinations, or
          product recommendations. Advisors should review and adjust assumptions for each client scenario
          based on professional judgment and client-specific context.
        </p>
      </div>
    </div>
  )
}
