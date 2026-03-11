import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../api'

function BarChart({ data, label }) {
  const max = Math.max(...data.map(d => d.val), 1)
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
  const [loading, setLoading] = useState(true)
  const [marketStats, setMarketStats] = useState(null)
  const [categoryStats, setCategoryStats] = useState([])
  const [bidStats, setBidStats] = useState(null)

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true)
      try {
        const [marketRes, categoriesRes, bidsRes] = await Promise.all([
          api.getMarketAnalytics(),
          api.getCategoryAnalytics(),
          api.getBidAnalytics(),
        ])
        setMarketStats(marketRes.data)
        setCategoryStats(categoriesRes.data || [])
        setBidStats(bidsRes.data || null)
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  const avgBidsPerRequest = Number(bidStats?.stats?.avgBidsPerJob || 0)
  const avgSavingsPercent = Number(marketStats?.savings?.avgSavingsPercent || 0)
  const totalJobs = Number(marketStats?.jobs?.total || 0)
  const closedOrCompleted = Number(marketStats?.jobs?.closed || 0) + Number(marketStats?.jobs?.completed || 0)
  const closureRate = totalJobs > 0 ? (closedOrCompleted / totalJobs) * 100 : 0

  const bidsByCategory = useMemo(
    () => categoryStats.map((c) => ({ label: c.category.slice(0, 7), val: Number(c.jobCount || 0) })),
    [categoryStats]
  )

  const savingsByCategory = useMemo(
    () => categoryStats.map((c) => ({ label: c.category.slice(0, 7), val: Number(c.avgSavingsPercent || 0) })),
    [categoryStats]
  )

  const bidDistribution = useMemo(() => {
    const labels = ['1-3', '4-6', '7+']
    return labels.map((label) => ({
      label,
      val: Number((bidStats?.distribution || []).find((d) => d._id === label)?.count || 0),
    }))
  }, [bidStats])

  const jobsByStatus = useMemo(() => ([
    { label: 'Open', val: Number(marketStats?.jobs?.open || 0) },
    { label: 'Closed', val: Number(marketStats?.jobs?.closed || 0) },
    { label: 'Done', val: Number(marketStats?.jobs?.completed || 0) },
  ]), [marketStats])

  return (
    <div className="main">
      <div className="section-title">Market <span>Analytics</span></div>
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        <div className="dash-card"><div className="dash-card-label">Avg Bids per Request</div><div className="dash-card-value accent">{avgBidsPerRequest.toFixed(1)}</div></div>
        <div className="dash-card"><div className="dash-card-label">Avg Price Drop</div><div className="dash-card-value green">{avgSavingsPercent.toFixed(1)}%</div><div className="dash-card-sub">below buyer budget cap</div></div>
        <div className="dash-card"><div className="dash-card-label">Closed/Completed Jobs</div><div className="dash-card-value green">{closedOrCompleted}</div><div className="dash-card-sub">of {totalJobs} total jobs</div></div>
        <div className="dash-card"><div className="dash-card-label">Closure Rate</div><div className="dash-card-value accent">{closureRate.toFixed(1)}%</div><div className="dash-card-sub">jobs resolved from marketplace</div></div>
      </div>
      <div className="analytics-grid">
        <BarChart label="Jobs by Category" data={bidsByCategory} />
        <BarChart label="Avg Savings by Category (%)" data={savingsByCategory} />
        <BarChart label="Bid Distribution (Jobs)" data={bidDistribution} />
        <BarChart label="Jobs by Status" data={jobsByStatus} />
      </div>
      <div className="chart-bar-container" style={{ marginTop: 16 }}>
        <div className="chart-title">Marketplace Totals</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Total Posted Budget</div>
            <div style={{ fontSize: 36, fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>${Number(marketStats?.savings?.totalBudget || 0).toLocaleString()}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>closed/completed requests</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Total Winning Bid Spend</div>
            <div style={{ fontSize: 36, fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "var(--green)" }}>${Number(marketStats?.savings?.totalSpent || 0).toLocaleString()}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Savings: ${Number(marketStats?.savings?.totalSavings || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
