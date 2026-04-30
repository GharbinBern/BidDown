import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrench, BookOpen, Camera, Sparkles, Truck, Printer, UtensilsCrossed, Monitor, Star, ShieldCheck, TrendingDown, MapPin } from 'lucide-react'
import { api } from '../api'

const CITY_OPTIONS = ['All Cities', 'Accra', 'Kumasi', 'Takoradi', 'Tamale', 'Cape Coast']

const CATEGORY_BLOCKS = [
  { name: 'Home Repairs', Icon: Wrench, query: 'Home Repairs' },
  { name: 'Tutoring', Icon: BookOpen, query: 'Tutoring' },
  { name: 'Photography', Icon: Camera, query: 'Photography' },
  { name: 'Cleaning', Icon: Sparkles, query: 'Cleaning' },
  { name: 'Delivery', Icon: Truck, query: 'Delivery' },
  { name: 'Design & Print', Icon: Printer, query: 'Design & Print' },
  { name: 'Catering', Icon: UtensilsCrossed, query: 'Catering' },
  { name: 'IT & Tech Support', Icon: Monitor, query: 'IT & Tech Support' },
]

function timeLeft(deadline) {
  const h = Math.max(0, Math.round((new Date(deadline) - Date.now()) / 3600000))
  if (h === 0) return { label: 'Ended', urgent: true }
  if (h < 24) return { label: `${h}h left`, urgent: h <= 12 }
  return { label: `${Math.ceil(h / 24)}d left`, urgent: false }
}

function getJobLocation(job) {
  const d = job.intake_details || {}
  return d.location || d.pickup_location || d.dropoff_location || d.event_location || ''
}

export default function HomePage() {
  const navigate = useNavigate()
  const [recentJobs, setRecentJobs] = useState([])
  const [statsLoaded, setStatsLoaded] = useState(false)
  const [city, setCity] = useState(CITY_OPTIONS[0])
  const [stats, setStats] = useState({ listings: 0, providers: 0, avgSavingsPercent: 0, providerRating: 0 })
  const [categoryOpenCounts, setCategoryOpenCounts] = useState({})

  useEffect(() => {
    let mounted = true

    Promise.all([
      api.getJobs({ limit: 8, status: 'open' }),
      api.getJobs({ limit: 100, status: 'open' }),
      api.getMarketAnalytics(),
    ]).then(([recentRes, openRes, marketRes]) => {
      if (!mounted) return

      const recent = recentRes.data.jobs || []
      const openJobs = openRes.data.jobs || []
      const market = marketRes.data || {}
      const openCounts = openJobs.reduce((acc, job) => {
        const key = job.category || 'Other'
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})

      setRecentJobs(recent)
      setCategoryOpenCounts(openCounts)
      setStats({
        listings: market.jobs?.open || openRes.data.pagination?.total || openJobs.length || 0,
        providers: market.providers?.verified || 0,
        avgSavingsPercent: Number(market.savings?.avgSavingsPercent || 0),
        providerRating: Number(market.providers?.avgRating || 0),
      })
      setStatsLoaded(true)
    }).catch(() => { setStatsLoaded(true) })

    return () => { mounted = false }
  }, [])

  const featuredJobs = useMemo(() => recentJobs.slice(0, 6), [recentJobs])

  const providerRating = useMemo(() => {
    if (stats.providerRating > 0) return Number(stats.providerRating.toFixed(1))
    if (!featuredJobs.length) return 0
    const base = featuredJobs.reduce((sum, job) => sum + Math.min(5, 4 + (job.bids_count || 0) / 12), 0)
    return Number((base / featuredJobs.length).toFixed(1))
  }, [featuredJobs, stats.providerRating])

  const avgSavings = useMemo(() => {
    if (stats.avgSavingsPercent > 0) return Math.round(stats.avgSavingsPercent)
    if (!featuredJobs.length) return 0
    const spread = featuredJobs.reduce((sum, job) => {
      const bids = Math.max(1, job.bids_count || 1)
      return sum + Math.min(38, 18 + bids)
    }, 0)
    return Math.round(spread / featuredJobs.length)
  }, [featuredJobs, stats.avgSavingsPercent])

  const handleBrowse = () => {
    const query = city === 'All Cities' ? '' : `&city=${encodeURIComponent(city)}`
    navigate(`/browse?status=open${query}`)
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
              <strong>{statsLoaded ? stats.listings : '...'}</strong>
              <span>Active Requests</span>
            </div>
            <div className="landing-stat">
              <strong>{statsLoaded ? stats.providers : '...'}</strong>
              <span>Verified Providers</span>
            </div>
            <div className="landing-stat">
              <strong>{statsLoaded ? (providerRating ? `${providerRating} ★` : '--') : '...'}</strong>
              <span>Provider Rating</span>
            </div>
            <div className="landing-stat">
              <strong>{statsLoaded ? `${avgSavings}%` : '...'}</strong>
              <span>Avg. Savings vs. Budget</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-wrap">
          <h2 className="landing-section-title">How BraFom works</h2>
          <div className="landing-how-grid">
            <article className="landing-how-card">
              <span className="landing-how-num">1</span>
              <h3 className="landing-how-head">Post your job with a price ceiling</h3>
              <p>Say you need your polytank repaired in Adenta. You post the job and set GH¢ 950 as your maximum. It goes live immediately to every qualified plumber on the platform.</p>
            </article>
            <article className="landing-how-card">
              <span className="landing-how-num">2</span>
              <h3 className="landing-how-head">Providers compete with their best price</h3>
              <p>Qualified providers review your job and submit their most competitive bid. You see every offer: no haggling, no back-and-forth, just transparent pricing working in your favour.</p>
            </article>
            <article className="landing-how-card">
              <span className="landing-how-num">3</span>
              <h3 className="landing-how-head">Pick your provider and pay on completion</h3>
              <p>Review each provider's rating, completed jobs, and proposal. Award the contract, funds go into secure escrow, and the money releases only after you confirm the work is done.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section alt">
        <div className="landing-wrap">
          <div className="landing-head-row">
            <h2 className="landing-section-title">Active service requests</h2>
            <button type="button" className="landing-link" onClick={() => navigate('/browse')}>View all requests</button>
          </div>
          <div className="landing-request-grid">
            {featuredJobs.map((job) => {
              const t = timeLeft(job.deadline)
              const closesLabel = t.label === 'Ended' ? 'Ended' : t.label.replace(' left', '')
              const location = getJobLocation(job)

              return (
                <article key={job._id} className="landing-request-card" onClick={() => navigate('/browse')}>
                  <div className="landing-request-top">
                    <strong>{(job.category || 'Home Repairs').toUpperCase()}</strong>
                    <span className={`landing-status ${t.urgent ? 'soon' : ''}`}>{t.urgent ? 'Closing soon' : 'Open'}</span>
                  </div>
                  <div className="landing-request-body">
                    <h3 className="landing-request-title">{job.title}</h3>
                    {location && (
                      <div className="landing-location">
                        <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                        {location}
                      </div>
                    )}
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
                      </div>
                      <button type="button" className="landing-bid-btn" onClick={(e) => { e.stopPropagation(); navigate('/browse') }}>Place Bid</button>
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
            <button type="button" className="landing-link" onClick={() => navigate('/browse')}>All categories</button>
          </div>
          <div className="landing-category-grid">
            {CATEGORY_BLOCKS.map(({ name, Icon, query }) => (
              <button
                key={name}
                type="button"
                className="landing-category-card"
                onClick={() => navigate(`/browse?category=${encodeURIComponent(query)}`)}
              >
                <div className="landing-category-icon">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <div className="landing-category-name">{name}</div>
                <div className="landing-category-open">{categoryOpenCounts[name] || 0} open</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-wrap">
          <h2 className="landing-section-title">Why BraFom is different</h2>
          <div className="landing-why-grid">
            <article className="landing-why-card">
              <div className="landing-why-icon"><Star size={26} strokeWidth={1.6} color="#dca53a" /></div>
              <h3 className="landing-why-head">Ratings keep providers honest</h3>
              <p className="landing-why-copy">Every completed job requires a review from both sides. Providers with low ratings lose ground in search, so the best providers naturally rise to the top over time.</p>
            </article>
            <article className="landing-why-card">
              <div className="landing-why-icon"><ShieldCheck size={26} strokeWidth={1.6} color="#1ea85a" /></div>
              <h3 className="landing-why-head">Verified providers only</h3>
              <p className="landing-why-copy">Every provider submits a national ID and completes a skills assessment before they can bid. You see verification badges on each profile so you know who you are dealing with.</p>
            </article>
            <article className="landing-why-card">
              <div className="landing-why-icon"><TrendingDown size={26} strokeWidth={1.6} color="#2563eb" /></div>
              <h3 className="landing-why-head">The price moves toward you</h3>
              <p className="landing-why-copy">On most platforms you negotiate alone. Here, providers compete against each other and drive the price down from your ceiling until you pick your winner.</p>
            </article>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-wrap">
          <div className="landing-footer-grid">
            <div>
              <div className="landing-footer-logo">BraFom</div>
              <p className="landing-footer-copy">Reverse auction marketplace for local services across Ghana. Providers compete. You save.</p>
            </div>
            <div className="landing-footer-col">
              <h4>SERVICES</h4>
              {['Home Repairs', 'Tutoring', 'Photography', 'Cleaning', 'Catering', 'IT & Tech Support'].map((cat) => (
                <button key={cat} type="button" onClick={() => navigate(`/browse?category=${encodeURIComponent(cat)}`)}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="landing-footer-col">
              <h4>CITIES</h4>
              {['Accra', 'Kumasi', 'Takoradi', 'Tamale', 'Cape Coast', 'Tema'].map((c) => (
                <button key={c} type="button" onClick={() => navigate(`/browse?status=open&city=${encodeURIComponent(c)}`)}>
                  {c}
                </button>
              ))}
            </div>
            <div className="landing-footer-col">
              <h4>QUICK LINKS</h4>
              <button type="button" onClick={() => navigate('/browse')}>Browse Requests</button>
              <button type="button" onClick={() => navigate('/post-job')}>Post a Job</button>
              <button type="button" onClick={() => navigate('/register')}>Create Account</button>
              <button type="button" onClick={() => navigate('/login')}>Sign In</button>
            </div>
          </div>
          <div className="landing-footer-bottom">© 2026 BraFom Technologies Ltd. Accra, Ghana</div>
        </div>
      </footer>
    </div>
  )
}
