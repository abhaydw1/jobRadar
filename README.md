# 📡 JobRadar

> An automated MERN-stack job discovery and matching platform that continuously ingests job postings from Applicant Tracking Systems (Greenhouse, Ashby), scores them dynamically against personalized user preferences, and delivers interactive job feeds and email digests.

🌐 **Live Demo**: [https://job-radar-two-tau.vercel.app](https://job-radar-two-tau.vercel.app)

---

## 🔥 Key Highlights

- **Automated ATS Ingestion**: Ingests live software engineering and product listings directly from **Greenhouse** (GitLab, Stripe) and **Ashby** (Ramp, Notion) ATS APIs.
- **Intelligent Match Engine**: Calculates real-time candidate relevance scores based on user role preferences, technical skills, experience level, location, and target companies.
- **Role-Based Access Control**: Secure HttpOnly JWT session management with dedicated User and Admin access controls.
- **Background Cron Scheduler**: Automated 6-hour cron service (`node-cron`) for pipeline ingestion and database deduplication.
- **Email Digest Notifications**: Batched email alerts delivered via Nodemailer with database-level notification tracking.
- **Admin Command Center**: Interactive `/admin` portal for platform analytics, job ingestion stats, and single-click manual pipeline execution.
- **Modern UI/UX**: Built with React 19, Vite, and Tailwind CSS featuring dynamic dark mode support and tabbed filtering (All / Matched / Saved).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router v7
- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose
- **Services**: Nodemailer, `node-cron`, JSON Web Tokens (JWT)

---

## 📁 Repository Structure

```
jobRadar/
├── client/     # React (Vite) + Tailwind CSS Frontend
└── server/     # Express API, MongoDB Schemas, ATS Ingestion & Matching Engine
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
