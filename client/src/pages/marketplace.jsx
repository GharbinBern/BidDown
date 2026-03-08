import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJobsStore } from '../store'

const CATEGORIES = ["All", "Design", "Development", "Marketing", "Writing", "Legal", "Consulting", "Other"]

const INITIAL_LISTINGS = [
  { id: 1, title: "Logo & Brand Identity Design", desc: "Need a complete brand identity package: logo, color palette, typography guide, and basic brand guidelines doc. Modern, clean aesthetic for a fintech startup.", budget: 800, category: "Design", bids: 7, hoursLeft: 18, urgent: false, bidsData: [{ seller: "StudioNova", rating: 4.9, amount: 620, note: "5 concepts, 3 revisions" }, { seller: "PixelForge", rating: 4.7, amount: 680, note: "Full brand kit + source files" }, { seller: "CreativeCo", rating: 4.5, amount: 590, note: "2 concepts, unlimited revisions" }] },
  { id: 2, title: "React Dashboard Development", desc: "Build a data analytics dashboard using React + Recharts. Must include 6 chart types, dark mode, responsive layout, and connect to our REST API.", budget: 2200, category: "Development", bids: 12, hoursLeft: 6, urgent: true, bidsData: [{ seller: "DevHive", rating: 5.0, amount: 1800, note: "10 years React exp, delivery in 5 days" }, { seller: "CodeCraft", rating: 4.8, amount: 1950, note: "TypeScript + tests included" }, { seller: "ReactPro", rating: 4.6, amount: 1700, note: "Can start immediately" }] },
  { id: 3, title: "SEO Content Strategy (3 months)", desc: "Develop a full SEO content strategy including keyword research, competitor analysis, content calendar (12 posts/month), and 2 sample articles.", budget: 1500, category: "Marketing", bids: 5, hoursLeft: 42, urgent: false, bidsData: [{ seller: "GrowthLab", rating: 4.8, amount: 1200, note: "Includes monthly reporting" }, { seller: "SEOmasters", rating: 4.6, amount: 1350, note: "Guaranteed 20% traffic increase" }] },
  { id: 4, title: "Terms of Service + Privacy Policy", desc: "Need ToS and Privacy Policy drafted for a SaaS product operating in the US and EU (GDPR compliant). Must be reviewed by a licensed attorney.", budget: 600, category: "Legal", bids: 3, hoursLeft: 72, urgent: false, bidsData: [{ seller: "LexGroup", rating: 4.9, amount: 480, note: "Licensed in NY and CA" }, { seller: "LegalEase", rating: 4.7, amount: 550, note: "GDPR specialist" }] },
  { id: 5, title: "Product Explainer Video Script", desc: "90-second explainer video script for a B2B SaaS tool. Need 3 draft options with hooks, clear value prop, and strong CTA. Voice-over direction included.", budget: 350, category: "Writing", bids: 9, hoursLeft: 30, urgent: false, bidsData: [{ seller: "CopyHouse", rating: 4.8, amount: 280, note: "Specializes in SaaS" }, { seller: "WordSmith", rating: 4.7, amount: 295, note: "3 scripts, full revision" }, { seller: "ScriptLab", rating: 4.5, amount: 260, note: "Delivered in 48 hours" }] },
  { id: 6, title: "Go-to-Market Strategy Consulting", desc: "4-week engagement to develop a GTM strategy for a new mobile app. Deliverables: market sizing, ICP definition, pricing model, launch plan.", budget: 4000, category: "Consulting", bids: 4, hoursLeft: 90, urgent: false, bidsData: [{ seller: "StrategyX", rating: 5.0, amount: 3400, note: "Former McKinsey, startup GTM expert" }, { seller: "VentureAdv", rating: 4.8, amount: 3600, note: "10+ successful launches" }] },
]

function Timer({ hours }) {
  return <span className={`timer ${hours <= 12 ? "low" : ""}`}><span className="timer-dot" />{hours}h left</span>
}

function ListingModal({ listing, onClose, onBid }) {
  if (!listing) return null
  
  const sortedBids = [...listing.bidsData].sort((a, b) => a.amount - b.amount)

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{listing.title}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="info-row"><span className="info-label">Category</span><span className="listing-category">{listing.category}</span></div>
        <div className="info-row"><span className="info-label">Budget Cap</span><span style={{ color: "var(--accent)", fontWeight: 700, fontFamily: "'Syne',sans-serif", fontSize: 18 }}>${listing.budget.toLocaleString()}</span></div>
        <div className="info-row"><span className="info-label">Time Remaining</span><Timer hours={listing.hoursLeft} /></div>
        <div className="info-row"><span className="info-label">Total Bids</span><span>{listing.bids} (sealed during bidding window)</span></div>
        <div style={{ margin: "16px 0", color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>{listing.desc}</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
          {sortedBids.length > 0 ? "All Bids — Ranked Lowest First" : "No bids yet — be the first!"}
        </div>
        <div className="bid-list">
          {sortedBids.map((b, i) => (
            <div key={i} className={`bid-item ${i === 0 ? "winner" : ""}`}>
              <div className="bid-seller">
                {b.seller} {i === 0 && <span style={{ color: "var(--green)", fontSize: 10 }}>★ LOWEST BID</span>}
                <small>{"★".repeat(Math.round(b.rating))} {b.rating} · {b.note}</small>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className={`bid-amount ${i === 0 ? "lowest" : ""}`}>${b.amount.toLocaleString()}</div>
                <button className="btn btn-success btn-sm" onClick={() => onClose()}>Accept</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onBid}>Submit a Bid</button>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  const [listings, setListings] = useState(INITIAL_LISTINGS)
  const [selected, setSelected] = useState(null)
  const [catFilter, setCatFilter] = useState("All")
  const [search, setSearch] = useState("")

  const filtered = listings.filter(l =>
    (catFilter === "All" || l.category === catFilter) &&
    (l.title.toLowerCase().includes(search.toLowerCase()) || l.desc.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="main">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Open <span>Requests</span></div>
        <button className="btn btn-primary">+ Post Request</button>
      </div>
      <div className="filters">
        {CATEGORIES.map(c => <button key={c} className={`filter-pill ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>{c}</button>)}
        <div className="filter-spacer" />
        <input className="search-box" placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="listings-grid">
        {filtered.map(l => (
          <div key={l.id} className={`listing-card ${l.urgent ? "urgent" : ""}`} onClick={() => setSelected(l)}>
            <div className="listing-header">
              <span className="listing-category">{l.category}</span>
              <span className="listing-bids"><strong>{l.bids}</strong> bids</span>
            </div>
            <div className="listing-title">{l.title}</div>
            <div className="listing-desc">{l.desc.substring(0, 100)}...</div>
            <div className="listing-footer">
              <div>
                <div className="budget-label">Budget Cap</div>
                <div className="budget-amount">${l.budget.toLocaleString()} <span>max</span></div>
              </div>
              <Timer hours={l.hoursLeft} />
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty"><div className="empty-icon">🔍</div><h3>No requests found</h3><p>Try adjusting your filters or post a new request.</p></div>}
      <ListingModal listing={selected} onClose={() => setSelected(null)} onBid={() => setSelected(null)} />
    </div>
  )
}
