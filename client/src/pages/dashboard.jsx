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
  const { user, setUser } = useAuthStore()
  const { activeRole, setActiveRole } = usePreferencesStore()

  const [jobs, setJobs] = useState([])
  const [myBids, setMyBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [allJobsRes, bidsRes, meRes] = await Promise.all([
          api.getJobs({ status: 'all', limit: 300 }),
          api.getMyBids(),
          api.getMe(),
        ])

        setJobs(allJobsRes.data.jobs || [])
        setMyBids(bidsRes.data || [])
        if (meRes.data) setUser(meRes.data)
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
    const pending = myBids.filter((b) => {
      if (b.status !== 'pending') return false
      const job = normalizeJob(b.job_id)
      if (!job) return false
      if (job.status && job.status !== 'open') return false

      const deadlineMs = job.deadline ? new Date(job.deadline).getTime() : null
      if (deadlineMs && !Number.isNaN(deadlineMs) && deadlineMs <= Date.now()) return false

      return true
    })

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
    () => acceptedBids.filter(({ job }) => !['completed', 'cancelled'].includes(job?.status)),
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

  // Buyer-specific metrics
  const buyerPostsOpen = useMemo(
    () => myRequests.filter((j) => j.status === 'open').length,
    [myRequests]
  )

  const buyerPostsClosed = useMemo(
    () => myRequests.filter((j) => j.status === 'closed' && !j.winning_bid_id).length,
    [myRequests]
  )

  const buyerOpenJobs = useMemo(
    () => myRequests.filter((j) => j.status === 'open'),
    [myRequests]
  )

  const buyerAwaitingAwardJobs = useMemo(
    () => myRequests.filter((j) => j.status === 'closed' && !j.winning_bid_id),
    [myRequests]
  )

  const buyerActiveContracts = useMemo(
    () => myRequests.filter((j) => j.winning_bid_id && !['completed', 'cancelled'].includes(j.status)),
    [myRequests]
  )

  const buyerCompletedJobs = useMemo(
    () => myRequests.filter((j) => j.status === 'completed').length,
    [myRequests]
  )

  const totalBidsCost = useMemo(() => {
    return myRequests
      .filter((j) => j.winning_bid_id)
      .reduce((sum, j) => sum + Number(j.escrow_amount || 0), 0)
  }, [myRequests])

  const totalSpent = useMemo(() => {
    return myRequests
      .filter((j) => j.escrow_released)
      .reduce((sum, j) => sum + Number(j.escrow_amount || 0), 0)
  }, [myRequests])

  const totalDisputes = useMemo(
    () => myRequests.filter((j) => j.dispute_raised).length,
    [myRequests]
  )

  const platformFee = Math.round(allTimeEarned * 0.08)
  const netPaidOut = allTimeEarned - platformFee

  const avgRating = Number(user?.average_rating ?? 0).toFixed(1)
  const totalReviews = user?.reviews_count || 0
  const winRate = myBids.length ? Math.round((acceptedBids.length / myBids.length) * 100) : 0

  const firstName = user?.name?.split(' ')[0] || 'there'
  const topMessage = roleMode === 'seller'
    ? `Welcome back, ${firstName}. You have ${myActiveBids.length} active bid${myActiveBids.length !== 1 ? 's' : ''} and ${inProgress.length} job${inProgress.length !== 1 ? 's' : ''} in progress.`
    : `Welcome back, ${firstName}. You have ${buyerPostsOpen} open auction${buyerPostsOpen !== 1 ? 's' : ''}, ${buyerPostsClosed} awaiting award, and ${buyerActiveContracts.length} active contract${buyerActiveContracts.length !== 1 ? 's' : ''}.`

  if (loading) {
    return <div className="main" style={{ paddingTop: 20, color: 'var(--muted)' }}>Loading dashboard…</div>
  }

  return (
    <div className="main dd-shell">
      <div className="dd-layout">
        <aside className="dd-nav-card">
          <div className="dd-nav-group">
            <div className="dd-nav-head">Overview</div>
            <button className="dd-nav-item active" type="button">Dashboard</button>
            <button className="dd-nav-item" type="button" onClick={() => navigate('/profile')}>My Profile</button>
          </div>

          {roleMode === 'seller' ? (
            <>
              <div className="dd-nav-group">
                <div className="dd-nav-head">Bidding</div>
                <div className="dd-nav-item">Active Bids <span>{myActiveBids.length}</span></div>
                <div className="dd-nav-item">Bid History</div>
                <div className="dd-nav-item">Matching Jobs <span>{matchingJobs.length}</span></div>
              </div>
              <div className="dd-nav-group">
                <div className="dd-nav-head">Work</div>
                <div className="dd-nav-item">In Progress <span>{inProgress.length}</span></div>
                <div className="dd-nav-item">Completed Jobs</div>
                <div className="dd-nav-item">Disputes</div>
              </div>
              <div className="dd-nav-group">
                <div className="dd-nav-head">Account</div>
                <button className="dd-nav-item" type="button">Earnings</button>
                <button className="dd-nav-item" type="button">Verification</button>
                <button className="dd-nav-item" type="button" onClick={() => navigate('/profile')}>Settings</button>
              </div>
            </>
          ) : (
            <>
              <div className="dd-nav-group">
                <div className="dd-nav-head">Hiring</div>
                <button className="dd-nav-item" type="button" onClick={() => navigate('/post-job')}>Post New Job</button>
                <button className="dd-nav-item" type="button">Posted Jobs <span>{myRequests.length}</span></button>
                <button className="dd-nav-item" type="button">Open Auctions <span>{buyerPostsOpen}</span></button>
                <button className="dd-nav-item" type="button">Awaiting Award <span>{buyerPostsClosed}</span></button>
              </div>
              <div className="dd-nav-group">
                <div className="dd-nav-head">Work</div>
                <button className="dd-nav-item" type="button">In Progress <span>{buyerActiveContracts.length}</span></button>
                <button className="dd-nav-item" type="button">Completed <span>{buyerCompletedJobs}</span></button>
                <button className="dd-nav-item" type="button">Disputes <span>{totalDisputes}</span></button>
              </div>
              <div className="dd-nav-group">
                <div className="dd-nav-head">Account</div>
                <button className="dd-nav-item" type="button">Payments</button>
                <button className="dd-nav-item" type="button" onClick={() => navigate('/profile')}>Settings</button>
              </div>
            </>
          )}
        </aside>

        <section className="dd-main">
          {roleMode === 'seller' ? (
            <>
              <div className="dd-kpi-grid">
                <article className="dd-kpi">
                  <div className="dd-kpi-label">This month</div>
                  <div className="dd-kpi-value green">GH¢ {thisMonthEarnings.toLocaleString()}</div>
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
                  <button type="button" className="dd-link" onClick={() => navigate('/browse')}>View all</button>
                </header>
                <div className="dd-list">
                  {myActiveBids.length === 0 && <div className="dd-empty">No active bids. Browse open jobs to find work matching your skills.</div>}
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
                  {inProgress.length === 0 && <div className="dd-empty">No work in progress. Win a bid and your active jobs will appear here.</div>}
                  {inProgress.map(({ bid, job }) => (
                    <div key={bid._id} className="dd-row in-progress">
                      <div className="dd-job">
                        <div className="dd-job-cat">{job?.category || 'Service'} · In progress</div>
                        <div className="dd-job-title">{job?.title || 'Job'}</div>
                        <div className="dd-job-meta">Accepted bid: <strong>GH¢ {Number(bid.amount || 0).toLocaleString()}</strong></div>
                        <div className="dd-progress"><span style={{ width: '58%' }} /> <em>In progress</em></div>
                      </div>
                      <div className="dd-actions">
                        <button type="button" className="dd-btn" onClick={() => navigate(`/jobs/${job?._id || bid.job_id}`)}>View job</button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="dd-panel">
                <header className="dd-panel-head">
                  <h3>Matching jobs for you ({matchingJobs.length})</h3>
                  <button type="button" className="dd-link" onClick={() => navigate('/browse')}>Browse all</button>
                </header>
                <div className="dd-list">
                  {matchingJobs.length === 0 && <div className="dd-empty">No job matches right now. Check Browse Requests for all open jobs.</div>}
                  {matchingJobs.map((job) => (
                    <div key={job._id} className="dd-row">
                      <div className="dd-job">
                        <div className="dd-match">{job.matchScore}% match</div>
                        <div className="dd-job-title">{job.title}</div>
                        <div className="dd-job-meta">GH¢ {Number(job.budget || 0).toLocaleString()} ceiling · {job.bids_count || 0} bids · Closes in {formatClose(job.deadline)}</div>
                      </div>
                      <div className="dd-actions">
                        <button type="button" className="dd-btn" onClick={() => navigate(`/jobs/${job._id}`)}>Bid now</button>
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
            </>
          ) : (
            <>
              <div className="dd-kpi-grid">
                <article className="dd-kpi">
                  <div className="dd-kpi-label">Posted Jobs</div>
                  <div className="dd-kpi-value blue">{myRequests.length}</div>
                  <div className="dd-kpi-sub">Total projects</div>
                </article>
                <article className="dd-kpi">
                  <div className="dd-kpi-label">Open Auctions</div>
                  <div className="dd-kpi-value">{buyerPostsOpen}</div>
                  <div className="dd-kpi-sub">Still accepting bids</div>
                </article>
                <article className="dd-kpi">
                  <div className="dd-kpi-label">In Progress</div>
                  <div className="dd-kpi-value green">{buyerActiveContracts.length}</div>
                  <div className="dd-kpi-sub">Active contracts</div>
                </article>
                <article className="dd-kpi">
                  <div className="dd-kpi-label">Total Spent</div>
                  <div className="dd-kpi-value">GH¢ {totalSpent.toLocaleString()}</div>
                  <div className="dd-kpi-sub">Completed work</div>
                </article>
              </div>

              <article className="dd-panel">
                <header className="dd-panel-head">
                  <h3>Open auctions ({buyerPostsOpen})</h3>
                  <button type="button" className="dd-link" onClick={() => navigate('/post-job')}>Post new</button>
                </header>
                <div className="dd-list">
                  {buyerPostsOpen === 0 && <div className="dd-empty">No open auctions. Post a job and providers will start bidding within minutes.</div>}
                  {buyerOpenJobs.map((job) => (
                    <div key={job._id} className="dd-row">
                      <div className="dd-job">
                        <div className="dd-job-cat">{job.category || 'General'} · Open</div>
                        <div className="dd-job-title">{job.title}</div>
                        <div className="dd-job-meta">GH¢ {Number(job.budget || 0).toLocaleString()} budget · {job.bids_count || 0} bids · Closes in {formatClose(job.deadline)}</div>
                      </div>
                      <div className="dd-actions">
                        <button type="button" className="dd-btn" onClick={() => navigate(`/jobs/${job._id}`)}>View</button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="dd-panel">
                <header className="dd-panel-head">
                  <h3>Awaiting award ({buyerPostsClosed})</h3>
                </header>
                <div className="dd-list">
                  {buyerPostsClosed === 0 && <div className="dd-empty">No jobs awaiting award. Once an auction closes, you will pick a winner here.</div>}
                  {buyerAwaitingAwardJobs.map((job) => (
                    <div key={job._id} className="dd-row">
                      <div className="dd-job">
                        <div className="dd-job-cat">{job.category || 'General'} · Closed</div>
                        <div className="dd-job-title">{job.title}</div>
                        <div className="dd-job-meta">GH¢ {Number(job.budget || 0).toLocaleString()} budget · {job.bids_count || 0} bids · Closed</div>
                      </div>
                      <div className="dd-actions">
                        <button type="button" className="dd-btn" onClick={() => navigate(`/jobs/${job._id}`)}>Award</button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="dd-panel">
                <header className="dd-panel-head">
                  <h3>In progress ({buyerActiveContracts.length})</h3>
                </header>
                <div className="dd-list">
                  {buyerActiveContracts.length === 0 && <div className="dd-empty">No active contracts. Award a job to get work started.</div>}
                  {buyerActiveContracts.map((job) => {
                    const winner = job.winning_bid_id || {}
                    return (
                      <div key={job._id} className="dd-row in-progress">
                        <div className="dd-job">
                          <div className="dd-job-cat">{job.category || 'Service'}</div>
                          <div className="dd-job-title">{job.title}</div>
                          <div className="dd-job-meta red">GH¢ {Number(job.escrow_amount || 0).toLocaleString()}</div>
                          <div className="dd-progress"><span style={{ width: '58%' }} /> <em>{job.workflow_stage || 'In progress'}</em></div>
                        </div>
                        <div className="dd-actions">
                          <button type="button" className="dd-btn" onClick={() => navigate(`/jobs/${job._id}`)}>View details</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </article>

              <article className="dd-panel">
                <header className="dd-panel-head">
                  <h3>Payments & Escrow</h3>
                </header>
                <div className="dd-earnings-grid">
                  <div className="dd-earn-left">
                    <div className="dd-kpi-label">Total Budget</div>
                    <div className="dd-earn-big">GH¢ {myRequests.reduce((sum, j) => sum + Number(j.budget || 0), 0).toLocaleString()}</div>
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
                    <div className="dd-kpi-label">In escrow (pending work)</div>
                    <div className="dd-earn-big">GH¢ {totalBidsCost.toLocaleString()}</div>
                    <div className="dd-earn-row"><span>Total spent (released)</span><strong className="green">GH¢ {totalSpent.toLocaleString()}</strong></div>
                    <div className="dd-earn-row"><span>Completed jobs</span><strong>{buyerCompletedJobs}</strong></div>
                    <div className="dd-earn-row"><span>Disputes</span><strong className="red">{totalDisputes}</strong></div>
                  </div>
                </div>
              </article>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
