// src/services/categoryService.js
import { api } from "../api/client";      

// GET /categories
export const fetchCategories = async () => {
  const { data } = await api.get("/categories");
  return data;                                // [{ key:'food', label:'Food', icon:'🍔' }, ...]
};

// POST /categories
export const addCategory = async (payload) => {
  // payload: { label, icon }
  await api.post("/categories", payload);
};
