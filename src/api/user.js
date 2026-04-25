import API from "./index";

export const getProfile = () =>
  API.get("/user/profile");

export const updateProfile = (formData) =>
  API.put("/user/update-profile", formData);

export const getUserProfileById = (userId, page = 1, limit = 10) =>
  API.get(`/user/profile/${userId}?page=${page}&limit=${limit}`);