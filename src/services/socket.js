import { io } from "socket.io-client";

// Strip /api from the REST URL to get the Socket.IO root
const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
  : "https://bigroot-1.onrender.com";

// Create singleton with autoConnect: false — we connect manually after login
// so the auth token is always present when the handshake occurs.
const socket = io(BASE_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  auth: (cb) => {
    // Called fresh on every connect/reconnect attempt — always picks up latest token
    const token = localStorage.getItem("token");
    cb({ token: token && token !== "null" && token !== "undefined" ? token : "" });
  },
});

/**
 * getUserId — safely reads userId from localStorage
 */
const getUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem("user"));
    return u?._id || u?.id || null;
  } catch {
    return null;
  }
};

/**
 * connectSocket()
 * Call this once after login (Topbar mounts).
 * Emits the `join` event the backend needs to register userId → socketId.
 * Safe to call multiple times — duplicate .connect() calls are ignored by socket.io.
 */
export const connectSocket = () => {
  const userId = getUserId();
  if (!userId) return; // Not authenticated yet

  const emitJoin = () => {
    socket.emit("join", userId);
    console.log("✅ Socket joined as:", userId);
  };

  // Emit join immediately if already connected, else wait for connect event
  if (socket.connected) {
    emitJoin();
  } else {
    // Use once() so it doesn't stack up on repeated calls
    socket.once("connect", emitJoin);
    socket.connect();
  }

  // Re-register after every automatic reconnect (server Map is wiped on disconnect)
  // Remove any old listener first to avoid duplicates
  socket.off("reconnect", emitJoin);
  socket.on("reconnect", emitJoin);
};

export default socket;
