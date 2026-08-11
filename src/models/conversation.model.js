import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Snapshot of job.createdBy at creation time, so authorization checks
    // and inbox queries don't need to populate the job every time.
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Denormalized fields for a fast, cheap inbox list view
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastMessagePreview: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// The unique index is the actual fix: it makes it impossible — at the
// database level — for two documents to exist for the same job+candidate
// pair, no matter how many times "start conversation" is called.
conversationSchema.index({ job: 1, candidate: 1 }, { unique: true });

export default mongoose.model("Conversation", conversationSchema);
