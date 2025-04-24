import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./tournament.css"; // Исправленный импорт стилей
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTrophy, faChartLine, faCheck, faTimes, faSearch, faMapMarkerAlt, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { PlayerSearch } from '../../components/PlayerSearch/PlayerSearch';
import TournamentService from '../../api/tournaments';
import { Tournament as TournamentType, Registration, TournamentStatus } from '../../interfaces/Tournament';
import api from '../../api/client';
import defaultAvatar from '../../assets/images/default-avatar.png';
import { useAuth } from "../../contexts/AuthContext";
import { playerService } from '../../services/PlayerService';

// Компонент Badge для отображения статуса
interface BadgeProps {
  status: string;
  text: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, text }) => {
  const getStatusClass = (status: string): string => {
    switch(status.toUpperCase()) {
      case 'UPCOMING':
      case 'REGISTRATION':
        return 'status-registration';
      case 'ONGOING':
      case 'IN_PROGRESS':
        return 'status-in_progress';
      case 'COMPLETED':
      case 'CANCELLED':
        return 'status-completed';
      default:
        return 'status-unknown';
    }
  };

  return (
    <div className={`status-badge ${getStatusClass(status)}`}>
      {text}
    </div>
  );
};

// Функция для отображения статуса на русском
const getStatusText = (status?: string): string => {
  if (!status) return 'Неизвестно';
  
  switch(status.toUpperCase()) {
    case 'UPCOMING':
      return 'Регистрация';
    case 'REGISTRATION':
      return 'Регистрация';
    case 'ONGOING':
    case 'IN_PROGRESS':
      return 'В процессе';
    case 'COMPLETED':
      return 'Завершен';
    case 'CANCELLED':
      return 'Отменен';
    default:
      return 'Неизвестно';
  }
};

// Добавляем типы для использования в компоненте
export interface Player {
  id: string | number;
  name: string;
  avatar?: string;
  photoUrl?: string;
}

// Функция для регистрации команды
const registerTeam = async (tournamentId: string, teamName: string, playerIds: string[]) => {
  return TournamentService.registerForTournament(Number(tournamentId), teamName, playerIds);
};

// Используем функцию поиска игроков из сервиса
const searchPlayers = async (query: string) => {
  try {
    // Use direct API client call with proper params structure
    const response = await api.get('/players/search', { 
      params: { query }
    });
    return response;
  } catch (error) {
    console.error("Error searching players:", error);
    return { data: [] };
  }
};

// Добавим функцию для проверки доступности регистрации
const isRegistrationAvailable = (tournament?: TournamentType) => {
  if (!tournament) return false;
  
  // Проверяем статус турнира - регистрация доступна только для предстоящих турниров
  const isUpcomingStatus = tournament.status === 'UPCOMING' || tournament.status === 'REGISTRATION';
  
  // По новой логике, если registration_open не определено или null, считаем регистрацию открытой
  const isRegistrationOpen = tournament.registrationOpen !== false;
  
  return isUpcomingStatus && isRegistrationOpen;
};

// Функция для проверки, содержит ли строка кириллицу
const containsCyrillic = (text: string): boolean => {
  return /[а-яА-ЯёЁ]/.test(text);
};

// Функция, возвращающая минимальную длину для названия команды
const getMinTeamNameLength = (text: string): number => {
  return 3; // Минимум 3 символа для любых названий
};

// Добавим интерфейсы для новой структуры данных команд
interface TournamentPlayer {
  id: number;
  name: string;
  photo: string | null;
}

interface TournamentTeam {
  id: number;
  name: string;
  logo: string | null;
  status: string;
  position: number | null;
  registration_date: string;
  players: TournamentPlayer[];
}

const Tournament = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { currentRole, isAuthenticated } = useAuth();
  // Проверка на админа с учетом нормализованной роли из контекста
  const isAdmin = currentRole === 'ADMIN';
  
  console.log(`Tournament component: currentRole="${currentRole}", isAdmin=${isAdmin}`);
  
  const [tournament, setTournament] = useState<TournamentType | null>(null);
  const [teamName, setTeamName] = useState("");
  const [playerIds, setPlayerIds] = useState<string[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [registrationStatus, setRegistrationStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useParams<{ userId: string }>();
  const [isTeamRegistering, setIsTeamRegistering] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [teamNameError, setTeamNameError] = useState<string | null>(null);
  const [playersError, setPlayersError] = useState<string | null>(null);
  const [isTeamActionLoading, setIsTeamActionLoading] = useState(false);
  const [actionTeamId, setActionTeamId] = useState<string | number | null>(null);

  // Компонент с информацией об ошибке и кнопкой возврата
  const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="tournament-error-container">
      <div className="tournament-error">
        <h2>Ошибка при загрузке турнира</h2>
        <p>{message}</p>
        <div className="tournament-error-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => navigate(-1)}
          >
            Вернуться назад
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              if (id) {
                setIsLoading(true);
                setError(null);
                fetchTournament();
              }
            }}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    </div>
  );
  
  // Выносим fetchTournament в отдельную функцию, чтобы можно было вызвать повторно
  const fetchTournament = async () => {
    if (!id) {
      setError("ID турнира не указан");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Получаем данные турнира из API используя правильный метод сервиса
      const tournamentData = await TournamentService.getTournamentById(Number(id));
      
      if (!tournamentData) {
        setError("Не удалось загрузить информацию о турнире. Получены пустые данные.");
        setTournament(null);
        return;
      }
      
      // Проверяем, является ли tournamentData объектом и есть ли у него нужные поля
      if (typeof tournamentData !== 'object') {
        setError("Неверный формат данных турнира");
        setTournament(null);
        return;
      }
      
      // Все в порядке, устанавливаем данные турнира
      setTournament(tournamentData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Не удалось загрузить информацию о турнире. Пожалуйста, попробуйте позже.");
      setTournament(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Загрузка данных о турнире
  useEffect(() => {
    // Выводим значение роли пользователя для отладки
    console.log('Current role:', currentRole, 'Is admin:', isAdmin);
    fetchTournament();
  }, [id]);

  // Отдельный запрос для получения всех команд турнира
  useEffect(() => {
    if (id && tournament) {
      // Если у турнира нет команд, но он существует в БД, делаем дополнительный запрос
      if (!tournament.teams || tournament.teams.length === 0) {
        const fetchTeams = async () => {
          try {
            const teams = await TournamentService.getTeamsForTournament(Number(id));
            if (teams && teams.length > 0) {
              setTournament({
                ...tournament,
                teams: teams
              });
            } else {
              // Просто отмечаем, что команд нет, но не показываем ошибку пользователю
              setTournament({
                ...tournament,
                teams: []
              });
            }
          } catch (error: any) {
            console.error('Ошибка при получении команд турнира:', error);
            
            // Обработка ошибки сервера
            if (error.status === 500) {
              // При ошибке 500 мы просто устанавливаем пустой массив команд, 
              // чтобы не мешать пользователю просматривать информацию о турнире
              setTournament({
                ...tournament,
                teams: []
              });
            } else {
              // При других ошибках можем показать уведомление
              const errorMessage = error.message || 'Не удалось загрузить список команд';
              // Опциально: показать уведомление, но не стоит блокировать весь просмотр турнира
              // setError(errorMessage);
              
              // Просто записываем пустой массив команд
              setTournament({
                ...tournament,
                teams: []
              });
            }
          }
        };
        
        fetchTeams();
      }
    }
  }, [id, tournament]);

  // Добавляем возврат компонента с ошибкой, если произошла ошибка загрузки
  if (error) {
    return <ErrorDisplay message={error} />;
  }
  
  // Показываем загрузку, если данные загружаются
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка информации о турнире...</p>
      </div>
    );
  }
  
  // Если данные не загружены и нет ошибки, возвращаем заглушку
  if (!tournament && !error && !isLoading) {
    return <ErrorDisplay message="Информация о турнире не найдена" />;
  }

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) {
        return "Дата не указана";
      }

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
      return "Дата не указана";
    }
  };

  // Обработчик изменения имени команды
  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setTeamName(newName);
    
    const minLength = getMinTeamNameLength(newName);
    
    // Валидация имени команды
    if (newName.trim().length === 0) {
      setTeamNameError("Введите название команды");
    } else if (newName.trim().length < minLength) {
      setTeamNameError("Название должно содержать минимум 3 символа");
    } else if (newName.trim().length > 50) {
      setTeamNameError("Название слишком длинное (максимум 50 символов)");
    } else {
      setTeamNameError(null);
    }
  };

  // Обработчик выбора игрока
  const handleSelectPlayer = (player: Player) => {
    setSearchLoading(true);
    
    if (selectedPlayers.length >= 4) {
      setPlayersError("Максимальное количество игроков в команде - 4");
      setSearchLoading(false);
      return;
    }
    
    if (selectedPlayers.some(p => p.id === player.id)) {
      setPlayersError("Этот игрок уже добавлен в команду");
      setSearchLoading(false);
      return;
    }
    
    setSelectedPlayers([...selectedPlayers, player]);
    setPlayerIds([...playerIds, player.id.toString()]);
    setRegistrationStatus("");
    setPlayersError(null);
    setSearchLoading(false);
  };

  // Обработчик удаления игрока из выбранных
  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(player => player.id.toString() !== playerId));
    setPlayerIds(playerIds.filter(id => id !== playerId));
    setRegistrationStatus("");
    
    // Обновляем ошибку игроков, если она была
    if (selectedPlayers.length <= 4) {
      setPlayersError(null);
    }
    
    // Проверяем минимальное количество игроков
    if (selectedPlayers.length <= 3) {
      setPlayersError("Выберите минимум 3 игрока");
    }
  };

  // Функция для форматирования сообщения об ошибке
  const formatErrorMessage = (error: any): string => {
    // Проверка на особые случаи ошибок
    if (error.data?.error === "Регистрация на этот турнир закрыта") {
      return "Регистрация на этот турнир закрыта";
    }
    
    // Ищем сообщение об ошибке в разных местах
    if (error.data?.error) return `Ошибка: ${error.data.error}`;
    if (error.response?.data?.error) return `Ошибка: ${error.response.data.error}`;
    if (error.response?.data?.message) return `Ошибка: ${error.response.data.message}`;
    if (error.message) return `Ошибка: ${error.message}`;
    
    return "Не удалось зарегистрировать команду";
  };

  // Обработчик отправки формы регистрации команды
  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация формы
    let hasError = false;
    
    const minLength = getMinTeamNameLength(teamName);
    
    if (!teamName || teamName.trim().length < minLength) {
      setTeamNameError("Название должно содержать минимум 3 символа");
      hasError = true;
    }
    
    if (playerIds.length < 3) {
      setPlayersError("В команде должно быть минимум 3 игрока");
      hasError = true;
    }
    
    if (hasError || !id) {
      return;
    }
    
    // Проверяем доступность регистрации с помощью новой функции с учетом возможного null значения
    if (!tournament || !isRegistrationAvailable(tournament)) {
      setRegistrationStatus("Регистрация на этот турнир закрыта");
      return;
    }
    
    try {
      setIsTeamRegistering(true);
      setRegistrationStatus("Регистрация команды...");
      
      // Вызов метода регистрации команды
      const response = await registerTeam(id, teamName, playerIds);
      
      // После вызова TournamentService.registerForTournament мы получаем напрямую данные, а не объект ответа
      if (response) {
        setRegistrationStatus("Команда успешно зарегистрирована!");
        
        // Очистка полей после успешной регистрации
        setTeamName("");
        setPlayerIds([]);
        setSelectedPlayers([]);
        setTeamNameError(null);
        setPlayersError(null);

        // Обновляем данные о турнире после успешной регистрации
        const updatedTournament = await TournamentService.getTournamentById(Number(id));
        if (updatedTournament) {
          setTournament(updatedTournament);
        }
        
        // Скролл к списку команд
        const teamsSection = document.querySelector('.registered-teams');
        if (teamsSection) {
          teamsSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        setRegistrationStatus("Ошибка при регистрации команды. Пожалуйста, попробуйте снова.");
      }
    } catch (error: any) {
      console.error("Ошибка при регистрации команды:", error);
      setRegistrationStatus(formatErrorMessage(error));
    } finally {
      setIsTeamRegistering(false);
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
  const handleConfirmTeam = async (teamId: string | number) => {
    setIsTeamActionLoading(true);
    setActionTeamId(teamId);
    setRegistrationStatus("Подтверждение команды...");
    
    try {
      // Делаем API запрос для подтверждения команды
      const response = await api.post(`/tournaments/${id}/teams/${teamId}/confirm`);
      
      // Проверяем успешный ответ от API
      if (response && response.status === 'CONFIRMED') {
        // Обновляем UI через повторную загрузку данных турнира
        if (id) {
          const updatedTournament = await TournamentService.getTournamentById(Number(id));
          if (updatedTournament) {
            setTournament(updatedTournament);
          }
        }
        
        // Показываем сообщение об успехе
        setRegistrationStatus(response.message || "Команда успешно подтверждена");
      } else {
        // Если ответ не содержит ожидаемых данных
        setRegistrationStatus("Неизвестная ошибка при подтверждении команды");
      }
    } catch (error: any) {
      console.error("Ошибка при подтверждении команды:", error);
      
      // Обрабатываем различные варианты ошибок в соответствии с API
      if (error.data?.error) {
        setRegistrationStatus(`Ошибка: ${error.data.error}`);
      } else if (error.message) {
        setRegistrationStatus(`Ошибка: ${error.message}`);
      } else {
        setRegistrationStatus("Ошибка при подтверждении команды");
      }
    } finally {
      setIsTeamActionLoading(false);
      setActionTeamId(null);
    }
  };
  
  // Функция для отклонения команды (только для админа)
  const handleRejectTeam = async (teamId: string | number) => {
    setIsTeamActionLoading(true);
    setActionTeamId(teamId);
    setRegistrationStatus("Отклонение команды...");
    
    try {
      // Делаем API запрос для отклонения команды
      const response = await api.post(`/tournaments/${id}/teams/${teamId}/reject`);
      
      // Проверяем успешный ответ от API
      if (response && response.status === 'REJECTED') {
        // Обновляем UI через повторную загрузку данных турнира
        if (id) {
          const updatedTournament = await TournamentService.getTournamentById(Number(id));
          if (updatedTournament) {
            setTournament(updatedTournament);
          }
        }
        
        // Показываем сообщение об успехе
        setRegistrationStatus(response.message || "Команда отклонена");
      } else {
        // Если ответ не содержит ожидаемых данных
        setRegistrationStatus("Неизвестная ошибка при отклонении команды");
      }
    } catch (error: any) {
      console.error("Ошибка при отклонении команды:", error);
      
      // Обрабатываем различные варианты ошибок в соответствии с API
      if (error.data?.error) {
        setRegistrationStatus(`Ошибка: ${error.data.error}`);
      } else if (error.message) {
        setRegistrationStatus(`Ошибка: ${error.message}`);
      } else {
        setRegistrationStatus("Ошибка при отклонении команды");
      }
    } finally {
      setIsTeamActionLoading(false);
      setActionTeamId(null);
    }
  };

  // Добавим компонент формы регистрации команды
  const renderTeamRegistrationForm = () => {
    if (!isAuthenticated) {
      return (
        <div className="registration-login-prompt">
          <p>Для регистрации команды необходимо <Link to="/login">войти в систему</Link>.</p>
        </div>
      );
    }

    // Используем новую функцию для проверки доступности регистрации с учетом возможного null значения
    const registrationAvailable = tournament ? isRegistrationAvailable(tournament) : false;
    
    if (!registrationAvailable) {
      return (
        <div className="registration-closed">
          <p>Регистрация на турнир закрыта.</p>
        </div>
      );
    }

    return (
      <div className="team-registration-section">
        <h3>Регистрация команды</h3>
        <form onSubmit={handleRegisterTeam} className="team-registration-form">
          <div className={`form-group ${teamNameError ? 'has-error' : ''}`}>
            <label htmlFor="teamName">Название команды</label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={handleTeamNameChange}
              placeholder="Введите название команды"
              required
              minLength={3}
              maxLength={50}
              disabled={isTeamRegistering}
              className={teamNameError ? 'input-error' : ''}
            />
            {teamNameError && <div className="input-error-message">{teamNameError}</div>}
            <div className="input-help-text">
              Название команды должно быть от 3 до 50 символов
            </div>
          </div>
          
          <div className={`form-group ${playersError ? 'has-error' : ''}`}>
            <label>Состав команды</label>
            <div className="selected-players-list">
              {selectedPlayers.length > 0 ? (
                <ul className="players-list">
                  {selectedPlayers.map((player) => (
                    <li key={player.id} className="selected-player">
                      <div className="player-info">
                        <img 
                          src={player.avatar || defaultAvatar} 
                          alt={player.name} 
                          className="player-avatar" 
                          onError={handlePlayerImageError}
                        />
                        <div className="player-details">
                          <span className="player-name">{player.name}</span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemovePlayer(player.id.toString())}
                        className="remove-player-button"
                        disabled={isTeamRegistering}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-players-selected">Игроки не выбраны</p>
              )}
            </div>
            
            {playersError && <div className="input-error-message">{playersError}</div>}
            
            <div className="player-search-container">
              <div className={`player-search-wrapper ${searchLoading ? 'is-loading' : ''}`}>
                <PlayerSearch 
                  onSelectPlayer={handleSelectPlayer} 
                  onRemovePlayer={handleRemovePlayer}
                  selectedPlayers={selectedPlayers}
                  disabled={isTeamRegistering || selectedPlayers.length >= 4}
                  hideSelectedPlayersList={true}
                />
                {searchLoading && <div className="search-loader"><div className="spinner-small"></div></div>}
              </div>
              <p className="player-search-hint">Поиск и добавление игроков (минимум 3, максимум 4)</p>
            </div>
          </div>
          
          {registrationStatus && (
            <div className={`registration-status ${registrationStatus.includes('успешно') ? 'success' : registrationStatus.includes('Ошибка') ? 'error' : 'info'}`}>
              {registrationStatus}
            </div>
          )}
          
          <button 
            type="submit" 
            className={`register-team-btn ${isTeamRegistering ? 'is-loading' : ''}`}
            disabled={isTeamRegistering || !teamName || teamName.length < 3 || playerIds.length < 3 || !!teamNameError || !!playersError}
          >
            {isTeamRegistering ? (
              <>
                <span className="spinner-small"></span>
                <span>Регистрация...</span>
              </>
            ) : (
              'Зарегистрировать команду'
            )}
          </button>
        </form>
      </div>
    );
  };

  // Изменим рендеринг команд для соответствия новому формату данных
  const renderTeamCard = (team: TournamentTeam) => (
    <div key={team.id} className={`team-card ${team.status.toLowerCase()}`}>
      <div className="team-card-header">
        <h3 className="team-name">
          {team.logo ? (
            <img 
              src={team.logo} 
              alt={`${team.name} logo`} 
              className="team-logo" 
              onError={handleTournamentImageError}
            />
          ) : (
            <FontAwesomeIcon icon={faUser} className="team-icon" />
          )}
          {team.name || 'Команда без названия'}
        </h3>
        <div className={`team-status status-${team.status.toLowerCase()}`}>
          {team.status === 'CONFIRMED' ? 'Подтверждена' : 
           team.status === 'PENDING' ? 'На рассмотрении' : 'Отклонена'}
        </div>
      </div>
      
      {team.position && (
        <div className="team-position">
          <FontAwesomeIcon icon={faTrophy} />
          <span>Место: {team.position}</span>
        </div>
      )}
      
      {/* Список игроков команды */}
      <div className="team-players">
        <h4>Игроки:</h4>
        {team.players && team.players.length > 0 ? (
          <ul className="players-list">
            {team.players.map((player) => (
              <li key={player.id} className="player-item">
                <div className="player-avatar-container">
                  <img 
                    src={player.photo || defaultAvatar} 
                    alt={player.name} 
                    className="player-avatar" 
                    onError={handlePlayerImageError}
                  />
                </div>
                <span className="player-name">{player.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-players">Игроки не указаны</p>
        )}
      </div>
      
      {/* Кнопки для администратора */}
      {team && isAuthenticated && (
        <>
          {team.status === 'PENDING' && isAdmin && (
            <div className="admin-actions">
              <button 
                className={`admin-btn confirm-btn ${isTeamActionLoading && actionTeamId === team.id ? 'is-loading' : ''}`}
                onClick={() => handleConfirmTeam(team.id)}
                disabled={isTeamActionLoading}
              >
                {isTeamActionLoading && actionTeamId === team.id ? (
                  <>
                    <span className="spinner-small"></span>
                    <span>Подтверждение...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} /> Подтвердить
                  </>
                )}
              </button>
              <button 
                className={`admin-btn reject-btn ${isTeamActionLoading && actionTeamId === team.id ? 'is-loading' : ''}`}
                onClick={() => handleRejectTeam(team.id)}
                disabled={isTeamActionLoading}
              >
                {isTeamActionLoading && actionTeamId === team.id ? (
                  <>
                    <span className="spinner-small"></span>
                    <span>Отклонение...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTimes} /> Отклонить
                  </>
                )}
              </button>
              {registrationStatus && <div className="admin-message">{registrationStatus}</div>}
            </div>
          )}
        </>
      )}
      
      <div className="team-registration-date">
        <small>Дата регистрации: {formatDate(team.registration_date)}</small>
      </div>
    </div>
  );

  return (
    <div className="tournament-page">
      <header className="tournament-header">
        <div className="tournament-details-header">
          <h1>{tournament?.name || 'Загрузка турнира...'}</h1>
          <div className="tournament-meta">
            <Badge status={tournament?.status || 'UPCOMING'} text={getStatusText(tournament?.status)} />
            <span className="tournament-location">
              <FontAwesomeIcon icon={faMapMarkerAlt} /> {tournament?.location || ''}
            </span>
            <span className="tournament-date">
              <FontAwesomeIcon icon={faCalendarAlt} /> {tournament?.date ? formatDate(tournament.date) : ''}
            </span>
          </div>
        </div>
      </header>
      
      <div className="tournament-content">
        <section className="tournament-prize">
          <div className="prize-info">
            <span className="label">ПРИЗОВОЙ ФОНД:</span>
            <span className="value">{tournament?.prizePool ? `${tournament.prizePool} руб.` : 'Не указан'}</span>
          </div>
        </section>
        
        <section className="tournament-description">
          <h2>Описание турнира</h2>
          <div className="description-text">
            {tournament?.title || "Информация о турнире загружается..."}
          </div>
        </section>
        
        {/* Добавляем секцию регистрации команды */}
        <section className="team-registration">
          {renderTeamRegistrationForm()}
        </section>
        
        <section className="registered-teams">
          <h2>Зарегистрированные команды</h2>
          
          {(tournament?.teams && tournament.teams.length > 0) ? (
            <div className="teams-container">
              {tournament.teams.map((team) => renderTeamCard(team as unknown as TournamentTeam))}
            </div>
          ) : (
            <div className="no-teams">
              <p>Пока нет зарегистрированных команд</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Tournament;