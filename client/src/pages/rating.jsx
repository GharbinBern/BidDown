import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Star } from 'lucide-react'
import { api } from '../api'
import { useAuthStore } from '../store'

function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          onClick={() => onChange(score)}
          className="btn btn-ghost btn-sm"
          style={{
            padding: '8px 10px',
            borderColor: score <= value ? 'var(--accent)' : 'var(--border)',
            color: score <= value ? 'var(--accent)' : 'var(--muted)',
          }}
          aria-label={`Rate ${score} out of 5`}
        >
          <Star size={14} fill={score <= value ? 'currentColor' : 'none'} />
          {score}
        </button>
      ))}
    </div>
  )
}

export default function RatingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [jobTitle, setJobTitle] = useState('')
  const [targetName, setTargetName] = useState('')
  const [targetRoleLabel, setTargetRoleLabel] = useState('User')
  const [revieweeId, setRevieweeId] = useState('')

  const jobId = searchParams.get('jobId')

  useEffect(() => {
    const loadContext = async () => {
      if (!jobId) {
        setLoading(false)
        return
      }

      try {
        const { data: job } = await api.getJob(jobId)
        const currentUserId = String(user?._id || user?.id || '')
        const buyerId = String(job.owner_id?._id || job.owner_id || '')
        const sellerId = String(job.winning_bid_id?.seller_id?._id || job.winning_bid_id?.seller_id || '')
        const buyerName = job.owner_id?.name || 'Buyer'
        const sellerName = job.winning_bid_id?.seller_id?.name || 'Seller'

        setJobTitle(job.title || '')

        if (currentUserId === sellerId) {
          setRevieweeId(buyerId)
          setTargetName(buyerName)
          setTargetRoleLabel('Buyer')
        } else if (currentUserId === buyerId) {
          setRevieweeId(sellerId)
          setTargetName(sellerName)
          setTargetRoleLabel('Seller')
        } else {
          toast.error('You are not a participant for this request')
          navigate('/dashboard')
        }
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to load rating context')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadContext()
  }, [jobId, user, navigate])

  const title = useMemo(() => {
    if (!jobId) return 'Rating'
    if (loading) return 'Rating'
    if (jobTitle) return `Rating: ${targetRoleLabel} - ${jobTitle}`
    return `Rating: ${targetRoleLabel}`
  }, [jobId, jobTitle, targetRoleLabel, loading])

  const targetDescriptor = useMemo(() => {
    if (targetName) return targetName
    if (loading) return 'this user'
    return `this ${targetRoleLabel.toLowerCase()}`
  }, [targetName, targetRoleLabel, loading])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!jobId || !revieweeId) {
      toast.error('Missing rating target information')
      return
    }

    setSubmitting(true)
    try {
      await api.createReview({
        job_id: jobId,
        reviewee_id: revieweeId,
        rating,
        comment: comment.trim(),
      })
      toast.success(`${targetRoleLabel} rating submitted`)
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit rating')
    } finally {
      setSubmitting(false)
    }
  }

//   if (loading) {
//     return <div className="main">Loading rating form...</div>
//   }

  return (
    <div className="main" style={{ maxWidth: 840 }}>
      <div className="section-title">{title}</div>
      <p className="workspace-subtitle" style={{ marginBottom: 20 }}>
        Share a fair rating for <strong>{targetDescriptor}</strong> so trust signals stay strong.
      </p>

      <section className="shell-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Overall Rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div className="form-group">
            <label className="form-label">Comment</label>
            <textarea
              className="form-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was communication, clarity, and payment behavior?"
              maxLength={1000}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </section>
    </div>
  )
}
