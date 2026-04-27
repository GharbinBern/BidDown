import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import HomePage from './pages/Home'
import BrowsePage from './pages/Browse'
import JobDetailPage from './pages/Job'
import PostJobPage from './pages/PostJob'
import ProviderProfilePage from './pages/ProviderProfile'
import DashboardPage from './pages/Dashboard'
import SettingsPage from './pages/Settings'
import NotificationsPage from './pages/Notifications'
import { useAuthStore, useNotificationsStore, usePreferencesStore } from './store'

import styles from './styles'

function AppContent() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/post-job" element={isAuthenticated ? <PostJobPage /> : <Navigate to="/login" />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/jobs/:id" element={<JobDetailPage />} />
      <Route path="/providers/:userId" element={<ProviderProfilePage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
      <Route path="/notifications" element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" />} />
      <Route path="/profile" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />} />
      <Route path="/settings" element={<Navigate to="/profile" replace />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  const { isAuthenticated, user } = useAuthStore()
  const theme = usePreferencesStore((state) => state.theme)
  const refreshNotifications = useNotificationsStore((state) => state.refreshNotifications)

  useEffect(() => {
    document.body.removeAttribute('data-theme')
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !user) return
    refreshNotifications(user).catch(() => {})
  }, [isAuthenticated, user, refreshNotifications])

  return (
    <>
      <style>{styles}</style>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <AppContent />
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e1e1e',
              color: '#d4d0c8',
              fontSize: '13px',
              borderRadius: '8px',
              padding: '10px 14px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
              border: '1px solid #2e2e2e',
            },
            success: {
              iconTheme: { primary: '#6aad6a', secondary: '#1e1e1e' },
            },
            error: {
              iconTheme: { primary: '#b85c5c', secondary: '#1e1e1e' },
            },
          }}
        />
      </BrowserRouter>
    </>
  )
}

export default App
