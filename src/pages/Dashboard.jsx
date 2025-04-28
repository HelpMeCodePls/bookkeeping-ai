// src/pages/Dashboard.jsx
import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
import { api } from "../api/client"; 
import { fetchChartSummary } from "../services/chartService";
import { motion } from "framer-motion";
import { useLedger } from "../store/ledger";
import { useAuthStore } from "../store/auth";

export default function Dashboard() {
  const { currentId: ledgerId, month: selectedMonth } = useLedger();
  const token = useAuthStore((s) => s.token);
  // 使用 ledger 数据（含 budgets 和 spent）
  const { data: ledger } = useQuery({
    queryKey: ["ledgers", ledgerId],
    // queryFn: () => axios.get(`/ledgers/${ledgerId}`).then((r) => r.data),
    queryFn: () => api.get(`/ledgers/${ledgerId}`).then((r) => r.data), 
    enabled: !!ledgerId,
  });

  // 获取所有记录用于分类支出计算
  // const { data: recordsResponse = [] } = useQuery({
  //   queryKey: ["records-dashboard", ledgerId, selectedMonth],
  //   queryFn: async () => {
  //     try {
  //       const res = await axios.get(`/ledgers/${ledgerId}/records`, {
  //         params: { month: selectedMonth, token },
  //       });
  //       // 处理可能的响应格式
  //       if (Array.isArray(res.data)) {
  //         return res.data;
  //       } else if (Array.isArray(res.data?.data)) {
  //         return res.data.data;
  //       } else if (Array.isArray(res.data?.records)) {
  //         return res.data.records;
  //       }
  //       return [];
  //     } catch (e) {
  //       console.error("Failed to fetch records", e);
  //       return [];
  //     }
  //   },
  //   enabled: !!ledgerId && !!token,
  // });

    const { data: summary = { byCategory: {}, daily: [] } } = useQuery({
        queryKey: ["charts-dashboard", ledgerId, selectedMonth],
        queryFn: () =>
          fetchChartSummary({ ledgerId, mode: "month", selectedDate: selectedMonth }),
         enabled: !!ledgerId && !!token,
       });

  // 确保 records 是数组
  // const records = Array.isArray(recordsResponse) ? recordsResponse : [];

  // 从 ledger 中获取预算和支出
  const currentMonthBudget =
    ledger?.budgets?.months?.[selectedMonth] ?? ledger?.budgets?.default ?? 0;
  
  // summary.daily 形如 [ { date: '2025-04-01', value: 123 }, … ]
  const currentMonthSpent = summary.daily
    .reduce((sum, [, v]) => sum + (Number(v) || 0), 0);

  // console.log("currentMonthBudget", currentMonthBudget);
  // console.log("currentMonthSpent", currentMonthSpent);

  const rest = currentMonthBudget - currentMonthSpent;

  // 计算分类支出
  // const normalize = (str) => {
  //   if (!str) return "";
  //   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  // };

  const normalize = (s = "") =>
      s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
  
  const categorySpending = Object.fromEntries(
      Object.entries(summary.byCategory).map(([k, v]) => [normalize(k), v])
    ) || {};

  // const categorySpending = records
  //   .filter((r) => r.status === "confirmed")
  //   .reduce((acc, r) => {
  //     const normalized = normalize(r.category);
  //     acc[normalized] = (acc[normalized] || 0) + Number(r.amount || 0);
  //     return acc;
  //   }, {});

  // const categorySpending = summary.byCategory;

  const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25 },
  };

  return (
    <motion.div
      className="p-6 grid gap-6"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={fadeUp.transition}
    >
      {/* 顶部三栏卡片 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 总支出卡片 */}
        <motion.div
          className="bg-white shadow rounded-xl p-4"
          initial={fadeUp.initial}
          animate={fadeUp.animate}
          transition={fadeUp.transition}
        >
          <h3 className="text-gray-500 text-sm">Total Spent</h3>
          <p className="text-2xl font-semibold mt-1">
            ${currentMonthSpent.toFixed(2)}
          </p>
        </motion.div>

        {/* 剩余额度 */}
        <motion.div
          className="bg-white shadow rounded-xl p-4"
          initial={fadeUp.initial}
          animate={fadeUp.animate}
          transition={fadeUp.transition}
        >
          <h3 className="text-gray-500 text-sm">Budget Left</h3>
          <p
            className={`text-2xl font-semibold mt-1 ${
              rest < 0 ? "text-red-600" : ""
            }`}
          >
            ${rest.toFixed(2)}
          </p>
        </motion.div>

        {/* 当月预算 */}
        <motion.div
          className="bg-white shadow rounded-xl p-4"
          initial={fadeUp.initial}
          animate={fadeUp.animate}
          transition={fadeUp.transition}
        >
          <h3 className="text-gray-500 text-sm">Monthly Budget</h3>
          <p className="text-2xl font-semibold mt-1">
            ${currentMonthBudget.toFixed(2)}
          </p>
        </motion.div>
      </div>

      {/* 总预算进度条 */}
      <motion.div
        className="bg-white shadow rounded-xl p-4"
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={fadeUp.transition}
      >
        <h3 className="text-gray-500 text-sm mb-2">Monthly Budget Progress</h3>
        <div className="w-full h-4 bg-gray-200 rounded">
          <div
            style={{
              width: `${
                Math.min(currentMonthSpent / currentMonthBudget, 1) * 100
              }%`,
            }}
            className={`h-full rounded ${
              currentMonthSpent > currentMonthBudget
                ? "bg-red-500"
                : "bg-blue-600"
            }`}
          />
        </div>
        {currentMonthSpent > currentMonthBudget && (
          <p className="mt-2 text-sm text-red-600">
            ⚠️ Budget exceeded by $
            {(currentMonthSpent - currentMonthBudget).toFixed(2)}
          </p>
        )}
      </motion.div>

      {/* 分类预算进度条 */}
      <motion.div
        className="bg-white shadow rounded-xl p-4 space-y-4"
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={fadeUp.transition}
      >
        <h3 className="text-gray-500 text-sm">Category Budgets</h3>
        {ledger?.budgets?.categoryBudgets?.[selectedMonth] &&
          Object.entries(ledger.budgets.categoryBudgets[selectedMonth]).map(
            ([category, budget]) => (
              <div key={category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{category}</span>
                  <span>
                    ${(categorySpending[category] || 0).toFixed(2)} / $
                    {budget.toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded">
                  <div
                    style={{
                      width: `${Math.min(
                        ((categorySpending[category] || 0) / budget) * 100,
                        100
                      )}%`,
                    }}
                    className={`h-full rounded ${
                      (categorySpending[category] || 0) > budget
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  />
                </div>
              </div>
            )
          )}
      </motion.div>
    </motion.div>
  );
}
