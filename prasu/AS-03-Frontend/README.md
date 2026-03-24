# 🚀 Plug Auth Client (Frontend)

This is the frontend application for the Plug Auth system.

Built using: - ⚛️ React - ⚡ Vite - 🔐 Keycloak (via FastAPI backend) -
🌐 REST API integration

------------------------------------------------------------------------

# 📌 Project Overview

This frontend application:

-   Displays Landing Page
-   Redirects user to Keycloak login
-   Receives authentication via backend session
-   Fetches authenticated user details from backend
-   Displays role-based dashboard

Authentication is handled by the backend (FastAPI). The frontend only
consumes secured endpoints.

------------------------------------------------------------------------

# 🏗️ Architecture

React (5173)\
↓\
FastAPI Backend (8000)\
↓\
Keycloak (8080)

Login Flow:

1.  User clicks "Get Started"
2.  Redirect to backend `/login`
3.  Keycloak authentication
4.  Backend stores session
5.  Redirect to `/dashboard`
6.  Frontend calls `/me`
7.  Dashboard displays user info

------------------------------------------------------------------------

# 🛠️ Tech Stack

-   React 18+
-   Vite
-   JavaScript (ES6+)
-   CSS
-   Fetch API
-   React Router

------------------------------------------------------------------------

# 📂 Project Structure

    src/
    │
    ├── pages/
    │   ├── LandingPage.jsx
    │   ├── Dashboard.jsx
    │
    ├── api/
    │   └── auth.js
    │
    ├── App.jsx
    ├── main.jsx
    └── index.css

------------------------------------------------------------------------

# ⚙️ Environment Setup

Create a `.env` file in the root:

    VITE_API_BASE_URL=http://localhost:8000

If using production backend:

    VITE_API_BASE_URL=https://your-api-domain.com

------------------------------------------------------------------------

# 📦 Installation

Clone the repository:

    git clone https://github.com/<org>/<repo>.git
    cd <repo>

Install dependencies:

    npm install

------------------------------------------------------------------------

# ▶️ Running the App

Start development server:

    npm run dev

App runs at:

    http://localhost:5173

------------------------------------------------------------------------

# 🔐 Authentication

Authentication is session-based.

Frontend does NOT store JWT tokens.

The backend:

-   Handles OAuth2 flow
-   Stores session cookie
-   Returns user data via `/me`

Frontend fetch example:

    fetch("http://localhost:8000/me", {
      credentials: "include"
    })

------------------------------------------------------------------------

# 📡 API Endpoints Used

  Endpoint      Purpose
  ------------- ------------------------
  `/login`      Redirect to Keycloak
  `/callback`   OAuth callback
  `/logout`     Logout user
  `/me`         Get authenticated user
  `/health`     Health check

------------------------------------------------------------------------

# 🧪 Debugging

To view user data in browser console:

    fetch("http://localhost:8000/me", {
      credentials: "include"
    })
    .then(res => res.json())
    .then(console.log)

------------------------------------------------------------------------

# 🌳 Git Workflow

We follow this branch structure:

    main        → Production
    develop     → Integration
    feature/*   → Features
    hotfix/*    → Production fixes

Creating a feature branch:

    git checkout develop
    git pull origin develop
    git checkout -b feature/branch-name

------------------------------------------------------------------------

# 🚀 Deployment

Build production bundle:

    npm run build

Output folder:

    dist/

Deploy this folder to:

-   Nginx
-   Vercel
-   Netlify
-   Docker
-   Any static hosting service

------------------------------------------------------------------------

# ⚠️ Important Notes

-   Do NOT commit `.env`
-   Do NOT store tokens in localStorage
-   Always use `credentials: "include"` for session-based requests
-   Backend must allow CORS for frontend origin

------------------------------------------------------------------------

# 👨‍💻 Contributors

Frontend Team\
Backend Team

------------------------------------------------------------------------

# 📄 License

Internal Project -- HDFC Internship
