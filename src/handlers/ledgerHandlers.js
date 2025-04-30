// src/handlers/ledgerHandlers.js
import { api } from "../api/client";

const getToken = () => localStorage.getItem("jwt") || "";

/** ---------- Read ---------- */
export const fetchLedgers = async () => {
  const { data } = await api.get("/ledgers"); // GET /ledgers?token=...
  return data; // [{ _id, name, ... }]
};

export const fetchLedger = async (ledgerId) => {
  const { data } = await api.get(`/ledgers/${ledgerId}`);
  return data;
};

/** ---------- Create ---------- */
export const createLedger = async ({ name, budget }) => {
  const { data } = await api.post("/ledgers", {
    name,
    budgets: { default: Number(budget) },
    token: getToken(),
  });
  return data; // { id: "…" }
};

/** ---------- Update ---------- */
export const updateLedgerBudget = async ({ ledgerId, budget }) => {
  await api.patch(`/ledgers/${ledgerId}/budgets`, { budget });
};

/** ---------- Permission ---------- */
export const fetchLedgerPermission = async (ledgerId) => {
  const { data } = await api.get(`/ledgers/${ledgerId}/permission`);
  return data; // { permission: "OWNER" | ... }
};
