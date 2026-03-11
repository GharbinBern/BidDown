import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Bell } from 'lucide-react'
import { useAuthStore, useNotificationsStore } from '../store'

function formatNotifTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown time'
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
      <div className="workspace-head">
        <div>
          <div className="section-title" style={{ marginBottom: 8 }}>Your <span>Notifications</span></div>
        </div>
        <span className="badge">{unreadCount} unread</span>
      </div>

      {!loading && notifications.length === 0 && (
        <div className="shell-panel empty">
          <div className="empty-icon"><Bell size={44} /></div>
          <h3>No events yet</h3>
          <p>When a bid is accepted/rejected or escrow is released, it will appear here.</p>
        </div>
      )}

      {notifications.length > 0 && (
        <div className="notif-list">
          {notifications.map((item) => (
            <article
              key={item.id}
              className={`notif-item ${readIds.includes(item.id) ? '' : 'unread'}`}
              onClick={() => markRead(item.id, user)}
            >
              <span className={`notif-dot ${item.type === 'lost' ? 'lost' : item.type === 'escrow' ? 'escrow' : ''}`} />
              <div className="notif-main">
                <h3 className="notif-title">{item.title}</h3>
                <p className="notif-detail">{item.detail}</p>
                <div className="notif-time">{formatNotifTime(item.timestamp)}</div>
              </div>
              {item.jobId && (
                <div className="notif-action">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      markRead(item.id, user)
                      navigate(`/jobs/${item.jobId}`)
                    }}
                  >
                    View Request
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
