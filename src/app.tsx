import React from "react";
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
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorToast from './components/ErrorToast';
import CreateTournament from './pages/CreateTournament/CreateTournament';

// Импорт глобальных стилей
import "./styles/global.css";

// Обновляем базовый путь для GitHub Pages
const basePath = process.env.NODE_ENV === 'production' ? '/fiba3x3' : '';

const PrivateRoute = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to={`${basePath}`} />;
};

// Новый компонент для перенаправления авторизованных пользователей
const AuthRedirectRoute = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to={`${basePath}/profile`} /> : <>{children}</>;
};

// Компонент для защиты маршрутов администратора
const AdminRoute = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const { isAuthenticated, currentRole } = useAuth();
  return isAuthenticated && currentRole === 'admin' ? <>{children}</> : <Navigate to={`${basePath}`} />;
};

const App = (): React.ReactElement => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router basename={basePath}>
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
              <Route path="/create-tournament" element={<CreateTournament />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;