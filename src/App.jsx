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
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("jwt");
    if (storedToken) {
      api.get("/auth/profile", { params: { token: storedToken } })
        .then((res) => {
          setAuth({ token: storedToken, user: res.data });
          // 如果当前在登录页，跳转到 dashboard
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
  }, []); // 空依赖数组，只运行一次
  
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
