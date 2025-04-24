import React, { useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./widgets/navbar/navbar";
import Home from "./pages/home/home";
import Tournaments from "./pages/tournaments/tournaments";
import Profile from "./pages/profile/profile";
import Tournament from "./pages/tournament/tournament";
import RegisterUser from "./pages/registerUser/registerUser";
import Login from "./pages/login/login";
import { Admin } from "./pages/admin";
import TopPlayers from "./pages/TopPlayers/TopPlayers";
import PlayerDetails from "./pages/Player/PlayerDetails";
import PlayerStatistics from "./pages/Player/PlayerStatistics";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorToast from './components/ErrorToast';
import CreateTournament from './pages/CreateTournament/CreateTournament';
import ApiTest from './pages/ApiTest';
import { BASE_PATH } from './config/envConfig'; // Import BASE_PATH from envConfig

// Импорт глобальных стилей
import "./styles/global.css";

// Используем BASE_PATH из envConfig для согласованности
const basePath = BASE_PATH;

const PrivateRoute = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = `${basePath}#/login`;
    }
  }, [isAuthenticated]);
  
  return isAuthenticated ? <>{children}</> : <div className="redirecting"></div>;
};

// Новый компонент для перенаправления авторизованных пользователей
const AuthRedirectRoute = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/profile" /> : <>{children}</>;
};

// Компонент для защиты маршрутов администратора
const AdminRoute = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const { isAuthenticated, currentRole } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated || (currentRole?.toUpperCase() !== 'ADMIN')) {
      window.location.href = `${basePath}#/login`;
    }
  }, [isAuthenticated, currentRole]);
  
  return (isAuthenticated && (currentRole?.toUpperCase() === 'ADMIN')) ? <>{children}</> : <div className="redirecting"></div>;
};

const App = (): React.ReactElement => {
  useEffect(() => {
    // Вызываем миграцию для обработки legacy токенов
    import('./utils/tokenStorage').then(tokenStorage => {
      tokenStorage.migrateTokens();
    });
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app">
            <Navbar />
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
                    <Login />
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
                    <Profile />
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
              <Route path="/players/:id" element={
                <ErrorBoundary>
                  <PlayerDetails />
                </ErrorBoundary>
              } />
              <Route path="/players/:id/statistics" element={
                <ErrorBoundary>
                  <PlayerStatistics />
                </ErrorBoundary>
              } />
              <Route path="/create-tournament" element={<CreateTournament />} />
              <Route path="/api-test" element={
                <ErrorBoundary>
                  <ApiTest />
                </ErrorBoundary>
              } />
              {/* Добавляем дополнительный маршрут для перехвата редиректов с сервера */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;