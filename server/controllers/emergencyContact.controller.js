// controllers/emergencyContact.controller.js

import asyncHandler from "express-async-handler";
import { EmergencyContact } from "../models/emergencyContact.model.js";

// =============================
// ➕ CREATE CONTACT
// =============================
export const createContact = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { name, relation, phone, email } = req.body;

  if (!name || !phone) {
    res.status(400);
    throw new Error("Name and phone are required");
  }

  const contact = await EmergencyContact.create({
    user: userId,
    name,
    relation,
    phone,
    email,
  });

  res.status(201).json({
    message: "Contact added",
    contact,
  });
});

// =============================
// 📥 GET ALL CONTACTS
// =============================
export const getContacts = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const contacts = await EmergencyContact.find({ user: userId }).sort({
    createdAt: -1,
  });

  res.status(200).json(contacts);
});

// =============================
// ✏️ UPDATE CONTACT
// =============================
export const updateContact = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const contact = await EmergencyContact.findOne({
    _id: id,
    user: userId,
  });

  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  const { name, relation, phone, email } = req.body;

  contact.name = name || contact.name;
  contact.relation = relation || contact.relation;
  contact.phone = phone || contact.phone;
  contact.email = email || contact.email;

  await contact.save();

  res.status(200).json({
    message: "Contact updated",
    contact,
  });
});

// =============================
// ❌ DELETE CONTACT
// =============================
export const deleteContact = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const contact = await EmergencyContact.findOneAndDelete({
    _id: id,
    user: userId,
  });

  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  res.status(200).json({
    message: "Contact deleted",
  });
});