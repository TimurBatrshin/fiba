import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./profile.css";
import UserCalendar from "../UserCalendar/UserCalendar";

interface ProfileProps {
  isAuthenticated: boolean;
}

const Profile: React.FC<ProfileProps> = ({ isAuthenticated }) => {
  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    photo: null,
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

      try {
        const response = await axios.get("http://localhost:8080/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(response.data);

        setFormData({
          photo: null,  // Обнуляем фото в форме, чтобы не отправлять старое
          tournaments_played: response.data.tournaments_played || 0,
          total_points: response.data.total_points || 0,
          rating: response.data.rating || 0,
        });

      } catch (err) {
        console.error("Ошибка при получении профиля", err);
        if (err.response?.status === 401) navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "photo" && files && files[0]) {
      setFormData((prevData) => ({
        ...prevData,
        photo: files[0],
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const formDataToSend = new FormData();

    // Добавляем фото только если оно есть
    if (formData.photo instanceof File) {
      formDataToSend.append("photo", formData.photo);
    }

    formDataToSend.append("tournaments_played", formData.tournaments_played.toString());
    formDataToSend.append("total_points", formData.total_points.toString());
    formDataToSend.append("rating", formData.rating.toString());

    try {
      await axios.put("http://localhost:8080/api/profile", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setEditMode(false);

      // Перенаправление на страницу регистрации
      navigate("/register");

    } catch (err) {
      console.error("Ошибка при обновлении профиля", err);
    }
  };

  return (
    <div className="profile-container">
      <h1>Профиль игрока</h1>
      {profile ? (
        <div className="profile-info">
          <img src={profile.photo_url || "/default-avatar.png"} alt="Фото профиля" />
          <p>Имя: {profile.User?.name || "Не указано"}</p>
          <p>Email: {profile.User?.email || "Не указано"}</p>
          <p>Турниров сыграно: {profile.tournaments_played}</p>
          <p>Всего очков: {profile.total_points}</p>
          <p>Рейтинг: {profile.rating}</p>
        </div>
      ) : (
        <p>Загрузка...</p>
      )}

      <div>
        <h1>Личный кабинет</h1>
        <UserCalendar />
      </div>

      <button onClick={() => setEditMode(true)}>Редактировать профиль</button>

      {editMode && (
        <form onSubmit={handleSubmit} className="profile-form">
          <div>
            <label>Фото профиля</label>
            <input
              type="file"
              name="photo"
              accept="image/*"
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
