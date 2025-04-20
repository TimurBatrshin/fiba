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
import ScriptLoader from './components/ScriptLoader';
import { APP_SETTINGS } from './config/envConfig';

// Импорт глобальных стилей
import "./styles/global.css";

// Внешние скрипты для загрузки
const EXTERNAL_SCRIPTS = [
  `https://static.bro-js.ru/fire.app/${APP_SETTINGS.buildVersion}/index.js`,
  `https://dev.bro-js.ru/fire.app/1.6.3/index.js`
];

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
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

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

  const handleScriptsLoaded = () => {
    console.log('Все внешние скрипты успешно загружены');
    setScriptsLoaded(true);
  };

  const handleScriptsError = (error: Error) => {
    console.error('Ошибка загрузки скриптов:', error);
    // Тут можно добавить логику обработки ошибки загрузки, например, показ уведомления
  };

  return (
    <ErrorBoundary>
      <ScriptLoader 
        urls={EXTERNAL_SCRIPTS}
        onLoad={handleScriptsLoaded}
        onError={handleScriptsError}
        fallbackToProxy={true}
      >
        <AuthProvider>
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
        </AuthProvider>
      </ScriptLoader>
    </ErrorBoundary>
  );
};

export default App;