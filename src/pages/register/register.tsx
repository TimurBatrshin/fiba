import React, { useState } from "react";
import "./register.css";
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
    
        const response = await fetch(`/api/tournaments/${tournamentId}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamName, players })
        });
    
        const data = await response.json();
        if (response.ok) {
          alert('Вы успешно зарегистрировались!');
        } else {
          alert(data.message);
        }
      };

      return (
        <form onSubmit={handleSubmit}>
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
