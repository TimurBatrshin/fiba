import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { playerService, PlayerStatistics as PlayerStatsType } from '../../services/PlayerService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChartLine, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { UserPhoto } from '../../components/UserPhoto/UserPhoto';
import './PlayerStatistics.css';

const PlayerStatistics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [playerStats, setPlayerStats] = useState<PlayerStatsType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      try {
        setLoading(true);
        const data = await playerService.getPlayerStatistics(id!);
        setPlayerStats(data);
        setError(null);
      } catch (err: any) {
        console.error('Ошибка при загрузке статистики игрока:', err);
        setError(err.message || 'Произошла ошибка при загрузке статистики игрока');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlayerStats();
    }
  }, [id]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null; // Prevent infinite loop
  };

  if (loading) {
    return (
      <div className="player-statistics-container loading">
        <div className="loading-spinner"></div>
        <p>Загрузка статистики игрока...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="player-statistics-container error">
        <h2>Ошибка</h2>
        <p>{error}</p>
        <Link to="/top-players" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Вернуться к списку игроков
        </Link>
      </div>
    );
  }

  if (!playerStats) {
    return (
      <div className="player-statistics-container error">
        <h2>Статистика не найдена</h2>
        <p>Статистика игрока не найдена.</p>
        <Link to="/top-players" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Вернуться к списку игроков
        </Link>
      </div>
    );
  }

  return (
    <div className="player-statistics-container">
      <div className="player-statistics-header">
        <Link to={`/players/${id}`} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> К профилю игрока
        </Link>
        <h1>
          <img 
            src={playerStats.photoUrl || defaultAvatar} 
            alt={playerStats.name} 
            className="player-avatar-small" 
            onError={handleImageError}
          />
          Статистика игрока: {playerStats.name}
        </h1>
      </div>

      <div className="statistics-summary">
        <div className="stat-card">
          <div className="stat-value">{playerStats.rating}</div>
          <div className="stat-label">Рейтинг</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{playerStats.totalGames}</div>
          <div className="stat-label">Игр</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{playerStats.totalPoints}</div>
          <div className="stat-label">Всего очков</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{playerStats.avgPoints.toFixed(1)}</div>
          <div className="stat-label">Очков за игру</div>
        </div>
      </div>

      <div className="statistics-details">
        <h2><FontAwesomeIcon icon={faChartLine} /> Детальная статистика</h2>
        
        <div className="stats-chart">
          <h3>Динамика набранных очков</h3>
          <div className="chart-placeholder">
            {/* В будущем здесь может быть график с использованием библиотеки для визуализации данных */}
            <div className="chart-bars">
              {playerStats.pointsHistory.map((points, index) => (
                <div 
                  key={index} 
                  className="chart-bar" 
                  style={{ height: `${(points / Math.max(...playerStats.pointsHistory)) * 100}%` }}
                  title={`Игра ${index + 1}: ${points} очков`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="tournament-history">
        <h2><FontAwesomeIcon icon={faTrophy} /> История турниров</h2>
        
        <div className="tournaments-table">
          <div className="table-header">
            <div className="th">Турнир</div>
            <div className="th">Дата</div>
            <div className="th">Очки</div>
            <div className="th">Место</div>
          </div>
          
          <div className="table-body">
            {playerStats.tournaments.map(tournament => (
              <Link to={`/tournament/${tournament.id}`} className="table-row" key={tournament.id}>
                <div className="td tournament-name">{tournament.name}</div>
                <div className="td tournament-date">{tournament.date}</div>
                <div className="td tournament-points">{tournament.points}</div>
                <div className="td tournament-place">
                  {tournament.place ? (
                    <>
                      <span className={`place-badge place-${Math.min(tournament.place, 4)}`}>
                        {tournament.place}
                      </span>
                    </>
                  ) : '—'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatistics; 