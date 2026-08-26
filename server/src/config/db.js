import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("[db] MONGODB_URI not set — skipping database connection.");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("[db] MongoDB connected.");
  } catch (err) {
    console.warn("[db] MongoDB connection failed:", err.message);
  }
}
