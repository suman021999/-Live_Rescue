// ================= SERVICE.js  ====================

import axios from "axios";
import { io } from "socket.io-client";

// ================= ENV =================
const AUTH_API = import.meta.env.VITE_AUTH_URL;
const ACCOUNT_API = import.meta.env.VITE_ACCOUNT_URL;
const CALL_API = import.meta.env.VITE_CALL_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const EMERGENCYCONTACT_URL=import.meta.env.VITE_EMERGENCYCONTACT_URL;
const SECURITY_URL=import.meta.env.VITE_SECURITY_URL;
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

const accountApi = axios.create({
  baseURL: ACCOUNT_API,
  headers: {
    "Content-Type": "application/json",
  },
});

const emergencyApi = axios.create({
  baseURL: EMERGENCYCONTACT_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const securityApi = axios.create({
  baseURL: SECURITY_URL,
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


// ================= ACCOUNT API =================

accountApi.interceptors.request.use(attachToken);

// 📥 GET MY ACCOUNT
export const getMyAccount = async () => {
  try {
    const res = await accountApi.get("/");
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Fetch account failed");
  }
};

// 💾 UPSERT ACCOUNT
export const saveMyAccount = async (data) => {
  try {
    const res = await accountApi.post("/", data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Save failed");
  }
};

// 🖼️ UPLOAD AVATAR
export const uploadAvatarApi = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const res = await accountApi.post("/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Upload failed");
  }
};

// ❌ DELETE AVATAR
export const deleteAvatarApi = async () => {
  try {
    const res = await accountApi.delete("/avatar");
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Delete failed");
  }
};


// ================= EMERGENCY CONTACT API =================
emergencyApi.interceptors.request.use(attachToken);

// 📥 GET CONTACTS
export const getEmergencyContacts = async () => {
  try {
    const res = await emergencyApi.get("/");
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Fetch failed");
  }
};

// ➕ CREATE CONTACT
export const createEmergencyContact = async (data) => {
  try {
    const res = await emergencyApi.post("/", data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Create failed");
  }
};

// ✏️ UPDATE CONTACT
export const updateEmergencyContact = async (id, data) => {
  try {
    const res = await emergencyApi.put(`/${id}`, data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Update failed");
  }
};

// ❌ DELETE CONTACT
export const deleteEmergencyContact = async (id) => {
  try {
    const res = await emergencyApi.delete(`/${id}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Delete failed");
  }
};


// ================= SECURITY API =================

securityApi.interceptors.request.use(attachToken);

// 🔐 CHANGE PASSWORD
export const changePassword = async (data) => {
  try {
    const res = await securityApi.put("/change-password", data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Password update failed");
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
export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
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