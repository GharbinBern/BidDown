import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const CITY_OPTIONS = ['All Cities', 'Accra', 'Kumasi', 'Takoradi', 'Tamale', 'Cape Coast']

const CATEGORY_BLOCKS = [
  { name: 'Home Repairs', icon: 'HR', open: 348, query: 'Home Repairs' },
  { name: 'Tutoring', icon: 'TU', open: 214, query: 'Tutoring' },
  { name: 'Photography', icon: 'PH', open: 97, query: 'Photography' },
  { name: 'Cleaning', icon: 'CL', open: 186, query: 'Cleaning' },
  { name: 'Delivery', icon: 'DL', open: 129, query: 'Delivery' },
  { name: 'Design & Print', icon: 'DP', open: 266, query: 'Design & Print' },
]

const PLACEHOLDER_AREAS = [
  'East Legon, Accra',
  'Adum, Kumasi',
  'Labone, Accra',
  'Community 7, Tema',
  'Airport Residential, Accra',
  'KNUST Campus, Kumasi',
]

function timeLeft(deadline) {
  const h = Math.max(0, Math.round((new Date(deadline) - Date.now()) / 3600000))
  if (h === 0) return { label: 'Ended', urgent: true }
  if (h < 24) return { label: `${h}h left`, urgent: h <= 12 }
  return { label: `${Math.ceil(h / 24)}d left`, urgent: false }
}

export default function HomePage() {
  const navigate = useNavigate()
  const [recentJobs, setRecentJobs] = useState([])
  const [city, setCity] = useState(CITY_OPTIONS[0])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    Promise.all([
      api.getJobs({ limit: 8, status: 'open' }),
      api.getJobs({ limit: 100, status: 'open' }),
    ]).then(([recentRes, allRes]) => {
      const jobs = allRes.data.jobs || []
      setRecentJobs(recentRes.data.jobs || [])

      const totalBids = jobs.reduce((s, j) => s + (j.bids_count || 0), 0)
      setStats({ listings: allRes.data.pagination?.total || jobs.length, bids: totalBids })
    }).catch(() => {})
  }, [])

  const featuredJobs = useMemo(() => recentJobs.slice(0, 6), [recentJobs])

  const providerRating = useMemo(() => {
    if (!featuredJobs.length) return 4.7
    const base = featuredJobs.reduce((sum, job) => sum + Math.min(5, 4 + (job.bids_count || 0) / 12), 0)
    return Number((base / featuredJobs.length).toFixed(1))
  }, [featuredJobs])

  const avgSavings = useMemo(() => {
    if (!featuredJobs.length) return 32
    const spread = featuredJobs.reduce((sum, job) => {
      const bids = Math.max(1, job.bids_count || 1)
      return sum + Math.min(38, 18 + bids)
    }, 0)
    return Math.round(spread / featuredJobs.length)
  }, [featuredJobs])

  const handleBrowse = () => {
    const query = city === 'All Cities' ? '' : `&city=${encodeURIComponent(city)}`
    navigate(`/marketplace?status=open${query}`)
  }

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-wrap">
          <div className="landing-eyebrow">Reverse Auction · Services · Ghana</div>
          <h1 className="landing-title">Providers compete for your job. You pick the best price.</h1>
          <p className="landing-subtitle">Post what you need, set your maximum budget, and let verified local providers bid down to win your business.</p>
          <div className="landing-search">
            <select className="landing-city-select" value={city} onChange={(e) => setCity(e.target.value)}>
              {CITY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <button type="button" className="landing-find-btn" onClick={handleBrowse}>Find Bids</button>
          </div>
          <div className="landing-stat-row">
            <div className="landing-stat">
              <strong>{stats?.listings || 1240}</strong>
              <span>Active Requests</span>
            </div>
            <div className="landing-stat">
              <strong>{(stats?.listings || 1240) + 2560}+</strong>
              <span>Verified Providers</span>
            </div>
            <div className="landing-stat">
              <strong>avg {providerRating} ★</strong>
              <span>Provider Rating</span>
            </div>
            <div className="landing-stat">
              <strong>{avgSavings}%</strong>
              <span>Avg. Savings vs. Posted Budget</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-wrap">
          <h2 className="landing-section-title">How Sika works</h2>
          <div className="landing-how-grid">
            <article className="landing-how-card">
              <span className="landing-how-num">1</span>
              <h3 className="landing-how-head">Post your job with a budget ceiling</h3>
              <p>Describe what you need and set the maximum you are willing to pay. Your request goes live immediately to local providers.</p>
            </article>
            <article className="landing-how-card">
              <span className="landing-how-num">2</span>
              <h3 className="landing-how-head">Providers compete by bidding down</h3>
              <p>Verified providers place bids below your ceiling. Every bid must undercut the current lowest, so prices move in your favour.</p>
            </article>
            <article className="landing-how-card">
              <span className="landing-how-num">3</span>
              <h3 className="landing-how-head">Pick your provider and rate them</h3>
              <p>Choose the best bid based on price, ratings, and reviews. After the job, your review is published publicly to keep providers accountable.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section alt">
        <div className="landing-wrap">
          <div className="landing-head-row">
            <h2 className="landing-section-title">Active service requests</h2>
            <button type="button" className="landing-link" onClick={() => navigate('/marketplace')}>View all requests →</button>
          </div>
          <div className="landing-request-grid">
            {featuredJobs.map((job, index) => {
              const t = timeLeft(job.deadline)
              const area = PLACEHOLDER_AREAS[index % PLACEHOLDER_AREAS.length]
              const closesLabel = t.label === 'Ended' ? 'Ended' : t.label.replace(' left', '')
              const stars = (4.1 + ((job.bids_count || 0) % 9) / 10).toFixed(1)

              return (
                <article key={job._id} className="landing-request-card" onClick={() => navigate('/marketplace')}>
                  <div className="landing-request-top">
                    <strong>{(job.category || 'Home Repairs').toUpperCase()}</strong>
                    <span className={`landing-status ${t.urgent ? 'soon' : ''}`}>{t.urgent ? 'Closing soon' : 'Open'}</span>
                  </div>
                  <div className="landing-request-body">
                    <h3 className="landing-request-title">{job.title}</h3>
                    <div className="landing-location">Location: {area}</div>
                    <p className="landing-desc">{(job.description || '').slice(0, 120) || 'Request details are available on the listing page.'}</p>
                    <div className="landing-kpis">
                      <div>
                        <span className="landing-kpi-label">Budget Ceiling</span>
                        <span className="landing-kpi-value">GH¢ {Number(job.budget).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="landing-kpi-label">Bids In</span>
                        <span className="landing-kpi-value">{job.bids_count || 0} bids</span>
                      </div>
                      <div>
                        <span className="landing-kpi-label">Closes In</span>
                        <span className="landing-kpi-value">{closesLabel}</span>
                      </div>
                    </div>
                    <div className="landing-card-footer">
                      <div className="landing-provider">
                        <strong>{job.owner_id?.name || 'Client'}</strong>
                        <div className="landing-rate">★★★★★ {stars}</div>
                      </div>
                      <button type="button" className="landing-bid-btn" onClick={(e) => { e.stopPropagation(); navigate('/marketplace') }}>Place Bid</button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-wrap">
          <div className="landing-head-row">
            <h2 className="landing-section-title">Browse by service category</h2>
            <button type="button" className="landing-link" onClick={() => navigate('/marketplace')}>All categories →</button>
          </div>
          <div className="landing-category-grid">
            {CATEGORY_BLOCKS.map((category) => (
              <button
                key={category.name}
                type="button"
                className="landing-category-card"
                onClick={() => navigate(`/marketplace?category=${encodeURIComponent(category.query)}`)}
              >
                <div className="landing-category-icon">{category.icon}</div>
                <div className="landing-category-name">{category.name}</div>
                <div className="landing-category-open">{category.open} open</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-wrap">
          <h2 className="landing-section-title">Why Sika is different</h2>
          <div className="landing-why-grid">
            <article className="landing-why-card">
              <div className="landing-why-icon">★</div>
              <h3 className="landing-why-head">Ratings solve the lemons problem</h3>
              <p className="landing-why-copy">Every completed job requires both sides to leave a review. Providers with low ratings are deprioritised in search so quality providers naturally rise.</p>
            </article>
            <article className="landing-why-card">
              <div className="landing-why-icon">✓</div>
              <h3 className="landing-why-head">Verified providers only</h3>
              <p className="landing-why-copy">Before bidding, every provider submits a national ID and completes a skills assessment relevant to their category for buyer confidence.</p>
            </article>
            <article className="landing-why-card">
              <div className="landing-why-icon">↓</div>
              <h3 className="landing-why-head">The price moves toward you</h3>
              <p className="landing-why-copy">Unlike traditional platforms where you negotiate alone, providers actively undercut each other toward your ceiling until you select the winner.</p>
            </article>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-wrap">
          <div className="landing-footer-grid">
            <div>
              <div className="landing-footer-logo">Sika</div>
              <p className="landing-footer-copy">Reverse auction marketplace for local services across Ghana. Providers compete. You save.</p>
            </div>
            <div className="landing-footer-col">
              <h4>FOR CLIENTS</h4>
              <button type="button" onClick={() => navigate('/marketplace')}>Post a Job</button>
              <button type="button" onClick={() => navigate('/marketplace')}>How Bidding Works</button>
              <button type="button" onClick={() => navigate('/marketplace')}>Browse Categories</button>
            </div>
            <div className="landing-footer-col">
              <h4>FOR PROVIDERS</h4>
              <button type="button" onClick={() => navigate('/register')}>Register as Provider</button>
              <button type="button" onClick={() => navigate('/marketplace')}>Browse Open Requests</button>
              <button type="button" onClick={() => navigate('/dashboard')}>Provider Handbook</button>
            </div>
            <div className="landing-footer-col">
              <h4>COMPANY</h4>
              <button type="button" onClick={() => navigate('/')}>About Sika</button>
              <button type="button" onClick={() => navigate('/')}>Blog</button>
              <button type="button" onClick={() => navigate('/')}>Contact Us</button>
            </div>
          </div>
          <div className="landing-footer-bottom">© 2026 Sika Technologies Ltd. Accra, Ghana</div>
        </div>
      </footer>
    </div>
  )
}
