import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./Tournament.css"; // Импортируем стили
import UserCalendar from '../UserCalendar/UserCalendar';
import TournamentBracket from '../TournamentBracket/TournamentBracket';
import ReactGA from 'react-ga';

ReactGA.initialize('UA-XXXXX-Y');  // Ваш ID отслеживания

const Tournament = () => {
  const { id } = useParams(); 
  const [tournament, setTournament] = useState<any>(null);
  const [advertisement, setAdvertisement] = useState<any>(null);
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState<string[]>([""]);
  const [registrationStatus, setRegistrationStatus] = useState<string>("");
  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    const fetchTournamentDetails = async () => {
      const response = await axios.get(`http://localhost:8080/api/tournaments/${id}`);
      const data = await response.data;
      setTournament(data);
    };

    const fetchAdvertisement = async () => {
      const response = await axios.get("http://localhost:8080/api/advertisement");
      const data = await response.data;
      setAdvertisement(data);
    };

    fetchTournamentDetails();
    fetchAdvertisement();
  }, [id]);

  if (!tournament) return <div>Загрузка...</div>;

  // Функция для отслеживания кликов по рекламе
  const trackAdClick = () => {
    ReactGA.event({
      category: 'Ad',
      action: 'Click',
      label: 'Tournament Ad'
    });
  };

  // Обработчик изменения имени команды
  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamName(e.target.value);
  };

  // Обработчик изменения списка игроков
  const handlePlayerChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  // Обработчик добавления нового игрока
  const handleAddPlayer = () => {
    if (players.length < 4) { // Ограничиваем до 4 игроков
      setPlayers([...players, ""]);
    }
  };

  // Обработчик удаления игрока
  const handleRemovePlayer = (index: number) => {
    const newPlayers = players.filter((_, idx) => idx !== index);
    setPlayers(newPlayers);
  };

  // Обработчик отправки формы регистрации
  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (players.length < 3) {
      setRegistrationStatus("В команде должно быть минимум 3 игрока.");
      return;
    }
    try {
      const response = await axios.post(`http://localhost:8080/api/tournaments/${id}/register`, {
        teamName,
        players,
      });
      if (response.status === 200) {
        setRegistrationStatus("Команда успешно зарегистрирована!");
        
        // Очистка полей после успешной регистрации
        setTeamName("");
        setPlayers([""]);

        // Обновляем список команд
        const updatedTournament = await axios.get(`http://localhost:8080/api/tournaments/${id}`);
        setTournament(updatedTournament.data);
      }
    } catch (error) {
      console.error("Ошибка при регистрации команды", error);
      setRegistrationStatus("Ошибка при регистрации команды.");
    }
  };

  return (
    <div className="tournament-container">
      <h1>{tournament.name}</h1>
      <p>{tournament.date}</p>
      <p>{tournament.location}</p>
      <p>{tournament.level}</p>
      <p>{tournament.description}</p>

      {/* Форма для регистрации команды */}
      <div className="form-container">
        <h2>Регистрация команды</h2>
        <form onSubmit={handleRegisterTeam}>
          <div>
            <label>Название команды:</label>
            <input type="text" value={teamName} onChange={handleTeamNameChange} required />
          </div>
          <div>
            <label>Игроки:</label>
            {players.map((player, index) => (
              <div key={index} className="player-input-container">
                <input
                  type="text"
                  value={player}
                  onChange={(e) => handlePlayerChange(index, e.target.value)}
                  placeholder={`Игрок ${index + 1}`}
                  required
                />
                {players.length > 3 && (
                  <button type="button" onClick={() => handleRemovePlayer(index)}>
                    Удалить игрока
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddPlayer} disabled={players.length >= 4}>
              Добавить игрока
            </button>
          </div>
          <button type="submit" disabled={players.length < 3}>
            Зарегистрировать команду
          </button>
        </form>
        {registrationStatus && <p>{registrationStatus}</p>}
      </div>
      <div>
        <h1>Турнир</h1>
        <UserCalendar userId={userId} />
    </div>
      {/* Рекламная информация */}
      {advertisement && (
        <div className="advertisement">
          <h2>Реклама</h2>
          <p>{advertisement.text}</p>
        </div>
      )}

      <TournamentBracket registrations={tournament.Registrations} />
    </div>
  );
};

export default Tournament;
