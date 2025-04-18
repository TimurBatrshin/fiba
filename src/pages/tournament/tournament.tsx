import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./tournament.css"; // Исправленный импорт стилей
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTrophy, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { PlayerSearch } from '../../components/PlayerSearch/PlayerSearch';
import { 
  getTournamentById, 
  getAdvertisement, 
  registerTeam,
  TournamentData, 
  Player 
} from '../../services/api/tournaments';
import defaultAvatar from '../../assets/images/default-avatar.png';

// Добавляем типы для моковых данных
interface MockTeam {
  id: string;
  name: string;
  status: 'confirmed' | 'pending' | 'rejected';
  players: MockPlayer[];
}

interface MockPlayer {
  id: string;
  name: string;
  is_captain?: boolean;
}

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

  // Массивы с примерными названиями команд и именами игроков
  const mockTeamNames = [
    "Москва Старс", "Казань Тайгерс", "Питер Найтс", "Сочи Хитс", 
    "Новосиб Вулвз", "Урал Иглз", "Самара Шаркс", "Краснодар Буллс"
  ];
  
  const mockPlayerFirstNames = [
    "Александр", "Михаил", "Дмитрий", "Иван", "Сергей", "Андрей", "Николай", 
    "Владислав", "Максим", "Артем", "Евгений", "Кирилл", "Игорь", "Алексей", "Виктор"
  ];
  
  const mockPlayerLastNames = [
    "Иванов", "Петров", "Сидоров", "Смирнов", "Кузнецов", "Соколов", "Попов", 
    "Лебедев", "Козлов", "Новиков", "Морозов", "Волков", "Алексеев", "Лебедев", "Семенов"
  ];

  // Функция для генерации случайного игрока
  const generateMockPlayer = (index: number, isCaptain: boolean = false): MockPlayer => {
    const firstName = mockPlayerFirstNames[Math.floor(Math.random() * mockPlayerFirstNames.length)];
    const lastName = mockPlayerLastNames[Math.floor(Math.random() * mockPlayerLastNames.length)];
    
    return {
      id: `player-${index}`,
      name: `${firstName} ${lastName}`,
      is_captain: isCaptain
    };
  };

  // Функция для генерации случайной команды
  const generateMockTeam = (index: number): MockTeam => {
    const statusOptions: ('confirmed' | 'pending' | 'rejected')[] = ['confirmed', 'pending', 'rejected'];
    const status = statusOptions[Math.floor(Math.random() * (index === 0 ? 1 : 3))]; // Первая команда всегда подтверждена
    
    // Генерируем от 3 до 5 игроков для команды
    const playerCount = Math.floor(Math.random() * 3) + 3;
    const players: MockPlayer[] = [];
    
    for (let i = 0; i < playerCount; i++) {
      players.push(generateMockPlayer(i, i === 0)); // Первый игрок - капитан
    }
    
    return {
      id: `team-${index}`,
      name: mockTeamNames[index % mockTeamNames.length],
      status,
      players
    };
  };

  // Генерация данных для примера
  const mockTeams = Array.from({ length: 6 }, (_, i) => generateMockTeam(i));

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

  // Add image error handler
  const handlePlayerImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultAvatar;
    e.currentTarget.onerror = null; // Prevent infinite loop
  };

  // Add image error handler for tournament/ad images
  const handleTournamentImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // You could set a default tournament image here
    e.currentTarget.onerror = null; // Prevent infinite loop
    e.currentTarget.style.display = 'none'; // Hide broken image
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
                            <div className="player-avatar-container">
                              <img 
                                src={player.photoUrl || player.avatar || defaultAvatar} 
                                alt={player.name} 
                                className="player-avatar-small"
                                onError={handlePlayerImageError}
                              />
                            </div>
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
            <div className="mock-teams-container">
              <div className="mock-teams-header">
                <FontAwesomeIcon icon={faChartLine} className="mock-icon" />
                <h3>Пример зарегистрированных команд</h3>
                <p>Так будет выглядеть список команд после регистрации</p>
              </div>
              <div className="teams-container">
                {mockTeams.map((team, index) => (
                  <div key={team.id} className={`team-card ${team.status}`}>
                    <div className="team-card-header">
                      <h3 className="team-name">
                        <FontAwesomeIcon icon={faUser} className="team-icon" />
                        {team.name}
                      </h3>
                      <div className={`team-status status-${team.status}`}>
                        {team.status === 'confirmed' ? 'Подтверждена' : 
                         team.status === 'pending' ? 'На рассмотрении' : 'Отклонена'}
                      </div>
                    </div>
                    <div className="team-players">
                      <h4>Состав команды:</h4>
                      <ul className="players-list">
                        {team.players.map((player, playerIndex) => (
                          <li key={player.id} className="player-item">
                            <div className="player-avatar-container">
                              <img 
                                src={defaultAvatar} 
                                alt={player.name} 
                                className="player-avatar-small"
                              />
                            </div>
                            <span className="player-name">
                              {player.name}
                              {player.is_captain && <span className="captain-badge">Капитан</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mock-teams-note">
                Это пример команд. Зарегистрируйте свою команду первыми!
              </div>
            </div>
          )}
        </section>
        
        {/* Рекламная информация */}
        {advertisement && (
          <section className="advertisement">
            <h2>Реклама</h2>
            {advertisement.image_url && (
              <img 
                src={advertisement.image_url} 
                alt={advertisement.title || "Реклама"} 
                className="ad-image"
                onError={handleTournamentImageError}
              />
            )}
            <h3>{advertisement.title}</h3>
            <p>{advertisement.description}</p>
            {advertisement.link && (
              <a href={advertisement.link} className="ad-link" target="_blank" rel="noopener noreferrer">
                Подробнее
              </a>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Tournament;