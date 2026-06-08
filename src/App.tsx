
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "./store/useStore";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Notification } from "./components/Notification";
import { Loading } from "./components/Loading";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { DataUpload } from "./pages/DataUpload";
import { Simulations } from "./pages/Simulations";
import { Monitoring } from "./pages/Monitoring";
import { Recommendations } from "./pages/Recommendations";
import { Approvals } from "./pages/Approvals";
import { Reports } from "./pages/Reports";
import { SettingsPage } from "./pages/Settings";

function AppLayout() {
  const { sidebarCollapsed, notification, isLoading } = useStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-950">
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header />
        <main className="p-6 min-h-[calc(100vh-72px)]">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/data-upload" element={<DataUpload />} />
            <Route path="/simulations" element={<Simulations />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/alerts" element={<Monitoring />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <Notification />
      {isLoading && <Loading fullScreen />}
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useStore();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/*" element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
