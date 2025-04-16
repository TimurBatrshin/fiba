import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import NotificationService from '../services/NotificationService';
import notificationIcon from '../assets/images/notification-icon.png';

// Тип для уведомлений
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
  link?: string; // Опциональная ссылка для перехода
}

// Интерфейс контекста
interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  hasPermission: boolean;
  isSubscribed: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  requestPermission: () => Promise<boolean>;
  subscribeToNotifications: () => Promise<boolean>;
  unsubscribeFromNotifications: () => Promise<void>;
}

// Создаем контекст
export const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  hasPermission: false,
  isSubscribed: false,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
  requestPermission: async () => false,
  subscribeToNotifications: async () => false,
  unsubscribeFromNotifications: async () => {}
});

// Хук для использования контекста
export const useNotifications = () => useContext(NotificationsContext);

// Провайдер контекста
export const NotificationsProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  
  // Вычисляем количество непрочитанных уведомлений
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Проверяем разрешения при загрузке
  useEffect(() => {
    const checkPermissionAndSubscription = async () => {
      const status = await NotificationService.getNotificationStatus();
      setHasPermission(status.permission === 'granted');
      setIsSubscribed(status.isSubscribed);
    };
    
    checkPermissionAndSubscription();
    
    // Загружаем сохраненные уведомления из localStorage
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Преобразуем строки обратно в даты
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(notificationsWithDates);
      } catch (error) {
        console.error('Ошибка при загрузке уведомлений из localStorage:', error);
      }
    }
  }, []);
  
  // Сохраняем уведомления в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Запрос разрешения на отправку уведомлений
  const requestPermission = async (): Promise<boolean> => {
    try {
      const permission = await NotificationService.requestNotificationPermission();
      const granted = permission === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Ошибка при запросе разрешения на уведомления:', error);
      return false;
    }
  };

  // Подписка на push-уведомления
  const subscribeToNotifications = async (): Promise<boolean> => {
    try {
      // Запрашиваем разрешение, если его еще нет
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return false;
      }
      
      const subscription = await NotificationService.subscribeToPushNotifications();
      const success = !!subscription;
      
      if (success) {
        setIsSubscribed(true);
      }
      
      return success;
    } catch (error) {
      console.error('Ошибка при подписке на push-уведомления:', error);
      return false;
    }
  };

  // Отписка от push-уведомлений
  const unsubscribeFromNotifications = async (): Promise<void> => {
    try {
      const success = await NotificationService.unsubscribeFromPushNotifications();
      
      if (success) {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Ошибка при отписке от push-уведомлений:', error);
    }
  };

  // Добавление нового уведомления
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      isRead: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Показываем системное уведомление если есть разрешение и мы подписаны
    if (hasPermission && document.visibilityState !== 'visible') {
      try {
        const systemNotification = new Notification(notification.title, {
          body: notification.message,
          icon: notificationIcon
        });
        
        // Обработка клика на уведомление
        if (notification.link) {
          systemNotification.onclick = () => {
            window.focus();
            window.location.href = notification.link!;
          };
        }
      } catch (error) {
        console.error('Ошибка при показе системного уведомления:', error);
      }
    }
  };

  // Пометить уведомление как прочитанное
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  };

  // Пометить все уведомления как прочитанные
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Очистить все уведомления
  const clearAll = () => {
    setNotifications([]);
  };

  // Служебная функция для генерации ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        hasPermission,
        isSubscribed,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        requestPermission,
        subscribeToNotifications,
        unsubscribeFromNotifications
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider; 