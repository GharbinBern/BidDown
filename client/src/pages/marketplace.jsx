import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore, useBidsStore, useJobsStore } from '../store'

const CATEGORIES = ["All", "Design", "Development", "Marketing", "Writing", "Legal", "Consulting", "Other"]

function Timer({ hours }) {
  return <span className={`timer ${hours <= 12 ? "low" : ""}`}><span className="timer-dot" />{hours}h left</span>
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
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
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
          <div className="card" style={{ marginBottom: 12, color: 'var(--muted)', fontSize: 13 }}>
            Loading latest bid details...
          </div>
        ) : isOwner ? (
          <div className="bid-list">
            {sortedBids.map((b, i) => (
              <div key={b._id || i} className={`bid-item ${i === 0 ? "winner" : ""}`}>
                <div className="bid-seller">
                  {b.seller_id?.name || 'Seller'} {i === 0 && <span style={{ color: "var(--green)", fontSize: 10 }}>★ LOWEST BID</span>}
                  <small>{"★".repeat(Math.round(b.seller_id?.average_rating || 5))} {b.seller_id?.average_rating || 5} · {b.note || 'No note'}</small>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
          ) : (
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} disabled>
              {isOwner ? 'You cannot bid on your own request' : hasExistingBid ? `You already bid: $${Number(existingBid.amount).toLocaleString()} (${existingBid.status})` : 'Seller role required to bid'}
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { jobs, loading, fetchJobs, selectedJob, fetchJob, closeJob } = useJobsStore()
  const { submitBid, fetchMyBids, myBids } = useBidsStore()
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [catFilter, setCatFilter] = useState("All")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchJobs({ status: 'open', limit: 100 }).catch((error) => {
      toast.error(error.response?.data?.error || 'Failed to load requests')
    })
  }, [fetchJobs])

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

  return (
    <div className="main">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Open <span>Requests</span></div>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/dashboard')}>+ Post Request</button>
      </div>
      <div className="filters">
        {CATEGORIES.map(c => <button type="button" key={c} className={`filter-pill ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>{c}</button>)}
        <div className="filter-spacer" />
        <input className="search-box" placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading && <div className="card" style={{ marginBottom: 16, color: 'var(--muted)', fontSize: 13 }}>Loading requests...</div>}
      <div className="listings-grid">
        {filtered.map(l => (
          <div key={l._id} className={`listing-card ${l.urgent ? "urgent" : ""}`} onClick={() => openListing(l._id)}>
            <div className="listing-header">
              <span className="listing-category">{l.category}</span>
              <span className="listing-bids"><strong>{l.bids_count || 0}</strong> bids</span>
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
        ))}
      </div>
      {filtered.length === 0 && <div className="empty"><div className="empty-icon">🔍</div><h3>No requests found</h3><p>Try adjusting your filters or post a new request.</p></div>}
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
