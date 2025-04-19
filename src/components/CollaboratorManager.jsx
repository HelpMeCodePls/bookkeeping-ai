import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import { useAuthStore } from '../store/auth';

export default function CollaboratorManager({ ledgerId, open, onClose }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('EDITOR');
  const [userToRemove, setUserToRemove] = useState(null);
  const token = useAuthStore(s => s.token);

  // 获取协作者列表
  const { data: collaborators = [] } = useQuery({
    queryKey: ['collaborators', ledgerId, token],
    queryFn: () => axios.get(`/ledgers/${ledgerId}/collaborators`, { params: { token } }).then(r => r.data),
    enabled: open && !!token,
  });

  // 获取用户基本信息
  const { data: users = [] } = useQuery({
    queryKey: ['users', token],
    queryFn: () => axios.get('/users', { params: { token } }).then(r => r.data),
    enabled: open && !!token,
  });

  // 添加协作者
  const addCollaborator = useMutation({
    mutationFn: (data) => axios.post(`/ledgers/${ledgerId}/collaborators`, data, { params: { token } }),
    onSuccess: async (data) => {
      await axios.post('/notifications', {
        type: 'collaboration',
        content: `You added ${data.email} as ${data.permission.toLowerCase()}`,
        ledgerId,
        metadata: { permission: data.permission },
      }, { params: { token } });
      queryClient.invalidateQueries(['collaborators', ledgerId, token]);
      queryClient.invalidateQueries(['notifications']);
      setEmail('');
    }
  });

  // 移除协作者
  const removeCollaborator = useMutation({
    mutationFn: (userId) => axios.delete(`/ledgers/${ledgerId}/collaborators/${userId}`, { params: { token } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['collaborators', ledgerId, token]);
      setUserToRemove(null);
    }
  });

  // 更新权限
  const updatePermission = useMutation({
    mutationFn: ({ userId, permission }) => 
      axios.patch(`/ledgers/${ledgerId}/collaborators/${userId}`, { permission }, { params: { token } }),
    onSuccess: () => queryClient.invalidateQueries(['collaborators', ledgerId, token])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addCollaborator.mutate({ email, permission });
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
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </form>

        {/* 协作者列表 */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {collaborators.map((collab) => {
            const user = users.find(u => u.id === collab.userId);
            return (
              <div key={collab.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{user?.name || collab.email}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="border px-2 py-1 rounded text-sm"
                    value={collab.permission}
                    onChange={(e) => 
                      updatePermission.mutate({
                        userId: collab.userId,
                        permission: e.target.value
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
                    disabled={collab.permission === 'OWNER'}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded border"
          >
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