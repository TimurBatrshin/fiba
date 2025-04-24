import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

/**
 * Компонент для защиты маршрутов, требующих авторизации
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const location = useLocation();
  const { token, user } = useSelector((state: RootState) => state.auth);
  
  // Проверка авторизации
  if (!token) {
    // Сохраняем путь, куда пользователь хотел попасть, чтобы вернуть его туда после входа
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Проверка роли, если требуется
  if (requiredRole && user && user.role !== requiredRole) {
    return <Navigate to="/403" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute; 