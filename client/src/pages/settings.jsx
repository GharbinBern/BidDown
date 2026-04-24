import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
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
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null

  const kv = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
      <span style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: 9 }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )

  return (
    <div className="main" style={{ maxWidth: 600 }}>
      <div style={{ fontSize: 16, fontWeight: 900, fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>Account</div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div className="profile-avatar" style={{ width: 40, height: 40, fontSize: 15, marginBottom: 0, flexShrink: 0 }}>{initials}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "'Syne', sans-serif" }}>{user?.name || 'User'}</div>
            <div style={{ color: 'var(--muted)', fontSize: 11 }}>{user?.email || 'No email'}</div>
          </div>
        </div>
        {kv('Role', roles.join(', ') || 'member')}
        {kv('Member since', memberSince || '—')}
        {kv('Rating', user?.average_rating ? `${user.average_rating} / 5` : 'No ratings yet')}
        <div style={{ padding: '9px 0', fontSize: 12 }}>
          <span style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: 9 }}>Jobs completed</span>
          <span style={{ float: 'right', fontWeight: 500 }}>{user?.total_jobs_completed ?? 0}</span>
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '16px', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, fontFamily: "'Syne', sans-serif", textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 10, color: 'var(--muted)' }}>Preferences</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>Show my requests first</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>Prioritize your listings in the marketplace</div>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>List view</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>Compact list instead of cards</div>
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
        style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '7px 14px', color: 'var(--muted)', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', display: 'inline-flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '1px' }}
        onClick={() => { logout(); navigate('/') }}
      >
        <LogOut size={13} /> Sign out
      </button>
    </div>
  )
}
