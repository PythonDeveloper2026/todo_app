import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TodoProvider } from './context/TodoContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TodayPage from './pages/TodayPage';
import SearchPage from './pages/SearchPage';
import ListDetailPage from './pages/ListDetailPage';
import StatsPage from './pages/StatsPage';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main-content">
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/app/*" element={
        <PrivateRoute>
          <TodoProvider>
            <AppLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="today" element={<TodayPage />} />
                <Route path="my-day" element={<TodayPage title="My Day" type="my-day" />} />
                <Route path="important" element={<TodayPage title="Important" type="important" />} />
                <Route path="planned" element={<TodayPage title="Planned" type="upcoming" />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="stats" element={<StatsPage />} />
                <Route path="list/:id" element={<ListDetailPage />} />
              </Routes>
            </AppLayout>
          </TodoProvider>
        </PrivateRoute>
      } />
      <Route path="/" element={<Navigate to="/app/" />} />
      <Route path="*" element={<div style={{ padding: '50px', textAlign: 'center' }}><h2>404 - Sahifa topilmadi</h2><p>Bunday sahifa mavjud emas.</p></div>} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
