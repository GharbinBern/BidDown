import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuthStore, useNotificationsStore, usePreferencesStore } from '../store'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const unreadCount = useNotificationsStore((state) => state.unreadCount)
  const activeRole = usePreferencesStore((state) => state.activeRole)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const roles = user?.roles || []
  const isBuyer = roles.includes('buyer')
  const isSeller = roles.includes('seller')
  const canPostJob = isAuthenticated && isBuyer && (!isSeller || activeRole === 'buyer')

  const navItems = isAuthenticated
    ? [
        { label: 'Browse Requests', path: '/browse' },
        { label: 'Dashboard', path: '/dashboard' },
      ]
    : [
        { label: 'Browse Requests', path: '/browse' },
      ]

  const goTo = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => goTo('/')}>BraFom</div>
      <div className="nav-tabs">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`nav-tab ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
            onClick={() => goTo(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="nav-right">
        {isAuthenticated ? (
          <>
            {canPostJob && (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => goTo('/post-job')}>
                Post a Job
              </button>
            )}
            <button type="button" className="nav-notif-btn" onClick={() => goTo('/notifications')} aria-label="Notifications">
              <Bell size={16} />
              {unreadCount > 0 && <span className="nav-unread">{Math.min(unreadCount, 99)}</span>}
            </button>
            <button type="button" className="nav-user-link" onClick={() => goTo('/profile')}>
              {user?.name}
            </button>
          </>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => goTo('/login')}>Get Started</button>
        )}
      </div>
      <button type="button" className="nav-mobile-toggle" onClick={() => setMobileOpen((prev) => !prev)}>
        {mobileOpen ? 'Close' : 'Menu'}
      </button>
      {mobileOpen && (
        <div className="nav-mobile-panel">
          {isAuthenticated && (
            <div className="nav-mobile-group">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className={`nav-tab ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                  onClick={() => goTo(item.path)}
                >
                  {item.label}
                </button>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => goTo('/notifications')}>
                Notifications {unreadCount > 0 ? `(${Math.min(unreadCount, 99)})` : ''}
              </button>
              {canPostJob && (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => goTo('/post-job')}>
                  Post a Job
                </button>
              )}
              <button type="button" className="nav-user-link" onClick={() => goTo('/profile')}>
                {user?.name}
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
