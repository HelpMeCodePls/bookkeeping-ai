import { api } from "../api/client";

// ① 全量列表
export const fetchUsers = (token) =>
    api.get("/users", { params: { token } }).then((r) => r.data);

// ② 我的信息
export const fetchCurrentUser = (token) =>
  api.get("/users/me", { params: { token } }).then((r) => r.data);

// ③ 模糊搜索
export const searchUsers = (name) =>
  api.get("/users/search", { params: { name } }).then((r) => r.data);
