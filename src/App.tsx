import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/global/AppShell';
import { Dashboard } from './pages/Dashboard';
import { ScenarioDetailShell } from './pages/ScenarioDetail';
import { LifeModulePage } from './pages/LifeModulePage';
import { DisabilityModulePage } from './pages/DisabilityModulePage';
import { UnemploymentModulePage } from './pages/UnemploymentModulePage';
import { LiabilityModulePage } from './pages/LiabilityModulePage';
import { Presentation } from './pages/Presentation';
import { SettingsLayout } from './pages/Settings';

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<AppShell />}>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Redirect legacy routes */}
          <Route path="clients" element={<Navigate to="/" replace />} />
          <Route path="scenarios" element={<Navigate to="/" replace />} />
          <Route path="scenarios/list" element={<Navigate to="/" replace />} />

          {/* Scenario detail with nested module tabs */}
          <Route path="scenarios/:scenarioId" element={<ScenarioDetailShell />}>
            <Route path="disability" element={<DisabilityModulePage />} />
            <Route path="life" element={<LifeModulePage />} />
            <Route path="unemployment" element={<UnemploymentModulePage />} />
            <Route path="liability" element={<LiabilityModulePage />} />
          </Route>

          {/* Settings — redirects to dashboard (settings now in header panel) */}
          <Route path="settings" element={<SettingsLayout />} />
          <Route path="settings/*" element={<Navigate to="/" replace />} />

          {/* Assumptions — still routable directly */}
          <Route path="assumptions" element={<Navigate to="/" replace />} />

          {/* 404 inside app shell */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-5xl font-bold text-gray-800">404</p>
              <p className="mt-4 text-lg font-medium text-gray-50">Page not found</p>
              <p className="mt-1 text-sm text-gray-500">The page you're looking for doesn't exist.</p>
              <a href="/" className="mt-6 text-sm font-medium text-brand-500 hover:text-brand-400">
                ← Back to Dashboard
              </a>
            </div>
          } />
        </Route>

        {/* Presentation — outside AppShell (no header) */}
        <Route path="/present/:scenarioId" element={<Presentation />} />
      </Routes>
    </Router>
  );
}
