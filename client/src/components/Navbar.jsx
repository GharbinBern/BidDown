import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white/90 backdrop-blur border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-accent">Bid</span>
            <span className="text-2xl font-bold text-slate-900">Down</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-8">
            {isAuthenticated && (
              <div className="flex gap-6">
                <Link
                  to="/marketplace"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/marketplace')
                      ? 'text-accent'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Marketplace
                </Link>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-accent'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/analytics"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/analytics')
                      ? 'text-accent'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Analytics
                </Link>
              </div>
            )}

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">{user?.name}</span>
                <button
                  onClick={logout}
                  className="btn-ghost btn-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="btn-ghost btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
