import API from "./index";

export const sendConnection = (id) =>
  API.post(`/connection/send/${id}`);

export const getConnections = () =>
  API.get("/connection/my");

export const respondToConnection = (connectionId, action) =>
  API.post(`/connection/respond/${connectionId}`, { action });