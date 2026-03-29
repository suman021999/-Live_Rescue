import axios from "axios";

const API = import.meta.env.VITE_AUTH_URL;

// 🔥 AXIOS INSTANCE
const api = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 REQUEST INTERCEPTOR (attach token automatically)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔐 REGISTER
export const registerUser = async (data) => {
  try {
    const res = await api.post("/register", data);

    localStorage.setItem("token", res.data.token);

    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Registration failed");
  }
};

// 🔐 LOGIN
export const loginUser = async (data) => {
  try {
    const res = await api.post("/login", data);

    localStorage.setItem("token", res.data.token);

    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Login failed");
  }
};

// 🔐 GOOGLE LOGIN
export const googleAuth = async (credential) => {
  try {
    const res = await api.post("/google", { credential });

    localStorage.setItem("token", res.data.token);

    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Google login failed");
  }
};

// 🔐 LOGOUT (🔥 PROPER BACKEND + FRONTEND)
export const logoutUser = async () => {
  try {
    await api.post("/logout"); // call backend
  } catch (err) {
    console.warn("Logout API failed (still clearing local)");
  } finally {
    // always clear frontend token
    localStorage.removeItem("token");
  }
};