# jobFinder — AI-Powered Job Discovery & Notification Platform

A multi-user web app that lets each user define what jobs they're looking for, then
continuously monitors job sources, extracts postings, and notifies users about new,
relevant openings.

This is being built in phases (see project plan). This is **Phase 1: Foundation** —
no authentication, branding, or scraping yet, just a running client + server + DB
connection.

## Stack

- **Client:** React (Vite)
- **Server:** Node.js + Express
- **Database:** MongoDB (via Mongoose)

## Project layout

```
jobFinder/
  client/   React frontend (Vite)
  server/   Express backend + MongoDB connection
```

## Local setup

### Server

```
cd server
npm install
copy .env.example .env   # then fill in MONGODB_URI if you have one
npm run dev
```

Server runs at http://localhost:5000. Health check: `GET /api/health`.

### Client

```
cd client
npm install
npm run dev
```

Client runs at http://localhost:5173.

## Status

Phase 1 (Foundation) — client and server scaffolds run independently, server can
connect to MongoDB if `MONGODB_URI` is set. No features yet.
