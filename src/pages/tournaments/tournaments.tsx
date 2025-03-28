import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./tournaments.css";

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);  // Статус загрузки
  const [error, setError] = useState(null);  // Для отображения ошибок

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/tournaments");
        if (!response.ok) {
          throw new Error("Не удалось загрузить турниры");
        }
        const data = await response.json();
        setTournaments(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <div className="tournaments-container">
      <h1>Турниры</h1>
      <div className="tournament-list">
        {tournaments.map((tournament) => (
          <div className="tournament-card" key={tournament.id}>
            <h2>{tournament.name}</h2>
            <p><strong>Локация:</strong> {tournament.location}</p>
            <p><strong>Дата:</strong> {tournament.date}</p>
            <p><strong>Уровень:</strong> {tournament.level}</p>
            <p><Link to={`/tournament/${tournament.id}`} className="details-btn">Подробнее</Link></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tournaments;
