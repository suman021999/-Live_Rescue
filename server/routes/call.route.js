// routes for call-related endpoints

import express from "express";
import {
  createCall,
  updateCallStatus,
} from "../controllers/call.controller.js";

import { protect} from  "../middleware/auth.middleware.js"

const router = express.Router();

router.post("/create", protect, createCall);
router.patch("/:callId/status", protect, updateCallStatus);

export default router;