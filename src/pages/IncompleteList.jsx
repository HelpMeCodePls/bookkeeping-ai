import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import EditRecordModal from '../components/EditRecordModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useLedger } from '../store/ledger'; // 需要拿 ledgerId
import dayjs from 'dayjs';

export default function IncompleteList() {
  const { currentId } = useLedger();
  const [target, setTarget] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ['incomplete', currentId],
    queryFn: () => axios.get('/records/incomplete').then(r => r.data),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => axios.get('/categories').then(r => r.data),
  });

  const mark = async (data) => {
    await axios.put(`/records/${target.id}`, { ...data, status: 'confirmed' });
    queryClient.invalidateQueries(['incomplete', currentId]);
    setTarget(null);
  };

  const handleDelete = async () => {
    await axios.delete(`/records/${deleteId}`);
    queryClient.invalidateQueries(['incomplete', currentId]);
    setDeleteId(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Incomplete Records</h2>

      {items.length === 0 && <p>✅ No incomplete records.</p>}

      <div className="flex flex-col gap-4">
        {items.map((r) => {
          const cat = categories.find(c => c.key === r.category?.toLowerCase());

          return (
            <div key={r.id} className="bg-white shadow rounded-xl p-4 flex items-center hover:bg-gray-50">
              {/* 左侧: 描述 + 分类 */}
              <div className="flex-1">
                <div className="font-medium">{r.description || '(No Description)'}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  {cat && <span className="text-lg">{cat.icon}</span>}
                  {r.category}
                </div>
              </div>

              {/* 中间: 金额 + 状态 */}
              <div className="flex flex-col items-end mr-8 min-w-[100px]">
                <div className="text-blue-600 font-bold text-lg">${Number(r.amount || 0).toFixed(2)}</div>
                <div className="mt-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-600">
                  Incomplete
                </div>
              </div>

              {/* 右侧: 编辑、删除按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setTarget(r)}
                  className="text-blue-600 text-xs hover:underline"
                >
                  ✎
                </button>
                <button
                  onClick={() => setDeleteId(r.id)}
                  className="text-red-600 text-xs hover:underline"
                >
                  🗑️
                </button>
              </div>
            </div>
          )
        })}
      </div>

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
