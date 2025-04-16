import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./widgets/navbar/navbar";
import Home from "./pages/home/home";
import Tournaments from "./pages/tournaments/tournaments";
import Profile from "./pages/profile/profile";
import Business from "./pages/business/business";
import Tournament from "./pages/tournament/tournament";
import RegisterUser from "./pages/registerUser/registerUser";
import Login from "./pages/login/login";
import AdminPanel from "./pages/admin/AdminPanel";
import { NotificationsProvider } from "./context/NotificationsContext";
// Импорт компонентов статистики
import PlayerStatistics from "./pages/PlayerStatistics/PlayerStatistics";
import TopPlayers from "./pages/TopPlayers/TopPlayers";
// Импорт сервиса аутентификации
import AuthService from "./services/AuthService";

// Импорт глобальных стилей
import "./styles/global.css";

// Protected route component for admin access
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const currentRole = AuthService.getCurrentUserRole();
  if (currentRole === 'ADMIN' || currentRole === 'BUSINESS') {
    return <>{children}</>;
  }
  return <Navigate to="/login" />;
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Инициализируем сервис аутентификации и проверяем авторизацию
    setIsAuthenticated(AuthService.isAuthenticated());
    
    // Обработчик для отслеживания изменений в localStorage
    const handleStorageChange = () => {
      setIsAuthenticated(AuthService.isAuthenticated());
    };
    
    // Добавляем обработчик события storage
    window.addEventListener('storage', handleStorageChange);
    
    // Удаляем обработчик при размонтировании компонента
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Функция для обновления состояния аутентификации
  const updateAuthStatus = (status: boolean) => {
    setIsAuthenticated(status);
  };

  return (
    <NotificationsProvider>
      <Router>
        <div className="app-container">
          <Navbar isAuthenticated={isAuthenticated} />
          <Routes>
            <Route index path="/" element={<Home />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route
              path="/profile"
              element={isAuthenticated ? <Profile isAuthenticated={isAuthenticated} /> : <Login setIsAuthenticated={updateAuthStatus} />}
            />
            <Route path="/business" element={<Business />} />
            <Route path="/tournament/:id" element={<Tournament />} />
            <Route path="/register-user" element={<RegisterUser />} />
            <Route path="/login" element={<Login setIsAuthenticated={updateAuthStatus} />} />
            
            {/* Маршруты для статистики */}
            <Route path="/players/:id/statistics" element={<PlayerStatistics />} />
            <Route path="/rankings/players" element={<TopPlayers />} />
            
            {/* Admin Panel Route */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedAdminRoute>
                  <AdminPanel />
                </ProtectedAdminRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </NotificationsProvider>
  );
};

export default App;