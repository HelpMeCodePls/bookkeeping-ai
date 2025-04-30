import { api } from "../api/client";

export const fetchUsers = (token) =>
  api.get("/users", { params: { token } }).then((r) => r.data);

export const fetchCurrentUser = (token) =>
  api.get("/users/me", { params: { token } }).then((r) => r.data);

export const searchUsers = (name) =>
  api.get("/users/search", { params: { name } }).then((r) => r.data);
