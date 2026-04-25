import { useEffect } from "react";
import socket from "../services/socket";

export default function useSocket(setNotifications) {
  useEffect(() => {
    socket.connect();

    socket.on("notification", (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    return () => socket.disconnect();
  }, []);
}