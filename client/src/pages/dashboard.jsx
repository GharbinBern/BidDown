import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../api'
import { useAuthStore, usePreferencesStore } from '../store'

function statusLabel(status) {
  if (status === 'accepted') return 'leading'
  if (status === 'rejected' || status === 'withdrawn') return 'closed'
  return 'active'
}

function formatClose(deadline) {
  if (!deadline) return 'N/A'
  const ms = new Date(deadline).getTime() - Date.now()
  if (Number.isNaN(ms)) return 'N/A'
  if (ms <= 0) return 'Ended'
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h < 24) return `${h}h ${m}m`
  const d = Math.floor(h / 24)
  const rh = h % 24
  return `${d}d ${rh}h`
}

function initials(name = 'U') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function normalizeJob(jobRef) {
  if (!jobRef) return null
  if (typeof jobRef === 'object') return jobRef
  return { _id: String(jobRef), title: 'Job', budget: 0 }
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { activeRole, setActiveRole } = usePreferencesStore()

  const [jobs, setJobs] = useState([])
  const [myBids, setMyBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [openRes, closedRes, completedRes, bidsRes] = await Promise.all([
          api.getJobs({ status: 'open', limit: 100 }),
          api.getJobs({ status: 'closed', limit: 100 }),
          api.getJobs({ status: 'completed', limit: 100 }),
          api.getMyBids(),
        ])

        setJobs([...(openRes.data.jobs || []), ...(closedRes.data.jobs || []), ...(completedRes.data.jobs || [])])
        setMyBids(bidsRes.data || [])
      } catch (err) {
        toast.error(err?.response?.data?.error || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const roles = user?.roles || []
  const isBuyer = roles.includes('buyer')
  const isSeller = roles.includes('seller')
  const roleMode = isBuyer && isSeller ? activeRole : (isSeller ? 'seller' : 'buyer')

  useEffect(() => {
    if (isBuyer && isSeller) return
    const nextRole = isSeller ? 'seller' : 'buyer'
    if (activeRole !== nextRole) setActiveRole(nextRole)
  }, [activeRole, isBuyer, isSeller, setActiveRole])

  const userId = user?._id || user?.id

  const myRequests = useMemo(
    () => jobs.filter((j) => String(j.owner_id?._id || j.owner_id) === String(userId)),
    [jobs, userId]
  )

  const myActiveBids = useMemo(() => {
    const pending = myBids.filter((b) => b.status === 'pending')
    return pending
      .map((b, idx) => {
        const job = normalizeJob(b.job_id)
        return {
          bid: b,
          job,
          rank: idx + 1,
        }
      })
      .slice(0, 3)
  }, [myBids])

  const acceptedBids = useMemo(
    () => myBids.filter((b) => b.status === 'accepted').map((b) => ({ bid: b, job: normalizeJob(b.job_id) })),
    [myBids]
  )

  const inProgress = useMemo(
    () => acceptedBids.filter(({ job }) => !['completed', 'closed'].includes(job?.status)).slice(0, 1),
    [acceptedBids]
  )

  const bidCategorySet = useMemo(() => {
    const set = new Set()
    myBids.forEach((b) => {
      const job = normalizeJob(b.job_id)
      if (job?.category) set.add(job.category)
    })
    return set
  }, [myBids])

  const matchingJobs = useMemo(() => {
    const alreadyBidJobIds = new Set(myBids.map((b) => String(normalizeJob(b.job_id)?._id || '')))
    return jobs
      .filter((j) => j.status === 'open')
      .filter((j) => String(j.owner_id?._id || j.owner_id) !== String(userId))
      .filter((j) => !alreadyBidJobIds.has(String(j._id)))
      .map((j) => {
        const catScore = bidCategorySet.has(j.category) ? 18 : 0
        const ratingScore = Number(j.owner_id?.average_rating || 0) * 2
        const bidCountScore = Math.max(0, 12 - Number(j.bids_count || 0) * 2)
        const score = Math.min(98, Math.max(70, Math.round(68 + catScore + ratingScore + bidCountScore)))
        return { ...j, matchScore: score }
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3)
  }, [bidCategorySet, jobs, myBids, userId])

  const thisMonthEarnings = useMemo(() => {
    const month = new Date().getMonth()
    const year = new Date().getFullYear()
    return acceptedBids.reduce((sum, { bid }) => {
      const dt = new Date(bid.accepted_date || bid.updatedAt || bid.createdAt)
      if (dt.getMonth() !== month || dt.getFullYear() !== year) return sum
      return sum + Number(bid.amount || 0)
    }, 0)
  }, [acceptedBids])

  const inEscrow = useMemo(
    () => inProgress.reduce((sum, item) => sum + Number(item.bid.amount || 0), 0),
    [inProgress]
  )

  const allTimeEarned = useMemo(
    () => acceptedBids.reduce((sum, item) => sum + Number(item.bid.amount || 0), 0),
    [acceptedBids]
  )

  const platformFee = Math.round(allTimeEarned * 0.08)
  const netPaidOut = allTimeEarned - platformFee

  const avgRating = Number(user?.average_rating || 4.9).toFixed(1)
  const totalReviews = user?.reviews_count || 0
  const winRate = myBids.length ? Math.round((acceptedBids.length / myBids.length) * 100) : 0

  const topMessage = roleMode === 'seller'
    ? `Good morning, ${user?.name?.split(' ')[0] || 'there'} — you have ${myActiveBids.length} active bids and ${inProgress.length} job in progress.`
    : `Good morning, ${user?.name?.split(' ')[0] || 'there'} — you have ${myRequests.filter((j) => j.status === 'open').length} active requests.`

  if (loading) {
    return <div className="main" style={{ paddingTop: 20, color: 'var(--muted)' }}>Loading dashboard…</div>
  }

  return (
    <div className="main dd-shell">
      <div className="dd-banner">
        <div className="dd-banner-copy">{topMessage}</div>
        {isBuyer && isSeller && (
          <div className="dd-view-toggle">
            <button
              type="button"
              className={`dd-toggle-btn ${roleMode === 'buyer' ? 'active' : ''}`}
              onClick={() => setActiveRole('buyer')}
            >
              Client view
            </button>
            <button
              type="button"
              className={`dd-toggle-btn ${roleMode === 'seller' ? 'active' : ''}`}
              onClick={() => setActiveRole('seller')}
            >
              Provider view
            </button>
          </div>
        )}
      </div>

      <div className="dd-layout">
        <aside className="dd-nav-card">
          <div className="dd-nav-group">
            <div className="dd-nav-head">Overview</div>
            <button className="dd-nav-item active" type="button">Dashboard</button>
            <button className="dd-nav-item" type="button" onClick={() => navigate('/profile')}>My Profile</button>
          </div>
          <div className="dd-nav-group">
            <div className="dd-nav-head">Bidding</div>
            <button className="dd-nav-item" type="button" onClick={() => navigate('/browse')}>Active Bids <span>{myActiveBids.length}</span></button>
            <button className="dd-nav-item" type="button">Bid History</button>
            <button className="dd-nav-item" type="button" onClick={() => navigate('/browse')}>Matching Jobs <span>{matchingJobs.length}</span></button>
          </div>
          <div className="dd-nav-group">
            <div className="dd-nav-head">Work</div>
            <button className="dd-nav-item" type="button">In Progress <span>{inProgress.length}</span></button>
            <button className="dd-nav-item" type="button">Completed Jobs</button>
            <button className="dd-nav-item" type="button">Disputes</button>
          </div>
          <div className="dd-nav-group">
            <div className="dd-nav-head">Account</div>
            <button className="dd-nav-item" type="button">Earnings</button>
            <button className="dd-nav-item" type="button">Verification</button>
            <button className="dd-nav-item" type="button" onClick={() => navigate('/profile')}>Settings</button>
          </div>
        </aside>

        <section className="dd-main">
          <div className="dd-kpi-grid">
            <article className="dd-kpi">
              <div className="dd-kpi-label">This month</div>
              <div className="dd-kpi-value green">GH¢ {thisMonthEarnings.toLocaleString()}</div>
              <div className="dd-kpi-sub">↑ 22% vs last month</div>
            </article>
            <article className="dd-kpi">
              <div className="dd-kpi-label">Active bids</div>
              <div className="dd-kpi-value blue">{myActiveBids.length}</div>
              <div className="dd-kpi-sub">Across open auctions</div>
            </article>
            <article className="dd-kpi">
              <div className="dd-kpi-label">Avg. rating</div>
              <div className="dd-kpi-value">★ {avgRating}</div>
              <div className="dd-kpi-sub">From {totalReviews} reviews</div>
            </article>
            <article className="dd-kpi">
              <div className="dd-kpi-label">Win rate</div>
              <div className="dd-kpi-value">{winRate}%</div>
              <div className="dd-kpi-sub">{acceptedBids.length} of {myBids.length} bids accepted</div>
            </article>
          </div>

          <article className="dd-panel">
            <header className="dd-panel-head">
              <h3>Your active bids ({myActiveBids.length})</h3>
              <button type="button" className="dd-link" onClick={() => navigate('/browse')}>View all →</button>
            </header>
            <div className="dd-list">
              {myActiveBids.length === 0 && <div className="dd-empty">No active bids right now.</div>}
              {myActiveBids.map(({ bid, job, rank }) => (
                <div key={bid._id} className="dd-row">
                  <div className="dd-rank">{rank}<span>Rank</span></div>
                  <div className="dd-job">
                    <div className="dd-job-cat">{job?.category || 'General'} · {job?.subcategory || 'Service'}</div>
                    <div className="dd-job-title">{job?.title || 'Job'}</div>
                    <div className="dd-job-meta">{job?.intake_details?.location || 'Accra'} · Closes in <strong>{formatClose(job?.deadline)}</strong> · {(job?.bids_count || 0)} bids total</div>
                  </div>
                  <div className="dd-amount">GH¢ {Number(bid.amount || 0).toLocaleString()}<small>Your bid · {statusLabel(bid.status)}</small></div>
                  <div className="dd-actions">
                    <button type="button" className="dd-btn" onClick={() => navigate(`/jobs/${job?._id || bid.job_id}`)}>View job</button>
                    <button type="button" className="dd-btn" onClick={() => navigate(`/jobs/${job?._id || bid.job_id}`)}>Edit bid</button>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="dd-panel">
            <header className="dd-panel-head">
              <h3>Job in progress ({inProgress.length})</h3>
            </header>
            <div className="dd-list">
              {inProgress.length === 0 && <div className="dd-empty">No active work in progress.</div>}
              {inProgress.map(({ bid, job }) => (
                <div key={bid._id} className="dd-row in-progress">
                  <div className="dd-job">
                    <div className="dd-job-cat">{job?.category || 'Service'} · In progress</div>
                    <div className="dd-job-title">{job?.title || 'Job'}</div>
                    <div className="dd-job-meta">Accepted bid: <strong>GH¢ {Number(bid.amount || 0).toLocaleString()}</strong> · Client: {job?.owner_id?.name || 'Client'}</div>
                    <div className="dd-progress"><span style={{ width: '58%' }} /> <em>In progress</em></div>
                  </div>
                  <div className="dd-actions">
                    <button type="button" className="dd-btn" onClick={() => navigate(`/jobs/${job?._id || bid.job_id}`)}>Mark complete</button>
                    <button type="button" className="dd-btn" onClick={() => navigate(`/jobs/${job?._id || bid.job_id}`)}>Message client</button>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="dd-panel">
            <header className="dd-panel-head">
              <h3>Matching jobs for you ({matchingJobs.length})</h3>
              <button type="button" className="dd-link" onClick={() => navigate('/browse')}>Browse all →</button>
            </header>
            <div className="dd-list">
              {matchingJobs.length === 0 && <div className="dd-empty">No suggested jobs yet. Check Browse Requests.</div>}
              {matchingJobs.map((job) => (
                <div key={job._id} className="dd-row">
                  <div className="dd-job">
                    <div className="dd-match">{job.matchScore}% match</div>
                    <div className="dd-job-title">{job.title}</div>
                    <div className="dd-job-meta">GH¢ {Number(job.budget || 0).toLocaleString()} ceiling · {job.bids_count || 0} bids · Closes in {formatClose(job.deadline)}</div>
                  </div>
                  <div className="dd-actions">
                    <button type="button" className="dd-btn" onClick={() => navigate(`/jobs/${job._id}`)}>Bid now →</button>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="dd-panel">
            <header className="dd-panel-head">
              <h3>Earnings — last 6 months</h3>
            </header>
            <div className="dd-earnings-grid">
              <div className="dd-earn-left">
                <div className="dd-kpi-label">This month</div>
                <div className="dd-earn-big">GH¢ {thisMonthEarnings.toLocaleString()}</div>
                <div className="dd-mini-bars">
                  <span />
                  <span className="on" />
                  <span />
                  <span className="on" />
                  <span />
                  <span className="deep" />
                </div>
              </div>
              <div className="dd-earn-right">
                <div className="dd-kpi-label">In escrow (pending release)</div>
                <div className="dd-earn-big">GH¢ {inEscrow.toLocaleString()}</div>
                <div className="dd-earn-row"><span>All-time earned</span><strong>GH¢ {allTimeEarned.toLocaleString()}</strong></div>
                <div className="dd-earn-row"><span>Platform fee (8%)</span><strong className="red">− GH¢ {platformFee.toLocaleString()}</strong></div>
                <div className="dd-earn-row"><span>Net paid out</span><strong className="green">GH¢ {netPaidOut.toLocaleString()}</strong></div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  )
}
