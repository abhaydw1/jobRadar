import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Job from "../models/Job.js";

const SAMPLE_JOBS = [
  {
    title: "Backend Engineer",
    company: "Acme Corp",
    location: "Bangalore",
    remote: false,
    experienceLevel: "mid",
    skills: ["Node.js", "MongoDB", "Express"],
    description:
      "Own backend services for our payments platform. You'll design APIs, work with MongoDB at scale, and help mentor junior engineers.",
    postedAt: new Date("2026-08-10"),
  },
  {
    title: "SDE Intern",
    company: "Nimbus Labs",
    location: "Remote",
    remote: true,
    experienceLevel: "internship",
    skills: ["JavaScript", "React"],
    description:
      "6-month internship building internal tools with React. Great for someone early in their career who wants real production exposure.",
    postedAt: new Date("2026-08-18"),
  },
  {
    title: "Senior Full Stack Engineer",
    company: "Northwind Systems",
    location: "Hyderabad",
    remote: false,
    experienceLevel: "senior",
    skills: ["React", "Node.js", "PostgreSQL", "AWS"],
    description:
      "Lead feature development across our web app, from database schema to UI polish. You'll set technical direction for a small squad.",
    postedAt: new Date("2026-08-05"),
  },
  {
    title: "Frontend Developer",
    company: "Pixelworks",
    location: "Remote",
    remote: true,
    experienceLevel: "entry",
    skills: ["React", "Tailwind CSS", "TypeScript"],
    description:
      "Build responsive, accessible UI components for our design system used across five product teams.",
    postedAt: new Date("2026-08-15"),
  },
  {
    title: "Python Backend Engineer",
    company: "Datastream",
    location: "Pune",
    remote: false,
    experienceLevel: "mid",
    skills: ["Python", "Django", "PostgreSQL"],
    description:
      "Work on our data ingestion pipelines processing millions of events daily. Strong focus on reliability and testing.",
    postedAt: new Date("2026-08-12"),
  },
  {
    title: "DevOps Engineer",
    company: "Cloudbase",
    location: "Bangalore",
    remote: false,
    experienceLevel: "senior",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform"],
    description:
      "Own our CI/CD pipelines and cloud infrastructure. You'll drive reliability, cost optimization, and deployment automation.",
    postedAt: new Date("2026-07-30"),
  },
  {
    title: "Junior QA Engineer",
    company: "Testify",
    location: "Remote",
    remote: true,
    experienceLevel: "entry",
    skills: ["JavaScript", "Cypress"],
    description:
      "Write and maintain automated end-to-end tests for our SaaS product. Close collaboration with frontend engineers.",
    postedAt: new Date("2026-08-19"),
  },
  {
    title: "Machine Learning Intern",
    company: "Vertex AI Labs",
    location: "Remote",
    remote: true,
    experienceLevel: "internship",
    skills: ["Python", "PyTorch"],
    description:
      "Assist the research team with model training experiments and data preprocessing pipelines.",
    postedAt: new Date("2026-08-20"),
  },
  {
    title: "Product Engineer",
    company: "Northwind Systems",
    location: "Hyderabad",
    remote: false,
    experienceLevel: "mid",
    skills: ["React", "Node.js", "MongoDB"],
    description:
      "Sit close to the product team and ship end-to-end features, from spec to production, in a fast-moving startup environment.",
    postedAt: new Date("2026-08-01"),
  },
  {
    title: "Staff Software Engineer",
    company: "Acme Corp",
    location: "Remote",
    remote: true,
    experienceLevel: "senior",
    skills: ["Node.js", "System Design", "MongoDB"],
    description:
      "Guide architecture decisions across multiple teams. Heavy focus on scalability, observability, and technical mentorship.",
    postedAt: new Date("2026-07-25"),
  },
  {
    title: "Entry Level Backend Developer",
    company: "Datastream",
    location: "Pune",
    remote: false,
    experienceLevel: "entry",
    skills: ["Java", "Spring Boot"],
    description:
      "Join our platform team building internal APIs. Mentorship provided, great for someone in their first or second job.",
    postedAt: new Date("2026-08-14"),
  },
  {
    title: "UI Engineering Intern",
    company: "Pixelworks",
    location: "Bangalore",
    remote: false,
    experienceLevel: "internship",
    skills: ["React", "CSS"],
    description:
      "Work alongside our design system team building reusable UI components and polishing interaction details.",
    postedAt: new Date("2026-08-17"),
  },
];

async function seed() {
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error("[seed] Could not connect to the database. Aborting.");
    process.exit(1);
  }

  const existingCount = await Job.countDocuments();
  if (existingCount > 0) {
    console.log(
      `[seed] Jobs collection already has ${existingCount} document(s) — skipping insert.`,
    );
  } else {
    await Job.insertMany(SAMPLE_JOBS);
    console.log(`[seed] Inserted ${SAMPLE_JOBS.length} sample jobs.`);
  }

  await mongoose.disconnect();
}

seed();
