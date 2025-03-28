import React, { useState } from "react";
import "./register.css";

const Register = () => {
  const [teamName, setTeamName] = useState("");
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [player3, setPlayer3] = useState("");
  const [reserve, setReserve] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Здесь будет логика для отправки данных о команде на сервер
    console.log({ teamName, player1, player2, player3, reserve });
  };

  return (
    <div className="register-container">
      <h1>Регистрация на турнир</h1>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="teamName">Название команды</label>
          <input
            type="text"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="player1">Игрок 1</label>
          <input
            type="text"
            id="player1"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="player2">Игрок 2</label>
          <input
            type="text"
            id="player2"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="player3">Игрок 3</label>
          <input
            type="text"
            id="player3"
            value={player3}
            onChange={(e) => setPlayer3(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reserve">Запасной игрок</label>
          <input
            type="text"
            id="reserve"
            value={reserve}
            onChange={(e) => setReserve(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-btn">Зарегистрировать команду</button>
      </form>
    </div>
  );
}

export default Register;
