import React from 'react';
import { Player } from '../services/PlayerService';
import { ProfilePhoto } from './ProfilePhoto/ProfilePhoto';
import './TopPlayers.css';

interface TopPlayersProps {
  players: Player[];
  isLoading?: boolean;
}

export const TopPlayers: React.FC<TopPlayersProps> = ({ players, isLoading = false }) => {
  return (
    <div className="top-players">
      <h2>Top Players</h2>
      <div className="players-list">
        {players.map((player) => (
          <div key={player.id} className="player-item">
            <div className="player-photo">
              <ProfilePhoto 
                userId={player.id} 
                photoUrl={player.photoUrl || player.avatar}
                className="player-avatar"
              />
            </div>
            <div className="player-info">
              <div className="player-name">{player.name}</div>
              <div className="player-rating">Rating: {player.rating || 'N/A'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 