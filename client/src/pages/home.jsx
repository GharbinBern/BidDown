import { useNavigate } from 'react-router-dom'
import { BadgeCheck, CheckCircle2, Coins, DollarSign, FileText, Lock, Search, TrendingDown, Users } from 'lucide-react'

const RAIN_COUNT = 32

const RAIN_ITEMS = Array.from({ length: RAIN_COUNT }, (_, index) => {
  const seed = (index * 9301 + 49297) % 233280
  const ratio = seed / 233280
  return {
    id: index,
    x: 2 + ratio * 96,
    delay: (index % 8) * 0.55,
    duration: 7 + (ratio * 5),
    size: 14 + Math.round(ratio * 20),
    drift: -18 + ratio * 36,
    spin: -120 + ratio * 240,
    opacity: 0.18 + ratio * 0.24,
    kind: index % 3,
  }
})

function CoinGlyph({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 42 42" fill="none" aria-hidden="true">
      <circle cx="21" cy="21" r="17" fill="#38a169" />
      <circle cx="21" cy="21" r="12.5" stroke="#1f7a4f" strokeWidth="1.6" />
      <path d="M24.2 15.9C23.5 15.3 22.3 14.8 20.8 14.8C18.6 14.8 17.1 15.9 17.1 17.6C17.1 19.4 18.7 20.1 20.7 20.6C22.4 21 23.1 21.4 23.1 22.3C23.1 23.3 22.1 24 20.7 24C19.3 24 18.2 23.5 17.2 22.7" stroke="#0f5132" strokeWidth="2" strokeLinecap="round" />
      <path d="M20.7 13V15" stroke="#0f5132" strokeWidth="2" strokeLinecap="round" />
      <path d="M20.7 24V26" stroke="#0f5132" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="hero">
        <div className="money-rain" aria-hidden="true">
          {RAIN_ITEMS.map((item) => (
            <span
              key={item.id}
              className="money-drop"
              style={{
                left: `${item.x}%`,
                animationDelay: `${item.delay}s`,
                animationDuration: `${item.duration}s`,
                opacity: item.opacity,
                '--drop-drift': `${item.drift}px`,
                '--drop-spin': `${item.spin}deg`,
              }}
            >
              {item.kind === 0 && <Coins size={item.size} strokeWidth={1.9} />}
              {item.kind === 1 && <DollarSign size={item.size} strokeWidth={2.1} />}
              {item.kind === 2 && <CoinGlyph size={item.size + 2} />}
            </span>
          ))}
        </div>

        <div className="hero-content">
          <div className="hero-tag">Reverse Auction Marketplace</div>
          <h1>You set the price.<br /><span className="highlight">Sellers compete.</span></h1>
          <p>Post what you need, set your maximum budget, and watch verified sellers bid down to win your business.</p>
          <div className="hero-btns">
            <button className="btn btn-ghost" style={{ padding: '12px 28px', fontSize: '14px' }} onClick={() => navigate('/marketplace')}>
              See Marketplace
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item"><div className="stat-num">2,841</div><div className="stat-label">Active Requests</div></div>
            <div className="stat-item"><div className="stat-num">$1.2M</div><div className="stat-label">Saved by Buyers</div></div>
            <div className="stat-item"><div className="stat-num">18,400</div><div className="stat-label">Verified Sellers</div></div>
            <div className="stat-item"><div className="stat-num">94%</div><div className="stat-label">Satisfaction Rate</div></div>
          </div>
        </div>
      </div>
      <div className="main">
        <section className="shell-panel">
        <div className="section-title">How <span>BidDown</span> Works</div>
        <div className="how-grid">
          {[
            { num: "1", icon: FileText, title: "Post Your Request", desc: "Describe what you need. Set your maximum budget and deadline. No upfront commitment." },
            { num: "2", icon: Users, title: "Sellers Compete", desc: "Verified sellers submit sealed bids. They can't see each other's amounts — only the total bid count." },
            { num: "3", icon: Search, title: "Compare & Choose", desc: "See all bids ranked by price. Review seller ratings and delivery notes before deciding." },
            { num: "4", icon: CheckCircle2, title: "Accept & Transact", desc: "Accept the best bid. Funds held in escrow until work is delivered and you approve." },
          ].map(s => (
            <div key={s.num} className="how-card" data-num={s.num}>
              <div className="how-icon"><s.icon size={22} /></div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
        </section>
        <section className="shell-panel">
        <div className="section-title" style={{ marginTop: 8 }}>The <span>Economics</span> Behind It</div>
        <div className="how-grid">
          {[
            { num: "A", icon: TrendingDown, title: "Reverse Auction Theory", desc: "Unlike standard auctions, sellers bid down. Competition drives prices toward marginal cost — maximizing buyer surplus." },
            { num: "B", icon: Lock, title: "Sealed Bids (Bayesian)", desc: "Sellers cannot see rivals' bids, forcing them to estimate competitor types. This mirrors first-price sealed-bid Nash equilibria." },
            { num: "C", icon: BadgeCheck, title: "Solving the Lemons Problem", desc: "Seller ratings and verified reviews act as quality signals, reducing information asymmetry that would otherwise collapse the market." },
            { num: "D", icon: DollarSign, title: "WTP & Budget Caps", desc: "Your posted budget ceiling functions as your revealed WTP. Sellers who meet it gain access — efficient allocation by design." },
          ].map(s => (
            <div key={s.num} className="how-card" data-num={s.num}>
              <div className="how-icon"><s.icon size={22} /></div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
        </section>
      </div>
    </div>
  )
}
