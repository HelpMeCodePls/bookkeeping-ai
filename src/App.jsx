import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import RecordList from "./pages/RecordList";
import AddRecord from "./pages/AddRecord";
import IncompleteList from "./pages/IncompleteList";
import ChartsPage from "./pages/ChartsPage";
import LedgerManager from "./pages/LedgerManager";
import MainLayout from "./layouts/MainLayout";
import AlertsPage from "./pages/AlertsPage";
import AnalysisPage from "./pages/AnalysisPage";
import BudgetPage from "./pages/BudgetPage";
import ChatbotPage from "./pages/ChatbotPage";
import { useEffect, useState } from "react";
import { api } from "./api/client";
import { useNavigate } from 'react-router-dom';


export default function App() {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setLedger = useLedger((s) => s.setLedger);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("jwt");

    if (!token && storedToken) {
      // 1️⃣ 恢复用户状态
      api.get("/auth/profile", { params: { token: storedToken } })
        .then((res) => {
          setAuth({ token: storedToken, user: res.data });

          // 2️⃣ 顺便加载 ledger 数据
          return api.get("/ledgers", { params: { token: storedToken } });
        })
        .then((res) => {
          const ledgers = res.data;
          qc.setQueryData(["ledgers", storedToken], ledgers);

          if (ledgers.length > 0) {
            const first = ledgers[0];
            const thisMonth = new Date().toISOString().slice(0, 7);
            setLedger({ id: first._id, name: first.name, month: thisMonth });
            qc.setQueryData(["ledgers", first._id], first); // 设置当前选中的 ledger 数据
          }
        })
        .catch(() => {
          localStorage.removeItem("jwt");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [token]);
  
  if (isLoading) return <div>Loading...</div>; 

  return (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    
    {token && (
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/records" element={<RecordList />} />
        <Route path="/add-record" element={<AddRecord />} />
        <Route path="/incomplete" element={<IncompleteList />} />
        <Route path="/charts" element={<ChartsPage />} />
        <Route path="/books" element={<LedgerManager />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
      </Route>
    )}

    <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
  </Routes>

  );
}
