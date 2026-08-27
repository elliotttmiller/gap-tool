import * as React from "react"
import { ShieldAlert } from "lucide-react"

export function DisclaimerBlock() {
  return (
    <div
      className="disclaimer-block flex items-start gap-3 rounded-md border border-[#4f4f54]/20 bg-white p-4 text-sm text-[#4f4f54]/72 dark:border-white/15 dark:bg-white/8 dark:text-white/65"
      data-disclosure="true"
    >
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-brand-500 dark:text-brand-400" />
      <div className="space-y-1">
        <p className="font-semibold text-[#4f4f54] dark:text-white">For illustrative planning purposes only.</p>
        <p>
          This model is not a guarantee, financial plan, insurance recommendation, legal advice, tax advice, or underwriting determination. Actual needs may vary based on individual circumstances, policy terms, carrier rules, taxation, inflation, market conditions, and advisor review.
        </p>
      </div>
    </div>
  )
}
