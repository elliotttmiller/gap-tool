import { Badge } from "@/components/Badge"
import { Card } from "@/components/Card"
import { LineChart } from "@/components/LineChart"
import { ProgressBar } from "@/components/ProgressBar"
import { cx, formatCurrency } from "@/lib/utils"
import {
  RiAddLine,
  RiArrowRightUpLine,
  RiBarChartBoxLine,
  RiFileTextLine,
  RiHeartPulseLine,
  RiScalesLine,
  RiTeamLine,
  RiUmbrellaLine,
} from "@remixicon/react"
import { Link } from "react-router-dom"

const kpiMetrics = [
  {
    label: "Total Clients",
    value: "32",
    detail: "+2 this month",
    icon: RiTeamLine,
    change: "+6.7%",
    positive: true,
  },
  {
    label: "Active Scenarios",
    value: "14",
    detail: "4 pending review",
    icon: RiBarChartBoxLine,
    change: "+2",
    positive: true,
  },
  {
    label: "Reports Generated",
    value: "128",
    detail: "8 this week",
    icon: RiFileTextLine,
    change: "+12.5%",
    positive: true,
  },
  {
    label: "Avg. Modeled Gap",
    value: "$4,200",
    detail: "Per month",
    icon: RiUmbrellaLine,
    change: "-3.2%",
    positive: false,
  },
]

const riskModuleData = [
  {
    name: "Disability",
    href: "/scenarios/1/disability",
    icon: RiUmbrellaLine,
    utilization: 78,
    activeScenarios: 8,
    avgGap: "$4,200",
    variant: "default" as const,
  },
  {
    name: "Life Insurance",
    href: "/scenarios/1/life",
    icon: RiHeartPulseLine,
    utilization: 55,
    activeScenarios: 5,
    avgGap: "$3,100",
    variant: "warning" as const,
  },
  {
    name: "Unemployment",
    href: "/scenarios/1/unemployment",
    icon: RiBarChartBoxLine,
    utilization: 34,
    activeScenarios: 4,
    avgGap: "$1,500",
    variant: "success" as const,
  },
  {
    name: "Liability",
    href: "/scenarios/1/liability",
    icon: RiScalesLine,
    utilization: 20,
    activeScenarios: 2,
    avgGap: "$800",
    variant: "neutral" as const,
  },
]

const trendData = [
  { month: "Jan", Disability: 3800, Life: 2400, Unemployment: 1100, Liability: 600 },
  { month: "Feb", Disability: 4100, Life: 2600, Unemployment: 1200, Liability: 650 },
  { month: "Mar", Disability: 3900, Life: 2900, Unemployment: 1350, Liability: 700 },
  { month: "Apr", Disability: 4200, Life: 3100, Unemployment: 1500, Liability: 800 },
  { month: "May", Disability: 4400, Life: 3200, Unemployment: 1480, Liability: 820 },
  { month: "Jun", Disability: 4250, Life: 3050, Unemployment: 1520, Liability: 790 },
]

const recentScenarios = [
  {
    id: "1",
    client: "Elliott Miller",
    scenario: "Miller Household – Risk Review",
    module: "Disability",
    gap: "$4,250",
    status: "Calculated",
    statusVariant: "success" as const,
  },
  {
    id: "2",
    client: "Sarah Davis",
    scenario: "Davis Protection Update",
    module: "Life Insurance",
    gap: "$2,800",
    status: "Incomplete",
    statusVariant: "warning" as const,
  },
  {
    id: "3",
    client: "Robert Chen",
    scenario: "Chen Retirement Income",
    module: "Disability",
    gap: "$1,100",
    status: "Ready",
    statusVariant: "default" as const,
  },
  {
    id: "4",
    client: "Maria Lopez",
    scenario: "Lopez Family Review",
    module: "Liability",
    gap: "$650",
    status: "Incomplete",
    statusVariant: "warning" as const,
  },
]

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            NorthStar GAP Tool — advisor overview and risk modeling activity
          </p>
        </div>
        <Link
          to="/clients"
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          <RiAddLine className="size-4" aria-hidden="true" />
          New Scenario
        </Link>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiMetrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.label}
              </p>
              <metric.icon
                className="size-5 text-gray-400 dark:text-gray-600"
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {metric.value}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={cx(
                  "text-xs font-medium",
                  metric.positive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {metric.change}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {metric.detail}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Chart + Risk Modules */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trend Chart */}
        <Card className="col-span-1 p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            Monthly GAP Trend
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
            Average modeled monthly gap per module (USD)
          </p>
          <LineChart
            className="mt-4 h-56"
            data={trendData}
            index="month"
            categories={["Disability", "Life", "Unemployment", "Liability"]}
            valueFormatter={(v) => formatCurrency(v)}
            showLegend
            showGridLines
          />
        </Card>

        {/* Risk Module Utilization */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            Module Utilization
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
            % of clients with active scenarios
          </p>
          <ul className="mt-5 space-y-5">
            {riskModuleData.map((mod) => (
              <li key={mod.name}>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <mod.icon
                      className="size-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {mod.name}
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-500">
                    {mod.utilization}%
                  </span>
                </div>
                <ProgressBar
                  value={mod.utilization}
                  variant={mod.variant}
                  className="mt-1.5"
                />
                <div className="mt-1 flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
                  <span>{mod.activeScenarios} scenarios</span>
                  <span>Avg {mod.avgGap}/mo</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Recent Scenarios */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              Recent Scenarios
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
              Latest risk analysis sessions across all clients
            </p>
          </div>
          <Link
            to="/clients"
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            View all
            <RiArrowRightUpLine className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead>
              <tr>
                {["Client", "Scenario", "Module", "Avg GAP/mo", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="py-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 first:pl-0 last:pr-0 dark:text-gray-500"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentScenarios.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="whitespace-nowrap py-3 pr-4 text-sm font-medium text-gray-900 dark:text-gray-50">
                    {row.client}
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-600 dark:text-gray-400">
                    {row.scenario}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4 text-sm text-gray-600 dark:text-gray-400">
                    {row.module}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4 text-sm font-medium text-gray-900 dark:text-gray-50">
                    {row.gap}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4">
                    <Badge variant={row.statusVariant}>{row.status}</Badge>
                  </td>
                  <td className="whitespace-nowrap py-3 text-right">
                    <Link
                      to={`/scenarios/${row.id}`}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
