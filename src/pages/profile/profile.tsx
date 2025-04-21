import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./profile.css";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config/envConfig";
import defaultAvatar from '../../assets/images/default-avatar.png';
import { AuthService } from '../../services/AuthService';

interface ProfileProps {
  isAuthenticated?: boolean;
}

interface ProfileFormData {
  photo: File | null;
  tournaments_played: number;
  total_points: number;
  rating: number;
}

const Profile: React.FC<ProfileProps> = ({ isAuthenticated }) => {
  const { id } = useParams(); 
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
      const authService = AuthService.getInstance();
      const token = authService.getToken();
      
      if (!token) {
        console.error("Токен не найден");
        navigate("/fiba/login");
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
        setFormData({
          photo: null, // Обнуляем фото в форме, чтобы не отправлять старое
          tournaments_played: response.data.tournaments_played || 0,
          total_points: response.data.total_points || 0,
          rating: response.data.rating || 0,
        });
      } catch (err: any) {
        console.error("Ошибка при получении профиля", err);
        setError(true);
        if (err.response?.status === 401) navigate("/fiba/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

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
    const authService = AuthService.getInstance();
    const token = authService.getToken();
    
    if (!token) {
      navigate("/fiba/login");
      return;
    }

    const formDataToSend = new FormData();
    
    // Добавляем фото только если оно есть
    if (formData.photo) {
      formDataToSend.append("photo", formData.photo);
    }

    formDataToSend.append("tournaments_played", formData.tournaments_played.toString());
    formDataToSend.append("total_points", formData.total_points.toString());
    formDataToSend.append("rating", formData.rating.toString());

    try {
      setIsLoading(true);
      // Используем новый endpoint для загрузки фото
      const response = await axios.post(`${API_BASE_URL}/profile/photo`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type будет автоматически установлен как multipart/form-data
        },
      });

      // Обновляем профиль с новыми данными
      const updatedProfile = await axios.get(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(updatedProfile.data);
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
              src={profile.photo_url ? `${API_BASE_URL.replace('/api', '')}${profile.photo_url}` : defaultAvatar} 
              alt="Фото профиля" 
              onError={handleImageError}
            />
          </div>
          <div className="profile-details">
            <p><strong>Имя:</strong> {profile.User?.name || profile.name || "Не указано"}</p>
            <p><strong>Email:</strong> {profile.User?.email || profile.email || "Не указано"}</p>
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
