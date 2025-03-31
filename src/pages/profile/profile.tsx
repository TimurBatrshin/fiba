import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./profile.css";  // Импортируем стили
import UserCalendar from '../UserCalendar/UserCalendar';

interface ProfileProps {
  isAuthenticated: boolean;
}

const Profile: React.FC<ProfileProps> = ({ isAuthenticated }) => {
  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    photo_url: "",
    tournaments_played: 0,
    total_points: 0,
    rating: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Токен не найден");
        navigate("/login");
        return;
      }

      console.log("Токен найден:", token);

      try {
        const response = await axios.get("http://localhost:8080/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Ответ сервера:", response.data);

        setProfile(response.data);
        setFormData({
          photo_url: response.data.photo_url || "",
          tournaments_played: response.data.tournaments_played || 0,
          total_points: response.data.total_points || 0,
          rating: response.data.rating || 0,
        });
      } catch (err) {
        console.error("Ошибка при получении профиля", err);
        if (err.response && err.response.status === 401) {
          navigate("/login");
        } else if (err.response && err.response.status === 500) {
          console.error("Внутренняя ошибка сервера");
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.put("http://localhost:8080/api/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(response.data);
      setEditMode(false);
    } catch (err) {
      console.error("Ошибка при обновлении профиля", err);
    }
  };

  if (!profile) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="profile-container">
      <h1>Профиль игрока</h1>
      <div className="profile-info">
        <img src={profile.photo_url} alt="Фото профиля" />
        <p>Имя: {profile.User.name}</p>
        <p>Email: {profile.User.email}</p>
        <p>Турниров сыграно: {profile.tournaments_played}</p>
        <p>Всего очков: {profile.total_points}</p>
        <p>Рейтинг: {profile.rating}</p>
      </div>
      <div>
      <h1>Личный кабинет</h1>
      <UserCalendar />
    </div>
      <button onClick={() => setEditMode(true)}>Редактировать профиль</button>
      {editMode && (
        <form onSubmit={handleSubmit} className="profile-form">
          <div>
            <label>URL фото</label>
            <input
              type="text"
              name="photo_url"
              value={formData.photo_url}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Турниров сыграно</label>
            <input
              type="number"
              name="tournaments_played"
              value={formData.tournaments_played}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Всего очков</label>
            <input
              type="number"
              name="total_points"
              value={formData.total_points}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Рейтинг</label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
            />
          </div>
          <button type="submit">Сохранить изменения</button>
          <button type="button" onClick={() => setEditMode(false)}>Отмена</button>
        </form>
      )}
    </div>
  );
};

export default Profile;
