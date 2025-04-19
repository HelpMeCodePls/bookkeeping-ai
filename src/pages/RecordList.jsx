import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import EditRecordModal from "../components/EditRecordModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useLedger } from "../store/ledger";

export default function RecordList() {
  const { currentId, month } = useLedger();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");

  /* state */
  const [editRec, setEditRec] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: records = [] } = useQuery({
    queryKey: ["records", keyword, currentId, month],
    queryFn: () =>
      axios
        .get(`/ledgers/${currentId}/records`, { params: { keyword, month } })
        .then((r) => r.data),
  });

  /* delete 函数 */
  const deleteRec = async (id) => {
    await axios.delete(`/records/${id}`);
    queryClient.invalidateQueries(["records", keyword, currentId]);
    setDeleteId(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Records</h2>

      {/* 搜索 + 新增按钮 */}
      <div className="flex justify-between items-center mb-4">
        <input
          className="border px-2 py-1 w-56"
          placeholder="Search description"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button
          className="btn-primary"
          onClick={() => setEditRec({})} // ✅ 点新增，传空对象
        >
          ＋ New
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Desc</th>
            <th className="text-right p-2">Amount</th>
            <th className="text-left p-2">Cat</th>
            <th className="text-center p-2">Status</th>
            <th className="text-right p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{r.date}</td>
              <td className="p-2">{r.description}</td>
              <td className="p-2 text-right">
                ${r.amount !== undefined ? Number(r.amount).toFixed(2) : '--'}
             </td>
              <td className="p-2">{r.category}</td>
              <td className="p-2 text-center">{r.status}</td>
              <td className="p-2 text-right space-x-2">
                <button
                  onClick={() => setEditRec(r)}
                  className="text-blue-600 text-sm"
                >
                  ✎
                </button>
                <button
                  onClick={() => setDeleteId(r.id)}
                  className="text-red-600 text-sm"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 编辑弹窗 */}
      <EditRecordModal
        open={!!editRec}
        record={editRec}
        isNew={editRec && !editRec.id} // ✅ 如果没有 id，说明是新建
        onClose={() => setEditRec(null)}
      />

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={!!deleteId}
        msg="Are you sure to delete this record?"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteRec(deleteId)}
      />
    </div>
  );
}
