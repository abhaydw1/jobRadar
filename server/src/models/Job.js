import mongoose from "mongoose";
import { EXPERIENCE_LEVELS } from "../constants/experienceLevels.js";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    remote: { type: Boolean, default: false },
    experienceLevel: {
      type: String,
      enum: EXPERIENCE_LEVELS,
      required: true,
    },
    skills: { type: [String], default: [] },
    description: { type: String, required: true },
    postedAt: { type: Date, default: Date.now },
    source: { type: String, required: true, trim: true },
    sourceCompany: { type: String, default: null, trim: true },
    sourceJobId: { type: String, required: true, trim: true },
    sourceUrl: { type: String, required: true, trim: true },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

jobSchema.index({ location: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index(
  { source: 1, sourceCompany: 1, sourceJobId: 1 },
  { unique: true },
);

export default mongoose.model("Job", jobSchema);
