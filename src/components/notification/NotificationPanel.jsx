import { useEffect, useState } from "react";
import socket from "../../services/socket";

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on("notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => socket.off("notification");
  }, []);

  return (
    <div className="absolute right-6 top-16 glass w-72 p-4">

      <h3 className="mb-2 font-semibold">Notifications</h3>

      {notifications.length === 0 ? (
        <p className="text-gray-400">No notifications</p>
      ) : (
        notifications.map((n, i) => (
          <div key={i} className="border-b py-2 text-sm">
            {n.message}
          </div>
        ))
      )}

    </div>
  );
}