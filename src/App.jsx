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

export default function App() {
  const token = useAuthStore((s) => s.token);

  if (!token) return <LoginPage />;

  return (
    <Routes>
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
        {/* 404 页面 */}
        <Route path="/404" element={<div>404 Not Found</div>} />
        {/* 重定向到 Dashboard */}
        <Route path="*" element={<Navigate to="/chatbot" replace />} />
      </Route>
    </Routes>
  );
}
