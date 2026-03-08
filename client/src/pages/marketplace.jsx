import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Search, Star, X } from 'lucide-react'
import { useAuthStore, useBidsStore, useJobsStore } from '../store'

const CATEGORIES = ["All", "Design", "Development", "Marketing", "Writing", "Legal", "Consulting", "Other"]
const REQUEST_CATEGORIES = CATEGORIES.slice(1)

function Timer({ hours }) {
  const safeHours = Math.max(0, Number(hours) || 0)
  const isHoursUnit = safeHours < 24
  const daysLeft = Math.ceil(safeHours / 24)
  const label = isHoursUnit
    ? `${safeHours}h left`
    : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`

  return <span className={`timer ${isHoursUnit && safeHours <= 12 ? "low" : ""}`}><span className="timer-dot" />{label}</span>
}

function ListingModal({ listing, onClose, onBid, onAcceptBid, user, myBids, loadingDetails }) {
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
        <div className="info-row"><span className="info-label">Total Bids</span><span>{listing.bids_count || 0} (sealed during bidding window)</span></div>
        <div style={{ margin: "16px 0", color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>{listing.desc}</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
          {isOwner ? "All Bids — Ranked Lowest First" : "Bids are sealed to non-owners"}
        </div>
        {loadingDetails ? (
          <div className="loading-panel" style={{ marginBottom: 12 }}>
            <div className="loading-row"><span className="loading-dot" />Refreshing latest bid details...</div>
          </div>
        ) : isOwner ? (
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
        ) : (
          <div className="card" style={{ marginBottom: 12, color: 'var(--muted)', fontSize: 13 }}>
            You can see bid count only. Bid details are visible only to the request owner after closing.
          </div>
        )}
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
            <div className="info-row"><span className="info-label">Submitted</span><span>{new Date(existingBid.createdAt).toLocaleString()}</span></div>
            <div style={{ marginTop: 10, color: 'var(--muted)', fontSize: 13 }}>{existingBid.note || 'No note was included with your bid.'}</div>
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
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [catFilter, setCatFilter] = useState("All")
  const [search, setSearch] = useState("")
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

  const listings = useMemo(() => jobs.map((job) => {
    const deadline = new Date(job.deadline)
    const hoursLeft = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60)))
    return {
      ...job,
      hoursLeft,
      urgent: hoursLeft <= 12,
      desc: job.description,
    }
  }), [jobs])

  const filtered = listings.filter(l =>
    (catFilter === "All" || l.category === catFilter) &&
    (l.title.toLowerCase().includes(search.toLowerCase()) || l.desc.toLowerCase().includes(search.toLowerCase()))
  )

  const selectedListing = selectedJob && selectedJobId === selectedJob._id
    ? {
        ...selectedJob,
        desc: selectedJob.description,
        hoursLeft: Math.max(0, Math.ceil((new Date(selectedJob.deadline).getTime() - Date.now()) / (1000 * 60 * 60))),
      }
    : filtered.find((l) => l._id === selectedJobId)

  const openListing = async (jobId) => {
    setSelectedJobId(jobId)
    setLoadingDetails(true)
    try {
      await fetchJob(jobId)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load request details')
    } finally {
      setLoadingDetails(false)
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
      <div className="filters">
        {CATEGORIES.map(c => <button type="button" key={c} className={`filter-pill ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>{c}</button>)}
        <div className="filter-spacer" />
        <input className="search-box" placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading && (
        <div className="loading-panel">
          <div className="loading-row"><span className="loading-dot" />Fetching open requests...</div>
        </div>
      )}
      <div className="listings-grid">
        {filtered.map(l => {
          const isMyListing = String(l.owner_id?._id || l.owner_id) === String(user?._id || user?.id)
          return (
          <div
            key={l._id}
            className={`listing-card ${l.urgent ? "urgent" : ""}`}
            onClick={() => openListing(l._id)}
          >
            <div className="listing-header">
              <span className="listing-category">{l.category}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {isMyListing && <span className="status-pill status-open">Your Request</span>}
                <span className="listing-bids"><strong>{l.bids_count || 0}</strong> bids</span>
              </div>
            </div>
            <div className="listing-title">{l.title}</div>
            <div className="listing-desc">{l.desc.substring(0, 100)}...</div>
            <div className="listing-footer">
              <div>
                <div className="budget-label">Budget Cap</div>
                <div className="budget-amount">${l.budget.toLocaleString()} <span>max</span></div>
              </div>
              <Timer hours={l.hoursLeft} />
            </div>
          </div>
        )})}
      </div>
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
                <select
                  className="form-select"
                  value={newRequest.category}
                  onChange={(e) => setNewRequest((prev) => ({ ...prev, category: e.target.value }))}
                >
                  {REQUEST_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
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
        loadingDetails={loadingDetails}
        onClose={() => setSelectedJobId(null)}
        onBid={handleBidSubmit}
        onAcceptBid={handleAcceptBid}
      />
    </div>
  )
}
