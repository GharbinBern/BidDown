import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Briefcase, LayoutGrid, LogOut, Mail, Moon, SlidersHorizontal, Sun, UserCircle2 } from 'lucide-react'
import { useAuthStore, usePreferencesStore } from '../store'
import { api } from '../api'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout, setUser } = useAuthStore()
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
  const [tab, setTab] = useState('overview')
  const [details, setDetails] = useState({ name: '', email: '' })

  useEffect(() => {
    setDetails({
      name: user?.name || '',
      email: user?.email || '',
    })
  }, [user])

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
        const allJobs = [...openRes.data.jobs, ...closedRes.data.jobs, ...completedRes.data.jobs]
        const myJobs = allJobs.filter((job) => String(job.owner_id?._id || job.owner_id) === userId)

        if (mounted) {
          setSummary({
            activeRequests: myJobs.filter((job) => job.status === 'open').length,
            closedOrCompleted: myJobs.filter((job) => job.status === 'closed' || job.status === 'completed').length,
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

  const hasDetailsChanges = details.name.trim() !== (user?.name || '') || details.email.trim() !== (user?.email || '')

  const handleSaveDetails = () => {
    const nextName = details.name.trim()
    const nextEmail = details.email.trim()
    if (!nextName) {
      toast.error('Name is required')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(nextEmail)) {
      toast.error('Enter a valid email')
      return
    }

    // No backend profile update endpoint exists yet; persist changes in auth store/local storage for now.
    setUser({ ...user, name: nextName, email: nextEmail })
    toast.success('Profile details updated')
  }

  return (
    <div className="main">
      <div className="section-title" style={{ marginBottom: 12 }}>Your <span>Profile</span></div>

      <section className="prof-layout">
        <aside className="prof-sidebar">
          <div className="prof-avatar-block">
            <div className="profile-avatar">{initials}</div>
            <div className="prof-name">{user?.name || 'User'}</div>
            <div className="prof-email"><Mail size={12} /> {user?.email || 'No email available'}</div>
            <div className="profile-role-row">
              {roles.map((role) => (
                <span key={role} className="badge" style={{ textTransform: 'capitalize' }}>{role}</span>
              ))}
              {roles.length === 0 && <span className="badge">Member</span>}
            </div>
          </div>

          <button type="button" className={`prof-nav-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
            <LayoutGrid size={14} /> Overview
          </button>
          <button type="button" className={`prof-nav-btn ${tab === 'preferences' ? 'active' : ''}`} onClick={() => setTab('preferences')}>
            <SlidersHorizontal size={14} /> Preferences
          </button>

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

        <div className="prof-content">
          {tab === 'overview' && (
            <>
              <section className="shell-panel prof-panel">
                <div className="settings-section-title"><Briefcase size={16} /> Activity Snapshot</div>
                <div className="prof-stats-row">
                  <div className="profile-stat">
                    <div className="profile-stat-label">Active Requests</div>
                    <div className="profile-stat-value">{summary.activeRequests}</div>
                  </div>
                  <div className="profile-stat">
                    <div className="profile-stat-label">Submitted Bids</div>
                    <div className="profile-stat-value">{summary.submittedBids}</div>
                  </div>
                  <div className="profile-stat">
                    <div className="profile-stat-label">Closed Or Completed</div>
                    <div className="profile-stat-value">{summary.closedOrCompleted}</div>
                  </div>
                </div>
              </section>

              <section className="shell-panel prof-panel">
                <div className="settings-section-title"><UserCircle2 size={16} /> Your Details</div>
                <div className="prof-form-grid">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Name</label>
                    <input
                      className="form-input"
                      value={details.name}
                      onChange={(e) => setDetails((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email</label>
                    <input
                      className="form-input"
                      type="email"
                      value={details.email}
                      onChange={(e) => setDetails((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div className="prof-form-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={!hasDetailsChanges}
                    onClick={() => setDetails({ name: user?.name || '', email: user?.email || '' })}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={!hasDetailsChanges}
                    onClick={handleSaveDetails}
                  >
                    Save Details
                  </button>
                </div>
              </section>
            </>
          )}

          {tab === 'preferences' && (
            <>
              <section className="shell-panel prof-panel">
                <div className="settings-section-title"><UserCircle2 size={16} /> Appearance</div>
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

              <section className="shell-panel prof-panel">
                <div className="settings-section-title"><SlidersHorizontal size={16} /> Marketplace Defaults</div>
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
            </>
          )}
        </div>
      </section>
    </div>
  )
}
