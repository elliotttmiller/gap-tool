import { UsersRound, CalendarDays, Shield } from "lucide-react"
import type { CSSProperties } from "react"
import type { ClientRecord } from "@/lib/store-types"

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
  const watermarkStyle: CSSProperties = {
    position: "absolute",
    top: "2.05in",
    right: "-1.05in",
    width: "6.25in",
    height: "6.25in",
    backgroundColor: "#747B85",
    opacity: 0.18,
    WebkitMaskImage: `url(${markUrl})`,
    maskImage: `url(${markUrl})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  }

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
        <span className="report-cover-watermark-mark" style={watermarkStyle} />
      </div>

      <div className="report-cover-content">
        <h1>Risk Review Report</h1>
        <p className="report-cover-household">{householdName}</p>

        <div className="report-cover-details">
          <div className="report-cover-detail-row">
            <UsersRound className="report-cover-detail-icon" aria-hidden="true" />
            <div>
              <p className="report-cover-detail-label">Client</p>
              <p className="report-cover-detail-value">{clientNames}</p>
            </div>
          </div>

          <div className="report-cover-detail-row">
            <CalendarDays className="report-cover-detail-icon" aria-hidden="true" />
            <div>
              <p className="report-cover-detail-label">Report Date</p>
              <p className="report-cover-detail-value">{formattedReportDate}</p>
            </div>
          </div>

          <div className="report-cover-detail-row report-cover-confidential-row">
            <Shield className="report-cover-detail-icon" aria-hidden="true" />
            <div>
              <p className="report-cover-detail-label">Confidential</p>
              <p className="report-cover-confidential-copy">
                This report is confidential and intended solely for the use of the named client and their advisor. It may not be distributed or reproduced without written permission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
