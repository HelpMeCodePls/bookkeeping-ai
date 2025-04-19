import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { useLedger } from '../store/ledger';

export default function LedgerManager() {
  const qc = useQueryClient();
  const { currentId, setId, budget, setBudget, month } = useLedger();

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
    mutationFn: () => axios.patch(`/ledgers/${currentId}/budget`, { month, budget }),
    onSuccess: () => {
      qc.invalidateQueries(['ledgers']);
    },
  });

  const list = Array.isArray(ledgers) ? ledgers : [];

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold mb-6">Ledger Manager</h2>

      {/* Ledger 列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((l) => (
          <div
            key={l._id}
            className={`border shadow rounded-lg p-4 cursor-pointer hover:shadow-lg transition ${currentId === l._id ? 'border-blue-500' : ''}`}
            onClick={() => { setId(l._id); setBudget(l.budget); }}
          >
            <h3 className="text-lg font-semibold mb-2">{l.name}</h3>
            <p className="text-sm text-gray-500">Budget: ${l.budget || 0}</p>
          </div>
        ))}
      </div>

      {/* 编辑预算 */}
      {currentId && (
        <div className="bg-white shadow rounded-lg p-4 mt-8">
          <h3 className="text-blue-600 font-semibold mb-4">Edit Budget for this Ledger</h3>
          <div className="flex items-center space-x-2">
            <input
              className="border px-2 py-1 w-32"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-4 py-1 rounded"
              onClick={() => updateBudget.mutate()}
            >
              Save
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">* Current Month: {month}</p>
        </div>
      )}

      {/* 新增账本 */}
      <div className="bg-white shadow rounded-lg p-4 mt-8">
        <h3 className="text-green-600 font-semibold mb-4">Create New Ledger</h3>
        <div className="flex items-center space-x-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-2 py-1"
            placeholder="Ledger Name"
          />
          <button
            className="bg-green-600 text-white px-4 py-1 rounded"
            onClick={() => create.mutate()}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
