import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Mail, User } from 'lucide-react'
import { useAuthStore, usePreferencesStore } from '../store'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const {
    requestOrderMode,
    marketViewMode,
    setRequestOrderMode,
    setMarketViewMode,
  } = usePreferencesStore()

  const initials = useMemo(() => {
    const name = user?.name?.trim() || 'User'
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('')
  }, [user])

  const roles = user?.roles || []
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null

  return (
    <div className="main prof-page">
      <div className="prof-grid">
        <div className="prof-identity">
          <div className="profile-avatar">{initials}</div>
          <div className="prof-name">{user?.name || 'User'}</div>
          <div className="prof-meta">
            <span><Mail size={13} /> {user?.email || 'No email'}</span>
            <span><User size={13} /> {roles[0] || 'member'}</span>
          </div>
          {memberSince && <div className="prof-since">Member since {memberSince}</div>}
        </div>

        <div className="prof-prefs">
          <div className="prof-toggle-row">
            <div className="prof-toggle-label">
              <div className="prof-toggle-name">Show my requests first</div>
              <div className="prof-toggle-desc">Prioritize your own listings at the top of the marketplace</div>
            </div>
            <div
              className={`pref-switch ${requestOrderMode === 'mine-first' ? 'on' : ''}`}
              role="switch"
              aria-checked={requestOrderMode === 'mine-first'}
              tabIndex={0}
              onClick={() => setRequestOrderMode(requestOrderMode === 'mine-first' ? 'mixed' : 'mine-first')}
              onKeyDown={(e) => e.key === 'Enter' && setRequestOrderMode(requestOrderMode === 'mine-first' ? 'mixed' : 'mine-first')}
            >
              <span className="pref-switch-thumb" />
            </div>
          </div>

          <div className="prof-toggle-row">
            <div className="prof-toggle-label">
              <div className="prof-toggle-name">List view</div>
              <div className="prof-toggle-desc">Display marketplace as a compact list instead of cards</div>
            </div>
            <div
              className={`pref-switch ${marketViewMode === 'list' ? 'on' : ''}`}
              role="switch"
              aria-checked={marketViewMode === 'list'}
              tabIndex={0}
              onClick={() => setMarketViewMode(marketViewMode === 'list' ? 'card' : 'list')}
              onKeyDown={(e) => e.key === 'Enter' && setMarketViewMode(marketViewMode === 'list' ? 'card' : 'list')}
            >
              <span className="pref-switch-thumb" />
            </div>
          </div>
        </div>

        <button
          type="button"
          className="prof-logout-btn"
          onClick={() => {
            logout()
            navigate('/')
          }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  )
}
