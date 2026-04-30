import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Bell,
  CheckCheck,
  CircleDollarSign,
  Clock3,
  FileText,
  AlertTriangle,
  Shield,
  Star,
  Trophy,
} from 'lucide-react'
import { useAuthStore, useNotificationsStore } from '../store'

function formatNotifTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const ms = Date.now() - date.getTime()
  const minutes = Math.floor(ms / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })
}

function getRelativeBucket(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'this-week'
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6)
  if (date >= today) return 'today'
  if (date >= yesterday) return 'yesterday'
  if (date >= weekAgo) return 'this-week'
  return 'older'
}

function categoryForType(type) {
  if (type === 'escrow') return 'payments'
  if (type === 'lost' || type === 'won' || type === 'accepted') return 'bids'
  return 'system'
}

const TYPE_CONFIG = {
  lost:     { Icon: Clock3,           color: '#9baab8' },
  won:      { Icon: Trophy,           color: '#9baab8' },
  accepted: { Icon: Trophy,           color: '#9baab8' },
  escrow:   { Icon: CircleDollarSign, color: '#9baab8' },
  review:   { Icon: Star,             color: '#9baab8' },
  workflow: { Icon: FileText,         color: '#9baab8' },
  dispute:  { Icon: AlertTriangle,    color: '#9baab8' },
  default:  { Icon: Shield,           color: '#9baab8' },
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { notifications, unreadCount, readIds, loading, refreshNotifications, markRead, markAllRead } = useNotificationsStore()
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    if (!user) return
    refreshNotifications(user).catch((err) => {
      toast.error(err.response?.data?.error || 'Failed to load notifications')
    })
  }, [user, refreshNotifications])

  const visible = useMemo(() => {
    if (activeFilter === 'all') return notifications
    return notifications.filter((n) => categoryForType(n.type) === activeFilter)
  }, [notifications, activeFilter])

  const sectioned = useMemo(() => {
    const out = { today: [], yesterday: [], 'this-week': [], older: [] }
    visible.forEach((n) => out[getRelativeBucket(n.timestamp)].push(n))
    return out
  }, [visible])

  const SECTIONS = [
    { key: 'today',     label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'this-week', label: 'This week' },
    { key: 'older',     label: 'Older' },
  ]

  const FILTERS = [
    { key: 'all',      label: 'All' },
    { key: 'bids',     label: 'Bids' },
    { key: 'payments', label: 'Payments' },
    { key: 'system',   label: 'System' },
  ]

  const renderItem = (item) => {
    const isUnread = !readIds.includes(item.id)
    const { Icon } = TYPE_CONFIG[item.type] || TYPE_CONFIG.default

    return (
      <div
        key={item.id}
        onClick={() => {
          if (isUnread) markRead(item.id, user)
          if (item.jobId) navigate(`/jobs/${item.jobId}`)
        }}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
          padding: '14px 0',
          borderBottom: '1px solid #f0f2f5',
          cursor: item.jobId ? 'pointer' : 'default',
          position: 'relative',
        }}
        onMouseEnter={(e) => { if (item.jobId) e.currentTarget.style.opacity = '0.8' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
      >
        {isUnread && (
          <span style={{
            position: 'absolute', left: -16, top: '50%', transform: 'translateY(-50%)',
            width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
            flexShrink: 0,
          }} />
        )}

        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: '#f4f5f7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginTop: 1,
        }}>
          <Icon size={16} color="#6b7b8d" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14,
            fontWeight: isUnread ? 600 : 400,
            color: isUnread ? '#1a2533' : '#3a4d60',
            lineHeight: 1.45,
            marginBottom: 2,
          }}>
            {item.title}
          </div>
          {item.detail && (
            <div style={{ fontSize: 13, color: '#7a8fa3', lineHeight: 1.5, marginBottom: 4 }}>
              {item.detail}
            </div>
          )}
          <span style={{ fontSize: 12, color: '#b0bfcc' }}>{formatNotifTime(item.timestamp)}</span>
        </div>

        {isUnread && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); markRead(item.id, user) }}
            style={{
              border: 'none', background: 'none',
              fontSize: 12, color: '#9baab8',
              cursor: 'pointer', padding: '4px 0', flexShrink: 0,
              marginTop: 2,
            }}
          >
            Mark read
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="main" style={{ maxWidth: 1000, paddingTop: 32, paddingLeft: 28 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '4px 0 0' }}>
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllRead(user)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              border: 'none', background: 'none',
              fontSize: 13, fontWeight: 500, color: '#6b7b8d',
              cursor: 'pointer',
            }}
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 28, borderBottom: '1px solid #edf0f5', paddingBottom: 0 }}>
        {FILTERS.map((f) => {
          const active = activeFilter === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              style={{
                border: 'none', background: 'none',
                color: active ? 'var(--text)' : '#9baab8',
                fontSize: 13, fontWeight: active ? 600 : 400,
                cursor: 'pointer', padding: '0 0 12px',
                borderBottom: active ? '2px solid var(--text)' : '2px solid transparent',
                marginBottom: -1,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              {f.label}
              {f.key === 'all' && unreadCount > 0 && (
                <span style={{
                  background: '#e8ebf0', color: '#556070',
                  borderRadius: 999, padding: '0 6px',
                  fontSize: 11, fontWeight: 600, lineHeight: '18px',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {loading && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#9baab8', fontSize: 13 }}>
          Loading...
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div style={{ padding: '72px 0', textAlign: 'center' }}>
          <Bell size={28} color="#c8d0db" style={{ marginBottom: 14 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            Nothing here yet
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>
            {activeFilter === 'all'
              ? 'Activity from your bids, jobs, and payments will appear here.'
              : 'No notifications match this filter.'}
          </div>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div style={{ paddingLeft: 16 }}>
          {SECTIONS.map(({ key, label }) =>
            sectioned[key].length > 0 ? (
              <div key={key} style={{ marginBottom: 8 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.5px',
                  textTransform: 'uppercase', color: '#b0bfcc',
                  padding: '18px 0 6px',
                }}>
                  {label}
                </div>
                {sectioned[key].map((item) => renderItem(item))}
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
