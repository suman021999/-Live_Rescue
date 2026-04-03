// models/emergencyContact.model.js

import mongoose, { Schema } from "mongoose";

const emergencyContactSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    relation: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

export const EmergencyContact = mongoose.model("EmergencyContact",emergencyContactSchema);