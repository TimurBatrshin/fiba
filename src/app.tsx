import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./widgets/navbar/navbar";
import Home from "./pages/home/home";
import Tournaments from "./pages/tournaments/tournaments";
import Profile from "./pages/profile/profile";
import Tournament from "./pages/tournament/tournament";
import RegisterUser from "./pages/registerUser/registerUser";
import Login from "./pages/login/login";
import { Admin } from "./pages/admin";
import TopPlayers from "./pages/TopPlayers/TopPlayers";
import { AuthService } from "./services/AuthService";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorToast from './components/ErrorToast';

// Импорт глобальных стилей
import "./styles/global.css";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, currentRole } = useAuth();
  return isAuthenticated && currentRole === 'ADMIN' ? <>{children}</> : <Navigate to="/" />;
};

// Новый компонент для перенаправления авторизованных пользователей
const AuthRedirectRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/profile" /> : <>{children}</>;
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.getInstance().isAuthenticated());

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(AuthService.getInstance().isAuthenticated());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateAuthStatus = (status: boolean) => {
    setIsAuthenticated(status);
  };

  return (
    <Router>
      <div className="app">
        <Navbar isAuthenticated={isAuthenticated} />
        <ErrorToast />
        <Routes>
          <Route path="/" element={
            <ErrorBoundary>
              <Home />
            </ErrorBoundary>
          } />
          <Route path="/tournaments" element={
            <ErrorBoundary>
              <Tournaments />
            </ErrorBoundary>
          } />
          <Route path="/login" element={
            <ErrorBoundary>
              <AuthRedirectRoute>
                <Login setIsAuthenticated={setIsAuthenticated} />
              </AuthRedirectRoute>
            </ErrorBoundary>
          } />
          <Route path="/register-user" element={
            <ErrorBoundary>
              <AuthRedirectRoute>
                <RegisterUser />
              </AuthRedirectRoute>
            </ErrorBoundary>
          } />
          <Route path="/profile" element={
            <ErrorBoundary>
              <PrivateRoute>
                <Profile isAuthenticated={isAuthenticated} />
              </PrivateRoute>
            </ErrorBoundary>
          } />
          <Route path="/tournament/:id" element={
            <ErrorBoundary>
              <Tournament />
            </ErrorBoundary>
          } />
          <Route path="/admin" element={
            <ErrorBoundary>
              <AdminRoute>
                <Admin />
              </AdminRoute>
            </ErrorBoundary>
          } />
          <Route path="/top-players" element={
            <ErrorBoundary>
              <TopPlayers />
            </ErrorBoundary>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;