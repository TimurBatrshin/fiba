import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy, 
  faUsers, 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faChevronRight, 
  faSearch,
  faStar,
  faUserPlus,
  faBasketballBall
} from '@fortawesome/free-solid-svg-icons';
import defaultTournamentImg from '../../assets/images/default-tournament.jpg';
import defaultAvatar from '../../assets/images/default-avatar.png';
import heroBanner from '../../assets/images/hero-basketball.jpg';
import { AuthService } from '../../services/AuthService';
import { tournamentService } from '../../services/TournamentService';
import { Tournament as TournamentType } from '../../interfaces/Tournament';

// Интерфейс для игрока
interface Player {
  id: number;
  name: string;
  points: number;
  team: string;
  position: string;
  avatar: string;
}

const Home: React.FC = () => {
  const [upcomingTournaments, setUpcomingTournaments] = useState<TournamentType[]>([]);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Проверяем авторизацию
    setIsAuthenticated(AuthService.getInstance().isAuthenticated());

    // Загружаем данные о предстоящих турнирах
    const fetchTournaments = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const tournaments = await tournamentService.getUpcomingTournaments();
        setUpcomingTournaments(tournaments.slice(0, 3)); // Берем только 3 ближайших турнира
        
        // Временно используем моковые данные для игроков
        const players: Player[] = [
          {
            id: 1,
            name: "Александр Иванов",
            points: 456,
            team: "Moscow Stars",
            position: "Guard",
            avatar: defaultAvatar
          },
          {
            id: 2,
            name: "Михаил Петров",
            points: 445,
            team: "Kazan Tigers",
            position: "Forward",
            avatar: defaultAvatar
          },
          {
            id: 3,
            name: "Дмитрий Сидоров",
            points: 432,
            team: "St. Petersburg Knights",
            position: "Center",
            avatar: defaultAvatar
          },
          {
            id: 4,
            name: "Игорь Смирнов",
            points: 428,
            team: "Novosibirsk Wolves",
            position: "Forward",
            avatar: defaultAvatar
          },
          {
            id: 5,
            name: "Сергей Волков",
            points: 415,
            team: "Ekaterinburg Eagles",
            position: "Guard",
            avatar: defaultAvatar
          }
        ];
        
        setTopPlayers(players);
      } catch (error) {
        console.error("Ошибка при загрузке турниров:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const handleTournamentImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultTournamentImg;
    e.currentTarget.onerror = null; // Prevent infinite loop
  };

  const handlePlayerImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultAvatar;
    e.currentTarget.onerror = null; // Prevent infinite loop
  };

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

  // Функция для получения текста статуса
  const getStatusText = (status: string): string => {
    switch (status) {
      case "UPCOMING":
        return "Регистрация";
      case "ONGOING":
        return "В процессе";
      case "COMPLETED":
        return "Завершен";
      case "CANCELLED":
        return "Отменен";
      default:
        return "Неизвестно";
    }
  };

  // Функция для определения класса статуса
  const getStatusClass = (status: string): string => {
    switch (status) {
      case "UPCOMING":
        return "gh-status-registration";
      case "ONGOING":
        return "gh-status-in-progress";
      case "COMPLETED":
        return "gh-status-completed";
      case "CANCELLED":
        return "gh-status-cancelled";
      default:
        return "";
    }
  };

  return (
    <div className="github-home">
      {/* Герой секция */}
      <section className="gh-hero">
        <div className="gh-container">
          <div className="gh-hero-content">
            <h1>Баскетбол 3x3 начинается здесь</h1>
            <p>FIBA 3x3 — это платформа для создания турниров, управления командами и отслеживания статистики в формате 3x3.</p>
            
            <div className="gh-search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input 
                type="text" 
                placeholder="Найти турнир, команду или игрока..." 
                className="gh-search-input" 
              />
              <button className="gh-search-button">Поиск</button>
            </div>
            
            <div className="gh-hero-cta">
              <Link to="/tournaments" className="gh-button gh-button-primary">
                Найти турнир <FontAwesomeIcon icon={faChevronRight} />
              </Link>
            </div>
            
            <div className="gh-hero-stats">
              <div className="gh-stat-item">
                <span className="gh-stat-value">150+</span>
                <span className="gh-stat-label">Турниров</span>
              </div>
              <div className="gh-stat-item">
                <span className="gh-stat-value">1200+</span>
                <span className="gh-stat-label">Игроков</span>
              </div>
              <div className="gh-stat-item">
                <span className="gh-stat-value">30+</span>
                <span className="gh-stat-label">Городов</span>
              </div>
            </div>
          </div>
          
          <div className="gh-hero-image">
            <img src={heroBanner} alt="FIBA 3x3" />
          </div>
        </div>
      </section>
      
      {/* Секция популярных турниров */}
      <section className="gh-tournaments">
        <div className="gh-container">
          <div className="gh-section-header">
            <h2 className="gh-section-title">Ближайшие турниры</h2>
            <Link to="/tournaments" className="gh-view-all">
              Все турниры <FontAwesomeIcon icon={faChevronRight} />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="gh-loading-grid">
              {[1, 2, 3].map((item) => (
                <div key={item} className="gh-loading-card">
                  <div className="gh-loading-img"></div>
                  <div className="gh-loading-content">
                    <div className="gh-loading-title"></div>
                    <div className="gh-loading-meta"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="gh-error-message">
              <p>Не удалось загрузить данные о турнирах. Пожалуйста, попробуйте позже.</p>
            </div>
          ) : upcomingTournaments.length === 0 ? (
            <div className="gh-empty-state">
              <p>На данный момент нет запланированных турниров</p>
            </div>
          ) : (
            <div className="gh-tournaments-grid">
              {upcomingTournaments.map((tournament) => (
                <Link to={`/tournament/${tournament.id}`} key={tournament.id} className="gh-tournament-card">
                  <div className="gh-tournament-img">
                    <img 
                      src={tournament.imageUrl || defaultTournamentImg} 
                      alt={tournament.name} 
                      onError={handleTournamentImageError}
                    />
                    <div className={`gh-tournament-status ${getStatusClass(tournament.status)}`}>
                      {getStatusText(tournament.status)}
                    </div>
                    {tournament.isBusinessTournament && (
                      <div className="gh-tournament-business-badge">
                        Бизнес-турнир
                      </div>
                    )}
                  </div>
                  <div className="gh-tournament-content">
                    <h3 className="gh-tournament-title">{tournament.name}</h3>
                    <div className="gh-tournament-meta">
                      <div className="gh-meta-item">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>{formatDate(tournament.date)}</span>
                      </div>
                      <div className="gh-meta-item">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>{tournament.location}</span>
                      </div>
                      <div className="gh-meta-item">
                        <FontAwesomeIcon icon={faTrophy} />
                        <span>{tournament.prizePool}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Секция рейтинга игроков */}
      <section className="gh-top-players">
        <div className="gh-container">
          <div className="gh-section-header">
            <h2 className="gh-section-title">Лучшие игроки</h2>
            <Link to="/top-players" className="gh-view-all">
              Все игроки <FontAwesomeIcon icon={faChevronRight} />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="gh-loading">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="gh-loading-row">
                  <div className="gh-loading-avatar"></div>
                  <div className="gh-loading-name"></div>
                  <div className="gh-loading-points"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gh-top-players-table">
              <div className="gh-table-header">
                <div className="gh-header-rank">#</div>
                <div className="gh-header-player">Игрок</div>
                <div className="gh-header-team">Команда</div>
                <div className="gh-header-position">Позиция</div>
                <div className="gh-header-points">Очки</div>
              </div>
              
              {topPlayers.map((player, index) => (
                <div key={player.id} className="gh-table-row">
                  <div className="gh-player-rank">{index + 1}</div>
                  <div className="gh-player-info">
                    <img 
                      src={player.avatar} 
                      alt={player.name} 
                      className="gh-player-avatar" 
                      onError={handlePlayerImageError}
                    />
                    <span className="gh-player-name">{player.name}</span>
                  </div>
                  <div className="gh-player-team">{player.team}</div>
                  <div className="gh-player-position">{player.position}</div>
                  <div className="gh-player-points">
                    <span className="gh-points-value">{player.points}</span>
                    <FontAwesomeIcon icon={faStar} className="gh-points-icon" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Секция призыва к действию */}
      <section className="gh-cta-section">
        <div className="gh-container">
          <div className="gh-cta-content">
            <h2 className="gh-cta-title">Присоединяйтесь к сообществу FIBA 3x3</h2>
            <p className="gh-cta-text">
              Создайте профиль, чтобы участвовать в турнирах, отслеживать статистику и быть в курсе всех событий баскетбола 3x3.
            </p>
            
            {!isAuthenticated ? (
              <div className="gh-cta-buttons">
                <Link to="/fiba/register-user" className="gh-button gh-button-primary">
                  <FontAwesomeIcon icon={faUserPlus} /> Регистрация
                </Link>
                <Link to="/fiba/login" className="gh-button gh-button-outline">
                  Вход в аккаунт
                </Link>
              </div>
            ) : (
              <div className="gh-cta-buttons">
                <Link to="/fiba/profile" className="gh-button gh-button-primary">
                  <FontAwesomeIcon icon={faBasketballBall} /> Мой профиль
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
