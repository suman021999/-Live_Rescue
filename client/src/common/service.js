// ================= SERVICE.js  ====================

import axios from "axios";
import { io } from "socket.io-client";

// ================= ENV =================
const AUTH_API = import.meta.env.VITE_AUTH_URL;
const CALL_API = import.meta.env.VITE_CALL_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

// ================= AXIOS INSTANCES =================
const authApi = axios.create({
  baseURL: AUTH_API,
  headers: {
    "Content-Type": "application/json",
  },
});

const callApi = axios.create({
  baseURL: CALL_API,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= INTERCEPTOR =================
const attachToken = (config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

authApi.interceptors.request.use(attachToken);
callApi.interceptors.request.use(attachToken);

// ================= AUTH SERVICES =================

// 🔐 REGISTER
export const registerUser = async (data) => {
  try {
    const res = await authApi.post("/register", data);
    localStorage.setItem("token", res.data.token);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Registration failed");
  }
};

// 🔐 LOGIN
export const loginUser = async (data) => {
  try {
    const res = await authApi.post("/login", data);
    localStorage.setItem("token", res.data.token);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Login failed");
  }
};

// 🔐 GOOGLE LOGIN
export const googleAuth = async (credential) => {
  try {
    const res = await authApi.post("/google", { credential });
    localStorage.setItem("token", res.data.token);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Google login failed");
  }
};

// 🔐 LOGOUT
export const logoutUser = async () => {
  try {
    await authApi.post("/logout");
  } catch (err) {
    console.warn("Logout API failed (still clearing local)");
  } finally {
    localStorage.removeItem("token");
  }
};

// ================= CALL SERVICES =================

// 📞 CREATE CALL
export const createCall = async (type) => {
  try {
    const res = await callApi.post("/create", { type });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Call creation failed");
  }
};

// 🔄 UPDATE CALL STATUS
export const updateCallStatus = async (callId, status) => {
  try {
    const res = await callApi.patch(`/${callId}/status`, { status });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Status update failed");
  }
};

// ================= SOCKET =================
export const socket = io(SOCKET_URL, {
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

// ================= SOCKET HELPERS =================

// 👤 Join as user
export const joinUserSocket = (user) => {
  socket.emit("join_user", user);
};

// 🚑 Join as responder
export const joinResponderSocket = (type, name) => {
  socket.emit("join_responder", { type, name });
};



// 📞 Request call
export const requestCallSocket = ({ type, userId, callId }) => {
  socket.emit("call_request", { type, userId, callId });
};

// 📦 Join room
export const joinRoomSocket = (roomId) => {
  socket.emit("join_room", roomId);
};

// ❌ End call
export const endCallSocket = (callId) => {
  socket.emit("end_call", { callId });
};

// ================= WEBRTC SIGNALING =================

// 📡 Send offer
export const sendOffer = (roomId, offer) => {
  socket.emit("offer", { roomId, offer });
};

// 📡 Send answer
export const sendAnswer = (roomId, answer) => {
  socket.emit("answer", { roomId, answer });
};

// 📡 Send ICE candidate
export const sendIceCandidate = (roomId, candidate) => {
  socket.emit("ice_candidate", { roomId, candidate });
};