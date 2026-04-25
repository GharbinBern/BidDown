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

const FLOW = ['contract', 'escrow', 'in_progress', 'review', 'completed']

const FLOW_META = {
  contract: { label: 'Contract', Icon: FileSignature },
  escrow: { label: 'Escrow', Icon: ShieldCheck },
  in_progress: { label: 'In Progress', Icon: Hammer },
  review: { label: 'Review', Icon: ClipboardCheck },
  completed: { label: 'Complete', Icon: CircleCheckBig },
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

function BiddingView({ job, bids, myBid, isAuth, onBidSubmit }) {
  const navigate = useNavigate()
  const ms       = msRemaining(job.deadline)
  const isUrgent = ms > 0 && ms < 7_200_000
  const isSoon   = ms > 0 && ms < 86_400_000
  const location = getIntakeLocation(job)
  const tags     = getIntakeTags(job)
  const reqs     = getRequirements(job)

  const sortedBids = useMemo(() => [...bids].sort((a, b) => Number(a.amount) - Number(b.amount)), [bids])
  const lowestAmt  = sortedBids[0] ? Number(sortedBids[0].amount) : null

  const [amount, setAmount]         = useState('')
  const [availability, setAvail]    = useState('')
  const [note, setNote]             = useState('')
  const [submitting, setSubmitting] = useState(false)

  const parsedAmt   = Number(amount)
  const minRequired = lowestAmt !== null ? lowestAmt - 1 : Number(job.budget)
  const amountValid = amount !== '' && parsedAmt > 0 && parsedAmt <= minRequired

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuth) { navigate('/login'); return }
    if (!amountValid) { toast.error(`Bid must be GH¢ ${minRequired.toLocaleString()} or less`); return }
    setSubmitting(true)
    try {
      await onBidSubmit({ job_id: job._id, amount: parsedAmt, note: note.trim(), availability: availability.trim() })
      toast.success('Bid placed successfully!')
      setAmount(''); setAvail(''); setNote('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place bid')
    } finally {
      setSubmitting(false)
    }
  }

  const owner = job.owner_id || {}
  const ownerId = normalizeUserId(owner._id || owner)
  const memberSince = owner.createdAt
    ? new Date(owner.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null
  const ownerLocation = getIntakeLocation(job)
  const biddingLive = ms > 0 && job.status === 'open'

  return (
    <div className="jd-shell">
      <div className="jd-topbar">
        <nav className="jd-breadcrumb">
          <button type="button" className="jd-bc-btn" onClick={() => navigate('/')}>Home</button>
          <span className="jd-bc-sep">›</span>
          <button type="button" className="jd-bc-btn" onClick={() => navigate('/browse')}>Browse</button>
          <span className="jd-bc-sep">›</span>
          <button type="button" className="jd-bc-btn" onClick={() => navigate(`/browse?category=${encodeURIComponent(job.category || '')}`)}>
            {job.category || 'All'}
          </button>
          <span className="jd-bc-sep">›</span>
          <span className="jd-bc-current">{(job.title || '').slice(0, 45)}{(job.title || '').length > 45 ? '…' : ''}</span>
        </nav>
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
                ? <span className="jd-status-badge urgent">🔥 Closing Soon</span>
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
                {lowestAmt !== null ? (
                  <>
                    <div className="jd-stat-val green">GH¢ {lowestAmt.toLocaleString()}</div>
                    <div className="jd-stat-sub">Current winning bid</div>
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
                <div className="jd-stat-val">{job.bids_count || bids.length || 0}</div>
                <div className="jd-stat-sub">From {job.bids_count || bids.length || 0} providers</div>
              </div>
              <div className="jd-stat-cell no-border">
                <div className="jd-stat-label">CLOSES IN</div>
                <Countdown deadline={job.deadline} />
              </div>
            </div>

            {tags.length > 0 && (
              <div className="jd-tags">
                {tags.map((t, i) => <span key={i} className="jd-tag">{t}</span>)}
              </div>
            )}
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
            <div className="jd-section-title">Live bid ladder — {job.bids_count || bids.length || 0} bids</div>
            <div className="jd-ladder-ceiling">
              <span>Budget ceiling set by client</span>
              <span className="jd-ladder-ceiling-amt">GH¢ {Number(job.budget).toLocaleString()}</span>
            </div>
            {sortedBids.length === 0 ? (
              <div className="jd-ladder-empty">No bids yet — be the first!</div>
            ) : (
              <div className="jd-ladder">
                {sortedBids.slice(0, isAuth ? sortedBids.length : Math.min(5, sortedBids.length)).map((bid, i) => {
                  const seller = bid.seller_id || {}
                  const sellerId = normalizeUserId(seller._id || seller)
                  const isWinner = i === 0
                  return (
                    <div key={bid._id || i} className={`jd-ladder-row${isWinner ? ' winner' : ''}`}>
                      <span className="jd-ladder-rank">{i + 1}</span>
                      <button
                        type="button"
                        className="jd-profile-link"
                        onClick={() => sellerId && navigate(`/providers/${sellerId}`)}
                        title={sellerId ? 'View provider profile' : 'Profile unavailable'}
                        disabled={!sellerId}
                      >
                        <AvatarCircle name={seller.name} size={34} />
                      </button>
                      <div className="jd-ladder-info">
                        <button
                          type="button"
                          className="jd-ladder-name jd-profile-link"
                          onClick={() => sellerId && navigate(`/providers/${sellerId}`)}
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
              </div>
            )}
          </div>
        </div>

        {/* ── right sidebar ─── */}
        <aside className="jd-sidebar">
          <div className="jd-bid-card">
            <div className="jd-bid-card-title">Place your bid</div>
            <p className="jd-bid-subtext">
              {lowestAmt !== null ? 'You must beat the current lowest bid to rank #1' : 'Be the first to bid on this job'}
            </p>

            {lowestAmt !== null && (
              <div className="jd-bid-lowest-box">
                Current lowest: <strong>GH¢ {lowestAmt.toLocaleString()}</strong> — your bid must be{' '}
                <strong>GH¢ {(lowestAmt - 1).toLocaleString()}</strong> or less to take the lead.
              </div>
            )}

            {myBid && (
              <div className="jd-my-bid-placed">
                <CircleCheckBig size={15} />
                Your bid: <strong>GH¢ {Number(myBid.amount).toLocaleString()}</strong>
                {lowestAmt !== null && Number(myBid.amount) <= lowestAmt && (
                  <span className="jd-leading"> · You&apos;re leading!</span>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="jd-bid-form">
              <div className="jd-form-group">
                <label className="jd-form-label">Your bid amount (GH¢)</label>
                <input
                  type="number"
                  className="jd-amount-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={lowestAmt !== null ? String(lowestAmt - 1) : String(job.budget)}
                  min={1}
                  max={lowestAmt !== null ? lowestAmt - 1 : job.budget}
                />
                {lowestAmt !== null && (
                  <div className="jd-amount-hint">
                    Must be below GH¢ {lowestAmt.toLocaleString()} to lead · GH¢ 1 minimum
                  </div>
                )}
              </div>

              <div className="jd-form-group">
                <label className="jd-form-label">Availability</label>
                <input
                  type="text"
                  className="jd-form-input"
                  value={availability}
                  onChange={(e) => setAvail(e.target.value)}
                  placeholder="e.g. This Saturday 8am–12pm, or any weekday"
                />
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
                  : `Submit Bid → GH¢ ${parsedAmt > 0 ? parsedAmt.toLocaleString() : '…'}`}
              </button>
              <p className="jd-submit-disclaimer">
                Your bid is binding if selected. Payment is held in escrow until work is confirmed complete.
              </p>
            </form>
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
              'Client reviews all bids when auction closes',
              'Lowest bid is shown first but is not auto-selected',
              'Client can factor in rating, note, and availability',
              'Selected provider is notified immediately',
              'Payment is held in escrow until job is confirmed done',
              'Both sides leave a review after completion',
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

  useEffect(() => { fetchJob(id) }, [id, fetchJob])

  const loadBids = useCallback(async () => {
    try {
      const res = await api.getJobBids(id)
      setBids(res.data.bids || res.data || [])
    } catch { /* non-fatal */ }
  }, [id])

  useEffect(() => { loadBids() }, [loadBids])

  const userId          = user?._id || user?.id
  const ownerId         = selectedJob?.owner_id?._id || selectedJob?.owner_id
  const winningSellerId = selectedJob?.winning_bid_id?.seller_id?._id || selectedJob?.winning_bid_id?.seller_id

  const isBuyer = !!userId && String(userId) === String(ownerId)
  const isSeller = !!userId && !!winningSellerId && String(userId) === String(winningSellerId)
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

  useEffect(() => {
    if (!selectedJob || selectedJob.workflow_stage !== 'contract') return
    setContractDraft({
      scope: selectedJob.contract_terms?.scope || selectedJob.description || '',
      deadline: selectedJob.contract_terms?.deadline ? new Date(selectedJob.contract_terms.deadline).toISOString().slice(0, 10) : '',
      agreed_price: selectedJob.contract_terms?.agreed_price || selectedJob.escrow_amount || '',
    })
  }, [selectedJob])

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

  if (loading && !selectedJob) return <div className="main" />
  if (!selectedJob) return <div className="main" style={{ padding: 40, color: 'var(--muted)' }}>Job not found.</div>

  /* bidding phase → new Sika-style detail + bid view */
  if (selectedJob.status === 'open' && !selectedJob.winning_bid_id) {
    return (
      <BiddingView
        job={selectedJob}
        bids={bids}
        myBid={myBid}
        isAuth={isAuthenticated}
        onBidSubmit={handleBidSubmit}
      />
    )
  }

  /* post-acceptance → workflow view */
  return (
    <div className="main">
      <div className="workspace-head">
        <div>
          <div className="section-title" style={{ marginBottom: 8 }}>Job <span>Workflow</span></div>
          <p className="workspace-subtitle">Structured post-acceptance execution from contract to release.</p>
        </div>
        <div className="workspace-badge">
          <Clock3 size={15} />
          <span>{stage === 'review' && reviewHoursLeft !== null ? `${reviewHoursLeft}h review left` : `Stage: ${stage.replace('_', ' ')}`}</span>
        </div>
      </div>

      <section className="wf-section">
        <div className="wf-top-grid">
          <div className="wf-job-title">{selectedJob.title}</div>
          <div className="wf-role-pill">{isBuyer ? 'Buyer View' : isSeller ? 'Seller View' : 'Observer'}</div>
        </div>
        {canSeeWorkflow && <StageRail stage={stage} isDispute={stage === 'dispute'} />}
      </section>

      <div className="wf-layout">
        <section className="wf-section">
          <div className="wf-card-title-row">
            <div className="wf-card-title">Current Stage Actions</div>
            {stage === 'dispute' && <span className="status-pill status-pending">Dispute Open</span>}
            {stage === 'completed' && <span className="status-pill status-closed">Complete</span>}
          </div>

          {!selectedJob.winning_bid_id && (
            <div className="wf-note-block">This job has no accepted bid yet, so the post-acceptance workflow has not started.</div>
          )}

          {selectedJob.winning_bid_id && !canSeeWorkflow && (
            <div className="wf-note-block">Only the buyer and winning seller can view workflow controls.</div>
          )}

          {selectedJob.winning_bid_id && canSeeWorkflow && stage === 'bidding' && (
            <div className="wf-note-block">
              Workflow is initializing for this job. Start by confirming contract terms below.
            </div>
          )}

          {selectedJob.winning_bid_id && canSeeWorkflow && (stage === 'contract' || stage === 'bidding') && (
            <>
              <div className="wf-data-grid two">
                <div className="wf-cell"><div className="wf-cell-label">Agreed Price</div><div className="wf-cell-value">GH¢ {Number(selectedJob.contract_terms?.agreed_price || selectedJob.escrow_amount || 0).toLocaleString()}</div></div>
                <div className="wf-cell"><div className="wf-cell-label">Deadline</div><div className="wf-cell-value">{toDateText(selectedJob.contract_terms?.deadline)}</div></div>
              </div>

              {isBuyer ? (
                <>
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label">Contract Scope</label>
                    <textarea
                      className="form-textarea"
                      value={contractDraft.scope}
                      onChange={(e) => setContractDraft((prev) => ({ ...prev, scope: e.target.value }))}
                      placeholder="Define exact deliverables"
                    />
                  </div>
                  <div className="wf-data-grid two">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Contract Deadline</label>
                      <input
                        className="form-input"
                        type="date"
                        value={contractDraft.deadline}
                        onChange={(e) => setContractDraft((prev) => ({ ...prev, deadline: e.target.value }))}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Agreed Price</label>
                      <input
                        className="form-input"
                        type="number"
                        min="50"
                        value={contractDraft.agreed_price}
                        onChange={(e) => setContractDraft((prev) => ({ ...prev, agreed_price: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="wf-action-row">
                    <button
                      className="btn btn-ghost"
                      disabled={busyAction === 'saveContract'}
                      onClick={() => runAction('saveContract', () => api.updateContractDraft(id, {
                        scope: contractDraft.scope,
                        deadline: contractDraft.deadline,
                        agreed_price: Number(contractDraft.agreed_price),
                      }), 'Contract updated. Both parties need to sign')}
                    >
                      {busyAction === 'saveContract' ? 'Saving...' : 'Save Contract Terms'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="wf-note-block">{selectedJob.contract_terms?.scope || selectedJob.description}</div>
              )}

              <div className="wf-sign-grid">
                <div className={`wf-sign-card ${selectedJob.contract_terms?.buyer_confirmed ? 'signed' : ''}`}>
                  <div className="wf-sign-label">Buyer</div>
                  <div>{selectedJob.owner_id?.name || 'Buyer'}</div>
                  <div className="wf-sign-status">{selectedJob.contract_terms?.buyer_confirmed ? 'Signed' : 'Pending'}</div>
                </div>
                <div className={`wf-sign-card ${selectedJob.contract_terms?.seller_confirmed ? 'signed' : ''}`}>
                  <div className="wf-sign-label">Seller</div>
                  <div>{selectedJob.winning_bid_id?.seller_id?.name || 'Seller'}</div>
                  <div className="wf-sign-status">{selectedJob.contract_terms?.seller_confirmed ? 'Signed' : 'Pending'}</div>
                </div>
              </div>
              <div className="wf-action-row">
                <button className="btn btn-primary" disabled={busyAction === 'confirmContract'} onClick={() => runAction('confirmContract', () => api.confirmContract(id), 'Contract confirmation saved')}>
                  <FileSignature size={14} />
                  {busyAction === 'confirmContract' ? 'Saving...' : 'Sign Contract'}
                </button>
              </div>
            </>
          )}

          {selectedJob.winning_bid_id && canSeeWorkflow && stage === 'escrow' && (
            <>
              <div className="wf-note-block">Buyer funds escrow. Seller starts only after funds are secured.</div>
              <div className="wf-data-grid three">
                <div className="wf-cell"><div className="wf-cell-label">Buyer</div><div className="wf-cell-value">{selectedJob.owner_id?.name || 'Buyer'}</div></div>
                <div className="wf-cell"><div className="wf-cell-label">Escrow Amount</div><div className="wf-cell-value">GH¢ {Number(selectedJob.escrow_amount || 0).toLocaleString()}</div></div>
                <div className="wf-cell"><div className="wf-cell-label">Seller</div><div className="wf-cell-value">{selectedJob.winning_bid_id?.seller_id?.name || 'Seller'}</div></div>
              </div>
              {isBuyer ? (
                <button className="btn btn-primary" disabled={busyAction === 'escrow'} onClick={() => runAction('escrow', () => api.depositEscrow(id), 'Escrow funded')}>
                  <ShieldCheck size={14} />
                  {busyAction === 'escrow' ? 'Processing...' : 'Deposit to Escrow'}
                </button>
              ) : (
                <div className="wf-note-block">Waiting for buyer to fund escrow.</div>
              )}
            </>
          )}

          {selectedJob.winning_bid_id && canSeeWorkflow && stage === 'in_progress' && (
            <>
              <div className="wf-data-grid two">
                <div className="wf-cell"><div className="wf-cell-label">Escrow Status</div><div className="wf-cell-value">{selectedJob.escrow_deposited_at ? 'Secured' : 'Pending'}</div></div>
                <div className="wf-cell"><div className="wf-cell-label">Work Started</div><div className="wf-cell-value">{selectedJob.work_started_at ? toDateText(selectedJob.work_started_at) : 'Not yet'}</div></div>
              </div>

              {selectedJob.progress_updates?.length > 0 && (
                <div className="wf-stream">
                  {selectedJob.progress_updates.map((entry, index) => (
                    <div key={`${entry.createdAt}-${index}`} className="wf-stream-item">
                      <Circle size={10} />
                      <span>{entry.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {isSeller ? (
                <>
                  <div className="wf-action-row">
                    <button className="btn btn-ghost" disabled={busyAction === 'startWork'} onClick={() => runAction('startWork', () => api.startWork(id), 'Work started')}>
                      <Hammer size={14} />
                      {busyAction === 'startWork' ? 'Updating...' : 'Mark Work Started'}
                    </button>
                  </div>

                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label">Progress Update</label>
                    <textarea className="form-textarea" value={progressMessage} onChange={(e) => setProgressMessage(e.target.value)} placeholder="Share current status with buyer" />
                  </div>
                  <div className="wf-action-row">
                    <button className="btn btn-ghost" disabled={!progressMessage.trim() || busyAction === 'progress'} onClick={() => runAction('progress', () => api.addProgressUpdate(id, { message: progressMessage.trim() }).then(() => setProgressMessage('')), 'Progress posted')}>
                      {busyAction === 'progress' ? 'Posting...' : 'Post Update'}
                    </button>
                  </div>

                  <div className="form-group" style={{ marginTop: 10 }}>
                    <label className="form-label">Submission Note</label>
                    <textarea className="form-textarea" value={submitNote} onChange={(e) => setSubmitNote(e.target.value)} placeholder="Describe exactly what was delivered" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label">Deliverable URL</label>
                    <input className="form-input" value={deliverableUrl} onChange={(e) => setDeliverableUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <button className="btn btn-primary" disabled={busyAction === 'submitWork'} onClick={() => runAction('submitWork', () => api.submitWork(id, { note: submitNote.trim(), deliverable_url: deliverableUrl.trim() }).then(() => { setSubmitNote(''); setDeliverableUrl('') }), 'Work submitted for review')}>
                    <ClipboardCheck size={14} />
                    {busyAction === 'submitWork' ? 'Submitting...' : 'Submit Work'}
                  </button>
                </>
              ) : (
                <div className="wf-note-block">Seller is currently preparing delivery.</div>
              )}
            </>
          )}

          {selectedJob.winning_bid_id && canSeeWorkflow && stage === 'review' && (
            <>
              <div className="wf-data-grid three">
                <div className="wf-cell"><div className="wf-cell-label">Review Window</div><div className="wf-cell-value">{reviewHoursLeft === null ? 'N/A' : `${reviewHoursLeft}h left`}</div></div>
                <div className="wf-cell"><div className="wf-cell-label">Revisions Used</div><div className="wf-cell-value">{selectedJob.revision_rounds_used || 0} / 1</div></div>
                <div className="wf-cell"><div className="wf-cell-label">Submitted At</div><div className="wf-cell-value">{toDateText(selectedJob.work_submitted_at)}</div></div>
              </div>

              <div className="wf-note-block">{selectedJob.deliverable_note || 'No deliverable note provided.'}</div>
              <div className="wf-link-row">Deliverable URL: {selectedJob.deliverable_url || 'N/A'}</div>

              {isBuyer ? (
                <>
                  <div className="wf-action-row">
                    <button className="btn btn-success" disabled={busyAction === 'approve'} onClick={() => runAction('approve', () => api.approveWork(id), 'Approved and payment released')}>
                      <CircleCheckBig size={14} />
                      {busyAction === 'approve' ? 'Approving...' : 'Approve and Release'}
                    </button>
                  </div>

                  {Number(selectedJob.revision_rounds_used || 0) < 1 && (
                    <>
                      <div className="form-group" style={{ marginTop: 12 }}>
                        <label className="form-label">Revision Request</label>
                        <textarea className="form-textarea" value={revisionReason} onChange={(e) => setRevisionReason(e.target.value)} placeholder="Describe required fixes clearly" />
                      </div>
                      <div className="wf-action-row">
                        <button className="btn btn-ghost" disabled={busyAction === 'revision'} onClick={() => runAction('revision', () => api.requestRevision(id, { reason: revisionReason.trim() }).then(() => setRevisionReason('')), 'Revision requested')}>
                          {busyAction === 'revision' ? 'Sending...' : 'Request Revision'}
                        </button>
                      </div>
                    </>
                  )}

                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label className="form-label">Dispute Reason</label>
                    <textarea className="form-textarea" value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} placeholder="Provide reason if escalating to dispute" />
                  </div>
                  <div className="wf-action-row">
                    <button className="btn btn-ghost" disabled={busyAction === 'dispute'} onClick={() => runAction('dispute', () => api.raiseDispute(id, { reason: disputeReason.trim() }).then(() => setDisputeReason('')), 'Dispute raised')}>
                      <AlertTriangle size={14} />
                      {busyAction === 'dispute' ? 'Submitting...' : 'Raise Dispute'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="wf-note-block">Waiting for buyer decision within the review window.</div>
              )}
            </>
          )}

          {selectedJob.winning_bid_id && canSeeWorkflow && stage === 'dispute' && (
            <div className="wf-note-block wf-note-danger">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <AlertTriangle size={15} />
                <strong>Dispute Under Manual Review</strong>
              </div>
              <div>Reason: {selectedJob.dispute_reason || 'No reason provided'}</div>
              <div style={{ marginTop: 6 }}>Raised at: {toDateText(selectedJob.dispute_raised_at)}</div>
            </div>
          )}

          {selectedJob.winning_bid_id && canSeeWorkflow && stage === 'completed' && (
            <div className="wf-note-block wf-note-success">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <CircleCheckBig size={15} />
                <strong>Job Completed</strong>
              </div>
              <div>Payment released at: {toDateText(selectedJob.payment_released_at || selectedJob.completion_date)}</div>
              <div className="wf-action-row" style={{ marginTop: 10, marginBottom: 0 }}>
                <button className="btn btn-primary" onClick={() => navigate(`/rating?jobId=${id}`)}>
                  Leave Rating
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="wf-section">
          <div className="wf-card-title" style={{ marginBottom: 12 }}>Job Summary</div>
          <div className="info-row"><span className="info-label">Category</span><span>{selectedJob.category}</span></div>
          <div className="info-row"><span className="info-label">Budget Cap</span><span>GH¢ {Number(selectedJob.budget || 0).toLocaleString()}</span></div>
          <div className="info-row"><span className="info-label">Agreed Price</span><span>GH¢ {Number(selectedJob.escrow_amount || selectedJob.winning_bid_id?.amount || 0).toLocaleString()}</span></div>
          <div className="info-row"><span className="info-label">Buyer</span><span>{selectedJob.owner_id?.name || 'N/A'}</span></div>
          <div className="info-row"><span className="info-label">Seller</span><span>{selectedJob.winning_bid_id?.seller_id?.name || 'N/A'}</span></div>
          <div className="info-row"><span className="info-label">Status</span><span>{selectedJob.status}</span></div>
          <div className="info-row"><span className="info-label">Created</span><span>{toDateText(selectedJob.createdAt)}</span></div>
        </aside>
      </div>
    </div>
  )
}
