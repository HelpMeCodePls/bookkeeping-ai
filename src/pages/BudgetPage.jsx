import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLedger } from "../store/ledger";
import axios from "axios";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function BudgetPage() {
  const { currentId, month: currentMonth } = useLedger();
  const queryClient = useQueryClient();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [editMonthBudget, setEditMonthBudget] = useState("");
  const [catEdits, setCatEdits] = useState({});
  const [showSaved, setShowSaved] = useState(false);

  // 修改获取 ledger 的查询，确保包含 spent
  const { data: ledger } = useQuery({
    queryKey: ["ledgers", currentId],
    queryFn: () =>
      axios.get(`/ledgers/${currentId}`).then((r) => ({
        ...r.data,
        spent: r.data.spent || {}, // 确保 spent 总是对象
      })),
    enabled: !!currentId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => axios.get("/categories").then((r) => r.data),
  });

  // 添加预算检查函数
  const checkBudget = async (month) => {
    try {
      const { data: summary } = await axios.get("/charts/summary", {
        params: {
          ledgerId: currentId,
          mode: "month",
          selectedDate: month,
        },
      });

      const catBudgets = ledger.budgets?.categoryBudgets?.[month] || {};
      const defaultCatBudgets = ledger.budgets?.categoryDefaults || {};

      Object.entries(summary.byCategory).forEach(async ([category, amount]) => {
        const budget = catBudgets[category] || defaultCatBudgets[category];
        if (budget && amount > budget) {
          await axios.post("/notifications", {
            type: "budget",
            content: `Budget exceeded in ${category} (${amount.toFixed(
              2
            )} > ${budget.toFixed(2)})`,
            ledgerId: currentId,
            metadata: {
              category,
              amount,
              budget,
            },
          });
          queryClient.invalidateQueries(["notifications"]);
        }
      });
    } catch (error) {
      console.error("Budget check failed:", error);
    }
  };

  const save = useMutation({
    mutationFn: (payload) =>
      axios.patch(`/ledgers/${currentId}/budgets`, payload),
    onSuccess: (_, payload) => {
      // 手动更新本地数据，避免重新获取
      queryClient.setQueryData(["ledgers", currentId], (oldData) => {
        if (!oldData) return oldData;

        const updatedData = { ...oldData };

        // 更新月预算
        if (!payload.category) {
          updatedData.budgets = updatedData.budgets || {};

          if (payload.setDefault) {
            updatedData.budgets.default = Number(payload.budget);
          } else {
            updatedData.budgets.months = updatedData.budgets.months || {};
            updatedData.budgets.months[payload.month] = Number(payload.budget);
          }
        }
        // 更新分类预算
        else {
          updatedData.budgets.categoryBudgets =
            updatedData.budgets.categoryBudgets || {};
          updatedData.budgets.categoryBudgets[payload.month] =
            updatedData.budgets.categoryBudgets[payload.month] || {};

          if (payload.setDefault) {
            updatedData.budgets.categoryDefaults =
              updatedData.budgets.categoryDefaults || {};
            updatedData.budgets.categoryDefaults[payload.category] = Number(
              payload.budget
            );
          } else {
            updatedData.budgets.categoryBudgets[payload.month][
              payload.category
            ] = Number(payload.budget);
          }
        }

        return updatedData;
      });

      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
      // 添加预算检查
      if (!payload.category) {
        // 只在月预算变更时检查
        checkBudget(payload.month || selectedMonth);
      }
    },
  });

  useEffect(() => {
    setEditMonthBudget("");
    setCatEdits({});
  }, [selectedMonth]);

  if (!ledger) return <div className="p-6">Loading...</div>;

  const monthBudget =
    ledger.budgets?.months?.[selectedMonth] ?? ledger.budgets?.default ?? 0;
  const catBudgets = ledger.budgets?.categoryBudgets?.[selectedMonth] || {};
  const defaultCatBudgets = ledger.budgets?.categoryDefaults || {};
  const spent = ledger.spent?.[selectedMonth] ?? 0;

  function handleSaveMonth(isDefault = false) {
    const newBudget = Number(editMonthBudget);
    if (isNaN(newBudget)) return;
    if (isDefault && !window.confirm("Set as default for all months?")) return;

    save.mutate({
      month: selectedMonth,
      budget: newBudget,
      setDefault: isDefault,
    });
  }

  function handleSaveCategory(category, isDefault = false) {
    const newBudget = Number(catEdits[category]?.budget);
    if (isNaN(newBudget)) return;
    if (isDefault && !window.confirm(`Set default budget for ${category}?`))
      return;

    save.mutate({
      month: selectedMonth,
      category,
      budget: newBudget,
      setDefault: isDefault,
    });
  }

  const monthOptions = (() => {
    const now = new Date();
    const options = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      );
    }
    return options;
  })();

  return (
    <motion.div
      className="p-6" // 根据页面需要调整
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }} // 可选：如果有路由切换，可以加 exit
      transition={{ duration: 0.25 }}
    >
      <div className="p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Budget Management</h2>
          <select
            className="border rounded px-2 py-1"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {monthOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 保存成功提示 */}
        {showSaved && (
          <div className="text-green-600 font-semibold">Saved!</div>
        )}

        {/* 总结卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded shadow bg-white text-center">
            <div className="text-gray-500 text-sm mb-1">Month Budget</div>
            <div className="text-xl font-bold">${monthBudget.toFixed(2)}</div>
          </div>
          <div className="p-4 rounded shadow bg-white text-center">
            <div className="text-gray-500 text-sm mb-1">Spent</div>
            <div className="text-xl font-bold">${spent.toFixed(2)}</div>
          </div>
          <div className="p-4 rounded shadow bg-white text-center">
            <div className="text-gray-500 text-sm mb-1">Remaining</div>
            <div className="text-xl font-bold">
              ${(monthBudget - spent).toFixed(2)}
            </div>
          </div>
        </div>

        {/* 月预算编辑 */}
        <div className="bg-white p-6 rounded shadow mb-8">
          <h3 className="text-blue-600 font-semibold mb-4">Monthly Budget</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={editMonthBudget}
              placeholder={monthBudget}
              onChange={(e) => setEditMonthBudget(e.target.value)}
              className="border p-2 rounded w-32"
            />
            <button
              className="btn-primary"
              onClick={() => handleSaveMonth(false)}
            >
              Save
            </button>
            <button className="btn-ghost" onClick={() => handleSaveMonth(true)}>
              Set Default
            </button>
          </div>
        </div>

        {/* 分类预算编辑 */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-blue-600 font-semibold mb-4">Category Budgets</h3>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div key={cat.key} className="flex items-center gap-2">
                <div className="w-40 flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>
                <input
                  type="number"
                  placeholder={
                    catBudgets[cat.label] ?? defaultCatBudgets[cat.label] ?? ""
                  }
                  value={catEdits[cat.label]?.budget ?? ""}
                  onChange={(e) =>
                    setCatEdits((prev) => ({
                      ...prev,
                      [cat.label]: {
                        ...prev[cat.label],
                        budget: e.target.value,
                      },
                    }))
                  }
                  className="border p-2 rounded w-24"
                />
                <button
                  className="btn-primary"
                  onClick={() => handleSaveCategory(cat.label, false)}
                >
                  Save
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => handleSaveCategory(cat.label, true)}
                >
                  Set Default
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
