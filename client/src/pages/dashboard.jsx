import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'
import { Flame, Goal, Layers3 } from 'lucide-react'
import { api } from '../api'

function mapStatusPill(status) {
  if (status === 'accepted' || status === 'closed' || status === 'completed') return 'status-closed'
  if (status === 'rejected' || status === 'withdrawn' || status === 'cancelled') return 'status-pending'
  return 'status-open'
}

function formatRelativeTime(value) {
  if (!value) return 'N/A'
  const ms = Date.now() - new Date(value).getTime()
  if (Number.isNaN(ms)) return 'N/A'

  const minutes = Math.floor(ms / (1000 * 60))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function bidStatusLabel(status) {
  if (status === 'accepted') return '★ Won'
  if (status === 'rejected') return 'Not Selected'
  if (status === 'withdrawn') return 'Withdrawn'
  return 'Active'
}

function bidActionLabel(status) {
  if (status === 'accepted') return 'Workflow'
  if (status === 'rejected' || status === 'withdrawn') return '—'
  return ''
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [dashTab, setDashTab] = useState('requests')
  const [jobs, setJobs] = useState([])
  const [myBids, setMyBids] = useState([])

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [openRes, closedRes, completedRes, bidsRes] = await Promise.all([
          api.getJobs({ status: 'open', limit: 100 }),
          api.getJobs({ status: 'closed', limit: 100 }),
          api.getJobs({ status: 'completed', limit: 100 }),
          api.getMyBids(),
        ])

        const combinedJobs = [
          ...openRes.data.jobs,
          ...closedRes.data.jobs,
          ...completedRes.data.jobs,
        ]

        setJobs(combinedJobs)
        setMyBids(bidsRes.data)
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to load dashboard data')
      }
    }

    loadDashboard()
  }, [])

  const userId = user?._id || user?.id
  const roles = user?.roles || []
  const isBuyer = roles.includes('buyer')
  const isSeller = roles.includes('seller')

  const tabs = useMemo(() => {
    const result = []
    if (isBuyer) result.push({ key: 'requests', label: 'My Requests' })
    if (isSeller) result.push({ key: 'bids', label: 'My Bids' })
    result.push({ key: 'transactions', label: 'Transactions' })
    return result
  }, [isBuyer, isSeller])

  useEffect(() => {
    if (!tabs.some((t) => t.key === dashTab)) {
      setDashTab(tabs[0]?.key || 'transactions')
    }
  }, [tabs, dashTab])

  const myListings = useMemo(
    () => jobs.filter((job) => String(job.owner_id?._id || job.owner_id) === String(userId)),
    [jobs, userId]
  )

  const activeRequests = myListings.filter((job) => job.status === 'open').length
  const receivingBids = myListings.filter((job) => (job.bids_count || 0) > 0 && job.status === 'open').length
  const totalSaved = myListings.reduce((sum, job) => {
    if (!job.winning_bid_id?.amount) return sum
    return sum + Math.max(0, job.budget - job.winning_bid_id.amount)
  }, 0)
  const avgReduction = myListings
    .filter((job) => job.winning_bid_id?.amount)
    .reduce((acc, job, _, arr) => acc + (((job.budget - job.winning_bid_id.amount) / job.budget) * 100) / arr.length, 0)

  const closedOrCompleted = myListings.filter((j) => j.status === 'closed' || j.status === 'completed').length
  const completedRate = myListings.length > 0 ? Math.round((closedOrCompleted / myListings.length) * 100) : 0
  const requestStatusMix = [
    { label: 'Open', value: myListings.filter((job) => job.status === 'open').length, kind: 'open' },
    { label: 'Closed', value: myListings.filter((job) => job.status === 'closed').length, kind: 'closed' },
    { label: 'Completed', value: myListings.filter((job) => job.status === 'completed').length, kind: 'completed' },
  ]
  const totalInMix = requestStatusMix.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="main">
      <div className="workspace-head">
        <div>
          <div className="section-title" style={{ marginBottom: 10 }}>Your <span>Space</span></div>
          <p className="workspace-subtitle">A live control center for requests, bidding activity, and savings performance.</p>
        </div>
        <div className="workspace-badge">
          <Goal size={16} />
          <span>{completedRate}% completion flow</span>
        </div>
      </div>
      <div className="dashboard-grid">
        <div className="dash-card"><div className="dash-card-label">Active Requests</div><div className="dash-card-value accent">{activeRequests}</div><div className="dash-card-sub">{receivingBids} receiving bids</div></div>
        <div className="dash-card"><div className="dash-card-label">Total Saved</div><div className="dash-card-value green">${totalSaved.toLocaleString()}</div><div className="dash-card-sub">vs. budget cap on accepted bids</div></div>
        <div className="dash-card"><div className="dash-card-label">Bids Submitted</div><div className="dash-card-value accent">{myBids.length}</div><div className="dash-card-sub">across active requests</div></div>
        <div className="dash-card"><div className="dash-card-label">Avg Bid Reduction</div><div className="dash-card-value green">{avgReduction.toFixed(1)}%</div><div className="dash-card-sub">below your budget cap</div></div>
      </div>
      <div className="insight-grid">
        <div className="insight-card">
          <div className="insight-head"><Layers3 size={15} /> Request Status Mix</div>
          <div className="stacked-meter" aria-label="Request status distribution">
            {requestStatusMix.map((item) => {
              const width = totalInMix === 0 ? 0 : (item.value / totalInMix) * 100
              return (
                <span
                  key={item.label}
                  className={`meter-segment ${item.kind}`}
                  style={{ width: `${Math.max(width, item.value > 0 ? 8 : 0)}%` }}
                  title={`${item.label}: ${item.value}`}
                />
              )
            })}
          </div>
          <div className="meter-legend">
            {requestStatusMix.map((item) => (
              <span key={item.label}><i className={`dot ${item.kind}`} />{item.label}: {item.value}</span>
            ))}
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-head"><Flame size={15} /> Conversion Snapshot</div>
          <div className="conversion-copy">
            <strong>{closedOrCompleted}</strong> requests have reached closure or completion out of <strong>{myListings.length}</strong> total.
          </div>
          <div className="conversion-track" role="presentation">
            <span style={{ width: `${Math.min(completedRate, 100)}%` }} />
          </div>
        </div>
      </div>
      <div className="sub-tabs">
        {tabs.map((t) => (
          <button key={t.key} className={`sub-tab ${dashTab === t.key ? 'active' : ''}`} onClick={() => setDashTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      {dashTab === 'requests' && (
        <div className="shell-panel">
        <table className="table">
          <thead><tr><th>Request</th><th>Category</th><th>Budget</th><th>Bids</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {myListings.map((l, i) => (
              <tr key={l._id || i}>
                <td style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>{l.title}</td>
                <td><span className="listing-category">{l.category}</span></td>
                <td style={{ color: "var(--accent)", fontWeight: 700 }}>${l.budget.toLocaleString()}</td>
                <td>{l.bids_count || 0}</td>
                <td><span className={`status-pill ${mapStatusPill(l.status)}`}>{l.status}</span></td>
                <td>
                  {(l.status === 'closed' || l.status === 'completed') && l.winning_bid_id ? (
                    l.status === 'completed' ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/rating?jobId=${l._id}`)}
                      >
                        Rate Seller
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/jobs/${l._id}`)}
                      >
                        Workflow
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => navigate(`/marketplace?jobId=${l._id}`)}
                    >
                      Manage
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {myListings.length === 0 && (
              <tr>
                <td colSpan="6" style={{ color: 'var(--muted)' }}>No requests posted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="table-cards">
          {myListings.map((l, i) => (
            <div key={l._id || i} className="table-card-row">
              <div className="table-card-title">{l.title}</div>
              <div className="table-card-meta"><span className="listing-category">{l.category}</span><span className={`status-pill ${mapStatusPill(l.status)}`}>{l.status}</span></div>
              <div className="table-card-kv"><span>Budget</span><strong>${l.budget.toLocaleString()}</strong></div>
              <div className="table-card-kv"><span>Bids</span><strong>{l.bids_count || 0}</strong></div>
              {(l.status === 'closed' || l.status === 'completed') && l.winning_bid_id ? (
                l.status === 'completed' ? (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/rating?jobId=${l._id}`)}
                  >
                    Rate Seller
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/jobs/${l._id}`)}
                  >
                    Workflow
                  </button>
                )
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(`/marketplace?jobId=${l._id}`)}
                >
                  Manage
                </button>
              )}
            </div>
          ))}
          {myListings.length === 0 && <div className="table-card-empty">No requests posted yet.</div>}
        </div>
        </div>
      )}
      {dashTab === 'bids' && (
        <div className="shell-panel">
        <table className="table">
          <thead><tr><th>Request</th><th>Your Bid</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead>
          <tbody>
            {myBids.map((b, i) => (
              <tr key={b._id || i}>
                <td style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>{b.job_id?.title || 'Request'}</td>
                <td style={{ color: "var(--accent)", fontWeight: 700 }}>${b.amount.toLocaleString()}</td>
                <td><span className={`status-pill ${mapStatusPill(b.status)}`}>{bidStatusLabel(b.status)}</span></td>
                <td style={{ color: "var(--muted)" }}>{formatRelativeTime(b.createdAt)}</td>
                <td>
                  {b.status === 'accepted' ? (
                    b.job_id?.status === 'completed' ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/rating?jobId=${b.job_id?._id || b.job_id}`)}
                      >
                        Rate Buyer
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/jobs/${b.job_id?._id || b.job_id}`)}
                      >
                        Workflow
                      </button>
                    )
                  ) : (
                    <span style={{ color: 'var(--muted)', fontSize: 12 }}>{bidActionLabel(b.status)}</span>
                  )}
                </td>
              </tr>
            ))}
            {myBids.length === 0 && (
              <tr>
                <td colSpan="5" style={{ color: 'var(--muted)' }}>No bids submitted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="table-cards">
          {myBids.map((b, i) => (
            <div key={b._id || i} className="table-card-row">
              <div className="table-card-title">{b.job_id?.title || 'Request'}</div>
              <div className="table-card-meta"><span className={`status-pill ${mapStatusPill(b.status)}`}>{bidStatusLabel(b.status)}</span></div>
              <div className="table-card-kv"><span>Your Bid</span><strong>${b.amount.toLocaleString()}</strong></div>
              <div className="table-card-kv"><span>Submitted</span><strong>{formatRelativeTime(b.createdAt)}</strong></div>
              <div className="table-card-kv"><span>Action</span><strong>{bidActionLabel(b.status)}</strong></div>
              {b.status === 'accepted' && (
                b.job_id?.status === 'completed' ? (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/rating?jobId=${b.job_id?._id || b.job_id}`)}
                  >
                    Rate Buyer
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/jobs/${b.job_id?._id || b.job_id}`)}
                  >
                    Workflow
                  </button>
                )
              )}
            </div>
          ))}
          {myBids.length === 0 && <div className="table-card-empty">No bids submitted yet.</div>}
        </div>
        </div>
      )}
      {dashTab === 'transactions' && (
        <div className="shell-panel empty">
          <h3>Transactions Coming Soon</h3>
          <p>Transaction ledger and payment records will appear here once the payment flow is fully connected.</p>
        </div>
      )}
    </div>
  )
}
