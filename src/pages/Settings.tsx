import { Navigate } from "react-router-dom"

// Settings are now accessible via the header gear icon.
// Any direct /settings navigation redirects to the dashboard.
export function SettingsLayout() {
  return <Navigate to="/" replace />
}
