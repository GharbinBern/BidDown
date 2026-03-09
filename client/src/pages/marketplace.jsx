import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Clock3, Search, Star, Tag, X } from 'lucide-react'
import CustomDropdown from '../components/CustomDropdown'
import { useAuthStore, useBidsStore, useJobsStore, usePreferencesStore } from '../store'

const CATEGORIES = ["All", "Design", "Development", "Marketing", "Writing", "Legal", "Consulting", "Other"]
const FILTER_OPTIONS = CATEGORIES.map((category) => ({
  value: category,
  label: category,
}))
const REQUEST_CATEGORIES = CATEGORIES.slice(1)
const REQUEST_CATEGORY_OPTIONS = REQUEST_CATEGORIES.map((category) => ({
  value: category,
  label: category,
}))
const SORT_OPTIONS = [
  { value: 'endingSoon', label: 'Ending Soon' },
  { value: 'newest', label: 'Newest' },
  { value: 'mostBids', label: 'Most Bids' },
  { value: 'budgetHigh', label: 'Budget: High To Low' },
  { value: 'budgetLow', label: 'Budget: Low To High' },
]

function formatRecordTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Timer({ hours }) {
  const safeHours = Math.max(0, Number(hours) || 0)
  if (safeHours === 0) {
    return <span className="timer low"><span className="timer-dot" />Ended</span>
  }
  const isHoursUnit = safeHours < 24
  const daysLeft = Math.ceil(safeHours / 24)
  const label = isHoursUnit
    ? `${safeHours}h left`
    : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`

  return <span className={`timer ${isHoursUnit && safeHours <= 12 ? "low" : ""}`}><span className="timer-dot" />{label}</span>
}

function ListingModal({ listing, onClose, onBid, onAcceptBid, user, myBids }) {
  if (!listing) return null
  const [showBidForm, setShowBidForm] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [bidNote, setBidNote] = useState('')
  const [formError, setFormError] = useState('')
  const userId = user?._id || user?.id
  const roles = user?.roles || []
  const isOwner = !!userId && String(listing.owner_id?._id || listing.owner_id) === String(userId)
  const isSeller = roles.includes('seller')
  const existingBid = !!userId ? myBids.find((b) => {
    const jobId = b.job_id?._id || b.job_id
    return String(jobId) === String(listing._id)
  }) : null
  const hasExistingBid = !!existingBid
  const canSubmitBid = isSeller && !isOwner && !hasExistingBid
  const canAcceptBid = isOwner && listing.status === 'open'
  const existingBidStatus = existingBid?.status
  
  const sortedBids = [...(listing.bids || [])].sort((a, b) => a.amount - b.amount)

  const handleBidSubmit = () => {
    if (hasExistingBid) {
      setFormError('You already submitted a bid for this request.')
      return
    }

    const parsedAmount = Number(bidAmount)
    if (!parsedAmount || parsedAmount < 50) {
      setFormError('Bid must be at least $50.')
      return
    }
    if (parsedAmount > listing.budget) {
      setFormError('Bid cannot be above the budget cap.')
      return
    }

    setFormError('')
    onBid({ amount: parsedAmount, note: bidNote.trim() })
    setShowBidForm(false)
    setBidAmount('')
    setBidNote('')
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{listing.title}</div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="info-row"><span className="info-label">Category</span><span className="listing-category">{listing.category}</span></div>
        <div className="info-row"><span className="info-label">Budget Cap</span><span style={{ color: "var(--accent)", fontWeight: 700, fontFamily: "'Syne',sans-serif", fontSize: 18 }}>${listing.budget.toLocaleString()}</span></div>
        <div className="info-row"><span className="info-label">Time Remaining</span><Timer hours={listing.hoursLeft} /></div>
        <div className="info-row"><span className="info-label">Total Bids</span><span>{listing.bids_count || 0}</span></div>
        <div style={{ margin: "16px 0", color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>{listing.desc}</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 12, textAlign: isOwner ? 'left' : 'center' }}>
          {isOwner ? "All Bids — Ranked Lowest First" : "Bids are sealed to non-owners"}
        </div>
        {isOwner ? (
          <div className="bid-list">
            {sortedBids.map((b, i) => (
              <div key={b._id || i} className={`bid-item ${i === 0 ? "winner" : ""}`}>
                <div className="bid-seller" style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span>{b.seller_id?.name || 'Seller'}</span>
                    {i === 0 && (
                      <span style={{ color: "var(--green)", fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Star size={12} strokeWidth={2} fill="currentColor" style={{ width: 12, height: 12, flex: '0 0 12px' }} /> LOWEST BID
                      </span>
                    )}
                  </div>
                  <small style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', lineHeight: 1.4 }}>
                    <Star size={12} strokeWidth={2} fill="currentColor" style={{ width: 12, height: 12, flex: '0 0 12px' }} />
                    <span>{b.seller_id?.average_rating || 5}</span>
                    <span>•</span>
                    <span>{b.note || 'No note'}</span>
                  </small>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 'auto', flexShrink: 0 }}>
                  <div className={`bid-amount ${i === 0 ? "lowest" : ""}`}>${b.amount.toLocaleString()}</div>
                  {canAcceptBid && b.status === 'pending' && (
                    <button type="button" className="btn btn-success btn-sm" onClick={() => onAcceptBid(b._id)}>Accept</button>
                  )}
                </div>
              </div>
            ))}
            {sortedBids.length === 0 && (
              <div className="card" style={{ marginBottom: 12, color: 'var(--muted)', fontSize: 13 }}>
                No bids yet for this request.
              </div>
            )}
          </div>
        ) : null}
        {showBidForm && canSubmitBid && (
          <div className="card" style={{ marginTop: 16, marginBottom: 12 }}>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Your Bid Amount (USD)</label>
              <input
                className="form-input"
                type="number"
                min="50"
                max={listing.budget}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Max $${listing.budget}`}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label">Note (optional)</label>
              <textarea
                className="form-textarea"
                value={bidNote}
                onChange={(e) => setBidNote(e.target.value)}
                placeholder="Timeline, deliverables, and assumptions"
              />
            </div>
            {formError && <div style={{ color: 'var(--accent2)', fontSize: 13 }}>{formError}</div>}
          </div>
        )}

        {hasExistingBid && !isOwner && (
          <div className="card" style={{ marginTop: 16, marginBottom: 12 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
              Your Submitted Bid
            </div>
            <div className="info-row"><span className="info-label">Amount</span><span style={{ color: 'var(--accent)', fontWeight: 700 }}>${Number(existingBid.amount).toLocaleString()}</span></div>
            <div className="info-row"><span className="info-label">Status</span><span className={`status-pill ${existingBid.status === 'accepted' ? 'status-closed' : existingBid.status === 'rejected' ? 'status-pending' : 'status-open'}`}>{existingBid.status}</span></div>
            <div className="info-row"><span className="info-label">Submitted</span><span>{formatRecordTime(existingBid.createdAt)}</span></div>
            <div style={{ marginTop: 10, color: 'var(--muted)', fontSize: 13 }}>{existingBid.note || 'No note was included with your bid.'}</div>
            {existingBidStatus === 'accepted' && (
              <div style={{ marginTop: 10, color: 'var(--green)', fontSize: 12 }}>
                You won this request. Next step: coordinate delivery details with the buyer.
              </div>
            )}
            {existingBidStatus === 'rejected' && (
              <div style={{ marginTop: 10, color: 'var(--accent2)', fontSize: 12 }}>
                Another seller was selected for this request.
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {canSubmitBid ? (
            showBidForm ? (
              <>
                <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleBidSubmit}>Place Bid</button>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowBidForm(false); setFormError('') }}>Cancel</button>
              </>
            ) : (
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setShowBidForm(true)}>Submit a Bid</button>
            )
          ) : hasExistingBid && !isOwner ? (
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} disabled>
              {`Bid Submitted: $${Number(existingBid.amount).toLocaleString()} (${existingBid.status})`}
            </button>
          ) : null}
          <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { jobs, loading, fetchJobs, selectedJob, fetchJob, closeJob, createJob } = useJobsStore()
  const { submitBid, fetchMyBids, myBids } = useBidsStore()
  const requestOrderMode = usePreferencesStore((state) => state.requestOrderMode)
  const marketViewMode = usePreferencesStore((state) => state.marketViewMode)
  const setMarketViewMode = usePreferencesStore((state) => state.setMarketViewMode)
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [catFilter, setCatFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState('endingSoon')
  const bidStatusCacheRef = useRef({})
  const [showPostForm, setShowPostForm] = useState(false)
  const [posting, setPosting] = useState(false)
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: 'Design',
    budget: '',
    daysUntilDeadline: 7,
  })

  const roles = user?.roles || []
  const canPostRequest = roles.includes('buyer')

  useEffect(() => {
    fetchJobs({ status: 'open', limit: 100 }).catch((error) => {
      toast.error(error.response?.data?.error || 'Failed to load requests')
    })
  }, [fetchJobs])

  useEffect(() => {
    const jobIdFromQuery = searchParams.get('jobId')
    if (!jobIdFromQuery || loading) return

    const existsInOpenListings = jobs.some((job) => String(job._id) === String(jobIdFromQuery))
    if (existsInOpenListings) {
      openListing(jobIdFromQuery)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, jobs, loading])

  useEffect(() => {
    if (user) {
      fetchMyBids().catch(() => {})
    }
  }, [user, fetchMyBids])

  useEffect(() => {
    if (!myBids.length) return

    const previous = bidStatusCacheRef.current
    const next = {}

    myBids.forEach((bid) => {
      const key = bid._id
      const prevStatus = previous[key]
      const currentStatus = bid.status
      next[key] = currentStatus

      if (prevStatus && prevStatus !== currentStatus) {
        const title = bid.job_id?.title || 'a request'
        if (currentStatus === 'accepted') {
          toast.success(`Your bid was accepted for ${title}.`)
        }
        if (currentStatus === 'rejected') {
          toast.error(`Your bid was not selected for ${title}.`)
        }
      }
    })

    bidStatusCacheRef.current = next
  }, [myBids])

  const listings = useMemo(() => jobs.map((job) => {
    const deadline = new Date(job.deadline)
    const deadlineMs = deadline.getTime()
    const hoursLeft = Math.max(0, Math.ceil((deadlineMs - Date.now()) / (1000 * 60 * 60)))
    const isExpired = Number.isFinite(deadlineMs) ? deadlineMs < Date.now() : false
    return {
      ...job,
      hoursLeft,
      isExpired,
      urgent: hoursLeft <= 12,
      desc: job.description,
    }
  }), [jobs])

  const filtered = useMemo(() => {
    const userId = String(user?._id || user?.id || '')

    const searched = listings.filter((l) =>
      !l.isExpired &&
      (catFilter === "All" || l.category === catFilter) &&
      (l.title.toLowerCase().includes(search.toLowerCase()) || l.desc.toLowerCase().includes(search.toLowerCase()))
    )

    const withMeta = searched.map((listing) => {
      const ownerId = String(listing.owner_id?._id || listing.owner_id || '')
      const isMine = userId && ownerId === userId
      const createdAtMs = listing.createdAt ? new Date(listing.createdAt).getTime() : 0
      const isFresh = createdAtMs > 0 && Date.now() - createdAtMs <= 24 * 60 * 60 * 1000
      return {
        ...listing,
        isMine,
        isFresh,
        hasHighActivity: Number(listing.bids_count || 0) >= 5,
      }
    })

    const sorted = [...withMeta].sort((a, b) => {
      if (requestOrderMode === 'mine-first' && a.isMine !== b.isMine) return a.isMine ? -1 : 1

      switch (sortBy) {
        case 'budgetHigh':
          return Number(b.budget || 0) - Number(a.budget || 0)
        case 'budgetLow':
          return Number(a.budget || 0) - Number(b.budget || 0)
        case 'mostBids':
          return Number(b.bids_count || 0) - Number(a.bids_count || 0)
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        case 'endingSoon':
        default:
          return Number(a.hoursLeft || 0) - Number(b.hoursLeft || 0)
      }
    })

    return sorted
  }, [listings, catFilter, search, sortBy, requestOrderMode, user])

  const selectedListing = selectedJob && selectedJobId === selectedJob._id
    ? {
        ...selectedJob,
        desc: selectedJob.description,
        hoursLeft: Math.max(0, Math.ceil((new Date(selectedJob.deadline).getTime() - Date.now()) / (1000 * 60 * 60))),
      }
    : filtered.find((l) => l._id === selectedJobId)

  const myBidByJobId = useMemo(() => {
    const map = {}
    myBids.forEach((bid) => {
      const jobId = bid.job_id?._id || bid.job_id
      if (jobId) map[String(jobId)] = bid
    })
    return map
  }, [myBids])

  const openListing = async (jobId) => {
    setSelectedJobId(jobId)
    try {
      await fetchJob(jobId)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load request details')
    }
  }

  const handleBidSubmit = async ({ amount, note }) => {
    if (!selectedJobId) return
    try {
      await submitBid({ job_id: selectedJobId, amount, note })
      toast.success('Bid submitted')
      await Promise.all([
        fetchJobs({ status: 'open', limit: 100 }),
        fetchMyBids(),
        fetchJob(selectedJobId),
      ])
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit bid')
    }
  }

  const handleAcceptBid = async (bidId) => {
    if (!selectedJobId) return
    try {
      await closeJob(selectedJobId, bidId)
      toast.success('Bid accepted and request closed')
      await fetchJobs({ status: 'open', limit: 100 })
      setSelectedJobId(null)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to accept bid')
    }
  }

  const handlePostRequest = async () => {
    if (!newRequest.title.trim() || !newRequest.description.trim()) {
      toast.error('Title and description are required')
      return
    }

    const budget = Number(newRequest.budget)
    if (!budget || budget < 50) {
      toast.error('Budget must be at least $50')
      return
    }

    const days = Number(newRequest.daysUntilDeadline)
    if (!days || days < 1) {
      toast.error('Deadline must be at least 1 day')
      return
    }

    const deadline = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

    setPosting(true)
    try {
      await createJob({
        title: newRequest.title.trim(),
        description: newRequest.description.trim(),
        category: newRequest.category,
        budget,
        deadline,
      })
      toast.success('Request posted')
      setShowPostForm(false)
      setNewRequest({
        title: '',
        description: '',
        category: 'Design',
        budget: '',
        daysUntilDeadline: 7,
      })
      await fetchJobs({ status: 'open', limit: 100 })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to post request')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="main">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Open <span>Requests</span></div>
        {canPostRequest && (
          <button type="button" className="btn btn-primary" onClick={() => setShowPostForm(true)}>
            + Post Request
          </button>
        )}
      </div>
      <section className="shell-panel">
        <div className="market-controls-line">
          <input className="search-box market-search-long" placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} />
          <CustomDropdown
            options={FILTER_OPTIONS}
            value={catFilter}
            onChange={setCatFilter}
            className="sort-dropdown filter-dropdown"
            buttonClassName="sort-trigger"
            menuClassName="sort-menu"
            optionClassName="sort-option"
            caretClassName="sort-caret"
            placeholder="Filter"
          />
          <CustomDropdown
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={setSortBy}
            className="sort-dropdown"
            buttonClassName="sort-trigger"
            menuClassName="sort-menu"
            optionClassName="sort-option"
            caretClassName="sort-caret"
            placeholder="Sort"
          />
        </div>
      </section>
      <section className={marketViewMode === 'list' ? 'market-list-section' : 'shell-panel'} key={`${catFilter}-${search}-${sortBy}-${requestOrderMode}-${marketViewMode}`}>
        {marketViewMode === 'card' ? (
          <div className="listings-grid">
            {filtered.map((l, idx) => {
              const isMyListing = l.isMine
              const myBid = myBidByJobId[String(l._id)]
              const myBidStatus = myBid?.status
              return (
                <div
                  key={l._id}
                  className={`listing-card ${l.urgent ? "urgent" : ""}`}
                  style={{ animationDelay: `${Math.min(idx, 8) * 55}ms` }}
                  onClick={() => openListing(l._id)}
                >
                  <div className="listing-header">
                    <span className="listing-category">{l.category}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {isMyListing && <span className="status-pill status-open">Your Request</span>}
                      <span className="listing-bids"><strong>{l.bids_count || 0}</strong> bids</span>
                    </div>
                  </div>
                  <div className="listing-signals">
                    {l.urgent && <span className="signal-pill danger">Ending Soon</span>}
                    {l.hasHighActivity && <span className="signal-pill">High Activity</span>}
                    {l.isFresh && <span className="signal-pill success">New</span>}
                    {myBidStatus === 'pending' && <span className="signal-pill">Your Bid Pending</span>}
                    {myBidStatus === 'accepted' && <span className="signal-pill success">You Won</span>}
                    {myBidStatus === 'rejected' && <span className="signal-pill danger">Not Selected</span>}
                  </div>
                  <div className="listing-title">{l.title}</div>
                  <div className="listing-desc">{l.desc.length > 100 ? `${l.desc.substring(0, 100)}...` : l.desc}</div>
                  <div className="listing-footer">
                    <div>
                      <div className="budget-label">Budget Cap</div>
                      <div className="budget-amount">${l.budget.toLocaleString()} <span>max</span></div>
                    </div>
                    <Timer hours={l.hoursLeft} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mturk-list">
            {filtered.map((listing) => {
              const statusClass = listing.isMine
                ? 'status-open'
                : listing.status === 'closed' || listing.status === 'completed'
                  ? 'status-closed'
                  : 'status-open'
              const safeHoursLeft = Math.max(0, Number(listing.hoursLeft) || 0)
              const timeLabel = safeHoursLeft === 0 ? 'Ended' : `${safeHoursLeft}h left`
              const bidsCount = Number(listing.bids_count || 0)
              const statusLabel = String(listing.status || 'open')
              const lowestBid = Array.isArray(listing.bids) && listing.bids.length
                ? Math.min(...listing.bids.map((bid) => Number(bid.amount || Infinity)))
                : null

              return (
                <article key={listing._id} className="mturk-row" onClick={() => openListing(listing._id)}>
                  <div className="mturk-main">
                    <div className="mturk-category">{listing.category}</div>
                    <h3 className="mturk-title">{listing.title}</h3>
                    <p className="mturk-desc">{listing.desc}</p>
                    <div className="mturk-metrics">
                      <span>
                        <Clock3 size={13} />
                        {timeLabel}
                      </span>
                      <span>
                        <Tag size={13} />
                        {`${bidsCount} bids`}
                      </span>
                      <span className={`status-pill ${statusClass}`}>{statusLabel}</span>
                    </div>
                  </div>

                  <aside className="mturk-side">
                    <div className="mturk-budget-label">Budget Cap</div>
                    <div className="mturk-budget">${Number(listing.budget || 0).toLocaleString()}</div>
                  </aside>
                </article>
              )
            })}
          </div>
        )}
      </section>
      {filtered.length === 0 && <div className="empty"><div className="empty-icon"><Search size={44} /></div><h3>No requests found</h3><p>Try adjusting your filters or post a new request.</p></div>}

      {showPostForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowPostForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Post A New Request</div>
              <button type="button" className="modal-close" onClick={() => setShowPostForm(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                value={newRequest.title}
                onChange={(e) => setNewRequest((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="What do you need done?"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={newRequest.description}
                onChange={(e) => setNewRequest((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe deliverables, quality expectations, and timeline details"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <CustomDropdown
                  options={REQUEST_CATEGORY_OPTIONS}
                  value={newRequest.category}
                  onChange={(category) => setNewRequest((prev) => ({ ...prev, category }))}
                  className="form-dropdown"
                  buttonClassName="form-dropdown-trigger"
                  menuClassName="form-dropdown-menu"
                  optionClassName="form-dropdown-option"
                  caretClassName="form-dropdown-caret"
                  placeholder="Select category"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Budget (USD)</label>
                <input
                  className="form-input"
                  type="number"
                  min="50"
                  value={newRequest.budget}
                  onChange={(e) => setNewRequest((prev) => ({ ...prev, budget: e.target.value }))}
                  placeholder="500"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Deadline (Days From Now)</label>
              <input
                className="form-input"
                type="number"
                min="1"
                value={newRequest.daysUntilDeadline}
                onChange={(e) => setNewRequest((prev) => ({ ...prev, daysUntilDeadline: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handlePostRequest} disabled={posting}>
                {posting ? 'Posting...' : 'Post Request'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowPostForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ListingModal
        listing={selectedListing}
        user={user}
        myBids={myBids}
        onClose={() => setSelectedJobId(null)}
        onBid={handleBidSubmit}
        onAcceptBid={handleAcceptBid}
      />
    </div>
  )
}
