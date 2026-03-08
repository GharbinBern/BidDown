import { useEffect } from 'react'
import { useAnalyticsStore } from '../store'

function BarChart({ data, label }) {
  const max = Math.max(...data.map(d => d.val))
  return (
    <div className="chart-bar-container">
      <div className="chart-title">{label}</div>
      <div className="bar-chart">
        {data.map((d, i) => (
          <div className="bar-col" key={i}>
            <div className="bar-val">{d.val}</div>
            <div className="bar" style={{ height: `${(d.val / max) * 90}px` }} />
            <div className="bar-label">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { marketStats, fetchMarketAnalytics, loading } = useAnalyticsStore()

  useEffect(() => {
    fetchMarketAnalytics()
  }, [])

  return (
    <div className="main">
      <div className="section-title">Market <span>Analytics</span></div>
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        <div className="dash-card"><div className="dash-card-label">Avg Bids per Request</div><div className="dash-card-value accent">6.7</div></div>
        <div className="dash-card"><div className="dash-card-label">Avg Price Drop</div><div className="dash-card-value green">28%</div><div className="dash-card-sub">below buyer budget cap</div></div>
        <div className="dash-card"><div className="dash-card-label">Market Efficiency</div><div className="dash-card-value green">High</div><div className="dash-card-sub">Nash equilibrium reached</div></div>
        <div className="dash-card"><div className="dash-card-label">Info Asymmetry Index</div><div className="dash-card-value accent">0.14</div><div className="dash-card-sub">low — lemons problem mitigated</div></div>
      </div>
      <div className="analytics-grid">
        <BarChart label="Bids by Category" data={[{ label: "Design", val: 82 }, { label: "Dev", val: 134 }, { label: "Mktg", val: 61 }, { label: "Legal", val: 28 }, { label: "Write", val: 74 }, { label: "Consult", val: 43 }]} />
        <BarChart label="Avg Savings by Category (%)" data={[{ label: "Design", val: 24 }, { label: "Dev", val: 31 }, { label: "Mktg", val: 22 }, { label: "Legal", val: 18 }, { label: "Write", val: 27 }, { label: "Consult", val: 35 }]} />
        <BarChart label="Requests Posted per Day (This Week)" data={[{ label: "Mon", val: 38 }, { label: "Tue", val: 52 }, { label: "Wed", val: 47 }, { label: "Thu", val: 61 }, { label: "Fri", val: 44 }, { label: "Sat", val: 29 }, { label: "Sun", val: 21 }]} />
        <BarChart label="Seller Rating Distribution" data={[{ label: "5.0★", val: 420 }, { label: "4.8★", val: 680 }, { label: "4.6★", val: 540 }, { label: "4.4★", val: 310 }, { label: "4.2★", val: 140 }, { label: "<4★", val: 60 }]} />
      </div>
      <div className="chart-bar-container" style={{ marginTop: 16 }}>
        <div className="chart-title">RCT Result: BidDown vs. Posted-Price Market — Average Transaction Price</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Control Group (Posted Price)</div>
            <div style={{ fontSize: 36, fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>$1,840</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>avg transaction · n=200</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Treatment Group (BidDown)</div>
            <div style={{ fontSize: 36, fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "var(--green)" }}>$1,324</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>28% reduction · p &lt; 0.01 ✓ statistically significant</div>
          </div>
        </div>
      </div>
    </div>
  )
}
