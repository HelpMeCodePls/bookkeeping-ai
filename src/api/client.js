// src/api/client.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  // If you decide to store the token in localStorage:
  headers: { "Content-Type": "application/json" },
});

// 自动把 token 作为 query-param 带上
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      config.params = { ...(config.params || {}), token };
    }
    return config;
  });