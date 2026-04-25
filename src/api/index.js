import axios from "axios";

/* =========================
   🌐 BASE URL
========================= */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://bigroot-1.onrender.com/api",
  timeout: 60000, // Increased timeout to prevent Axios from cancelling requests while free Render spins up or large image uploads occur
});

/* =========================
   🔐 REQUEST INTERCEPTOR
========================= */
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");

    if (token && token !== "null" && token !== "undefined") {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

/* =========================
   ⚠️ RESPONSE INTERCEPTOR
========================= */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔒 Auto logout if token expired
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;