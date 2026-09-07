# 📡 JobRadar — AI-Powered Job Discovery & Matching Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-job--radar--two--tau.vercel.app-blue?style=for-the-badge&logo=vercel)](https://job-radar-two-tau.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Stack-MERN%20%7C%20Tailwind%20%7C%20Vite-green?style=for-the-badge)](https://job-radar-two-tau.vercel.app)

**JobRadar** is an automated MERN-stack job discovery platform. It continuously ingests engineering and product openings from popular Applicant Tracking Systems (Greenhouse, Ashby), scores them dynamically against user preferences using an intelligent matching engine, and delivers interactive job feeds and email digests.

🚀 **Live Deployment**: [https://job-radar-two-tau.vercel.app](https://job-radar-two-tau.vercel.app)

---

## ✨ Features

- **🌐 Multi-Source ATS Ingestion**: Automated ingestion adapters for **Greenhouse** (GitLab, Stripe) and **Ashby** (Ramp, Notion), processing thousands of real tech postings.
- **🎯 Intelligent Job Matching Engine**: Real-time scoring algorithm based on user target roles (+40pts), skills (+5pts/skill), experience level (+20pts), location (+10pts), and company preferences (+20pts).
- **🔒 Secure Authentication & Roles**: HttpOnly JWT cookie authentication with Role-Based Access Control (User & Admin).
- **⏱️ Automated 6-Hour Ingestion Scheduler**: Background cron job (`node-cron`) automatically fetches fresh job listings and updates existing ones with unique compound deduplication `(source, sourceCompany, sourceJobId)`.
- **📧 Batch Email Notifications**: Automated email digests via Nodemailer with database-level deduplication to prevent duplicate alerts.
- **📊 Admin Dashboard**: Dedicated `/admin` route providing system stats, total ingested listings, user counts, and manual single-click ingestion triggers.
- **🎨 Premium Responsive UI**: Built with React 19, Vite, and Tailwind CSS with full dark mode support, tabbed filtering (All / Matched / Saved), and pagination.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **Icons & UI**: Heroicons / Custom SVG icons

### Backend
- **Server**: Node.js & Express
- **Database**: MongoDB Atlas via Mongoose
- **Scheduler**: `node-cron`
- **Auth**: JSON Web Tokens (JWT) in HttpOnly cookies & `bcryptjs`
- **Email Service**: Nodemailer

---

## 📁 Repository Architecture

```
jobRadar/
├── client/              # React (Vite) + Tailwind Frontend
│   ├── src/
│   │   ├── components/  # Layout, Navbar, JobCard, ThemeToggle, TagInput, ProtectedRoute, AdminRoute
│   │   ├── context/     # AuthContext state management
│   │   ├── hooks/       # useAuth, useSavedJobs, useTheme
│   │   ├── pages/       # Landing, Login, Register, Dashboard, Preferences, Jobs, JobDetails, Admin
│   │   └── lib/         # API request utilities
│   ├── vercel.json      # Single-Page Application rewrite rules for production
│   └── vite.config.js   # Vite configuration & dev proxy
│
├── server/              # Express API & Ingestion Engine
│   ├── src/
│   │   ├── config/      # Database connection (MongoDB Atlas)
│   │   ├── constants/   # Experience level enums
│   │   ├── ingestion/   # Greenhouse & Ashby ATS adapters, normalizer, matching engine
│   │   ├── middleware/  # JWT auth and admin authorization checks
│   │   ├── models/      # Mongoose schemas (User, Job, Notification)
│   │   ├── routes/      # REST API endpoints (auth, users, jobs, admin, health)
│   │   ├── services/    # Email notifier service
│   │   ├── utils/       # JWT token utilities & async handlers
│   │   └── scheduler.js # Automated 6-hour cron scheduler
│   └── .env.example     # Environment variable reference
│
└── render.yaml          # Render Blueprint for automated backend deployment
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables (`server/.env`)

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/jobFinder
JWT_SECRET=your-long-random-jwt-secret
CLIENT_URL=https://job-radar-two-tau.vercel.app

# Email Digest Notifications (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

### Frontend Environment Variables (`client/.env`)

```env
VITE_API_URL=https://your-backend-api-url.onrender.com
```

---

## 🚀 Local Development Setup

### 1. Backend Setup
```bash
cd server
npm install
cp .env.example .env    # Configure MONGODB_URI and JWT_SECRET
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

Visit the app in your browser at `http://localhost:5173`.

---

## 🌐 Production Deployment

- **Frontend**: Hosted on [Vercel](https://job-radar-two-tau.vercel.app) with automatic SPA rewrites (`vercel.json`).
- **Backend**: Hosted on [Render](https://render.com) using Node.js web service blueprint (`render.yaml`).
- **Database**: MongoDB Atlas cloud cluster.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
