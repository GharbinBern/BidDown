import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Bell, ArrowRight } from 'lucide-react'
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

function notifIcon(type) {
  if (type === 'lost') return '✕'
  if (type === 'escrow') return '$'
  if (type === 'won' || type === 'accepted') return '★'
  return '•'
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
  } = useNotificationsStore()

  useEffect(() => {
    if (!user) return
    refreshNotifications(user).catch((error) => {
      toast.error(error.response?.data?.error || 'Failed to load notifications')
    })
  }, [user, refreshNotifications])

  return (
    <div className="main">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 900 }}>Notifications</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: 4 }}>Activity feed</div>
        </div>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount} unread</span>
        )}
      </div>

      {!loading && notifications.length === 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}><Bell size={44} /></div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, marginBottom: 6 }}>No events yet</div>
          <div style={{ color: 'var(--muted)', fontSize: 11 }}>When a bid is accepted/rejected or escrow is released, it will appear here.</div>
        </div>
      )}

      {notifications.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {notifications.map((item) => {
            const isUnread = !readIds.includes(item.id)
            return (
              <article
                key={item.id}
                onClick={() => markRead(item.id, user)}
                style={{
                  background: isUnread ? 'var(--accent-soft)' : 'var(--card)',
                  border: '1px solid',
                  borderColor: isUnread ? 'var(--accent)' : 'var(--border)',
                  borderTop: 'none',
                  padding: '12px 14px',
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr auto',
                  gap: 12,
                  alignItems: 'start',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: item.type === 'lost' ? '#c0392b20' : item.type === 'escrow' ? '#2563eb20' : 'var(--accent-soft)',
                  color: item.type === 'lost' ? 'var(--accent2)' : item.type === 'escrow' ? 'var(--blue)' : 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 900,
                  border: `1px solid ${item.type === 'lost' ? '#c0392b40' : item.type === 'escrow' ? '#2563eb40' : '#e8b84b40'}`,
                  flexShrink: 0,
                }}>
                  {notifIcon(item.type)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{item.title}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 11, lineHeight: 1.5 }}>{item.detail}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 9, marginTop: 4, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{formatNotifTime(item.timestamp)}</div>
                </div>
                {item.jobId && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      markRead(item.id, user)
                      navigate(`/jobs/${item.jobId}`)
                    }}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  >
                    View <ArrowRight size={11} />
                  </button>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
