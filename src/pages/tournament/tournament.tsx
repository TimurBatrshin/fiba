import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./tournament.css";

const Tournament = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/tournament/${id}`);
        console.log(response.data);
        if (response.status !== 200) {
          throw new Error("Ошибка при загрузке турнира");
        }
        setTournament(response.data);
      } catch (error) {
        console.error("Ошибка:", error);
      }
    };

    fetchTournament();
  }, [id]);

  if (!tournament) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="tournament-page">
      <h1>{tournament.name}</h1>
      <p><strong>Статус:</strong> {tournament.status}</p>
      <p><strong>Локация:</strong> {tournament.location}</p>
      <p><strong>Дата:</strong> {tournament.date}</p>
      <p><strong>Уровень:</strong> {tournament.level}</p>
      <p><strong>Описание:</strong> {tournament.description}</p>
      {/* Можно добавить форму для регистрации или другие элементы */}
    </div>
  );
};

export default Tournament;
