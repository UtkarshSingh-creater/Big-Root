import { io } from "socket.io-client";

// Extract base URL correctly (removing trailing /api if utilizing a central backend)
const BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, "") 
  : "https://bigroot-1.onrender.com";

export const getSocket = () => {
   const token = localStorage.getItem("token");

   const socketParams = {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
   };

   // Securely bind authentication layer if local token exists
   if (token && token !== "null" && token !== "undefined") {
      socketParams.auth = { token };
      socketParams.extraHeaders = { Authorization: `Bearer ${token}` };
   }

   return io(BASE_URL, socketParams);
};

// Expose a universal singleton to prevent memory leaks across multiple component mounts
const socket = getSocket();

export default socket;
