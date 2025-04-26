import React, { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import "./profile.css";
import { useAuth } from '../../hooks/useAuth';
import { userService } from "../../services/UserService";
import ProfileAvatar from '../../components/Profile/ProfileAvatar';
import AvatarUploader from '../../components/Profile/AvatarUploader';

interface ProfileFormData {
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
    name: '',
    email: ''
  });
  
  const { user } = useAuth();
  const redirectAttempted = useRef<boolean>(false);

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

  const handleUploadSuccess = (avatarUrl: string) => {
    window.location.reload();
  };

  const handleUploadError = (error: string) => {
    setError(error);
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
            <ProfileAvatar userId={profile.id} className="profile-photo" />
            <AvatarUploader
              userId={profile.id}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
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
            {!editMode && (
              <button 
                onClick={() => setEditMode(true)} 
                className="edit-profile-btn"
                disabled={isLoading}
              >
                Редактировать профиль
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="error-message">
          {error || "Не удалось загрузить профиль"}
        </div>
      )}
    </div>
  );
};

export default Profile;
