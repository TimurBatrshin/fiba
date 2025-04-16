import React, { useState } from 'react';
import { useNotifications, Notification } from '../../context/NotificationsContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faCircle, 
  faCheck, 
  faTrash, 
  faBellSlash,
  faInfoCircle,
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import './NotificationsPanel.css';
import { Link } from 'react-router-dom';

const NotificationsPanel: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll,
    hasPermission,
    isSubscribed,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
    setShowSettings(false);
    
    // Если панель открывается, отмечаем все уведомления как прочитанные
    if (!isOpen) {
      markAllAsRead();
    }
  };

  const toggleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSettings(!showSettings);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} д. назад`;

    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const handleSubscribe = async () => {
    await subscribeToNotifications();
  };

  const handleUnsubscribe = async () => {
    await unsubscribeFromNotifications();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <FontAwesomeIcon icon={faInfoCircle} className="icon-info" />;
      case 'success': return <FontAwesomeIcon icon={faCheckCircle} className="icon-success" />;
      case 'warning': return <FontAwesomeIcon icon={faExclamationTriangle} className="icon-warning" />;
      case 'error': return <FontAwesomeIcon icon={faTimesCircle} className="icon-error" />;
      default: return <FontAwesomeIcon icon={faInfoCircle} className="icon-info" />;
    }
  };

  return (
    <div className="notifications-container">
      <button 
        className="notifications-toggle" 
        onClick={togglePanel}
        aria-label="Уведомления"
      >
        <FontAwesomeIcon icon={faBell} className="bell-icon" />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-panel">
          <div className="panel-header">
            <h3>Уведомления</h3>
            <div className="header-actions">
              <button 
                className="btn-settings"
                onClick={toggleSettings}
                aria-label="Настройки уведомлений"
              >
                <FontAwesomeIcon icon={faBellSlash} />
              </button>
              <button 
                className="btn-clear"
                onClick={clearAll}
                aria-label="Очистить все уведомления"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="notifications-settings">
              <h4>Настройки уведомлений</h4>
              
              <div className="settings-info">
                {!hasPermission ? (
                  <div className="permission-request">
                    <p>Разрешите получать уведомления для информирования о важных событиях.</p>
                    <button 
                      className="btn-permission"
                      onClick={handleRequestPermission}
                    >
                      Разрешить уведомления
                    </button>
                  </div>
                ) : (
                  <div className="subscription-toggle">
                    <p>Статус: {isSubscribed ? 'Подписаны на уведомления' : 'Не подписаны'}</p>
                    {isSubscribed ? (
                      <button 
                        className="btn-unsubscribe"
                        onClick={handleUnsubscribe}
                      >
                        Отписаться
                      </button>
                    ) : (
                      <button 
                        className="btn-subscribe"
                        onClick={handleSubscribe}
                      >
                        Подписаться
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <FontAwesomeIcon icon={faBellSlash} className="empty-icon" />
                <p>У вас нет уведомлений</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? 'read' : 'unread'} ${notification.type}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4>{notification.title}</h4>
                      {!notification.isRead && (
                        <FontAwesomeIcon icon={faCircle} className="unread-indicator" />
                      )}
                    </div>
                    <p>{notification.message}</p>
                    <div className="notification-footer">
                      <span className="timestamp">{formatTimestamp(notification.timestamp)}</span>
                      {notification.link && (
                        <Link to={notification.link} className="notification-link">
                          Перейти <FontAwesomeIcon icon={faCheck} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="panel-footer">
            {notifications.length > 0 && (
              <button 
                className="mark-all-read"
                onClick={markAllAsRead}
              >
                Отметить все как прочитанные
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel; 