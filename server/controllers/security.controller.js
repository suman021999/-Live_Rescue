// controllers/security.controller.js

import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";

export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // ❌ block google users
  if (user.provider === "google") {
    res.status(400);
    throw new Error("Use Google login");
  }

  // ✅ check current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Wrong current password");
  }

  // ✅ validate new password
  if (newPassword.length < 8) {
    res.status(400);
    throw new Error("Min 8 characters required");
  }

  // ✅ hash & update
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password updated successfully" });
});