import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { PollProvider } from '@/contexts/PollContext'
import { MainLayout } from '@/layouts/MainLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'

import HomePage from '@/pages/HomePage'
import VotePage from '@/pages/VotePage'
import ThankYouPage from '@/pages/ThankYouPage'
import ResultsPage from '@/pages/ResultsPage'
import NotFoundPage from '@/pages/NotFoundPage'

import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminPollsListPage from '@/pages/admin/AdminPollsListPage'
import AdminPollEditorPage from '@/pages/admin/AdminPollEditorPage'
import AdminStatsPage from '@/pages/admin/AdminStatsPage'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PollProvider>
          <Routes>
            {/* Public voting flow */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/vote" element={<VotePage />} />
              <Route path="/thank-you" element={<ThankYouPage />} />
              <Route path="/results" element={<ResultsPage />} />
            </Route>

            {/* Admin auth */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Admin protected routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="polls" element={<AdminPollsListPage />} />
              <Route path="polls/:pollId" element={<AdminPollEditorPage />} />
              <Route path="stats" element={<AdminStatsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PollProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
