import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";
import defaultAvatar from '../../assets/images/default-avatar.png';
import { useAuth } from '../../contexts/AuthContext';
import { API_CONFIG } from "../../config/api";
import userService from "../../services/UserService";

interface ProfileFormData {
  photo: File | null;
  tournaments_played: number;
  total_points: number;
  rating: number;
}

const Profile: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [formData, setFormData] = useState<ProfileFormData>({
    photo: null,
    tournaments_played: 0,
    total_points: 0,
    rating: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);
        const userData = await userService.getCurrentUser();
        setProfile(userData);
        setFormData({
          photo: null, // Обнуляем фото в форме, чтобы не отправлять старое
          tournaments_played: userData.tournaments_played || 0,
          total_points: userData.total_points || 0,
          rating: userData.rating || 0,
        });
      } catch (err: any) {
        console.error("Ошибка при получении профиля", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, navigate]);

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
    
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      
      // Create data to update user
      const updateData = {
        tournaments_played: formData.tournaments_played,
        total_points: formData.total_points,
        rating: formData.rating
      };
      
      // If there's a photo, handle it separately
      if (formData.photo) {
        const formDataToSend = new FormData();
        formDataToSend.append("photo", formData.photo);
        
        // Upload photo
        // You'll need to implement this route in your API service
        // or use a direct fetch here if your API service doesn't support file uploads
        await fetch(`${API_CONFIG.baseUrl}/users/${currentUser.id}/photo`, {
          method: 'POST',
          body: formDataToSend,
          credentials: 'include'
        });
      }
      
      // Update user data
      const updatedUser = await updateUser(currentUser.id, updateData);
      setProfile(updatedUser);
      setEditMode(false);
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
