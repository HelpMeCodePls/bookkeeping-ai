import { useQuery, useQueryClient } from "@tanstack/react-query";
// import axios from "axios";
import {
  fetchRecords,
  deleteRecord as apiDeleteRecord,
} from "../handlers/recordHandlers";
import { fetchCategories } from "../services/categoryService";
import { fetchUsers } from "../services/userService";
import { useState, useMemo, Fragment } from "react";
import EditRecordModal from "../components/EditRecordModal";
import ConfirmDialog from "../components/ConfirmDialog";
import FilterDrawer from "../components/FilterDrawer";
import dayjs from "dayjs";
import { useLedger } from "../store/ledger";
import { useAuthStore } from "../store/auth";
import { motion } from "framer-motion";

export default function RecordList() {
  const { currentId, month } = useLedger();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);

  const [keyword, setKeyword] = useState("");
  const [editRec, setEditRec] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    split: "",
    collaborator: "",
  });

  // console.log("currentId", currentId);

  const { data: users = [] } = useQuery({
    queryKey: ["users", token],
    // queryFn: () =>
    //   axios.get("/users", { params: { token } }).then((r) => r.data),
    queryFn: () => fetchUsers(token),
    enabled: !!token,
  });

  const findUser = (id) => users.find((u) => u.id === id) || {};

  // const { data: records = [] } = useQuery({
  //   queryKey: ["records", keyword, currentId, month, filters, token],
  //   queryFn: () =>
  //     axios
  //       .get(`/ledgers/${currentId}/records`, {
  //         params: {
  //           token, // ⭐加token
  //           keyword,
  //           month,
  //           categories:
  //             filters.categories.length > 0
  //               ? filters.categories.join(",")
  //               : undefined,
  //           split: filters.split || undefined,
  //         },
  //       })
  //       .then((r) => r.data),

  const { data: records = [] } = useQuery({
    queryKey: ["records", keyword, currentId, month, filters, token],
    queryFn: () =>
      fetchRecords({
        ledgerId: currentId,
        // month,
        month: month || undefined,
        categories: filters.categories,
        split: filters.split || undefined,
        collaborator: filters.collaborator || undefined,
        token: token,
      }),

    enabled: !!currentId && !!token,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", token],
    // queryFn: () =>
    //   axios.get("/categories", { params: { token } }).then((r) => r.data),
    queryFn: fetchCategories,
    enabled: !!token,
  });

  const grouped = useMemo(
    () =>
      records.reduce((acc, r) => {
        // (acc[r.date] = acc[r.date] || []).push(r);
        const day = (r.date || "").slice(0, 10); // "2025-01-10"
        (acc[day] = acc[day] || []).push(r);
        return acc;
      }, {}),
    [records]
  );

  const selectedCategoryNames = useMemo(() => {
    if (!filters.categories.length) return [];
    return filters.categories.map(
      (cat) => categories.find((c) => c.key === cat.toLowerCase())?.label || cat
    );
  }, [filters.categories, categories]);

  // const deleteRec = async (id) => {
  //   await axios.delete(`/records/${id}`, { params: { token } });
  const deleteRec = async (id) => {
    await apiDeleteRecord(id);
    queryClient.invalidateQueries([
      "records",
      keyword,
      currentId,
      month,
      filters,
      // token,
    ]);
    setDeleteId(null);
  };

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
    >
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Records</h2>

        <div className="flex justify-between items-center mb-4">
          <input
            className="border px-2 py-1 w-56 rounded"
            placeholder="Search description"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <div className="flex items-center gap-3">
            {selectedCategoryNames.length > 0 && (
              <div className="text-sm text-gray-600">
                Filtered by: {selectedCategoryNames.join(", ")}
              </div>
            )}
            <button
              className="btn-ghost flex items-center gap-1"
              onClick={() => setDrawerOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filter
            </button>
            <button className="btn-primary" onClick={() => setEditRec({})}>
              ＋ New
            </button>
          </div>
        </div>

        {Object.entries(grouped)
          .sort(([d1], [d2]) => d2.localeCompare(d1))
          .map(([date, list]) => {
            const total = list.reduce(
              (sum, r) => sum + Number(r.amount || 0),
              0
            );
            return (
              <div key={date} className="bg-white shadow rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {dayjs(date).format("MMM DD, YYYY")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Total:{" "}
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {list.map((r) => {
                    const category = categories.find(
                      (c) => c.key === r.category?.toLowerCase()
                    );
                    return (
                      <div
                        key={r.id}
                        className="flex items-center border p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="mr-3 text-2xl">
                          {category?.icon || "📁"}
                        </div>

                        <div className="flex-1">
                          <div className="font-medium">
                            {r.description || "(No Description)"}
                          </div>
                          <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <span>{category?.label || r.category}</span>
                            {r.createdBy && (
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                {findUser(r.createdBy)?.avatar || "👤"}
                                {findUser(r.createdBy)?.name || "Unknown"}
                              </span>
                            )}
                          </div>

                          {r.split?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {r.split.map((s, i) => {
                                const splitUser = findUser(s.user_id);
                                return (
                                  <span
                                    key={i}
                                    className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1"
                                  >
                                    {splitUser?.avatar || "👤"}
                                    {splitUser?.name || s.user_id}: $
                                    {s.amount.toFixed(2)}
                                    {s.ratio && ` (${s.ratio}%)`}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end mr-4 min-w-[100px]">
                          <div className="text-blue-600 font-bold text-lg">
                            ${Number(r.amount || 0).toFixed(2)}
                          </div>
                          {r.status !== "confirmed" && (
                            <div className="mt-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-600">
                              {r.status
                                ? r.status.charAt(0).toUpperCase() +
                                  r.status.slice(1)
                                : "Unknown"}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setEditRec(r)}
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
                    );
                  })}
                </div>
              </div>
            );
          })}

        <EditRecordModal
          open={!!editRec}
          record={{
            ...editRec,
            ledger_id: currentId,
          }}
          isNew={editRec && !editRec.id}
          onClose={() => setEditRec(null)}
        />

        <ConfirmDialog
          open={!!deleteId}
          msg="Are you sure to delete this record?"
          onCancel={() => setDeleteId(null)}
          onConfirm={() => deleteRec(deleteId)}
        />

        <FilterDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          filters={filters}
          setFilters={setFilters}
          categories={categories}
        />
      </div>
    </motion.div>
  );
}
