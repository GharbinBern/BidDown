import { useNavigate } from 'react-router-dom'
import { BadgeCheck, DollarSign, FileText, Lock, Search, TrendingDown, Users, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
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
