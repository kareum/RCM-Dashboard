import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout }          from './components/layout'
import { ClinicSettingsPage } from './pages/ClinicSettingsPage'
import { DashboardPage }      from './pages/DashboardPage'
import { BillingPage }        from './pages/BillingPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/"        element={<DashboardPage />} />
          <Route path="/clinics" element={<ClinicSettingsPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
