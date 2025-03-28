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
      { date: "2025-03-01", result: "Победа" },
      { date: "2025-03-10", result: "Проигрыш" }
    ]
  });

  const handleEditProfile = () => {
    alert("Редактирование профиля");
  };

  return (
    <div className="profile-container">
      <h1>Мой профиль</h1>
      <div className="profile-card">
        <img src={user.photo} alt="User profile" className="profile-photo" />
        <h2>{user.name}</h2>
        <div className="stats">
          <p>Турниры: {user.stats.tournaments}</p>
          <p>Очки: {user.stats.points}</p>
          <p>Рейтинг: {user.stats.rating}</p>
        </div>
        <button onClick={handleEditProfile} className="edit-btn">Редактировать профиль</button>
      </div>
      <div className="games-history">
        <h2>История игр</h2>
        <ul>
          {user.gamesHistory.map((game, index) => (
            <li key={index} className={game.result === "Победа" ? "win" : "loss"}>
              {game.date} - {game.result}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Profile;