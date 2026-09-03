import type { ClientRecord } from "@/lib/store-types"
import "@/styles/print-runtime.css"

type ReportCoverPageProps = {
  client: ClientRecord
  reportDate: Date
}

function resolveHouseholdName(client: ClientRecord) {
  const lastName = client.lastName?.trim()
  if (lastName) return `${lastName} Household`

  const displayName = client.displayName?.trim()
  if (displayName) return `${displayName} Household`

  return "Household"
}

function resolveClientNames(client: ClientRecord) {
  const primaryName = client.profile.primaryIncomeEarnerName?.trim()
    || [client.firstName, client.lastName].filter(Boolean).join(" ").trim()
    || client.displayName?.trim()
    || "Client"
  const spouseName = client.profile.spouseIncomeEarnerName?.trim()

  return spouseName ? `${primaryName} & ${spouseName}` : primaryName
}

export function ReportCoverPage({ client, reportDate }: ReportCoverPageProps) {
  const householdName = resolveHouseholdName(client)
  const clientNames = resolveClientNames(client)
  const formattedReportDate = reportDate.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const markUrl = `${import.meta.env.BASE_URL}favicon.svg`

  return (
    <section className="report-cover-page" aria-label="Risk Review Report cover page">
      <div className="report-cover-brand">
        <img
          src={`${import.meta.env.BASE_URL}northstar-logo.svg`}
          alt="North Star Resource Group"
          className="report-cover-logo"
        />
      </div>

      <div className="report-cover-watermark" aria-hidden="true">
        <svg
          className="report-cover-watermark-mark"
          viewBox="0 0 1254 1254"
          preserveAspectRatio="xMidYMid meet"
          focusable="false"
        >
          <defs>
            <filter id="report-cover-solid-grey" colorInterpolationFilters="sRGB">
              <feColorMatrix
                type="matrix"
                values="
                  0 0 0 0 0.454902
                  0 0 0 0 0.482353
                  0 0 0 0 0.521569
                  0 0 0 1 0
                "
              />
            </filter>
          </defs>
          <image
            href={markUrl}
            x="0"
            y="0"
            width="1254"
            height="1254"
            preserveAspectRatio="xMidYMid meet"
            filter="url(#report-cover-solid-grey)"
          />
        </svg>
      </div>

      <div className="report-cover-content">
        <h1>Risk Review Report</h1>
        <p className="report-cover-household">{householdName}</p>

        <div className="report-cover-details">
          <div className="report-cover-detail-row">
            <div>
              <p className="report-cover-detail-label">Client</p>
              <p className="report-cover-detail-value">{clientNames}</p>
            </div>
          </div>

          <div className="report-cover-detail-row">
            <div>
              <p className="report-cover-detail-label">Report Date</p>
              <p className="report-cover-detail-value">{formattedReportDate}</p>
            </div>
          </div>

        </div>
      </div>

      <p className="report-cover-confidential-footer">
        This report is confidential and intended solely for the use of the named client and their advisor. It may not be distributed or reproduced without written permission.
      </p>
    </section>
  )
}
