import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { useLedger } from '../store/ledger'; // 注意引入 useLedger

export default function LedgerManager() {
  const qc = useQueryClient();
  const { currentId, setId, budget, setBudget } = useLedger(); // 从全局 store 取 currentId 和 budget

  const [name, setName] = useState('');

  const { data: ledgers = [] } = useQuery({
    queryKey: ['ledgers'],
    queryFn: () => axios.get('/ledgers').then((r) => r.data ?? []),
  });

  const create = useMutation({
    mutationFn: () => axios.post('/ledgers', { name, budget: 1000 }),
    onSuccess: () => {
      qc.invalidateQueries(['ledgers']);
      setName('');
    },
  });

  const updateBudget = useMutation({
    mutationFn: () => axios.patch(`/ledgers/${currentId}/budget`, { budget: Number(budget) }),
    onSuccess: () => {
      qc.invalidateQueries(['ledgers']);
    },
  });

  const list = Array.isArray(ledgers) ? ledgers : [];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Ledgers</h2>

      {/* 账本列表 */}
      <div className="space-y-2 max-w-md mb-6">
        {list.map((l) => (
          <div
            key={l._id}
            className={`border p-2 cursor-pointer ${currentId === l._id ? 'bg-blue-100' : ''}`}
            onClick={() => { setId(l._id); setBudget(l.budget) }}
          >
            {l.name}
          </div>
        ))}
      </div>

      {/* 预算编辑 */}
      {currentId && (
        <div className="flex items-center mb-6 space-x-2">
          <input
            className="border px-2 py-1 w-28"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => updateBudget.mutate()}
          >
            Save Budget
          </button>
        </div>
      )}

      {/* 新增账本 */}
      <div className="flex items-center space-x-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-2 py-1"
          placeholder="New ledger name"
        />
        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          onClick={() => create.mutate()}
        >
          Add
        </button>
      </div>
    </div>
  );
}
