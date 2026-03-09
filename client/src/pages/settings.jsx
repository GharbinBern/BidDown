import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LogOut, Moon, SlidersHorizontal, Sun, UserCircle2 } from 'lucide-react'
import { useAuthStore, usePreferencesStore } from '../store'
import { api } from '../api'

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
  const [summary, setSummary] = useState({
    activeRequests: 0,
    closedOrCompleted: 0,
    submittedBids: 0,
  })

  useEffect(() => {
    let mounted = true
    const loadProfileSummary = async () => {
      try {
        const [openRes, closedRes, completedRes, bidsRes] = await Promise.all([
          api.getJobs({ status: 'open', limit: 100 }),
          api.getJobs({ status: 'closed', limit: 100 }),
          api.getJobs({ status: 'completed', limit: 100 }),
          api.getMyBids(),
        ])

        const userId = String(user?._id || user?.id || '')
        const allJobs = [
          ...openRes.data.jobs,
          ...closedRes.data.jobs,
          ...completedRes.data.jobs,
        ]
        const myJobs = allJobs.filter((job) => String(job.owner_id?._id || job.owner_id) === userId)
        const activeRequests = myJobs.filter((job) => job.status === 'open').length
        const closedOrCompleted = myJobs.filter((job) => job.status === 'closed' || job.status === 'completed').length

        if (mounted) {
          setSummary({
            activeRequests,
            closedOrCompleted,
            submittedBids: bidsRes.data.length,
          })
        }
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to load profile summary')
      }
    }

    if (user) loadProfileSummary()
    return () => { mounted = false }
  }, [user])

  const initials = useMemo(() => {
    const name = user?.name?.trim() || 'User'
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('')
  }, [user])

  const roles = user?.roles || []

  return (
    <div className="main">
      <div className="section-title">Your <span>Profile</span></div>
      <p className="workspace-subtitle" style={{ marginBottom: 20 }}>
        Account details and personal marketplace preferences in one place.
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            logout()
            navigate('/')
          }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <div className="profile-grid">
        <aside className="profile-card">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-name">{user?.name || 'User'}</div>
          <div className="profile-email">{user?.email || 'No email available'}</div>
          <div className="profile-role-row">
            {roles.map((role) => (
              <span key={role} className="badge" style={{ textTransform: 'capitalize' }}>{role}</span>
            ))}
            {roles.length === 0 && <span className="badge">Member</span>}
          </div>

          <div className="profile-stat-grid">
            <div className="profile-stat">
              <div className="profile-stat-label">Active Requests</div>
              <div className="profile-stat-value">{summary.activeRequests}</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-label">Submitted Bids</div>
              <div className="profile-stat-value">{summary.submittedBids}</div>
            </div>
            <div className="profile-stat" style={{ gridColumn: '1 / -1' }}>
              <div className="profile-stat-label">Closed/Completed Requests</div>
              <div className="profile-stat-value">{summary.closedOrCompleted}</div>
            </div>
          </div>
        </aside>

        <div className="profile-settings-stack">
          <section className="shell-panel settings-panel" style={{ marginBottom: 0 }}>
            <div className="settings-section-title">
              <UserCircle2 size={16} /> Appearance
            </div>
            <p className="settings-help">Choose your preferred visual mode for the entire app.</p>
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
          </section>

          <section className="shell-panel settings-panel" style={{ marginBottom: 0 }}>
            <div className="settings-section-title">
              <SlidersHorizontal size={16} /> Marketplace Order
            </div>
            <p className="settings-help">Set the default way open requests are arranged on the marketplace page.</p>
            <div className="settings-stack">
              <button
                type="button"
                className={`settings-choice ${requestOrderMode === 'mine-first' ? 'active' : ''}`}
                onClick={() => setRequestOrderMode('mine-first')}
              >
                <span className="settings-choice-title">My Requests First</span>
                <span className="settings-choice-desc">Show your own requests at the top, followed by everyone else.</span>
              </button>
              <button
                type="button"
                className={`settings-choice ${requestOrderMode === 'mixed' ? 'active' : ''}`}
                onClick={() => setRequestOrderMode('mixed')}
              >
                <span className="settings-choice-title">Mixed Order</span>
                <span className="settings-choice-desc">Treat all requests equally and sort only by selected criteria.</span>
              </button>
            </div>
          </section>

          <section className="shell-panel settings-panel" style={{ marginBottom: 0 }}>
            <div className="settings-section-title">
              <SlidersHorizontal size={16} /> Marketplace View
            </div>
            <p className="settings-help">Choose the default marketplace layout when you open requests.</p>
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
          </section>
        </div>
      </div>
    </div>
  )
}
