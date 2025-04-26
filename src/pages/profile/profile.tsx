import React, { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import "./profile.css";
import { useAuth } from '../../hooks/useAuth';
import { userService } from "../../services/UserService";
import { UserPhoto } from '../../components/UserPhoto/UserPhoto';

interface ProfileFormData {
  photo: File | null;
  name: string;
  email: string;
}

interface ExtendedUser {
  id: number;
  name: string;
  email: string;
  profile?: {
    photo_url?: string;
  };
}

const Profile: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<ExtendedUser | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    photo: null,
    name: '',
    email: ''
  });
  
  const { user } = useAuth();
  const redirectAttempted = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        if (!redirectAttempted.current) {
          redirectAttempted.current = true;
          setShouldRedirect(true);
        }
        return;
      }

      try {
        setIsLoading(true);
        const userData = await userService.getCurrentUser();
        setProfile(userData);
        setFormData({
          photo: null,
          name: userData.name || '',
          email: userData.email || ''
        });
      } catch (err: any) {
        console.error("Ошибка при получении профиля", err);
        setError(err.message || "Ошибка при загрузке профиля");
        
        if (err.message === 'Unauthorized access' && !redirectAttempted.current) {
          redirectAttempted.current = true;
          setShouldRedirect(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (shouldRedirect) {
    return <Navigate to="/login" replace />;
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Проверка размера файла (не более 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Размер файла не должен превышать 5MB");
        return;
      }

      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        setError("Пожалуйста, загрузите изображение");
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        
        // Загружаем фото сразу при выборе
        const updatedProfile = await userService.uploadProfilePhoto(file);
        setProfile(updatedProfile);
        
        // Обновляем форму
        setFormData(prev => ({
          ...prev,
          photo: null // Сбрасываем файл, так как он уже загружен
        }));

        // Сбрасываем input file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err: any) {
        console.error("Ошибка при загрузке фото", err);
        setError(err.message || "Ошибка при загрузке фото");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      if (!redirectAttempted.current) {
        redirectAttempted.current = true;
        setShouldRedirect(true);
      }
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      // Создаем объект только с измененными данными
      const updateData: { name?: string; email?: string } = {};
      
      if (formData.email !== profile?.email) {
        updateData.email = formData.email;
      }
      
      if (formData.name !== profile?.name) {
        updateData.name = formData.name;
      }

      // Проверяем, есть ли что обновлять
      if (Object.keys(updateData).length === 0) {
        setEditMode(false);
        return;
      }

      // Обновляем профиль
      const updatedUser = await userService.updateProfile(updateData);
      setProfile(updatedUser);
      setEditMode(false);
    } catch (err: any) {
      console.error("Ошибка при обновлении профиля", err);
      setError(err.message || "Ошибка при сохранении профиля");
      
      if (err.status === 401 && !redirectAttempted.current) {
        redirectAttempted.current = true;
        setShouldRedirect(true);
      }
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
            <UserPhoto 
              photoUrl={profile?.profile?.photo_url}
              className="profile-photo"
            />
            <div className="photo-upload">
              <input
                ref={fileInputRef}
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="change-photo-btn"
                disabled={isLoading}
              >
                {profile?.profile?.photo_url ? 'Изменить фото' : 'Загрузить фото'}
              </button>
            </div>
          </div>
          <div className="profile-details">
            {!editMode ? (
              <>
                <p><strong>Имя:</strong> {profile.name || "Не указано"}</p>
                <p><strong>Email:</strong> {profile.email || "Не указано"}</p>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="name">Имя</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                  </button>
                  <button type="button" onClick={() => setEditMode(false)} disabled={isLoading}>
                    Отмена
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        <p>Профиль не найден</p>
      )}

      {error && <p className="error-message">{error}</p>}

      {!isLoading && profile && !editMode && (
        <button onClick={() => setEditMode(true)} className="edit-profile-btn">
          Редактировать профиль
        </button>
      )}
    </div>
  );
};

export default Profile;
