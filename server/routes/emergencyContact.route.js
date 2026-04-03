// routes/emergencyContact.route.js

import express from "express";
import {
  createContact,
  getContacts,
  updateContact,
  deleteContact,
} from "../controllers/emergencyContact.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔐 All routes protected
router.use(protect );

// CRUD
router.route("/").post(createContact)
router.route("/").get(getContacts);

router.route("/:id").put(updateContact)
router.route("/:id").delete(deleteContact);

export default router;