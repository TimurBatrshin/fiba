import React, { useState } from "react";
import "./register.css";  // Импортируем стили
import axios from "axios";

const Register = ({ tournamentId }) => {
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState(['', '', '', '']);
  
  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const response = await axios.post(`http://localhost:8080/api/tournaments/${tournamentId}/register`, {
      teamName,
      players
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
  
    alert('Вы успешно зарегистрировались!');
  
    if (response.status !== 200) {
      alert('Произошла ошибка при регистрации.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Регистрация команды</h2>
      <div>
        <label>Название команды</label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
      </div>
      {players.map((player, index) => (
        <div key={index}>
          <label>{`Игрок ${index + 1}`}</label>
          <input
            type="text"
            value={player}
            onChange={(e) => handlePlayerChange(index, e.target.value)}
          />
        </div>
      ))}
      <button type="submit">Зарегистрировать команду</button>
    </form>
  );
};

export default Register;
