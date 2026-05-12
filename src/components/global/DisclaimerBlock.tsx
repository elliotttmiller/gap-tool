import * as React from "react"
import { ShieldAlert } from "lucide-react"

export function DisclaimerBlock() {
  return (
    <div className="flex items-start gap-3 rounded-md bg-slate-50 p-4 text-sm text-slate-600 border border-slate-200">
      <ShieldAlert className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-semibold text-slate-700">For illustrative planning purposes only.</p>
        <p>
          This model is not a guarantee, financial plan, insurance recommendation, legal advice, tax advice, or underwriting determination. Actual needs may vary based on individual circumstances, policy terms, carrier rules, taxation, inflation, market conditions, and advisor review.
        </p>
      </div>
    </div>
  )
}
