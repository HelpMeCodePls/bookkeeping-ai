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
import { useQueryClient } from '@tanstack/react-query';
import { useLedger } from "./store/ledger";


export default function App() {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const setLedger = useLedger(s => s.setLedger);
  const qc = useQueryClient();

  useEffect(() => {
    const storedToken = localStorage.getItem("jwt");
    if (storedToken) {
      api.get("/auth/profile", { params: { token: storedToken } })
        .then(async (res) => {
          setAuth({ token: storedToken, user: res.data });
          
          // 加载ledgers数据
          try {
            const ledgers = await api.get("/ledgers", { params: { token: storedToken } }).then(r => r.data);
            if (ledgers.length) {
              const first = ledgers[0];
              const thisMonth = new Date().toISOString().slice(0,7);
              qc.setQueryData(['ledgers', storedToken], ledgers);
              setLedger({ id: first._id, name: first.name, month: thisMonth });
            }
          } catch (error) {
            console.error("Failed to load ledgers:", error);
          }

          if (window.location.pathname === "/login") {
            navigate("/dashboard");
          }
        })
        .catch(() => {
          localStorage.removeItem("jwt");
          navigate("/login");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      if (!window.location.pathname.includes("/login")) {
        navigate("/login");
      }
    }
  }, []);
  
if (isLoading) return (
  <div className="fixed inset-0 flex items-center justify-center bg-white/80">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

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
