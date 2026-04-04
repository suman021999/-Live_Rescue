//index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";

import { Server } from "socket.io";
import { sendMeetingEmail } from "./utils/sendMail.js";
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
  origin: "https://live-rescue.vercel.app",
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
    origin: "https://live-rescue.vercel.app",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

// 🔥 RESPONDERS STORAGE (multi-type)
let responders = {
  medical: [],
  sos: [],
  disaster: [],
  roadside: [],
};
const roomMetadata = {};
let users = [];

io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  // ================= USER JOIN =================
  socket.on("join_user", (user) => {
    users.push({ socketId: socket.id, ...user });
    console.log("👤 User joined");
  });

  // ================= RESPONDER JOIN =================
  socket.on("join_responder", ({ type, name }) => {
    if (!responders[type]) responders[type] = [];
    responders[type].push({ socketId: socket.id, name });
    console.log(`✅ ${type} responder joined`);
  });

  // ================= CALL REQUEST =================
  socket.on("call_request", async ({ type, userId }) => {
    console.log("📞 Call requested:", type);

    const roomId = `${socket.id}`;
    // Store the type for this room
    roomMetadata[roomId] = type;

    socket.emit("call_accepted", { roomId, type });

    try {
      await sendMeetingEmail("sankupatra2@gmail.com", roomId);
      console.log("📧 Email sent successfully");
    } catch (err) {
      console.error("❌ Email failed:", err);
    }

    const availableResponders = responders[type];

    if (!availableResponders || availableResponders.length === 0) {
      socket.emit("no_responder_available");
      return;
    }

    const responder = availableResponders[0];
    io.to(responder.socketId).emit("incoming_call", { roomId, userId, type });
  });

  // ================= JOIN ROOM =================
  // 🔥 FIXED: Coordinate caller/answerer roles properly
  socket.on("join_room", (roomId) => {
    socket.join(roomId);

    const room = io.sockets.adapter.rooms.get(roomId);
    const peerCount = room ? room.size : 0;

    // Get the type we stored earlier
    const type = roomMetadata[roomId] || "Emergency";

    console.log(`📦 join_room: ${roomId} — peers in room: ${peerCount}`);

    if (peerCount === 1) {
      // First peer: they are the caller, wait for 2nd peer
      socket.emit("room_ready", { isCaller: true, type });
      console.log(`👤 First peer in room ${roomId} — waiting for 2nd`);
    } else {
      // Second peer joined
      socket.emit("room_ready", { isCaller: false, type });

      // 🔥 Tell the FIRST peer to create and send the offer NOW
      socket.to(roomId).emit("start_offer");
      console.log(`🤝 Second peer joined ${roomId} — triggering offer`);
    }
  });

  // ================= WEBRTC SIGNALING =================
  socket.on("offer", ({ roomId, offer }) => {
    console.log(`📡 Relaying offer in room ${roomId}`);
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    console.log(`📡 Relaying answer in room ${roomId}`);
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice_candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice_candidate", candidate);
  });

  // ================= END CALL =================
  socket.on("end_call", ({ callId }) => {
    delete roomMetadata[callId];
    console.log("📴 Call ended:", callId);
    socket.broadcast.emit("call_ended", { callId });
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
        console.log(`🚪 Left room: ${room}`);
      }
    });
  });

  // ================= DISCONNECT =================
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
    users = users.filter((u) => u.socketId !== socket.id);
    Object.keys(responders).forEach((type) => {
      responders[type] = responders[type].filter(
        (r) => r.socketId !== socket.id
      );
    });
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
