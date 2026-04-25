import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AlignJustify, ChevronLeft, ChevronRight, Flame, LayoutGrid, MapPin, Search, Star, X } from 'lucide-react'
import { useAuthStore, useBidsStore, useJobsStore } from '../store'

/* ─── constants ─────────────────────────────────────────── */
const CATEGORIES = ['Home Repairs', 'Tutoring', 'Photography', 'Cleaning', 'Delivery', 'Design & Print']

const SORT_OPTIONS = [
  { value: 'endingSoon', label: 'Closing soonest' },
  { value: 'newest', label: 'Newest first' },
  { value: 'mostBids', label: 'Most bids' },
  { value: 'budgetHigh', label: 'Budget: high to low' },
  { value: 'budgetLow', label: 'Budget: low to high' },
]

const CITIES = ['All Cities', 'Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast', 'Tema', 'Sunyani']

const PAGE_SIZE = 8

/* ─── helpers ────────────────────────────────────────────── */
function hoursFromNow(deadline) {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 3_600_000))
}

function formatCountdown(ms) {
  if (ms <= 0) return 'Ended'
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h < 24) return m > 0 ? `${h}h ${m}m` : `${h}h`
  const d = Math.floor(h / 24)
  const rh = h % 24
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`
}

function msFromNow(deadline) {
  return Math.max(0, new Date(deadline).getTime() - Date.now())
}

function getLocation(job) {
  const d = job.intake_details || {}
  return d.location || d.pickup_location || d.event_date || ''
}

function getTags(job) {
  const d = job.intake_details || {}
  return Object.values(d)
    .filter((v) => typeof v === 'string' && v.trim())
    .slice(0, 3)
}

function getStatusInfo(ms, bidsCount, status) {
  const hours = ms / 3600000
  if (status !== 'open') return { label: status, cls: 'br-badge br-badge-closed', urgent: false }
  if (bidsCount === 0) return { label: ' No bids yet', cls: 'br-badge br-badge-nobids', urgent: false }
  if (hours <= 2) return { label: ` Closing in ${Math.ceil(hours * 60)}m`, cls: 'br-badge br-badge-fire', urgent: true }
  if (hours <= 24) return { label: 'Closing soon', cls: 'br-badge br-badge-warn', urgent: true }
  return { label: 'Open', cls: 'br-badge br-badge-open', urgent: false }
}

function normalizeUserId(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    if (typeof value._id === 'string') return value._id
    if (typeof value.$oid === 'string') return value.$oid
    if (typeof value.toString === 'function') {
      const text = value.toString()
      if (text && text !== '[object Object]') return text
    }
  }
  return null
}

function AvatarInitials({ name, size = 32 }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const colors = ['#2563eb', '#0891b2', '#7c3aed', '#059669', '#d97706', '#dc2626']
  const color = colors[(initials.charCodeAt(0) || 0) % colors.length]
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        fontSize: size * 0.38,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

function StarRating({ value }) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0))
  const full = Math.floor(rating)
  const fraction = rating - full
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={11}
          fill={i <= full ? '#dca53a' : i === full + 1 && fraction >= 0.5 ? '#dca53a' : 'none'}
          color="#dca53a"
          strokeWidth={1.5}
        />
      ))}
      <span style={{ fontSize: 11, color: '#556577', marginLeft: 3 }}>{rating.toFixed(1)}</span>
    </span>
  )
}

/* ─── bid modal ──────────────────────────────────────────── */
const BID_TEMPLATE_BY_CATEGORY = {
  'Home Repairs': 'Parts/tools plan or site inspection notes',
  Tutoring: 'Teaching approach and lesson support style',
  Photography: 'Shoot setup and editing approach',
  Cleaning: 'Cleaning checklist and supplies method',
  Delivery: 'Vehicle/load handling and routing approach',
  'Design & Print': 'Design process and print prep details',
}

function BidModal({ job, onClose, onSubmit }) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [timeline, setTimeline] = useState('')
  const [supervisionPlan, setSupervisionPlan] = useState('')
  const [milestonePlan, setMilestonePlan] = useState('')
  const [categoryDetail, setCategoryDetail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const hint = BID_TEMPLATE_BY_CATEGORY[job.category] || 'Category-specific details'

  const handleSubmit = async () => {
    const parsed = Number(amount)
    if (!parsed || parsed < 50) { setError('Bid must be at least $50.'); return }
    if (parsed > job.budget) { setError('Bid cannot exceed the budget cap.'); return }
    if (!timeline || Number(timeline) < 1) { setError('Timeline must be at least 1 day.'); return }
    if (!supervisionPlan.trim() || !milestonePlan.trim() || !categoryDetail.trim()) {
      setError('Please complete all proposal fields.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onSubmit({
        amount: parsed,
        note: note.trim(),
        proposal: {
          timeline_days: Number(timeline),
          supervision_plan: supervisionPlan.trim(),
          milestone_plan: milestonePlan.trim(),
          category_detail: categoryDetail.trim(),
        },
      })
      onClose()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to submit bid.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Place Bid — {job.title}</div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Your Bid Amount</label>
            <input
              className="form-input"
              type="number"
              min="50"
              max={job.budget}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Max $${Number(job.budget).toLocaleString()}`}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <textarea className="form-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Brief overview of your approach" />
          </div>
          <div className="form-group">
            <label className="form-label">Timeline (Days)</label>
            <input className="form-input" type="number" min="1" value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="e.g. 3" />
          </div>
          <div className="form-group">
            <label className="form-label">Supervision Plan</label>
            <textarea className="form-textarea" value={supervisionPlan} onChange={(e) => setSupervisionPlan(e.target.value)} placeholder="How you will manage quality and updates" />
          </div>
          <div className="form-group">
            <label className="form-label">Milestone Plan</label>
            <textarea className="form-textarea" value={milestonePlan} onChange={(e) => setMilestonePlan(e.target.value)} placeholder="Key delivery milestones" />
          </div>
          <div className="form-group">
            <label className="form-label">{hint}</label>
            <textarea className="form-textarea" value={categoryDetail} onChange={(e) => setCategoryDetail(e.target.value)} placeholder={hint} />
          </div>
          {error && <div style={{ color: 'var(--accent2)', fontSize: 12, marginBottom: 10 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Bid'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── request card ───────────────────────────────────────── */
function RequestCard({ job, myBid, onBid }) {
  const navigate = useNavigate()
  const ms = msFromNow(job.deadline)
  const bidsCount = Number(job.bids_count || 0)
  const status = getStatusInfo(ms, bidsCount, job.status)
  const location = getLocation(job)
  const tags = getTags(job)
  const owner = job.owner_id || {}
  const ownerId = normalizeUserId(owner._id || owner)
  const ownerName = owner.name || 'Client'
  const ownerRating = owner.average_rating || 0
  const lowestBid = Array.isArray(job.bids) && job.bids.length
    ? Math.min(...job.bids.map((b) => Number(b.amount || Infinity)))
    : null

  const hasBid = myBid?.status === 'pending'
  const bidWon = myBid?.status === 'accepted'
  const bidLost = myBid?.status === 'rejected'

  let accentClass = ''
  if (hasBid) accentClass = ' br-card--bid'
  else if (bidWon) accentClass = ' br-card--won'
  else if (bidLost) accentClass = ' br-card--lost'
  else if (status.urgent) accentClass = ' br-card--urgent'

  return (
    <article className={`br-card${accentClass}`} onClick={() => navigate(`/jobs/${job._id}`)}>  
      <div className="br-card-main">
        <div className="br-card-top-row">
          <span className="br-cat-label">{job.category}</span>
          <span className={status.cls}>{status.label}</span>
        </div>
        {location && (
          <div className="br-card-location">
            <MapPin size={11} />
            {location}
          </div>
        )}
        <h3 className="br-card-title">{job.title}</h3>
        <p className="br-card-desc">{job.description}</p>
        {tags.length > 0 && (
          <div className="br-tags">
            {tags.map((tag, i) => <span key={i} className="br-tag">{tag}</span>)}
          </div>
        )}
      </div>

      <div className="br-card-side">
        <div className="br-budget-block">
          <div className="br-budget-label">Budget Ceiling</div>
          <div className="br-budget-amount">GH¢ {Number(job.budget).toLocaleString()}</div>
          <div className="br-bids-row">
            {bidsCount === 0
              ? <span className="br-be-first">0 bids · be first!</span>
              : <>{bidsCount} bid{bidsCount !== 1 ? 's' : ''}{lowestBid != null && <> · lowest GH¢ {lowestBid.toLocaleString()}</>}</>
            }
          </div>
        </div>

        <div className="br-closes-row">
          Closes: <strong>{formatCountdown(ms)}</strong>
        </div>

        <div className="br-client-row">
          <button
            type="button"
            className="br-client-link"
            onClick={(e) => {
              e.stopPropagation()
              if (ownerId) navigate(`/providers/${ownerId}`)
            }}
            title={ownerId ? 'View client profile' : 'Profile unavailable'}
            disabled={!ownerId}
          >
            <AvatarInitials name={ownerName} size={32} />
            <div className="br-client-info">
              <div className="br-client-name">{ownerName}</div>
              <StarRating value={ownerRating} />
            </div>
          </button>
        </div>

        {hasBid ? (
          <div className="br-bid-placed">Bid placed: GH¢ {Number(myBid.amount).toLocaleString()}</div>
        ) : bidWon ? (
          <div className="br-bid-won">You won</div>
        ) : bidLost ? (
          <div className="br-bid-lost">Not selected</div>
        ) : (
          <button
            type="button"
            className="br-bid-btn"
            onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job._id}`) }}
          >
            Place Bid →
          </button>
        )}
      </div>
    </article>
  )
}

/* ─── filter chip ────────────────────────────────────────── */
function ActiveChip({ label, onRemove }) {
  return (
    <span className="br-chip">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Remove ${label} filter`}>
        <X size={11} />
      </button>
    </span>
  )
}

/* ─── main page ──────────────────────────────────────────── */
export default function BrowsePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { jobs, loading, fetchJobs } = useJobsStore()
  const { submitBid, fetchMyBids, myBids } = useBidsStore()

  /* filter state */
  const [search, setSearch] = useState('')
  const [selectedCats, setSelectedCats] = useState([])
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [city, setCity] = useState('All Cities')
  const [closingWindow, setClosingWindow] = useState([])   // '6h','24h','3d','any'
  const [minRating, setMinRating] = useState('any')        // 'any','4.0','4.5','5.0'
  const [statusFilters, setStatusFilters] = useState(['open', 'closing'])
  const [sortBy, setSortBy] = useState('endingSoon')
  const [viewMode, setViewMode] = useState('list')
  const [page, setPage] = useState(1)

  /* bid modal */
  const [bidJob, setBidJob] = useState(null)

  /* load */
  useEffect(() => {
    fetchJobs({ status: 'open', limit: 200 }).catch((err) => {
      toast.error(err?.response?.data?.error || 'Failed to load requests')
    })
  }, [fetchJobs])

  useEffect(() => {
    if (user) fetchMyBids().catch(() => {})
  }, [user, fetchMyBids])

  /* per-category counts (unfiltered) */
  const catCounts = useMemo(() => {
    const counts = {}
    jobs.forEach((j) => { counts[j.category] = (counts[j.category] || 0) + 1 })
    return counts
  }, [jobs])

  /* myBid map */
  const myBidByJobId = useMemo(() => {
    const map = {}
    myBids.forEach((b) => {
      const jobId = b.job_id?._id || b.job_id
      if (jobId) map[String(jobId)] = b
    })
    return map
  }, [myBids])

  /* enriched + filtered */
  const enriched = useMemo(() => jobs.map((j) => ({
    ...j,
    desc: j.description,
    ms: msFromNow(j.deadline),
    hours: hoursFromNow(j.deadline),
    isExpired: new Date(j.deadline).getTime() < Date.now(),
    locationStr: getLocation(j).toLowerCase(),
  })), [jobs])

  const filtered = useMemo(() => {
    let list = enriched.filter((j) => !j.isExpired)

    if (selectedCats.length) list = list.filter((j) => selectedCats.includes(j.category))
    if (budgetMin !== '') list = list.filter((j) => Number(j.budget) >= Number(budgetMin))
    if (budgetMax !== '') list = list.filter((j) => Number(j.budget) <= Number(budgetMax))
    if (city && city !== 'All Cities') list = list.filter((j) => j.locationStr.includes(city.toLowerCase()))
    if (closingWindow.length && !closingWindow.includes('any')) {
      const maxH = Math.min(...closingWindow.map((w) => w === '6h' ? 6 : w === '24h' ? 24 : 72))
      list = list.filter((j) => j.hours <= maxH)
    }
    if (minRating !== 'any') {
      const threshold = parseFloat(minRating)
      list = list.filter((j) => {
        const r = Number((j.owner_id || {}).average_rating || 0)
        return r >= threshold
      })
    }
    if (statusFilters.length < 3) {
      list = list.filter((j) => {
        const h = j.hours
        const bc = Number(j.bids_count || 0)
        const isNoBids = bc === 0
        const isClosingSoon = h <= 24 && h > 0
        const isOpen = !isClosingSoon || bc > 0
        if (statusFilters.includes('open') && !isClosingSoon && !isNoBids) return true
        if (statusFilters.includes('closing') && isClosingSoon) return true
        if (statusFilters.includes('nobids') && isNoBids) return true
        return false
      })
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((j) => j.title.toLowerCase().includes(q) || j.desc.toLowerCase().includes(q))
    }

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'budgetHigh': return Number(b.budget) - Number(a.budget)
        case 'budgetLow': return Number(a.budget) - Number(b.budget)
        case 'mostBids': return Number(b.bids_count || 0) - Number(a.bids_count || 0)
        case 'newest': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        default: return Number(a.hours) - Number(b.hours)
      }
    })

    return list
  }, [enriched, selectedCats, budgetMin, budgetMax, city, closingWindow, minRating, statusFilters, search, sortBy])

  /* pagination */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  /* reset page on filter change */
  useEffect(() => { setPage(1) }, [selectedCats, budgetMin, budgetMax, city, closingWindow, minRating, statusFilters, search, sortBy])

  /* active chips */
  const activeChips = []
  selectedCats.forEach((c) => activeChips.push({ label: c, remove: () => setSelectedCats((p) => p.filter((x) => x !== c)) }))
  if (city && city !== 'All Cities') activeChips.push({ label: city, remove: () => setCity('All Cities') })
  closingWindow.forEach((w) => activeChips.push({
    label: w === '6h' ? 'Closing < 6h' : w === '24h' ? 'Closing < 24h' : w === '3d' ? 'Closing < 3d' : 'Any time',
    remove: () => setClosingWindow((p) => p.filter((x) => x !== w)),
  }))
  if (minRating !== 'any') activeChips.push({ label: `Rating ${minRating}+`, remove: () => setMinRating('any') })
  if (!statusFilters.includes('open') || !statusFilters.includes('closing') || !statusFilters.includes('nobids')) {
    statusFilters.forEach((s) => activeChips.push({
      label: s === 'open' ? 'Open' : s === 'closing' ? 'Closing soon' : 'No bids yet',
      remove: () => setStatusFilters((p) => p.filter((x) => x !== s)),
    }))
  }

  const clearAll = () => {
    setSelectedCats([])
    setBudgetMin('')
    setBudgetMax('')
    setCity('All Cities')
    setClosingWindow([])
    setMinRating('any')
    setStatusFilters(['open', 'closing'])
    setSearch('')
  }

  /* bid submit */
  const handleBidSubmit = async (payload) => {
    if (!user) { navigate('/login'); return }
    await submitBid({ job_id: bidJob._id, ...payload })
    toast.success('Bid submitted')
    await Promise.all([fetchJobs({ status: 'open', limit: 200 }), fetchMyBids()])
  }

  const toggleCat = (cat) => setSelectedCats((p) => p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat])
  const toggleCW = (w) => setClosingWindow((p) => p.includes(w) ? p.filter((x) => x !== w) : [...p, w])
  const toggleStatus = (s) => setStatusFilters((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s])

  return (
    <div className="br-shell">
      {/* ── top search ─── */}
      <div className="br-topbar">
        <div className="br-topsearch-wrap">
          <input
            type="text"
            className="br-topsearch-input"
            placeholder='Search requests (e.g. "electrical repair Accra")'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" className="br-topsearch-btn" onClick={() => {}}>Search</button>
        </div>
      </div>

      <div className="br-page">
      {/* ── sidebar ─────────────────────────────────────────── */}
      <aside className="br-sidebar">

        <div className="br-filter-section">
          <div className="br-filter-heading">Category</div>
          {CATEGORIES.map((cat) => (
            <label key={cat} className="br-checkbox-row">
              <input
                type="checkbox"
                checked={selectedCats.includes(cat)}
                onChange={() => toggleCat(cat)}
              />
              <span>{cat}</span>
              <span className="br-count">{catCounts[cat] || 0}</span>
            </label>
          ))}
        </div>

        <div className="br-filter-section">
          <div className="br-filter-heading">Budget Ceiling</div>
          <div className="br-range-row">
            <input
              className="br-range-input"
              type="number"
              placeholder="Min"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
            />
            <input
              className="br-range-input"
              type="number"
              placeholder="Max"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
            />
          </div>
        </div>

        <div className="br-filter-section">
          <div className="br-filter-heading">City</div>
          <select
            className="br-select"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="br-filter-section">
          <div className="br-filter-heading">Closing Window</div>
          {[
            { value: '6h', label: 'Closing in < 6 hours' },
            { value: '24h', label: 'Closing in < 24 hours' },
            { value: '3d', label: 'Closing in < 3 days' },
            { value: 'any', label: 'Any time' },
          ].map(({ value, label }) => (
            <label key={value} className="br-checkbox-row">
              <input
                type="checkbox"
                checked={closingWindow.includes(value)}
                onChange={() => toggleCW(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <div className="br-filter-section">
          <div className="br-filter-heading">Client Min. Rating</div>
          <div className="br-rating-chips">
            {['any', '4.0', '4.5', '5.0'].map((r) => (
              <button
                key={r}
                type="button"
                className={`br-rating-chip${minRating === r ? ' active' : ''}`}
                onClick={() => setMinRating(r)}
              >
                {r === 'any' ? 'Any' : `${r}+`}
              </button>
            ))}
          </div>
        </div>

        <div className="br-filter-section">
          <div className="br-filter-heading">Status</div>
          {[
            { value: 'open', label: 'Open' },
            { value: 'closing', label: 'Closing soon' },
            { value: 'nobids', label: 'No bids yet' },
          ].map(({ value, label }) => (
            <label key={value} className="br-checkbox-row">
              <input
                type="checkbox"
                checked={statusFilters.includes(value)}
                onChange={() => toggleStatus(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        {(selectedCats.length || city !== 'All Cities' || closingWindow.length || minRating !== 'any' || budgetMin || budgetMax) ? (
          <button type="button" className="br-clear-btn" onClick={clearAll}>
            Clear all filters
          </button>
        ) : null}
      </aside>

      {/* ── main ──────────────────────────────────────────────── */}
      <div className="br-main">

        {/* header bar */}
        <div className="br-header">
          <div className="br-match-count">
            <strong>{filtered.length}</strong> requests match your filters
          </div>
          <div className="br-header-right">
            <span className="br-sort-label">Sort by</span>
            <select
              className="br-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="br-view-toggle">
              <button
                type="button"
                className={`br-view-btn${viewMode === 'list' ? ' active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
                aria-label="List view"
              >
                <AlignJustify size={14} />
              </button>
              <button
                type="button"
                className={`br-view-btn${viewMode === 'card' ? ' active' : ''}`}
                onClick={() => setViewMode('card')}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* active chips */}
        {activeChips.length > 0 && (
          <div className="br-chips-row">
            {activeChips.map((chip, i) => (
              <ActiveChip key={i} label={chip.label} onRemove={chip.remove} />
            ))}
          </div>
        )}

        {/* results */}
        {loading ? (
          <div className="br-empty">Loading requests…</div>
        ) : pageItems.length === 0 ? (
          <div className="br-empty">
            <Search size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
            <div>No requests match your filters.</div>
            <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={clearAll}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className={viewMode === 'card' ? 'br-grid' : 'br-list'}>
            {pageItems.map((job) => (
              <RequestCard
                key={job._id}
                job={job}
                myBid={myBidByJobId[String(job._id)]}
                onBid={(j) => {
                  if (!user) { navigate('/login'); return }
                  setBidJob(j)
                }}
              />
            ))}
          </div>
        )}

        {/* pagination */}
        {totalPages > 1 && (
          <div className="br-pagination">
            <button
              type="button"
              className="br-page-btn"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum
              if (totalPages <= 7) {
                pageNum = i + 1
              } else if (page <= 4) {
                pageNum = i + 1 <= 5 ? i + 1 : i === 5 ? '…' : totalPages
              } else if (page >= totalPages - 3) {
                pageNum = i === 0 ? 1 : i === 1 ? '…' : totalPages - (6 - i)
              } else {
                const map = [1, '…', page - 1, page, page + 1, '…', totalPages]
                pageNum = map[i]
              }
              if (pageNum === '…') return <span key={i} className="br-page-ellipsis">…</span>
              return (
                <button
                  key={pageNum}
                  type="button"
                  className={`br-page-btn${page === pageNum ? ' active' : ''}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              type="button"
              className="br-page-btn"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      </div>{/* end br-page */}

      {/* bid modal */}
      {bidJob && (
        <BidModal
          job={bidJob}
          onClose={() => setBidJob(null)}
          onSubmit={handleBidSubmit}
        />
      )}
    </div>
  )
}
