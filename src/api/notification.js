import API from "./index";

// Get all notifications for the logged-in user
export const getNotifications = () => API.get("/notification");

// Mark all notifications as read (local only — backend has no separate markRead route)
// When backend adds a PATCH /notification/read route, update this call
export const markNotificationsRead = () =>
  Promise.resolve({ data: { success: true } });
