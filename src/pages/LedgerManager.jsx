import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import axios from "axios";
import {
    fetchLedgers,
    fetchLedgerPermission,
    createLedger,
} from "../handlers/ledgerHandlers";
import { useState } from "react";
import { useLedger } from "../store/ledger";
import CollaboratorManager from "../components/CollaboratorManager";
import { useAuthStore } from "../store/auth";
import { motion } from "framer-motion";

export default function LedgerManager() {
  const [openCM, setOpenCM] = useState(false);

  const { currentId, setId } = useLedger();
  const selectLedger = useLedger(s => s.select); 
  const [name, setName] = useState("");
  const [showCollaboratorManager, setShowCollaboratorManager] = useState(null);
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const { data: ledgers = [] } = useQuery({
    queryKey: ["ledgers", token], // queryKey也带token，不然不会刷新
    // queryFn: () =>
    //   axios.get("/ledgers", { params: { token } }).then((r) => r.data ?? []),
    queryFn: fetchLedgers,
    enabled: !!token, //  只有有token时才请求
  });

  // 获取用户权限
  const { data: permission } = useQuery({
    queryKey: ["permission", currentId, token], //  queryKey也加token，防止token变化时数据不更新
    // queryFn: () =>
    //   currentId && token
    //     ? axios
    //         .get(`/ledgers/${currentId}/permission`, { params: { token } })
    //         .then((r) => r.data)
    //     : Promise.resolve({}),
    queryFn: () =>
          currentId && currentId !== "demoLedger"
            ? fetchLedgerPermission(currentId)
            : Promise.resolve({}),
    enabled: !!currentId && !!token,
    retry: 1,
  });

  const create = useMutation({
    // mutationFn: () => axios.post("/ledgers", { name, budget: 1000, token }),
    mutationFn: () => createLedger({ name, budget: 1000 }),
    onSuccess: (newLedger) => {
      setName("");
      setId(newLedger._id);
      // setTimeout(() => setShowCollaboratorManager(newLedger._id), 0);
      setTimeout(() => setShowCollaboratorManager(newLedger.id), 0);
      qc.invalidateQueries(["ledgers"]);
    },
  });

  return (
    <motion.div
      className="p-6" // 根据页面需要调整
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }} // 可选：如果有路由切换，可以加 exit
      transition={{ duration: 0.25 }}
    >
      <div className="p-6 space-y-8">
        <h2 className="text-2xl font-bold mb-6">Ledger Manager</h2>

        {/* Ledger 列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ledgers.map((l) => (
            <div
              key={l._id}
              className={`border shadow rounded-lg p-4 cursor-pointer hover:shadow-lg transition ${
                currentId === l._id ? "border-blue-500" : ""
              }`}
              // onClick={() => setId(l._id)}
              onClick={() => selectLedger(l)}
              
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{l.name}</h3>
                  <p className="text-sm text-gray-500">
                    {l.collaborators?.length || 0} collaborators
                  </p>
                </div>
                {currentId === l._id && permission?.permission === "OWNER" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCollaboratorManager(l._id);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Manage
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 新增账本 */}
        <div className="bg-white shadow rounded-lg p-4 mt-8">
          <h3 className="text-green-600 font-semibold mb-4">
            Create New Ledger
          </h3>
          <div className="flex items-center space-x-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border px-3 py-2 rounded flex-1"
              placeholder="Ledger Name"
            />
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => create.mutate()}
            >
              Add
            </button>
          </div>
        </div>

        {/* 协作者管理弹窗 */}
        {showCollaboratorManager && (
          <CollaboratorManager
            ledgerId={showCollaboratorManager}
            open={!!showCollaboratorManager}
            onClose={() => setShowCollaboratorManager(null)}
          />
        )}
      </div>
    </motion.div>
  );
}
