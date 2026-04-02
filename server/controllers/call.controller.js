// controllers for call-related operations

import Call from "../models/call.model.js";

// CREATE CALL (when user clicks)
export const createCall = async (req, res) => {
  try {
    const { type } = req.body;

    const call = await Call.create({
      user: req.user._id,
      type,
      status: "ringing",
    });

    res.status(201).json({
      success: true,
      call,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE STATUS
export const updateCallStatus = async (req, res) => {
  try {
    const { callId } = req.params;
    const { status } = req.body;

    const call = await Call.findByIdAndUpdate(
      callId,
      { status },
      { new: true }
    );

    res.json({ success: true, call });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};