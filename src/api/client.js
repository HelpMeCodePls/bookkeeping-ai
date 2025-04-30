// src/api/client.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  // If you decide to store the token in localStorage:
  headers: { "Content-Type": "application/json" },
});

// Add a request interceptor to include the token in the query parameters
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      config.params = { ...(config.params || {}), token };
    }
    return config;
  });