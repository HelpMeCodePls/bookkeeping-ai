import { api } from "../api/client";

/* ---------- Queries ---------- */

export const fetchNotifications = async () => {
  //   const { data } = await api.get("/notifications");
  //   return data;                 // [{ id, is_read, ... }]
  const { data } = await api.get("/notifications");
  //  _id, ledger_id, record_id, message
  return data.map((n) => ({
    id: n._id,
    ledgerId: n.ledger_id,
    recordId: n.record_id,
    content: n.message,
    is_read: n.is_read,
    created_at: n.created_at,
    type: n.type || "record",
  }));
};

export const fetchUnreadCount = async () => {
  const { data } = await api.get("/notifications/unread_count");
  return data.count; // number
};

/* ---------- Mutations ---------- */
export const markNotificationRead = async (id) => {
  await api.patch(`/notifications/${id}`);
};

export const createNotification = async (payload) => {
  const { data } = await api.post("/notifications", payload);
  return data; // { id, ... }
};
