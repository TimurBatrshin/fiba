import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./tournament.css"; // Исправленный импорт стилей
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTrophy, faChartLine, faCheck, faTimes, faSearch, faMapMarkerAlt, faCalendarAlt, faArrowLeft, faEdit, faTrash, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { PlayerSearch } from '../../components/PlayerSearch/PlayerSearch';
import { ProfilePhoto } from '../../components/ProfilePhoto/ProfilePhoto';
import TournamentService from '../../api/tournaments';
import { Tournament as TournamentType, Registration, TournamentStatus, Player } from '../../interfaces/Tournament';
import api from '../../api/client';
import { useAuth } from "../../contexts/AuthContext";
import { playerService } from '../../services/PlayerService';
import { toast } from 'react-hot-toast';
import { getStoredToken } from '../../utils/tokenStorage';
import defaultTeamLogo from '../../assets/images/default-tournament.jpg';
import { UserPhoto } from '../../components/UserPhoto/UserPhoto';

// Компонент Badge для отображения статуса
interface BadgeProps {
  status: string | undefined;
  text: string;
}

const Badge: React.FC<BadgeProps> = ({ status, text }) => {
  const getStatusClass = (status: string | undefined): string => {
    if (!status) return 'status-unknown';
    
    try {
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
    } catch (error) {
      console.error('Error processing status class:', error);
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
  
  try {
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
  } catch (error) {
    console.error('Error processing tournament status:', error);
    return 'Неизвестно';
  }
};

// Добавляем типы для использования в компоненте

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
  const { currentRole, isAuthenticated, currentUser } = useAuth();
  const isAdmin = currentRole === 'ADMIN';
  
  // Add mounted ref to prevent state updates after unmounting
  const isMounted = React.useRef(true);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeSetState = (setter: Function) => {
    if (isMounted.current) {
      setter();
    }
  };
  
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
  const [teamsLoaded, setTeamsLoaded] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [captain, setCaptain] = useState<Player | null>(null);

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
    setError(null);
    
    try {
      console.log('Fetching tournament data for ID:', id);
      const tournamentData = await TournamentService.getTournamentById(Number(id));
      
      if (!tournamentData) {
        console.error("Tournament data is empty");
        setError("Не удалось загрузить информацию о турнире. Получены пустые данные.");
        setTournament(null);
        return;
      }
      
      console.log('Tournament data received:', tournamentData);
      setTournament(tournamentData);
      setError(null);
      
    } catch (err: any) {
      console.error("Error fetching tournament:", err);
      const errorMessage = err.response?.data?.error || err.message || "Не удалось загрузить информацию о турнире";
      setError(errorMessage);
      setTournament(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Загрузка данных о турнире
  useEffect(() => {
    console.log('Current role:', currentRole, 'Is admin:', isAdmin);
    setTeamsLoaded(false); // Сбрасываем флаг при изменении ID
    fetchTournament();
  }, [id]);

  // Отдельный запрос для получения всех команд турнира
  useEffect(() => {
    if (id && tournament && !teamsLoaded) {
      const fetchTeams = async () => {
        try {
          console.log('Fetching teams for tournament:', id);
          const teams = await TournamentService.getTournamentTeams(Number(id));
          console.log('Teams received:', teams);
          
          setTeamsLoaded(true);
          if (teams && Array.isArray(teams) && teams.length > 0) {
            setTournament(prev => ({
              ...prev!,
              teams: teams
            }));
          } else {
            console.log('No teams found or empty teams array');
            setTournament(prev => ({
              ...prev!,
              teams: []
            }));
          }
        } catch (error: any) {
          console.error('Ошибка при получении команд турнира:', error);
          const errorMessage = error.response?.data?.error || error.message;
          console.error('Teams fetch error details:', errorMessage);
          setTournament(prev => ({
            ...prev!,
            teams: []
          }));
        }
      };
      
      fetchTeams();
    }
  }, [id, tournament, teamsLoaded]);

  // Добавляем эффект для автоматического добавления капитана
  useEffect(() => {
    const initializeCaptain = async () => {
      if (currentUser && currentUser.id) {
        try {
          // Получаем данные игрока-капитана
          const playerData = await playerService.getPlayerById(currentUser.id.toString());
          const captainPlayer: Player = {
            id: currentUser.id,
            name: playerData.name,
            email: playerData.email || '',
            email_verified: !!playerData.email_verified,
            role: playerData.role || 'user',
            profile: {
              photo_url: playerData.profile?.photo_url || undefined,
              tournaments_played: playerData.profile?.tournaments_played,
              total_points: playerData.profile?.total_points,
              rating: playerData.profile?.rating
            }
          };
          setCaptain(captainPlayer);
          // Автоматически добавляем капитана в список выбранных игроков
          setSelectedPlayers([captainPlayer]);
          setPlayerIds([captainPlayer.id.toString()]);
        } catch (error) {
          console.error("Ошибка при получении данных капитана:", error);
        }
      }
    };

    initializeCaptain();
  }, [currentUser]);

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
    
    // Валидация имени команды
    if (!newName || newName.trim().length === 0) {
      setTeamNameError("Введите название команды");
    } else if (newName.trim().length < 3) {
      setTeamNameError("Название должно содержать минимум 3 символа");
    } else if (newName.trim().length > 50) {
      setTeamNameError("Название должно быть не более 50 символов");
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

    if (captain && player.id === captain.id) {
      setPlayersError("Капитан уже добавлен в команду");
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
    // Проверяем, не пытается ли пользователь удалить капитана
    if (captain && playerId === captain.id.toString()) {
      setPlayersError("Нельзя удалить капитана команды");
      return;
    }

    setSelectedPlayers(selectedPlayers.filter(player => player.id.toString() !== playerId));
    setPlayerIds(playerIds.filter(id => id !== playerId));
    setRegistrationStatus("");
    
    if (selectedPlayers.length <= 4) {
      setPlayersError(null);
    }
    
    if (selectedPlayers.length <= 3) {
      setPlayersError("Выберите минимум 3 игрока");
    }
  };

  // Обработчик отправки формы регистрации команды
  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем авторизацию до начала процесса
    const token = getStoredToken();
    if (!isAuthenticated || !token) {
      navigate('/login', { 
        state: { 
          from: `/tournaments/${tournament?.id}`,
          message: 'Для регистрации команды необходимо авторизоваться'
        } 
      });
      return;
    }

    // Проверяем валидность данных
    if (!tournament || !teamName.trim()) {
      safeSetState(() => setTeamNameError('Название команды обязательно'));
      return;
    }

    if (!selectedPlayers || selectedPlayers.length < 3) {
      safeSetState(() => setPlayersError('Необходимо выбрать минимум 3 игрока'));
      return;
    }

    safeSetState(() => {
      setIsTeamRegistering(true);
      setRegistrationStatus("Регистрация команды...");
    });

    try {
      // Создаем FormData для отправки данных
      const formData = new FormData();
      formData.append('teamName', teamName);
      formData.append('playerIds', JSON.stringify(playerIds));

      // Отправляем запрос на регистрацию команды
      const response = await api.post(
        `/tournaments/${id}/teams/register`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response && response.data) {
        safeSetState(() => {
          setRegistrationStatus("Команда успешно зарегистрирована!");
          setTeamName("");
          setPlayerIds([]);
          setSelectedPlayers([]);
        });

        // Обновляем список команд
        const updatedTeams = await TournamentService.getTournamentTeams(Number(id));
        if (updatedTeams) {
          safeSetState(() => {
            setTournament(prev => ({
              ...prev!,
              teams: updatedTeams
            }));
            setTeamsLoaded(true);
          });
        }

        toast.success("Команда успешно зарегистрирована!");
      }
    } catch (error) {
      console.error("Ошибка при регистрации команды:", error);
      safeSetState(() => {
        setRegistrationStatus("Ошибка при регистрации команды");
      });
      toast.error("Ошибка при регистрации команды");
    } finally {
      safeSetState(() => {
        setIsTeamRegistering(false);
      });
    }
  };

  // Add image error handler
  const handlePlayerImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultTeamLogo;
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
      const response = await api.post(`/tournaments/${id}/teams/${teamId}/confirm`);
      console.log('Ответ сервера при подтверждении:', response.data);
      
      // Проверяем успешный ответ от API, учитывая разные варианты статуса
      if (response && response.data?.status && 
          ['CONFIRMED', 'confirmed', 'APPROVED', 'approved'].includes(response.data.status)) {
        // Сначала получаем обновленные данные команд
        const updatedTeams = await TournamentService.getTournamentTeams(Number(id));
        
        // Затем обновляем состояние турнира с новыми данными команд
        setTournament(prev => ({
          ...prev!,
          teams: updatedTeams
        }));
        
        setTeamsLoaded(true);
        setRegistrationStatus("Команда успешно подтверждена");
        toast.success("Команда успешно подтверждена");
      } else {
        setRegistrationStatus("Неизвестная ошибка при подтверждении команды");
        toast.error("Неизвестная ошибка при подтверждении команды");
      }
    } catch (error: any) {
      console.error("Ошибка при подтверждении команды:", error);
      const errorMessage = error.data?.error || error.message || "Ошибка при подтверждении команды";
      setRegistrationStatus(`Ошибка: ${errorMessage}`);
      toast.error(errorMessage);
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
      const response = await api.post(`/tournaments/${id}/teams/${teamId}/reject`);
      console.log('Ответ сервера при отклонении:', response.data);
      
      // Проверяем успешный ответ от API, учитывая разные варианты статуса
      if (response && response.data?.status && 
          ['REJECTED', 'rejected'].includes(response.data.status)) {
        // Сначала получаем обновленные данные команд
        const updatedTeams = await TournamentService.getTournamentTeams(Number(id));
        
        // Затем обновляем состояние турнира с новыми данными команд
        setTournament(prev => ({
          ...prev!,
          teams: updatedTeams
        }));
        
        setTeamsLoaded(true);
        setRegistrationStatus("Команда отклонена");
        toast.success("Команда успешно отклонена");
      } else {
        setRegistrationStatus("Неизвестная ошибка при отклонении команды");
        toast.error("Неизвестная ошибка при отклонении команды");
      }
    } catch (error: any) {
      console.error("Ошибка при отклонении команды:", error);
      const errorMessage = error.data?.error || error.message || "Ошибка при отклонении команды";
      setRegistrationStatus(`Ошибка: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setIsTeamActionLoading(false);
      setActionTeamId(null);
    }
  };

  const getTeamStatusText = (status: string): string => {
    const normalizedStatus = status.toLowerCase();
    switch(normalizedStatus) {
      case 'confirmed':
      case 'approved':
        return 'Подтверждена';
      case 'rejected':
        return 'Отклонена';
      case 'pending':
        return 'На рассмотрении';
      default:
        console.log('Неизвестный статус команды:', status);
        return 'Статус неизвестен';
    }
  };

  // Изменим рендеринг команд для соответствия новому формату данных
  const renderTeamCard = (team: TournamentTeam) => (
    <div key={team.id} className={`team-card ${team.status.toLowerCase()}`}>
      <div className="team-card-header">
        <h3 className="team-name">
          {team.name || 'Команда без названия'}
        </h3>
        <div className={`team-status status-${team.status.toLowerCase()}`}>
          {getTeamStatusText(team.status)}
        </div>
      </div>
      
      {team.position && (
        <div className="team-position">
          <FontAwesomeIcon icon={faTrophy} />
          <span>Место: {team.position}</span>
        </div>
      )}
      
      <div className="team-players">
        <h4>Игроки:</h4>
        {team.players && team.players.length > 0 ? (
          <ul className="players-list">
            {team.players.map((player) => (
              <li key={player.id} className="player-item">
                <div className="player-avatar-container">
                  <UserPhoto 
                    photoUrl={player.photo}
                    className="player-avatar"
                    alt={player.name}
                  />
                </div>
                <div className="player-info">
                  <span className="player-name">{player.name}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-players">Игроки не указаны</p>
        )}
      </div>
      
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
    const registrationAvailable = tournament ? isRegistrationAvailable(tournament) : undefined;
    
    if (registrationAvailable === false) {
      return (
        <div className="registration-closed">
          <p>Регистрация на турнир закрыта.</p>
        </div>
      );
    }

    return (
      <div className="team-registration-section">
        <h3>Регистрация команды</h3>
        <form onSubmit={(e) => handleRegisterTeam(e)} className="team-registration-form">
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
                        <UserPhoto 
                          photoUrl={player.profile?.photo_url}
                          className="player-avatar"
                          alt={player.name}
                        />
                        <div className="player-details">
                          <span className="player-name">{player.name}</span>
                          {captain && player.id === captain.id && (
                            <span className="captain-badge">Капитан</span>
                          )}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemovePlayer(player.id.toString())}
                        className="remove-player-button"
                        disabled={isTeamRegistering || (captain && player.id === captain.id) || false}
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
            <span className="value">
              {tournament?.prizePool ? `${tournament.prizePool} руб.` : 'Не указан'}
            </span>
          </div>
        </section>
        
        <section className="tournament-teams">
          {renderTeamRegistrationForm()}
          {tournament && tournament.teams && tournament.teams.length > 0 ? (
            <div className="teams-list">
              {tournament.teams.map((team) => renderTeamCard(team))}
            </div>
          ) : (
            <p className="no-teams">Команды не найдены</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Tournament;