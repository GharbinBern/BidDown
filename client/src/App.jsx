import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Bell } from 'lucide-react'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import HomePage from './pages/home'
import MarketplacePage from './pages/marketplace'
import JobDetailPage from './pages/job'
import DashboardPage from './pages/dashboard'
import SettingsPage from './pages/settings'
import NotificationsPage from './pages/notifications'
import RatingPage from './pages/rating'
import { useAuthStore, useNotificationsStore, usePreferencesStore } from './store'

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f8fafb;
    --surface: #ffffff;
    --card: #eef2ff;
    --card-2: #f8faff;
    --border: #d1d5db;
    --accent: #2563eb;
    --accent-dark: #1d4ed8;
    --accent-soft: #2563eb1a;
    --accent2: #b42318;
    --text: #111827;
    --muted: #6b7280;
    --blue: #3b82f6;
    --radius: 8px;
    --radius-sm: 6px;
    --shadow-sm: 0 1px 3px #0000001a;
    --shadow-lg: 0 10px 30px #00000014;
  }



  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Geist Mono', monospace;
    font-size: 15px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }



  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: clip;
  }

  .app::before {
    display: none;
  }

  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    background: #fff;
    position: sticky;
    top: 0;
    z-index: 110;
  }
  .nav-logo {
    font-family: 'Geist Mono', monospace;
    font-weight: 700;
    font-size: 20px;
    color: var(--accent);
    cursor: pointer;
    letter-spacing: -0.4px;
  }
  .nav-logo span { color: var(--text); }
  .nav-tabs { display: flex; gap: 6px; }
  .nav-tab {
    padding: 8px 14px;
    border-radius: var(--radius-sm);
    border: none;
    background: transparent;
    color: var(--muted);
    font-family: 'Geist Mono', monospace;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .nav-tab:hover { color: var(--text); background: var(--card); }
  .nav-tab.active { color: var(--accent); background: var(--accent-soft); }
  .nav-right { display: flex; gap: 10px; align-items: center; }
  .nav-user-link {
    border: 1px solid #2563eb33;
    background: #2563eb14;
    color: var(--accent);
    font-family: 'Geist Mono', monospace;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 999px;
    transition: all 0.2s;
  }
  .nav-user-link:hover {
    color: #fff;
    background: var(--accent);
    border-color: var(--accent);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  .nav-unread {
    min-width: 18px;
    height: 18px;
    padding: 0 6px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: #fff;
    background: var(--accent2);
    margin-left: 6px;
  }
  .nav-notif-btn {
    position: relative;
    width: 34px;
    height: 34px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: #fff;
    color: var(--muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .nav-notif-btn:hover {
    color: var(--accent);
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .nav-notif-btn .nav-unread {
    position: absolute;
    top: -5px;
    right: -6px;
    margin-left: 0;
    padding: 0 4px;
    min-width: 16px;
    height: 16px;
    font-size: 9px;
  }
  .nav-mobile-toggle {
    display: none;
    background: var(--card);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: 'Geist Mono', monospace;
    border-radius: var(--radius-sm);
    font-size: 13px;
    padding: 7px 12px;
    cursor: pointer;
  }
  .nav-mobile-panel {
    position: absolute;
    left: 16px;
    right: 16px;
    top: calc(100% + 10px);
    background: #ffffffef;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    animation: slideUp 0.2s ease;
  }
  .nav-mobile-group { display: flex; flex-direction: column; gap: 6px; }
  .nav-mobile-panel .nav-tab,
  .nav-mobile-panel .btn {
    width: 100%;
    text-align: left;
    justify-content: flex-start;
  }

  .badge { background: var(--accent); color: #fff; font-size: 12px; padding: 4px 10px; border-radius: 20px; }
  .btn {
    padding: 9px 20px;
    border-radius: var(--radius-sm);
    border: 1px solid transparent;
    cursor: pointer;
    font-family: 'Geist Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent-dark); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
  .btn-ghost { background: #fff; color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover { color: var(--text); border-color: var(--muted); background: var(--card-2); }
  .btn-success { background: var(--blue); color: #fff; }
  .btn-sm { padding: 6px 14px; font-size: 13px; }

  .main {
    flex: 1;
    padding: 26px 18px;
    max-width: 1380px;
    margin: 0 auto;
    width: 100%;
    animation: riseIn 0.35s ease;
  }
  @keyframes riseIn {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .shell-panel {
    margin-bottom: 24px;
  }

  .hero {
    position: relative;
    overflow: hidden;
    text-align: center;
    padding: 86px 20px 64px;
    background: linear-gradient(180deg, #f0f4ff 0%, var(--bg) 100%);
  }
  .hero-content {
    position: relative;
    z-index: 2;
  }
  .money-rain {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    mask-image: linear-gradient(180deg, #000000f0 0%, #000000cc 65%, transparent 100%);
  }
  .money-drop {
    position: absolute;
    top: -50px;
    color: #2563eb;
    transform: translate3d(0, -60px, 0) rotate(0deg);
    animation-name: moneyFall;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    will-change: transform;
    filter: drop-shadow(0 2px 6px #1d4ed833);
  }
  @keyframes moneyFall {
    0% { transform: translate3d(0, -60px, 0) rotate(0deg); }
    50% { transform: translate3d(calc(var(--drop-drift) * 0.6), 52vh, 0) rotate(calc(var(--drop-spin) * 0.65)); }
    100% { transform: translate3d(var(--drop-drift), 108vh, 0) rotate(var(--drop-spin)); }
  }
  .hero-tag { display: inline-block; border: 1px solid var(--accent); color: var(--accent); font-size: 11px; padding: 4px 12px; border-radius: 4px; margin-bottom: 24px; letter-spacing: 1.8px; text-transform: uppercase; font-weight: 600; background: var(--accent-soft); }
  .hero h1 { font-family: 'Geist Mono', monospace; font-size: clamp(36px, 6vw, 48px); font-weight: 700; line-height: 1.1; margin-bottom: 20px; letter-spacing: -1px; }
  .hero h1 .highlight { color: var(--accent); }
  .hero p { color: var(--muted); font-size: 16px; max-width: 520px; margin: 0 auto 36px; line-height: 1.7; }
  .hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .hero-stats { display: flex; gap: 40px; justify-content: center; margin-top: 60px; padding-top: 34px; border-top: 1px solid var(--border); flex-wrap: wrap; }
  .stat-item { text-align: center; }
  .stat-num { font-family: 'Geist Mono', monospace; font-size: 28px; font-weight: 700; color: var(--accent); }
  .stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; letter-spacing: 1px; text-transform: uppercase; }

  .section-title { font-family: 'Geist Mono', monospace; font-size: 22px; font-weight: 700; margin-bottom: 24px; letter-spacing: -0.3px; }
  .section-title span { color: var(--accent); }

  .how-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 48px; }
  .how-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; position: relative; overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .how-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-sm); }
  .how-card::before { content: attr(data-num); position: absolute; top: -10px; right: 12px; font-family: 'Geist Mono', monospace; font-size: 80px; font-weight: 700; color: var(--accent); opacity: 0.06; line-height: 1; }
  .how-card h3 { font-family: 'Geist Mono', monospace; font-size: 15px; font-weight: 600; margin-bottom: 8px; }
  .how-card p { color: var(--muted); font-size: 13px; line-height: 1.7; }
  .how-icon { font-size: 24px; margin-bottom: 12px; }

  .filters { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; }
  .filter-pill { padding: 6px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: transparent; color: var(--muted); font-family: 'Geist Mono', monospace; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .filter-pill.active, .filter-pill:hover { border-color: var(--accent); color: var(--accent); }
  .filter-spacer { flex: 1; }
  .market-controls-line {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: nowrap;
    overflow: visible;
    white-space: nowrap;
  }
  .market-search-long {
    flex: 1;
    min-width: 280px;
    width: auto;
  }
  .search-box { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 9px 16px; color: var(--text); font-family: 'Geist Mono', monospace; font-size: 14px; width: 220px; outline: none; }
  .search-box:focus { border-color: var(--accent); }
  .search-box::placeholder { color: var(--muted); }

  .market-toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 12px;
  }
  .market-view-toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }
  .market-view-toggle-inline {
    margin-left: 0;
  }
  .market-toolbar-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--muted);
  }
  .app-dropdown {
    position: relative;
  }
  .app-dropdown-trigger {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    cursor: pointer;
  }
  .app-dropdown-caret { transition: transform 0.2s ease; }
  .app-dropdown-caret.open { transform: rotate(180deg); }
  .app-dropdown-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 120;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    animation: slideUp 0.15s ease;
  }
  .sort-dropdown {
    min-width: 230px;
  }
  .filter-dropdown {
    min-width: 190px;
  }
  .sort-trigger {
    background: #fff;
    border: 1px solid #2563eb45;
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    color: var(--accent);
    font-family: 'Geist Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    cursor: pointer;
  }
  .sort-trigger:hover,
  .sort-trigger:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px #2563eb12;
    outline: none;
  }
  .sort-menu {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-lg);
  }
  .sort-option {
    border: 1px solid transparent;
    background: transparent;
    color: var(--muted);
    font-family: 'Geist Mono', monospace;
    font-size: 13px;
    text-align: left;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
  }
  .sort-option:hover {
    color: var(--accent);
    background: var(--accent-soft);
  }
  .sort-option.active {
    color: var(--accent);
    border-color: #2563eb42;
    background: #2563eb1a;
  }
  .toggle-chip {
    border: 1px solid var(--border);
    background: #fff;
    color: var(--muted);
    border-radius: var(--radius-sm);
    padding: 7px 12px;
    font-family: 'Geist Mono', monospace;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .toggle-chip.active { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }

  .listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
  .listing-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
  .listing-card { animation: cardIn 0.32s ease both; }
  .listing-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .listing-card.has-my-bid,
  .mturk-row.has-my-bid {
    box-shadow: inset 0 0 0 1px #4f6f5d2e;
  }
  .listing-card.has-my-bid::before,
  .mturk-row.has-my-bid::before {
    content: '';
    position: absolute;
    top: 8px;
    right: 8px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #4f6f5d;
    opacity: 0.55;
  }
  @keyframes cardIn {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .listing-card.urgent { border-color: var(--accent2); }
  .listing-card.urgent::after { content: 'URGENT'; position: absolute; top: 12px; right: -20px; background: var(--accent2); color: #fff; font-size: 9px; letter-spacing: 1.5px; padding: 3px 28px; transform: rotate(45deg); }
  .listing-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .listing-category { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--accent); border: 1px solid var(--accent); padding: 2px 8px; border-radius: 4px; }
  .listing-bids { font-size: 12px; color: var(--muted); }
  .listing-bids strong { color: var(--text); }
  .listing-title { font-family: 'Geist Mono', monospace; font-size: 16px; font-weight: 600; margin-bottom: 6px; }
  .listing-desc { color: var(--muted); font-size: 12px; line-height: 1.45; margin-bottom: 10px; }
  .listing-signals { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
  .signal-pill {
    background: #2563eb17;
    color: var(--accent);
    border: 1px solid #2563eb2c;
    border-radius: 999px;
    padding: 2px 8px;
    font-size: 10px;
    letter-spacing: 0.6px;
    text-transform: uppercase;
  }
  .signal-pill.success {
    background: #2563eb17;
    color: var(--blue);
    border-color: #2563eb33;
  }
  .signal-pill.danger {
    background: #b4231814;
    color: var(--accent2);
    border-color: #b4231833;
  }
  .listing-footer { display: flex; justify-content: space-between; align-items: center; }
  .budget-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
  .budget-amount { font-family: 'Geist Mono', monospace; font-size: 20px; font-weight: 700; color: var(--accent); }
  .budget-amount span { font-size: 13px; font-weight: 400; color: var(--muted); }
  .timer { font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 4px; }
  .timer.low { color: var(--accent2); }
  .timer-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: pulse 1s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .market-list-wrap {
    width: 100%;
    overflow-x: auto;
  }
  .market-list-table {
    min-width: 980px;
  }
  .market-list-row {
    cursor: pointer;
  }
  .market-list-title {
    font-family: 'Geist Mono', monospace;
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .market-list-subtitle {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.45;
  }

  .mturk-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
  }
  .market-list-section {
    margin-bottom: 20px;
  }
  .mturk-row {
    display: grid;
    grid-template-columns: 1fr 170px;
    gap: 10px;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 0;
    border-top: none;
    padding: 10px 12px;
    min-height: 112px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }
  .mturk-row:first-child {
    border-top: 1px solid var(--border);
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  .mturk-row:last-child {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
  .mturk-row:hover {
    transform: translateY(-1px);
    border-color: var(--accent);
    box-shadow: var(--shadow-sm);
  }
  .mturk-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .mturk-category {
    color: var(--accent);
    font-size: 11px;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .mturk-title {
    font-family: 'Geist Mono', monospace;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.25;
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mturk-desc {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.3;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mturk-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    color: var(--text);
    font-size: 11px;
    margin-top: auto;
  }
  .mturk-metrics span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px dashed var(--border);
    border-radius: 999px;
    padding: 3px 9px;
    background: #ffffffb5;
  }
  .mturk-side {
    border-left: 1px solid var(--border);
    padding-left: 12px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 7px;
  }
  .mturk-budget-label {
    font-size: 10px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .mturk-budget {
    font-family: 'Geist Mono', monospace;
    font-size: 20px;
    font-weight: 700;
    color: var(--accent);
    line-height: 1;
  }
  .modal-overlay { position: fixed; inset: 0; background: #000a; backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
  .modal { background: #fff; border: 1px solid var(--border); border-radius: var(--radius); max-width: 580px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 32px; animation: slideUp 0.25s ease; box-shadow: var(--shadow-lg); }

  @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .modal-title { font-family: 'Geist Mono', monospace; font-size: 20px; font-weight: 700; }
  .modal-close { background: none; border: none; color: var(--muted); font-size: 20px; cursor: pointer; }

  .bid-list { display: flex; flex-direction: column; gap: 10px; margin: 20px 0; }
  .bid-item { background: #fff; border: 1px solid var(--border); border-radius: 10px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; }
  .bid-item.winner { border-color: var(--blue); background: #3b82f608; }
  .bid-seller { font-size: 13px; }
  .bid-seller small { color: var(--muted); font-size: 11px; display: block; margin-top: 2px; }
  .bid-amount { font-family: 'Geist Mono', monospace; font-size: 18px; font-weight: 700; }
  .bid-amount.lowest { color: var(--blue); }

  .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
  .info-row:last-child { border: none; }
  .info-label { color: var(--muted); }

  .form-group { margin-bottom: 18px; }
  .form-label { display: block; font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .form-input, .form-textarea { width: 100%; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 16px; color: var(--text); font-family: 'Geist Mono', monospace; font-size: 14px; outline: none; transition: border 0.2s, box-shadow 0.2s; }
  .form-input:focus, .form-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px #2563eb18; }
  .form-textarea { resize: vertical; min-height: 90px; }
  .form-dropdown { width: 100%; }
  .form-dropdown-trigger {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 16px;
    color: var(--text);
    font-family: 'Geist Mono', monospace;
    font-size: 14px;
    outline: none;
    transition: border 0.2s, box-shadow 0.2s;
  }
  .form-dropdown-trigger:hover,
  .form-dropdown-trigger:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px #2563eb18;
    outline: none;
  }
  .form-dropdown-menu {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-lg);
    max-height: 220px;
    overflow-y: auto;
  }
  .form-dropdown-option {
    border: 1px solid transparent;
    background: transparent;
    color: var(--muted);
    font-family: 'Geist Mono', monospace;
    font-size: 13px;
    text-align: left;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
  }
  .form-dropdown-option:hover { color: var(--accent); background: var(--accent-soft); }
  .form-dropdown-option.active {
    color: var(--accent);
    border-color: #2563eb42;
    background: #2563eb1a;
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-hint { font-size: 11px; color: var(--muted); margin-top: 6px; }

  .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 32px; }
  .dash-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }
  .dash-card-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
  .dash-card-value { font-family: 'Geist Mono', monospace; font-size: 28px; font-weight: 700; }
  .dash-card-value.accent { color: var(--accent); }
  .dash-card-value.highlight { color: var(--blue); }
  .dash-card-sub { font-size: 11px; color: var(--muted); margin-top: 6px; }

  .workspace-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }
  .workspace-subtitle { color: var(--muted); font-size: 13px; max-width: 64ch; }
  .workspace-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 1px solid var(--border);
    padding: 8px 12px;
    border-radius: 999px;
    color: var(--accent);
    font-size: 12px;
  }

  .wf-section {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 16px;
  }
  .wf-layout {
    display: grid;
    grid-template-columns: 1.4fr 0.8fr;
    gap: 16px;
  }
  .wf-top-grid {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
  .wf-job-title {
    font-family: 'Geist Mono', monospace;
    font-size: 19px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }
  .wf-role-pill {
    font-size: 10px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--accent);
    border: 1px solid #2563eb42;
    background: #2563eb14;
    border-radius: 999px;
    padding: 4px 10px;
  }
  .wf-rail {
    display: flex;
    align-items: flex-start;
    gap: 0;
    overflow-x: auto;
    padding-bottom: 4px;
  }
  .wf-rail-segment {
    display: flex;
    align-items: center;
    min-width: 0;
    flex: 1;
  }
  .wf-rail-node-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .wf-rail-node {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: #fff;
    color: var(--muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  .wf-rail-node.done {
    color: #fff;
    background: var(--blue);
    border-color: var(--blue);
  }
  .wf-rail-node.active {
    color: var(--accent);
    border-color: var(--accent);
    box-shadow: 0 0 0 3px #2563eb1f;
  }
  .wf-rail-node.dispute {
    color: #fff;
    background: var(--accent2);
    border-color: var(--accent2);
    box-shadow: 0 0 0 3px #b423181f;
  }
  .wf-rail-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--muted);
    white-space: nowrap;
  }
  .wf-rail-label.done {
    color: var(--blue);
  }
  .wf-rail-label.active {
    color: var(--accent);
  }
  .wf-rail-line {
    flex: 1;
    height: 2px;
    margin: 16px 8px 0;
    background: var(--border);
    min-width: 18px;
  }
  .wf-rail-line.done {
    background: var(--blue);
  }
  .wf-card-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
  .wf-card-title {
    font-family: 'Geist Mono', monospace;
    font-size: 16px;
    font-weight: 600;
  }
  .wf-data-grid {
    display: grid;
    gap: 10px;
    margin-bottom: 12px;
  }
  .wf-data-grid.two {
    grid-template-columns: 1fr 1fr;
  }
  .wf-data-grid.three {
    grid-template-columns: 1fr 1fr 1fr;
  }
  .wf-cell {
    border: 1px solid var(--border);
    border-radius: 10px;
    background: #fff;
    padding: 10px 12px;
  }
  .wf-cell-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--muted);
    margin-bottom: 5px;
  }
  .wf-cell-value {
    font-family: 'Geist Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  }
  .wf-note-block {
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    border-radius: 10px;
    padding: 10px 12px;
    background: #ffffffbf;
    margin-bottom: 12px;
    font-size: 12px;
    color: var(--muted);
    line-height: 1.7;
  }
  .wf-note-danger {
    border-left-color: var(--accent2);
    background: #b423180d;
    color: var(--text);
  }
  .wf-note-success {
    border-left-color: var(--blue);
    background: #3b82f612;
    color: var(--text);
  }
  .wf-link-row {
    font-size: 12px;
    color: var(--muted);
    margin-bottom: 12px;
    word-break: break-all;
  }
  .wf-sign-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }
  .wf-sign-card {
    border: 1px solid var(--border);
    border-radius: 10px;
    background: #fff;
    padding: 12px;
    text-align: center;
  }
  .wf-sign-card.signed {
    border-color: var(--blue);
    background: #3b82f610;
  }
  .wf-sign-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--muted);
    margin-bottom: 6px;
  }
  .wf-sign-status {
    margin-top: 6px;
    font-size: 12px;
    color: var(--blue);
  }
  .wf-stream {
    border: 1px solid var(--border);
    border-radius: 10px;
    background: #fff;
    padding: 8px 10px;
    margin-bottom: 10px;
  }
  .wf-stream-item {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    font-size: 12px;
    color: var(--muted);
    padding: 6px 0;
  }
  .wf-action-row {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }



  .insight-grid {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 14px;
    margin-bottom: 24px;
  }
  .insight-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
  }
  .insight-head {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Geist Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  .stacked-meter {
    display: flex;
    width: 100%;
    height: 12px;
    background: #e8f2ee;
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 10px;
  }
  .meter-segment { height: 100%; transition: width 0.35s ease; }
  .meter-segment.open { background: #2563eb; }
  .meter-segment.closed { background: #10b981; }
  .meter-segment.completed { background: #3b82f6; }
  .meter-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    color: var(--muted);
    font-size: 11px;
  }
  .meter-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .dot { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }
  .dot.open { background: #2563eb; }
  .dot.closed { background: #10b981; }
  .dot.completed { background: #3b82f6; }

  .conversion-copy { color: var(--muted); font-size: 12px; line-height: 1.7; margin-bottom: 12px; }
  .conversion-copy strong { color: var(--text); font-family: 'Geist Mono', monospace; font-size: 18px; font-weight: 700; margin-right: 4px; }
  .conversion-track {
    width: 100%;
    height: 10px;
    border-radius: 999px;
    background: #e6f2ed;
    overflow: hidden;
  }
  .conversion-track span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
  }

  .table { width: 100%; border-collapse: collapse; }
  .table th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); padding: 12px 14px; border-bottom: 1px solid var(--border); }
  .table td { padding: 14px; border-bottom: 1px solid var(--border); font-size: 14px; }
  .table tr:last-child td { border: none; }
  .table tr:hover td { background: var(--card); }
  .status-pill { font-size: 10px; padding: 3px 10px; border-radius: 20px; letter-spacing: 1px; text-transform: uppercase; }
  .status-open { background: #2563eb1a; color: var(--accent); }
  .status-closed { background: #2563eb1a; color: var(--blue); }
  .status-pending { background: #dc26261a; color: var(--accent2); }

  .table-cards { display: none; }
  .table-card-row {
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .table-card-title {
    font-family: 'Geist Mono', monospace;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.3;
  }
  .table-card-meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .table-card-kv {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    color: var(--muted);
    font-size: 12px;
    padding-bottom: 6px;
    border-bottom: 1px dashed var(--border);
  }
  .table-card-kv:last-of-type { border-bottom: none; padding-bottom: 0; }
  .table-card-kv strong { color: var(--text); font-size: 12px; }
  .table-card-empty { color: var(--muted); font-size: 13px; }

  .chart-bar-container { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 16px; }
  .chart-title { font-family: 'Geist Mono', monospace; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
  .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
  .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .bar { width: 100%; background: var(--accent); border-radius: 4px 4px 0 0; transition: height 0.5s ease; min-height: 4px; opacity: 0.85; }
  .bar:hover { opacity: 1; }
  .bar-label { font-size: 10px; color: var(--muted); }
  .bar-val { font-size: 10px; color: var(--accent); }
  .analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .sub-tabs { display: flex; gap: 0; margin-bottom: 24px; border-bottom: 1px solid var(--border); }
  .sub-tab { padding: 10px 20px; font-family: 'Geist Mono', monospace; font-size: 14px; font-weight: 500; cursor: pointer; border: none; background: none; color: var(--muted); border-bottom: 2px solid transparent; margin-bottom: -1px; }
  .sub-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

  .auth-shell {
    min-height: calc(100vh - 84px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 80px 24px 40px;
  }
  .auth-card {
    width: 100%;
    max-width: 440px;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 38px;
  }
  .auth-header {
    text-align: center;
    margin-bottom: 28px;
  }
  .auth-header h1 {
    font-family: 'Geist Mono', monospace;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.4px;
    margin-bottom: 6px;
  }
  .auth-header p {
    color: var(--muted);
    font-size: 14px;
  }
  .auth-mode-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    margin-bottom: 24px;
  }
  .auth-mode-toggle button {
    padding: 10px;
    font-family: 'Geist Mono', monospace;
    font-size: 13px;
    font-weight: 600;
    border: none;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s;
  }
  .auth-mode-toggle button.active {
    background: var(--accent);
    color: #fff;
  }

  .settings-panel { max-width: 820px; }
  .settings-section-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Geist Mono', monospace;
    font-size: 17px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .settings-help {
    color: var(--muted);
    font-size: 13px;
    margin-bottom: 16px;
    max-width: 64ch;
  }
  .settings-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .settings-toggle {
    border: 1px solid var(--border);
    background: #fff;
    color: var(--muted);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-family: 'Geist Mono', monospace;
    font-size: 13px;
    font-weight: 500;
  }
  .settings-toggle.active {
    color: var(--accent);
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .settings-stack { display: grid; gap: 10px; }
  .settings-choice {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: #fff;
    text-align: left;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
    color: var(--muted);
    transition: all 0.2s;
  }
  .settings-choice.active {
    border-color: var(--accent);
    background: var(--accent-soft);
    color: var(--text);
    box-shadow: var(--shadow-sm);
  }
  .settings-choice-title { font-family: 'Geist Mono', monospace; font-size: 15px; font-weight: 600; color: var(--text); }
  .settings-choice-desc { font-size: 12px; line-height: 1.5; }
  .profile-grid {
    display: grid;
    grid-template-columns: minmax(260px, 330px) 1fr;
    gap: 16px;
    align-items: start;
  }
  .profile-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }
  .profile-avatar {
    width: 58px;
    height: 58px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-family: 'Geist Mono', monospace;
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(145deg, var(--accent) 0%, #60a5fa 100%);
    margin-bottom: 12px;
  }
  .profile-name { font-family: 'Geist Mono', monospace; font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .profile-email { color: var(--muted); font-size: 13px; margin-bottom: 12px; }
  .profile-role-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
  .profile-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .profile-stat {
    border: 1px solid var(--border);
    background: var(--card-2);
    border-radius: var(--radius-sm);
    padding: 10px;
  }
  .profile-stat-label { color: var(--muted); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
  .profile-stat-value { font-family: 'Geist Mono', monospace; font-size: 20px; font-weight: 700; color: var(--accent); }
  .profile-settings-stack { display: grid; gap: 16px; }
  .prof-page {
    display: flex;
    justify-content: center;
    padding-top: 48px;
  }
  .prof-grid {
    display: flex;
    flex-direction: column;
    gap: 32px;
    width: 100%;
    max-width: 420px;
  }
  .prof-identity {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
    padding-bottom: 32px;
    border-bottom: 1px solid var(--border);
  }
  .prof-identity .profile-avatar {
    width: 80px;
    height: 80px;
    font-size: 28px;
    margin-bottom: 4px;
  }
  .prof-identity .prof-name {
    font-size: 24px;
  }
  .prof-meta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
    color: var(--muted);
    font-size: 13px;
  }
  .prof-meta span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .prof-since {
    font-size: 12px;
    color: var(--muted);
  }
  .prof-prefs {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding-bottom: 32px;
    border-bottom: 1px solid var(--border);
  }
  .prof-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 0;
  }
  .prof-toggle-row + .prof-toggle-row {
    border-top: 1px solid var(--border);
  }
  .prof-toggle-label {
    min-width: 0;
  }
  .prof-toggle-name {
    font-family: 'Geist Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 2px;
  }
  .prof-toggle-desc {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.4;
  }
  .pref-switch {
    width: 44px;
    height: 24px;
    border-radius: 999px;
    background: var(--border);
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: background 0.2s;
  }
  .pref-switch.on {
    background: var(--accent);
  }
  .pref-switch-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: #fff;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  }
  .pref-switch.on .pref-switch-thumb {
    transform: translateX(20px);
  }
  .prof-grid > .prof-logout-btn {
    align-self: center;
  }
  .prof-layout {
    display: grid;
    grid-template-columns: 250px minmax(0, 1fr);
    gap: 16px;
    align-items: start;
  }
  .prof-layout.prof-layout-solo {
    grid-template-columns: 250px;
  }
  .prof-layout.prof-layout-stretch {
    display: block;
  }
  .prof-layout.prof-layout-stretch .prof-sidebar {
    width: 100%;
    min-height: calc(100vh - 220px);
    padding: 24px;
    gap: 12px;
  }
  .prof-layout.prof-layout-stretch .prof-avatar-block {
    padding: 18px;
    gap: 10px;
    margin-bottom: 8px;
  }
  .prof-layout.prof-layout-stretch .profile-avatar {
    width: 64px;
    height: 64px;
    font-size: 24px;
  }
  .prof-layout.prof-layout-stretch .prof-name {
    font-size: 22px;
  }
  .prof-layout.prof-layout-stretch .prof-email,
  .prof-layout.prof-layout-stretch .prof-role-text {
    font-size: 13px;
  }
  .prof-layout.prof-layout-stretch .prof-nav-btn {
    width: 100%;
    padding: 12px 12px;
    font-size: 13px;
  }
  .prof-layout.prof-layout-stretch .prof-logout-btn {
    width: auto;
    align-self: flex-start;
    padding: 8px 11px;
    font-size: 12px;
  }
  .prof-sidebar {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .prof-avatar-block {
    background: var(--card-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 4px;
  }
  .prof-name {
    font-family: 'Geist Mono', monospace;
    font-size: 17px;
    font-weight: 700;
    line-height: 1.2;
  }
  .prof-email {
    color: var(--muted);
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .prof-role-text {
    font-family: 'Geist Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.6px;
  }
  .prof-nav-btn {
    border: 1px solid transparent;
    background: transparent;
    color: var(--muted);
    border-radius: var(--radius-sm);
    padding: 9px 10px;
    font-family: 'Geist Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    text-align: left;
  }
  .prof-nav-btn:hover {
    background: var(--card);
    color: var(--text);
    border-color: var(--border);
  }
  .prof-nav-btn.active {
    background: var(--accent-soft);
    color: var(--accent);
    border-color: #2563eb33;
  }
  .prof-logout-btn {
    margin-top: auto;
    border: 1px solid #b4231835;
    background: #b423180d;
    color: var(--accent2);
    border-radius: var(--radius-sm);
    padding: 9px 10px;
    font-family: 'Geist Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    text-align: left;
  }
  .prof-content {
    display: grid;
    gap: 12px;
  }
  .prof-panel {
    margin-bottom: 0;
    padding: 14px;
  }
  .prof-stats-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }
  .prof-overview-grid {
    display: grid;
    grid-template-columns: 180px minmax(0, 1fr);
    gap: 10px;
  }
  .prof-mini-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: flex-start;
  }
  .prof-mini-list .badge {
    text-transform: none;
  }
  .prof-link-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }
  .prof-inline-note {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.5;
  }
  .prof-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .prof-form-actions {
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  .btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  .profile-page-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }
  .profile-shell {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: #fff;
    padding: 16px;
    display: grid;
    gap: 12px;
  }
  .profile-topline {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 12px;
    align-items: center;
  }
  .profile-identity {
    min-width: 0;
  }
  .profile-meta-row {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--muted);
    font-size: 12px;
    min-width: 0;
  }
  .profile-meta-row span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .profile-stat-grid.compact {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .profile-stat-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .profile-settings-stack.compact {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .settings-panel.compact {
    max-width: none;
    padding: 12px 14px;
    margin-bottom: 0;
  }
  .settings-grid-compact {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .settings-compact-group {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px;
    background: var(--card-2);
  }
  .settings-compact-label {
    font-size: 11px;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 8px;
  }

  .notif-list { display: flex; flex-direction: column; gap: 10px; }
  .notif-item {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  .notif-main {
    flex: 1;
    min-width: 0;
  }
  .notif-action {
    margin-left: auto;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
  }
  .notif-item.unread {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .notif-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    margin-top: 6px;
    background: var(--accent);
    flex: 0 0 10px;
  }
  .notif-dot.lost { background: var(--accent2); }
  .notif-dot.escrow { background: var(--blue); }
  .notif-title { font-family: 'Geist Mono', monospace; font-size: 15px; font-weight: 600; margin-bottom: 4px; }
  .notif-detail { color: var(--muted); font-size: 12px; line-height: 1.5; }
  .notif-time { color: var(--muted); font-size: 11px; margin-top: 6px; }



  .empty { text-align: center; padding: 60px 20px; color: var(--muted); }
  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; display: flex; justify-content: center; align-items: center; }
  .empty h3 { font-family: 'Geist Mono', monospace; font-size: 17px; font-weight: 600; color: var(--text); margin-bottom: 8px; }

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

  @media (max-width: 980px) {
    .auth-card { padding: 28px; }
    .profile-grid { grid-template-columns: 1fr; }
    .prof-layout { grid-template-columns: 1fr; }
  }

  @media (max-width: 860px) {
    .nav-tabs,
    .nav-right { display: none; }
    .nav-mobile-toggle { display: inline-flex; }
    .nav { padding: 14px 16px; }
  }

  @media (max-width: 760px) {
    .main { padding: 24px 14px; }
    .listings-grid { grid-template-columns: 1fr; }
    .dashboard-grid { grid-template-columns: 1fr 1fr; }
    .insight-grid { grid-template-columns: 1fr; }
    .sort-dropdown { min-width: 180px; }
  }

  @media (max-width: 600px) {
    .analytics-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .dashboard-grid { grid-template-columns: 1fr; }
    .hero { padding-top: 58px; }
    .modal { padding: 22px; }
    .auth-shell { padding: 22px 14px; }
    .auth-card { padding: 24px; }
    .market-toolbar { align-items: stretch; }
    .market-view-toggle {
      margin-left: 0;
      width: 100%;
      justify-content: flex-start;
    }
    .market-view-toggle-inline {
      width: auto;
    }
    .market-controls-line {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      overflow: visible;
      white-space: normal;
      padding-bottom: 0;
    }
    .market-search-long,
    .sort-dropdown,
    .filter-dropdown {
      width: 100%;
      min-width: 0;
    }
    .sort-trigger {
      width: 100%;
      justify-content: space-between;
    }
    .table { display: none; }
    .table-cards { display: block; }
    .workspace-subtitle { font-size: 12px; }
    .settings-toggle { width: 100%; justify-content: center; }
    .prof-sidebar {
      gap: 6px;
      padding: 10px;
    }
    .prof-stats-row {
      grid-template-columns: 1fr;
    }
    .prof-overview-grid {
      grid-template-columns: 1fr;
    }
    .prof-link-grid {
      grid-template-columns: 1fr;
    }
    .prof-form-grid {
      grid-template-columns: 1fr;
    }
    .profile-page-head {
      flex-direction: column;
      align-items: stretch;
    }
    .profile-page-head .btn {
      width: 100%;
    }
    .profile-topline {
      grid-template-columns: auto 1fr;
    }
    .profile-role-row {
      grid-column: 1 / -1;
      margin-bottom: 0;
    }
    .profile-stat-grid.compact {
      grid-template-columns: 1fr;
    }
    .settings-grid-compact {
      grid-template-columns: 1fr;
    }
    .wf-layout {
      grid-template-columns: 1fr;
    }
    .wf-rail {
      gap: 6px;
      padding-bottom: 8px;
    }
    .wf-rail-segment {
      flex: 0 0 92px;
      min-width: 92px;
    }
    .wf-rail-line {
      min-width: 14px;
      margin: 14px 6px 0;
    }
    .wf-rail-label {
      white-space: normal;
      text-align: center;
      line-height: 1.2;
      letter-spacing: 0.5px;
      font-size: 9px;
      max-width: 82px;
    }
    .wf-data-grid.three {
      grid-template-columns: 1fr 1fr;
    }
    .money-rain {
      opacity: 0.75;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .money-drop {
      animation: none;
      display: none;
    }
  }

  @media (max-width: 760px) {
    .mturk-row {
      grid-template-columns: 1fr;
      gap: 8px;
      padding: 10px;
      min-height: 0;
    }
    .mturk-side {
      border-left: none;
      border-top: 1px solid var(--border);
      padding-left: 0;
      padding-top: 12px;
      gap: 6px;
    }
    .mturk-budget {
      font-size: 21px;
    }
    .wf-data-grid.two,
    .wf-data-grid.three,
    .wf-sign-grid {
      grid-template-columns: 1fr;
    }
  }
`;

function NavbarComponent() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const unreadCount = useNotificationsStore((state) => state.unreadCount)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = isAuthenticated
    ? [
        { label: 'Marketplace', path: '/marketplace' },
        { label: 'My Space', path: '/dashboard' },
      ]
    : []

  const goTo = (path) => {
    navigate(path)
    setMobileOpen(false)
  }
  
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => goTo('/')}>Bid<span>Down</span></div>
      <div className="nav-tabs">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`nav-tab ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
            onClick={() => goTo(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="nav-right">
        {isAuthenticated ? (
          <>
            <button type="button" className="nav-notif-btn" onClick={() => goTo('/notifications')} aria-label="Notifications">
              <Bell size={16} />
              {unreadCount > 0 && <span className="nav-unread">{Math.min(unreadCount, 99)}</span>}
            </button>
            <button type="button" className="nav-user-link" onClick={() => goTo('/profile')}>
              {user?.name}
            </button>
          </>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => goTo('/login')}>Get Started</button>
        )}
      </div>
      <button type="button" className="nav-mobile-toggle" onClick={() => setMobileOpen((prev) => !prev)}>
        {mobileOpen ? 'Close' : 'Menu'}
      </button>
      {mobileOpen && (
        <div className="nav-mobile-panel">
          {isAuthenticated && (
            <div className="nav-mobile-group">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className={`nav-tab ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                  onClick={() => goTo(item.path)}
                >
                  {item.label}
                </button>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => goTo('/notifications')}>
                Notifications {unreadCount > 0 ? `(${Math.min(unreadCount, 99)})` : ''}
              </button>
              <button type="button" className="nav-user-link" onClick={() => goTo('/profile')}>
                {user?.name}
              </button>
            </div>
          )}
        </div>
      )}
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
      <Route path="/rating" element={isAuthenticated ? <RatingPage /> : <Navigate to="/login" />} />
      <Route path="/rate-buyer" element={<Navigate to="/rating" replace />} />
      <Route path="/notifications" element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" />} />
      <Route path="/profile" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />} />
      <Route path="/settings" element={<Navigate to="/profile" replace />} />
      <Route path="/analytics" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  const { isAuthenticated, user } = useAuthStore()
  const theme = usePreferencesStore((state) => state.theme)
  const refreshNotifications = useNotificationsStore((state) => state.refreshNotifications)

  useEffect(() => {
    document.body.removeAttribute('data-theme')
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !user) return
    refreshNotifications(user).catch(() => {})
  }, [isAuthenticated, user, refreshNotifications])

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
