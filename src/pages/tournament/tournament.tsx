import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./tournament.css"; // Исправленный импорт стилей
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTrophy, faChartLine, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { PlayerSearch } from '../../components/PlayerSearch/PlayerSearch';
import { 
  getTournamentById, 
  getAdvertisement, 
  registerTeam,
  TournamentData, 
  Player 
} from '../../services/api/tournaments';
import defaultAvatar from '../../assets/images/default-avatar.png';
import { useAuth } from "../../contexts/AuthContext";

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
  const { currentRole } = useAuth();
  const isAdmin = currentRole === 'admin';
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

  // Функция для подтверждения команды (только для админа)
  const handleConfirmTeam = async (teamId: string) => {
    try {
      // В реальном приложении здесь должен быть API запрос
      console.log(`Подтверждение команды с ID: ${teamId}`);
      // Примерная реализация запроса:
      // await ApiService.post(`/tournaments/${id}/teams/${teamId}/confirm`);
      
      // Обновляем UI
      if (tournament && tournament.Registrations) {
        const updatedRegistrations = tournament.Registrations.map(reg => {
          if (reg.id === teamId) {
            return { ...reg, status: 'confirmed' };
          }
          return reg;
        });
        
        setTournament({
          ...tournament,
          Registrations: updatedRegistrations
        });
      }
      
      // Показываем сообщение об успехе
      setRegistrationStatus("Команда успешно подтверждена");
      
      // Сбрасываем статус через 3 секунды
      setTimeout(() => {
        setRegistrationStatus("");
      }, 3000);
    } catch (error) {
      console.error("Ошибка при подтверждении команды:", error);
      setRegistrationStatus("Ошибка при подтверждении команды");
    }
  };
  
  // Функция для отклонения команды (только для админа)
  const handleRejectTeam = async (teamId: string) => {
    try {
      // В реальном приложении здесь должен быть API запрос
      console.log(`Отклонение команды с ID: ${teamId}`);
      // Примерная реализация запроса:
      // await ApiService.post(`/tournaments/${id}/teams/${teamId}/reject`);
      
      // Обновляем UI
      if (tournament && tournament.Registrations) {
        const updatedRegistrations = tournament.Registrations.map(reg => {
          if (reg.id === teamId) {
            return { ...reg, status: 'rejected' };
          }
          return reg;
        });
        
        setTournament({
          ...tournament,
          Registrations: updatedRegistrations
        });
      }
      
      // Показываем сообщение об успехе
      setRegistrationStatus("Команда отклонена");
      
      // Сбрасываем статус через 3 секунды
      setTimeout(() => {
        setRegistrationStatus("");
      }, 3000);
    } catch (error) {
      console.error("Ошибка при отклонении команды:", error);
      setRegistrationStatus("Ошибка при отклонении команды");
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

  // Изменим рендеринг команд для администратора
  const renderTeamCard = (registration: any) => (
    <div key={registration.id || Math.random()} className={`team-card ${registration.status.toLowerCase()}`}>
      <div className="team-card-header">
        <h3 className="team-name">
          <FontAwesomeIcon icon={faUser} className="team-icon" />
          {registration.team_name || 'Команда без названия'}
        </h3>
        <div className={`team-status status-${registration.status.toLowerCase()}`}>
          {registration.status === 'confirmed' || registration.status === 'approved' ? 'Подтверждена' : 
           registration.status === 'pending' ? 'На рассмотрении' : 'Отклонена'}
        </div>
      </div>
      
      {/* Список игроков команды */}
      <div className="team-players">
        <h4>Игроки:</h4>
        {registration.players && registration.players.length > 0 ? (
          <ul className="players-list">
            {registration.players.map((player: any, index: number) => (
              <li key={player.id || index}>
                {player.name || `Игрок ${index + 1}`}
                {player.is_captain && <span className="captain-badge">Капитан</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-players">Игроки не указаны</p>
        )}
      </div>
      
      {/* Кнопки для администратора */}
      {isAdmin && registration.status === 'pending' && (
        <div className="admin-actions">
          <button 
            className="admin-confirm-btn" 
            onClick={() => handleConfirmTeam(registration.id)}
          >
            <FontAwesomeIcon icon={faCheck} /> Подтвердить
          </button>
          <button 
            className="admin-reject-btn" 
            onClick={() => handleRejectTeam(registration.id)}
          >
            <FontAwesomeIcon icon={faTimes} /> Отклонить
          </button>
        </div>
      )}
    </div>
  );

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
          {registrationStatus && (
            <div className={`registration-status ${registrationStatus.includes('успешно') ? 'success' : 'error'}`}>
              {registrationStatus}
            </div>
          )}
          {(tournament?.Registrations && tournament.Registrations.length > 0) ? (
            <div className="teams-container">
              {tournament.Registrations.map((registration) => renderTeamCard(registration))}
            </div>
          ) : (
            <div className="no-teams">
              <p>Пока нет зарегистрированных команд</p>
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