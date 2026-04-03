// controllers/account.controller.js

import asyncHandler from "express-async-handler";
import { Account } from "../models/account.model.js";
import { uploadLiveRescuerImage  } from "../config/cloudinary.js";

// =============================
// 🔥 GET ACCOUNT
// =============================
export const getMyAccount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let account = await Account.findOne({ user: userId });

  if (!account) {
    account = await Account.create({ user: userId });
  }

  res.status(200).json(account);
});

// =============================
// 🔥 CREATE / UPDATE ACCOUNT
// =============================
export const upsertAccount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const {
    firstName,
    lastName,
    email,
    phone,
    bloodType,
    allergies,
  } = req.body;

  let account = await Account.findOne({ user: userId });

  if (account) {
    account.firstName = firstName || account.firstName;
    account.lastName = lastName || account.lastName;
    account.email = email || account.email;
    account.phone = phone || account.phone;
    account.bloodType = bloodType || account.bloodType;
    account.allergies = allergies || account.allergies;

    await account.save();
  } else {
    account = await Account.create({
      user: userId,
      firstName,
      lastName,
      email,
      phone,
      bloodType,
      allergies,
    });
  }

  res.status(200).json({
    message: "Account saved successfully",
    account,
  });
});

// =============================
// 🔥 UPLOAD AVATAR
// =============================
export const uploadAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const imageUrl = await uploadLiveRescuerImage (
    req.file.buffer,
    req.file.mimetype
  );

  let account = await Account.findOne({ user: userId });

  if (!account) {
    account = await Account.create({
      user: userId,
      avatar: imageUrl,
    });
  } else {
    account.avatar = imageUrl;
    await account.save();
  }

  res.status(200).json({
    message: "Avatar uploaded",
    avatar: imageUrl,
  });
});

// =============================
// 🔥 DELETE AVATAR
// =============================
export const deleteAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const account = await Account.findOne({ user: userId });

  if (!account) {
    res.status(404);
    throw new Error("Account not found");
  }

  account.avatar = "";
  await account.save();

  res.status(200).json({
    message: "Avatar removed",
  });
});