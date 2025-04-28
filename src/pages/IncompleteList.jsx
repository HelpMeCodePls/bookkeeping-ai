import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// import axios from "axios";
import { api } from "../api/client"; 
import EditRecordModal from "../components/EditRecordModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useLedger } from "../store/ledger";
import dayjs from "dayjs";
import { motion } from "framer-motion";

export default function IncompleteList() {
  const { currentId } = useLedger();
  const [target, setTarget] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["incomplete", currentId],
    // queryFn: () => axios.get("/records/incomplete").then((r) => r.data),
      queryFn: () =>
          api.get(`/ledgers/${currentId}/records`, {
            params: { status: "incomplete" }   // ① 后端已经支持 status 过滤
          }).then(r => r.data),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    // queryFn: () => axios.get("/categories").then((r) => r.data),
    queryFn: () => api.get("/categories").then(r => r.data),
  });

  const mark = async (data) => {
    // await axios.put(`/records/${target.id}`, { ...data, status: "confirmed" });
    await api.put(`/records/${target.id}`, {
      ...data,
      status: "confirmed",
    });
    queryClient.invalidateQueries(["incomplete", currentId]);
    setTarget(null);
  };

  const handleDelete = async () => {
    // await axios.delete(`/records/${deleteId}`);
    await api.delete(`/records/${deleteId}`);
    queryClient.invalidateQueries(["incomplete", currentId]);
    setDeleteId(null);
  };

  return (
    <motion.div
      className="p-6" // 根据页面需要调整
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }} // 可选：如果有路由切换，可以加 exit
      transition={{ duration: 0.25 }}
    >
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Incomplete Records</h2>

        {items.length === 0 && (
          <div className="bg-white shadow rounded-xl p-6 text-center text-gray-500">
            ✅ No incomplete records.
          </div>
        )}

        <div className="flex flex-col gap-6">
          {items.map((r) => {
            const cat = categories.find(
              (c) => c.key === r.category?.toLowerCase()
            );

            return (
              <div
                key={r.id}
                className="bg-white shadow rounded-xl p-4 flex items-center hover:bg-gray-50 transition-colors"
              >
                {/* 左侧: 分类图标 */}
                <div className="mr-3 text-2xl">{cat?.icon || "📁"}</div>

                {/* 中间: 描述 + 分类 */}
                <div className="flex-1">
                  <div className="font-medium">
                    {r.description || "(No Description)"}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {cat?.label || r.category}
                  </div>
                </div>

                {/* 右侧: 金额 + 状态 + 操作按钮 */}
                <div className="flex items-center gap-4">
                  {/* 金额和状态 */}
                  <div className="flex flex-col items-end mr-4 min-w-[100px]">
                    <div className="text-blue-600 font-bold text-lg">
                      ${Number(r.amount || 0).toFixed(2)}
                    </div>
                    <div className="mt-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-600">
                      Incomplete
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTarget(r)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteId(r.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
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
    </motion.div>
  );
}
