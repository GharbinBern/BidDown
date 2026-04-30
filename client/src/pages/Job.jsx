import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  Circle,
  CircleCheckBig,
  ClipboardCheck,
  Clock3,
  FileSignature,
  Hammer,
  MapPin,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { api } from '../api'
import { useAuthStore, useJobsStore } from '../store'

const FLOW = ['contract', 'escrow', 'in_progress', 'completed']

const FLOW_META = {
  contract: { label: 'Contract', Icon: FileSignature },
  escrow: { label: 'Escrow', Icon: ShieldCheck },
  in_progress: { label: 'In Progress', Icon: Hammer },
  completed: { label: 'Complete', Icon: CircleCheckBig },
}

const WF_STEPS = [
  { id: 'bid_accepted', label: 'Bid accepted' },
  { id: 'contract',     label: 'Details confirmed' },
  { id: 'in_progress',  label: 'Work in progress' },
  { id: 'payment',      label: 'Payment released' },
  { id: 'reviews',      label: 'Reviews' },
]

function wfStageToStep(stage) {
  if (stage === 'bidding' || stage === 'contract') return 1
  if (stage === 'escrow') return 1
  if (stage === 'in_progress' || stage === 'review' || stage === 'dispute') return 2
  if (stage === 'completed') return 3
  return 1
}

function toDateText(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString()
}

function stageToRailIndex(stage) {
  const safe = stage === 'dispute' ? 'review' : stage
  const idx = FLOW.indexOf(safe)
  return idx < 0 ? 0 : idx
}

function timeLeftHours(value) {
  if (!value) return null
  const ms = new Date(value).getTime() - Date.now()
  if (Number.isNaN(ms)) return null
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60)))
}

function StageRail({ stage, isDispute }) {
  const currentIndex = stageToRailIndex(stage)

  return (
    <div className="wf-rail" aria-label="Workflow stages">
      {FLOW.map((id, index) => {
        const done = index < currentIndex || stage === 'completed'
        const active = index === currentIndex && stage !== 'completed'
        const Icon = FLOW_META[id].Icon

        return (
          <div key={id} className="wf-rail-segment">
            <div className="wf-rail-node-wrap">
              <div className={`wf-rail-node ${done ? 'done' : ''} ${active ? 'active' : ''} ${isDispute && active ? 'dispute' : ''}`}>
                {done ? <CircleCheckBig size={15} /> : <Icon size={15} />}
              </div>
              <div className={`wf-rail-label ${done ? 'done' : ''} ${active ? 'active' : ''}`}>{FLOW_META[id].label}</div>
            </div>
            {index < FLOW.length - 1 && <div className={`wf-rail-line ${done ? 'done' : ''}`} />}
          </div>
        )
      })}
    </div>
  )
}

/* ── bidding-view helpers ──────────────────────────────────── */
function msRemaining(deadline) {
  return Math.max(0, new Date(deadline).getTime() - Date.now())
}

function formatHMS(ms) {
  if (ms <= 0) return { h: '--', m: '--', s: '--', ended: true }
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return { h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0'), ended: false }
}

function timeAgo(dateStr) {
  const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (diffMin < 1)  return 'just now'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)   return `${diffH}h ago`
  return `${Math.floor(diffH / 24)}d ago`
}

function nameInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#0891b2', '#e11d48', '#6366f1', '#0d9488']
function avatarBg(name) {
  if (!name) return AVATAR_COLORS[0]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
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

function AvatarCircle({ name, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: avatarBg(name),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size < 32 ? 11 : 14, flexShrink: 0,
    }}>
      {nameInitials(name)}
    </div>
  )
}

function StarRow({ value }) {
  const v = Number(value) || 0
  return (
    <span style={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={11}
          fill={n <= Math.round(v) ? '#f59e0b' : 'none'}
          stroke={n <= Math.round(v) ? '#f59e0b' : '#aaa'}
          strokeWidth={1.5} />
      ))}
    </span>
  )
}

function getIntakeLocation(job) {
  const d = job.intake_details || {}
  return d.location || d.pickup_location || d.event_location || null
}

function getIntakeTags(job) {
  const d = job.intake_details || {}
  return Object.values(d).filter((v) => typeof v === 'string' && v.length > 0 && v.length < 60).slice(0, 6)
}

function getRequirements(job) {
  const d = job.intake_details || {}
  const raw = d.requirements || d.requirements_for_bidders || d.bidder_requirements || d.notes || job.requirements || ''
  if (Array.isArray(raw) && raw.length) return raw.map(String).filter(Boolean)
  if (typeof raw === 'string' && raw.trim()) {
    return raw.split(/\n|•/).map((s) => s.replace(/^[-–—*]\s*/, '').trim()).filter(Boolean)
  }
  // category-specific defaults when no explicit requirements are stored
  const DEFAULTS = {
    'Home Repairs': [
      'Include photos of past similar work in your bid note',
      'State your availability for a same-day or next-day visit',
      'List all labour costs in your bid — materials to be discussed separately',
      'Must be able to provide a written quote before work begins',
    ],
    'Tutoring': [
      'Mention the subject and student level you specialise in',
      'State whether sessions are in-person or online',
      'Include your available days and hours',
      'Share any teaching certifications or relevant experience',
    ],
    'Photography': [
      'Include a link to your portfolio in the bid note',
      'Confirm you own the equipment needed for this shoot type',
      'State your turnaround time for edited deliverables',
      'Specify whether travel to the venue is included in your bid',
    ],
    'Cleaning': [
      'Confirm whether you supply your own cleaning products',
      'State the number of cleaners you will bring',
      'Include your availability for the requested frequency',
      'Provide proof of previous cleaning contracts if available',
    ],
    'Delivery': [
      'State the type and size of vehicle you will use',
      'Confirm you can handle the described load safely',
      'Include any fuel or handling surcharges in your bid',
      'Specify whether you offer real-time delivery tracking',
    ],
    'Design & Print': [
      'Share samples of similar design work in your note',
      'Confirm you can meet the stated print deadline',
      'State the number of revision rounds included in your bid',
      'Clarify whether print delivery to the client is included',
    ],
  }
  return DEFAULTS[job.category] || []
}

function Countdown({ deadline }) {
  const [tick, setTick] = useState(() => formatHMS(msRemaining(deadline)))
  useEffect(() => {
    const id = setInterval(() => setTick(formatHMS(msRemaining(deadline))), 1000)
    return () => clearInterval(id)
  }, [deadline])
  return (
    <div className={`jd-countdown${tick.ended ? ' ended' : ''}`}>
      <span className="jd-cd-num">{tick.h}</span>
      <span className="jd-cd-label">HRS</span>
      <span className="jd-cd-sep">:</span>
      <span className="jd-cd-num">{tick.m}</span>
      <span className="jd-cd-label">MIN</span>
      <span className="jd-cd-sep">:</span>
      <span className="jd-cd-num">{tick.s}</span>
      <span className="jd-cd-label">SEC</span>
    </div>
  )
}

function BiddingView({ job, bids, myBid, isAuth, onBidSubmit, onAwardBid, currentUserId }) {
  const navigate = useNavigate()
  const ms       = msRemaining(job.deadline)
  const isUrgent = ms > 0 && ms < 7_200_000
  const isSoon   = ms > 0 && ms < 86_400_000
  const location = getIntakeLocation(job)
  const tags     = getIntakeTags(job)
  const reqs     = getRequirements(job)

  const sortedBids = useMemo(() => [...bids].sort((a, b) => Number(a.amount) - Number(b.amount)), [bids])
  const totalBidCount = Math.max(Number(job.bids_count || 0), sortedBids.length)
  const lowestAmt  = sortedBids[0] ? Number(sortedBids[0].amount) : null

  const [amount, setAmount]         = useState('')
  const [note, setNote]             = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [awardingBidId, setAwardingBidId] = useState(null)
  const [selectedBidId, setSelectedBidId] = useState(null)

  const parsedAmt   = Number(amount)
  const minRequired = Number(job.budget)
  const amountValid = amount !== '' && parsedAmt > 0 && parsedAmt <= minRequired

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuth) { navigate('/login'); return }
    if (isOwner) { toast.error('You cannot bid on your own job'); return }
    if (!amountValid) { toast.error(`Bid must be GH¢ ${minRequired.toLocaleString()} or less`); return }
    setSubmitting(true)
    try {
      const noteText = note.trim()

      await onBidSubmit({
        job_id: job._id,
        amount: parsedAmt,
        note: noteText,
        proposal: {
          timeline_days: 1,
          supervision_plan: 'To be finalized with buyer before kickoff.',
          milestone_plan: noteText || 'Single milestone delivery and final handoff.',
          category_detail: noteText || `${job.category || 'Service'} delivery based on posted requirements.`,
        },
      })
      toast.success('Bid placed successfully!')
      setAmount(''); setNote('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place bid')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAward = async () => {
    if (!selectedBidId) {
      toast.error('Please select a bid to award')
      return
    }
    setAwardingBidId(selectedBidId)
    try {
      await onAwardBid(selectedBidId)
      toast.success('Bid awarded successfully!')
      setSelectedBidId(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to award bid')
    } finally {
      setAwardingBidId(null)
    }
  }

  const owner = job.owner_id || {}
  const ownerId = normalizeUserId(owner._id || owner)
  const isOwner = !!currentUserId && !!ownerId && String(currentUserId) === String(ownerId)
  const memberSince = owner.createdAt
    ? new Date(owner.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null
  const ownerLocation = getIntakeLocation(job)
  const biddingLive = ms > 0 && job.status === 'open'
  const jobClosed = job.status !== 'open' && !job.winning_bid_id
  const showAwardSection = isOwner && jobClosed && sortedBids.length > 0
  const visibleBids = sortedBids.slice(0, isAuth ? sortedBids.length : Math.min(5, sortedBids.length))
  const hasHiddenBids = totalBidCount > sortedBids.length
  const hasPlacedBid = !!myBid

  const toggleAwardSelection = (bidId) => {
    setSelectedBidId((prev) => (String(prev) === String(bidId) ? null : bidId))
  }

  return (
    <div className="jd-shell">
      <div className="jd-topbar">
        {biddingLive && (
          <div className="jd-live-badge">
            <span className="jd-live-dot" />
            Bidding Live
          </div>
        )}
      </div>

      <div className="jd-body">
        {/* ── left column ─── */}
        <div className="jd-main">

          <div className="jd-header-card">
            <div className="jd-header-top">
              <div className="jd-cats">
                <span className="jd-cat">{job.category || 'General'}</span>
                {job.subcategory && <><span className="jd-cat-dot"> · </span><span className="jd-cat">{job.subcategory}</span></>}
              </div>
              {location && <div className="jd-location"><MapPin size={13} strokeWidth={2} />{location}</div>}
              {isUrgent
                ? <span className="jd-status-badge urgent">Closing Soon</span>
                : isSoon
                ? <span className="jd-status-badge soon">Closing Soon</span>
                : ms > 0
                ? <span className="jd-status-badge open">Open</span>
                : <span className="jd-status-badge closed">Closed</span>}
            </div>

            <h1 className="jd-title">{job.title}</h1>

            <div className="jd-stats-grid">
              <div className="jd-stat-cell">
                <div className="jd-stat-label">BUDGET CEILING</div>
                <div className="jd-stat-val blue">GH¢ {Number(job.budget).toLocaleString()}</div>
                <div className="jd-stat-sub">Max client will pay</div>
              </div>
              <div className="jd-stat-cell">
                <div className="jd-stat-label">LOWEST BID SO FAR</div>
                {lowestAmt !== null && !hasHiddenBids ? (
                  <>
                    <div className="jd-stat-val green">GH¢ {lowestAmt.toLocaleString()}</div>
                    <div className="jd-stat-sub">Current winning bid</div>
                  </>
                ) : hasHiddenBids ? (
                  <>
                    <div className="jd-stat-val muted">Sealed</div>
                    <div className="jd-stat-sub">Hidden until award</div>
                  </>
                ) : (
                  <>
                    <div className="jd-stat-val muted">—</div>
                    <div className="jd-stat-sub">No bids yet</div>
                  </>
                )}
              </div>
              <div className="jd-stat-cell">
                <div className="jd-stat-label">TOTAL BIDS</div>
                <div className="jd-stat-val">{totalBidCount}</div>
                <div className="jd-stat-sub">{totalBidCount > 0 ? `From ${totalBidCount} provider${totalBidCount !== 1 ? 's' : ''}` : 'No bids yet'}</div>
              </div>
              <div className="jd-stat-cell no-border">
                <div className="jd-stat-label">CLOSES IN</div>
                <Countdown deadline={job.deadline} />
              </div>
            </div>


          </div>

          <div className="jd-section-card">
            <div className="jd-section-title">Job description</div>
            <p className="jd-desc-text">{job.description || 'No description provided.'}</p>
          </div>

          {reqs.length > 0 && (
            <div className="jd-section-card">
              <div className="jd-section-title">Requirements for bidders</div>
              <ul className="jd-reqs-list">
                {reqs.map((r, i) => <li key={i} className="jd-req-item">{r}</li>)}
              </ul>
            </div>
          )}

          <div className="jd-section-card">
            <div className="jd-section-title">Proposals submitted — {totalBidCount}</div>
            {showAwardSection && (
              <div className="jd-award-inline-note">
                Select one bidder below, then award. Click again to unselect.
              </div>
            )}
            <div className="jd-ladder-ceiling">
              <span>Budget ceiling set by client</span>
              <span className="jd-ladder-ceiling-amt">GH¢ {Number(job.budget).toLocaleString()}</span>
            </div>
            {sortedBids.length === 0 ? (
              <div className="jd-ladder-empty">
                {hasHiddenBids
                  ? (isOwner
                    ? 'Proposals exist but could not be loaded right now. Please refresh.'
                    : 'Proposals are sealed until the client makes their selection.')
                  : 'No proposals yet. Be the first to submit.'}
              </div>
            ) : (
              <div className="jd-ladder">
                {visibleBids.map((bid, i) => {
                  const seller = bid.seller_id || {}
                  const sellerId = normalizeUserId(seller._id || seller)
                  const isWinner = i === 0
                  const isSelected = showAwardSection && String(selectedBidId) === String(bid._id)
                  return (
                    <div
                      key={bid._id || i}
                      className={`jd-ladder-row${isWinner ? ' winner' : ''}${showAwardSection ? ' selectable' : ''}${isSelected ? ' selected' : ''}`}
                      onClick={showAwardSection ? () => toggleAwardSelection(bid._id) : undefined}
                      role={showAwardSection ? 'button' : undefined}
                      tabIndex={showAwardSection ? 0 : undefined}
                      onKeyDown={showAwardSection ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggleAwardSelection(bid._id)
                        }
                      } : undefined}
                    >
                      {showAwardSection && (
                        <span className="jd-ladder-select" aria-hidden="true">{isSelected ? '●' : '○'}</span>
                      )}
                      <span className="jd-ladder-rank">{i + 1}</span>
                      <button
                        type="button"
                        className="jd-profile-link"
                        onClick={(e) => {
                          e.stopPropagation()
                          sellerId && navigate(`/providers/${sellerId}`)
                        }}
                        title={sellerId ? 'View provider profile' : 'Profile unavailable'}
                        disabled={!sellerId}
                      >
                        <AvatarCircle name={seller.name} size={34} />
                      </button>
                      <div className="jd-ladder-info">
                        <button
                          type="button"
                          className="jd-ladder-name jd-profile-link"
                          onClick={(e) => {
                            e.stopPropagation()
                            sellerId && navigate(`/providers/${sellerId}`)
                          }}
                          title={sellerId ? 'View provider profile' : 'Profile unavailable'}
                          disabled={!sellerId}
                        >
                          {seller.name || 'Provider'}
                          {isWinner && <span className="jd-winner-dot" />}
                        </button>
                        <div className="jd-ladder-stars">
                          <StarRow value={seller.average_rating} />
                          <span className="jd-ladder-rating"> {Number(seller.average_rating || 0).toFixed(1)}</span>
                          {seller.total_jobs_completed > 0 && (
                            <span className="jd-ladder-jobs"> · {seller.total_jobs_completed} jobs</span>
                          )}
                        </div>
                      </div>
                      <div className="jd-ladder-right">
                        <div className={`jd-ladder-amt${isWinner ? ' green' : ''}`}>GH¢ {Number(bid.amount).toLocaleString()}</div>
                        <div className="jd-ladder-ago">{timeAgo(bid.createdAt)}</div>
                      </div>
                    </div>
                  )
                })}
                {!isAuth && sortedBids.length > 5 && (
                  <div className="jd-ladder-hidden">
                    {sortedBids.length - 5} more bids hidden ·{' '}
                    <button type="button" onClick={() => navigate('/login')}>sign in to see full ladder</button>
                  </div>
                )}
                {showAwardSection && (
                  <div className="jd-award-inline-actions">
                    <button
                      type="button"
                      className="jd-award-btn"
                      onClick={handleAward}
                      disabled={!selectedBidId || awardingBidId}
                    >
                      {awardingBidId ? 'Awarding bid…' : 'Award Selected Bid'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── right sidebar ─── */}
        <aside className="jd-sidebar">
          <div className="jd-bid-card">
            <div className="jd-bid-card-title">
              {isOwner ? 'Your posted job' : biddingLive ? 'Place your bid' : 'Auction closed'}
            </div>
            <p className="jd-bid-subtext">
              {isOwner
                ? 'You posted this request, so bidding is disabled for your account.'
                : hasPlacedBid
                ? 'You already submitted a bid for this job. You cannot submit another bid.'
                : totalBidCount > 0
                ? `${totalBidCount} proposal${totalBidCount !== 1 ? 's' : ''} submitted. Add yours before the deadline.`
                : 'Be the first to submit a proposal for this job.'}
            </p>


            {!isOwner && hasPlacedBid && (
              <div className="jd-bid-lowest-box">
                Your submitted bid: <strong>GH¢ {Number(myBid.amount || 0).toLocaleString()}</strong>
                <br />
                Status: <strong>{String(myBid.status || 'pending').toUpperCase()}</strong>
              </div>
            )}

            {!isOwner && biddingLive && !hasPlacedBid && (
              <form onSubmit={handleSubmit} className="jd-bid-form">
              <div className="jd-form-group">
                <label className="jd-form-label">Your bid amount (GH¢)</label>
                <input
                  type="number"
                  className="jd-amount-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={String(job.budget)}
                  min={1}
                  max={job.budget}
                />
                <div className="jd-amount-hint">
                  Must be at or below the GH¢ {Number(job.budget).toLocaleString()} budget ceiling
                </div>
              </div>

              <div className="jd-form-group">
                <label className="jd-form-label">Bid note <span className="jd-opt">(optional but recommended)</span></label>
                <textarea
                  className="jd-form-textarea"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Briefly describe your experience and approach. A good note significantly improves your chances."
                  rows={4}
                />
              </div>

              <button
                type="submit"
                className="jd-submit-btn"
                disabled={submitting || (isAuth && amount !== '' && !amountValid)}
              >
                {submitting
                  ? 'Placing bid…'
                  : !isAuth
                  ? 'Sign in to bid'
                  : `Submit Bid · GH¢ ${parsedAmt > 0 ? parsedAmt.toLocaleString() : '…'}`}
              </button>
              <p className="jd-submit-disclaimer">
                Your bid is binding if selected. Payment is held in escrow until work is confirmed complete.
              </p>
              </form>
            )}

            {!isOwner && !biddingLive && (
              <div className="jd-bid-subtext" style={{ marginTop: 8 }}>
                Bidding has closed. The client is reviewing submitted bids.
              </div>
            )}
          </div>

          <div className="jd-posted-card">
            <div className="jd-posted-label">POSTED BY</div>
            <div className="jd-posted-row">
              <button
                type="button"
                className="jd-profile-link jd-posted-profile"
                onClick={() => ownerId && navigate(`/providers/${ownerId}`)}
                title={ownerId ? 'View client profile' : 'Profile unavailable'}
                disabled={!ownerId}
              >
                <AvatarCircle name={owner.name} size={42} />
                <div>
                  <div className="jd-posted-name">{owner.name || 'Client'}</div>
                  <div className="jd-posted-meta">
                    {memberSince ? `Member since ${memberSince}` : 'Verified Client'}
                    {ownerLocation ? ` · ${ownerLocation}` : ''}
                  </div>
                </div>
              </button>
            </div>
            <div className="jd-posted-stats">
              <div className="jd-posted-stat">
                <div className="jd-posted-stat-val">
                  <Star size={13} fill="#f59e0b" stroke="#f59e0b" strokeWidth={1.5} />{' '}
                  {Number(owner.average_rating || 5.0).toFixed(1)}
                </div>
                <div className="jd-posted-stat-label">Avg. rating given</div>
              </div>
              <div className="jd-posted-stat">
                <div className="jd-posted-stat-val">{owner.reviews_count || job.bids_count || 0}</div>
                <div className="jd-posted-stat-label">Jobs posted</div>
              </div>
              <div className="jd-posted-stat">
                <div className="jd-posted-stat-val">{Number(owner.response_rate ?? 100).toFixed(0)}%</div>
                <div className="jd-posted-stat-label">Payment rate</div>
              </div>
              <div className="jd-posted-stat">
                <div className="jd-posted-stat-val">{owner.total_jobs_completed || 0}</div>
                <div className="jd-posted-stat-label">Jobs completed</div>
              </div>
            </div>
          </div>

          <div className="jd-how-card">
            <div className="jd-how-title">How selection works</div>
            {[
              'All proposals are sealed until the deadline passes',
              'Client reviews price, rating, and proposal together',
              'Lowest price is not automatically selected',
              'Selected provider is notified immediately',
              'Payment is held in escrow until work is confirmed done',
              'Both sides leave a public review after completion',
            ].map((line) => (
              <div key={line} className="jd-how-row">
                <span className="jd-how-check">✓</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function JobDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { selectedJob, fetchJob, loading } = useJobsStore()

  const [bids, setBids]                     = useState([])
  const [busyAction, setBusyAction]         = useState('')
  const [progressMessage, setProgressMessage] = useState('')
  const [submitNote, setSubmitNote]         = useState('')
  const [deliverableUrl, setDeliverableUrl] = useState('')
  const [revisionReason, setRevisionReason] = useState('')
  const [disputeReason, setDisputeReason]   = useState('')
  const [contractDraft, setContractDraft]   = useState({ scope: '', deadline: '', agreed_price: '' })
  const [jobReviews, setJobReviews]         = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewRating, setReviewRating]     = useState(5)
  const [reviewComment, setReviewComment]   = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [viewingStep, setViewingStep]       = useState(null)

  useEffect(() => { fetchJob(id) }, [id, fetchJob])

  const loadBids = useCallback(async () => {
    try {
      const res = await api.getJobBids(id)
      setBids(res.data.bids || res.data || [])
    } catch { /* non-fatal */ }
  }, [id])

  useEffect(() => { loadBids() }, [loadBids])

  const userId = normalizeUserId(user?._id || user?.id)
  const ownerId = normalizeUserId(selectedJob?.owner_id?._id || selectedJob?.owner_id)
  const winningSellerId = normalizeUserId(selectedJob?.winning_bid_id?.seller_id?._id || selectedJob?.winning_bid_id?.seller_id)
  const fallbackWinningSellerId = useMemo(() => {
    if (!Array.isArray(bids) || bids.length === 0) return null
    const winningBidId = normalizeUserId(selectedJob?.winning_bid_id?._id || selectedJob?.winning_bid_id)
    const acceptedBid = bids.find((bid) => {
      const bidId = normalizeUserId(bid?._id)
      return (winningBidId && bidId && String(bidId) === String(winningBidId)) || bid?.status === 'accepted'
    })
    return normalizeUserId(acceptedBid?.seller_id?._id || acceptedBid?.seller_id)
  }, [bids, selectedJob?.winning_bid_id])
  const resolvedSellerId = winningSellerId || fallbackWinningSellerId

  const isBuyer = !!userId && !!ownerId && String(userId) === String(ownerId)
  const isSeller = !!userId && !!resolvedSellerId && String(userId) === String(resolvedSellerId)
  const canSeeWorkflow = isBuyer || isSeller

  const stage = useMemo(() => {
    const explicit = selectedJob?.workflow_stage
    if (explicit && explicit !== 'bidding') return explicit

    if (!selectedJob?.winning_bid_id) return explicit || 'bidding'
    if (selectedJob?.status === 'completed' || selectedJob?.escrow_released) return 'completed'
    if (selectedJob?.dispute_raised) return 'dispute'
    if (selectedJob?.work_submitted_at || selectedJob?.review_deadline) return 'review'
    if (selectedJob?.escrow_deposited_at || selectedJob?.work_started_at || (selectedJob?.progress_updates || []).length > 0) return 'in_progress'
    return 'contract'
  }, [selectedJob])
  const reviewHoursLeft = useMemo(() => timeLeftHours(selectedJob?.review_deadline), [selectedJob?.review_deadline])
  const revieweeId = useMemo(() => {
    if (isBuyer) return resolvedSellerId
    if (isSeller) return ownerId
    return null
  }, [isBuyer, isSeller, ownerId, resolvedSellerId])
  const reviewTargetLabel = isBuyer ? 'provider' : isSeller ? 'client' : 'participant'

  useEffect(() => {
    if (!selectedJob || selectedJob.workflow_stage !== 'contract') return
    setContractDraft({
      scope: selectedJob.contract_terms?.scope || selectedJob.description || '',
      deadline: selectedJob.contract_terms?.deadline ? new Date(selectedJob.contract_terms.deadline).toISOString().slice(0, 10) : '',
      agreed_price: selectedJob.contract_terms?.agreed_price || selectedJob.escrow_amount || '',
    })
  }, [selectedJob])

  useEffect(() => {
    let cancelled = false

    const loadJobReviews = async () => {
      if (!canSeeWorkflow || stage !== 'completed') return
      setReviewsLoading(true)
      try {
        const { data } = await api.getJobReview(id)
        if (cancelled) return
        setJobReviews(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setJobReviews([])
      } finally {
        if (!cancelled) setReviewsLoading(false)
      }
    }

    loadJobReviews()
    return () => {
      cancelled = true
    }
  }, [id, canSeeWorkflow, stage])

  const myReview = useMemo(() => {
    if (!userId) return null
    return jobReviews.find((entry) => {
      const reviewerId = normalizeUserId(entry?.reviewer_id?._id || entry?.reviewer_id)
      return reviewerId && String(reviewerId) === String(userId)
    }) || null
  }, [jobReviews, userId])

  const runAction = async (key, action, successMessage) => {
    setBusyAction(key)
    try {
      await action()
      await fetchJob(id, { silent: true })
      toast.success(successMessage)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Action failed')
    } finally {
      setBusyAction('')
    }
  }

  const myBid = useMemo(() => {
    if (!userId || !bids.length) return null
    return bids.find((b) => String(b.seller_id?._id || b.seller_id) === String(userId)) || null
  }, [bids, userId])

  const handleBidSubmit = useCallback(async (data) => {
    await api.submitBid(data)
    await Promise.all([fetchJob(id, { silent: true }), loadBids()])
  }, [id, fetchJob, loadBids])

  const handleAwardBid = useCallback(async (bidId) => {
    await api.closeJob(id, { bid_id: bidId })
    await fetchJob(id, { silent: true })
  }, [id, fetchJob])

  const submitInlineReview = async () => {
    if (!canSeeWorkflow) {
      toast.error('Only job participants can review')
      return
    }
    if (myReview) {
      toast.error('You already reviewed this job')
      return
    }

    setReviewSubmitting(true)
    try {
      const payload = {
        job_id: id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      }
      if (revieweeId) payload.reviewee_id = revieweeId

      await api.createReview({
        ...payload,
      })

      const { data } = await api.getJobReview(id)
      setJobReviews(Array.isArray(data) ? data : [])
      setReviewComment('')
      toast.success('Review submitted successfully')
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to submit review')
    } finally {
      setReviewSubmitting(false)
    }
  }

  if (loading && !selectedJob) return <div className="main" />
  if (!selectedJob) return <div className="main" style={{ padding: 40, color: 'var(--muted)' }}>Job not found.</div>

  /* bidding and award-selection phase */
  if (!selectedJob.winning_bid_id && selectedJob.status !== 'cancelled') {
    return (
      <BiddingView
        job={selectedJob}
        bids={bids}
        myBid={myBid}
        isAuth={isAuthenticated}
        currentUserId={userId}
        onBidSubmit={handleBidSubmit}
        onAwardBid={handleAwardBid}
      />
    )
  }

  /* post-acceptance → workflow view */
  const activeStep  = wfStageToStep(stage)
  const displayStep = viewingStep !== null ? viewingStep : activeStep
  const isDispute   = stage === 'dispute'
  const owner       = selectedJob.owner_id || {}
  const seller      = selectedJob.winning_bid_id?.seller_id || {}
  const agreedPrice = selectedJob.contract_terms?.agreed_price || selectedJob.escrow_amount || selectedJob.winning_bid_id?.amount || 0
  const location    = getIntakeLocation(selectedJob)
  const jobNum      = String(selectedJob._id || id).slice(-6).toUpperCase()

  return (
    <div className="wf2-shell">

      {/* Job header card */}
      <div className="wf2-header">
        <div className="wf2-header-left">
          <div className="wf2-cats">
            <span className="wf2-cat">{selectedJob.category || 'General'}</span>
            {selectedJob.subcategory && <><span className="wf2-cat-dot"> · </span><span className="wf2-cat">{selectedJob.subcategory}</span></>}
          </div>
          <h1 className="wf2-title">{selectedJob.title}</h1>
          <div className="wf2-meta-row">
            {location && <><MapPin size={12} strokeWidth={2} /><span>{location}</span><span className="wf2-dot">·</span></>}
            <span>Job #{jobNum}</span>
            <span className="wf2-dot">·</span>
            <span>{owner.name || 'Client'} → {seller.name || 'Provider'}</span>
          </div>
        </div>
        <div className="wf2-header-right">
          <div className="wf2-price">GH¢ {Number(agreedPrice).toLocaleString()}</div>
          <div className="wf2-price-label">Agreed price</div>
          {stage === 'completed'
            ? <div className="wf2-released-badge"><CircleCheckBig size={12} />Released</div>
            : <div className="wf2-escrow-badge"><ShieldCheck size={12} />In escrow</div>}
        </div>
      </div>

      {/* Step rail */}
      <div className="wf2-rail">
        {WF_STEPS.map((step, i) => {
          const done   = i < displayStep
          const active = i === displayStep
          const isLast = i === WF_STEPS.length - 1
          return (
            <div key={step.id} className="wf2-step" style={isLast ? { flex: '0 0 auto' } : undefined}>
              <div className="wf2-step-inner">
                <div className={`wf2-circle${done ? ' done' : ''}${active ? ' active' : ''}${isDispute && active ? ' dispute' : ''}`}>
                  {done ? <CircleCheckBig size={15} /> : i + 1}
                </div>
                <div className={`wf2-step-label${done ? ' done' : ''}${active ? ' active' : ''}`}>{step.label}</div>
              </div>
              {!isLast && <div className={`wf2-step-line${done ? ' done' : ''}`} />}
            </div>
          )
        })}
      </div>

      {/* Current step card */}
      <div className="wf2-card">
        <div className={`wf2-card-head${isDispute ? ' dispute' : stage === 'completed' ? ' success' : ''}`}>
          <div className="wf2-card-head-left">
            <span className="wf2-card-step-num">{displayStep + 1}</span>
            <span className="wf2-card-step-label">
              {isDispute ? 'Dispute Under Review' : WF_STEPS[displayStep]?.label}
            </span>
          </div>
          <span className="wf2-card-cur-label">
            {isDispute ? 'Escalated' : displayStep === 5 ? 'Reviews' : stage === 'completed' ? 'Complete' : 'Current step'}
          </span>
        </div>

        <div className="wf2-card-body">

          {/* No access */}
          {!canSeeWorkflow && (
            <div className="wf2-info-note">Only the client and winning provider can access workflow controls for this job.</div>
          )}

          {/* ── Contract / Escrow stage ───────────────────────── */}
          {canSeeWorkflow && (stage === 'contract' || stage === 'bidding' || stage === 'escrow') && (
            <>
              <div className="wf2-data-row">
                <div className="wf2-data-cell">
                  <div className="wf2-data-label">Agreed Price</div>
                  <div className="wf2-data-val">GH¢ {Number(agreedPrice).toLocaleString()}</div>
                </div>
                <div className="wf2-data-cell">
                  <div className="wf2-data-label">Deadline</div>
                  <div className="wf2-data-val">{toDateText(selectedJob.contract_terms?.deadline)}</div>
                </div>
                <div className="wf2-data-cell">
                  <div className="wf2-data-label">Escrow</div>
                  <div className="wf2-data-val" style={{ color: selectedJob.escrow_deposited_at ? 'var(--green)' : 'var(--muted)' }}>
                    {selectedJob.escrow_deposited_at ? 'Funded' : 'Pending'}
                  </div>
                </div>
              </div>

              {stage !== 'escrow' && isBuyer && (
                <>
                  <div className="wf2-form-group">
                    <label className="wf2-form-label">Contract scope</label>
                    <textarea className="wf2-form-textarea" rows={3} value={contractDraft.scope} onChange={(e) => setContractDraft((p) => ({ ...p, scope: e.target.value }))} placeholder="Define exact deliverables and expectations" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div className="wf2-form-group" style={{ marginBottom: 0 }}>
                      <label className="wf2-form-label">Deadline</label>
                      <input className="wf2-form-input" type="date" value={contractDraft.deadline} onChange={(e) => setContractDraft((p) => ({ ...p, deadline: e.target.value }))} />
                    </div>
                    <div className="wf2-form-group" style={{ marginBottom: 0 }}>
                      <label className="wf2-form-label">Agreed Price (GH¢)</label>
                      <input className="wf2-form-input" type="number" min="50" value={contractDraft.agreed_price} onChange={(e) => setContractDraft((p) => ({ ...p, agreed_price: e.target.value }))} />
                    </div>
                  </div>
                </>
              )}

              {stage !== 'escrow' && !isBuyer && (
                <div className="wf2-info-note">{selectedJob.contract_terms?.scope || selectedJob.description || 'Contract scope to be defined by the client.'}</div>
              )}

              {stage !== 'escrow' && (
                <div className="wf2-sign-row">
                  <div className={`wf2-sign-card${selectedJob.contract_terms?.buyer_confirmed ? ' signed' : ''}`}>
                    <div className="wf2-sign-role">Client</div>
                    <div className="wf2-sign-name">{owner.name || 'Buyer'}</div>
                    <div className={`wf2-sign-status${selectedJob.contract_terms?.buyer_confirmed ? '' : ' pending'}`}>
                      {selectedJob.contract_terms?.buyer_confirmed ? 'Signed' : 'Pending signature'}
                    </div>
                  </div>
                  <div className={`wf2-sign-card${selectedJob.contract_terms?.seller_confirmed ? ' signed' : ''}`}>
                    <div className="wf2-sign-role">Provider</div>
                    <div className="wf2-sign-name">{seller.name || 'Provider'}</div>
                    <div className={`wf2-sign-status${selectedJob.contract_terms?.seller_confirmed ? '' : ' pending'}`}>
                      {selectedJob.contract_terms?.seller_confirmed ? 'Signed' : 'Pending signature'}
                    </div>
                  </div>
                </div>
              )}

              <div className="wf2-actions">
                {stage !== 'escrow' && isBuyer && (
                  <button className="wf2-action-sec" disabled={busyAction === 'saveContract'}
                    onClick={() => runAction('saveContract', () => api.updateContractDraft(id, { scope: contractDraft.scope, deadline: contractDraft.deadline, agreed_price: Number(contractDraft.agreed_price) }), 'Contract terms saved')}>
                    {busyAction === 'saveContract' ? 'Saving...' : 'Save Terms'}
                  </button>
                )}
                {stage !== 'escrow' && (
                  <button className="wf2-action-primary" disabled={busyAction === 'confirmContract'}
                    onClick={() => runAction('confirmContract', () => api.confirmContract(id), 'Contract signed')}>
                    <FileSignature size={14} />
                    {busyAction === 'confirmContract' ? 'Signing...' : 'Sign Contract'}
                  </button>
                )}
                {stage === 'escrow' && isBuyer && (
                  <button className="wf2-action-primary" disabled={busyAction === 'escrow'}
                    onClick={() => runAction('escrow', () => api.depositEscrow(id), 'Escrow funded. Provider can now begin work')}>
                    <ShieldCheck size={14} />
                    {busyAction === 'escrow' ? 'Processing...' : 'Deposit to Escrow'}
                  </button>
                )}
                {stage === 'escrow' && !isBuyer && (
                  <div className="wf2-info-note" style={{ margin: 0, flex: 1 }}>Waiting for the client to fund escrow before work can begin.</div>
                )}
              </div>
            </>
          )}

          {/* ── In Progress stage ────────────────────────────── */}
          {canSeeWorkflow && (stage === 'in_progress' || stage === 'review' || stage === 'dispute') && (
            <>
              <div className="wf2-data-row">
                <div className="wf2-data-cell">
                  <div className="wf2-data-label">Escrow</div>
                  <div className="wf2-data-val" style={{ color: 'var(--green)' }}>Secured</div>
                </div>
                <div className="wf2-data-cell">
                  <div className="wf2-data-label">Deadline</div>
                  <div className="wf2-data-val">{toDateText(selectedJob.contract_terms?.deadline)}</div>
                </div>
              </div>

              {/* Seller: mark as complete (only when not yet submitted) */}
              {isSeller && !selectedJob.work_submitted_at && (
                <>
                  <div className="wf2-form-group">
                    <label className="wf2-form-label">Completion note <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(optional)</span></label>
                    <textarea className="wf2-form-textarea" rows={3} value={submitNote} onChange={(e) => setSubmitNote(e.target.value)} placeholder="Describe what was delivered" />
                  </div>
                  <div className="wf2-actions">
                    <button className="wf2-action-primary" disabled={busyAction === 'submitWork'}
                      onClick={() => runAction('submitWork', () => api.submitWork(id, { note: submitNote.trim() }).then(() => setSubmitNote('')), 'Job marked as complete. Awaiting client approval')}>
                      <ClipboardCheck size={14} />
                      {busyAction === 'submitWork' ? 'Submitting...' : 'Mark as Complete'}
                    </button>
                  </div>
                </>
              )}

              {!isSeller && !selectedJob.work_submitted_at && (
                <div className="wf2-info-note" style={{ marginTop: 8 }}>
                  Provider is currently working on the delivery. You will be notified when they mark the job as complete.
                </div>
              )}

              {/* After seller marks complete — buyer approval actions */}
              {selectedJob.work_submitted_at && (
                isDispute ? (
                  <div className="wf2-info-note" style={{ borderLeftColor: '#c0392b', background: '#fdf0ef', color: 'var(--text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <AlertTriangle size={14} />
                      <strong>Dispute Under Manual Review</strong>
                    </div>
                    <div>Reason: {selectedJob.dispute_reason || 'No reason provided'}</div>
                    <div style={{ marginTop: 4, fontSize: 11, color: 'var(--muted)' }}>Raised: {toDateText(selectedJob.dispute_raised_at)}</div>
                  </div>
                ) : (
                  <>
                    {selectedJob.deliverable_note && (
                      <div className="wf2-info-note">
                        <strong>Completion note:</strong> {selectedJob.deliverable_note}
                      </div>
                    )}
                    {isBuyer ? (
                      <div className="wf2-actions" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
                        <button className="wf2-action-primary green" disabled={busyAction === 'approve'}
                          onClick={() => runAction('approve', () => api.approveWork(id), 'Work approved and payment released')}>
                          <CircleCheckBig size={14} />
                          {busyAction === 'approve' ? 'Approving...' : 'Approve and Release Payment'}
                        </button>

                        {Number(selectedJob.revision_rounds_used || 0) < 1 && (
                          <div className="wf2-sub-block">
                            <div className="wf2-sub-block-title">Request a revision</div>
                            <textarea className="wf2-form-textarea" rows={2} value={revisionReason} onChange={(e) => setRevisionReason(e.target.value)} placeholder="Describe the required fixes clearly" />
                            <button className="wf2-action-sec" style={{ marginTop: 8 }} disabled={busyAction === 'revision' || !revisionReason.trim()}
                              onClick={() => runAction('revision', () => api.requestRevision(id, { reason: revisionReason.trim() }).then(() => setRevisionReason('')), 'Revision requested')}>
                              {busyAction === 'revision' ? 'Sending...' : 'Request Revision'}
                            </button>
                          </div>
                        )}

                        <div className="wf2-sub-block">
                          <div className="wf2-sub-block-title">Escalate to dispute</div>
                          <textarea className="wf2-form-textarea" rows={2} value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} placeholder="Reason for escalating this job to dispute" />
                          <button className="wf2-action-danger" style={{ marginTop: 8 }} disabled={busyAction === 'dispute' || !disputeReason.trim()}
                            onClick={() => runAction('dispute', () => api.raiseDispute(id, { reason: disputeReason.trim() }).then(() => setDisputeReason('')), 'Dispute raised')}>
                            <AlertTriangle size={14} />
                            {busyAction === 'dispute' ? 'Submitting...' : 'Raise Dispute'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="wf2-info-note">
                        Work submitted. Waiting for the client to approve and release payment.
                      </div>
                    )}
                  </>
                )
              )}
            </>
          )}

          {/* ── Completed stage ──────────────────────────────── */}
          {stage === 'completed' && (
            <>
              <div className="wf2-data-row">
                <div className="wf2-data-cell">
                  <div className="wf2-data-label">Amount released</div>
                  <div className="wf2-data-val" style={{ color: 'var(--green)' }}>GH¢ {Number(agreedPrice).toLocaleString()}</div>
                </div>
                <div className="wf2-data-cell">
                  <div className="wf2-data-label">Released at</div>
                  <div className="wf2-data-val">{toDateText(selectedJob.payment_released_at || selectedJob.completion_date)}</div>
                </div>
                <div className="wf2-data-cell">
                  <div className="wf2-data-label">Status</div>
                  <div className="wf2-data-val" style={{ color: 'var(--green)' }}>Completed</div>
                </div>
              </div>
              <div className="wf2-info-note" style={{ borderLeftColor: 'var(--green)', background: '#ecfdf5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CircleCheckBig size={14} />
                  <strong>Job complete. Payment has been released to the provider.</strong>
                </div>
              </div>

            </>
          )}

          {/* ── Reviews step ─────────────────────────────── */}
          {stage === 'completed' && displayStep === 4 && (
            <>
              {!canSeeWorkflow && (
                <div className="wf2-info-note">Only the client and winning provider can leave a review.</div>
              )}
              {canSeeWorkflow && (
                myReview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="wf2-data-row">
                      <div className="wf2-data-cell">
                        <div className="wf2-data-label">Your rating</div>
                        <div className="wf2-data-val" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} size={14} fill={s <= myReview.rating ? 'var(--accent)' : 'none'} stroke="var(--accent)" />
                          ))}
                          <span style={{ marginLeft: 4 }}>{myReview.rating} / 5</span>
                        </div>
                      </div>
                      <div className="wf2-data-cell">
                        <div className="wf2-data-label">For</div>
                        <div className="wf2-data-val" style={{ textTransform: 'capitalize' }}>{reviewTargetLabel}</div>
                      </div>
                      <div className="wf2-data-cell">
                        <div className="wf2-data-label">Reviewed</div>
                        <div className="wf2-data-val">{toDateText(myReview.createdAt)}</div>
                      </div>
                    </div>
                    {myReview.comment && (
                      <div className="wf2-info-note" style={{ borderLeftColor: 'var(--accent)', background: '#fdf8ee' }}>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Your comment</div>
                        <div>{myReview.comment}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="wf2-sub-block" style={{ width: '100%' }}>
                    <div className="wf2-sub-block-title">Leave a review for the {reviewTargetLabel}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      {[1,2,3,4,5].map((score) => (
                        <button key={score} type="button" className="wf2-action-sec"
                          onClick={() => setReviewRating(score)}
                          style={{ minWidth: 48, justifyContent: 'center', borderColor: score <= reviewRating ? 'var(--accent)' : undefined, color: score <= reviewRating ? 'var(--accent)' : undefined }}>
                          <Star size={12} fill={score <= reviewRating ? 'currentColor' : 'none'} />
                          {score}
                        </button>
                      ))}
                    </div>
                    <textarea className="wf2-form-textarea" rows={3} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Share your experience (optional)" />
                    <div className="wf2-actions" style={{ marginTop: 10 }}>
                      <button className="wf2-action-primary" disabled={reviewSubmitting || reviewsLoading} onClick={submitInlineReview}>
                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                )
              )}
            </>
          )}

        </div>

        {/* Bottom nav */}
        <div className="wf2-card-footer">
          <button
            type="button"
            className="wf2-nav-btn"
            onClick={() => {
              if (viewingStep !== null) setViewingStep(viewingStep > 0 ? viewingStep - 1 : null)
              else navigate(-1)
            }}
          >
            ← Back
          </button>
          <span className="wf2-step-count">Step {displayStep + 1} of {WF_STEPS.length}</span>
          <button
            type="button"
            className="wf2-nav-btn"
            disabled={stage !== 'completed' || displayStep >= WF_STEPS.length - 1}
            onClick={() => setViewingStep(4)}
          >
            Next
          </button>
        </div>
      </div>

    </div>
  )
}
