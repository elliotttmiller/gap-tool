import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/global/AppShell';
import { Dashboard } from './pages/Dashboard';
import { AssumptionsPage } from './pages/Assumptions';
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
          {/* Dashboard — unified client roster + analysis hub */}
          <Route index element={<Dashboard />} />

          {/* Redirect legacy /clients route to Dashboard */}
          <Route path="clients" element={<Navigate to="/" replace />} />

          {/* Scenario detail with nested module tabs */}
          <Route path="scenarios/:scenarioId" element={<ScenarioDetailShell />}>
            <Route path="disability" element={<DisabilityModulePage />} />
            <Route path="life" element={<LifeModulePage />} />
            <Route path="unemployment" element={<UnemploymentModulePage />} />
            <Route path="liability" element={<LiabilityModulePage />} />
          </Route>

          {/* Scenarios list → redirect to Dashboard */}
          <Route path="scenarios" element={<Navigate to="/" replace />} />
          <Route path="scenarios/list" element={<Navigate to="/" replace />} />

          {/* Assumptions */}
          <Route path="assumptions" element={<AssumptionsPage />} />

          {/* Settings with sub-pages */}
          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="general" replace />} />
            <Route path="general" element={
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">General Settings</h2>
                <p className="text-sm text-gray-500">Advisor profile and application preferences.</p>
              </div>
            } />
            <Route path="billing" element={
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Billing</h2>
                <p className="text-sm text-gray-500">Subscription and billing details.</p>
              </div>
            } />
            <Route path="users" element={
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Users</h2>
                <p className="text-sm text-gray-500">Team members and access control.</p>
              </div>
            } />
          </Route>

          {/* 404 inside app shell */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-5xl font-bold text-gray-200 dark:text-gray-800">404</p>
              <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-50">Page not found</p>
              <p className="mt-1 text-sm text-gray-500">The page you're looking for doesn't exist.</p>
              <a href="/" className="mt-6 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                ← Back to Dashboard
              </a>
            </div>
          } />
        </Route>

        {/* Presentation — outside AppShell (no sidebar) */}
        <Route path="/present/:scenarioId" element={<Presentation />} />
      </Routes>
    </Router>
  );
}
