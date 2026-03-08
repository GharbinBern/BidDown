import { useState } from 'react'
import { useAuthStore } from '../store'

const myBids = [
  { listing: "React Dashboard Development", amount: 1800, status: "winning", time: "2h ago" },
  { listing: "Logo & Brand Identity", amount: 620, status: "winning", time: "5h ago" },
  { listing: "SEO Content Strategy", amount: 1200, status: "outbid", time: "1d ago" },
]

const myListings = [
  { title: "React Dashboard Development", category: "Development", budget: 2200, bids: 12, status: "Open" },
  { title: "Logo & Brand Identity Design", category: "Design", budget: 800, bids: 7, status: "Open" },
  { title: "SEO Content Strategy (3 months)", category: "Marketing", budget: 1500, bids: 5, status: "Open" },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [dashTab, setDashTab] = useState("requests")

  return (
    <div className="main">
      <div className="section-title">Your <span>Dashboard</span></div>
      <div className="dashboard-grid">
        <div className="dash-card"><div className="dash-card-label">Active Requests</div><div className="dash-card-value accent">3</div><div className="dash-card-sub">2 receiving bids</div></div>
        <div className="dash-card"><div className="dash-card-label">Total Saved</div><div className="dash-card-value green">$1,840</div><div className="dash-card-sub">vs. posted-price market</div></div>
        <div className="dash-card"><div className="dash-card-label">Bids Submitted</div><div className="dash-card-value accent">3</div><div className="dash-card-sub">2 currently winning</div></div>
        <div className="dash-card"><div className="dash-card-label">Avg Bid Reduction</div><div className="dash-card-value green">23%</div><div className="dash-card-sub">below your budget cap</div></div>
      </div>
      <div className="sub-tabs">
        {["requests", "my bids", "transactions"].map(t => (
          <button key={t} className={`sub-tab ${dashTab === t ? "active" : ""}`} onClick={() => setDashTab(t)}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>
      {dashTab === "requests" && (
        <table className="table">
          <thead><tr><th>Request</th><th>Category</th><th>Budget</th><th>Bids</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {myListings.map((l, i) => (
              <tr key={i}>
                <td style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>{l.title}</td>
                <td><span className="listing-category">{l.category}</span></td>
                <td style={{ color: "var(--accent)", fontWeight: 700 }}>${l.budget.toLocaleString()}</td>
                <td>{l.bids}</td>
                <td><span className={`status-pill status-open`}>{l.status}</span></td>
                <td><button className="btn btn-ghost btn-sm">View Bids</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {dashTab === "my bids" && (
        <table className="table">
          <thead><tr><th>Request</th><th>Your Bid</th><th>Status</th><th>Submitted</th></tr></thead>
          <tbody>
            {myBids.map((b, i) => (
              <tr key={i}>
                <td style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>{b.listing}</td>
                <td style={{ color: "var(--accent)", fontWeight: 700 }}>${b.amount.toLocaleString()}</td>
                <td><span className={`status-pill ${b.status === "winning" ? "status-closed" : "status-pending"}`}>{b.status}</span></td>
                <td style={{ color: "var(--muted)" }}>{b.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {dashTab === "transactions" && <div className="empty"><div className="empty-icon">💳</div><h3>No completed transactions yet</h3><p>Accept a bid to start a transaction.</p></div>}
    </div>
  )
}
