import React, { useState, useEffect } from "react";
import axios from "axios";
import './profile.css';

const EditProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    photo_url: "",
    tournaments_played: 0,
    total_points: 0,
    rating: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/api/profile");
        setProfile(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/api/profile", profile);
      alert("Профиль успешно обновлен!");
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
      alert("Ошибка при обновлении профиля.");
    }
  };

  return (
    <div className="profile-container">
      <h1>Редактирование профиля</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Имя</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>URL фото</label>
          <input
            type="text"
            name="photo_url"
            value={profile.photo_url}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Турниров сыграно</label>
          <input
            type="number"
            name="tournaments_played"
            value={profile.tournaments_played}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Общее количество очков</label>
          <input
            type="number"
            name="total_points"
            value={profile.total_points}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Рейтинг</label>
          <input
            type="number"
            name="rating"
            value={profile.rating}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Сохранить</button>
      </form>
    </div>
  );
};

export default EditProfile;