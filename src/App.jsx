import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import { useAuthStore } from './store/auth'

export default function App() {
  const token = useAuthStore((s) => s.token)

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={token ? <Dashboard /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}
