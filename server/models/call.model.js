// models for call data

import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    responderName: String,

    type: {
      type: String,
      enum: ["medical", "sos", "disaster", "roadside"],
    },

    roomId: String,

    status: {
      type: String,
      enum: ["ringing", "accepted", "rejected", "ended"],
      default: "ringing",
    },

    startedAt: Date,
    endedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Call", callSchema);