import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearError, hideError } from '../store/slices/errorSlice';
import './ErrorToast.css';

/**
 * Компонент для отображения всплывающих сообщений об ошибках
 */
const ErrorToast = (): React.ReactElement | null => {
  const errorState = useAppSelector(state => state.error);
  const { message, isVisible, statusCode } = errorState as {
    message: string | null;
    isVisible: boolean;
    statusCode?: number;
  };
  const dispatch = useAppDispatch();
  const [localVisible, setLocalVisible] = useState(false);
  
  useEffect(() => {
    if (isVisible && message) {
      setLocalVisible(true);
      
      // Автоматически скрываем сообщение через 5 секунд
      const timer = setTimeout(() => {
        setLocalVisible(false);
        dispatch(hideError());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, message, dispatch]);
  
  // Обработчик закрытия сообщения
  const handleClose = () => {
    setLocalVisible(false);
    dispatch(clearError());
  };
  
  // Определяем класс в зависимости от кода ошибки
  const getToastClass = () => {
    if (!statusCode) return 'error-toast';
    
    if (statusCode >= 500) {
      return 'error-toast error-toast-server';
    } else if (statusCode >= 400) {
      return 'error-toast error-toast-client';
    } else {
      return 'error-toast';
    }
  };
  
  if (!localVisible || !message) {
    return null;
  }
  
  return (
    <div className={getToastClass()}>
      <div className="error-toast-content">
        {statusCode && (
          <span className="error-toast-status">
            {statusCode}
          </span>
        )}
        <div className="error-toast-message">
          {message}
        </div>
      </div>
      
      <button 
        className="error-toast-close"
        onClick={handleClose}
        aria-label="Закрыть сообщение об ошибке"
      >
        ×
      </button>
    </div>
  );
};

export default ErrorToast; 