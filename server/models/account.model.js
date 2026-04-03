// models/account.model.js

import mongoose, { Schema } from "mongoose";

const accountSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    bloodType: String,
    allergies: String,

    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Account = mongoose.model("Account", accountSchema);