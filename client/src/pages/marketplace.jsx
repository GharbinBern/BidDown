import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Clock3, Search, Star, Tag, X } from 'lucide-react'
import CustomDropdown from '../components/dropdown'
import { useAuthStore, useBidsStore, useJobsStore, usePreferencesStore } from '../store'

const CATEGORIES = ["All", "Home Repairs", "Tutoring", "Photography", "Cleaning", "Delivery", "Design & Print"]
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

const INTAKE_TEMPLATE_BY_CATEGORY = {
  'Home Repairs': [
    { key: 'location', label: 'Location', placeholder: 'Estate / suburb and city' },
    { key: 'issue_type', label: 'Issue Type', placeholder: 'Plumbing, electrical, carpentry...' },
    { key: 'access_window', label: 'Access Window', placeholder: 'Weekdays 9am-5pm' },
  ],
  Tutoring: [
    { key: 'subject', label: 'Subject', placeholder: 'Mathematics, English, Science...' },
    { key: 'level', label: 'Level', placeholder: 'Primary, JHS, SHS, Adult' },
    { key: 'sessions_per_week', label: 'Sessions / Week', placeholder: '2' },
  ],
  Photography: [
    { key: 'shoot_type', label: 'Shoot Type', placeholder: 'Graduation, wedding, product...' },
    { key: 'event_date', label: 'Event Date', placeholder: '2026-05-30' },
    { key: 'deliverables', label: 'Deliverables', placeholder: '80 edited images + album' },
  ],
  Cleaning: [
    { key: 'property_size', label: 'Property Size', placeholder: '2-bedroom apartment' },
    { key: 'frequency', label: 'Frequency', placeholder: 'One-time, weekly, monthly' },
    { key: 'supplies_provided', label: 'Supplies Provided', placeholder: 'Yes / No' },
  ],
  Delivery: [
    { key: 'pickup_location', label: 'Pickup Location', placeholder: 'Tema Community 1' },
    { key: 'dropoff_location', label: 'Dropoff Location', placeholder: 'Adenta Housing' },
    { key: 'load_type', label: 'Load Type', placeholder: 'Furniture, parcel, mixed' },
  ],
  'Design & Print': [
    { key: 'asset_type', label: 'Asset Type', placeholder: 'Flyer, logo, banner...' },
    { key: 'quantity', label: 'Quantity', placeholder: '200 copies' },
    { key: 'print_deadline', label: 'Print Deadline', placeholder: 'Needed in 5 days' },
  ],
}

const BID_TEMPLATE_BY_CATEGORY = {
  'Home Repairs': 'Parts/tools plan or site inspection notes',
  Tutoring: 'Teaching approach and lesson support style',
  Photography: 'Shoot setup and editing approach',
  Cleaning: 'Cleaning checklist and supplies method',
  Delivery: 'Vehicle/load handling and routing approach',
  'Design & Print': 'Design process and print prep details',
}

const buildInitialIntake = (category) => {
  const fields = INTAKE_TEMPLATE_BY_CATEGORY[category] || []
  return fields.reduce((acc, field) => ({ ...acc, [field.key]: '' }), {})
}

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

function ListingModal({ listing, onClose, onBid, onAcceptBid, onOpenWorkflow, user, myBids }) {
  if (!listing) return null
  const [showBidForm, setShowBidForm] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [bidNote, setBidNote] = useState('')
  const [bidTemplate, setBidTemplate] = useState({
    timeline_days: '',
    supervision_plan: '',
    milestone_plan: '',
    category_detail: '',
  })
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
  const winningSellerId = listing.winning_bid_id?.seller_id?._id || listing.winning_bid_id?.seller_id
  const isWinningSeller = !!userId && !!winningSellerId && String(winningSellerId) === String(userId)
  const canOpenWorkflow = !!listing.winning_bid_id && (isOwner || isWinningSeller)
  const existingBidStatus = existingBid?.status
  const categoryDetailHint = BID_TEMPLATE_BY_CATEGORY[listing.category] || 'Category-specific delivery details'

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

    if (!bidTemplate.timeline_days || Number(bidTemplate.timeline_days) < 1) {
      setFormError('Timeline must be at least 1 day.')
      return
    }

    if (!bidTemplate.supervision_plan.trim() || !bidTemplate.milestone_plan.trim() || !bidTemplate.category_detail.trim()) {
      setFormError('Please complete all proposal template fields.')
      return
    }

    setFormError('')
    onBid({
      amount: parsedAmount,
      note: bidNote.trim(),
      proposal: {
        timeline_days: Number(bidTemplate.timeline_days),
        supervision_plan: bidTemplate.supervision_plan.trim(),
        milestone_plan: bidTemplate.milestone_plan.trim(),
        category_detail: bidTemplate.category_detail.trim(),
      },
    })
    setShowBidForm(false)
    setBidAmount('')
    setBidNote('')
    setBidTemplate({ timeline_days: '', supervision_plan: '', milestone_plan: '', category_detail: '' })
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
        <div className="modal-body">
          <div className="m-lot-num">{listing.category}</div>
          <div className="m-desc">{listing.desc}</div>

          {listing.intake_details && Object.keys(listing.intake_details).length > 0 ? (
            <div className="m-bid-box" style={{ marginTop: 0 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', marginBottom: 8 }}>
                Buyer intake requirements
              </div>
              {Object.entries(listing.intake_details).map(([key, value]) => (
                <div key={key} style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
                  <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{key.replaceAll('_', ' ')}:</strong> {String(value)}
                </div>
              ))}
            </div>
          ) : null}

          <div className="m-bid-box">
            <div className="m-bid-row">
              <span className="m-bid-label">Budget Cap</span>
              <span className="m-bid-val">${listing.budget.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>
              {listing.bids_count || 0} bids · {listing.hoursLeft > 0 ? `${listing.hoursLeft}h remaining` : 'Ended'}
            </div>
          </div>

          <div className="m-stats">
            <div className="m-stat">
              <div className="m-stat-val">{listing.bids_count || 0}</div>
              <div className="m-stat-label">Total Bids</div>
            </div>
            <div className="m-stat">
              <div className="m-stat-val" style={{ color: 'var(--accent)' }}>${listing.budget.toLocaleString()}</div>
              <div className="m-stat-label">Budget</div>
            </div>
            <div className="m-stat">
              <div className="m-stat-val">{listing.hoursLeft > 0 ? `${listing.hoursLeft}h` : '—'}</div>
              <div className="m-stat-label">Remaining</div>
            </div>
          </div>

          {isOwner ? (
            <>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', marginBottom: 10 }}>
                All Bids — Ranked Lowest First
              </div>
              <div className="bid-list">
                {sortedBids.map((b, i) => (
                  <div key={b._id || i} className={`bid-item ${i === 0 ? "winner" : ""}`}>
                    <div className="bid-seller">
                      <span>{b.seller_id?.name || 'Seller'}</span>
                      {i === 0 && (
                        <span style={{ fontSize: 9, color: 'var(--green)', marginLeft: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>Lowest</span>
                      )}
                      <small>{'★'.repeat(Math.round(b.seller_id?.average_rating || 5))} {b.seller_id?.average_rating || 5} · {b.note || 'No note'}</small>
                      {b.proposal?.timeline_days ? (
                        <small>
                          {`${b.proposal.timeline_days}d · ${b.proposal.supervision_plan || 'No supervision plan'} · ${b.proposal.category_detail || 'No category details'}`}
                        </small>
                      ) : null}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div className={`bid-amount ${i === 0 ? "lowest" : ""}`}>${b.amount.toLocaleString()}</div>
                      {canAcceptBid && b.status === 'pending' && (
                        <button type="button" className="accept-btn" onClick={() => onAcceptBid(b._id)}>Accept</button>
                      )}
                    </div>
                  </div>
                ))}
                {sortedBids.length === 0 && (
                  <div style={{ color: 'var(--muted)', fontSize: 12, padding: '12px 0' }}>No bids yet for this request.</div>
                )}
              </div>
            </>
          ) : (
            <div className="sealed-note">
              Sealed-bid auction — sellers cannot see each other's bids. Your bid will be ranked once submitted.
            </div>
          )}

          {hasExistingBid && !isOwner && (
            <div className="m-bid-box" style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', marginBottom: 8 }}>Your Submitted Bid</div>
              <div className="m-bid-row">
                <span className="m-bid-label">Amount</span>
                <span className="m-bid-val" style={{ fontSize: 20 }}>${Number(existingBid.amount).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
                <span>Status: <span className={`status-pill ${existingBid.status === 'accepted' ? 'status-closed' : existingBid.status === 'rejected' ? 'status-pending' : 'status-open'}`}>{existingBid.status}</span></span>
                <span>{formatRecordTime(existingBid.createdAt)}</span>
              </div>
              {existingBid.note && <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>{existingBid.note}</div>}
              {existingBid.proposal?.timeline_days ? (
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
                  {`Timeline: ${existingBid.proposal.timeline_days} days`}
                  <br />
                  {`Supervision: ${existingBid.proposal.supervision_plan}`}
                  <br />
                  {`Milestones: ${existingBid.proposal.milestone_plan}`}
                </div>
              ) : null}
              {existingBidStatus === 'accepted' && (
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--green)' }}>You won this request.</div>
              )}
              {existingBidStatus === 'rejected' && (
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--accent2)' }}>Another seller was selected.</div>
              )}
            </div>
          )}

          {showBidForm && canSubmitBid && (
            <div style={{ marginTop: 14 }}>
              <div className="form-group" style={{ marginBottom: 10 }}>
                <label className="form-label">Your Bid (USD)</label>
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
                  placeholder="Timeline, deliverables, assumptions"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Timeline (Days)</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  value={bidTemplate.timeline_days}
                  onChange={(e) => setBidTemplate((prev) => ({ ...prev, timeline_days: e.target.value }))}
                  placeholder="3"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Supervision Plan</label>
                <textarea
                  className="form-textarea"
                  value={bidTemplate.supervision_plan}
                  onChange={(e) => setBidTemplate((prev) => ({ ...prev, supervision_plan: e.target.value }))}
                  placeholder="How you will manage quality and updates"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Milestone Plan</label>
                <textarea
                  className="form-textarea"
                  value={bidTemplate.milestone_plan}
                  onChange={(e) => setBidTemplate((prev) => ({ ...prev, milestone_plan: e.target.value }))}
                  placeholder="Breakdown of delivery milestones"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">{categoryDetailHint}</label>
                <textarea
                  className="form-textarea"
                  value={bidTemplate.category_detail}
                  onChange={(e) => setBidTemplate((prev) => ({ ...prev, category_detail: e.target.value }))}
                  placeholder={categoryDetailHint}
                />
              </div>
              {formError && <div style={{ color: 'var(--accent2)', fontSize: 12, marginBottom: 8 }}>{formError}</div>}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {canOpenWorkflow && (
              <button type="button" className="btn btn-primary" onClick={() => onOpenWorkflow(listing._id)}>
                Open Workflow
              </button>
            )}
            {canSubmitBid ? (
              showBidForm ? (
                <>
                  <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleBidSubmit}>Place Bid</button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setShowBidForm(false)
                      setFormError('')
                      setBidTemplate({ timeline_days: '', supervision_plan: '', milestone_plan: '', category_detail: '' })
                    }}
                  >
                    Cancel
                  </button>
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
    </div>
  )
}

export default function MarketplacePage() {
  const navigate = useNavigate()
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
    category: 'Home Repairs',
    budget: '',
    daysUntilDeadline: 7,
    intake_details: buildInitialIntake('Home Repairs'),
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

  const handleBidSubmit = async ({ amount, note, proposal }) => {
    if (!selectedJobId) return
    try {
      await submitBid({ job_id: selectedJobId, amount, note, proposal })
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

    const intakeFields = INTAKE_TEMPLATE_BY_CATEGORY[newRequest.category] || []
    for (const field of intakeFields) {
      const value = String(newRequest.intake_details?.[field.key] || '').trim()
      if (!value) {
        toast.error(`${field.label} is required for ${newRequest.category}`)
        return
      }
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
        intake_details: newRequest.intake_details,
      })
      toast.success('Request posted')
      setShowPostForm(false)
      setNewRequest({
        title: '',
        description: '',
        category: 'Home Repairs',
        budget: '',
        daysUntilDeadline: 7,
        intake_details: buildInitialIntake('Home Repairs'),
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
              const hasPlacedBid = myBidStatus === 'pending'
              return (
                <div
                  key={l._id}
                  className={`listing-card ${l.urgent ? "urgent" : ""} ${hasPlacedBid ? 'has-my-bid' : ''}`}
                  style={{ animationDelay: `${Math.min(idx, 8) * 55}ms` }}
                  onClick={() => openListing(l._id)}
                >
                  <div className="lot-num">
                    <span>{l.category}</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {isMyListing && <span className="status-pill status-open">Mine</span>}
                      {l.urgent && <span className="signal-pill danger">Urgent</span>}
                      {l.isFresh && <span className="signal-pill success">New</span>}
                      {myBidStatus === 'accepted' && <span className="signal-pill success">Won</span>}
                      {myBidStatus === 'rejected' && <span className="signal-pill danger">Lost</span>}
                    </div>
                  </div>
                  <div className="lot-body">
                    <div className="listing-title">{l.title}</div>
                    <div className="listing-desc">{l.desc.length > 80 ? `${l.desc.substring(0, 80)}…` : l.desc}</div>
                    <div className="lot-bid-section">
                      <div className="lot-bid-row">
                        <div>
                          <div className="lot-bid-label">Budget Cap</div>
                          <div className="lot-bid-amount">${l.budget.toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="bid-count"><strong>{l.bids_count || 0}</strong> bids</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lot-timer">
                    <Timer hours={l.hoursLeft} />
                  </div>
                  <div className="lot-action">
                    <button className="bid-btn" onClick={(e) => { e.stopPropagation(); openListing(l._id) }}>Bid Now</button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mturk-list">
            {filtered.map((listing) => {
              const myBid = myBidByJobId[String(listing._id)]
              const hasPlacedBid = myBid?.status === 'pending'
              const statusClass = listing.isMine
                ? 'status-open'
                : listing.status === 'closed' || listing.status === 'completed'
                  ? 'status-closed'
                  : 'status-open'
              const safeHoursLeft = Math.max(0, Number(listing.hoursLeft) || 0)
              const timeLabel = safeHoursLeft === 0 ? 'Ended' : `${safeHoursLeft}h left`
              const bidsCount = Number(listing.bids_count || 0)
              const statusLabel = String(listing.status || 'open')
              const showStatusPill = statusLabel !== 'open'
              const lowestBid = Array.isArray(listing.bids) && listing.bids.length
                ? Math.min(...listing.bids.map((bid) => Number(bid.amount || Infinity)))
                : null

              return (
                <article key={listing._id} className={`mturk-row ${hasPlacedBid ? 'has-my-bid' : ''}`} onClick={() => openListing(listing._id)}>
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
                      {showStatusPill && <span className={`status-pill ${statusClass}`}>{statusLabel}</span>}
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
            <div className="modal-body">

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
                  onChange={(category) => setNewRequest((prev) => ({
                    ...prev,
                    category,
                    intake_details: buildInitialIntake(category),
                  }))}
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

            <div style={{ border: '1px solid var(--border)', padding: 10, marginBottom: 10, background: 'var(--bg)' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--muted)', marginBottom: 8 }}>
                Required Intake Details ({newRequest.category})
              </div>
              {(INTAKE_TEMPLATE_BY_CATEGORY[newRequest.category] || []).map((field) => (
                <div className="form-group" style={{ marginBottom: 8 }} key={field.key}>
                  <label className="form-label">{field.label}</label>
                  <input
                    className="form-input"
                    value={newRequest.intake_details?.[field.key] || ''}
                    onChange={(e) => setNewRequest((prev) => ({
                      ...prev,
                      intake_details: {
                        ...(prev.intake_details || {}),
                        [field.key]: e.target.value,
                      },
                    }))}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handlePostRequest} disabled={posting}>
                {posting ? 'Posting...' : 'Post Request'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowPostForm(false)}>
                Cancel
              </button>
            </div>
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
        onOpenWorkflow={(jobId) => {
          setSelectedJobId(null)
          navigate(`/jobs/${jobId}`)
        }}
      />
    </div>
  )
}
