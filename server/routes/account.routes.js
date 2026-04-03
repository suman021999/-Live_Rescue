// routes/account.routes.js
import express from "express";
import {
  getMyAccount,
  upsertAccount,
  uploadAvatar,
  deleteAvatar,
} from "../controllers/account.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../utils/uplode.js";

const router = express.Router();



// =============================
// ACCOUNT ROUTES
// =============================
router.route("/").get( protect, getMyAccount);
router.route("/").post( protect, upsertAccount);

// =============================
// AVATAR ROUTES
// =============================
router.route("/avatar").post( protect, upload.single("avatar"), uploadAvatar);
router.route("/avatar").delete( protect, deleteAvatar);

export default router;