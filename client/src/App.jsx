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
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Source+Sans+3:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #e9edf3;
    --surface: #ffffff;
    --card: #ffffff;
    --card-2: #f5f6f8;
    --border: #d2d9e2;
    --border2: #b8c3d2;
    --accent: #dca53a;
    --accent-dark: #c8932f;
    --accent-soft: #dca53a1a;
    --accent2: #c0392b;
    --text: #1a2533;
    --muted: #556577;
    --green: #1ea85a;
    --blue: #2563eb;
    --nav-bg: #0b345f;
    --radius: 8px;
    --radius-sm: 6px;
    --shadow-sm: 0 1px 2px #0000000a;
    --shadow-lg: 0 4px 12px #00000012;
    --font: 'Source Sans 3', sans-serif;
    --font-mono: 'Source Sans 3', sans-serif;
    --font-head: 'Playfair Display', serif;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    font-size: 15px;
    line-height: 1.5;
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
    display: flex; align-items: center;
    padding: 0 22px;
    height: 56px;
    background: var(--nav-bg);
    border-bottom: 1px solid #0d457f;
    position: sticky;
    top: 0;
    z-index: 110;
    gap: 0;
  }
  .nav-logo {
    font-family: var(--font-head);
    font-weight: 800;
    font-size: 34px;
    color: var(--accent);
    cursor: pointer;
    letter-spacing: -0.8px;
    padding-right: 24px;
    border-right: 1px solid #154979;
    margin-right: 18px;
    line-height: 1;
  }
  .nav-logo span { color: var(--accent); }
  .nav-tabs { display: flex; gap: 0; height: 100%; flex: 1; }
  .nav-tab {
    padding: 0 12px;
    height: 56px;
    border-radius: 0;
    border: none;
    border-right: 1px solid #154979;
    background: transparent;
    color: #d9e6f5;
    font-family: var(--font);
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0;
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
    display: inline-flex;
    align-items: center;
  }
  .nav-tab:hover { color: #fff; background: #0f4172; }
  .nav-tab.active { color: #fff; background: #0f4172; }
  .nav-right { display: flex; gap: 10px; align-items: center; margin-left: auto; }
  .nav-user-link {
    border: none;
    background: transparent;
    color: #d9e6f5;
    font-family: var(--font);
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    transition: color 0.15s;
  }
  .nav-user-link:hover { color: #fff; }
  .nav-unread {
    min-width: 16px;
    height: 16px;
    padding: 0 5px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: #fff;
    background: #d9534f;
    margin-left: 4px;
  }
  .nav-notif-btn {
    position: relative;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    border: none;
    background: #0f4172;
    color: #d9e6f5;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .nav-notif-btn:hover { color: #fff; background: #165489; }
  .nav-notif-btn .nav-unread {
    position: absolute;
    top: -3px;
    right: -4px;
    margin-left: 0;
    padding: 0 4px;
    min-width: 14px;
    height: 14px;
    font-size: 9px;
  }
  .nav-mobile-toggle {
    display: none;
    background: #0f4172;
    border: 1px solid #2a6192;
    color: #fff;
    font-family: var(--font);
    border-radius: var(--radius-sm);
    font-size: 13px;
    padding: 7px 12px;
    cursor: pointer;
  }
  .nav-mobile-panel {
    position: absolute;
    left: 16px;
    right: 16px;
    top: calc(100% + 8px);
    background: #114876;
    border: 1px solid #1d5e93;
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .nav-mobile-group { display: flex; flex-direction: column; gap: 6px; }
  .nav-mobile-panel .nav-tab,
  .nav-mobile-panel .btn {
    width: 100%;
    text-align: left;
    justify-content: flex-start;
    border-right: none;
    height: auto;
    padding: 8px 12px;
  }

  .badge { background: var(--accent); color: #fff; font-size: 10px; padding: 3px 8px; border-radius: var(--radius-sm); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .btn {
    padding: 8px 18px;
    border-radius: var(--radius-sm);
    border: 1px solid transparent;
    cursor: pointer;
    font-family: var(--font);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: background 0.15s, border-color 0.15s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent-dark); }
  .btn-ghost { background: var(--card); color: var(--text); border: 1px solid var(--border); }
  .btn-ghost:hover { border-color: var(--border2); }
  .btn-success { background: var(--green); color: #fff; }
  .btn-sm { padding: 5px 12px; font-size: 10px; }

  .main {
    flex: 1;
    padding: 20px 24px;
    max-width: 1280px;
    margin: 0 auto;
    width: 100%;
  }

  .shell-panel {
    margin-bottom: 20px;
  }

  .hero { display: none; }
  .hero-content, .money-rain, .money-drop, .hero-stats { display: none; }

  .landing-page {
    width: 100%;
    background: #dce2ea;
  }
  .landing-wrap {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 20px;
  }
  .landing-hero {
    background: linear-gradient(180deg, #0f4b82 0%, #0d3f72 100%);
    color: #f3f8ff;
    padding: 32px 0 24px;
    border-bottom: 1px solid #0d3d6b;
  }
  .landing-eyebrow {
    color: #95b9df;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 12px;
    margin-bottom: 12px;
    font-weight: 700;
  }
  .landing-title {
    font-family: var(--font-head);
    font-size: 38px;
    line-height: 1.12;
    max-width: 740px;
    margin-bottom: 10px;
  }
  .landing-subtitle {
    max-width: 720px;
    color: #c8ddf2;
    margin-bottom: 16px;
    font-size: 16px;
  }
  .landing-search {
    display: flex;
    align-items: stretch;
    max-width: 700px;
    border-radius: 7px;
    overflow: hidden;
    border: 1px solid #8ca9c8;
    background: #fff;
  }
  .landing-city-select {
    flex: 1;
    border: none;
    padding: 10px 14px;
    font-size: 18px;
    color: #22313f;
    background: #fff;
  }
  .landing-city-select:focus {
    outline: none;
  }
  .landing-find-btn {
    border: none;
    border-left: 1px solid #c6d2df;
    background: #f5f8fb;
    color: #11263a;
    font-size: 20px;
    font-weight: 700;
    padding: 0 18px;
    cursor: pointer;
    font-family: var(--font-head);
  }
  .landing-find-btn:hover {
    background: #ecf2f8;
  }
  .landing-stat-row {
    margin-top: 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 22px;
  }
  .landing-stat {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }
  .landing-stat strong {
    font-size: 26px;
    font-weight: 800;
    color: #ffffff;
  }
  .landing-stat span {
    color: #a9c7e7;
    font-size: 12px;
  }
  .landing-section {
    padding: 22px 0;
  }
  .landing-section.alt {
    background: #0c0f13;
    color: #f3f3f3;
  }
  .landing-section-title {
    font-family: var(--font-head);
    font-size: 34px;
    color: #1f2c39;
    margin-bottom: 16px;
  }
  .landing-section.alt .landing-section-title {
    color: #f8f8f8;
  }
  .landing-how-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  .landing-how-card {
    background: #f3f6fa;
    border: 1px solid #c7d3e0;
    border-radius: 10px;
    padding: 18px;
  }
  .landing-how-num {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    background: #0f4b82;
    color: #fff;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
  }
  .landing-how-head {
    font-size: 23px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #1a2a38;
    font-family: var(--font-head);
    line-height: 1.1;
  }
  .landing-how-card p {
    color: #4f6174;
    font-size: 15px;
    line-height: 1.35;
  }
  .landing-head-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 14px;
  }
  .landing-link {
    background: none;
    border: none;
    color: #73a7dd;
    font-size: 14px;
    cursor: pointer;
    font-weight: 700;
  }
  .landing-request-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  .landing-request-card {
    background: #f8fafc;
    border: 1px solid #d0dbe8;
    border-radius: 10px;
    overflow: hidden;
    color: #1d2c3a;
    cursor: pointer;
  }
  .landing-request-top {
    background: #edf2f8;
    padding: 8px 12px;
    border-bottom: 1px solid #d5e0ec;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .landing-request-top strong {
    color: #0f4b82;
    letter-spacing: 1px;
    font-size: 13px;
  }
  .landing-status {
    font-size: 13px;
    font-weight: 700;
    color: #548f24;
  }
  .landing-status.soon {
    color: #cd7a24;
  }
  .landing-request-body {
    padding: 12px;
  }
  .landing-request-title {
    font-size: 24px;
    line-height: 1.06;
    margin-bottom: 8px;
    font-family: var(--font-head);
  }
  .landing-location {
    font-size: 14px;
    color: #5a6f84;
    margin-bottom: 8px;
  }
  .landing-desc {
    font-size: 14px;
    color: #3f5468;
    line-height: 1.32;
    margin-bottom: 10px;
    min-height: 54px;
  }
  .landing-kpis {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    border-top: 1px solid #d8e2ee;
    padding-top: 10px;
    margin-bottom: 10px;
  }
  .landing-kpi-label {
    display: block;
    font-size: 12px;
    color: #7f93a7;
    text-transform: uppercase;
    margin-bottom: 2px;
    letter-spacing: 0.8px;
  }
  .landing-kpi-value {
    font-size: 18px;
    color: #154c82;
    font-weight: 700;
  }
  .landing-card-footer {
    border-top: 1px solid #d8e2ee;
    padding-top: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .landing-provider {
    color: #4b5f73;
    font-size: 14px;
  }
  .landing-provider strong {
    color: #17293b;
  }
  .landing-rate {
    color: #d18b2c;
    font-size: 13px;
  }
  .landing-bid-btn {
    border: 1px solid #b6c5d4;
    background: #f1f5f9;
    border-radius: 7px;
    color: #1e3043;
    padding: 7px 12px;
    font-weight: 700;
    cursor: pointer;
    font-size: 13px;
  }
  .landing-bid-btn:hover {
    background: #e5edf5;
  }
  .landing-category-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px;
  }
  .landing-category-card {
    border: 1px solid #ced8e5;
    border-radius: 10px;
    background: #f8fafc;
    text-align: center;
    padding: 14px 10px;
    cursor: pointer;
  }
  .landing-category-icon {
    width: 40px;
    height: 40px;
    border-radius: 999px;
    background: #e3ecf5;
    color: #1f466d;
    margin: 0 auto 8px;
    font-size: 13px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .landing-category-name {
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 2px;
    color: #243546;
    line-height: 1.15;
  }
  .landing-category-open {
    color: #6d8093;
    font-size: 13px;
  }
  .landing-why-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  .landing-why-card {
    border: 1px solid #cbd7e3;
    border-radius: 10px;
    background: #f5f8fc;
    padding: 16px;
  }
  .landing-why-icon {
    font-size: 27px;
    margin-bottom: 8px;
  }
  .landing-why-head {
    font-family: var(--font-head);
    font-size: 25px;
    color: #203245;
    line-height: 1.08;
    margin-bottom: 7px;
  }
  .landing-why-copy {
    color: #4f6175;
    font-size: 15px;
    line-height: 1.32;
  }
  .landing-footer {
    background: #0b345f;
    color: #d2e2f2;
    padding: 30px 0 18px;
    margin-top: 14px;
  }
  .landing-footer-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr 1fr;
    gap: 18px;
  }
  .landing-footer-logo {
    font-family: var(--font-head);
    color: #dca53a;
    font-size: 34px;
    margin-bottom: 8px;
  }
  .landing-footer-copy {
    font-size: 14px;
    color: #b8d0ea;
    line-height: 1.35;
  }
  .landing-footer-col h4 {
    font-size: 15px;
    color: #82add5;
    margin-bottom: 6px;
    letter-spacing: 1px;
  }
  .landing-footer-col button {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    color: #d2e2f2;
    font-size: 14px;
    padding: 3px 0;
    cursor: pointer;
  }
  .landing-footer-bottom {
    margin-top: 18px;
    border-top: 1px solid #1f5686;
    padding-top: 10px;
    color: #8eb1d4;
    font-size: 12px;
  }

  .section-title { font-family: var(--font-head); font-size: 18px; font-weight: 800; margin-bottom: 16px; color: var(--text); letter-spacing: -0.3px; }
  .section-title span { color: var(--accent); }

  .filters { display: flex; gap: 4px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
  .filter-pill { padding: 3px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border2); background: transparent; color: var(--muted); font-family: var(--font); font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: border-color 0.15s, color 0.15s; }
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
  .search-box { background: var(--card); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 8px 14px; color: var(--text); font-family: var(--font); font-size: 12px; width: 220px; outline: none; }
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
    background: var(--card);
    border: 1px solid var(--border2);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    color: var(--muted);
    font-family: var(--font);
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    cursor: pointer;
  }
  .sort-trigger:hover,
  .sort-trigger:focus {
    border-color: var(--accent);
    outline: none;
  }
  .sort-menu {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-lg);
  }
  .sort-option {
    border: none;
    background: transparent;
    color: var(--muted);
    font-family: var(--font);
    font-size: 11px;
    text-align: left;
    padding: 7px 10px;
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .sort-option:hover {
    color: var(--accent);
    background: var(--accent-soft);
  }
  .sort-option.active {
    color: var(--accent);
    background: var(--accent-soft);
    font-weight: 600;
  }
  .toggle-chip {
    border: 1px solid var(--border2);
    background: var(--card);
    color: var(--muted);
    border-radius: var(--radius-sm);
    padding: 7px 12px;
    font-family: var(--font);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .toggle-chip.active { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }

  .listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 3px; }
  .listing-card { background: var(--card); border: 1px solid var(--border); border-radius: 0; padding: 0; cursor: pointer; transition: border-color 0.15s; position: relative; overflow: hidden; display: flex; flex-direction: column; }
  .listing-card:hover { border-color: var(--border2); }
  .listing-card.has-my-bid,
  .mturk-row.has-my-bid {
    border-left: 3px solid var(--accent);
  }
  .listing-card.has-my-bid::before,
  .mturk-row.has-my-bid::before {
    display: none;
  }
  .listing-card.urgent { border-left-color: var(--accent2); }
  .listing-card.urgent::after { content: 'URGENT'; position: absolute; top: 8px; right: -22px; background: var(--accent2); color: #fff; font-size: 9px; letter-spacing: 1px; padding: 2px 26px; transform: rotate(45deg); font-weight: 700; }
  .listing-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; padding: 10px 10px 0; }
  .listing-category { font-size: 9px; text-transform: uppercase; color: var(--accent); font-weight: 700; letter-spacing: 1.5px; }
  .listing-bids { font-size: 10px; color: var(--muted); }
  .listing-bids strong { color: var(--text); }
  .listing-title { font-family: var(--font-head); font-size: 13px; font-weight: 700; margin-bottom: 4px; line-height: 1.3; padding: 0 10px; }
  .listing-desc { color: var(--muted); font-size: 11px; line-height: 1.4; margin-bottom: 10px; padding: 0 10px; }
  .listing-signals { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; padding: 0 10px; }
  .signal-pill {
    background: var(--accent-soft);
    color: var(--accent);
    border: none;
    border-radius: var(--radius-sm);
    padding: 2px 6px;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .signal-pill.success {
    background: #1ea85a14;
    color: var(--green);
  }
  .signal-pill.danger {
    background: #c0392b12;
    color: var(--accent2);
  }
  .listing-footer { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--bg); border-top: 1px solid var(--border); margin-top: auto; }
  .budget-label { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; }
  .budget-amount { font-family: var(--font-head); font-size: 18px; font-weight: 800; color: var(--accent); }
  .budget-amount span { font-size: 10px; font-weight: 400; color: var(--muted); }
  .timer { font-size: 10px; color: var(--muted); display: flex; align-items: center; gap: 4px; }
  .timer.low { color: var(--accent2); }
  .timer-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; animation: pulse 1.2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .lot-num { background: var(--bg); border-bottom: 1px solid var(--border); padding: 5px 10px; font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; display: flex; justify-content: space-between; align-items: center; }
  .lot-num strong { color: var(--text); }
  .lot-body { padding: 10px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .lot-bid-section { background: var(--bg); border: 1px solid var(--border); border-radius: 3px; padding: 8px 10px; margin-top: auto; }
  .lot-bid-row { display: flex; justify-content: space-between; align-items: baseline; }
  .lot-bid-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); }
  .lot-bid-amount { font-family: var(--font-head); font-size: 18px; font-weight: 800; color: var(--accent); line-height: 1; }
  .bid-count { font-size: 10px; color: var(--muted); }
  .bid-count strong { color: var(--text); }
  .cap-row { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 4px; border-top: 1px solid var(--border); }
  .cap-label { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
  .cap-val { font-size: 11px; color: var(--muted); }
  .cap-val.under { color: var(--green); }
  .lot-timer { display: flex; align-items: center; gap: 5px; font-size: 10px; color: var(--muted); padding: 5px 10px; border-top: 1px solid var(--border); background: var(--bg); }
  .lot-action { padding: 8px 10px; background: var(--surface); border-top: 1px solid var(--border); display: flex; gap: 6px; }
  .bid-btn { flex: 1; background: var(--accent); color: #fff; border: none; font-family: var(--font); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 8px; cursor: pointer; border-radius: 3px; transition: background 0.15s; }
  .bid-btn:hover { background: var(--accent-dark); }

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
    font-family: var(--font-head);
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 3px;
  }
  .market-list-subtitle {
    color: var(--muted);
    font-size: 11px;
    line-height: 1.45;
  }

  .mturk-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
  }
  .market-list-section {
    margin-bottom: 16px;
  }
  .mturk-row {
    display: grid;
    grid-template-columns: 1fr 160px;
    gap: 10px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 0;
    border-top: none;
    padding: 10px 14px;
    min-height: 96px;
    cursor: pointer;
    transition: background 0.1s;
    position: relative;
  }
  .mturk-row:first-child {
    border-top: 1px solid var(--border);
  }
  .mturk-row:hover {
    background: var(--surface);
  }
  .mturk-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .mturk-category {
    color: var(--accent);
    font-size: 9px;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    font-weight: 700;
  }
  .mturk-title {
    font-family: var(--font-head);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mturk-desc {
    color: var(--muted);
    font-size: 11px;
    line-height: 1.3;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mturk-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    color: var(--muted);
    font-size: 10px;
    margin-top: auto;
  }
  .mturk-metrics span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
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
    font-size: 9px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }
  .mturk-budget {
    font-family: var(--font-head);
    font-size: 18px;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
  }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
  .modal { background: var(--surface); border: 1px solid var(--border2); border-top: 3px solid var(--accent); max-width: 480px; width: 100%; max-height: 85vh; overflow-y: auto; padding: 0; box-shadow: var(--shadow-lg); }
  .modal-body { padding: 18px; }

  @keyframes slideUp { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
  .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid var(--border); }
  .modal-title { font-family: var(--font-head); font-size: 15px; font-weight: 800; letter-spacing: -0.3px; }
  .modal-close { background: none; border: none; color: var(--muted); font-size: 18px; cursor: pointer; }

  .bid-list { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
  .bid-item { background: var(--bg); border: 1px solid var(--border); padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; }
  .bid-item.winner { border-color: var(--green); background: #1ea85a0a; }
  .bid-seller { font-size: 12px; }
  .bid-seller small { color: var(--muted); font-size: 10px; display: block; margin-top: 2px; }
  .bid-amount { font-family: var(--font-head); font-size: 16px; font-weight: 800; }
  .bid-amount.lowest { color: var(--green); }
  .accept-btn { background: var(--green); color: #fff; border: none; font-family: var(--font); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 5px 10px; cursor: pointer; border-radius: 2px; margin-left: 10px; }
  .accept-btn:hover { background: #189e4e; }

  .m-lot-num { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
  .m-desc { font-size: 12px; color: var(--muted); line-height: 1.8; margin-bottom: 16px; }
  .m-bid-box { background: var(--bg); border: 1px solid var(--border2); padding: 14px; margin-bottom: 14px; }
  .m-bid-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
  .m-bid-label { font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: var(--muted); }
  .m-bid-val { font-family: var(--font-head); font-size: 26px; font-weight: 900; color: var(--accent); }
  .m-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px; }
  .m-stat { background: var(--bg); border: 1px solid var(--border); padding: 10px; text-align: center; }
  .m-stat-val { font-family: var(--font-head); font-size: 16px; font-weight: 800; margin-bottom: 3px; }
  .m-stat-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); }
  .sealed-note { font-size: 10px; color: var(--muted); line-height: 1.7; padding: 8px 10px; background: var(--bg); border-left: 2px solid var(--accent); margin-bottom: 14px; }

  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 12px; }
  .info-row:last-child { border: none; }
  .info-label { color: var(--muted); }

  .form-group { margin-bottom: 14px; }
  .form-label { display: block; font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; font-weight: 500; }
  .form-input, .form-textarea { width: 100%; background: var(--bg); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 10px 14px; color: var(--text); font-family: var(--font); font-size: 13px; outline: none; transition: border-color 0.15s; }
  .form-input:focus, .form-textarea:focus { border-color: var(--accent); }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-dropdown { width: 100%; }
  .form-dropdown-trigger {
    background: var(--bg);
    border: 1px solid var(--border2);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    color: var(--text);
    font-family: var(--font);
    font-size: 13px;
    outline: none;
    transition: border-color 0.15s;
  }
  .form-dropdown-trigger:hover,
  .form-dropdown-trigger:focus {
    border-color: var(--accent);
    outline: none;
  }
  .form-dropdown-menu {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-lg);
    max-height: 220px;
    overflow-y: auto;
  }
  .form-dropdown-option {
    border: none;
    background: transparent;
    color: var(--muted);
    font-family: var(--font);
    font-size: 11px;
    text-align: left;
    padding: 7px 10px;
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .form-dropdown-option:hover { color: var(--accent); background: var(--accent-soft); }
  .form-dropdown-option.active {
    color: var(--accent);
    background: var(--accent-soft);
    font-weight: 600;
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-hint { font-size: 10px; color: var(--muted); margin-top: 6px; }

  .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 3px; margin-bottom: 16px; }
  .dash-card { background: var(--card); border: 1px solid var(--border); padding: 14px; }
  .dash-card-label { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; font-weight: 500; }
  .dash-card-value { font-family: var(--font-head); font-size: 20px; font-weight: 800; color: var(--text); }
  .dash-card-sub { font-size: 10px; color: var(--muted); margin-top: 4px; }

  .workspace-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }
  .workspace-subtitle { color: var(--muted); font-size: 12px; max-width: 64ch; }
  .workspace-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--card);
    border: 1px solid var(--border);
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    color: var(--accent);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .wf-section {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 16px;
    margin-bottom: 12px;
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
    font-family: var(--font-head);
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.3px;
  }
  .wf-role-pill {
    font-size: 9px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--accent);
    border: 1px solid var(--accent);
    background: var(--accent-soft);
    border-radius: var(--radius-sm);
    padding: 3px 8px;
    font-weight: 700;
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
    width: 32px;
    height: 32px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .wf-rail-node.done {
    color: #fff;
    background: var(--accent);
    border-color: var(--accent);
  }
  .wf-rail-node.active {
    color: var(--accent);
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-soft);
  }
  .wf-rail-node.dispute {
    color: #fff;
    background: var(--accent2);
    border-color: var(--accent2);
  }
  .wf-rail-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--muted);
    white-space: nowrap;
  }
  .wf-rail-label.done {
    color: var(--accent);
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
    background: var(--accent);
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
    font-size: 15px;
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
    border-radius: 3px;
    background: var(--bg);
    padding: 10px 12px;
  }
  .wf-cell-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--muted);
    margin-bottom: 4px;
  }
  .wf-cell-value {
    font-family: var(--font-head);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.4;
  }
  .wf-note-block {
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    border-radius: var(--radius);
    padding: 10px 12px;
    background: var(--bg);
    margin-bottom: 10px;
    font-size: 11px;
    color: var(--muted);
    line-height: 1.6;
  }
  .wf-note-danger {
    border-left-color: var(--accent2);
    background: #c0392b06;
    color: var(--text);
  }
  .wf-note-success {
    border-left-color: var(--accent);
    background: var(--accent-soft);
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
    border-radius: 3px;
    background: var(--bg);
    padding: 12px;
    text-align: center;
  }
  .wf-sign-card.signed {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .wf-sign-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--muted);
    margin-bottom: 6px;
  }
  .wf-sign-status {
    margin-top: 6px;
    font-size: 12px;
    color: var(--accent);
  }
  .wf-stream {
    border: 1px solid var(--border);
    border-radius: 3px;
    background: var(--bg);
    padding: 8px 10px;
    margin-bottom: 10px;
  }
  .wf-stream-item {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    font-size: 11px;
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
    background: var(--card);
    border: 1px solid var(--border);
    padding: 16px;
  }
  .insight-head {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }
  .stacked-meter {
    display: flex;
    width: 100%;
    height: 10px;
    background: var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    margin-bottom: 8px;
  }
  .meter-segment { height: 100%; transition: width 0.3s ease; }
  .meter-segment.open { background: var(--accent); }
  .meter-segment.closed { background: #059669; }
  .meter-segment.completed { background: var(--blue); }
  .meter-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    color: var(--muted);
    font-size: 10px;
  }
  .meter-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .dot { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }
  .dot.open { background: #2563eb; }
  .dot.closed { background: #10b981; }
  .dot.completed { background: #3b82f6; }

  .conversion-copy { color: var(--muted); font-size: 11px; line-height: 1.6; margin-bottom: 10px; }
  .conversion-copy strong { color: var(--text); font-family: var(--font-head); font-size: 18px; font-weight: 800; margin-right: 4px; }
  .conversion-track {
    width: 100%;
    height: 8px;
    border-radius: var(--radius-sm);
    background: var(--border);
    overflow: hidden;
  }
  .conversion-track span {
    display: block;
    height: 100%;
    background: var(--accent);
  }

  .table { width: 100%; border-collapse: collapse; }
  .table th { text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: var(--muted); padding: 10px 12px; border-bottom: 1px solid var(--border); font-weight: 500; }
  .table td { padding: 10px 12px; border-bottom: 1px solid var(--border); font-size: 12px; }
  .table tr:last-child td { border: none; }
  .table tr:hover td { background: var(--card); }
  .status-pill { font-size: 9px; padding: 2px 8px; border-radius: var(--radius-sm); letter-spacing: 1px; text-transform: uppercase; font-weight: 700; }
  .status-open { background: var(--accent-soft); color: var(--accent); }
  .status-closed { background: #2563eb14; color: var(--blue); }
  .status-pending { background: #c0392b12; color: var(--accent2); }

  .table-cards { display: none; }
  .table-card-row {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .table-card-title {
    font-family: var(--font-head);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.3;
  }
  .table-card-meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .table-card-kv {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    color: var(--muted);
    font-size: 11px;
    padding-bottom: 6px;
    border-bottom: 1px dashed var(--border);
  }
  .table-card-kv:last-of-type { border-bottom: none; padding-bottom: 0; }
  .table-card-kv strong { color: var(--text); font-size: 11px; }
  .table-card-empty { color: var(--muted); font-size: 12px; }

  .chart-bar-container { background: var(--card); border: 1px solid var(--border); padding: 20px; margin-bottom: 12px; }
  .chart-title { font-family: var(--font-head); font-size: 13px; font-weight: 800; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; }
  .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
  .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .bar { width: 100%; background: var(--accent); border-radius: 4px 4px 0 0; transition: height 0.5s ease; min-height: 4px; opacity: 0.85; }
  .bar:hover { opacity: 1; }
  .bar-label { font-size: 10px; color: var(--muted); }
  .bar-val { font-size: 10px; color: var(--accent); }
  .analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .sub-tabs { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
  .sub-tab { padding: 8px 16px; font-family: var(--font); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; cursor: pointer; border: none; background: none; color: var(--muted); border-bottom: 2px solid transparent; margin-bottom: -1px; }
  .sub-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

  .auth-shell {
    min-height: calc(100vh - 52px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 60px 24px 40px;
  }
  .auth-card {
    width: 100%;
    max-width: 400px;
    background: var(--surface);
    border: 1px solid var(--border2);
    border-top: 3px solid var(--accent);
    padding: 32px;
  }
  .auth-header {
    text-align: center;
    margin-bottom: 24px;
  }
  .auth-header h1 {
    font-family: var(--font-head);
    font-size: 22px;
    font-weight: 900;
    margin-bottom: 4px;
  }
  .auth-header p {
    color: var(--muted);
    font-size: 13px;
  }
  .auth-mode-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 1px solid var(--border2);
    border-radius: var(--radius-sm);
    overflow: hidden;
    margin-bottom: 20px;
  }
  .auth-mode-toggle button {
    padding: 8px;
    font-family: var(--font);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    border: none;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .auth-mode-toggle button.active {
    background: var(--accent);
    color: #fff;
  }

  .settings-panel { max-width: 820px; }
  .settings-section-title {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-head);
    font-size: 15px;
    font-weight: 800;
    margin-bottom: 6px;
  }
  .settings-help {
    color: var(--muted);
    font-size: 12px;
    margin-bottom: 12px;
    max-width: 64ch;
    line-height: 1.5;
  }
  .settings-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .settings-toggle {
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--muted);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-family: var(--font);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
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
    background: var(--card);
    text-align: left;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    cursor: pointer;
    color: var(--muted);
    transition: border-color 0.15s;
  }
  .settings-choice.active {
    border-color: var(--accent);
    background: var(--accent-soft);
    color: var(--text);
  }
  .settings-choice-title { font-size: 14px; font-weight: 600; color: var(--text); }
  .settings-choice-desc { font-size: 12px; line-height: 1.4; }
  .profile-grid {
    display: grid;
    grid-template-columns: minmax(260px, 330px) 1fr;
    gap: 16px;
    align-items: start;
  }
  .profile-card {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 20px;
  }
  .profile-avatar {
    width: 50px;
    height: 50px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-family: var(--font-head);
    font-size: 20px;
    font-weight: 900;
    color: #fff;
    background: var(--accent);
    margin-bottom: 10px;
  }
  .profile-name { font-family: var(--font-head); font-size: 20px; font-weight: 900; margin-bottom: 2px; }
  .profile-email { color: var(--muted); font-size: 13px; margin-bottom: 10px; }
  .profile-role-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
  .profile-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .profile-stat {
    border: 1px solid var(--border);
    background: var(--card-2);
    border-radius: var(--radius-sm);
    padding: 10px;
  }
  .profile-stat-label { color: var(--muted); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .profile-stat-value { font-family: var(--font-head); font-size: 18px; font-weight: 800; color: var(--accent); }
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
    background: var(--border2);
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
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
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
    background: var(--card);
    border: 1px solid var(--border);
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
    font-size: 16px;
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
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.3px;
  }
  .prof-nav-btn {
    border: 1px solid transparent;
    background: transparent;
    color: var(--muted);
    border-radius: var(--radius-sm);
    padding: 8px 10px;
    font-family: var(--font);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
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
    border-color: var(--accent-soft);
  }
  .prof-logout-btn {
    margin-top: auto;
    border: 1px solid #c0392b20;
    background: #c0392b06;
    color: var(--accent2);
    border-radius: var(--radius-sm);
    padding: 8px 10px;
    font-family: var(--font);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
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
    background: var(--card);
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

  .notif-list { display: flex; flex-direction: column; gap: 3px; }
  .notif-item {
    background: var(--card);
    border: 1px solid var(--border);
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
  .notif-title { font-family: var(--font-head); font-size: 13px; font-weight: 700; margin-bottom: 3px; }
  .notif-detail { color: var(--muted); font-size: 11px; line-height: 1.5; }
  .notif-time { color: var(--muted); font-size: 10px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }



  .empty { text-align: center; padding: 48px 20px; color: var(--muted); }
  .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.4; display: flex; justify-content: center; align-items: center; }
  .empty h3 { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 6px; }

  .loading-panel {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 12px 14px;
    margin-bottom: 12px;
  }
  .loading-row { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: 13px; }
  .loading-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--accent); animation: pulse 1.1s ease-in-out infinite; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  @media (max-width: 980px) {
    .auth-card { padding: 28px; }
    .profile-grid { grid-template-columns: 1fr; }
    .prof-layout { grid-template-columns: 1fr; }
    .landing-title { font-size: 32px; }
    .landing-subtitle { font-size: 18px; }
    .landing-request-grid { grid-template-columns: 1fr; }
    .landing-category-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .landing-how-grid,
    .landing-why-grid,
    .landing-footer-grid { grid-template-columns: 1fr; }
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
    .landing-wrap { padding: 0 14px; }
    .landing-hero { padding: 24px 0 20px; }
    .landing-eyebrow { font-size: 10px; }
    .landing-title { font-size: 28px; }
    .landing-subtitle { font-size: 16px; }
    .landing-search { max-width: none; }
    .landing-city-select { font-size: 18px; padding: 10px 12px; }
    .landing-find-btn { font-size: 18px; padding: 0 14px; }
    .landing-stat strong { font-size: 22px; }
    .landing-stat span { font-size: 12px; }
    .landing-section-title { font-size: 28px; }
    .landing-how-head { font-size: 21px; }
    .landing-request-title { font-size: 21px; }
    .landing-desc { font-size: 15px; min-height: 0; }
    .landing-kpi-value { font-size: 19px; }
    .landing-category-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .landing-why-head { font-size: 21px; }
    .landing-why-copy { font-size: 16px; }
  }

  @media (max-width: 600px) {
    .analytics-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .dashboard-grid { grid-template-columns: 1fr; }
    .hero { padding-top: 58px; }
    .modal-body { padding: 14px; }
    .auth-shell { padding: 22px 14px; }
    .auth-card { padding: 24px; }
    .market-toolbar { align-items: stretch; }
    .landing-search {
      display: grid;
      grid-template-columns: 1fr;
    }
    .landing-find-btn {
      border-left: none;
      border-top: 1px solid #d6e0ea;
      padding: 8px 10px;
      font-size: 22px;
    }
    .landing-kpis { grid-template-columns: 1fr; }
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
        { label: 'Dashboard', path: '/dashboard' },
      ]
    : []

  const goTo = (path) => {
    navigate(path)
    setMobileOpen(false)
  }
  
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => goTo('/')}>BidDown</div>
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
