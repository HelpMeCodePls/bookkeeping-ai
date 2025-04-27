import { api } from "../api/client";

export const fetchCollaborators = async (ledgerId) => {
  const { data } = await api.get(`/ledgers/${ledgerId}/collaborators`);
  // 如果后端返回的是对象而不是数组，统一转成数组
  return Array.isArray(data) ? data : Object.values(data || {});
};

export const addCollaborator = async (ledgerId, payload) => {
  await api.post(`/ledgers/${ledgerId}/collaborators`, payload);
};

export const updateCollaboratorPermission = async (
  ledgerId,
  userId,
  permission,
) => {
  await api.patch(`/ledgers/${ledgerId}/collaborators/${userId}`, { permission });
};

export const deleteCollaborator = async (ledgerId, userId) => {
  await api.delete(`/ledgers/${ledgerId}/collaborators/${userId}`);
};
