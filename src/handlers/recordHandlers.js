import { api } from "../api/client";

/* ---------- helpers ---------- */
const getToken = () => localStorage.getItem("jwt") || "";

/* ---------- Queries ---------- */
// 1) GET /ledgers/:id/records
export const fetchRecords = async ({ ledgerId, month, categories, split, collaborator }) => {
  const { data } = await api.get(`/ledgers/${ledgerId}/records`, {
    params: {
      month,
      categories: categories?.length ? categories.join(",") : undefined,
      split: split || undefined,
      collaborator: collaborator || undefined,
    },
  });
  return data; // [{…}]
};

// 2) GET /records/incomplete
export const fetchIncompleteRecords = async () => {
  const { data } = await api.get("/records/incomplete");
  return data;
};

/* ---------- Mutations ---------- */
// 3) POST /ledgers/:id/records
export const createRecord = async (ledgerId, payload) => {
  const { data } = await api.post(`/ledgers/${ledgerId}/records`, {
    ...payload,
    token: getToken(), // ⚠️ 后端目前仍从 body 取 token
  });
  return data; // 全量 records
};

// 4) PUT /records/:id
export const updateRecord = async (recordId, payload) => {
  await api.put(`/records/${recordId}`, payload);
};

// 5) DELETE /records/:id
export const deleteRecord = async (recordId) => {
  await api.delete(`/records/${recordId}`);
};
