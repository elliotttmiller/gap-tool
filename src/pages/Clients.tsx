import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { RiAddLine, RiArrowRightSLine } from "@remixicon/react"
import { Link } from "react-router-dom"

const clients = [
  {
    id: "1",
    name: "Elliott Miller",
    email: "elliott@example.com",
    status: "Active" as const,
    lastUpdated: "Today",
    scenarios: 3,
  },
  {
    id: "2",
    name: "Sarah Davis",
    email: "sarah@example.com",
    status: "Draft" as const,
    lastUpdated: "3 days ago",
    scenarios: 1,
  },
  {
    id: "3",
    name: "Robert Chen",
    email: "robert@example.com",
    status: "Active" as const,
    lastUpdated: "1 week ago",
    scenarios: 2,
  },
]

const statusVariant: Record<string, "success" | "neutral" | "warning"> = {
  Active: "success",
  Draft: "neutral",
  Pending: "warning",
}

export function Clients() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Clients</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage client profiles and their risk scenarios.
          </p>
        </div>
        <Button>
          <RiAddLine className="size-4" aria-hidden="true" />
          Add Client
        </Button>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead>
              <tr>
                {["Client", "Email", "Scenarios", "Last Updated", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 first:pl-6 last:pr-6 dark:text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <td className="whitespace-nowrap px-4 py-4 pl-6 text-sm font-medium text-gray-900 dark:text-gray-50">
                    {client.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {client.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {client.scenarios}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {client.lastUpdated}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <Badge variant={statusVariant[client.status] ?? "neutral"}>
                      {client.status}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 pr-6 text-right">
                    <Button variant="ghost" asChild className="gap-1 text-xs">
                      <Link to={`/scenarios/${client.id}/disability`}>
                        Open Scenario
                        <RiArrowRightSLine className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
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
