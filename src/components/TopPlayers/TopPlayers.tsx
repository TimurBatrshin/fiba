import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import defaultAvatar from '../../assets/images/default-avatar.png';
import ProfileAvatar from '../Profile/ProfileAvatar';
import './TopPlayers.css';

export interface TopPlayer {
  id: string;
  name: string;
  team?: string;
  position?: string;
  points: number;
  photoUrl?: string;
}

interface TopPlayersProps {
  players: TopPlayer[];
  limit?: number;
  showAllLink?: boolean;
}

export const TopPlayers: React.FC<TopPlayersProps> = ({ 
  players, 
  limit = 5, 
  showAllLink = true 
}) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultAvatar;
    e.currentTarget.onerror = null; // Prevent infinite loop
  };

  const displayedPlayers = limit ? players.slice(0, limit) : players;

  return (
    <div className="top-players-container">
      <div className="top-players-header">
        <h2>Лучшие игроки</h2>
        {showAllLink && (
          <Link to="/players" className="see-all-link">
            Все игроки <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        )}
      </div>

      <div className="top-players-table">
        <div className="top-players-table-header">
          <div className="player-rank">#</div>
          <div className="player-info">Игрок</div>
          <div className="player-team">Команда</div>
          <div className="player-position">Позиция</div>
          <div className="player-points">Очки</div>
        </div>

        <div className="top-players-table-body">
          {displayedPlayers.map((player, index) => (
            <Link 
              to={`/players/${player.id}`} 
              className="top-player-row" 
              key={player.id}
            >
              <div className="player-rank">{index + 1}</div>
              <div className="player-info">
                <ProfileAvatar 
                  userId={parseInt(player.id)} 
                  className="player-avatar"
                />
                <div className="player-name">{player.name}</div>
              </div>
              <div className="player-team">{player.team || '—'}</div>
              <div className="player-position">{player.position || '—'}</div>
              <div className="player-points">
                {player.points} <FontAwesomeIcon icon={faStar} className="star-icon" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopPlayers; 