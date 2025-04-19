// src/layouts/MainLayout.jsx
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Home,
  List,
  Plus,
  AlertTriangle,
  PieChart,
  Book,
  Bell,
  PiggyBank
} from "lucide-react"; // ← 加 Bell
import axios from "axios"; // ← 缺失的导入
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";
import ChatbotDrawer from "../components/ChatbotDrawer";
import LedgerSelector from "../components/LedgerSelector";
import MonthSelector from "../components/MonthSelector"; 
import ConnectionIndicator from "../components/ConnectionIndicator"; // ← 新增导入
import socketService from "../utils/socket";
import { useEffect } from "react"; // ← 新增导入

const menu = [
  { path: "/dashboard", label: "Dashboard", icon: <Home size={18} /> },
  { path: "/records", label: "Records", icon: <List size={18} /> },
//   { path: "/add-record", label: "Add", icon: <Plus size={18} /> },
  {
    path: "/incomplete",
    label: "Incomplete",
    icon: <AlertTriangle size={18} />,
  },
//   { path: "/charts", label: "Charts", icon: <PieChart size={18} /> },
  { path: "/books", label: "Ledgers", icon: <Book size={18} /> },
  { path: "/alerts", label: "Alerts", icon: <Bell size={18} /> },
  { path: "/analysis", label: "Analysis", icon: <PieChart size={18} /> },
  { path: "/budget", label: "Budget", icon: <PiggyBank size={18} /> },
];

export default function MainLayout() {
    const { token } = useAuthStore()

    useEffect(() => {
        if (token) {
          console.log('Connecting WebSocket with token:', token)
          socketService.connect(token)
          
          socketService.on('connect', () => {
            console.log('WebSocket connected!')
          })
          
          socketService.on('notification', (data) => {
            console.log('Received notification:', data)
          })
        }
        
        return () => {
          console.log('Cleaning up WebSocket...')
          socketService.disconnect()
        }
      }, [token])

    const loc = useLocation();
  const logout = useAuthStore((s) => s.logout);

  // 轮询未读数
  const { data: notif = { count: 0 } } = useQuery({
    queryKey: ["unread"],
    queryFn: () => axios.get("/notifications/unread_count").then((r) => r.data),
    refetchInterval: 10_000,
  });

  return (
    <div className="flex h-screen">
      <aside className="w-48 border-r p-4 space-y-2">
        {menu.map(({ path, label, icon }) => {
          const active = loc.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`relative flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 ${
                active ? "bg-gray-200 font-medium" : ""
              }`}
            >
              {/* 图标 */}
              {icon}
              {/* 标签文字 */}
              {label}
              {/* 红点 */}
              {label === "Alerts" && notif.count > 0 && (
                <span className="absolute -top-1 left-4 inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full bg-red-600 text-white">
                  {notif.count}
                </span>
              )}
            </Link>
          );
        })}
        <button onClick={logout} className="mt-4 text-sm text-red-500">
          Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* header */}
        <header className="h-14 flex items-center justify-between px-6 border-b">
          {/* 🧩 改这里：左侧 Ledger 和 Month 并排 */}
          <div className="flex items-center gap-4">
            <LedgerSelector />
            <MonthSelector />
          </div>
          <div className="flex items-center gap-4">
             <ConnectionIndicator />
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 overflow-y-auto px-6 py-4">
          <Outlet />
        </main>
      </div>

      <ChatbotDrawer />
    </div>
  );
}
