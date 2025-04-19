import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimesCircle, faInfoCircle, faWifi } from '@fortawesome/free-solid-svg-icons';
import globalErrorHandler, { ErrorResult, ErrorType } from '../utils/globalErrorHandler';

interface ErrorToastProps {}

/**
 * Компонент для отображения всплывающих уведомлений об ошибках
 */
const ErrorToast: React.FC<ErrorToastProps> = () => {
  const [errors, setErrors] = useState<Array<ErrorResult & { id: number }>>([]);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    // Подписываемся на уведомления об ошибках
    const unsubscribe = globalErrorHandler.addErrorListener((error) => {
      // Добавляем новую ошибку в стейт
      setErrors((prev) => [...prev, { ...error, id: nextId }]);
      setNextId((prev) => prev + 1);
      
      // Если ошибка требует выхода из системы, перенаправляем на логин
      if (error.shouldLogout) {
        // Очищаем данные авторизации
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Перенаправляем на страницу логина
        window.location.href = '/login';
      }
    });

    // Отписываемся при размонтировании
    return () => {
      unsubscribe();
    };
  }, [nextId]);

  // Закрытие отдельного уведомления
  const handleClose = (id: number) => {
    setErrors((prev) => prev.filter((error) => error.id !== id));
  };

  // Получение иконки в зависимости от типа ошибки
  const getIcon = (type: ErrorType) => {
    switch (type) {
      case ErrorType.API:
        return faExclamationTriangle;
      case ErrorType.VALIDATION:
        return faInfoCircle;
      case ErrorType.AUTH:
        return faTimesCircle;
      case ErrorType.NETWORK:
        return faWifi;
      default:
        return faExclamationTriangle;
    }
  };

  // Получение класса в зависимости от типа ошибки
  const getToastClass = (type: ErrorType) => {
    switch (type) {
      case ErrorType.API:
        return 'bg-warning text-dark';
      case ErrorType.VALIDATION:
        return 'bg-info text-white';
      case ErrorType.AUTH:
        return 'bg-danger text-white';
      case ErrorType.NETWORK:
        return 'bg-secondary text-white';
      default:
        return 'bg-danger text-white';
    }
  };

  // Получение заголовка в зависимости от типа ошибки
  const getTitle = (type: ErrorType) => {
    switch (type) {
      case ErrorType.API:
        return 'Ошибка API';
      case ErrorType.VALIDATION:
        return 'Ошибка валидации';
      case ErrorType.AUTH:
        return 'Ошибка авторизации';
      case ErrorType.NETWORK:
        return 'Ошибка сети';
      default:
        return 'Ошибка';
    }
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <ToastContainer className="p-3" position="top-end">
      {errors.map((error) => (
        <Toast 
          key={error.id}
          onClose={() => handleClose(error.id)}
          className={getToastClass(error.type)}
          delay={5000}
          autohide
        >
          <Toast.Header closeButton>
            <FontAwesomeIcon icon={getIcon(error.type)} className="me-2" />
            <strong className="me-auto">{getTitle(error.type)}</strong>
            <small>{error.statusCode ? `Код ${error.statusCode}` : ''}</small>
          </Toast.Header>
          <Toast.Body>
            {error.message}
            
            {/* Если есть ошибки валидации, показываем их */}
            {error.validationErrors && Object.keys(error.validationErrors).length > 0 && (
              <ul className="mt-2 mb-0">
                {Object.entries(error.validationErrors).map(([field, message]) => (
                  <li key={field}><strong>{field}:</strong> {message}</li>
                ))}
              </ul>
            )}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default ErrorToast; 