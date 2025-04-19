import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import EditRecordModal from '../components/EditRecordModal';
import ConfirmDialog from '../components/ConfirmDialog'; // 要引入 ConfirmDialog 组件！

export default function IncompleteList() {
  const [target, setTarget] = useState(null);  // 当前正在编辑的记录
  const [deleteId, setDeleteId] = useState(null); // 当前准备删除的 id
  const queryClient = useQueryClient();

  const { data: items = [], refetch } = useQuery({
    queryKey: ['incomplete'],
    queryFn: () => axios.get('/records/incomplete').then((r) => r.data),
  });

  const mark = async (data) => {
    await axios.put(`/records/${target.id}`, { ...data, status: 'confirmed' });
    refetch();
    setTarget(null);
  };

  const handleDelete = async () => {
    await axios.delete(`/records/${deleteId}`);
    refetch();
    setDeleteId(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Incomplete Records</h2>

      {items.map((r) => (
        <div key={r.id} className="border p-3 mb-3 flex justify-between items-center">
          <span>{r.description || '(no desc)'}</span>
          <div className="space-x-2">
            <button
              className="text-blue-600 text-sm hover:underline"
              onClick={() => setTarget(r)}
            >
              ✎
            </button>
            <button
              className="text-red-600 text-sm hover:underline"
              onClick={() => setDeleteId(r.id)}
            >
              🗑️
            </button>
          </div>
        </div>
      ))}

      {!items.length && <p>✅ No incomplete records.</p>}

      {/* 编辑弹窗 */}
      <EditRecordModal
        open={!!target}
        record={target}
        onClose={() => setTarget(null)}
        onSubmit={mark}
      />

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={!!deleteId}
        msg="Are you sure to delete this record?"
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
