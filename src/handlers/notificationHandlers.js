import { api } from "../api/client";

/* ---------- Queries ---------- */
// 所有通知（按时间倒序已由后端保证）
export const fetchNotifications = async () => {
//   const { data } = await api.get("/notifications");
//   return data;                 // [{ id, is_read, ... }]
  const { data } = await api.get("/notifications");
  // 后端字段: _id, ledger_id, record_id, message
  return data.map((n) => ({
    id: n._id,
    ledgerId: n.ledger_id,
    recordId: n.record_id,
    content: n.message,
    is_read: n.is_read,
    created_at: n.created_at,
    type: n.type || "record",        // 后端如未提供可默认
  }));
};

export const fetchUnreadCount = async () => {
  const { data } = await api.get("/notifications/unread_count");
  return data.count;           // number
};

/* ---------- Mutations ---------- */
export const markNotificationRead = async (id) => {
  await api.patch(`/notifications/${id}`);
};

export const createNotification = async (payload) => {
  const { data } = await api.post("/notifications", payload);
  return data;                 // { id, ... }
};
