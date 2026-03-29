// //index.js
// import express from 'express';
// import dotenv from "dotenv";
// import cors from 'cors';
// import database from './db/database.js';
// import cookieParser from 'cookie-parser';
// import userRoutes from './routes/user.route.js';

// // Load environment variables
// dotenv.config();

// // Initialize Express app
// const app = express();

// // Database connection
// database();


// // CORS Configuration
// const corsOptions = {
//   origin: [
//     process.env.FRONTEND_URL || "http://localhost:5173",
//   ],
//   credentials: true,
//   methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
//   optionsSuccessStatus: 200,
// };

// // Middleware
// app.use(cors(corsOptions));
// app.use(cookieParser());
// app.use(express.json({ limit: '100mb' }));
// app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// // Routes
// app.use("/api/v1/user",  userRoutes )

// const port = process.env.PORT || 5000;

// // Server Startup
// app.listen(port, () => {
//   console.log(`🚀 Server running on port ${port}`);
// });



import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";

import { Server } from "socket.io";

import database from "./db/database.js";
import userRoutes from "./routes/user.route.js";

// ================= INIT =================
dotenv.config();

const app = express();
const server = http.createServer(app);

// ================= DATABASE =================
database();

// ================= CORS =================
const corsOptions = {
  origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));

// ================= MIDDLEWARE =================
app.use(cookieParser());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================
app.use("/api/v1/user", userRoutes);

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: corsOptions,
});

// 🔥 RESPONDERS STORAGE (multi-type)
let responders = {
  medical: [],
  sos: [],
  disaster: [],
  roadside: [],
};

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

    responders[type].push({
      socketId: socket.id,
      name,
    });

    console.log(`✅ ${type} responder joined`);
  });

  // ================= CALL REQUEST =================
  socket.on("call_request", ({ type, userId }) => {
    console.log("📞 Call requested:", type);

    const availableResponders = responders[type];

    if (!availableResponders || availableResponders.length === 0) {
      socket.emit("no_responder_available");
      return;
    }

    // pick first responder (simple logic)
    const responder = availableResponders[0];

    const roomId = `${socket.id}-${responder.socketId}`;

    // notify responder
    io.to(responder.socketId).emit("incoming_call", {
      roomId,
      userId,
      type,
    });

    // notify user
    socket.emit("call_accepted", { roomId });
  });

  // ================= JOIN ROOM =================
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`📦 Joined room: ${roomId}`);
  });

  // ================= WEBRTC SIGNALING =================
  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice_candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice_candidate", candidate);
  });

  // ================= DISCONNECT =================
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);

    // remove user
    users = users.filter((u) => u.socketId !== socket.id);

    // remove from all responder types
    Object.keys(responders).forEach((type) => {
      responders[type] = responders[type].filter(
        (r) => r.socketId !== socket.id
      );
    });
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});