import React from "react";
import "./landingPage.css";

function LandingPage() {
  const handleGetStarted = () => {
    window.location.href = "http://localhost:8000/login";
  };

  return (
    <div className="landing-fullscreen">

      {/* ── BACKGROUND LAYERS ─────────────────────────────── */}
      <div className="bg-mesh" aria-hidden="true" />
      <div className="bg-orb orb-tl" aria-hidden="true" />
      <div className="bg-orb orb-br" aria-hidden="true" />
      <div className="bg-grid"       aria-hidden="true" />

      {/* ── NAVBAR ────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-logo">
          <div className="lp-logo-icon">💳</div>
          <span className="lp-logo-text">Mywallet</span>
        </div>
        <div className="lp-nav-links">
          <a href="#">Features</a>
          <a href="#">Security</a>
          <a href="#">Pricing</a>
        </div>
        <button className="lp-nav-btn" onClick={handleGetStarted}>Sign In →</button>
      </nav>

      {/* ── HERO CONTENT ──────────────────────────────────── */}
      <div className="landing-content">

        {/* LEFT — Copy */}
        <div className="landing-left">

          <div className="lp-eyebrow">
            <span className="eyebrow-pulse" />
            Trusted by 50,000+ users worldwide
          </div>

          <h1 className="landing-title">
            Mywallet
            <span className="title-line">.</span>
          </h1>

          <h2 className="landing-subtitle">A personal Wallet Platform</h2>

          <p className="landing-description">
            BankDash is a secure and modern digital wallet platform
            that helps users manage transactions, monitor finances,
            and access role-based dashboards seamlessly.
          </p>

          {/* Feature pills */}
          <div className="lp-pills">
            <div className="lp-pill">🔒 End-to-end encrypted</div>
            <div className="lp-pill">⚡ Real-time sync</div>
            <div className="lp-pill">🛡️ Role-based access</div>
          </div>

        <div className="lp-actions">
  <button className="get-started-btn" onClick={handleGetStarted}>
    Get Started
    <span className="btn-arrow">→</span>
  </button>

  <button 
    className="lp-ghost-btn" 
    onClick={() => window.open('https://youtu.be/iuJDhFRDx9M?si=DFj4U2PtrxvJHCBC', '_blank', 'noopener,noreferrer')}
  >
    Watch demo ▶
  </button>
</div>

          {/* Stats row */}
          <div className="lp-stats">
            {[
              { val: "50K+", label: "Active Users" },
              { val: "99.9%", label: "Uptime" },
              { val: "3 Roles", label: "Access Levels" },
            ].map(({ val, label }) => (
              <div key={label} className="lp-stat">
                <span className="lp-stat-val">{val}</span>
                <span className="lp-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — CSS Art */}
        <div className="landing-right">
          <div className="art-canvas">

            {/* ── FLOATING DASHBOARD CARD (behind phone) ── */}
            <div className="float-card card-balance">
              <div className="fc-label">Total Balance</div>
              <div className="fc-value">$24,830.50</div>
              <div className="fc-bar-row">
                <div className="fc-bar" style={{ width: "65%", background: "#a78bfa" }} />
                <div className="fc-bar" style={{ width: "30%", background: "#60a5fa" }} />
              </div>
              <div className="fc-meta">
                <span style={{ color: "#86efac" }}>↑ +12% this month</span>
              </div>
            </div>

            {/* ── PHONE ──────────────────────────────────── */}
            <div className="css-phone">
              {/* Notch */}
              <div className="phone-notch" />
              <div className="phone-screen">

                {/* App header bar */}
                <div className="phone-topbar">
                  <div className="pt-greeting">Good morning 👋</div>
                  <div className="pt-av">BR</div>
                </div>

                {/* Balance card inside phone */}
                <div className="phone-balance-card">
                  <div className="pbc-label">Available Balance</div>
                  <div className="pbc-amount">$4,250.00</div>
                  <div className="pbc-card-num">•••• •••• •••• 4291</div>
                </div>

                {/* Quick action icons */}
                <div className="phone-actions">
                  {[["💸","Send"],["📥","Recv"],["🔄","Swap"],["📊","Stats"]].map(([ic, lbl]) => (
                    <div key={lbl} className="phone-action-btn">
                      <div className="pab-icon">{ic}</div>
                      <div className="pab-label">{lbl}</div>
                    </div>
                  ))}
                </div>

                {/* Recent transactions */}
                <div className="phone-section-title">Recent</div>
                {[
                  { icon: "🛍️", name: "Amazon",  amt: "-$89",  col: "#f87171" },
                  { icon: "💰", name: "Salary",  amt: "+$3.2K", col: "#86efac" },
                  { icon: "🎵", name: "Spotify", amt: "-$9.99", col: "#f87171" },
                ].map(({ icon, name, amt, col }) => (
                  <div key={name} className="phone-tx-row">
                    <div className="ptx-icon">{icon}</div>
                    <div className="ptx-name">{name}</div>
                    <div className="ptx-amt" style={{ color: col }}>{amt}</div>
                  </div>
                ))}

                {/* Mock login button at bottom */}
                <div className="phone-login-btn">Sign in with Keycloak</div>
              </div>
            </div>

            {/* ── NOTIFICATION TOAST ─────────────────────── */}
            <div className="float-card card-notif">
              <div className="notif-icon">✅</div>
              <div>
                <div className="notif-title">Payment Sent</div>
                <div className="notif-sub">$240.00 to James Lee</div>
              </div>
            </div>

            {/* ── SHIELD SVG ─────────────────────────────── */}
            <div className="css-shield">
              <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* glow filter */}
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <path d="M60 5 L10 25 V65 C10 95 35 120 60 135 C85 120 110 95 110 65 V25 L60 5 Z"
                      fill="#7c6ee6" stroke="#a78bfa" strokeWidth="2.5" filter="url(#glow)" opacity="0.95"/>
                <path d="M60 18 L22 33 V65 C22 90 40 110 60 122 C80 110 98 90 98 65 V33 L60 18 Z"
                      fill="rgba(167,139,250,0.2)"/>
                <path d="M35 70 L50 85 L85 48" stroke="white" strokeWidth="7"
                      strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
              </svg>
            </div>

            {/* ── PERSON (improved) ──────────────────────── */}
            <div className="css-person">
              <div className="chair-legs">
                <div className="leg-front"></div>
                <div className="leg-back"></div>
              </div>
              <div className="chair-seat"></div>
              <div className="chair-back"></div>

              <div className="person-legs">
                <div className="pant-leg left-leg"></div>
                <div className="pant-leg right-leg"></div>
                <div className="shoe left-shoe"></div>
                <div className="shoe right-shoe"></div>
              </div>

              <div className="person-torso">
                <div className="shirt-body"></div>
                <div className="shirt-arm"></div>
              </div>

              <div className="person-head">
                <div className="face"></div>
                <div className="hair"></div>
              </div>

              <div className="laptop">
                <div className="laptop-screen">
                  {/* mini chart lines on laptop */}
                  <div className="laptop-ui">
                    <div className="lu-bar" style={{ height: 12, background: "#a78bfa" }} />
                    <div className="lu-bar" style={{ height: 20, background: "#818cf8" }} />
                    <div className="lu-bar" style={{ height: 16, background: "#a78bfa" }} />
                    <div className="lu-bar" style={{ height: 24, background: "#60a5fa" }} />
                    <div className="lu-bar" style={{ height: 18, background: "#818cf8" }} />
                  </div>
                </div>
                <div className="laptop-base"></div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── BOTTOM FLOOR ──────────────────────────────────── */}
      <div className="landing-floor" />
    </div>
  );
}

export default LandingPage;