// src/layouts/MainLayout.jsx
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { fetchLedgers } from "../handlers/ledgerHandlers";
import { useLedger } from "../store/ledger";
import dayjs from "dayjs";
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
// import ChatbotDrawer from "../components/ChatbotDrawer";
import LedgerSelector from "../components/LedgerSelector";
import MonthSelector from "../components/MonthSelector";
import ConnectionIndicator from "../components/ConnectionIndicator";
import ChatbotWidget from "../components/ChatbotWidget";
// import socketService from "../utils/socket";
// import { useEffect } from "react";
import dashboardIcon from "../assets/icons/LOGO.svg";
import chatbotIcon from "../assets/icons/chatbot.svg";
import recordsIcon from "../assets/icons/records.svg";
import incompleteIcon from "../assets/icons/incomplete.svg";
import ledgersIcon from "../assets/icons/ledgers.svg";
import notificationIcon from "../assets/icons/notification.svg";
import analysisIcon from "../assets/icons/analysis.svg";
import budgetIcon from "../assets/icons/budget.svg";

const menu = [
  {
    path: "/dashboard",
    icon: <img src={dashboardIcon} alt="Dashboard" className="h-25 w-25" />,
  },
  {
    path: "/chatbot",
    label: "Chatbot",
    icon: <img src={chatbotIcon} alt="Chatbot" className="h-5 w-5" />,
  },
  {
    path: "/records",
    label: "Records",
    icon: <img src={recordsIcon} alt="Records" className="h-5 w-5" />,
  },
  {
    path: "/incomplete",
    label: "Incomplete",
    icon: <img src={incompleteIcon} alt="Incomplete" className="h-5 w-5" />,
  },
  {
    path: "/books",
    label: "Ledgers",
    icon: <img src={ledgersIcon} alt="Ledgers" className="h-5 w-5" />,
  },
  {
    path: "/alerts",
    label: "Alerts",
    icon: <img src={notificationIcon} alt="Alerts" className="h-5 w-5" />,
  },
  {
    path: "/analysis",
    label: "Analysis",
    icon: <img src={analysisIcon} alt="Analysis" className="h-5 w-5" />,
  },
  {
    path: "/budget",
    label: "Budget",
    icon: <img src={budgetIcon} alt="Budget" className="h-5 w-5" />,
  },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const logout = () => {
    useAuthStore.getState().logout();
    navigate("/login");
  };

  const { token } = useAuthStore();
  const loc = useLocation();
  const { currentId, currentName, setLedger } = useLedger();

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

  const { data: ledgers = [] } = useQuery({
    queryKey: ["ledgers", token],
    queryFn: fetchLedgers,
    enabled: !!token,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (ledgers.length > 0 && !currentId) {
      setLedger({
        id: ledgers[0]._id,
        name: ledgers[0].name,
        month: dayjs().format("YYYY-MM"),
      });
    }
  }, [ledgers, currentId, setLedger]);

  useEffect(() => {
    console.log("Current ledger state:", { currentId, currentName });
  }, [currentId, currentName]);

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      {/* Sidebar */}
      <aside className="w-48 p-4 flex flex-col justify-between bg-[#E0E7FF] text-[#333333]">
        <div className="space-y-8">
          {menu.map(({ path, label, icon }) => {
            const active = loc.pathname === path;
            const isDash = path === "/dashboard";

            return (
              <Link
                key={path}
                to={path}
                className={`
                relative flex items-center px-2 py-2 rounded-md
                ${isDash ? "justify-center gap-0" : "justify-start gap-2"}
                text-[#333333]
                hover:bg-[#C7D8FF]
                active:bg-[#B0C4FF]
                ${active ? "bg-[#B0C4FF] text-white" : ""}
              `}
              >
                {icon}

                {!isDash && <span>{label}</span>}

                {label === "Alerts" && unreadCount > 0 && (
                  <span className="absolute -top-1 left-4 inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full bg-red-600 text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <div className="pt-6 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-[#C7D8FF] text-sm text-red-500 text-left"
          >
            <Power size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-6 bg-[#F1F5F9] text-[#333333]">
          <div className="flex items-center gap-4">
            <LedgerSelector />
            <MonthSelector />
          </div>
          <div className="flex items-center gap-4">
            <ConnectionIndicator />
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto px-6 py-4">
          <Outlet />
        </main>
      </div>

      <ChatbotWidget />
    </div>
  );
}
