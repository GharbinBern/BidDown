import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'
import { CreditCard } from 'lucide-react'
import { api } from '../api'

function mapStatusPill(status) {
  if (status === 'accepted' || status === 'closed' || status === 'completed') return 'status-closed'
  if (status === 'rejected' || status === 'withdrawn' || status === 'cancelled') return 'status-pending'
  return 'status-open'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [dashTab, setDashTab] = useState('requests')
  const [jobs, setJobs] = useState([])
  const [myBids, setMyBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
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
      } finally {
        setLoading(false)
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

  return (
    <div className="main">
      <div className="section-title">Your <span>Space</span></div>
      {loading && (
        <div className="loading-panel">
          <div className="loading-row"><span className="loading-dot" />Preparing your workspace metrics...</div>
        </div>
      )}
      <div className="dashboard-grid">
        <div className="dash-card"><div className="dash-card-label">Active Requests</div><div className="dash-card-value accent">{activeRequests}</div><div className="dash-card-sub">{receivingBids} receiving bids</div></div>
        <div className="dash-card"><div className="dash-card-label">Total Saved</div><div className="dash-card-value green">${totalSaved.toLocaleString()}</div><div className="dash-card-sub">vs. budget cap on accepted bids</div></div>
        <div className="dash-card"><div className="dash-card-label">Bids Submitted</div><div className="dash-card-value accent">{myBids.length}</div><div className="dash-card-sub">across active requests</div></div>
        <div className="dash-card"><div className="dash-card-label">Avg Bid Reduction</div><div className="dash-card-value green">{avgReduction.toFixed(1)}%</div><div className="dash-card-sub">below your budget cap</div></div>
      </div>
      <div className="sub-tabs">
        {tabs.map((t) => (
          <button key={t.key} className={`sub-tab ${dashTab === t.key ? 'active' : ''}`} onClick={() => setDashTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      {dashTab === 'requests' && (
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
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/marketplace?jobId=${l._id}`)}
                  >
                    Manage
                  </button>
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
      )}
      {dashTab === 'bids' && (
        <table className="table">
          <thead><tr><th>Request</th><th>Your Bid</th><th>Status</th><th>Submitted</th></tr></thead>
          <tbody>
            {myBids.map((b, i) => (
              <tr key={b._id || i}>
                <td style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>{b.job_id?.title || 'Request'}</td>
                <td style={{ color: "var(--accent)", fontWeight: 700 }}>${b.amount.toLocaleString()}</td>
                <td><span className={`status-pill ${mapStatusPill(b.status)}`}>{b.status}</span></td>
                <td style={{ color: "var(--muted)" }}>{new Date(b.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {myBids.length === 0 && (
              <tr>
                <td colSpan="4" style={{ color: 'var(--muted)' }}>No bids submitted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {dashTab === 'transactions' && (
        <div className="empty">
          <div className="empty-icon"><CreditCard size={44} /></div>
          <h3>{myListings.filter((j) => j.status === 'closed' || j.status === 'completed').length} closed/completed requests</h3>
          <p>Transactions and escrow records will appear here as payment flow is connected.</p>
        </div>
      )}
    </div>
  )
}
