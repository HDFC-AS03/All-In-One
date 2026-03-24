import React, { useEffect, useState, useRef } from "react";
import { getCurrentUser, logout } from "../api/auth";
import "./dashboard.css";
// IMPORT the refactored UserManagement component
import UserManagement from "./UserManagement";

// ─── ROLE DETECTION ───────────────────────────────────────────────────────────
function detectRole(user) {
  const email = user?.email?.toLowerCase() || "";
  const username = user?.preferred_username?.toLowerCase() || "";
  const roles = user?.roles || [];

  if (
    roles.includes("admin") ||
    email.includes("admin") ||
    username === "admin"
  )
    return "admin";
  if (
    roles.includes("manager") ||
    email.includes("manager") ||
    username === "manager"
  )
    return "manager";
  return "user";
}

// ─── SIDEBAR CONFIG ───────────────────────────────────────────────────────────
const SIDEBAR_CONFIG = {
  admin: {
    brand: "Mywallet. Admin",
    accentVar: "--admin-accent",
    navItems: [
      { icon: "⊞", label: "System Overview" },
      { icon: "👥", label: "User Management" },
      { icon: "👤", label: "Account", route: "/account" },
      {
        icon: "🛠️",
        label: "Admin Console",
        route: "/admin/console",
        adminOnly: true,
      },
      { icon: "🔐", label: "Security Logs" },
      { icon: "⚙️", label: "API Settings" },
      { icon: "📊", label: "Audit Trail" },
      { icon: "🛠️", label: "Configuration" },
    ],
  },
  manager: {
    brand: "Mywallet. Manager",
    accentVar: "--mgr-accent",
    navItems: [
      { icon: "⊞", label: "Overview" },
      { icon: "👤", label: "Account", route: "/account" },
      { icon: "📩", label: "Inbox" },
      { icon: "👤", label: "Accounts" },
      { icon: "📄", label: "Invoices" },
      { icon: "📈", label: "Planning" },
      { icon: "⚙️", label: "Settings" },
    ],
  },
  user: {
    brand: "Mywallet. User",
    accentVar: "--user-accent",
    navItems: [
      { icon: "⊞", label: "Wallet" },
      { icon: "👤", label: "Account", route: "/account" },
      { icon: "🔄", label: "Transactions" },
      { icon: "💳", label: "Cards" },
      { icon: "🏦", label: "Savings" },
      { icon: "💬", label: "Support" },
    ],
  },
};

// ─── CHART HELPERS ────────────────────────────────────────────────────────────
function BarChart({ bars, color }) {
  const max = Math.max(...bars);
  return (
    <div className="bar-chart">
      {bars.map((v, i) => (
        <div key={i} className="bar-col">
          <div
            className="bar-fill"
            style={{
              height: `${(v / max) * 100}%`,
              background: color,
              animationDelay: `${i * 60}ms`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div className="progress-track">
      <div
        className="progress-fill"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 1: ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function AdminView({ user }) {
  const auditLogs = [
    {
      icon: "🔑",
      ev: "Admin login",
      actor: user?.preferred_username || "admin",
      time: "Just now",
      col: "#10b981",
    },
    {
      icon: "🛡️",
      ev: "Role updated",
      actor: "system",
      time: "5 min ago",
      col: "#f97316",
    },
    {
      icon: "🚫",
      ev: "Failed login",
      actor: "unknown",
      time: "12 min",
      col: "#ef4444",
    },
    {
      icon: "📤",
      ev: "Data export",
      actor: "manager01",
      time: "1h ago",
      col: "#6366f1",
    },
    {
      icon: "💾",
      ev: "Backup created",
      actor: "system",
      time: "3h ago",
      col: "#10b981",
    },
  ];
  const trafficBars = [38, 52, 45, 68, 72, 65, 80, 77, 90, 85, 95, 92];

  return (
    <>
      <div className="admin-status-strip">
        {[
          { label: "System Status", val: "🟢 Operational" },
          { label: "Active Sessions", val: "384" },
          { label: "DB Uptime", val: "99.9%" },
          { label: "Last Backup", val: "3h ago" },
          { label: "Pending Alerts", val: "3 Critical", alert: true },
        ].map(({ label, val, alert }) => (
          <div key={label} className="strip-item">
            <span className="strip-label">{label}</span>
            <span className={`strip-val ${alert ? "strip-alert" : ""}`}>
              {val}
            </span>
          </div>
        ))}
      </div>

      <div className="kpi-row four-col">
        {[
          {
            label: "Total Users",
            val: "14,203",
            trend: "+8%",
            up: true,
            icon: "👤",
          },
          {
            label: "Active Sessions",
            val: "384",
            trend: "+15%",
            up: true,
            icon: "⚡",
          },
          {
            label: "Failed Logins",
            val: "23",
            trend: "-41%",
            up: true,
            icon: "🚫",
          },
          {
            label: "Audit Events",
            val: "1,204",
            trend: "+2%",
            up: false,
            icon: "📋",
          },
        ].map((k, i) => (
          <div
            key={i}
            className="kpi-card admin-kpi"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="kpi-top">
              <div className="kpi-icon-box admin-icon-box">{k.icon}</div>
              <div className={`kpi-badge ${k.up ? "badge-up" : "badge-down"}`}>
                {k.trend}
              </div>
            </div>
            <div className="kpi-val">{k.val}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="mid-row">
        <div className="card flex-2">
          <div className="card-head">
            <h3>System Traffic</h3>
            <div className="period-tabs">
              {["24h", "7d", "30d"].map((p, i) => (
                <span
                  key={p}
                  className={`period-tab ${i === 0 ? "active-tab admin-tab" : ""}`}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="chart-row">
            <BarChart bars={trafficBars} color="var(--admin-accent)" />
            <div className="chart-side-legend">
              {[
                ["🌐", "Web", "8,432"],
                ["📱", "Mobile", "4,210"],
                ["🔌", "API", "1,561"],
              ].map(([ic, l, v]) => (
                <div key={l} className="legend-row">
                  <span>{ic}</span>
                  <div>
                    <div className="legend-label">{l}</div>
                    <div className="legend-val">{v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card flex-1">
          <div className="card-head">
            <h3>System Health</h3>
          </div>
          {[
            { label: "CPU Usage", val: 34, color: "var(--admin-accent)" },
            { label: "Memory", val: 61, color: "#f97316" },
            { label: "Disk", val: 48, color: "#10b981" },
            { label: "Network I/O", val: 72, color: "#6366f1" },
          ].map((m) => (
            <div key={m.label} className="health-row">
              <div className="health-label-row">
                <span className="health-label">{m.label}</span>
                <span className="health-pct" style={{ color: m.color }}>
                  {m.val}%
                </span>
              </div>
              <ProgressBar value={m.val} color={m.color} />
            </div>
          ))}
        </div>
      </div>

      <div className="bot-row">
        <div className="card flex-2">
          <div className="card-head">
            <h3>Recent Activity</h3>
            <button className="add-btn admin-add-btn">View Full Log</button>
          </div>
          <div className="user-table">
            <div className="table-head">
              {["User", "Role", "Status", "Last Login", ""].map((h) => (
                <span key={h} className="th">
                  {h}
                </span>
              ))}
            </div>
            {[
              {
                name: "Alice Chen",
                email: "alice@bank.io",
                role: "User",
                status: "Active",
                last: "2 min ago",
                av: "AC",
              },
              {
                name: "Bob Reyes",
                email: "bob@bank.io",
                role: "Manager",
                status: "Active",
                last: "14 min ago",
                av: "BR",
              },
              {
                name: "David Kim",
                email: "david@bank.io",
                role: "User",
                status: "Suspended",
                last: "2 days ago",
                av: "DK",
              },
              {
                name: "Emeka Osei",
                email: "emeka@bank.io",
                role: "Analyst",
                status: "Active",
                last: "1h ago",
                av: "EO",
              },
            ].map((u, i) => (
              <div key={i} className="table-row">
                <div className="td user-cell">
                  <div className="mini-av admin-av">{u.av}</div>
                  <div>
                    <div className="cell-name">{u.name}</div>
                    <div className="cell-sub">{u.email}</div>
                  </div>
                </div>
                <div className="td">
                  <span className="role-chip">{u.role}</span>
                </div>
                <div className="td">
                  <span
                    className={`status-chip ${u.status === "Active" ? "chip-green" : "chip-red"}`}
                  >
                    {u.status}
                  </span>
                </div>
                <div className="td cell-sub">{u.last}</div>
                <div className="td action-cell">
                  {["✏️", "🗑️"].map((ic) => (
                    <button key={ic} className="action-btn">
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card flex-1">
          <div className="card-head">
            <h3>Audit Log</h3>
          </div>
          <div className="audit-list">
            {auditLogs.map((e, i) => (
              <div key={i} className="audit-row">
                <div
                  className="audit-icon-box"
                  style={{ background: `${e.col}18` }}
                >
                  <span>{e.icon}</span>
                </div>
                <div className="audit-text">
                  <div className="audit-ev">{e.ev}</div>
                  <div className="audit-actor">by {e.actor}</div>
                </div>
                <div className="audit-time">{e.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 2: MANAGER DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function ManagerView({ user }) {
  const recentInvoices = [
    {
      id: "#INV-2024",
      client: "TechCorp Ltd",
      amount: "$4,200",
      status: "Paid",
      date: "Today",
      av: "TC",
    },
    {
      id: "#INV-2025",
      client: "Designify",
      amount: "$1,850",
      status: "Pending",
      date: "Yesterday",
      av: "DE",
    },
    {
      id: "#INV-2026",
      client: "Global Sols",
      amount: "$9,500",
      status: "Overdue",
      date: "Feb 14",
      av: "GS",
    },
    {
      id: "#INV-2027",
      client: "Flora Systems",
      amount: "$3,120",
      status: "Paid",
      date: "Feb 12",
      av: "FS",
    },
  ];
  const teamPerformance = [65, 59, 80, 81, 56, 55, 40, 70, 75, 68, 85, 90];

  // NEW DUMMY DATA FOR MANAGER
  const topClients = [
    { name: "TechCorp Ltd", val: "$45k", sub: "12 Projects", col: "#6366f1" },
    { name: "Global Sols", val: "$28k", sub: "5 Projects", col: "#8b5cf6" },
    { name: "Designify", val: "$12k", sub: "Retainer", col: "#ec4899" },
  ];

  return (
    <>
      {/* 1. Manager KPIs (Status Strip Removed) */}
      <div className="kpi-row four-col">
        {[
          {
            label: "Total Revenue",
            val: "$124,500",
            trend: "+12%",
            up: true,
            icon: "💰",
          },
          {
            label: "Pending Exp.",
            val: "$3,200",
            trend: "-5%",
            up: true,
            icon: "📄",
          },
          {
            label: "Client NPS",
            val: "78.4",
            trend: "+2.1",
            up: true,
            icon: "😊",
          },
          {
            label: "Critical Issues",
            val: "2 Open",
            trend: "+1",
            up: false,
            icon: "⚠️",
          },
        ].map((k, i) => (
          <div
            key={i}
            className="kpi-card"
            style={{
              animationDelay: `${i * 80}ms`,
              borderTop: "3px solid var(--mgr-accent)",
            }}
          >
            <div className="kpi-top">
              <div
                className="kpi-icon-box"
                style={{
                  background: "var(--bg-glass)",
                  color: "var(--mgr-accent)",
                }}
              >
                {k.icon}
              </div>
              <div className={`kpi-badge ${k.up ? "badge-up" : "badge-down"}`}>
                {k.trend}
              </div>
            </div>
            <div className="kpi-val">{k.val}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="mid-row">
        {/* 2. Financial/Planning Chart */}
        <div className="card flex-2">
          <div className="card-head">
            <h3>Revenue & Planning</h3>
            <button className="icon-btn">📅 This Month</button>
          </div>
          <div className="chart-row">
            <BarChart bars={teamPerformance} color="var(--mgr-accent)" />
            <div className="chart-info-box">
              <div className="stat-group">
                <h4>$18.4k</h4>
                <span>Proj. Earnings</span>
              </div>
              <div className="stat-group">
                <h4>82%</h4>
                <span>Goal Reached</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Team List */}
        <div className="card flex-1">
          <div className="card-head">
            <h3>My Team</h3>
          </div>
          <div className="audit-list">
            {[
              {
                name: "Sarah Jenkins",
                role: "Senior Dev",
                status: "Online",
                col: "#10b981",
              },
              {
                name: "Mike Ross",
                role: "Designer",
                status: "Away",
                col: "#f59e0b",
              },
              {
                name: "Rachel Green",
                role: "Product",
                status: "Busy",
                col: "var(--mgr-accent)",
              },
            ].map((m, i) => (
              <div key={i} className="audit-row">
                <div
                  className="mini-av"
                  style={{ background: m.col, color: "#fff", fontSize: "10px" }}
                >
                  {m.name.substring(0, 1)}
                </div>
                <div className="audit-text">
                  <div className="audit-ev">{m.name}</div>
                  <div className="audit-actor">{m.role}</div>
                </div>
                <div className="status-dot" style={{ background: m.col }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Invoices & Top Clients */}
      <div className="bot-row">
        <div className="card flex-2">
          <div className="card-head">
            <h3>Recent Invoices</h3>
            <button
              className="add-btn"
              style={{ background: "var(--mgr-accent)" }}
            >
              + New Invoice
            </button>
          </div>
          <div className="user-table">
            <div className="table-head">
              <span className="th">Invoice ID</span>
              <span className="th">Client</span>
              <span className="th">Date</span>
              <span className="th">Amount</span>
              <span className="th">Status</span>
            </div>
            {recentInvoices.map((inv, i) => (
              <div key={i} className="table-row">
                <div className="td">
                  <b>{inv.id}</b>
                </div>
                <div className="td user-cell">
                  <div
                    className="mini-av"
                    style={{ background: "#e2e8f0", color: "#475569" }}
                  >
                    {inv.av}
                  </div>
                  <span>{inv.client}</span>
                </div>
                <div className="td cell-sub">{inv.date}</div>
                <div className="td">{inv.amount}</div>
                <div className="td">
                  <span
                    className={`status-chip ${inv.status === "Paid" ? "chip-green" : inv.status === "Pending" ? "chip-orange" : "chip-red"}`}
                  >
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clients */}
        <div className="card flex-1">
          <div className="card-head">
            <h3>Top Clients</h3>
          </div>
          <div className="audit-list">
            {topClients.map((c, i) => (
              <div key={i} className="audit-row">
                <div
                  className="mini-av"
                  style={{ background: c.col, color: "#fff", fontSize: "10px" }}
                >
                  {c.name.substring(0, 1)}
                </div>
                <div className="audit-text">
                  <div className="audit-ev">{c.name}</div>
                  <div className="audit-actor">{c.sub}</div>
                </div>
                <div style={{ fontWeight: "600" }}>{c.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 3: USER DASHBOARD (COMPLETED)
// ═══════════════════════════════════════════════════════════════════════════════
function UserView({ user }) {
  const transactions = [
    {
      title: "Netflix Subscription",
      sub: "Entertainment",
      amt: "-$14.99",
      date: "Today",
      icon: "🎬",
    },
    {
      title: "Salary Deposit",
      sub: "TechCorp Inc.",
      amt: "+$3,200",
      date: "Feb 28",
      icon: "💰",
    },
    {
      title: "Grocery Market",
      sub: "Food & Drink",
      amt: "-$64.20",
      date: "Feb 26",
      icon: "🛒",
    },
    {
      title: "Uber Ride",
      sub: "Transport",
      amt: "-$12.50",
      date: "Feb 25",
      icon: "🚗",
    },
    {
      title: "Spotify Premium",
      sub: "Entertainment",
      amt: "-$9.99",
      date: "Feb 24",
      icon: "🎧",
    },
  ];
  const spendingHistory = [30, 45, 32, 60, 40, 55, 30, 25, 40, 35, 20, 50];

  // NEW DUMMY DATA FOR UPCOMING PAYMENTS
  const upcomingBills = [
    {
      title: "Internet Fiber",
      due: "Due in 2 days",
      amt: "$45.00",
      icon: "🌐",
      status: "Unpaid",
    },
    {
      title: "Car Insurance",
      due: "Due in 5 days",
      amt: "$120.00",
      icon: "🛡️",
      status: "Auto-pay",
    },
    {
      title: "Adobe Cloud",
      due: "Mar 05",
      amt: "$52.99",
      icon: "☁️",
      status: "Pending",
    },
    {
      title: "Gym Membership",
      due: "Mar 08",
      amt: "$35.00",
      icon: "🏋️",
      status: "Pending",
    },
  ];

  return (
    <>
      {/* 1. Wallet Cards */}
      <div className="kpi-row three-col">
        <div
          className="kpi-card"
          style={{ borderTop: "3px solid var(--user-accent)" }}
        >
          <div className="kpi-top">
            <div
              className="kpi-icon-box"
              style={{ background: "#e0f2fe", color: "var(--user-accent)" }}
            >
              💳
            </div>
            <div className="kpi-badge badge-up">+2%</div>
          </div>
          <div className="kpi-val">$2,450.00</div>
          <div className="kpi-label">Available Balance</div>
        </div>
        <div className="kpi-card" style={{ borderTop: "3px solid #f59e0b" }}>
          <div className="kpi-top">
            <div
              className="kpi-icon-box"
              style={{ background: "#fef3c7", color: "#f59e0b" }}
            >
              📉
            </div>
            <div className="kpi-badge badge-down">-5%</div>
          </div>
          <div className="kpi-val">$840.50</div>
          <div className="kpi-label">Monthly Spending</div>
        </div>
        <div className="kpi-card" style={{ borderTop: "3px solid #10b981" }}>
          <div className="kpi-top">
            <div
              className="kpi-icon-box"
              style={{ background: "#d1fae5", color: "#10b981" }}
            >
              🏦
            </div>
            <div className="kpi-badge badge-up">+12%</div>
          </div>
          <div className="kpi-val">$12,050.00</div>
          <div className="kpi-label">Total Savings</div>
        </div>
      </div>

      <div className="mid-row">
        {/* 2. Spending Analysis */}
        <div className="card flex-2">
          <div className="card-head">
            <h3>Spending Analysis</h3>
            <button className="icon-btn">Last 30 Days</button>
          </div>
          <div className="chart-row">
            <BarChart bars={spendingHistory} color="var(--user-accent)" />
            <div className="chart-side-legend">
              <div className="legend-row">
                <span>🛍️</span>
                <div>
                  <div className="legend-label">Shopping</div>
                  <div className="legend-val">45%</div>
                </div>
              </div>
              <div className="legend-row">
                <span>🍔</span>
                <div>
                  <div className="legend-label">Food</div>
                  <div className="legend-val">30%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Quick Actions */}
        <div
          className="card flex-1"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          <div className="card-head">
            <h3>Quick Actions</h3>
          </div>
          <button
            className="add-btn"
            style={{ width: "100%", background: "var(--user-accent)" }}
          >
            💸 Send Money
          </button>
          <button
            className="add-btn"
            style={{
              width: "100%",
              background: "#fff",
              border: "1px solid #ddd",
              color: "#333",
            }}
          >
            ➕ Top Up Wallet
          </button>
          <button
            className="add-btn"
            style={{
              width: "100%",
              background: "#fff",
              border: "1px solid #ddd",
              color: "#333",
            }}
          >
            🔒 Freeze Card
          </button>
        </div>
      </div>

      {/* 4. Transactions & Upcoming Bills */}
      <div className="bot-row">
        <div className="card flex-2">
          <div className="card-head">
            <h3>Recent Transactions</h3>
          </div>
          <div className="audit-list">
            {transactions.map((t, i) => (
              <div key={i} className="audit-row">
                <div
                  className="audit-icon-box"
                  style={{ background: "#f1f5f9" }}
                >
                  {t.icon}
                </div>
                <div className="audit-text">
                  <div className="audit-ev">{t.title}</div>
                  <div className="audit-actor">{t.sub}</div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div
                    style={{
                      fontWeight: "700",
                      color: t.amt.startsWith("+") ? "#10b981" : "#333",
                    }}
                  >
                    {t.amt}
                  </div>
                  <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                    {t.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Bills */}
        <div className="card flex-1">
          <div className="card-head">
            <h3>Upcoming Bills</h3>
            <button className="icon-btn" style={{ fontSize: "10px" }}>
              View All
            </button>
          </div>
          <div className="audit-list">
            {upcomingBills.map((b, i) => (
              <div key={i} className="audit-row">
                <div
                  className="audit-icon-box"
                  style={{ background: "#fff5e9", color: "#f97316" }}
                >
                  {b.icon}
                </div>
                <div className="audit-text">
                  <div className="audit-ev">{b.title}</div>
                  <div
                    className="audit-actor"
                    style={{
                      color: b.status === "Unpaid" ? "#ef4444" : "#64748b",
                    }}
                  >
                    {b.due}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: "600" }}>{b.amt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// IDENTITY SIDEBAR CARD
// ═══════════════════════════════════════════════════════════════════════════════
function IdentityCard({ user, roleType }) {
  return (
    <div className="identity-panel">
      <div className="card identity-card">
        <h3>Identity & Access</h3>
        <div
          className="identity-avatar"
          style={{
            background: `var(--${roleType === "admin" ? "admin" : roleType === "manager" ? "mgr" : "user"}-accent)`,
          }}
        >
          {(user?.preferred_username || "U").substring(0, 2).toUpperCase()}
        </div>
        <div className="identity-name">
          {user?.name || user?.preferred_username || "User"}
        </div>
        <div className="identity-email">{user?.email || "user@auth.com"}</div>
        <div className="identity-fields">
          <div className="id-field">
            <span className="id-field-label">Username</span>
            <span className="id-field-val">
              {user?.preferred_username || "—"}
            </span>
          </div>
          <div className="id-field">
            <span className="id-field-label">Email</span>
            <span className="id-field-val" style={{ wordBreak: "break-all" }}>
              {user?.email || "—"}
            </span>
          </div>
        </div>
        <div className="role-section">
          {(user?.roles?.length > 0 ? user.roles : ["default-role"]).map(
            (r, i) => (
              <div key={i} className="role-tag">
                <span>🛡️</span> {r}
              </div>
            ),
          )}
        </div>
      </div>

      <div className="card status-card">
        {[
          {
            icon: "👤",
            bg: "#e7ffeb",
            col: "#10b981",
            title: "Online",
            sub: "Active Status",
          },
          {
            icon: "🕒",
            bg: "#fff5e9",
            col: "#ffbb38",
            title: "Session",
            sub: "Token Active",
          },
          {
            icon: "🔒",
            bg: "#f0f4ff",
            col: "#6366f1",
            title: "Protected",
            sub: `${roleType} privileges`,
          },
        ].map(({ icon, bg, col, title, sub }) => (
          <div key={title} className="status-row">
            <div
              className="status-icon-box"
              style={{ background: bg, color: col }}
            >
              {icon}
            </div>
            <div>
              <div className="status-title">{title}</div>
              <div className="status-sub">{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("System Overview");
  const [timeLeft, setTimeLeft] = useState(null);
  const profileRef = useRef(null);

  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        const u = data?.data || data;
        setUser(u);
        setIsLoading(false);
        if (u?.exp) {
          const remaining = u.exp - Math.floor(Date.now() / 1000);
          setTimeLeft(remaining > 0 ? remaining : 0);
        }
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Countdown tick
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      logout();
      return;
    }
    const iv = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(iv);
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [timeLeft]);

  // Refresh token at 30s remaining
  useEffect(() => {
    if (timeLeft !== 30) return;

    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1];

    fetch("http://localhost/refresh", {
      // ← gateway port 80, not 8000
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRF-Token": csrfToken || "", // ← required by your backend
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => getCurrentUser())
      .then((data) => {
        const u = data?.data || data;
        setUser(u);
        if (u?.exp) {
          const remaining = u.exp - Math.floor(Date.now() / 1000);
          setTimeLeft(remaining > 0 ? remaining : 0);
        }
      })
      .catch(() => logout());
  }, [timeLeft]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-screen">
        <div className="error-card">
          <h2>Not authenticated</h2>
          <p>Please log in via Keycloak to continue.</p>
        </div>
      </div>
    );
  }

  const roleType = detectRole(user);
  const cfg = SIDEBAR_CONFIG[roleType];

  const pageTitle = {
    admin: "Administrator Console",
    manager: "Manager's Dashboard",
    user: "User Dashboard",
  }[roleType];

  const initials = (user?.preferred_username || user?.name || "U")
    .substring(0, 2)
    .toUpperCase();

  // ─── MAIN CONTENT RENDER LOGIC ──────────────────────────────────────────────
  const renderContent = () => {
    // 1. Check if User Management is active
    if (activeNav === "User Management") {
      return <UserManagement />;
    }
    // 2. Fallback to Role-based Views
    if (roleType === "admin") return <AdminView user={user} />;
    if (roleType === "manager") return <ManagerView user={user} />;
    if (roleType === "user") return <UserView user={user} />;
    return <div>Role not recognized</div>;
  };

  return (
    <div className={`layout role-${roleType}`}>
      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="brand">{cfg.brand}</div>

        <nav className="nav-menu">
          {cfg.navItems.map(({ icon, label, route, adminOnly }) => {
            if (adminOnly && roleType !== "admin") return null;

            return (
              <a
                key={label}
                href="#"
                onClick={(e) => {
                  e.preventDefault();

                  if (route) {
                    window.open(`http://localhost${route}`, "_blank");
                    return;
                  }

                  setActiveNav(label);
                }}
                className={`nav-item ${activeNav === label ? "nav-active" : ""}`}
              >
                <span className="nav-icon">{icon}</span>
                {label}
              </a>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-chip">
            <div className="sidebar-av">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-username">
                {user?.preferred_username || "User"}
              </div>
              <div className="sidebar-role">{roleType}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────── */}
      <div className="main-wrap">
        {/* Header */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">
              {activeNav === "User Management" ? "User Management" : pageTitle}
            </h1>

            {/* UPDATED: Timer now shows for ALL roles (removed role check) */}
            {timeLeft !== null &&
              (() => {
                const mins = Math.floor(timeLeft / 60);
                const secs = timeLeft % 60;
                const isUrgent = timeLeft <= 30;
                const isLow = timeLeft <= 120;
                return (
                  <div
                    className={`session-timer ${isUrgent ? "timer-urgent" : isLow ? "timer-low" : "timer-ok"}`}
                  >
                    <span className="timer-icon">⏱</span>
                    <span className="timer-text">
                      {mins}m {String(secs).padStart(2, "0")}s
                    </span>
                    <span className="timer-label">session</span>
                  </div>
                );
              })()}
          </div>

          <div className="topbar-right">
            <div className="search-box">
              <span>🔍</span>
              <input type="text" placeholder="Search for something" />
            </div>

            <button className="icon-circle-btn">⚙️</button>
            <button className="icon-circle-btn notif-btn">
              🔔
              <span className="notif-dot" />
            </button>

            {/* Profile dropdown */}
            <div className="profile-wrap" ref={profileRef}>
              <button
                className="avatar-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
              >
                <div className="avatar-circle">{initials}</div>
              </button>

              {profileOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-user">
                    <div className="dropdown-av">{initials}</div>
                    <div>
                      <div className="dropdown-name">
                        {user?.name || user?.preferred_username || "User"}
                      </div>
                      <div className="dropdown-email">
                        {user?.email || "user@auth.com"}
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-role-pill">{roleType}</div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-logout" onClick={logout}>
                    🚪 Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="content-area">
          <div className="content-main">{renderContent()}</div>

          <IdentityCard user={user} roleType={roleType} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
