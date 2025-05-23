import { api } from "../api/client";

/* ---------- helpers ---------- */
const getToken = () => localStorage.getItem("jwt") || "";

/* ---------- Queries ---------- */
// 1) GET /ledgers/:id/records
export const fetchRecords = async ({
  ledgerId,
  month,
  categories,
  split,
  collaborator,
  token,
}) => {
  const { data } = await api.get(`/ledgers/${ledgerId}/records`, {
    params: {
      token: token || localStorage.getItem("jwt") || "",
      month: month || undefined,
      categories: categories?.length ? categories.join(",") : undefined,
      split: split || undefined,
      collaborator: collaborator || undefined,
    },
  });
  // console.log("ledgerId:", ledgerId);
  // console.log("[DEBUG] records length:", data.length);
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
    token: getToken(), // backend will use this token to verify the user
  });
  return data;
};

// 4) PUT /records/:id
export const updateRecord = async (recordId, payload) => {
  await api.put(`/records/${recordId}`, payload);
};

// 5) DELETE /records/:id
export const deleteRecord = async (recordId) => {
  await api.delete(`/records/${recordId}`);
};
