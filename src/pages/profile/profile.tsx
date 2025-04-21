import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { fetchUserProfile } from '../../store/slices/userSlice';
import { addToast } from '../../store/slices/uiSlice';
import logger from '../../utils/logger';
import { APP_SETTINGS } from '../../config/envConfig';
import "./profile.css";

interface ProfileProps {
  setIsAuthenticated: (value: boolean) => void;
}

const Profile: React.FC<ProfileProps> = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  // Получаем данные из обоих срезов состояния
  const { isAuthenticated, currentUser: authUser, error: authError } = useAppSelector(state => state.auth);
  const { profile: userProfile, loading: userLoading, error: userError } = useAppSelector(state => state.user);
  
  // Объединяем данные пользователя (берем данные или из auth, или из user slice)
  const user = userProfile || authUser;
  const loading = userLoading;
  const error = authError || userError;

  // Проверка токена и редиректа перед загрузкой профиля
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Проверяем наличие токена
    const token = localStorage.getItem(APP_SETTINGS.tokenStorageKey) || localStorage.getItem('token');
    if (!token) {
      logger.warn('Authentication token not found, redirecting to login');
      navigate('/login');
      return;
    }
    
    logger.info('Attempting to load user profile', { authenticated: isAuthenticated, hasToken: !!token });
    
    // Если у нас есть пользователь из auth, но нет профиля, загружаем профиль
    if (!userProfile && retryCount < maxRetries) {
      logger.info(`Loading user profile (attempt ${retryCount + 1}/${maxRetries})`);
      dispatch(fetchUserProfile())
        .unwrap()
        .then((response: any) => {
          logger.info('Profile loaded successfully', { profileData: !!response });
        })
        .catch((error: any) => {
          logger.error('Failed to load profile', { error, retryCount });
          setRetryCount(prev => prev + 1);
          
          // Если ошибка 500, попробуем еще раз через 2 секунды
          if (error.status === 500 && retryCount < maxRetries - 1) {
            const retryTimeout = setTimeout(() => {
              dispatch(fetchUserProfile());
            }, 2000);
            
            return () => clearTimeout(retryTimeout);
          }
        });
    }
  }, [isAuthenticated, userProfile, dispatch, navigate, retryCount]);

  useEffect(() => {
    if (error) {
      // Показываем разные сообщения в зависимости от типа ошибки
      const errorMessage = error.includes('500') 
        ? 'Сервер временно недоступен. Попробуйте перезагрузить страницу через несколько минут.' 
        : error;
      
      dispatch(addToast({
        type: 'error',
        message: errorMessage
      }));
    }
  }, [error, dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsAuthenticated(false);
    navigate('/login');
    dispatch(addToast({
      type: 'success',
      message: 'Вы успешно вышли из системы'
    }));
  };

  // Если многократные попытки не удались
  if (retryCount >= maxRetries && error) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="error-message">
            <h2>Не удалось загрузить профиль</h2>
            <p>Произошла ошибка при загрузке данных профиля. Возможно, сервер временно недоступен.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setRetryCount(0);
                dispatch(fetchUserProfile());
              }}
            >
              Попробовать снова
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleLogout}
            >
              Выйти из системы
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="loading-spinner">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-card animate-fade-in">
          <div className="profile-header">
            <h1>Профиль пользователя</h1>
          </div>
          
          <div className="profile-content">
            {user && (
              <>
                <div className="profile-avatar">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Аватар пользователя" />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.firstName && user.lastName
                        ? `${user.firstName[0]}${user.lastName[0]}`
                        : (user.email && user.email[0] ? user.email[0].toUpperCase() : '?')}
                    </div>
                  )}
                </div>
                
                <div className="profile-info">
                  <h2>{user.firstName} {user.lastName}</h2>
                  <p className="user-role">{user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}</p>
                  
                  <div className="profile-details">
                    <div className="detail-item">
                      <span className="label">Email:</span>
                      <span className="value">{user.email}</span>
                    </div>
                    
                    {user.phone && (
                      <div className="detail-item">
                        <span className="label">Телефон:</span>
                        <span className="value">{user.phone}</span>
                      </div>
                    )}
                    
                    {user.teams && user.teams.length > 0 && (
                      <div className="detail-item teams-list">
                        <span className="label">Команды:</span>
                        <ul>
                          {user.teams.map((team: any, index: number) => (
                            <li key={team.id || index}>{team.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {user.createdAt && (
                      <div className="detail-item">
                        <span className="label">Дата регистрации:</span>
                        <span className="value">
                          {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="profile-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/edit-profile')}
            >
              Редактировать профиль
            </button>
            
            <button 
              className="btn btn-danger"
              onClick={handleLogout}
            >
              Выйти из системы
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
