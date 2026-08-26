import mongoose from "mongoose";
import { EXPERIENCE_LEVELS } from "../constants/experienceLevels.js";

const preferencesSchema = new mongoose.Schema(
  {
    roles: { type: [String], default: [] },
    locations: { type: [String], default: [] },
    experienceLevels: {
      type: [String],
      enum: EXPERIENCE_LEVELS,
      default: [],
    },
    skills: { type: [String], default: [] },
    companies: { type: [String], default: [] },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    preferences: { type: preferencesSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
