import React, { useState } from "react";
import "./profile.css";

const Profile = () => {
  const [user, setUser] = useState({
    name: "Иван Иванов",
    photo: "https://via.placeholder.com/150",
    stats: {
      tournaments: 5,
      points: 120,
      rating: 4.5
    },
    gamesHistory: [
      { opponent: "Команда A", score: "21-15", date: "2025-03-15" },
      { opponent: "Команда B", score: "17-21", date: "2025-03-20" }
    ]
  });
  
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user.name);

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleSaveProfile = () => {
    setUser({ ...user, name: newName });
    setEditing(false);
  };

  return (
    <div className="profile-container">
      <h1>Профиль</h1>
      <div className="profile-header">
        <img src={user.photo} alt="Profile" />
        {editing ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        ) : (
          <h2>{user.name}</h2>
        )}
        {editing ? (
          <button onClick={handleSaveProfile}>Сохранить</button>
        ) : (
          <button onClick={handleEditProfile}>Редактировать</button>
        )}
      </div>
      <div className="profile-stats">
        <h3>Статистика</h3>
        <p>Турниры: {user.stats.tournaments}</p>
        <p>Очки: {user.stats.points}</p>
        <p>Рейтинг: {user.stats.rating}</p>
      </div>
      <div className="profile-history">
        <h3>История игр</h3>
        <ul>
          {user.gamesHistory.map((game, index) => (
            <li key={index}>
              {game.date} - {game.opponent} ({game.score})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Profile;
