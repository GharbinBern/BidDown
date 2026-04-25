import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CheckCircle2, Circle, MapPin, Sparkles } from 'lucide-react'
import { useAuthStore, useJobsStore } from '../store'

const DRAFT_KEY = 'biddown_post_draft_v1'

const CATEGORY_CARDS = [
  { name: 'Home Repairs', icon: 'Wrench', blurb: 'Plumbing, electrical, painting, carpentry' },
  { name: 'Tutoring', icon: 'Book', blurb: 'All subjects, exam prep, adult learning' },
  { name: 'Photography', icon: 'Camera', blurb: 'Events, portraits, product, graduation' },
  { name: 'Cleaning', icon: 'Broom', blurb: 'Residential, commercial, post-construction' },
  { name: 'Delivery', icon: 'Truck', blurb: 'Furniture, parcels, house moves' },
  { name: 'Design & Print', icon: 'Palette', blurb: 'Logos, flyers, banners, business cards' },
]

const SUBCATEGORY_OPTIONS = {
  'Home Repairs': ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'General Repairs'],
  Tutoring: ['Mathematics', 'English', 'Science', 'ICT', 'Adult Learning'],
  Photography: ['Event', 'Portrait', 'Product', 'Graduation', 'Corporate'],
  Cleaning: ['Residential', 'Commercial', 'Post-construction', 'Deep Clean'],
  Delivery: ['Parcel', 'Furniture', 'House Move', 'Same-day'],
  'Design & Print': ['Logo', 'Flyer', 'Banner', 'Business Cards', 'Social Media Assets'],
}

const DEFAULT_REQUIREMENTS = {
  'Home Repairs': ['Same-day preferred', 'Materials provided', 'Must show proof of work'],
  Tutoring: ['Experience with exam prep', 'Share sample lesson plan'],
  Photography: ['Portfolio link required', 'Confirm turnaround time'],
  Cleaning: ['Bring own equipment', 'Background checks preferred'],
  Delivery: ['Vehicle details required', 'Proof of delivery expected'],
  'Design & Print': ['Share previous work', 'Include revision count'],
}

function emptyForm() {
  return {
    category: 'Home Repairs',
    subcategory: 'Plumbing',
    title: '',
    description: '',
    city: 'Accra',
    neighborhood: '',
    budget: '',
    daysUntilDeadline: 3,
    preferredCompletionDate: '',
    requirements: [...DEFAULT_REQUIREMENTS['Home Repairs']],
  }
}

function toIsoDeadline(days) {
  return new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000).toISOString()
}

function buildIntakeDetails(form) {
  const location = [form.neighborhood, form.city].filter(Boolean).join(', ')
  const completionHint = form.preferredCompletionDate
    ? `Preferred completion: ${form.preferredCompletionDate}`
    : 'Flexible completion date'
  const requirementsText = form.requirements.join('\n')

  switch (form.category) {
    case 'Home Repairs':
      return {
        location,
        issue_type: form.subcategory || 'General Repair',
        access_window: completionHint,
        requirements: requirementsText,
      }
    case 'Tutoring':
      return {
        subject: form.subcategory || 'General',
        level: 'Not specified',
        sessions_per_week: '2',
        requirements: requirementsText,
      }
    case 'Photography':
      return {
        shoot_type: form.subcategory || 'General',
        event_date: form.preferredCompletionDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        deliverables: 'To be agreed with selected provider',
        requirements: requirementsText,
      }
    case 'Cleaning':
      return {
        property_size: 'Not specified',
        frequency: 'One-time',
        supplies_provided: 'To be confirmed',
        requirements: requirementsText,
      }
    case 'Delivery':
      return {
        pickup_location: location || 'To be provided',
        dropoff_location: 'To be provided',
        load_type: form.subcategory || 'General',
        requirements: requirementsText,
      }
    case 'Design & Print':
      return {
        asset_type: form.subcategory || 'General',
        quantity: 'To be confirmed',
        print_deadline: completionHint,
        requirements: requirementsText,
      }
    default:
      return {}
  }
}

export default function PostJobPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { createJob } = useJobsStore()

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (!saved) return emptyForm()
    try {
      return { ...emptyForm(), ...JSON.parse(saved) }
    } catch {
      return emptyForm()
    }
  })
  const [requirementInput, setRequirementInput] = useState('')
  const [posting, setPosting] = useState(false)
  const [savedAt, setSavedAt] = useState('')

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setSavedAt(stamp)
  }, [form])

  useEffect(() => {
    if (!isAuthenticated) return
    if (!user?.roles?.includes('buyer')) {
      toast.error('Only buyers can post jobs.')
      navigate('/browse')
    }
  }, [isAuthenticated, user, navigate])

  const step1Done = !!form.category
  const step2Done = form.title.trim().length >= 8 && form.description.trim().length >= 40 && !!form.city && !!form.neighborhood
  const step3Done = Number(form.budget) >= 50 && Number(form.daysUntilDeadline) >= 1
  const readyToPublish = step1Done && step2Done && step3Done

  const preview = useMemo(() => {
    const title = form.title.trim() || 'Fix leaking overhead tank and replace float valve'
    const description = form.description.trim() || 'Describe your issue to get competitive bids from verified providers.'
    const budget = Number(form.budget) || 380
    const bids = 0
    return {
      title,
      description,
      budget,
      bids,
      category: form.category,
      location: [form.neighborhood || 'East Legon', form.city || 'Accra'].filter(Boolean).join(', '),
      closingLabel: `In ${Math.max(1, Number(form.daysUntilDeadline) || 3)} day${Number(form.daysUntilDeadline) === 1 ? '' : 's'}`,
      status: 'Open',
      tags: form.requirements.slice(0, 3),
    }
  }, [form])

  const addRequirement = () => {
    const value = requirementInput.trim()
    if (!value) return
    if (form.requirements.some((r) => r.toLowerCase() === value.toLowerCase())) {
      setRequirementInput('')
      return
    }
    setForm((prev) => ({ ...prev, requirements: [...prev.requirements, value] }))
    setRequirementInput('')
  }

  const removeRequirement = (value) => {
    setForm((prev) => ({ ...prev, requirements: prev.requirements.filter((r) => r !== value) }))
  }

  const changeCategory = (category) => {
    setForm((prev) => ({
      ...prev,
      category,
      subcategory: SUBCATEGORY_OPTIONS[category]?.[0] || '',
      requirements: [...(DEFAULT_REQUIREMENTS[category] || [])],
    }))
  }

  const handlePublish = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!readyToPublish) {
      toast.error('Please complete all required sections before publishing.')
      return
    }

    setPosting(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        budget: Number(form.budget),
        deadline: toIsoDeadline(form.daysUntilDeadline),
        intake_details: buildIntakeDetails(form),
      }
      const job = await createJob(payload)
      localStorage.removeItem(DRAFT_KEY)
      toast.success('Job posted successfully.')
      navigate(`/jobs/${job._id}`)
    } catch (error) {
      const message = error.response?.data?.errors?.[0]?.msg || error.response?.data?.error || 'Failed to publish job'
      toast.error(message)
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="jp-page">
      <div className="jp-topbar">
        <div className="jp-top-left">
          <button type="button" className="jp-link" onClick={() => navigate('/')}>Home</button>
          <span className="jp-sep">/</span>
          <span>Post a Job</span>
        </div>
        <div className="jp-draft">Draft auto-saved {savedAt ? `${savedAt}` : 'now'}</div>
      </div>

      <div className="jp-steps">
        <div className={`jp-step ${step1Done ? 'done' : 'active'}`}>
          {step1Done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          <span>1 Service type</span>
        </div>
        <div className={`jp-step ${step2Done ? 'done' : step1Done ? 'active' : ''}`}>
          {step2Done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          <span>2 Job details</span>
        </div>
        <div className={`jp-step ${step3Done ? 'done' : step2Done ? 'active' : ''}`}>
          {step3Done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          <span>3 Budget and timeline</span>
        </div>
        <div className={`jp-step ${readyToPublish ? 'done' : step3Done ? 'active' : ''}`}>
          {readyToPublish ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          <span>4 Review and publish</span>
        </div>
      </div>

      <div className="jp-layout">
        <div className="jp-main-col">
          <section className="jp-card">
            <div className="jp-card-head">
              <h3>Service category</h3>
              <span>{step1Done ? 'Step 1 complete' : 'Step 1 required'}</span>
            </div>
            <div className="jp-category-grid">
              {CATEGORY_CARDS.map((category) => {
                const active = form.category === category.name
                return (
                  <button key={category.name} type="button" className={`jp-category-tile ${active ? 'active' : ''}`} onClick={() => changeCategory(category.name)}>
                    <div className="jp-category-icon">{category.icon}</div>
                    <div className="jp-category-name">{category.name}</div>
                    <div className="jp-category-blurb">{category.blurb}</div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="jp-card">
            <div className="jp-card-head">
              <h3>Describe the job</h3>
              <span>{step2Done ? 'Step 2 complete' : 'Step 2 current'}</span>
            </div>

            <div className="jp-form-group">
              <label>Job title <span>Required</span></label>
              <input
                className="jp-input"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Fix leaking overhead tank and replace float valve"
                maxLength={120}
              />
            </div>

            <div className="jp-form-group">
              <label>Full description <span>{`${form.description.length} / 1000`}</span></label>
              <textarea
                className="jp-textarea"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value.slice(0, 1000) }))}
                placeholder="Include scope of work, current situation, and expected deliverable."
                rows={7}
              />
            </div>

            <div className="jp-row two">
              <div className="jp-form-group">
                <label>City <span>Required</span></label>
                <select className="jp-input" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}>
                  <option value="Accra">Accra</option>
                  <option value="Kumasi">Kumasi</option>
                  <option value="Takoradi">Takoradi</option>
                  <option value="Tamale">Tamale</option>
                  <option value="Cape Coast">Cape Coast</option>
                </select>
              </div>
              <div className="jp-form-group">
                <label>Neighborhood / Area <span>Required</span></label>
                <input
                  className="jp-input"
                  value={form.neighborhood}
                  onChange={(e) => setForm((p) => ({ ...p, neighborhood: e.target.value }))}
                  placeholder="East Legon"
                />
              </div>
            </div>

            <div className="jp-row two">
              <div className="jp-form-group">
                <label>Sub-category</label>
                <select className="jp-input" value={form.subcategory} onChange={(e) => setForm((p) => ({ ...p, subcategory: e.target.value }))}>
                  {(SUBCATEGORY_OPTIONS[form.category] || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="jp-form-group">
                <label>Preferred completion date</label>
                <input
                  className="jp-input"
                  type="date"
                  value={form.preferredCompletionDate}
                  onChange={(e) => setForm((p) => ({ ...p, preferredCompletionDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="jp-form-group">
              <label>Specific requirements for providers</label>
              <div className="jp-requirements">
                {form.requirements.map((req) => (
                  <span key={req} className="jp-chip">
                    {req}
                    <button type="button" onClick={() => removeRequirement(req)}>x</button>
                  </span>
                ))}
              </div>
              <div className="jp-add-row">
                <input
                  className="jp-input"
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  placeholder="Add requirement"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addRequirement()
                    }
                  }}
                />
                <button type="button" className="jp-add-btn" onClick={addRequirement}>+ Add requirement</button>
              </div>
            </div>
          </section>

          <section className="jp-card">
            <div className="jp-card-head">
              <h3>Budget ceiling and auction duration</h3>
              <span>{step3Done ? 'Step 3 complete' : 'Step 3 required'}</span>
            </div>

            <div className="jp-row two">
              <div className="jp-form-group">
                <label>Maximum budget (GH¢) <span>Required</span></label>
                <input
                  className="jp-input"
                  type="number"
                  min="50"
                  value={form.budget}
                  onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}
                  placeholder="380"
                />
              </div>
              <div className="jp-form-group">
                <label>Auction duration (days) <span>Required</span></label>
                <select className="jp-input" value={form.daysUntilDeadline} onChange={(e) => setForm((p) => ({ ...p, daysUntilDeadline: Number(e.target.value) }))}>
                  <option value={1}>1 day</option>
                  <option value={2}>2 days</option>
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                </select>
              </div>
            </div>

            <div className="jp-budget-meter">
              <div className="jp-budget-head">
                <span>Your ceiling</span>
                <strong>GH¢ {Number(form.budget || 0).toLocaleString()}</strong>
              </div>
              <div className="jp-meter-track"><div className="jp-meter-fill" style={{ width: `${Math.min(100, Math.max(10, Number(form.budget || 0) / 6))}%` }} /></div>
              <p>Based on similar jobs, bids typically arrive 25-40% below your ceiling.</p>
            </div>
          </section>

          <section className="jp-card jp-review-card">
            <div className="jp-card-head">
              <h3>Review and publish</h3>
              <span>{readyToPublish ? 'Ready to publish' : 'Complete steps above first'}</span>
            </div>
            <div className="jp-review-alert">
              <Sparkles size={16} />
              <span>Publishing sends your request live immediately to verified providers in your selected category.</span>
            </div>
            <div className="jp-actions">
              <button type="button" className="jp-secondary" onClick={() => navigate('/browse')}>Save draft</button>
              <button type="button" className="jp-primary" onClick={handlePublish} disabled={posting || !readyToPublish}>
                {posting ? 'Publishing...' : 'Publish job'}
              </button>
            </div>
          </section>
        </div>

        <aside className="jp-side-col">
          <section className="jp-preview">
            <div className="jp-preview-head">
              <span>Live preview</span>
              <small>How providers will see it</small>
            </div>
            <div className="jp-preview-body">
              <div className="jp-preview-cat">{preview.category.toUpperCase()}</div>
              <h4>{preview.title}</h4>
              <div className="jp-preview-loc"><MapPin size={12} /> {preview.location}</div>
              <p>{preview.description.slice(0, 170)}{preview.description.length > 170 ? '...' : ''}</p>
              <div className="jp-preview-grid">
                <div>
                  <label>Budget ceiling</label>
                  <strong>GH¢ {preview.budget.toLocaleString()}</strong>
                </div>
                <div>
                  <label>Auction closes</label>
                  <strong>{preview.closingLabel}</strong>
                </div>
                <div>
                  <label>Bids so far</label>
                  <strong>{preview.bids}</strong>
                </div>
                <div>
                  <label>Status</label>
                  <strong>{preview.status}</strong>
                </div>
              </div>
              <div className="jp-preview-tags">
                {preview.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </div>
          </section>

          <section className="jp-tips">
            <h4>Tips for better bids</h4>
            <ul>
              <li>Add exact location and access constraints.</li>
              <li>Keep your title specific so providers self-select correctly.</li>
              <li>Include a realistic ceiling to attract strong providers.</li>
              <li>3-day auctions usually get the best price competition.</li>
              <li>Requirements help filter low-effort bids early.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
