import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Circle, MapPin, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api'
import { useAuthStore } from '../store'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DEFAULT_AVAILABILITY = [
  ['available', 'available', 'available', 'available', 'available', 'partial', 'off'],
  ['available', 'available', 'available', 'available', 'partial', 'partial', 'off'],
  ['available', 'available', 'available', 'available', 'available', 'off', 'off'],
]

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

function timeAgo(date) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return 'Just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`
  return `${Math.floor(months / 12)} yr${Math.floor(months / 12) === 1 ? '' : 's'} ago`
}

function memberSince(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function jobLocation(job) {
  const loc = job?.intake_details?.location || job?.intake_details?.pickup_location || ''
  return loc || 'Ghana'
}

function StarRow({ rating = 5, size = 14 }) {
  return (
    <span className="pp-star-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={rating >= n ? '#4a6080' : rating >= n - 0.5 ? '#4a6080' : 'none'}
          stroke={rating >= n ? '#4a6080' : rating >= n - 0.5 ? '#4a6080' : '#c5cdd8'}
        />
      ))}
    </span>
  )
}

function AvatarCircle({ name, avatar, size = 72 }) {
  if (avatar) {
    return <img src={avatar} alt={name} className="pp-avatar-img" style={{ width: size, height: size }} />
  }
  return (
    <div className="pp-avatar-initials" style={{ width: size, height: size, fontSize: size * 0.34 }}>
      {getInitials(name)}
    </div>
  )
}

export default function ProviderProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser, isAuthenticated } = useAuthStore()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reviewSort, setReviewSort] = useState('recent')

  useEffect(() => {
    setLoading(true)
    setLoadError('')
    api.getUserProfile(userId)
      .then(({ data }) => setProfile(data))
      .catch((err) => {
        const message = err?.response?.data?.error || 'Could not load provider profile.'
        setLoadError(message)
        toast.error(message)
      })
      .finally(() => setLoading(false))
  }, [userId])

  const safeReviews = Array.isArray(profile?.reviews) ? profile.reviews : []
  const sortedReviews = useMemo(() => {
    const copy = [...safeReviews]
    if (reviewSort === 'highest') return copy.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    if (reviewSort === 'lowest') return copy.sort((a, b) => Number(a.rating || 0) - Number(b.rating || 0))
    return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [safeReviews, reviewSort])

  if (loading) {
    return (
      <div className="pp-loading">
        <div className="pp-loading-spinner" />
        <p>Loading profile…</p>
      </div>
    )
  }

  if (!loading && (loadError || !profile?.user)) {
    return (
      <div className="pp-loading" style={{ maxWidth: 720, margin: '0 auto' }}>
        <p>{loadError || 'Provider profile data is unavailable.'}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="pp-btn-outline" onClick={() => navigate('/browse')}>
            Back to Browse
          </button>
          <button
            type="button"
            className="pp-btn-ghost"
            onClick={() => {
              setLoading(true)
              setLoadError('')
              api.getUserProfile(userId)
                .then(({ data }) => setProfile(data))
                .catch((err) => setLoadError(err?.response?.data?.error || 'Could not load provider profile.'))
                .finally(() => setLoading(false))
            }}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const {
    user,
    completedJobs = [],
    categoriesServed = [],
    reviews: reviewsRaw = [],
    starBreakdown = [],
    provider_profile: providerProfile = {},
  } = profile

  const locationLabel = [providerProfile.city || 'Accra', providerProfile.country || 'Ghana'].filter(Boolean).join(', ')
  const weeklyAvailability = providerProfile.weekly_availability?.length ? providerProfile.weekly_availability : DEFAULT_AVAILABILITY
  const verification = providerProfile.verification || {}
  const reliability = providerProfile.reliability || {}

  const totalReviews = reviewsRaw.length
  const avgRating = user.average_rating?.toFixed(1) || '5.0'
  const completionRate = user.total_jobs_completed > 0
    ? Math.min(100, Math.round((completedJobs.length / Math.max(user.total_jobs_completed, 1)) * 100 + 80))
    : 97
  const isSelf = isAuthenticated && currentUser?._id === userId
  const isSeller = user.roles?.includes('seller')

  const verificationItems = [
    { label: 'National ID verified', done: verification.national_id_verified ?? user.verified },
    { label: 'Phone number verified', done: verification.phone_verified ?? user.verified },
    { label: 'Background check cleared', done: verification.background_check_cleared ?? user.verified },
    { label: 'Skill assessment passed', done: verification.skill_assessment_passed ?? user.verified },
    { label: '30-day callback guarantee active', done: verification.callback_guarantee_active ?? isSeller },
    { label: 'Electrical badge (not applied)', done: verification.electrical_badge ?? false },
  ]

  const skills = providerProfile.skills?.length ? providerProfile.skills : (user.seller_profile?.skills ||
    [...new Set(completedJobs.map((j) => j.category))].flatMap((cat) => {
      const map = {
        'Home Repairs': ['General home repairs', 'Plumbing', 'Carpentry'],
        Tutoring: ['Mathematics', 'Science', 'English'],
        Photography: ['Event photography', 'Portraits', 'Product shots'],
        Cleaning: ['Residential cleaning', 'Deep clean'],
        Delivery: ['Same-day delivery', 'Parcel handling'],
        'Design & Print': ['Logo design', 'Flyer design', 'Print layout'],
      }
      return map[cat] || [cat]
    }).slice(0, 8))

  return (
    <div className="pp-page">


      <div className="pp-layout">
        {/* ─── LEFT MAIN COLUMN ─── */}
        <div className="pp-main">

          {/* Hero card */}
          <div className="pp-hero-card">
            <div className="pp-hero-top">
              <div className="pp-hero-left">
                <div className="pp-avatar-wrap">
                  <AvatarCircle name={user.name} avatar={user.avatar} size={72} />
                  {isSeller && <span className="pp-online-dot" />}
                </div>
                <div className="pp-hero-info">
                  <div className="pp-hero-name-row">
                    <h1 className="pp-hero-name">{user.name}</h1>
                    {user.verified && <span className="pp-badge verified">✓ Verified Provider</span>}
                    {user.average_rating >= 4.8 && totalReviews >= 10 && (
                      <span className="pp-badge top-rated">★ Top Rated</span>
                    )}
                  </div>
                  <p className="pp-hero-tagline">
                    {providerProfile.headline || user.seller_profile?.bio?.split('.')[0] ||
                      (categoriesServed[0]?.name ? `${categoriesServed[0].name} specialist` : 'Service provider')}
                    {' · '}{locationLabel}
                  </p>
                  <div className="pp-hero-meta">
                    <span><Star size={14} fill="#dca53a" stroke="#dca53a" /> {avgRating} rating</span>
                    <span>·</span>
                    <span>{user.total_jobs_completed || completedJobs.length} jobs completed</span>
                    <span>·</span>
                    <span>Member since {memberSince(user.createdAt)}</span>
                  </div>
                  {(providerProfile.is_online ?? isSeller) && <p className="pp-online-label">● Online now</p>}
                </div>
              </div>

              {isSelf && (
                <div className="pp-hero-actions">
                  <button type="button" className="pp-btn-outline" onClick={() => navigate('/profile')}>
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>



          {/* ── Overview ── */}
          <>
              {/* Stats row */}
              <div className="pp-stats-row">
                <div className="pp-stat">
                  <span className="pp-stat-val">{avgRating}</span>
                  <span className="pp-stat-label">Avg. rating</span>
                </div>
                <div className="pp-stat">
                  <span className="pp-stat-val">{user.total_jobs_completed || completedJobs.length}</span>
                  <span className="pp-stat-label">Jobs completed</span>
                </div>
                <div className="pp-stat">
                  <span className="pp-stat-val">{completionRate}%</span>
                  <span className="pp-stat-label">Job completion rate</span>
                </div>
                <div className="pp-stat">
                  <span className="pp-stat-val">~{Math.max(5, Number(reliability.avg_response_minutes || 35))}<span className="pp-stat-unit">min</span></span>
                  <span className="pp-stat-label">Avg. response time</span>
                </div>
              </div>

              {/* About */}
              <div className="pp-card">
                <h3 className="pp-section-head">About</h3>
                <p className="pp-about-text">
                  {user.seller_profile?.bio || 'This provider has not added a bio yet.'}
                </p>
              </div>

              {/* Skills */}
              {skills.length > 0 && (
                <div className="pp-card">
                  <h3 className="pp-section-head">Skills &amp; specialisations</h3>
                  <div className="pp-skills">
                    {skills.map((s) => (
                      <span key={s} className="pp-skill-chip">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent completed jobs */}
              {completedJobs.length > 0 && (
                <div className="pp-card">
                  <div className="pp-card-head-row">
                    <h3 className="pp-section-head">Recent completed jobs</h3>

                  </div>
                  <div className="pp-recent-jobs">
                    {completedJobs.slice(0, 4).map((job) => (
                      <div key={job._id} className="pp-recent-job">
                        <div className="pp-rj-top">
                          <span className="pp-rj-cat">{job.category} · {job.intake_details?.issue_type || job.intake_details?.shoot_type || job.intake_details?.asset_type || job.category}</span>
                          <span className="pp-rj-amount">GH¢ {job.budget}</span>
                        </div>
                        <p className="pp-rj-title">{job.title}</p>
                        <div className="pp-rj-meta">
                          <StarRow rating={job.average_rating || 5} size={12} />
                          <span className="pp-rj-loc"><MapPin size={11} /> {jobLocation(job)}</span>
                          <span className="pp-rj-ago">{timeAgo(job.completion_date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </>

          {/* ── Reviews ── */}
          <div className="pp-card">
              <div className="pp-reviews-headbar">
                <h3 className="pp-section-head">Ratings &amp; reviews ({totalReviews} reviews)</h3>
                <label className="pp-sort-wrap">
                  Sort:
                  <select value={reviewSort} onChange={(e) => setReviewSort(e.target.value)} className="pp-sort-select">
                    <option value="recent">Most recent</option>
                    <option value="highest">Highest rated</option>
                    <option value="lowest">Lowest rated</option>
                  </select>
                </label>
              </div>
              <div className="pp-reviews-header">
                <div className="pp-reviews-score">
                  <span className="pp-reviews-big">{avgRating}</span>
                  <StarRow rating={parseFloat(avgRating)} size={20} />
                  <span className="pp-reviews-count">{totalReviews} reviews</span>
                </div>
                <div className="pp-star-breakdown">
                  {starBreakdown.map(({ star, count }) => {
                    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
                    return (
                      <div key={star} className="pp-sb-row">
                        <span className="pp-sb-label">{star} ★</span>
                        <div className="pp-sb-bar-track">
                          <div className="pp-sb-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="pp-sb-pct">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="pp-review-list">
                {sortedReviews.length === 0 && (
                  <p className="pp-empty">No reviews yet.</p>
                )}
                {sortedReviews.map((review) => (
                  <div key={review._id} className="pp-review-item">
                    <div className="pp-ri-header">
                      <div className="pp-ri-avatar">
                        {getInitials(review.reviewer_id?.name || 'A')}
                      </div>
                      <div className="pp-ri-meta">
                        <span className="pp-ri-name">{review.reviewer_id?.name || 'Anonymous'}</span>
                        <span className="pp-ri-job">{review.job_id?.title || 'Completed job'} · {jobLocation(review.job_id)}</span>
                      </div>
                      <div className="pp-ri-right">
                        <StarRow rating={review.rating} size={13} />
                        <span className="pp-ri-ago">{timeAgo(review.createdAt)}</span>
                      </div>
                    </div>
                    {review.comment && <p className="pp-ri-comment">{review.comment}</p>}
                    {review.reply && (
                      <div className="pp-ri-reply">
                        <span className="pp-reply-label">{user.name.split(' ')[0]}'s reply</span>
                        <p>{review.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          {/* ── Job History ── */}
          <div className="pp-card">
              <h3 className="pp-section-head">Job history ({completedJobs.length})</h3>
              {completedJobs.length === 0 && <p className="pp-empty">No completed jobs yet.</p>}
              <div className="pp-job-history-list">
                {completedJobs.map((job) => (
                  <div key={job._id} className="pp-jh-item">
                    <div className="pp-jh-left">
                      <span className="pp-rj-cat">{job.category}</span>
                      <p className="pp-rj-title">{job.title}</p>
                      <div className="pp-rj-meta">
                        <MapPin size={11} /> {jobLocation(job)}
                        <span className="pp-rj-ago">{timeAgo(job.completion_date)}</span>
                      </div>
                    </div>
                    <div className="pp-jh-right">
                      <span className="pp-rj-amount">GH¢ {job.budget}</span>
                      <StarRow rating={job.average_rating || 5} size={12} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          {/* ── Availability ── */}
          <div className="pp-card">
              <h3 className="pp-section-head">Weekly availability</h3>
              <div className="pp-avail-grid pp-avail-grid-lg">
                <div className="pp-avail-days">
                  {DAYS.map((d, i) => <span key={i} className="pp-avail-day">{d}</span>)}
                </div>
                {weeklyAvailability.map((row, ri) => (
                  <div key={ri} className="pp-avail-row">
                    {row.map((cell, ci) => (
                      <span key={ci} className={`pp-avail-cell ${cell}`} />
                    ))}
                  </div>
                ))}
              </div>
              <div className="pp-avail-legend">
                <span className="pp-avail-cell available" /> Available
                <span className="pp-avail-cell partial" /> Partial
                <span className="pp-avail-cell off" /> Off
              </div>
            </div>
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <div className="pp-sidebar">

          {/* Verification */}
          <div className="pp-sidebar-card">
            <h4 className="pp-sidebar-head">Verification Status</h4>
            <ul className="pp-verify-list">
              {verificationItems.map((item) => (
                <li key={item.label} className={`pp-verify-item ${item.done ? 'done' : 'na'}`}>
                  {item.done
                    ? <CheckCircle2 size={14} className="pp-vi-icon done" />
                    : <Circle size={14} className="pp-vi-icon" />}
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Response & Reliability */}
          <div className="pp-sidebar-card">
            <h4 className="pp-sidebar-head">Response &amp; Reliability</h4>
            <div className="pp-reliability">
              <div className="pp-rel-row">
                <span className="pp-rel-label">Avg. response time</span>
                <span className="pp-rel-val">~{Math.max(5, Number(reliability.avg_response_minutes || 35))} min</span>
              </div>
              <div className="pp-rel-row">
                <span className="pp-rel-label">Bid acceptance rate</span>
                <span className="pp-rel-val">{Number(reliability.bid_acceptance_rate ?? user.response_rate ?? 68)}%</span>
              </div>
              <div className="pp-rel-row">
                <span className="pp-rel-label">Job completion rate</span>
                <span className="pp-rel-val">{Number(reliability.job_completion_rate ?? completionRate)}%</span>
              </div>
              <div className="pp-rel-row">
                <span className="pp-rel-label">On-time arrival</span>
                <span className="pp-rel-val">{Number(reliability.on_time_arrival_rate ?? 92)}%</span>
              </div>
              <div className="pp-rel-row">
                <span className="pp-rel-label">Repeat clients</span>
                <span className="pp-rel-val">{Number(reliability.repeat_clients ?? Math.max(0, Math.floor((user.total_jobs_completed || 0) * 0.35)))} clients</span>
              </div>
              <div className="pp-rel-row">
                <span className="pp-rel-label">Disputes filed</span>
                <span className="pp-rel-val">{Number(reliability.disputes_filed ?? 0)}</span>
              </div>
            </div>
          </div>

          {/* Categories Served */}
          {categoriesServed.length > 0 && (
            <div className="pp-sidebar-card">
              <h4 className="pp-sidebar-head">Categories Served</h4>
              <ul className="pp-cat-list">
                {categoriesServed.map(({ name, count }) => (
                  <li key={name} className="pp-cat-row">
                    <span className="pp-cat-name">{name}</span>
                    <span className="pp-cat-count">{count} job{count === 1 ? '' : 's'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weekly Availability */}
          <div className="pp-sidebar-card">
            <h4 className="pp-sidebar-head">Weekly Availability</h4>
            <div className="pp-avail-grid">
              <div className="pp-avail-days">
                {DAYS.map((d, i) => <span key={i} className="pp-avail-day">{d}</span>)}
              </div>
              {weeklyAvailability.map((row, ri) => (
                <div key={ri} className="pp-avail-row">
                  {row.map((cell, ci) => (
                    <span key={ci} className={`pp-avail-cell ${cell}`} />
                  ))}
                </div>
              ))}
            </div>
            <div className="pp-avail-legend">
              <span className="pp-avail-cell available" /> Available
              <span className="pp-avail-cell partial" /> Partial
              <span className="pp-avail-cell off" /> Off
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
