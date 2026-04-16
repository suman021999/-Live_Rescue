

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";


import database from "./db/database.js";
import userRoutes from "./routes/user.route.js";
import callRoutes from "./routes/call.route.js";
import accountRoutes from "./routes/account.routes.js";
import emergencyContactRoutes from "./routes/emergencyContact.route.js";
import securitytRoutes from "./routes/security.routes.js";

// ================= INIT =================
dotenv.config();

const app = express();
const server = http.createServer(app);

// ================= DATABASE =================
database();

// ================= CORS =================
const corsOptions = {
  origin: ["https://live-rescue.vercel.app", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};
app.use(cors(corsOptions));

// ================= MIDDLEWARE =================
app.use(cookieParser());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/call", callRoutes);
app.use("/api/v1/account", accountRoutes);
app.use("/api/v1/emergencyContact", emergencyContactRoutes);
app.use("/api/v1/security", securitytRoutes);

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: ["https://live-rescue.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

// ================= STATE =================
let responders = {
  medical: [],
  sos: [],
  disaster: [],
  roadside: [],
};
const roomMetadata = {}; // roomId → { type, callerSocketId }
let users = [];

// ================= SOCKET EVENTS =================
io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  // --- User joins ---
  socket.on("join_user", (user) => {
    users.push({ socketId: socket.id, ...user });
    console.log("👤 User joined:", user);
  });

  // --- Responder joins (responder dashboard) ---
  socket.on("join_responder", ({ type, name }) => {
    if (!responders[type]) responders[type] = [];
    // Avoid duplicate registrations on reconnect
    responders[type] = responders[type].filter(
      (r) => r.socketId !== socket.id
    );
    responders[type].push({ socketId: socket.id, name });
    console.log(`✅ ${type} responder joined: ${name}`);
  });

  // --- Call request (WhatsApp-style instant) ---
  socket.on("call_request", async ({ type, userId }) => {
    console.log(`📞 Call request: type=${type}, from=${socket.id}`);

    const roomId = socket.id; // use caller's socket ID as room
    roomMetadata[roomId] = { type, callerSocketId: socket.id };

    // 1. Immediately tell caller their room is ready
    socket.emit("call_accepted", { roomId, type });



    // 3. If a live responder is available → notify via socket too (instant)
    const available = responders[type] || [];
    if (available.length > 0) {
      const responder = available[0];
      io.to(responder.socketId).emit("incoming_call", {
        roomId,
        userId,
        type,
      });
      console.log(`🚑 Live responder notified: ${responder.name}`);
    } else {
      // No live responder — email is the fallback (already sent above)
      socket.emit("no_responder_available");
      console.log("⚠️ No live responder — email sent to sankupatra2@gmail.com");
    }
  });

  // --- Join WebRTC room ---
  socket.on("join_room", (roomId) => {
    socket.join(roomId);

    const room = io.sockets.adapter.rooms.get(roomId);
    const peerCount = room ? room.size : 0;
    const meta = roomMetadata[roomId];
    const type = meta?.type || "Emergency";

    console.log(`📦 join_room: ${roomId} — peers: ${peerCount}`);

    if (peerCount === 1) {
      socket.emit("room_ready", { isCaller: true, type });
    } else {
      socket.emit("room_ready", { isCaller: false, type });
      socket.to(roomId).emit("start_offer");
    }
  });

  // --- WebRTC signaling ---
  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice_candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice_candidate", candidate);
  });

  // --- End call ---
  socket.on("end_call", ({ callId }) => {
    delete roomMetadata[callId];
    console.log("📴 Call ended:", callId);
    socket.broadcast.emit("call_ended", { callId });
    socket.rooms.forEach((room) => {
      if (room !== socket.id) socket.leave(room);
    });
  });

  // --- Disconnect cleanup ---
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
    users = users.filter((u) => u.socketId !== socket.id);
    Object.keys(responders).forEach((type) => {
      responders[type] = responders[type].filter(
        (r) => r.socketId !== socket.id
      );
    });
    // Clean up any room where this was the caller
    Object.keys(roomMetadata).forEach((roomId) => {
      if (roomMetadata[roomId]?.callerSocketId === socket.id) {
        delete roomMetadata[roomId];
      }
    });
  });
});

// ================= START =================
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


