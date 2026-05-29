import { useParams, Navigate } from "react-router-dom"
import { useAppStore } from "@/lib/store"
import { OffensiveDashboard } from "@/features/offensive/components/OffensiveDashboard"

export function OffensiveDashboardPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const client = useAppStore((s) => s.clients.find((c) => c.id === clientId))

  if (!client) {
    return <Navigate to="/" replace />
  }

  return <OffensiveDashboard client={client} />
}
