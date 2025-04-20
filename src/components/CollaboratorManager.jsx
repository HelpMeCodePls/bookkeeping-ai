import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import { useAuthStore } from "../store/auth";

export default function CollaboratorManager({ ledgerId, open, onClose }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("EDITOR");
  const [userToRemove, setUserToRemove] = useState(null);
  const token = useAuthStore((s) => s.token);

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  // 获取协作者列表
  const { data: collaborators = [] } = useQuery({
    queryKey: ["collaborators", ledgerId, token],
    queryFn: () =>
      axios
        .get(`/ledgers/${ledgerId}/collaborators`, { params: { token } })
        .then((r) => r.data),
    enabled: open && !!token,
  });

  // 获取用户基本信息
  const { data: users = [] } = useQuery({
    queryKey: ["users", token],
    queryFn: () =>
      axios.get("/users", { params: { token } }).then((r) => r.data),
    enabled: open && !!token,
  });

  // 添加协作者
  const addCollaborator = useMutation({
    mutationFn: (payload) =>
      axios.post(`/ledgers/${ledgerId}/collaborators`, payload, {
        params: { token },
      }),
    onSuccess: async (_, variables) => {
      // variables 就是 { email, permission }
      await axios.post(
        "/notifications",
        {
          type: "collaboration",
          content: `You added ${
            variables.email
          } as ${variables.permission.toLowerCase()}`,
          ledgerId,
          metadata: { permission: variables.permission },
        },
        { params: { token } }
      );

      queryClient.invalidateQueries(["collaborators", ledgerId, token]);
      queryClient.invalidateQueries(["notifications"]);
      setEmail("");
    },
  });

  // 移除协作者
  const removeCollaborator = useMutation({
    mutationFn: (userId) =>
      axios.delete(`/ledgers/${ledgerId}/collaborators/${userId}`, {
        params: { token },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["collaborators", ledgerId, token]);
      setUserToRemove(null);
    },
  });

  // 更新权限
  const updatePermission = useMutation({
    mutationFn: ({ userId, permission }) =>
      axios.patch(
        `/ledgers/${ledgerId}/collaborators/${userId}`,
        { permission },
        { params: { token } }
      ),
    onSuccess: () =>
      queryClient.invalidateQueries(["collaborators", ledgerId, token]),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setAdding(true);
    setError("");
    try {
      await addCollaborator.mutateAsync({ email, permission });
      setAdded(true);
      setEmail("");
      setTimeout(() => setAdded(false), 1500); // 1.5秒后消失
    } catch (err) {
      console.error(err);
      setError("Failed to add collaborator.");
    } finally {
      setAdding(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="font-bold text-lg mb-4">Manage Collaborators</h3>

        {/* 添加协作者表单 */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            type="email"
            placeholder="User email"
            className="border px-3 py-2 rounded flex-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <select
            className="border px-3 py-2 rounded"
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
          >
            <option value="EDITOR">Editor</option>
            <option value="VIEWER">Viewer</option>
          </select>
          <button
            type="submit"
            disabled={adding}
            className={`px-4 py-2 rounded text-white 
    ${adding ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}
  `}
          >
            {adding ? "Adding..." : added ? "✅ Added!" : "Add"}
          </button>
        </form>

        {/* 协作者列表 */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {collaborators.map((collab) => {
            const user = users.find((u) => u.id === collab.userId);
            return (
              <div
                key={collab.userId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <div className="font-medium">
                    {user?.name || collab.email}
                  </div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="border px-2 py-1 rounded text-sm"
                    value={collab.permission}
                    onChange={(e) =>
                      updatePermission.mutate({
                        userId: collab.userId,
                        permission: e.target.value,
                      })
                    }
                  >
                    <option value="OWNER">Owner</option>
                    <option value="EDITOR">Editor</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                  <button
                    onClick={() => setUserToRemove(collab.userId)}
                    className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm"
                    disabled={collab.permission === "OWNER"}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded border">
            Close
          </button>
        </div>
      </div>

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={!!userToRemove}
        msg="Are you sure to remove this collaborator?"
        onCancel={() => setUserToRemove(null)}
        onConfirm={() => removeCollaborator.mutate(userToRemove)}
      />
    </div>
  );
}
