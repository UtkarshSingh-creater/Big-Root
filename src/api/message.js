import API from "./index";

// Send a REST message (persists to DB)
export const sendMessage = (receiverId, text) =>
  API.post(`/message/send/${receiverId}`, { text });

// Get chat history with a specific user
export const getMessages = (userId) => API.get(`/message/${userId}`);
