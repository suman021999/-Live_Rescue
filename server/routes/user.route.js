// routes/user.route.js

import express from "express";
import { registerAccount, loginAccount, googleLogin, logout } from "../controllers/user.controller.js";

const router = express.Router();

// 🔥 AUTH ROUTES

// register
router.route("/register").post( registerAccount);

// login
router.route("/login").post( loginAccount);

// google login
router.route("/google").post( googleLogin);

// logout
router.route("/logout").post( logout);

export default router;