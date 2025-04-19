import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import EditRecordModal from "../components/EditRecordModal";
import ConfirmDialog from "../components/ConfirmDialog";
import FilterDrawer from "../components/FilterDrawer";
import DateGroupRow from "../components/DateGroupRow";
import dayjs from "dayjs";
import { useLedger } from "../store/ledger";
import { Fragment } from "react";

export default function RecordList() {
  const { currentId, month } = useLedger();
  const queryClient = useQueryClient();

  const [keyword, setKeyword] = useState("");
  const [editRec, setEditRec] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({ categories: [], split: "" });

  const { data: records = [] } = useQuery({
    queryKey: ["records", keyword, currentId, month, filters],
    queryFn: () =>
      axios
        .get(`/ledgers/${currentId}/records`, {
          params: {
            keyword,
            month,
            categories: filters.categories.join(","),
            split: filters.split,
          },
        })
        .then((r) => r.data),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => axios.get('/categories').then(r => r.data),
  });
  

  const deleteRec = async (id) => {
    await axios.delete(`/records/${id}`);
    queryClient.invalidateQueries(["records", keyword, currentId, month, filters]);
    setDeleteId(null);
  };

  // ✨ 按日期分组
  const grouped = records.reduce((acc, r) => {
    (acc[r.date] = acc[r.date] || []).push(r);
    return acc;
  }, {});


  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Records</h2>
  
      {/* 搜索 + 按钮 */}
      <div className="flex justify-between items-center mb-4">
        <input
          className="border px-2 py-1 w-56"
          placeholder="Search description"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <div className="space-x-2">
          <button className="btn-ghost" onClick={() => setDrawerOpen(true)}>
            Filter
          </button>
          <button className="btn-primary" onClick={() => setEditRec({})}>
            ＋ New
          </button>
        </div>
      </div>
  
      {/* 日期卡片区域 */}
      {Object.entries(grouped)
        .sort(([d1], [d2]) => d2.localeCompare(d1))
        .map(([date, list]) => {
          const total = list.reduce((sum, r) => sum + Number(r.amount || 0), 0)
          return (
            <div key={date} className="bg-white shadow rounded-xl p-4 mb-6">
              {/* 日期 + 总支出 */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{dayjs(date).format('MMM DD, YYYY')}</h3>
                <p className="text-sm text-gray-600">
                  Total: <span className="font-semibold">${total.toFixed(2)}</span>
                </p>
              </div>
  
              {/* 每条记录 */}
              <div className="flex flex-col gap-2">
                {list.map((r) => {
                  const cat = categories.find(c => c.key === r.category?.toLowerCase())
                  return (
<div key={r.id} className="flex items-center border p-3 rounded hover:bg-gray-50">
  {/* 左侧: 描述 + 分类 */}
  <div className="flex-1">
    <div className="font-medium">{r.description || "(No Description)"}</div>
    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
      {cat && <span className="text-lg">{cat.icon}</span>}
      {r.category}
    </div>
  </div>

  {/* 中间: 金额 + 状态 */}
  <div className="flex flex-col items-end mr-8 min-w-[100px]">
    <div className="text-blue-600 font-bold text-lg">${Number(r.amount || 0).toFixed(2)}</div>
    {r.status !== 'confirmed' && (
      <div className="mt-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-600">
        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
      </div>
    )}
  </div>

  {/* 右侧: 编辑、删除按钮 */}
  <div className="flex gap-2">
    <button
      onClick={() => setEditRec(r)}
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
            </div>
          )
        })}
  
      {/* 编辑弹窗 */}
      <EditRecordModal
        open={!!editRec}
        record={editRec}
        isNew={editRec && !editRec.id}
        onClose={() => setEditRec(null)}
      />
  
      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={!!deleteId}
        msg="Are you sure to delete this record?"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteRec(deleteId)}
      />
  
      {/* 筛选 Drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  )
  
  ;
}
