import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
import { api } from "../api/client"; 
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useLedger } from "../store/ledger";
import { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { motion } from "framer-motion";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f50",
  "#8dd1e1",
  "#d0ed57",
  "#a4de6c",
  "#d88884",
];

const thisMonth = dayjs().format("YYYY-MM");

export default function AnalysisPage() {
  const { currentId: ledgerId, month: currentMonth } = useLedger();
  const [mode, setMode] = useState("month");
  const [selectedDate, setSelectedDate] = useState("");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState({ key: "", order: "" });

  const pageSize = 10;

  // 获取 ledger 数据（包含 spent）
  const { data: ledger } = useQuery({
    queryKey: ["ledgers", ledgerId],
    // queryFn: () => axios.get(`/ledgers/${ledgerId}`).then((r) => r.data),
    queryFn: () => api.get(`/ledgers/${ledgerId}`).then(r => r.data),
    enabled: !!ledgerId,
  });

  // 获取分析数据
  const {
    data = { byCategory: {}, daily: [], minDate: "", maxDate: "" },
    isLoading,
  } = useQuery({
    queryKey: ["charts", ledgerId, mode, selectedDate],
    // queryFn: () =>
    //   axios
    //     .get("/charts/summary", { params: { ledgerId, mode, selectedDate } })
    //     .then((r) => r.data),
    queryFn: () =>
       api.get("/charts/summary", { params: { ledgerId, mode, selectedDate } })
          .then(r => r.data),
    enabled: !!ledgerId,
  });

  useEffect(() => {
    if (!selectedDate && mode !== "all") {
      const options = getOptionsByMode(mode);
      setSelectedDate(options[0] || "");
    }
  }, [mode, data.minDate, data.maxDate]);

  const pieData = useMemo(() => {
      const byCat = data?.byCategory ?? {};
      return Object.entries(byCat).map(([name, value]) => ({ name, value }))
    }, [data]);

  const lineData = useMemo(() => {
    const dailyArr = Array.isArray(data?.daily) ? data.daily : [];
    return dailyArr.map(([date, value]) => ({ date, value }));
  }, [data]);

  const barData = pieData;

  const top5 = [...pieData].sort((a, b) => b.value - a.value).slice(0, 5);

  // 使用 ledger.spent 计算总支出
  // const totalSpending = useMemo(() => {
  //   if (!ledger?.spent) return 0;
  //   if (mode === "all") {
  //     return Object.values(ledger.spent).reduce(
  //       (sum, amount) => sum + amount,
  //       0
  //     );
  //   }
  //   return ledger.spent[selectedDate] || 0;
  // }, [ledger?.spent, mode, selectedDate]);

  const totalSpending = useMemo(() => {
      // 直接用刚拿到的 summary
      if (mode === "all") {
        return Object.values(data.byCategory).reduce((s, a) => s + a, 0);
      }
      // month / week / year 用 daily 数组最保险
      return (data.daily ?? []).reduce((s, [ , v]) => s + Number(v || 0), 0);
    }, [data, mode]);

  const avgDaily = lineData.length
    ? (totalSpending / lineData.length).toFixed(2)
    : 0;

  const sorted = useMemo(() => {
    if (!sort.key) return lineData;
    const sortedData = [...lineData].sort((a, b) => {
      if (sort.order === "asc") return a[sort.key] > b[sort.key] ? 1 : -1;
      return a[sort.key] < b[sort.key] ? 1 : -1;
    });
    return sortedData;
  }, [lineData, sort]);

  const paginated = useMemo(() => {
    const start = page * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);

  function sortBy(key) {
    setSort((prev) => {
      if (prev.key !== key) return { key, order: "asc" };
      if (prev.order === "asc") return { key, order: "desc" };
      return { key: "", order: "" };
    });
    setPage(0);
  }

  function handleExportCSV() {
    if (paginated.length === 0) return;
    const header = ["Date", "Amount"];
    const rows = paginated.map((r) => [r.date, r.value.toFixed(2)]);
    const csvContent = [header, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `records_page${page + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function getOptionsByMode(mode) {
    const min = data.minDate
      ? dayjs(data.minDate)
      : dayjs().subtract(1, "year");
    const max = data.maxDate ? dayjs(data.maxDate) : dayjs();
    let options = [];

    if (mode === "week") {
      let start = min.startOf("week");
      while (start.isBefore(max)) {
        const end = start.endOf("week");
        options.push(
          `${start.format("YYYY-MM-DD")}~${end.format("YYYY-MM-DD")}`
        );
        start = start.add(1, "week");
      }
    } else if (mode === "month") {
      let start = min.startOf("month");
      while (start.isBefore(max)) {
        options.push(start.format("YYYY-MM"));
        start = start.add(1, "month");
      }
    } else if (mode === "year") {
      let startYear = min.year();
      const endYear = max.year();
      for (let y = startYear; y <= endYear; y++) {
        options.push(`${y}`);
      }
    }
    return options.reverse();
  }

  return (
    <motion.div
      className="p-6" // 根据页面需要调整
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }} // 可选：如果有路由切换，可以加 exit
      transition={{ duration: 0.25 }}
    >
      <div className="p-6 space-y-8">
        {/* 顶部筛选区 */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Analysis</h2>
          <div className="flex gap-2">
            {/* {["week", "month", "year", "all"].map((m) => ( */}
            {["month", "year", "all"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setSelectedDate("");
                }}
                className={`px-3 py-1 rounded-md ${
                  mode === m
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}

            {mode !== "all" && (
              <select
                className="border rounded px-2 py-1"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                {getOptionsByMode(mode).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* 总览卡片 - 与 Dashboard 保持相同样式 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white shadow rounded-xl p-4 text-center">
            <h3 className="text-gray-500 text-sm">Total Spent</h3>
            <p className="text-xl font-semibold mt-1">
              ${totalSpending.toFixed(2)}
            </p>
          </div>
          <div className="bg-white shadow rounded-xl p-4 text-center">
            <h3 className="text-gray-500 text-sm">Avg Daily</h3>
            <p className="text-xl font-semibold mt-1">${avgDaily}</p>
          </div>
          <div className="bg-white shadow rounded-xl p-4 text-center">
            <h3 className="text-gray-500 text-sm">Days</h3>
            <p className="text-xl font-semibold mt-1">{lineData.length}</p>
          </div>
          <div className="bg-white shadow rounded-xl p-4 text-center">
            <h3 className="text-gray-500 text-sm">Categories</h3>
            <p className="text-xl font-semibold mt-1">{pieData.length}</p>
          </div>
        </div>

        {/* 折线图 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-blue-600 font-semibold mb-4">Daily Trend</h3>
          {isLoading ? (
            <div className="h-60 flex justify-center items-center">
              Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 柱状图 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-blue-600 font-semibold mb-4">
            Spending by Category
          </h3>
          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              Loading Chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value">
                  {barData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 饼图 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-blue-600 font-semibold mb-4">Spending Share</h3>
          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              Loading Chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top 5 排行榜 */}
        {top5.length > 0 && (
          <div className="bg-white shadow p-4 rounded-lg">
            <h3 className="text-blue-600 font-semibold mb-4">
              Top 5 Categories
            </h3>
            <ul className="space-y-2">
              {top5.map((c, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>
                    {idx + 1}. {c.name}
                  </span>
                  <span className="font-semibold">${c.value.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Record Table */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-blue-600 font-semibold">Record Table</h3>
            <button className="btn-ghost" onClick={handleExportCSV}>
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  {["date", "value"].map((col) => (
                    <th
                      key={col}
                      className={`p-2 cursor-pointer ${
                        col === "value" ? "text-right" : "text-left"
                      }`}
                      onClick={() => sortBy(col)}
                    >
                      {col.toUpperCase()}{" "}
                      {sort.key === col && (sort.order === "asc" ? "↑" : "↓")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((r, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2">{r.date}</td>
                    <td className="p-2 text-blue-600 font-semibold text-right">
                      ${r.value.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
