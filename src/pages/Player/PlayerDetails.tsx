import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { playerService, PlayerStatistics } from '../../services/PlayerService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrophy, faStar } from '@fortawesome/free-solid-svg-icons';
import { UserPhoto } from '../../components/UserPhoto/UserPhoto';
import './PlayerDetails.css';

const PlayerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<PlayerStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        const data = await playerService.getPlayerStatistics(id!);
        setPlayer(data);
        setError(null);
      } catch (err: any) {
        console.error('Ошибка при загрузке данных игрока:', err);
        setError(err.message || 'Произошла ошибка при загрузке данных игрока');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlayerData();
    }
  }, [id]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultAvatar;
    e.currentTarget.onerror = null; // Prevent infinite loop
  };

  if (loading) {
    return (
      <div className="player-details-container loading">
        <div className="loading-spinner"></div>
        <p>Загрузка информации об игроке...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="player-details-container error">
        <h2>Ошибка</h2>
        <p>{error}</p>
        <Link to="/top-players" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Вернуться к списку игроков
        </Link>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="player-details-container error">
        <h2>Игрок не найден</h2>
        <p>Информация об игроке не найдена.</p>
        <Link to="/top-players" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Вернуться к списку игроков
        </Link>
      </div>
    );
  }

  return (
    <div className="player-details-container">
      <div className="player-details-header">
        <Link to="/top-players" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> К списку игроков
        </Link>
      </div>

      <div className="player-profile">
        <div className="player-avatar-container">
          <UserPhoto 
            photoUrl={player.photoUrl}
            alt={player.name}
            className="player-avatar"
          />
          {player.rating !== undefined && (
            <div className="player-rating">
              <FontAwesomeIcon icon={faStar} />
              <span>{player.rating}</span>
            </div>
          )}
        </div>

        <div className="player-info">
          <h1>{player.name}</h1>
          {player.teamName && <p className="player-team">Команда: {player.teamName}</p>}
          {player.position && <p className="player-position">Позиция: {player.position}</p>}
          {player.totalPoints !== undefined && (
            <p className="player-points">Очки: {player.totalPoints}</p>
          )}
        </div>
      </div>

      <div className="player-statistics">
        <h2>Статистика</h2>
        <div className="statistics-container">
          <div className="statistic-card">
            <div className="statistic-value">{player.tournaments?.length || 0}</div>
            <div className="statistic-label">Турниров</div>
          </div>
          <div className="statistic-card">
            <div className="statistic-value">{player.totalPoints || 0}</div>
            <div className="statistic-label">Очков</div>
          </div>
          <div className="statistic-card">
            <div className="statistic-value">{player.rating || 0}</div>
            <div className="statistic-label">Рейтинг</div>
          </div>
        </div>
      </div>

      {player.tournaments && player.tournaments.length > 0 && (
        <div className="player-tournaments">
          <h2>История турниров</h2>
          <div className="tournaments-list">
            {player.tournaments.map(tournament => (
              <Link 
                to={`/tournament/${tournament.id}`} 
                className="tournament-card" 
                key={tournament.id}
              >
                <div className="tournament-info">
                  <h3>{tournament.name}</h3>
                  <p className="tournament-date">{tournament.date}</p>
                </div>
                {tournament.place && (
                  <div className="tournament-place">
                    <FontAwesomeIcon icon={faTrophy} />
                    <span>{tournament.place} место</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerDetails; 