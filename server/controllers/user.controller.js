// controllers/user.controller.js

import { OAuth2Client } from "google-auth-library";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 🔐 GENERATE JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// =============================
// 🔥 GOOGLE LOGIN
// =============================
export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error("No credential provided");
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ email });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      user.provider = "google";
      await user.save();
    }
  } else {
    user = await User.create({
      name,
      email,
      googleId,
      provider: "google",
      avatar: picture || name.slice(0, 2).toUpperCase(),
    });
  }

  const token = generateToken(user);

  res.status(200).json({
    message: "Google login successful",
    token,
    user,
  });
});

// =============================
// 🔥 REGISTER
// =============================
export const registerAccount = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    provider: "local",
  });

  const token = generateToken(user);

  res.status(201).json({
    message: "Account created successfully",
    token,
    user,
  });
});

// =============================
// 🔥 LOGIN
// =============================
export const loginAccount = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (user.provider === "google") {
    res.status(400);
    throw new Error("Please login with Google");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user);

  res.status(200).json({
    message: "Login successful",
    token,
    user,
  });
});

// =============================
// 🔥 GOOGLE ALT HANDLER
// =============================
export const handleGoogleAuth = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error("Token missing");
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub, email, name, picture } = payload;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      googleId: sub,
      provider: "google",
      avatar: picture,
    });
  }

  const jwtToken = generateToken(user);

  res.status(200).json({
    token: jwtToken,
    user,
  });
});


// 🔥 LOGOUT
// =============================



export const logout = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  
  res.status(200).json({ message: 'Logged out successfully' });
});
