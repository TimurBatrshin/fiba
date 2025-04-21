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
import { APP_SETTINGS } from './config/envConfig';

// Импорт глобальных стилей
import "./styles/global.css";

// Обновляем базовый путь для GitHub Pages
const basePath = process.env.NODE_ENV === 'production' ? '/fiba3x3' : '';

const PrivateRoute = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to={`${basePath}`} />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const { isAuthenticated, currentRole } = useAuth();
  return isAuthenticated && currentRole === 'ADMIN' ? <>{children}</> : <Navigate to="/" />;
};

// Новый компонент для перенаправления авторизованных пользователей
const AuthRedirectRoute = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to={`${basePath}/profile`} /> : <>{children}</>;
};

const App = (): React.ReactElement => {
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
    <ErrorBoundary>
      <AuthProvider>
        <Router basename={basePath}>
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
                    <Login setIsAuthenticated={updateAuthStatus} />
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
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;