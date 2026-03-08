import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import HomePage from './pages/home'
import MarketplacePage from './pages/marketplace'
import JobDetailPage from './pages/job'
import DashboardPage from './pages/dashboard'
import { useAuthStore } from './store'

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f3f8ff;
    --surface: #ffffff;
    --card: #edf4ff;
    --border: #cfdcf2;
    --accent: #2563eb;
    --accent2: #dc2626;
    --text: #0f172a;
    --muted: #5b6b85;
    --green: #059669;
    --radius: 12px;
  }

  body { background: linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%); color: var(--text); font-family: 'DM Mono', monospace; font-size: 15px; }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 32px; border-bottom: 1px solid var(--border);
    background: var(--surface); position: sticky; top: 0; z-index: 100;
  }
  .nav-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: var(--accent); cursor: pointer; }
  .nav-logo span { color: var(--text); }
  .nav-tabs { display: flex; gap: 4px; }
  .nav-tab {
    padding: 8px 16px; border-radius: 8px; border: none; background: transparent;
    color: var(--muted); font-family: 'DM Mono', monospace; font-size: 14px; cursor: pointer; transition: all 0.2s;
  }
  .nav-tab:hover { color: var(--text); background: var(--card); }
  .nav-tab.active { color: var(--accent); background: var(--card); }
  .nav-right { display: flex; gap: 10px; align-items: center; }
  .badge { background: var(--accent); color: #fff; font-size: 12px; padding: 4px 10px; border-radius: 20px; }
  .btn { padding: 9px 20px; border-radius: var(--radius); border: none; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 500; transition: all 0.2s; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
  .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover { color: var(--text); border-color: var(--muted); }
  .btn-success { background: var(--green); color: #fff; }
  .btn-sm { padding: 6px 14px; font-size: 13px; }

  .main { flex: 1; padding: 32px; max-width: 1200px; margin: 0 auto; width: 100%; }

  .hero { text-align: center; padding: 80px 20px 60px; background: radial-gradient(ellipse at 50% 0%, #2563eb1c 0%, transparent 70%); }
  .hero-tag { display: inline-block; border: 1px solid var(--accent); color: var(--accent); font-size: 11px; padding: 4px 12px; border-radius: 20px; margin-bottom: 24px; letter-spacing: 2px; text-transform: uppercase; }
  .hero h1 { font-family: 'Syne', sans-serif; font-size: clamp(36px, 6vw, 72px); font-weight: 800; line-height: 1.05; margin-bottom: 20px; letter-spacing: -2px; }
  .hero h1 .highlight { color: var(--accent); }
  .hero p { color: var(--muted); font-size: 17px; max-width: 520px; margin: 0 auto 36px; line-height: 1.7; }
  .hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .hero-stats { display: flex; gap: 40px; justify-content: center; margin-top: 60px; padding-top: 40px; border-top: 1px solid var(--border); flex-wrap: wrap; }
  .stat-item { text-align: center; }
  .stat-num { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: var(--accent); }
  .stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; letter-spacing: 1px; text-transform: uppercase; }

  .section-title { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 700; margin-bottom: 24px; letter-spacing: -0.5px; }
  .section-title span { color: var(--accent); }

  .how-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 48px; }
  .how-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; position: relative; overflow: hidden; }
  .how-card::before { content: attr(data-num); position: absolute; top: -10px; right: 12px; font-family: 'Syne', sans-serif; font-size: 80px; font-weight: 800; color: var(--accent); opacity: 0.06; line-height: 1; }
  .how-card h3 { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 8px; }
  .how-card p { color: var(--muted); font-size: 13px; line-height: 1.7; }
  .how-icon { font-size: 24px; margin-bottom: 12px; }

  .filters { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; }
  .filter-pill { padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border); background: transparent; color: var(--muted); font-family: 'DM Mono', monospace; font-size: 13px; cursor: pointer; transition: all 0.2s; }
  .filter-pill.active, .filter-pill:hover { border-color: var(--accent); color: var(--accent); }
  .filter-spacer { flex: 1; }
  .search-box { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 9px 16px; color: var(--text); font-family: 'DM Mono', monospace; font-size: 14px; width: 220px; outline: none; }
  .search-box:focus { border-color: var(--accent); }
  .search-box::placeholder { color: var(--muted); }

  .listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
  .listing-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 22px; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
  .listing-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 8px 32px #2563eb22; }
  .listing-card.urgent { border-color: var(--accent2); }
  .listing-card.urgent::after { content: 'URGENT'; position: absolute; top: 12px; right: -20px; background: var(--accent2); color: #fff; font-size: 9px; letter-spacing: 1.5px; padding: 3px 28px; transform: rotate(45deg); }
  .listing-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .listing-category { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--accent); border: 1px solid var(--accent); padding: 2px 8px; border-radius: 4px; }
  .listing-bids { font-size: 12px; color: var(--muted); }
  .listing-bids strong { color: var(--text); }
  .listing-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .listing-desc { color: var(--muted); font-size: 13px; line-height: 1.6; margin-bottom: 16px; }
  .listing-footer { display: flex; justify-content: space-between; align-items: center; }
  .budget-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
  .budget-amount { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--accent); }
  .budget-amount span { font-size: 13px; font-weight: 400; color: var(--muted); }
  .timer { font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 4px; }
  .timer.low { color: var(--accent2); }
  .timer-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: pulse 1s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .modal-overlay { position: fixed; inset: 0; background: #000a; backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
  .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; max-width: 580px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 32px; animation: slideUp 0.25s ease; }
  @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .modal-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; }
  .modal-close { background: none; border: none; color: var(--muted); font-size: 20px; cursor: pointer; }

  .bid-list { display: flex; flex-direction: column; gap: 10px; margin: 20px 0; }
  .bid-item { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; }
  .bid-item.winner { border-color: var(--green); background: #4ade8008; }
  .bid-seller { font-size: 13px; }
  .bid-seller small { color: var(--muted); font-size: 11px; display: block; margin-top: 2px; }
  .bid-amount { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; }
  .bid-amount.lowest { color: var(--green); }

  .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
  .info-row:last-child { border: none; }
  .info-label { color: var(--muted); }

  .form-group { margin-bottom: 18px; }
  .form-label { display: block; font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .form-input, .form-textarea, .form-select { width: 100%; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 16px; color: var(--text); font-family: 'DM Mono', monospace; font-size: 14px; outline: none; transition: border 0.2s; }
  .form-input:focus, .form-textarea:focus, .form-select:focus { border-color: var(--accent); }
  .form-textarea { resize: vertical; min-height: 90px; }
  .form-select option { background: var(--card); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-hint { font-size: 11px; color: var(--muted); margin-top: 6px; }

  .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 32px; }
  .dash-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }
  .dash-card-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
  .dash-card-value { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; }
  .dash-card-value.accent { color: var(--accent); }
  .dash-card-value.green { color: var(--green); }
  .dash-card-sub { font-size: 11px; color: var(--muted); margin-top: 6px; }

  .table { width: 100%; border-collapse: collapse; }
  .table th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); padding: 10px 14px; border-bottom: 1px solid var(--border); }
  .table td { padding: 14px; border-bottom: 1px solid var(--border); font-size: 14px; }
  .table tr:last-child td { border: none; }
  .table tr:hover td { background: var(--card); }
  .status-pill { font-size: 10px; padding: 3px 10px; border-radius: 20px; letter-spacing: 1px; text-transform: uppercase; }
  .status-open { background: #2563eb1a; color: var(--accent); }
  .status-closed { background: #0596691a; color: var(--green); }
  .status-pending { background: #dc26261a; color: var(--accent2); }

  .chart-bar-container { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 16px; }
  .chart-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; margin-bottom: 20px; }
  .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
  .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .bar { width: 100%; background: var(--accent); border-radius: 4px 4px 0 0; transition: height 0.5s ease; min-height: 4px; opacity: 0.85; }
  .bar:hover { opacity: 1; }
  .bar-label { font-size: 10px; color: var(--muted); }
  .bar-val { font-size: 10px; color: var(--accent); }
  .analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .sub-tabs { display: flex; gap: 0; margin-bottom: 24px; border-bottom: 1px solid var(--border); }
  .sub-tab { padding: 10px 20px; font-family: 'DM Mono', monospace; font-size: 14px; cursor: pointer; border: none; background: none; color: var(--muted); border-bottom: 2px solid transparent; margin-bottom: -1px; }
  .sub-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

  .empty { text-align: center; padding: 60px 20px; color: var(--muted); }
  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; display: flex; justify-content: center; align-items: center; }
  .empty h3 { font-family: 'Syne', sans-serif; font-size: 18px; color: var(--text); margin-bottom: 8px; }

  .loading-panel {
    background: linear-gradient(120deg, var(--card) 25%, #f7fbff 40%, var(--card) 55%);
    background-size: 200% 100%;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
    margin-bottom: 16px;
    animation: shimmer 1.6s linear infinite;
  }
  .loading-row { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: 13px; }
  .loading-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--accent); animation: pulse 1.1s ease-in-out infinite; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  @media(max-width: 600px) { .analytics-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } .nav-tabs { display: none; } }
`;

function NavbarComponent() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const roles = user?.roles || []
  const roleLabel = roles.includes('buyer') && roles.includes('seller')
    ? 'Buyer + Seller'
    : roles.includes('seller')
      ? 'Seller'
      : 'Buyer'
  
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => navigate('/')}>Bid<span>Down</span></div>
      <div className="nav-tabs">
        {isAuthenticated && (
          <>
            <button className="nav-tab" onClick={() => navigate('/marketplace')}>Marketplace</button>
            <button className="nav-tab" onClick={() => navigate('/dashboard')}>My Space</button>
          </>
        )}
      </div>
      <div className="nav-right">
        {isAuthenticated ? (
          <>
            <span className="badge">{roleLabel}</span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.name}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/'); }}>Sign Out</button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Sign Up</button>
          </>
        )}
      </div>
    </nav>
  )
}

function AppContent() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/jobs/:id" element={<JobDetailPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
      <Route path="/analytics" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <>
      <style>{style}</style>
      <BrowserRouter>
        <div className="app">
          <NavbarComponent />
          <AppContent />
        </div>
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </>
  )
}

export default App
