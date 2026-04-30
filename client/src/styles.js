const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Source+Sans+3:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #ffffff;
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
    --shadow-sm: 0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03);
    --shadow-lg: 0 6px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.05);
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
    padding: 22px 0;
  }
  .landing-section-title {
    font-family: var(--font-head);
    font-size: 34px;
    color: #1f2c39;
    margin-bottom: 16px;
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
    padding: 20px;
    transition: box-shadow 0.2s, transform 0.15s;
  }
  .landing-how-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
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
    transition: box-shadow 0.2s, transform 0.15s;
  }
  .landing-request-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
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
    padding: 16px 12px;
    cursor: pointer;
    transition: box-shadow 0.2s, transform 0.15s, border-color 0.15s;
  }
  .landing-category-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
    border-color: #b0c4d8;
  }
  .landing-category-icon {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    background: #e3ecf5;
    color: #1f466d;
    margin: 0 auto 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .landing-category-card:hover .landing-category-icon {
    background: #d0e3f5;
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
    padding: 20px;
    transition: box-shadow 0.2s, transform 0.15s;
  }
  .landing-why-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }
  .landing-why-icon {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
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
  .filter-pill { padding: 5px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border2); background: transparent; color: var(--muted); font-family: var(--font); font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.8px; cursor: pointer; transition: border-color 0.15s, color 0.15s; }
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

  .listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
  .listing-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 0; cursor: pointer; transition: border-color 0.15s, box-shadow 0.2s, transform 0.15s; position: relative; overflow: hidden; display: flex; flex-direction: column; box-shadow: var(--shadow-sm); }
  .listing-card:hover { border-color: var(--border2); box-shadow: var(--shadow-lg); transform: translateY(-2px); }
  .listing-card.has-my-bid,
  .mturk-row.has-my-bid {
  }
  .listing-card.has-my-bid::before,
  .mturk-row.has-my-bid::before {
    display: none;
  }
  .listing-card.urgent { }
  .listing-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; padding: 10px 10px 0; }
  .listing-category { font-size: 11px; text-transform: uppercase; color: var(--accent); font-weight: 700; letter-spacing: 1.2px; }
  .listing-bids { font-size: 11px; color: var(--muted); }
  .listing-bids strong { color: var(--text); }
  .listing-title { font-family: var(--font-head); font-size: 14px; font-weight: 700; margin-bottom: 4px; line-height: 1.3; padding: 0 12px; }
  .listing-desc { color: var(--muted); font-size: 12px; line-height: 1.45; margin-bottom: 10px; padding: 0 12px; }
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
  .budget-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
  .budget-amount { font-family: var(--font-head); font-size: 18px; font-weight: 800; color: var(--accent); }
  .budget-amount span { font-size: 10px; font-weight: 400; color: var(--muted); }
  .timer { font-size: 10px; color: var(--muted); display: flex; align-items: center; gap: 4px; }
  .timer.low { color: var(--accent2); }
  .timer-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; animation: pulse 1.2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .lot-num { background: var(--bg); border-bottom: 1px solid var(--border); padding: 5px 10px; font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; display: flex; justify-content: space-between; align-items: center; }
  .lot-num strong { color: var(--text); }
  .lot-body { padding: 10px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .lot-bid-section { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 10px; margin-top: auto; }
  .lot-bid-row { display: flex; justify-content: space-between; align-items: baseline; }
  .lot-bid-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); }
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
    gap: 8px;
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
    border-radius: var(--radius);
    padding: 14px 16px;
    min-height: 96px;
    cursor: pointer;
    transition: background 0.1s, box-shadow 0.2s, transform 0.15s, border-color 0.15s;
    position: relative;
    box-shadow: var(--shadow-sm);
  }
  .mturk-row:hover {
    background: #fafcff;
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
    border-color: var(--border2);
  }
  .mturk-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .mturk-category {
    color: var(--accent);
    font-size: 11px;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
  }
  .mturk-title {
    font-family: var(--font-head);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mturk-desc {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.4;
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
    font-size: 11px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .mturk-budget {
    font-family: var(--font-head);
    font-size: 20px;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
  }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
  .modal { background: var(--surface); border: 1px solid var(--border2); border-top: 3px solid var(--accent); border-radius: var(--radius); max-width: 480px; width: 100%; max-height: 85vh; overflow-y: auto; padding: 0; box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08); }
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
  .form-label { display: block; font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 6px; font-weight: 600; }
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

  .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px; }
  .dash-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow-sm); }
  .dash-card-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px; font-weight: 600; }
  .dash-card-value { font-family: var(--font-head); font-size: 22px; font-weight: 800; color: var(--text); }
  .dash-card-sub { font-size: 11px; color: var(--muted); margin-top: 4px; }

  .dd-shell { max-width: 1180px; }
  .dd-banner {
    margin-bottom: 16px;
    background: linear-gradient(135deg, #0c3f72 0%, #0f4b87 100%);
    border: 1px solid #1c548c;
    border-radius: 10px;
    color: #dce9f7;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
    box-shadow: 0 4px 12px rgba(11,52,95,0.25);
  }
  .dd-banner-copy { font-size: 16px; font-weight: 600; line-height: 1.3; }
  .dd-view-toggle { display: inline-flex; border: 1px solid #2a6192; border-radius: 6px; overflow: hidden; }
  .dd-toggle-btn {
    border: none;
    background: transparent;
    color: #dce9f7;
    font-family: var(--font);
    font-size: 13px;
    padding: 8px 14px;
    cursor: pointer;
  }
  .dd-toggle-btn.active { background: #0a3159; color: #fff; font-weight: 700; }

  .dd-layout { display: grid; grid-template-columns: 230px 1fr; gap: 20px; align-items: start; }
  .dd-nav-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }
  .dd-nav-group { border-bottom: 1px solid var(--border); padding: 10px 0; }
  .dd-nav-group:last-child { border-bottom: none; }
  .dd-nav-head {
    font-size: 11px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 700;
    padding: 0 14px 8px;
  }
  .dd-nav-item {
    width: 100%;
    border: none;
    background: transparent;
    text-align: left;
    padding: 8px 14px;
    font-family: var(--font);
    font-size: 14px;
    font-weight: 400;
    color: var(--text);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .dd-nav-item span {
    min-width: 20px;
    height: 20px;
    border-radius: 999px;
    background: #d9e7c8;
    color: #4c7b1c;
    font-size: 11px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
  }
  .dd-nav-item:hover { background: var(--card-2); }
  .dd-nav-item.active { background: var(--accent-soft); color: var(--accent); font-weight: 700; border-left: 3px solid var(--accent); }

  .dd-main { display: flex; flex-direction: column; gap: 14px; }
  .dd-kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(150px, 1fr)); gap: 12px; }
  .dd-kpi {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 18px;
    box-shadow: var(--shadow-sm);
  }
  .dd-kpi-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: var(--muted); margin-bottom: 10px; font-weight: 700; }
  .dd-kpi-value { font-family: var(--font-head); font-size: 30px; font-weight: 800; line-height: 1.05; color: var(--text); }
  .dd-kpi-value.green { color: #2a6b18; }
  .dd-kpi-value.blue { color: #1a5398; }
  .dd-kpi-sub { font-size: 12px; color: var(--muted); margin-top: 4px; }

  .dd-panel {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }
  .dd-panel-head {
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .dd-panel-head h3 { font-size: 14px; font-weight: 700; margin: 0; color: var(--text); }
  .dd-link { border: none; background: none; color: #1c5b99; font-family: var(--font); font-size: 13px; cursor: pointer; }
  .dd-list { display: flex; flex-direction: column; }
  .dd-empty { padding: 18px; color: var(--muted); font-size: 13px; }

  .dd-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
  }
  .dd-row:last-child { border-bottom: none; }
  .dd-rank {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: #d7e7bc;
    color: #3d6f10;
    font-family: var(--font-head);
    font-size: 18px;
    font-weight: 800;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
  .dd-rank span { font-size: 8px; letter-spacing: 1px; text-transform: uppercase; font-family: var(--font); font-weight: 700; }
  .dd-job { flex: 1; min-width: 0; }
  .dd-job-cat { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #245f9d; font-weight: 800; }
  .dd-job-title { font-size: 14px; font-weight: 700; color: var(--text); line-height: 1.3; margin-top: 2px; }
  .dd-job-meta { font-size: 12px; color: #4e6173; margin-top: 3px; }
  .dd-job-meta strong { color: #c43d39; }
  .dd-amount { flex-shrink: 0; text-align: right; font-family: var(--font-head); font-size: 18px; font-weight: 800; color: #2d5f22; }
  .dd-amount small { display: block; font-family: var(--font); font-size: 12px; color: var(--muted); font-weight: 500; }
  .dd-actions { flex-shrink: 0; display: flex; flex-direction: column; gap: 6px; width: 116px; }
  .dd-btn {
    border: 1px solid #c3cad4;
    background: #fff;
    border-radius: 8px;
    padding: 7px 10px;
    font-family: var(--font);
    font-size: 13px;
    font-weight: 600;
    color: #1d2b3a;
    cursor: pointer;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
  }

  .dd-row.in-progress { }
  .dd-progress { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
  .dd-progress span { height: 6px; border-radius: 999px; background: #3f86d3; flex: 1; max-width: 260px; }
  .dd-progress em { font-style: normal; color: #2f6fb5; font-size: 13px; font-weight: 700; }

  .dd-match {
    display: inline-block;
    background: #d9e9c8;
    color: #3d7226;
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    margin-bottom: 6px;
  }

  .dd-earnings-grid { display: grid; grid-template-columns: 1fr 1fr; }
  .dd-earn-left, .dd-earn-right { padding: 16px; }
  .dd-earn-right { border-left: 1px solid var(--border); }
  .dd-earn-big { font-family: var(--font-head); font-size: 26px; font-weight: 800; color: #356f1f; margin-bottom: 10px; }
  .dd-mini-bars { display: flex; align-items: flex-end; gap: 6px; height: 44px; }
  .dd-mini-bars span { width: 30px; border-radius: 3px 3px 0 0; background: #bcd2ea; height: 20px; }
  .dd-mini-bars span.on { background: #a4c1e2; height: 28px; }
  .dd-mini-bars span.deep { background: #1a4f86; height: 36px; }
  .dd-earn-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--text); margin-top: 8px; }
  .dd-earn-row .red, .red { color: #c0392b; }
  .dd-earn-row .green { color: #2f6e1e; }

  @media (max-width: 1020px) {
    .dd-layout { grid-template-columns: 1fr; }
    .dd-nav-card { order: 2; }
    .dd-kpi-grid { grid-template-columns: repeat(2, minmax(150px, 1fr)); }
    .dd-row { flex-wrap: wrap; }
    .dd-amount { text-align: left; }
    .dd-actions { flex-direction: row; width: auto; }
  }
  @media (max-width: 640px) {
    .dd-kpi-grid { grid-template-columns: 1fr; }
    .dd-earnings-grid { grid-template-columns: 1fr; }
    .dd-earn-right { border-left: none; border-top: 1px solid var(--border); }
    .dd-job-title { font-size: 13px; }
  }

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
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: var(--shadow-sm);
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
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
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

  /* ── Workflow v2 ──────────────────────────────────────────── */
  .wf2-shell {
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    padding: 20px 24px 48px;
    box-sizing: border-box;
  }
  .wf2-bc {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }
  .wf2-bc-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--accent);
    font-size: 12px;
    font-family: var(--font);
    padding: 0;
  }
  .wf2-bc-btn:hover { text-decoration: underline; }
  .wf2-bc-sep { color: var(--muted); font-size: 12px; margin: 0 2px; }
  .wf2-bc-cur { font-size: 12px; color: var(--text); font-weight: 600; }
  .wf2-view-toggle {
    margin-left: auto;
    display: flex;
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
  }
  .wf2-view-btn {
    padding: 5px 14px;
    font-size: 11px;
    font-family: var(--font);
    color: var(--muted);
    background: var(--card);
  }
  .wf2-view-btn.active {
    background: var(--nav-bg);
    color: #fff;
  }
  .wf2-header {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 22px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 22px;
  }
  .wf2-header-left { flex: 1; min-width: 0; }
  .wf2-cats { display: flex; align-items: center; gap: 4px; margin-bottom: 8px; }
  .wf2-cat { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--accent); }
  .wf2-cat-dot { color: var(--muted); font-size: 10px; }
  .wf2-title {
    font-family: var(--font-head);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.3px;
    margin: 0 0 8px;
    line-height: 1.3;
  }
  .wf2-meta-row {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: var(--muted);
    flex-wrap: wrap;
  }
  .wf2-dot { color: var(--border2); }
  .wf2-header-right { text-align: right; flex-shrink: 0; }
  .wf2-price {
    font-family: var(--font-head);
    font-size: 26px;
    font-weight: 800;
    color: var(--accent);
    letter-spacing: -0.5px;
    line-height: 1;
    margin-bottom: 4px;
  }
  .wf2-price-label { font-size: 11px; color: var(--muted); margin-bottom: 10px; }
  .wf2-escrow-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 1px solid #c8e0f4;
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 11px;
    color: #2563eb;
    background: #ebf3fb;
  }
  .wf2-released-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 1px solid #a7f3d0;
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 11px;
    color: var(--green);
    background: #ecfdf5;
  }

  /* Step rail */
  .wf2-rail {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 18px;
    overflow-x: auto;
    padding-bottom: 2px;
  }
  .wf2-step { display: flex; align-items: flex-start; flex: 1; min-width: 0; }
  .wf2-step-inner { display: flex; flex-direction: column; align-items: center; gap: 8px; flex-shrink: 0; margin: 0 auto; }
  .wf2-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #d0d5dd;
    background: var(--card);
    color: #aaa;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    font-family: var(--font);
    flex-shrink: 0;
  }
  .wf2-circle.done { background: var(--nav-bg); border-color: var(--nav-bg); color: #fff; }
  .wf2-circle.active {
    background: var(--card);
    border-color: var(--nav-bg);
    border-width: 2.5px;
    color: var(--nav-bg);
    box-shadow: 0 0 0 4px rgba(11,52,95,0.08);
  }
  .wf2-circle.dispute { background: #c0392b; border-color: #c0392b; color: #fff; }
  .wf2-step-label {
    font-size: 10px;
    color: #b0b8c1;
    text-align: center;
    white-space: normal;
    max-width: 64px;
    line-height: 1.35;
    font-family: var(--font);
  }
  .wf2-step-label.done { color: var(--text); }
  .wf2-step-label.active { color: var(--nav-bg); font-weight: 700; }
  .wf2-step-line {
    flex: 1;
    height: 2px;
    margin-top: 20px;
    background: #d0d5dd;
    min-width: 10px;
  }
  .wf2-step-line.done { background: var(--nav-bg); }

  /* Step card */
  .wf2-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    margin-bottom: 20px;
  }
  .wf2-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    background: #eaf3fb;
    border-bottom: 1px solid #c8e0f4;
  }
  .wf2-card-head.dispute { background: #fdf0ef; border-bottom-color: #f5c6c2; }
  .wf2-card-head.success { background: #ecfdf5; border-bottom-color: #a7f3d0; }
  .wf2-card-head-left { display: flex; align-items: center; gap: 10px; }
  .wf2-card-step-num {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--nav-bg);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .wf2-card-head.dispute .wf2-card-step-num { background: #c0392b; }
  .wf2-card-head.success .wf2-card-step-num { background: var(--green); }
  .wf2-card-step-label { font-size: 15px; font-weight: 600; color: var(--nav-bg); font-family: var(--font); }
  .wf2-card-head.dispute .wf2-card-step-label { color: #c0392b; }
  .wf2-card-head.success .wf2-card-step-label { color: var(--green); }
  .wf2-card-cur-label { font-size: 11px; color: #5a7fa0; font-style: italic; }
  .wf2-card-head.dispute .wf2-card-cur-label { color: #c0392b; opacity: 0.75; }
  .wf2-card-head.success .wf2-card-cur-label { color: var(--green); opacity: 0.75; }
  .wf2-card-body { padding: 20px; }
  .wf2-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-top: 1px solid var(--border);
    background: var(--bg);
  }
  .wf2-nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--card);
    color: var(--text);
    font-size: 13px;
    font-family: var(--font);
    padding: 8px 18px;
    cursor: pointer;
  }
  .wf2-nav-btn:hover:not(:disabled) { background: var(--surface); }
  .wf2-nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .wf2-step-count { font-size: 12px; color: var(--muted); }

  /* Checklist */
  .wf2-checklist {
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 18px;
  }
  .wf2-check-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    font-size: 13px;
    color: var(--text);
    transition: background 0.1s;
  }
  .wf2-check-row:last-child { border-bottom: none; }
  .wf2-check-row.done { color: var(--muted); }
  .wf2-check-row.done .wf2-check-text { text-decoration: line-through; }
  .wf2-checkbox {
    width: 18px;
    height: 18px;
    border-radius: 3px;
    border: 1.5px solid #d0d5dd;
    background: #fff;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .wf2-checkbox.checked { background: var(--nav-bg); border-color: var(--nav-bg); color: #fff; }

  /* Data cells */
  .wf2-data-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
    margin-bottom: 16px;
  }
  .wf2-data-cell { border: 1px solid var(--border); border-radius: 4px; padding: 10px 12px; background: var(--bg); }
  .wf2-data-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 4px; }
  .wf2-data-val { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.3; }

  /* Info note */
  .wf2-info-note {
    font-size: 12px;
    color: var(--muted);
    padding: 12px 14px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--bg);
    line-height: 1.6;
    margin-bottom: 14px;
  }

  /* Sign cards */
  .wf2-sign-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  .wf2-sign-card { border: 1px solid var(--border); border-radius: 4px; padding: 14px; text-align: center; background: var(--bg); }
  .wf2-sign-card.signed { border-color: #27ae60; background: #ecfdf5; }
  .wf2-sign-role { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 5px; }
  .wf2-sign-name { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 5px; }
  .wf2-sign-status { font-size: 11px; color: var(--green); }
  .wf2-sign-status.pending { color: var(--muted); }

  /* Progress stream */
  .wf2-stream { border: 1px solid var(--border); border-radius: 4px; background: var(--bg); margin-bottom: 16px; overflow: hidden; }
  .wf2-stream-item { display: flex; gap: 10px; align-items: flex-start; padding: 10px 14px; border-bottom: 1px solid var(--border); font-size: 12px; color: var(--muted); }
  .wf2-stream-item:last-child { border-bottom: none; }
  .wf2-stream-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; margin-top: 4px; }

  /* Form fields */
  .wf2-form-group { margin-bottom: 14px; }
  .wf2-form-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); font-weight: 600; margin-bottom: 6px; display: block; }
  .wf2-form-input {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 9px 12px;
    font-size: 13px;
    font-family: var(--font);
    color: var(--text);
    background: var(--bg);
    box-sizing: border-box;
  }
  .wf2-form-input:focus { outline: none; border-color: var(--accent); }
  .wf2-form-textarea {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 9px 12px;
    font-size: 13px;
    font-family: var(--font);
    color: var(--text);
    background: var(--bg);
    resize: vertical;
    min-height: 76px;
    box-sizing: border-box;
  }
  .wf2-form-textarea:focus { outline: none; border-color: var(--accent); }

  /* Action buttons */
  .wf2-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; align-items: flex-start; }
  .wf2-action-primary {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: var(--nav-bg);
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font);
    cursor: pointer;
    white-space: nowrap;
  }
  .wf2-action-primary:hover:not(:disabled) { opacity: 0.9; }
  .wf2-action-primary:disabled { opacity: 0.45; cursor: not-allowed; }
  .wf2-action-primary.green { background: var(--green); }
  .wf2-action-sec {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: var(--card);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 10px 16px;
    font-size: 13px;
    font-family: var(--font);
    cursor: pointer;
    white-space: nowrap;
  }
  .wf2-action-sec:hover:not(:disabled) { background: var(--bg); }
  .wf2-action-sec:disabled { opacity: 0.45; cursor: not-allowed; }
  .wf2-action-danger {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: var(--card);
    color: #c0392b;
    border: 1px solid #f5c6c2;
    border-radius: 4px;
    padding: 10px 16px;
    font-size: 13px;
    font-family: var(--font);
    cursor: pointer;
    white-space: nowrap;
  }
  .wf2-action-danger:hover:not(:disabled) { background: #fdf0ef; }
  .wf2-action-danger:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Revision / dispute block */
  .wf2-sub-block { border: 1px solid var(--border); border-radius: 4px; padding: 14px; background: var(--bg); margin-top: 12px; }
  .wf2-sub-block-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); font-weight: 600; margin-bottom: 10px; }

  @media (max-width: 520px) {
    .wf2-header { flex-direction: column; }
    .wf2-header-right { text-align: left; }
    .wf2-sign-row { grid-template-columns: 1fr; }
    .wf2-circle { width: 32px; height: 32px; font-size: 12px; }
    .wf2-step-line { margin-top: 16px; }
    .wf2-step-label { max-width: 50px; font-size: 9px; }
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
    border-radius: var(--radius);
    padding: 16px;
    box-shadow: var(--shadow-sm);
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

  .chart-bar-container { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 12px; box-shadow: var(--shadow-sm); }
  .chart-title { font-family: var(--font-head); font-size: 13px; font-weight: 800; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; }
  .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
  .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .bar { width: 100%; background: var(--accent); border-radius: 4px 4px 0 0; transition: height 0.5s ease; min-height: 4px; opacity: 0.85; }
  .bar:hover { opacity: 1; }
  .bar-label { font-size: 10px; color: var(--muted); }
  .bar-val { font-size: 10px; color: var(--accent); }
  .analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .sub-tabs { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
  .sub-tab { padding: 10px 18px; font-family: var(--font); font-size: 13px; font-weight: 500; cursor: pointer; border: none; background: none; color: var(--muted); border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color 0.15s; }
  .sub-tab:hover { color: var(--text); }
  .sub-tab.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 700; }

  .auth-shell {
    min-height: calc(100vh - 52px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background:
      radial-gradient(1000px 500px at 0% 0%, #dca53a22 0%, transparent 60%),
      radial-gradient(900px 480px at 100% 100%, #0b345f22 0%, transparent 60%),
      linear-gradient(180deg, #f8fbff 0%, #f4f6fa 100%);
  }
  .auth-grid {
    width: 100%;
    max-width: none;
    min-height: calc(100vh - 52px);
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: none;
    border-radius: 0;
    overflow: hidden;
    box-shadow: none;
    background: #fff;
  }
  .auth-brand {
    padding: 34px 30px;
    background:
      linear-gradient(150deg, #0b345f 0%, #0f4172 45%, #1a4f81 100%);
    color: #e8f2ff;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .auth-brand-mark {
    font-family: var(--font-head);
    font-size: 34px;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
  }
  .auth-brand h2 {
    font-family: var(--font-head);
    font-size: 34px;
    line-height: 1.15;
    color: #fff;
  }
  .auth-brand p {
    color: #d6e7fb;
    font-size: 16px;
  }
  .auth-brand ul {
    list-style: none;
    display: grid;
    gap: 8px;
  }
  .auth-brand li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #e6f0ff;
  }
  .auth-brand li::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--accent);
    flex-shrink: 0;
  }
  .auth-card {
    width: auto;
    background: var(--surface);
    border: none;
    border-top: none;
    padding: 40px 36px;
    overflow-y: auto;
  }
  .auth-header {
    text-align: left;
    margin-bottom: 16px;
  }
  .auth-header h1 {
    font-family: var(--font-head);
    font-size: 30px;
    font-weight: 900;
    margin-bottom: 2px;
    line-height: 1.1;
  }
  .auth-header p {
    color: var(--muted);
    font-size: 14px;
  }
  .auth-mode-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 1px solid var(--border2);
    border-radius: var(--radius-sm);
    overflow: hidden;
    margin-bottom: 14px;
  }
  .auth-mode-toggle button {
    padding: 10px;
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
  .auth-stepbar {
    display: inline-flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }
  .auth-stepbar span {
    border: 1px solid var(--border2);
    border-radius: 999px;
    font-size: 11px;
    padding: 5px 10px;
    color: var(--muted);
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }
  .auth-stepbar span.done {
    background: #e9f3ff;
    color: #0f4172;
    border-color: #bdd5ee;
  }
  .auth-role-row {
    display: flex;
    gap: 8px;
  }
  .auth-role-row .filter-pill {
    flex: 1;
  }
  .auth-profile-card {
    border: 1px solid var(--border);
    background: #f8fafc;
    border-radius: 10px;
    padding: 12px;
    margin-top: 8px;
  }
  .auth-profile-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
  }
  .auth-profile-head h3 {
    font-family: var(--font-head);
    font-size: 19px;
    line-height: 1;
    margin-bottom: 3px;
  }
  .auth-profile-head p {
    font-size: 12px;
    color: var(--muted);
  }
  .auth-skip-btn {
    border: 1px solid var(--border2);
    background: #fff;
    color: var(--muted);
    border-radius: 999px;
    font-weight: 700;
    font-size: 10px;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    padding: 8px 10px;
    cursor: pointer;
  }
  .auth-skip-btn.active {
    border-color: #85a7cf;
    color: #0f4172;
    background: #e8f2ff;
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
    border-radius: var(--radius);
    padding: 20px;
    box-shadow: var(--shadow-sm);
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
    color: var(--text);
    background: #f0f2f5;
    border: 1px solid var(--border);
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
  .profile-stat-value { font-family: var(--font-head); font-size: 18px; font-weight: 800; color: var(--text); }
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
    border-radius: var(--radius);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: var(--shadow-sm);
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
    border-radius: var(--radius);
    padding: 16px;
    display: grid;
    gap: 12px;
    box-shadow: var(--shadow-sm);
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

  .notif-list { display: flex; flex-direction: column; gap: 8px; }
  .notif-item {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
    box-shadow: var(--shadow-sm);
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



  .empty { text-align: center; padding: 56px 24px; color: var(--muted); background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); }
  .empty-icon { font-size: 40px; margin-bottom: 14px; opacity: 0.35; display: flex; justify-content: center; align-items: center; }
  .empty h3 { font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 6px; }

  .loading-panel {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 14px;
    margin-bottom: 12px;
  }
  .loading-row { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: 13px; }
  .loading-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--accent); animation: pulse 1.1s ease-in-out infinite; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  @media (max-width: 980px) {
    .auth-grid {
      grid-template-columns: 1fr;
      min-height: calc(100vh - 52px);
    }
    .auth-brand {
      padding: 24px;
      gap: 10px;
    }
    .auth-brand h2 { font-size: 29px; }
    .auth-card { padding: 24px; }
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
    .auth-shell {
      padding: 0;
      align-items: flex-start;
    }
    .auth-brand {
      padding: 18px 16px;
    }
    .auth-brand h2 { font-size: 25px; }
    .auth-card { padding: 18px 14px; }
    .auth-header h1 { font-size: 26px; }
    .auth-mode-toggle button {
      font-size: 10px;
      padding: 9px 7px;
    }
    .auth-profile-head {
      flex-direction: column;
      align-items: stretch;
    }
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

  /* ── Job detail / bidding page ─────────────────────────── */
  .jd-shell {
    background: var(--bg);
    min-height: calc(100vh - 56px);
  }
  .jd-topbar {
    background: #fff;
    border-bottom: 1px solid var(--border);
    padding: 10px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .jd-breadcrumb { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; }
  .jd-bc-btn {
    background: none; border: none; color: var(--muted);
    font-family: var(--font); font-size: 13px; cursor: pointer; padding: 0;
  }
  .jd-bc-btn:hover { color: var(--accent); }
  .jd-bc-sep { color: #c5cdd8; font-size: 13px; }
  .jd-bc-current { color: var(--text); font-weight: 600; font-size: 13px; }
  .jd-live-badge {
    display: inline-flex; align-items: center; gap: 7px;
    background: #fff8f0; border: 1px solid #f5c97e;
    border-radius: 999px; padding: 4px 12px;
    font-size: 12px; font-weight: 600; color: #b35a00;
    white-space: nowrap;
  }
  .jd-live-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #f59e0b;
    animation: jd-pulse 1.4s ease-in-out infinite;
  }
  @keyframes jd-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  .jd-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 20px;
    max-width: 1160px;
    margin: 0 auto;
    padding: 20px 24px 40px;
    align-items: start;
  }
  .jd-main { display: flex; flex-direction: column; gap: 16px; }
  .jd-sidebar { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 76px; }

  /* header card */
  .jd-header-card {
    background: var(--nav-bg);
    border-radius: var(--radius);
    padding: 22px 24px 20px;
    color: #e2eaf4;
    box-shadow: var(--shadow-lg);
  }
  .jd-header-top {
    display: flex; align-items: center; gap: 10px;
    flex-wrap: wrap; margin-bottom: 10px;
  }
  .jd-cats { display: inline-flex; align-items: center; gap: 4px; }
  .jd-cat {
    font-size: 10px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 1.5px; color: #7eb8f5;
  }
  .jd-cat-dot { color: #5a7fa0; font-size: 12px; }
  .jd-location {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 12px; color: #94b8d8;
    margin-left: auto;
  }
  .jd-status-badge {
    font-size: 11px; font-weight: 700; padding: 3px 10px;
    border-radius: 999px; white-space: nowrap;
  }
  .jd-status-badge.open   { background: #1a7a4220; color: #4ade80; border: 1px solid #166534; }
  .jd-status-badge.soon   { background: #b3540020; color: #fbbf24; border: 1px solid #92400e; }
  .jd-status-badge.urgent { background: #c0392b20; color: #f87171; border: 1px solid #991b1b; }
  .jd-status-badge.closed { background: #ffffff14; color: #94b8d8; border: 1px solid #3a5a74; }
  .jd-title {
    font-family: var(--font-head);
    font-size: 26px; font-weight: 800; color: #fff;
    margin: 0 0 16px; line-height: 1.2;
  }

  /* stats grid */
  .jd-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border: 1px solid #2a4a62;
    border-radius: var(--radius-sm);
    overflow: hidden;
  }
  .jd-stat-cell {
    padding: 10px 14px;
    border-right: 1px solid #2a4a62;
  }
  .jd-stat-cell.no-border { border-right: none; }
  .jd-stat-cell:last-child { border-right: none; }
  .jd-stat-label {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1.5px; color: #5a8aaa; margin-bottom: 4px;
  }
  .jd-stat-val {
    font-family: var(--font-head); font-size: 20px; font-weight: 800;
    color: #e2eaf4; line-height: 1;
  }
  .jd-stat-val.blue  { color: #60a5fa; }
  .jd-stat-val.green { color: #4ade80; }
  .jd-stat-val.muted { color: #5a8aaa; }
  .jd-stat-sub { font-size: 10px; color: #5a8aaa; margin-top: 4px; }

  /* countdown inside stats grid */
  .jd-countdown {
    display: flex; align-items: baseline; gap: 3px; flex-wrap: wrap;
  }
  .jd-countdown.ended .jd-cd-num { color: #5a8aaa; }
  .jd-cd-num { font-family: var(--font-head); font-size: 20px; font-weight: 800; color: #f87171; line-height: 1; }
  .jd-cd-sep { font-size: 16px; font-weight: 700; color: #3a5a74; }
  .jd-cd-label { font-size: 8px; font-weight: 700; color: #5a8aaa; text-transform: uppercase; letter-spacing: 1px; }

  /* tags row */
  .jd-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 14px; }
  .jd-tag {
    background: #1a3554; border: 1px solid #2a4a68;
    border-radius: 4px; padding: 3px 10px;
    font-size: 12px; color: #94b8d8;
  }

  /* section cards (white) */
  .jd-section-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 18px 20px;
  }
  .jd-section-title {
    font-size: 15px; font-weight: 700; color: var(--text);
    margin-bottom: 12px;
  }
  .jd-desc-text { font-size: 14px; color: #334155; line-height: 1.7; white-space: pre-wrap; }

  /* requirements */
  .jd-reqs-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .jd-req-item {
    display: flex; gap: 10px; font-size: 13px; color: #334155; line-height: 1.5;
  }
  .jd-req-item::before {
    content: ''; width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent); flex-shrink: 0; margin-top: 6px;
  }

  /* bid ladder */
  .jd-ladder-ceiling {
    display: flex; align-items: center; justify-content: space-between;
    background: #eef5fd; border: 1px solid #b8d0ed;
    border-radius: 4px; padding: 8px 14px;
    font-size: 13px; color: #1a4f8a;
    margin-bottom: 4px;
  }
  .jd-ladder-ceiling-amt { font-weight: 800; }
  .jd-ladder-empty {
    text-align: center; padding: 24px; color: var(--muted); font-size: 13px;
    font-style: italic;
  }
  .jd-ladder { display: flex; flex-direction: column; }
  .jd-ladder-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 0; border-bottom: 1px solid var(--border);
  }
  .jd-ladder-row:last-child { border-bottom: none; }
  .jd-ladder-row.winner { background: #f0fdf4; margin: 0 -20px; padding: 10px 20px; }
  .jd-ladder-rank {
    width: 20px; text-align: center; font-size: 12px;
    font-weight: 700; color: var(--muted); flex-shrink: 0;
  }
  .jd-ladder-row.winner .jd-ladder-rank { color: #16a34a; }
  .jd-ladder-info { flex: 1; min-width: 0; }
  .jd-ladder-name {
    font-size: 13px; font-weight: 600; color: var(--text);
    display: flex; align-items: center; gap: 6px;
  }
  .jd-profile-link {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .jd-profile-link:disabled {
    cursor: default;
    opacity: 0.85;
  }
  .jd-profile-link:not(:disabled):hover .jd-ladder-name,
  .jd-profile-link:not(:disabled):hover.jd-ladder-name,
  .jd-profile-link:not(:disabled):hover .jd-posted-name,
  .jd-profile-link:not(:disabled):hover.jd-posted-name {
    color: #1f4f82;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .jd-winner-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #16a34a; flex-shrink: 0;
  }
  .jd-ladder-stars { display: flex; align-items: center; gap: 4px; margin-top: 2px; }
  .jd-ladder-rating { font-size: 11px; color: var(--muted); }
  .jd-ladder-jobs   { font-size: 11px; color: var(--muted); }
  .jd-ladder-right  { text-align: right; flex-shrink: 0; }
  .jd-ladder-amt    { font-size: 15px; font-weight: 700; color: var(--text); }
  .jd-ladder-amt.green { color: #16a34a; }
  .jd-ladder-ago    { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .jd-ladder-hidden {
    text-align: center; padding: 10px; font-size: 12px; color: var(--muted);
    border-top: 1px dashed var(--border);
  }
  .jd-ladder-hidden button {
    background: none; border: none; color: var(--accent);
    font-size: 12px; cursor: pointer; font-family: var(--font);
    text-decoration: underline;
  }

  /* inline award selection (subtle, ladder-based) */
  .jd-award-inline-note {
    font-size: 12px;
    color: var(--muted);
    margin: 0 0 8px;
  }
  .jd-ladder-row.selectable {
    cursor: pointer;
  }
  .jd-ladder-row.selectable:hover {
    background: #f8fafc;
  }
  .jd-ladder-row.selectable.selected {
    background: #f0fdf4;
  }
  .jd-ladder-select {
    width: 14px;
    text-align: center;
    color: #16a34a;
    font-size: 11px;
    flex-shrink: 0;
  }
  .jd-award-inline-actions {
    padding-top: 10px;
    border-top: 1px dashed var(--border);
    margin-top: 8px;
  }
  .jd-award-btn {
    width: 100%; background: var(--accent); color: #fff;
    border: none; border-radius: var(--radius-sm);
    padding: 11px; font-family: var(--font); font-size: 14px; font-weight: 700;
    cursor: pointer; transition: opacity 0.15s;
  }
  .jd-award-btn:hover:not(:disabled) { opacity: 0.88; }
  .jd-award-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* right sidebar cards */
  .jd-bid-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 18px 18px 16px;
  }
  .jd-bid-card-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .jd-bid-subtext { font-size: 13px; color: var(--muted); margin-bottom: 10px; margin-top: 0; }
  .jd-bid-lowest-box {
    background: #f0fdf4; border: 1px solid #bbf7d0;
    border-radius: 4px; padding: 9px 12px;
    font-size: 12px; color: #166534; margin-bottom: 12px; line-height: 1.5;
  }
  .jd-my-bid-placed {
    display: flex; align-items: center; gap: 6px;
    background: var(--accent-soft); border: 1px solid var(--accent);
    border-radius: 4px; padding: 8px 12px;
    font-size: 13px; color: var(--accent); margin-bottom: 12px;
  }
  .jd-leading { font-weight: 700; color: #16a34a; }

  .jd-bid-form { display: flex; flex-direction: column; gap: 12px; }
  .jd-form-group { display: flex; flex-direction: column; gap: 4px; }
  .jd-form-label { font-size: 12px; font-weight: 600; color: var(--text); }
  .jd-opt { font-weight: 400; color: var(--muted); }
  .jd-amount-input {
    width: 100%; background: #f8fafc; border: 2px solid var(--border2);
    border-radius: var(--radius-sm); padding: 10px 14px;
    font-family: var(--font); font-size: 22px; font-weight: 700;
    color: var(--text); text-align: center; outline: none;
    box-sizing: border-box;
  }
  .jd-amount-input:focus { border-color: var(--accent); }
  .jd-amount-hint { font-size: 11px; color: var(--muted); }
  .jd-form-input {
    background: var(--bg); border: 1px solid var(--border2);
    border-radius: var(--radius-sm); padding: 8px 12px;
    font-family: var(--font); font-size: 13px; color: var(--text);
    outline: none; width: 100%; box-sizing: border-box;
  }
  .jd-form-input:focus { border-color: var(--accent); }
  .jd-form-textarea {
    background: var(--bg); border: 1px solid var(--border2);
    border-radius: var(--radius-sm); padding: 8px 12px;
    font-family: var(--font); font-size: 13px; color: var(--text);
    outline: none; width: 100%; resize: vertical; box-sizing: border-box;
    line-height: 1.5;
  }
  .jd-form-textarea:focus { border-color: var(--accent); }
  .jd-submit-btn {
    width: 100%; background: var(--nav-bg); color: #fff;
    border: none; border-radius: var(--radius-sm);
    padding: 13px; font-family: var(--font); font-size: 15px; font-weight: 700;
    cursor: pointer; transition: opacity 0.15s;
  }
  .jd-submit-btn:hover:not(:disabled) { opacity: 0.88; }
  .jd-submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .jd-submit-disclaimer {
    font-size: 11px; color: var(--muted); text-align: center; margin: 0;
    line-height: 1.5;
  }

  /* posted by */
  .jd-posted-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 16px 18px;
  }
  .jd-posted-label {
    font-size: 9px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 2px; color: var(--muted); margin-bottom: 12px;
  }
  .jd-posted-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .jd-posted-profile { display: inline-flex; align-items: center; gap: 10px; }
  .jd-posted-name { font-size: 14px; font-weight: 700; color: var(--text); }
  .jd-posted-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .jd-posted-stats {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px 8px; padding-top: 12px; border-top: 1px solid var(--border);
  }
  .jd-posted-stat-val {
    font-size: 16px; font-weight: 700; color: var(--text);
    display: flex; align-items: center; gap: 4px; margin-bottom: 2px;
  }
  .jd-posted-stat-label { font-size: 11px; color: var(--muted); }

  /* how selection works */
  .jd-how-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 16px 18px;
  }
  .jd-how-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 10px; }
  .jd-how-row {
    display: flex; align-items: flex-start; gap: 8px;
    font-size: 12px; color: #334155; line-height: 1.45; margin-bottom: 7px;
  }
  .jd-how-row:last-child { margin-bottom: 0; }
  .jd-how-check { color: #16a34a; font-weight: 700; flex-shrink: 0; font-size: 13px; }

  /* responsive */
  @media (max-width: 900px) {
    .jd-body { grid-template-columns: 1fr; padding: 14px; }
    .jd-sidebar { position: static; }
    .jd-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .jd-stat-cell:nth-child(2) { border-right: none; }
    .jd-stat-cell:nth-child(3) { border-top: 1px solid #2a4a62; }
    .jd-stat-cell:nth-child(4) { border-top: 1px solid #2a4a62; border-right: none; }
    .jd-title { font-size: 22px; }
  }
  @media (max-width: 600px) {
    .jd-stats-grid { grid-template-columns: 1fr 1fr; }
    .jd-title { font-size: 19px; }
    .jd-topbar { padding: 10px 14px; }
    .jd-body { padding: 12px; }
  }

  /* ── Job posting page ───────────────────────────────────── */
  .jp-page {
    background: var(--bg);
    min-height: calc(100vh - 56px);
    padding: 0 0 26px;
  }
  .jp-topbar {
    background: #ffffff;
    color: #2a4b68;
    border-bottom: 1px solid var(--border);
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    font-size: 13px;
  }
  .jp-top-left { display: inline-flex; align-items: center; gap: 8px; }
  .jp-link { background: none; border: none; color: #2a5d8a; cursor: pointer; font-family: var(--font); font-size: 13px; }
  .jp-link:hover { color: #174368; }
  .jp-sep { color: #9eb1c5; }
  .jp-draft { color: #6d8195; font-size: 12px; }

  .jp-steps {
    background: #f2f7fd;
    border-top: 1px solid #e0ebf6;
    border-bottom: 1px solid #d8e6f4;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    overflow-x: auto;
  }
  .jp-step {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #6f88a1;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }
  .jp-step.done { color: #c8932f; }
  .jp-step.active { color: #1f4b74; }

  .jp-layout {
    max-width: 1200px;
    margin: 18px auto 0;
    padding: 0 16px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 16px;
    align-items: start;
  }
  .jp-main-col { display: flex; flex-direction: column; gap: 14px; }
  .jp-side-col { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 72px; }

  .jp-card {
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px;
    color: var(--text);
  }
  .jp-card-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
    border-bottom: 1px solid #e3e9f1;
    padding-bottom: 10px;
  }
  .jp-card-head h3 { font-size: 30px; font-family: var(--font-head); color: #1e2f40; letter-spacing: 0.2px; }
  .jp-card-head span { font-size: 12px; color: #74879a; }

  .jp-category-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 9px;
  }
  .jp-category-tile {
    background: #f8fbff;
    border: 1px solid #d7e3f1;
    border-radius: 8px;
    text-align: left;
    padding: 10px;
    color: #30485f;
    cursor: pointer;
  }
  .jp-category-tile.active {
    border-color: #72b5f2;
    background: #d7ecff;
    color: #1e3a57;
  }
  .jp-category-icon { font-size: 11px; color: #88a0b7; margin-bottom: 4px; }
  .jp-category-tile.active .jp-category-icon { color: #2a6899; }
  .jp-category-name { font-weight: 700; font-size: 15px; margin-bottom: 4px; }
  .jp-category-blurb { font-size: 12px; line-height: 1.4; opacity: 0.9; }

  .jp-form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
  .jp-form-group label { font-size: 12px; font-weight: 700; color: #3f5569; display: flex; justify-content: space-between; gap: 10px; }
  .jp-form-group label span { color: #d87171; font-size: 11px; font-weight: 600; }
  .jp-input,
  .jp-textarea {
    width: 100%;
    background: #ffffff;
    border: 1px solid var(--border2);
    border-radius: 7px;
    color: #203245;
    font-family: var(--font);
    font-size: 16px;
    padding: 10px 12px;
    outline: none;
  }
  .jp-input { height: 46px; }
  .jp-textarea { min-height: 128px; resize: vertical; line-height: 1.5; }
  .jp-input:focus,
  .jp-textarea:focus { border-color: #8ec8ff; }
  .jp-row.two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  .jp-requirements { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
  .jp-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #d7ecff;
    border: 1px solid #8ec8ff;
    color: #22527c;
    border-radius: 5px;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 600;
  }
  .jp-chip button {
    border: none;
    background: none;
    color: #22527c;
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
  }
  .jp-add-row { display: flex; gap: 8px; }
  .jp-add-btn {
    border: 1px solid #bfd2e4;
    background: #f3f8fe;
    color: #2e5c86;
    border-radius: 7px;
    padding: 0 12px;
    font-family: var(--font);
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
  }

  .jp-budget-meter {
    background: #f5f9fe;
    border: 1px solid #d4e4f4;
    border-radius: 8px;
    padding: 12px;
  }
  .jp-budget-head { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #3d5871; }
  .jp-meter-track { height: 7px; border-radius: 999px; background: #d7e6f5; overflow: hidden; }
  .jp-meter-fill { height: 100%; background: linear-gradient(90deg, #87bfff 0%, #2081e8 100%); }
  .jp-budget-meter p { margin-top: 8px; font-size: 12px; color: #708399; }

  .jp-review-card .jp-review-alert {
    background: #f8e7cc;
    color: #8a5a10;
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    gap: 8px;
    align-items: flex-start;
    font-size: 13px;
    margin-bottom: 10px;
  }
  .jp-actions { display: flex; justify-content: space-between; gap: 10px; }
  .jp-secondary,
  .jp-primary {
    border-radius: 8px;
    padding: 11px 16px;
    font-family: var(--font);
    font-weight: 700;
    cursor: pointer;
  }
  .jp-secondary { border: 1px solid #bfd2e4; background: #ffffff; color: #355774; }
  .jp-primary { border: none; background: #1674d6; color: #fff; margin-left: auto; }
  .jp-primary:disabled { opacity: 0.45; cursor: not-allowed; }

  .jp-preview {
    background: #ffffff;
    border: 1px solid #cfe0f1;
    border-radius: 10px;
    overflow: hidden;
  }
  .jp-preview-head {
    background: #114a85;
    color: #dbeeff;
    padding: 9px 12px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .jp-preview-head small { font-size: 10px; color: #9ec0dd; text-transform: none; letter-spacing: 0; }
  .jp-preview-body { padding: 12px; color: #304457; }
  .jp-preview-cat { font-size: 10px; letter-spacing: 1.2px; color: #6db8ff; margin-bottom: 6px; }
  .jp-preview-body h4 { font-size: 20px; font-family: var(--font-head); line-height: 1.25; margin-bottom: 8px; color: #1f3447; }
  .jp-preview-loc { display: inline-flex; align-items: center; gap: 4px; color: #5f768d; font-size: 12px; margin-bottom: 8px; }
  .jp-preview-body p { color: #4a6076; font-size: 13px; line-height: 1.45; margin-bottom: 10px; }
  .jp-preview-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    border-top: 1px solid #d8e5f2;
    border-bottom: 1px solid #d8e5f2;
    padding: 8px 0;
  }
  .jp-preview-grid label { display: block; font-size: 10px; text-transform: uppercase; color: #7a90a6; letter-spacing: 1px; }
  .jp-preview-grid strong { color: #1b4f84; font-size: 18px; font-family: var(--font-head); }
  .jp-preview-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .jp-preview-tags span {
    font-size: 11px;
    background: #f3f7fc;
    border: 1px solid #d2dfed;
    border-radius: 5px;
    padding: 3px 8px;
    color: #47607a;
  }

  .jp-tips {
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px;
    color: #3d556c;
  }
  .jp-tips h4 { color: #1f3447; margin-bottom: 10px; font-size: 15px; }
  .jp-tips ul { list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .jp-tips li { font-size: 13px; line-height: 1.45; color: #5a7188; padding-left: 16px; position: relative; }
  .jp-tips li::before { content: '->'; color: #ffb545; position: absolute; left: 0; top: 0; }

  @media (max-width: 1000px) {
    .jp-layout { grid-template-columns: 1fr; }
    .jp-side-col { position: static; }
  }
  @media (max-width: 740px) {
    .jp-topbar { padding: 10px 12px; }
    .jp-steps { padding: 10px 12px; }
    .jp-layout { padding: 0 10px; margin-top: 12px; }
    .jp-row.two { grid-template-columns: 1fr; }
    .jp-category-grid { grid-template-columns: 1fr 1fr; }
    .jp-preview-grid { grid-template-columns: 1fr; }
    .jp-add-row { flex-direction: column; }
  }
  @media (max-width: 520px) {
    .jp-category-grid { grid-template-columns: 1fr; }
    .jp-card { padding: 12px; }
    .jp-card-head { flex-direction: column; align-items: flex-start; }
  }

  /* ── Browse Requests page ───────────────────────────────── */
  .br-shell {
    background: var(--bg);
    min-height: calc(100vh - 56px);
  }
  .br-topbar {
    background: #fff;
    border-bottom: 1px solid var(--border);
    padding: 10px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .br-breadcrumb {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    color: var(--muted);
    flex-shrink: 0;
  }
  .br-bc-link {
    background: none;
    border: none;
    color: var(--muted);
    font-family: var(--font);
    font-size: 13px;
    cursor: pointer;
    padding: 0;
  }
  .br-bc-link:hover { color: var(--accent); }
  .br-bc-sep { color: var(--border2); }
  .br-bc-current { color: var(--text); font-weight: 600; }
  .br-topsearch-wrap {
    display: flex;
    align-items: stretch;
    flex: 1;
    max-width: 680px;
    border: 1px solid var(--border2);
    border-radius: var(--radius-sm);
    overflow: hidden;
    background: #fff;
  }
  .br-topsearch-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 9px 14px;
    font-family: var(--font);
    font-size: 14px;
    color: var(--text);
    background: transparent;
  }
  .br-topsearch-input::placeholder { color: #9aacbd; }
  .br-topsearch-btn {
    border: none;
    border-left: 1px solid var(--border2);
    background: #f3f6fa;
    color: var(--text);
    font-family: var(--font);
    font-size: 13px;
    font-weight: 700;
    padding: 0 18px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .br-topsearch-btn:hover { background: #e8edf4; }

  .br-page {
    display: grid;
    grid-template-columns: 210px minmax(0, 1fr);
    gap: 0;
    max-width: 1280px;
    margin: 0 auto;
    padding: 18px 24px 32px;
    align-items: start;
  }

  /* sidebar */
  .br-sidebar {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    position: sticky;
    top: 76px;
    overflow: hidden;
    margin-right: 16px;
  }
  .br-filter-section {
    padding: 13px 14px 11px;
    border-bottom: 1px solid var(--border);
  }
  .br-filter-section:last-of-type { border-bottom: none; }
  .br-filter-heading {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--muted);
    font-weight: 700;
    margin-bottom: 9px;
  }
  .br-checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text);
    cursor: pointer;
    padding: 3px 0;
    line-height: 1.35;
  }
  .br-checkbox-row input[type="checkbox"] {
    accent-color: var(--accent);
    width: 13px;
    height: 13px;
    flex-shrink: 0;
    cursor: pointer;
  }
  .br-checkbox-row span:first-of-type { flex: 1; min-width: 0; }
  .br-count { font-size: 11px; color: var(--muted); margin-left: auto; }
  .br-range-row { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .br-range-input {
    background: var(--bg);
    border: 1px solid var(--border2);
    border-radius: var(--radius-sm);
    padding: 6px 8px;
    font-family: var(--font);
    font-size: 13px;
    color: var(--text);
    width: 100%;
    outline: none;
    text-align: center;
  }
  .br-range-input:focus { border-color: var(--accent); }
  .br-select {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border2);
    border-radius: var(--radius-sm);
    padding: 7px 10px;
    font-family: var(--font);
    font-size: 13px;
    color: var(--text);
    outline: none;
    cursor: pointer;
  }
  .br-select:focus { border-color: var(--accent); }
  .br-rating-chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .br-rating-chip {
    border: 1px solid var(--border2);
    background: var(--bg);
    color: var(--muted);
    border-radius: var(--radius-sm);
    padding: 4px 10px;
    font-family: var(--font);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
  .br-rating-chip.active {
    border-color: var(--nav-bg);
    color: var(--nav-bg);
    background: #e5f0fd;
  }
  .br-clear-btn {
    display: block;
    width: calc(100% - 28px);
    margin: 10px 14px 12px;
    background: transparent;
    border: 1px solid var(--border2);
    border-radius: var(--radius-sm);
    padding: 7px;
    font-family: var(--font);
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    cursor: pointer;
    text-align: center;
    transition: border-color 0.15s, color 0.15s;
  }
  .br-clear-btn:hover { border-color: var(--accent2); color: var(--accent2); }

  /* main area */
  .br-main { min-width: 0; }
  .br-header {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 8px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
  }
  .br-match-count { font-size: 14px; color: var(--muted); flex: 1; }
  .br-match-count strong { color: var(--text); font-weight: 700; }
  .br-header-right { display: flex; align-items: center; gap: 8px; }
  .br-sort-label {
    font-size: 12px;
    color: var(--muted);
    white-space: nowrap;
  }
  .br-sort-select {
    background: var(--bg);
    border: 1px solid var(--border2);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    font-family: var(--font);
    font-size: 13px;
    color: var(--text);
    outline: none;
    cursor: pointer;
    min-width: 150px;
  }
  .br-sort-select:focus { border-color: var(--accent); }
  .br-view-toggle {
    display: inline-flex;
    border: 1px solid var(--border2);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }
  .br-view-btn {
    background: var(--bg);
    border: none;
    padding: 6px 10px;
    color: var(--muted);
    cursor: pointer;
    border-right: 1px solid var(--border2);
    transition: background 0.15s, color 0.15s;
    display: inline-flex;
    align-items: center;
  }
  .br-view-btn:last-child { border-right: none; }
  .br-view-btn.active { background: #fff; color: var(--text); }

  /* chips */
  .br-chips-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }
  .br-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #eef5fd;
    color: #1a4f8a;
    border: 1px solid #b8d0ed;
    border-radius: 999px;
    padding: 3px 10px 3px 12px;
    font-size: 12px;
    font-weight: 500;
  }
  .br-chip button {
    background: none;
    border: none;
    cursor: pointer;
    color: #4a7bb0;
    display: inline-flex;
    align-items: center;
    padding: 0;
    margin-left: 2px;
  }
  .br-chip button:hover { color: var(--accent2); }

  /* badges */
  .br-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 4px;
    white-space: nowrap;
  }
  .br-badge-open { background: #e6f7ee; color: #1a7a42; border: 1px solid #b0e0c4; }
  .br-badge-warn { background: #fff4e5; color: #b35a00; border: 1px solid #ffd59e; }
  .br-badge-fire { background: #fff0ee; color: #c0392b; border: 1px solid #f5b5ae; }
  .br-badge-nobids { background: #edf4ff; color: #1a5cbf; border: 1px solid #b3d0f5; }
  .br-badge-closed { background: var(--bg); color: var(--muted); border: 1px solid var(--border); }

  /* list */
  .br-list { display: flex; flex-direction: column; gap: 10px; }
  .br-card {
    display: grid;
    grid-template-columns: 1fr 200px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    transition: background 0.1s, box-shadow 0.2s, transform 0.15s, border-color 0.15s;
    position: relative;
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }
  .br-list .br-card:first-child { border-radius: var(--radius); }
  .br-list .br-card:last-child { border-radius: var(--radius); }
  .br-card:hover { background: #fafcff; box-shadow: var(--shadow-lg); transform: translateY(-2px); border-color: var(--border2); }
  .br-card--bid  { }
  .br-card--won  { border-left: 3px solid var(--green); }
  .br-card--lost { border-left: 3px solid #aaa; opacity: 0.8; }
  .br-card--urgent { }

  .br-card-main {
    padding: 14px 18px 14px 16px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .br-card-top-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 2px;
  }
  .br-cat-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
    color: var(--accent);
  }
  .br-card-location {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 12px;
    color: var(--muted);
    margin-bottom: 1px;
  }
  .br-card-title {
    font-family: var(--font-head);
    font-size: 18px;
    font-weight: 700;
    line-height: 1.25;
    color: var(--text);
    margin: 0;
  }
  .br-card-desc {
    font-size: 13px;
    color: #4a5e72;
    line-height: 1.5;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin-top: 2px;
  }
  .br-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
  .br-tag {
    background: #f2f4f7;
    border: 1px solid #dde3ec;
    border-radius: 4px;
    padding: 2px 9px;
    font-size: 12px;
    color: #4f6174;
  }

  /* card side panel */
  .br-card-side {
    border-left: 1px solid var(--border);
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #fafbfd;
  }
  .br-budget-block { display: flex; flex-direction: column; gap: 2px; }
  .br-budget-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--muted);
    font-weight: 700;
  }
  .br-budget-amount {
    font-family: var(--font-head);
    font-size: 26px;
    font-weight: 800;
    color: #1a4f9c;
    line-height: 1;
  }
  .br-bids-row { font-size: 11px; color: var(--muted); }
  .br-be-first { color: #1a5cbf; }
  .br-closes-row { font-size: 12px; color: var(--muted); }
  .br-closes-row strong { color: var(--text); }
  .br-client-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding-top: 8px;
    border-top: 1px solid var(--border);
  }
  .br-client-link {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-align: left;
    cursor: pointer;
  }
  .br-client-link:disabled {
    cursor: default;
    opacity: 0.85;
  }
  .br-client-link:not(:disabled):hover .br-client-name {
    color: #1f4f82;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .br-client-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .br-client-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .br-bid-btn {
    width: 100%;
    background: var(--nav-bg);
    border: none;
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    font-family: var(--font);
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    text-align: center;
    transition: opacity 0.15s, transform 0.1s;
  }
  .br-bid-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .br-bid-placed {
    font-size: 11px;
    color: var(--accent);
    font-weight: 600;
    text-align: center;
    padding: 6px 8px;
    border: 1px solid var(--accent);
    border-radius: var(--radius-sm);
    background: var(--accent-soft);
  }
  .br-bid-won {
    font-size: 12px;
    font-weight: 700;
    color: var(--green);
    text-align: center;
    padding: 6px 8px;
    border: 1px solid var(--green);
    border-radius: var(--radius-sm);
    background: #e6f7ee;
  }
  .br-bid-lost {
    font-size: 12px;
    color: var(--muted);
    text-align: center;
    padding: 6px 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }

  /* grid view */
  .br-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
    gap: 12px;
  }
  .br-grid .br-card {
    border-top: 1px solid var(--border) !important;
    border-radius: var(--radius);
    grid-template-columns: 1fr;
  }
  .br-grid .br-card-side {
    border-left: none;
    border-top: 1px solid var(--border);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    align-items: start;
  }
  .br-grid .br-budget-block { grid-column: 1 / -1; }
  .br-grid .br-closes-row { align-self: end; }
  .br-grid .br-client-row { grid-column: 1 / -1; padding-top: 8px; }
  .br-grid .br-bid-btn { grid-column: 1 / -1; }
  .br-grid .br-bid-placed,
  .br-grid .br-bid-won,
  .br-grid .br-bid-lost { grid-column: 1 / -1; }

  /* empty + pagination */
  .br-empty {
    text-align: center;
    padding: 60px 20px;
    color: var(--muted);
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .br-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 18px 0 4px;
  }
  .br-page-btn {
    min-width: 34px;
    height: 34px;
    border: 1px solid var(--border2);
    background: var(--card);
    color: var(--muted);
    border-radius: var(--radius-sm);
    font-family: var(--font);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
    padding: 0 8px;
  }
  .br-page-btn:hover:not(:disabled) { border-color: var(--nav-bg); color: var(--nav-bg); }
  .br-page-btn.active { background: var(--nav-bg); color: #fff; border-color: var(--nav-bg); }
  .br-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .br-page-ellipsis { padding: 0 4px; color: var(--muted); font-size: 13px; }

  /* responsive */
  @media (max-width: 960px) {
    .br-page { grid-template-columns: 1fr; padding: 12px; }
    .br-sidebar { position: static; margin-right: 0; margin-bottom: 12px; display: grid; grid-template-columns: repeat(2, 1fr); }
    .br-filter-section { border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); }
    .br-filter-section:nth-child(even) { border-right: none; }
    .br-filter-section:last-of-type { border-bottom: none; }
  }
  @media (max-width: 760px) {
    .br-topbar { padding: 10px 14px; }
    .br-topsearch-wrap { max-width: 100%; }
    .br-card { grid-template-columns: 1fr; }
    .br-card-side { border-left: none; border-top: 1px solid var(--border); flex-direction: row; flex-wrap: wrap; align-items: flex-start; gap: 10px; background: #fafbfd; }
    .br-budget-block { flex: 1; }
    .br-client-row { border-top: none; padding-top: 0; flex: 1; min-width: 140px; }
    .br-bid-btn { width: auto; min-width: 100px; }
  }
  @media (max-width: 500px) {
    .br-sidebar { grid-template-columns: 1fr; }
    .br-header { flex-direction: column; align-items: flex-start; }
    .br-header-right { width: 100%; justify-content: space-between; }
    .br-card-title { font-size: 15px; }
  }

  /* ═══════════════════════════════════════════
     PROVIDER PROFILE PAGE  pp-*
  ═══════════════════════════════════════════ */
  .pp-page { max-width: 1100px; margin: 0 auto; padding: 24px 20px 60px; }
  .pp-topbar { margin-bottom: 18px; }
  .pp-breadcrumb { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--muted); }
  .pp-bc-btn { background: none; border: none; color: #2a5d8a; cursor: pointer; font-family: var(--font); font-size: 13px; padding: 0; }
  .pp-bc-btn:hover { color: var(--accent-dark); text-decoration: underline; }
  .pp-bc-sep { color: #c5cdd8; }

  .pp-layout { display: grid; grid-template-columns: 1fr 280px; gap: 20px; align-items: start; }
  .pp-main { display: flex; flex-direction: column; gap: 16px; }
  .pp-sidebar { display: flex; flex-direction: column; gap: 14px; }

  .pp-hero-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 22px 24px 18px; box-shadow: var(--shadow-sm); }
  .pp-hero-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
  .pp-hero-left { display: flex; align-items: flex-start; gap: 16px; flex: 1; }
  .pp-avatar-wrap { position: relative; flex-shrink: 0; }
  .pp-avatar-img { border-radius: 50%; object-fit: cover; border: 3px solid #e2e8f2; }
  .pp-avatar-initials { border-radius: 50%; background: #f0f2f5; color: var(--text); font-weight: 800; font-family: var(--font-head); display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 2px solid var(--border); }
  .pp-online-dot { position: absolute; bottom: 3px; right: 3px; width: 13px; height: 13px; border-radius: 50%; background: var(--green); border: 2px solid #fff; }
  .pp-hero-info { flex: 1; }
  .pp-hero-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
  .pp-hero-name { font-family: var(--font-head); font-size: 22px; font-weight: 700; color: var(--text); }
  .pp-badge { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px; padding: 3px 8px; border-radius: 4px; }
  .pp-badge.verified { background: #f0f2f5; color: #3a4d60; border: 1px solid var(--border); }
  .pp-verified-icon { color: #1d9bf0; flex-shrink: 0; }
  .pp-badge.top-rated { background: #f0f2f5; color: #3a4d60; border: 1px solid var(--border); }
  .pp-hero-tagline { font-size: 13.5px; color: var(--muted); margin-bottom: 6px; }
  .pp-hero-meta { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #556577; flex-wrap: wrap; }
  .pp-hero-meta span { display: inline-flex; align-items: center; gap: 3px; }
  .pp-online-label { font-size: 12px; color: var(--green); font-weight: 600; margin-top: 6px; }
  .pp-hero-actions { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
  .pp-btn-outline { padding: 8px 16px; border-radius: var(--radius-sm); font-family: var(--font); font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; background: var(--nav-bg); color: #fff; border: none; transition: background 0.15s; }
  .pp-btn-outline:hover { background: #0e3d6e; }
  .pp-btn-ghost { padding: 7px 16px; border-radius: var(--radius-sm); font-family: var(--font); font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap; background: var(--card-2); color: var(--text); border: 1px solid var(--border); transition: border-color 0.15s, background 0.15s; }
  .pp-btn-ghost:hover { border-color: var(--accent); background: var(--accent-soft); }

  .pp-tabs { display: flex; border-bottom: 2px solid var(--border); background: var(--card); border-radius: var(--radius) var(--radius) 0 0; border: 1px solid var(--border); padding: 0 6px; gap: 0; box-shadow: var(--shadow-sm); }
  .pp-tab { padding: 12px 16px; border: none; background: transparent; font-family: var(--font); font-size: 14px; font-weight: 500; color: var(--muted); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color 0.15s, border-color 0.15s; }
  .pp-tab:hover { color: var(--text); }
  .pp-tab.active { color: var(--text); border-bottom-color: var(--text); font-weight: 700; }

  .pp-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 22px; box-shadow: var(--shadow-sm); }
  .pp-card-head-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .pp-section-head { font-family: var(--font-head); font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 14px; }
  .pp-card-head-row .pp-section-head { margin-bottom: 0; }
  .pp-reviews-headbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
  .pp-reviews-headbar .pp-section-head { margin-bottom: 0; }
  .pp-sort-wrap { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
  .pp-sort-select { border: 1px solid var(--border2); border-radius: 6px; padding: 5px 8px; background: #fff; color: var(--text); font-size: 12px; font-family: var(--font); }
  .pp-view-all { background: none; border: none; color: #2a5d8a; font-family: var(--font); font-size: 13px; cursor: pointer; font-weight: 600; }
  .pp-view-all:hover { color: var(--accent-dark); }

  .pp-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden; }
  .pp-stat { padding: 18px 16px; text-align: center; border-right: 1px solid var(--border); }
  .pp-stat:last-child { border-right: none; }
  .pp-stat-val { display: block; font-family: var(--font-head); font-size: 24px; font-weight: 800; color: var(--text); line-height: 1.1; }
  .pp-stat-unit { font-size: 14px; }
  .pp-stat-label { display: block; font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; margin-top: 4px; }

  .pp-about-text { font-size: 14.5px; color: #3a4d60; line-height: 1.65; }
  .pp-skills { display: flex; flex-wrap: wrap; gap: 8px; }
  .pp-skill-chip { background: #f5f6f8; border: 1px solid var(--border); color: var(--text); font-size: 13px; padding: 5px 12px; border-radius: 20px; font-weight: 500; }
  .pp-star-row { display: inline-flex; align-items: center; gap: 1px; }

  .pp-recent-jobs { display: flex; flex-direction: column; gap: 12px; }
  .pp-recent-job { background: var(--card-2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 14px; }
  .pp-rj-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px; }
  .pp-rj-cat { font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 700; color: var(--muted); }
  .pp-rj-amount { font-size: 14px; font-weight: 700; color: var(--text); }
  .pp-rj-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
  .pp-rj-meta { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--muted); flex-wrap: wrap; }
  .pp-rj-loc { display: inline-flex; align-items: center; gap: 2px; }
  .pp-rj-ago { color: #8fa3b5; }

  .pp-reviews-header { display: flex; gap: 32px; align-items: flex-start; padding-bottom: 18px; margin-bottom: 16px; border-bottom: 1px solid var(--border); }
  .pp-reviews-score { display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 90px; }
  .pp-reviews-big { font-family: var(--font-head); font-size: 48px; font-weight: 800; color: var(--text); line-height: 1; }
  .pp-reviews-count { font-size: 13px; color: var(--muted); }
  .pp-star-breakdown { flex: 1; display: flex; flex-direction: column; gap: 5px; }
  .pp-sb-row { display: flex; align-items: center; gap: 10px; font-size: 13px; }
  .pp-sb-label { width: 32px; text-align: right; color: var(--muted); font-weight: 600; }
  .pp-sb-bar-track { flex: 1; height: 8px; background: #e8ecf2; border-radius: 4px; overflow: hidden; }
  .pp-sb-bar-fill { height: 100%; background: #4a6080; border-radius: 4px; transition: width 0.4s; }
  .pp-sb-pct { width: 36px; font-size: 12px; color: var(--muted); text-align: right; }

  .pp-review-list { display: flex; flex-direction: column; gap: 18px; }
  .pp-review-item { padding-bottom: 18px; border-bottom: 1px solid var(--border); }
  .pp-review-item:last-child { border-bottom: none; padding-bottom: 0; }
  .pp-ri-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
  .pp-ri-avatar { width: 36px; height: 36px; border-radius: 50%; background: #f0f2f5; color: var(--text); border: 1px solid var(--border); font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .pp-ri-meta { flex: 1; }
  .pp-ri-name { font-size: 14px; font-weight: 700; color: var(--text); display: block; }
  .pp-ri-job { font-size: 12px; color: var(--muted); display: block; margin-top: 1px; }
  .pp-ri-ago { font-size: 12px; color: #8fa3b5; display: block; margin-top: 2px; }
  .pp-ri-comment { font-size: 14px; color: #3a4d60; line-height: 1.6; }
  .pp-ri-reply { background: #f5f6f8; border-left: 3px solid var(--border2); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; padding: 10px 14px; margin-top: 10px; font-size: 13px; color: #3a4d60; line-height: 1.5; }
  .pp-reply-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); display: block; margin-bottom: 4px; }

  .pp-job-history-list { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }
  .pp-jh-item { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 12px 14px; background: var(--card-2); border: 1px solid var(--border); border-radius: var(--radius-sm); }
  .pp-jh-left { flex: 1; }
  .pp-jh-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }

  .pp-sidebar-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 18px; box-shadow: var(--shadow-sm); }
  .pp-sidebar-head { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; color: var(--muted); margin-bottom: 12px; }

  .pp-verify-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .pp-verify-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }
  .pp-verify-item.done { color: var(--text); }
  .pp-vi-icon { flex-shrink: 0; color: #c5cdd8; }
  .pp-vi-icon.done { color: #4a6080; }

  .pp-reliability { display: flex; flex-direction: column; gap: 8px; }
  .pp-rel-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
  .pp-rel-label { color: var(--muted); }
  .pp-rel-val { font-weight: 700; color: var(--text); }

  .pp-cat-list { list-style: none; display: flex; flex-direction: column; gap: 7px; }
  .pp-cat-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
  .pp-cat-name { color: var(--text); font-weight: 500; }
  .pp-cat-count { font-size: 12px; color: var(--muted); background: var(--card-2); border: 1px solid var(--border); border-radius: 10px; padding: 1px 8px; }

  .pp-avail-grid { margin-bottom: 8px; }
  .pp-avail-grid-lg .pp-avail-cell { height: 24px; border-radius: 4px; }
  .pp-avail-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; margin-bottom: 4px; }
  .pp-avail-day { text-align: center; font-size: 10px; font-weight: 700; color: var(--muted); }
  .pp-avail-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; margin-bottom: 3px; }
  .pp-avail-cell { height: 18px; border-radius: 3px; display: inline-block; }
  .pp-avail-cell.available { background: #c6f0d4; }
  .pp-avail-cell.partial { background: #fce8b2; }
  .pp-avail-cell.off { background: #e8ecf2; }
  .pp-avail-legend { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--muted); flex-wrap: wrap; margin-top: 6px; }
  .pp-avail-legend .pp-avail-cell { width: 14px; flex-shrink: 0; }

  .pp-empty { font-size: 14px; color: var(--muted); padding: 10px 0; }
  .pp-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 80px 20px; color: var(--muted); font-size: 14px; }
  .pp-loading-spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: pp-spin 0.8s linear infinite; }
  @keyframes pp-spin { to { transform: rotate(360deg); } }

  @media (max-width: 860px) {
    .pp-layout { grid-template-columns: 1fr; }
    .pp-sidebar { order: -1; }
    .pp-stats-row { grid-template-columns: repeat(2, 1fr); }
    .pp-stat:nth-child(2) { border-right: none; }
    .pp-hero-top { flex-direction: column; }
    .pp-hero-actions { flex-direction: row; }
  }
  @media (max-width: 500px) {
    .pp-stats-row { grid-template-columns: repeat(2, 1fr); }
    .pp-hero-name { font-size: 18px; }
  }
`

export default styles
