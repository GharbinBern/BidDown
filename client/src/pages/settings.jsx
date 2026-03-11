import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Moon, SlidersHorizontal, Sun } from 'lucide-react'
import { useAuthStore, usePreferencesStore } from '../store'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const {
    theme,
    requestOrderMode,
    marketViewMode,
    setTheme,
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
  const roleLabel = roles[0] || 'member'

  return (
    <div className="main">
      <div className="section-title" style={{ marginBottom: 12 }}>Your <span>Profile</span></div>

      <section className="prof-layout prof-layout-stretch">
        <aside className="prof-sidebar">
          <div className="prof-avatar-block">
            <div className="profile-avatar">{initials}</div>
            <div className="prof-name">{user?.name || 'User'}</div>
            <div className="prof-email">{user?.email || 'No email available'}</div>
            <div className="prof-role-text" style={{ textTransform: 'lowercase' }}>{roleLabel}</div>
          </div>

          <section className="shell-panel prof-panel">
            <div className="settings-section-title"><SlidersHorizontal size={16} /> Preferences</div>

            <div className="settings-compact-group" style={{ marginBottom: 10 }}>
              <div className="settings-compact-label">Appearance</div>
              <div className="settings-row">
                <button
                  type="button"
                  className={`settings-toggle ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <Sun size={15} /> Light
                </button>
                <button
                  type="button"
                  className={`settings-toggle ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon size={15} /> Dark
                </button>
              </div>
            </div>

            <div className="settings-grid-compact">
              <div className="settings-compact-group">
                <div className="settings-compact-label">Request Order</div>
                <div className="settings-row">
                  <button
                    type="button"
                    className={`settings-toggle ${requestOrderMode === 'mine-first' ? 'active' : ''}`}
                    onClick={() => setRequestOrderMode('mine-first')}
                  >
                    Mine First
                  </button>
                  <button
                    type="button"
                    className={`settings-toggle ${requestOrderMode === 'mixed' ? 'active' : ''}`}
                    onClick={() => setRequestOrderMode('mixed')}
                  >
                    Mixed
                  </button>
                </div>
              </div>

              <div className="settings-compact-group">
                <div className="settings-compact-label">Marketplace View</div>
                <div className="settings-row">
                  <button
                    type="button"
                    className={`settings-toggle ${marketViewMode === 'card' ? 'active' : ''}`}
                    onClick={() => setMarketViewMode('card')}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    className={`settings-toggle ${marketViewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setMarketViewMode('list')}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
          </section>

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
        </aside>
      </section>
    </div>
  )
}
