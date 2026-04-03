// models/user.model.js

import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
    },
    avatar: {
      type: String,
      default: "",
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 AUTO GENERATE AVATAR (INITIALS)

userSchema.pre("save", function () {
  if (!this.avatar && this.name) {
    this.avatar = this.name.slice(0, 2).toUpperCase();
  }
});

// 🔐 SAFE RESPONSE (REMOVE SENSITIVE DATA)

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  return user;
};

export const User = mongoose.model("User", userSchema);