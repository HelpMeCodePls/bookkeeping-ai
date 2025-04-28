// src/layouts/MainLayout.jsx
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import {
  Home,
  List,
  Plus,
  AlertTriangle,
  PieChart,
  Book,
  Bell,
  PiggyBank,
  MessageCircle,
  Power,
} from "lucide-react";
// import axios from "axios";
import { fetchUnreadCount } from "../handlers/notificationHandlers";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";
import ChatbotDrawer from "../components/ChatbotDrawer";
import LedgerSelector from "../components/LedgerSelector";
import MonthSelector from "../components/MonthSelector";
import ConnectionIndicator from "../components/ConnectionIndicator";
import ChatbotWidget from "../components/ChatbotWidget";
// import socketService from "../utils/socket";
// import { useEffect } from "react";

const menu = [
  { path: "/dashboard", label: "Dashboard", icon: <Home size={18} /> },
  { path: "/chatbot", label: "Chatbot", icon: <MessageCircle size={18} /> },
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
  const navigate = useNavigate();
  const logout = () => {
    useAuthStore.getState().logout(); // 保持原登出逻辑
    navigate("/login"); // 登出后跳转到登录页
  };

  const { token } = useAuthStore();
  const loc = useLocation();

  // useEffect(() => {
  //     if (token) {
  //       console.log('Connecting WebSocket with token:', token)
  //       socketService.connect(token)

  //       socketService.on('connect', () => {
  //         console.log('WebSocket connected!')
  //       })

  //       socketService.on('notification', (data) => {
  //         console.log('Received notification:', data)
  //       })
  //     }

  //     return () => {
  //       console.log('Cleaning up WebSocket...')
  //       socketService.disconnect()
  //     }
  //   }, [token])

  // 轮询未读数
  //   const { data: notif = { count: 0 } } = useQuery({
  //     queryKey: ["unread"],
  //     queryFn: () => axios.get("/notifications/unread_count").then((r) => r.data),
  //     refetchInterval: 10_000,
  //   });

  // const { data: unreadCount = 0 } = useQuery({
  //   queryKey: ["notifications", "unread"],
  //   queryFn: () =>
  //     axios
  //       .get("/notifications/unread_count", { params: { token } })
  //       .then((r) => r.data.count),
  //   refetchInterval: 60000,
  //   enabled: !!token,
  // });

  const { data: unreadCount = 0 } = useQuery({
      queryKey: ["notifications", "unread"],
      queryFn: fetchUnreadCount,
      refetchInterval: 60000,
      enabled: !!token,
    });

  return (
    <div className="flex h-screen">
      <aside className="w-48 border-r p-4 flex flex-col justify-between">
        {/* 上半部分：菜单栏 */}
        <div className="space-y-2">
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
                {icon}
                {label}
                {label === "Alerts" && unreadCount > 0 && (
                  <span className="absolute -top-1 left-4 inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full bg-red-600 text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* 下半部分：Logout */}
        <div className="pt-6 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-gray-100 text-sm text-red-500 text-left"
          >
            <Power size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* header */}
        <header className="h-14 flex items-center justify-between px-6 border-b">
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

      {/* <ChatbotDrawer /> */}
      <ChatbotWidget />
    </div>
  );
}
