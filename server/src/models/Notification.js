import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

// Dedup: never re-notify a user about the same job
notificationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export default mongoose.model("Notification", notificationSchema);
