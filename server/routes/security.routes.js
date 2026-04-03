// routes/security.routes.js

import express from "express";
import { changePassword } from "../controllers/security.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/change-password").put( protect, changePassword);

export default router;