import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { removeToast } from '../../store/slices/uiSlice';
import './Toast.css';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

const Toast: React.FC = () => {
  const dispatch = useAppDispatch();
  const { toasts } = useAppSelector(state => state.ui);

  // Автоматическое удаление тостов через определенное время
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    toasts.forEach((toast: ToastMessage) => {
      const timer = setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, 5000); // 5 секунд
      
      timers.push(timer);
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts, dispatch]);

  // Если нет тостов, не отображаем компонент
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container">
      {toasts.map((toast: ToastMessage) => (
        <div 
          key={toast.id} 
          className={`toast-item toast-${toast.type}`}
        >
          <div className="toast-content">
            <p>{toast.message}</p>
          </div>
          <button 
            className="toast-close" 
            onClick={() => dispatch(removeToast(toast.id))}
            aria-label="Закрыть"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast; 