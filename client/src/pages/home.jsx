import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div>
      <div className="hero">
        <div className="hero-tag">Reverse Auction Marketplace</div>
        <h1>You set the price.<br /><span className="highlight">Sellers compete.</span></h1>
        <p>Post what you need, set your maximum budget, and watch verified sellers bid down to win your business.</p>
        <div className="hero-btns">
          <button className="btn btn-ghost" style={{ padding: "12px 28px", fontSize: "14px" }} onClick={() => navigate('/marketplace')}>
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
      <div className="main">
        <div className="section-title">How <span>BidDown</span> Works</div>
        <div className="how-grid">
          {[
            { num: "1", icon: "📋", title: "Post Your Request", desc: "Describe what you need. Set your maximum budget and deadline. No upfront commitment." },
            { num: "2", icon: "⚔️", title: "Sellers Compete", desc: "Verified sellers submit sealed bids. They can't see each other's amounts — only the total bid count." },
            { num: "3", icon: "🔍", title: "Compare & Choose", desc: "See all bids ranked by price. Review seller ratings and delivery notes before deciding." },
            { num: "4", icon: "✅", title: "Accept & Transact", desc: "Accept the best bid. Funds held in escrow until work is delivered and you approve." },
          ].map(s => (
            <div key={s.num} className="how-card" data-num={s.num}>
              <div className="how-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="section-title" style={{ marginTop: 40 }}>The <span>Economics</span> Behind It</div>
        <div className="how-grid">
          {[
            { num: "A", icon: "📉", title: "Reverse Auction Theory", desc: "Unlike standard auctions, sellers bid down. Competition drives prices toward marginal cost — maximizing buyer surplus." },
            { num: "B", icon: "🔒", title: "Sealed Bids (Bayesian)", desc: "Sellers cannot see rivals' bids, forcing them to estimate competitor types. This mirrors first-price sealed-bid Nash equilibria." },
            { num: "C", icon: "🍋", title: "Solving the Lemons Problem", desc: "Seller ratings and verified reviews act as quality signals, reducing information asymmetry that would otherwise collapse the market." },
            { num: "D", icon: "💰", title: "WTP & Budget Caps", desc: "Your posted budget ceiling functions as your revealed WTP. Sellers who meet it gain access — efficient allocation by design." },
          ].map(s => (
            <div key={s.num} className="how-card" data-num={s.num}>
              <div className="how-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
