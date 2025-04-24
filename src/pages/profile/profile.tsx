import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";
import defaultAvatar from '../../assets/images/default-avatar.png';
import { useAuth } from '../../hooks/useAuth';
import { API_CONFIG } from "../../config/api";
import { userService } from "../../services/UserService";
import { BASE_PATH } from '../../config/envConfig';
import { AuthService } from '../../services/AuthService';
import api from '../../api/client';

interface ProfileFormData {
  photo: File | null;
  tournaments_played: number;
  total_points: number;
  rating: number;
}

// Расширенный интерфейс пользователя с дополнительными полями
interface ExtendedUser {
  id: number;
  name?: string;
  username?: string;
  email: string;
  role?: string;
  avatar?: string;
  tournaments_played?: number;
  total_points?: number;
  rating?: number;
}

// Функция для загрузки фото
const uploadProfilePhoto = async (userId: string | number, photo: File): Promise<void> => {
  try {
    // Используем метод из userService вместо прямого вызова API
    await userService.uploadProfilePhoto(userId, photo);
    console.log('Фото профиля успешно загружено');
  } catch (error) {
    console.error('Ошибка при загрузке фото профиля:', error);
    throw error;
  }
};

const Profile: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<ExtendedUser | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [error, setError] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [formData, setFormData] = useState<ProfileFormData>({
    photo: null,
    tournaments_played: 0,
    total_points: 0,
    rating: 0
  });
  
  const { user, updateUser } = useAuth();
  const redirectAttempted = useRef<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        if (!redirectAttempted.current) {
          redirectAttempted.current = true;
          
          // Проверяем счетчик перенаправлений в localStorage
          const redirectAttemptsKey = 'profile_redirect_attempts';
          const redirectAttempts = parseInt(localStorage.getItem(redirectAttemptsKey) || '0');
          
          if (redirectAttempts < 3) {
            localStorage.setItem(redirectAttemptsKey, (redirectAttempts + 1).toString());
            window.location.href = `${BASE_PATH}#/login`;
          } else {
            console.warn('Превышено максимальное количество попыток перенаправления из профиля');
            // Сбрасываем счетчик через 10 секунд
            setTimeout(() => {
              localStorage.setItem(redirectAttemptsKey, '0');
            }, 10000);
          }
        }
        return;
      }

      try {
        setIsLoading(true);
        const userData = await userService.getCurrentUser();
        // Явно преобразуем User в ExtendedUser через unknown
        const extendedUser = {
          ...userData, 
          username: userData?.name || '',
          tournaments_played: 0,
          total_points: 0,
          rating: 0
        } as ExtendedUser;
        
        setProfile(extendedUser);
        setFormData({
          photo: null, // Обнуляем фото в форме, чтобы не отправлять старое
          tournaments_played: extendedUser.tournaments_played || 0,
          total_points: extendedUser.total_points || 0,
          rating: extendedUser.rating || 0,
        });
      } catch (err: any) {
        console.error("Ошибка при получении профиля", err);
        setError(true);
        
        // Если получили ошибку авторизации, предотвращаем зацикливание
        if (err.message === 'Unauthorized access' && !redirectAttempted.current) {
          redirectAttempted.current = true;
          
          // Проверяем счетчик перенаправлений в localStorage
          const redirectAttemptsKey = 'profile_redirect_attempts';
          const redirectAttempts = parseInt(localStorage.getItem(redirectAttemptsKey) || '0');
          
          if (redirectAttempts < 3) {
            localStorage.setItem(redirectAttemptsKey, (redirectAttempts + 1).toString());
            window.location.href = `${BASE_PATH}#/login`;
          } else {
            console.warn('Превышено максимальное количество попыток перенаправления из профиля (ошибка)');
            // Сбрасываем счетчик через 10 секунд
            setTimeout(() => {
              localStorage.setItem(redirectAttemptsKey, '0');
            }, 10000);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!redirectAttempted.current) {
      fetchProfile();
    }
  }, [user?.id]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultAvatar;
    e.currentTarget.onerror = null; // Предотвращаем бесконечный цикл
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "photo" && e.target.files && e.target.files.length > 0) {
      setFormData({
        ...formData,
        photo: e.target.files[0],
      });
      setUploadError("");
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      if (!redirectAttempted.current) {
        redirectAttempted.current = true;
        
        // Проверяем счетчик перенаправлений в localStorage
        const redirectAttemptsKey = 'profile_redirect_attempts';
        const redirectAttempts = parseInt(localStorage.getItem(redirectAttemptsKey) || '0');
        
        if (redirectAttempts < 3) {
          localStorage.setItem(redirectAttemptsKey, (redirectAttempts + 1).toString());
          window.location.href = `${BASE_PATH}#/login`;
        } else {
          console.warn('Превышено максимальное количество попыток перенаправления из handleSubmit');
          // Сбрасываем счетчик через 10 секунд
          setTimeout(() => {
            localStorage.setItem(redirectAttemptsKey, '0');
          }, 10000);
        }
      }
      return;
    }

    try {
      setIsLoading(true);
      setUploadError("");
      
      // Create data to update user
      const updateData = {
        tournaments_played: formData.tournaments_played,
        total_points: formData.total_points,
        rating: formData.rating
      };
      
      // If there's a photo, handle it separately with the new function
      if (formData.photo) {
    try {
      await uploadProfilePhoto(user.id, formData.photo); // Вызываем без profileData
    } catch (photoError: any) {
      console.error("Ошибка при загрузке фото:", photoError);
      setUploadError("Не удалось загрузить фото, но данные профиля будут обновлены");
    }
  }
      
      try {
        // Используем updateUser из хука useAuth
        const updatedUser = await updateUser(String(user.id), updateData);
        setProfile(updatedUser as ExtendedUser);
        setEditMode(false);
      } catch (profileError: any) {
        console.error("Ошибка при обновлении профиля", profileError);
        setUploadError(profileError.message || "Ошибка при сохранении данных профиля");
        
        // Обработка ошибки авторизации
        if (profileError.status === 401 && !redirectAttempted.current) {
          redirectAttempted.current = true;
          window.location.href = `${BASE_PATH}#/login`;
        }
      }
    } catch (err: any) {
      console.error("Ошибка при обновлении профиля", err);
      setUploadError("Ошибка при сохранении профиля");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h1>Профиль игрока</h1>
      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Загрузка профиля...</p>
        </div>
      ) : profile ? (
        <div className="profile-info">
          <div className="profile-avatar">
            <img 
              src={profile.avatar || defaultAvatar} 
              alt="Фото профиля" 
              onError={handleImageError}
            />
          </div>
          <div className="profile-details">
            <p><strong>Имя:</strong> {profile.username || "Не указано"}</p>
            <p><strong>Email:</strong> {profile.email || "Не указано"}</p>
            <p><strong>Турниров сыграно:</strong> {profile.tournaments_played}</p>
            <p><strong>Всего очков:</strong> {profile.total_points}</p>
            <p><strong>Рейтинг:</strong> {profile.rating}</p>
          </div>
        </div>
      ) : (
        <p>Профиль не найден</p>
      )}

      {!isLoading && profile && !editMode && (
        <button onClick={() => setEditMode(true)} className="edit-profile-btn">
          Редактировать профиль
        </button>
      )}

      {editMode && (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="photo">Фото профиля</label>
            <input
              id="photo"
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              disabled={isLoading}
            />
            {uploadError && <p className="error-message">{uploadError}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="tournaments_played">Турниров сыграно</label>
            <input
              id="tournaments_played"
              type="number"
              name="tournaments_played"
              value={formData.tournaments_played}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="total_points">Всего очков</label>
            <input
              id="total_points"
              type="number"
              name="total_points"
              value={formData.total_points}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="rating">Рейтинг</label>
            <input
              id="rating"
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить изменения"}
            </button>
            <button type="button" onClick={() => setEditMode(false)} className="cancel-btn" disabled={isLoading}>
              Отмена
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;
