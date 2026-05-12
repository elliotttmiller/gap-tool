/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/global/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { ScenarioDetailShell } from './pages/ScenarioDetail';
import { LifeModulePage } from './pages/LifeModulePage';
import { DisabilityModulePage } from './pages/DisabilityModulePage';
import { UnemploymentModulePage } from './pages/UnemploymentModulePage';
import { LiabilityModulePage } from './pages/LiabilityModulePage';
import { Presentation } from './pages/Presentation';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="scenarios/:scenarioId" element={<ScenarioDetailShell />}>
            <Route index element={<Navigate to="life" replace />} />
            <Route path="life" element={<LifeModulePage />} />
            <Route path="disability" element={<DisabilityModulePage />} />
            <Route path="unemployment" element={<UnemploymentModulePage />} />
            <Route path="liability" element={<LiabilityModulePage />} />
          </Route>
          {/* Default catch-all */}
          <Route path="reports" element={<div className="p-8">Reports coming soon</div>} />
          <Route path="assumptions" element={<div className="p-8">Assumptions coming soon</div>} />
          <Route path="settings" element={<div className="p-8">Settings coming soon</div>} />
          <Route path="scenarios/list" element={<div className="p-8 text-slate-500">Scenarios list coming soon</div>} />
        </Route>
        
        {/* Presentation view is outside the standard AppShell (no sidebar) */}
        <Route path="/present/:scenarioId" element={<Presentation />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
