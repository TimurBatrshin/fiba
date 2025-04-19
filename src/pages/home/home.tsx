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

// Добавим типы данных
interface Tournament {
  id: number;
  name: string;
  date: string;
  location: string;
  teamCount: number;
  image: string;
}

interface Player {
  id: number;
  name: string;
  points: number;
  team: string;
  position: string;
  avatar: string;
}

const Home: React.FC = () => {
  const [popularTournaments, setPopularTournaments] = useState<Tournament[]>([]);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Проверяем авторизацию
    setIsAuthenticated(AuthService.getInstance().isAuthenticated());
  }, []);

  const handleTournamentImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultTournamentImg;
    e.currentTarget.onerror = null; // Prevent infinite loop
  };

  const handlePlayerImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultAvatar;
    e.currentTarget.onerror = null; // Prevent infinite loop
  };

  useEffect(() => {
    // Здесь будет запрос к API, сейчас используем моковые данные
    const tournaments: Tournament[] = [
      {
        id: 1,
        name: "FIBA 3x3 Moscow Open",
        date: "15 июля 2023",
        location: "Москва",
        teamCount: 16,
        image: defaultTournamentImg
      },
      {
        id: 2,
        name: "FIBA 3x3 Kazan Cup",
        date: "22 августа 2023",
        location: "Казань",
        teamCount: 12,
        image: defaultTournamentImg
      },
      {
        id: 3,
        name: "FIBA 3x3 Saint Petersburg Championship",
        date: "5 сентября 2023",
        location: "Санкт-Петербург",
        teamCount: 24,
        image: defaultTournamentImg
      },
    ];

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

    setPopularTournaments(tournaments);
    setTopPlayers(players);
    setIsLoading(false);
  }, []);

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
              {/* Функционал создания турниров отключен
              {localStorage.getItem("token") && (
                <Link to="/create-tournament" className="gh-button gh-button-outline">
                  Создать турнир <FontAwesomeIcon icon={faTrophy} />
                </Link>
              )}
              */}
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
            <h2 className="gh-section-title">Популярные турниры</h2>
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
          ) : (
            <div className="gh-tournaments-grid">
              {popularTournaments.map((tournament) => (
                <Link to={`/tournament/${tournament.id}`} key={tournament.id} className="gh-tournament-card">
                  <div className="gh-tournament-img">
                    <img 
                      src={tournament.image} 
                      alt={tournament.name} 
                      onError={handleTournamentImageError}
                    />
                  </div>
                  <div className="gh-tournament-content">
                    <h3 className="gh-tournament-title">{tournament.name}</h3>
                    <div className="gh-tournament-meta">
                      <div className="gh-meta-item">
                        <FontAwesomeIcon icon={faCalendarAlt} className="gh-meta-icon" />
                        <span>{tournament.date}</span>
                      </div>
                      <div className="gh-meta-item">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="gh-meta-icon" />
                        <span>{tournament.location}</span>
                      </div>
                      <div className="gh-meta-item">
                        <FontAwesomeIcon icon={faUsers} className="gh-meta-icon" />
                        <span>{tournament.teamCount} команд</span>
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
                <div key={player.id} className="gh-player-row">
                  <div className="gh-player-rank">{index + 1}</div>
                  <div className="gh-player-info">
                    <img 
                      src={player.avatar} 
                      alt={player.name} 
                      className="gh-player-avatar" 
                      onError={handlePlayerImageError}
                    />
                    <div className="gh-player-name">{player.name}</div>
                  </div>
                  <div className="gh-player-team">{player.team}</div>
                  <div className="gh-player-position">{player.position}</div>
                  <div className="gh-player-points">
                    <FontAwesomeIcon icon={faStar} className="gh-points-icon" />
                    {player.points}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Секция с призывом к действию - скрываем для авторизованных пользователей */}
      {!isAuthenticated && (
        <section className="gh-cta">
          <div className="gh-container">
            <div className="gh-cta-content">
              <h2>Готовы стать частью сообщества FIBA 3x3?</h2>
              <p>Присоединяйтесь к сотням игроков и команд, участвуйте в турнирах и развивайте баскетбол 3x3 в России!</p>
              
              <div className="gh-cta-buttons">
                <Link to="/register-user" className="gh-button gh-button-primary">
                  <FontAwesomeIcon icon={faUserPlus} /> Регистрация
                </Link>
                <Link to="/tournaments" className="gh-button gh-button-outline">
                  <FontAwesomeIcon icon={faBasketballBall} /> Найти турнир
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
