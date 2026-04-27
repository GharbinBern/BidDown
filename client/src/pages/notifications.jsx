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
  if (Number.isNaN(date.getTime())) return 'Unknown time'
  const now = Date.now()
  const ms = now - date.getTime()
  const minutes = Math.floor(ms / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getRelativeBucket(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'this-week'

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfToday.getDate() - 1)
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfToday.getDate() - 6)

  if (date >= startOfToday) return 'today'
  if (date >= startOfYesterday) return 'yesterday'
  if (date >= startOfWeek) return 'this-week'
  return 'older'
}

function categoryForNotification(item) {
  if (item.type === 'escrow') return 'payments'
  if (item.type === 'lost' || item.type === 'won' || item.type === 'accepted') return 'bids'
  if (item.type === 'workflow') return 'system'
  if (item.type === 'dispute') return 'system'
  return 'system'
}

function iconForNotification(item) {
  if (item.type === 'lost') return <Clock3 size={16} />
  if (item.type === 'won' || item.type === 'accepted') return <Trophy size={16} />
  if (item.type === 'escrow') return <CircleDollarSign size={16} />
  if (item.type === 'review') return <Star size={16} />
  if (item.type === 'job') return <Clock3 size={16} />
  if (item.type === 'workflow') return <FileText size={16} />
  if (item.type === 'dispute') return <AlertTriangle size={16} />
  return <Shield size={16} />
}

function iconBgForNotification(item) {
  if (item.type === 'lost') return '#f6e8e8'
  if (item.type === 'won' || item.type === 'accepted') return '#e7edf8'
  if (item.type === 'escrow') return '#e7f0de'
  if (item.type === 'review') return '#e8f0de'
  if (item.type === 'job') return '#e8eff7'
  if (item.type === 'workflow') return '#e8f0fa'
  if (item.type === 'dispute') return '#fdf0e7'
  return '#ece9df'
}

function iconColorForNotification(item) {
  if (item.type === 'lost') return '#b6332a'
  if (item.type === 'won' || item.type === 'accepted') return '#2f63b4'
  if (item.type === 'escrow') return '#7b6a20'
  if (item.type === 'review') return '#3d5f2b'
  if (item.type === 'job') return '#486e93'
  if (item.type === 'workflow') return '#2f5fa0'
  if (item.type === 'dispute') return '#c2621a'
  return '#8a7332'
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    notifications,
    unreadCount,
    readIds,
    loading,
    refreshNotifications,
    markRead,
    markAllRead,
  } = useNotificationsStore()
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    if (!user) return
    refreshNotifications(user).catch((error) => {
      toast.error(error.response?.data?.error || 'Failed to load notifications')
    })
  }, [user, refreshNotifications])

  const visibleNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications
    return notifications.filter((item) => categoryForNotification(item) === activeFilter)
  }, [notifications, activeFilter])

  const sectioned = useMemo(() => {
    const result = {
      today: [],
      yesterday: [],
      'this-week': [],
      older: [],
    }
    visibleNotifications.forEach((item) => {
      result[getRelativeBucket(item.timestamp)].push(item)
    })
    return result
  }, [visibleNotifications])

  const sections = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'this-week', label: 'This Week' },
    { key: 'older', label: 'Older' },
  ]

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'bids', label: 'Bids' },
    { key: 'payments', label: 'Payments' },
    { key: 'system', label: 'System' },
  ]

  const hasVisible = visibleNotifications.length > 0

  const renderRow = (item) => {
    const isUnread = !readIds.includes(item.id)
    return (
      <article
        key={item.id}
        onClick={() => {
          if (isUnread) markRead(item.id, user)
          if (item.jobId) navigate(`/jobs/${item.jobId}`)
        }}
        style={{
          background: '#fff',
          borderBottom: '1px solid #d8dde6',
          padding: '14px 16px',
          display: 'grid',
          gridTemplateColumns: '50px 1fr auto',
          gap: 12,
          alignItems: 'start',
          cursor: item.jobId ? 'pointer' : 'default',
        }}
      >
        <div style={{ position: 'relative', paddingTop: 1 }}>
          {isUnread && (
            <span style={{
              position: 'absolute',
              left: -9,
              top: 6,
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: '#1f68b3',
            }} />
          )}
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: iconBgForNotification(item),
            color: iconColorForNotification(item),
            display: 'grid',
            placeItems: 'center',
            border: '1px solid #d8dde6',
          }}>
            {iconForNotification(item)}
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ color: '#1f2b37', fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>
            {item.title}
            {item.detail ? ` - ${item.detail}` : ''}
          </div>
          <div style={{ color: '#667789', marginTop: 4, fontSize: 12 }}>
            {categoryForNotification(item).charAt(0).toUpperCase() + categoryForNotification(item).slice(1)} · {formatNotifTime(item.timestamp)}
          </div>
        </div>

        {isUnread ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={(event) => {
              event.stopPropagation()
              markRead(item.id, user)
            }}
            style={{
              textTransform: 'none',
              letterSpacing: 0,
              fontSize: 12,
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 8,
              borderColor: '#c9d0da',
            }}
          >
            Mark read
          </button>
        ) : (
          <div style={{ color: '#7a8898', fontSize: 12, paddingTop: 8 }}>Read</div>
        )}
      </article>
    )
  }

  return (
    <div className="main" style={{ maxWidth: 1340 }}>

      <section style={{
        border: '1px solid #d4dbe5',
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          gap: 10,
          padding: 14,
          borderBottom: '1px solid #d4dbe5',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6c7b8d' }}>
            Filter
            <select
              className="input-field"
              value={activeFilter}
              onChange={(event) => setActiveFilter(event.target.value)}
              style={{ minWidth: 140, height: 34, padding: '6px 10px' }}
            >
              {filters.map((filter) => (
                <option key={filter.key} value={filter.key}>{filter.label}</option>
              ))}
            </select>
          </label>
          <div style={{ marginLeft: 'auto' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => markAllRead(user)}
              style={{
                textTransform: 'none',
                letterSpacing: 0,
                fontSize: 12,
                fontWeight: 700,
                padding: '8px 14px',
                borderRadius: 8,
                borderColor: '#c9d0da',
              }}
            >
              <CheckCheck size={16} /> Mark all read
            </button>
          </div>
        </div>

        {!loading && !hasVisible && (
          <div style={{ background: '#f3f6fb', borderTop: '1px solid #d8dde6', padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.45, display: 'inline-flex' }}><Bell size={42} /></div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4, color: '#1f2b37', fontFamily: 'var(--font-head)' }}>No notifications in this view</div>
            <div style={{ color: '#687889', fontSize: 12 }}>Try another filter or wait for new activity.</div>
          </div>
        )}

        {loading && (
          <div style={{ background: '#f3f6fb', borderTop: '1px solid #d8dde6', padding: '30px 20px', color: '#687889', fontSize: 12 }}>
            Loading notifications...
          </div>
        )}

        {!loading && hasVisible && sections.map((section) => (
          sectioned[section.key].length > 0 ? (
            <div key={section.key}>
              <div
                style={{
                  background: '#e9e7e2',
                  borderTop: '1px solid #d4dbe5',
                  borderBottom: '1px solid #d4dbe5',
                  padding: '7px 18px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontSize: 11,
                  color: '#58697a',
                  fontWeight: 700,
                }}
              >
                {section.label}
              </div>
              {sectioned[section.key].map((item) => renderRow(item))}
            </div>
          ) : null
        ))}

        <div style={{
          borderTop: '1px solid #d4dbe5',
          background: '#f7f9fc',
          padding: '10px 18px',
          color: '#6c7b8d',
          fontSize: 12,
          textAlign: 'center',
        }}>
          Notifications update automatically based on activity.
        </div>
      </section>
    </div>
  )
}
