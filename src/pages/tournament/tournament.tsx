import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./Tournament.css"; // Импортируем стили
import TournamentBracket from '../TournamentBracket/TournamentBracket';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { PlayerSearch } from '../../components/PlayerSearch/PlayerSearch';
import { 
  getTournamentById, 
  getAdvertisement, 
  registerTeam, 
  updateMatchScore,
  TournamentData, 
  Player 
} from '../../services/api/tournaments';

const Tournament = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [advertisement, setAdvertisement] = useState<any>(null);
  const [teamName, setTeamName] = useState("");
  const [playerIds, setPlayerIds] = useState<string[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [registrationStatus, setRegistrationStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Загружаем данные о турнире
        if (id) {
          const tournamentData = await getTournamentById(id);
          
          // Проверяем структуру данных для отладки
          console.log("Данные о турнире:", tournamentData);
          
          if (tournamentData.Registrations && tournamentData.Registrations.length > 0) {
            console.log("Данные о регистрациях:", tournamentData.Registrations);
            console.log("Пример первой регистрации:", tournamentData.Registrations[0]);
            
            // Проверяем наличие данных об игроках
            if (tournamentData.Registrations[0].players) {
              console.log("Данные об игроках:", tournamentData.Registrations[0].players);
            } else {
              console.log("Данные об игроках отсутствуют в API ответе");
            }
          }
          
          setTournament(tournamentData);
        } else {
          setError("ID турнира не указан");
        }
        
        // Загружаем рекламу
        const adData = await getAdvertisement();
        if (adData) {
          setAdvertisement(adData);
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        setError("Не удалось загрузить информацию о турнире. Пожалуйста, попробуйте позже.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Дата не указана";
      }
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (e) {
      console.error("Ошибка форматирования даты:", e);
      return "Дата не указана";
    }
  };

  // Обработчик изменения имени команды
  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamName(e.target.value);
  };

  // Обработчик выбора игрока
  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayers([...selectedPlayers, player]);
    setPlayerIds([...playerIds, player.id]);
  };

  // Обработчик удаления игрока из выбранных
  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(player => player.id !== playerId));
    setPlayerIds(playerIds.filter(id => id !== playerId));
  };

  // Обработчик отправки формы регистрации
  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      setRegistrationStatus("ID турнира не указан");
      return;
    }
    
    if (teamName.trim().length < 3) {
      setRegistrationStatus("Название команды должно содержать минимум 3 символа");
      return;
    }
    
    if (playerIds.length < 3) {
      setRegistrationStatus("В команде должно быть минимум 3 игрока");
      return;
    }
    
    try {
      setRegistrationStatus("Регистрация команды...");
      
      // Вывод отладочной информации
      console.log("Отправка данных для регистрации команды:", {
        tournamentId: id,
        teamName,
        playerIds
      });
      
      // Вызов метода регистрации команды
      const response = await registerTeam(id, teamName, playerIds);
      console.log("Ответ сервера:", response);
      
      if (response && (response.status === 200 || response.status === 201)) {
        setRegistrationStatus("Команда успешно зарегистрирована!");
        
        // Очистка полей после успешной регистрации
        setTeamName("");
        setPlayerIds([]);
        setSelectedPlayers([]);

        // Обновляем данные о турнире после короткой задержки
        setTimeout(async () => {
          try {
            const updatedTournament = await getTournamentById(id);
            setTournament(updatedTournament);
          } catch (updateError) {
            console.error("Ошибка при обновлении данных турнира:", updateError);
          }
        }, 1000);
      } else {
        setRegistrationStatus("Ошибка при регистрации команды: Неожиданный ответ сервера");
      }
    } catch (error) {
      console.error("Ошибка при регистрации команды:", error);
      
      let errorMessage = "Ошибка при регистрации команды.";
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = `Ошибка: ${error.response.data.message}`;
        } else if (error.response.status === 400) {
          errorMessage = "Ошибка валидации данных. Проверьте правильность всех полей.";
        } else if (error.response.status === 401) {
          errorMessage = "Необходима авторизация для регистрации команды.";
        } else if (error.response.status === 403) {
          errorMessage = "У вас нет прав для регистрации команды.";
        } else if (error.response.status === 409) {
          errorMessage = "Команда с таким названием уже зарегистрирована на этот турнир.";
        } else if (error.response.status === 500) {
          errorMessage = "Ошибка сервера при обработке запроса.";
        }
      } else if (error.request) {
        errorMessage = "Сервер не отвечает. Проверьте подключение к интернету.";
      }
      
      setRegistrationStatus(errorMessage);
    }
  };

  // Функция для преобразования регистраций в матчи
  const convertRegistrationsToMatches = (registrations: any[], tournamentId: string) => {
    if (!registrations || registrations.length === 0) {
      return [];
    }

    // Создаем команды из регистраций (только подтвержденные или все, если подтвержденных нет)
    // Принимаем команды со статусом confirmed или approved
    const approvedRegistrations = registrations.filter(reg => 
      reg.status === 'approved' || reg.status === 'confirmed');
    
    if (approvedRegistrations.length === 0) {
      console.log("Нет подтвержденных команд для турнира:", tournamentId);
      return [];
    }
    
    const teams = approvedRegistrations.map((reg, index) => ({
      id: `team-${reg.id || index}`,
      name: reg.team_name || `Команда ${index + 1}`,
      score: 0,
      imageUrl: ''
    }));

    // Генерируем все матчи для всех раундов
    const matches = [];
    let matchNumber = 1;

    // Вычисляем количество раундов на основе количества команд
    const numTeams = teams.length;
    const maxRounds = Math.ceil(Math.log2(numTeams)) + (numTeams > 1 ? 1 : 0);
    
    // Первый раунд - пары команд
    const firstRoundTeams = [...teams];
    
    // Если нечетное количество команд, добавляем "пустую" команду
    if (firstRoundTeams.length % 2 !== 0) {
      firstRoundTeams.push({ id: `bye-${firstRoundTeams.length}`, name: 'TBD', score: 0, imageUrl: '' });
    }
    
    // Создаем матчи первого раунда
    for (let i = 0; i < firstRoundTeams.length; i += 2) {
      const team1 = firstRoundTeams[i];
      const team2 = firstRoundTeams[i + 1];
      
      matches.push({
        id: `match-${tournamentId}-r1-${matchNumber}`,
        team1,
        team2,
        winner: '',
        matchTime: new Date(Date.now() + matchNumber * 24 * 60 * 60 * 1000).toISOString(),
        courtNumber: Math.ceil(Math.random() * 3),
        isCompleted: false,
        round: 1,
        matchNumber
      });
      
      matchNumber++;
    }
    
    // Генерируем последующие раунды
    let currentRoundTeams = firstRoundTeams.length / 2; // Количество команд в следующем раунде
    
    for (let round = 2; round <= maxRounds; round++) {
      for (let i = 0; i < currentRoundTeams; i++) {
        matches.push({
          id: `match-${tournamentId}-r${round}-${i+1}`,
          team1: { id: `placeholder-r${round}-${i*2+1}`, name: 'Победитель 1', score: 0, imageUrl: '' },
          team2: { id: `placeholder-r${round}-${i*2+2}`, name: 'Победитель 2', score: 0, imageUrl: '' },
          winner: '',
          matchTime: new Date(Date.now() + (matchNumber + i) * 24 * 60 * 60 * 1000).toISOString(),
          courtNumber: Math.ceil(Math.random() * 3),
          isCompleted: false,
          round: round,
          matchNumber: i + 1
        });
      }
      
      // Количество команд для следующего раунда
      currentRoundTeams = Math.ceil(currentRoundTeams / 2);
    }

    return matches;
  };

  // Функция для обновления результатов матча
  const handleUpdateMatch = async (matchId: string, team1Score: number, team2Score: number) => {
    if (!id) return;
    
    try {
      console.log(`Обновление матча ${matchId} турнира ${id}, счет: ${team1Score}:${team2Score}`);
      const result = await updateMatchScore(id, matchId, team1Score, team2Score, true);
      console.log("Результат обновления:", result);
      
      // Обновляем данные о турнире
      const updatedTournament = await getTournamentById(id);
      setTournament(updatedTournament);
    } catch (error) {
      console.error("Ошибка при обновлении результатов матча:", error);
    }
  };

  if (isLoading) {
    return <div className="loading">Загрузка информации о турнире...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!tournament) {
    return <div className="error-message">Турнир не найден</div>;
  }

  return (
    <div className="tournament-page">
      <header className="tournament-header">
        <h1>{tournament.name || tournament.title}</h1>
        <div className="tournament-meta">
          <div className="tournament-date">
            <span className="label">Дата:</span>
            <span className="value">{formatDate(tournament.date)}</span>
          </div>
          <div className="tournament-location">
            <span className="label">Место проведения:</span>
            <span className="value">{tournament.location}</span>
          </div>
          <div className="tournament-level">
            <span className="label">Уровень:</span>
            <span className="value">{tournament.level}</span>
          </div>
          <div className="tournament-prize">
            <span className="label">Призовой фонд:</span>
            <span className="value">{tournament.prize_pool} руб.</span>
          </div>
          <div className="tournament-status">
            <span className="label">Статус:</span>
            <span className={`value status-${tournament.status}`}>
              {tournament.status === 'registration' ? 'Регистрация открыта' : 
                tournament.status === 'in_progress' ? 'В процессе' : 'Завершен'}
            </span>
          </div>
        </div>
      </header>
      
      <div className="tournament-content">
        <section className="tournament-description">
          <h2>Описание турнира</h2>
          <div className="description-text">
            {tournament.description || "Описание отсутствует"}
          </div>
        </section>
        
        {tournament.status === 'registration' && (
          <section className="registration-form">
            <h2>Регистрация команды</h2>
            <form onSubmit={handleRegisterTeam}>
              <div className="form-group">
                <label htmlFor="teamName">Название команды:</label>
                <input
                  type="text"
                  id="teamName"
                  value={teamName}
                  onChange={handleTeamNameChange}
                  required
                  minLength={3}
                  maxLength={50}
                  placeholder="Введите название команды"
                />
              </div>
              
              <PlayerSearch 
                onSelectPlayer={handleSelectPlayer}
                selectedPlayers={selectedPlayers}
                onRemovePlayer={handleRemovePlayer}
              />
              
              <button type="submit" className="submit-button" disabled={teamName.length < 3 || selectedPlayers.length < 3}>
                Зарегистрировать команду
              </button>
              
              {registrationStatus && (
                <div className={`registration-status ${registrationStatus.includes('Ошибка') ? 'error' : 'success'}`}>
                  {registrationStatus}
                </div>
              )}
            </form>
          </section>
        )}
        
        <section className="tournament-bracket">
          <h2>Сетка турнира</h2>
          {tournament.Registrations && tournament.Registrations.length > 0 ? (
            <TournamentBracket 
              tournamentId={tournament.id}
              matches={convertRegistrationsToMatches(tournament.Registrations || [], tournament.id)} 
              maxRounds={3}
              onUpdateMatch={handleUpdateMatch}
            />
          ) : (
            <p className="no-teams">Пока нет команд для формирования турнирной сетки</p>
          )}
        </section>
        
        <section className="registered-teams">
          <h2>Зарегистрированные команды</h2>
          {(tournament.Registrations && tournament.Registrations.length > 0) ? (
            <div className="teams-container">
              {tournament.Registrations.map((reg, index) => (
                <div key={reg.id || index} className={`team-card ${reg.status.toLowerCase()}`}>
                  <div className="team-card-header">
                    <h3 className="team-name">
                      <FontAwesomeIcon icon={faUser} className="team-icon" />
                      {reg.team_name || `Команда ${index + 1}`}
                    </h3>
                    <div className={`team-status status-${reg.status.toLowerCase()}`}>
                      {reg.status === 'confirmed' || reg.status === 'approved' ? 'Подтверждена' : 
                       reg.status === 'pending' ? 'На рассмотрении' : 'Отклонена'}
                    </div>
                  </div>
                  
                  {reg.players && reg.players.length > 0 ? (
                    <div className="team-players">
                      <h4>Состав команды:</h4>
                      <ul className="players-list">
                        {reg.players.map((player, playerIndex) => (
                          <li key={player.id || playerIndex} className="player-item">
                            <span className="player-name">
                              {player.name || `Игрок ${playerIndex + 1}`}
                              {player.is_captain && <span className="captain-badge">Капитан</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="team-players">
                      <p className="no-players">Информация об игроках недоступна</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-teams">На данный момент нет зарегистрированных команд</p>
          )}
        </section>
        
        {/* Рекламная информация */}
        {advertisement && (
          <div className="advertisement">
            <h2>Реклама</h2>
            {advertisement.image_url && (
              <img 
                src={advertisement.image_url} 
                alt={advertisement.title || "Реклама"} 
                className="ad-image"
              />
            )}
            <h3>{advertisement.title}</h3>
            <p>{advertisement.description}</p>
            {advertisement.link && (
              <a href={advertisement.link} className="ad-link" target="_blank" rel="noopener noreferrer">
                Подробнее
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tournament;
