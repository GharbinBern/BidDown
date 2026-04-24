import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-stone-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-13">
          <Link to="/" className="flex items-center gap-1">
            <span className="text-lg font-bold text-green-500">Bid</span>
            <span className="text-lg font-bold text-white">Down</span>
          </Link>

          <div className="flex items-center gap-6">
            {isAuthenticated && (
              <div className="flex gap-4">
                <Link
                  to="/marketplace"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/marketplace')
                      ? 'text-white'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Marketplace
                </Link>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-white'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  My Space
                </Link>
              </div>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-stone-300">{user?.name}</span>
                <button
                  onClick={logout}
                  className="btn-ghost btn-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="text-sm text-stone-400 hover:text-white transition-colors">
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
