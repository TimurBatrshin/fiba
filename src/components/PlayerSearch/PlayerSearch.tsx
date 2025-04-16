import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faTimes, faCrown } from '@fortawesome/free-solid-svg-icons';
import { searchPlayers } from '../../services/api/tournaments';
import './PlayerSearch.css';

export interface Player {
  id: string;
  name: string;
  email?: string;
  photoUrl?: string;
  fullName?: string;
}

interface PlayerSearchProps {
  onSelectPlayer: (player: Player) => void;
  selectedPlayers: Player[];
  onRemovePlayer: (playerId: string) => void;
}

export const PlayerSearch: React.FC<PlayerSearchProps> = ({ 
  onSelectPlayer, 
  selectedPlayers,
  onRemovePlayer
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Обработчик поиска игроков
  const handleSearchPlayers = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const players = await searchPlayers(searchQuery);
      setSearchResults(players);
    } catch (error) {
      console.error("Ошибка при поиске игроков:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Обработчик выбора игрока из результатов поиска
  const handleSelectPlayer = (player: Player) => {
    // Проверяем, не выбран ли уже этот игрок
    if (selectedPlayers.some(p => p.id === player.id)) {
      return;
    }
    
    // Добавляем игрока через родительский обработчик
    onSelectPlayer(player);
    
    // Очищаем поиск
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemovePlayer = (playerId: string) => {
    onRemovePlayer(playerId);
  };

  return (
    <div className="player-search-container">
      <h3>Добавить игроков в команду</h3>
      
      <div className="selected-players">
        <h4>Выбранные игроки:</h4>
        {selectedPlayers.length === 0 ? (
          <p>Нет выбранных игроков</p>
        ) : (
          <ul className="players-list">
            {selectedPlayers.map((player, index) => (
              <li key={player.id} className="selected-player">
                <div className="player-info">
                  {player.photoUrl && (
                    <img 
                      src={player.photoUrl} 
                      alt={player.name} 
                      className="player-avatar" 
                    />
                  )}
                  <div className="player-name">
                    {player.fullName || player.name || player.email}
                    {index === 0 && (
                      <span className="captain-badge">
                        <FontAwesomeIcon icon={faCrown} /> Captain
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="remove-player-button"
                  onClick={() => handleRemovePlayer(player.id)}
                  aria-label="Remove player"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="search-box">
        <input
          type="text"
          placeholder="Поиск игрока по имени или email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearchPlayers()}
        />
        <button 
          className="search-button"
          onClick={handleSearchPlayers}
          disabled={isSearching}
        >
          <FontAwesomeIcon icon={faSearch} /> {isSearching ? 'Поиск...' : 'Найти'}
        </button>
      </div>
      
      {searchResults.length > 0 && (
        <div className="search-results">
          <h4>Результаты поиска:</h4>
          <ul>
            {searchResults.map(player => (
              <li 
                key={player.id} 
                className="search-result-item"
                onClick={() => handleSelectPlayer(player)}
              >
                {player.photoUrl && (
                  <img 
                    src={player.photoUrl} 
                    alt={player.name} 
                    className="player-avatar-small" 
                  />
                )}
                <div className="player-details">
                  <span className="player-name">{player.name}</span>
                  {player.email && <span className="player-email">{player.email}</span>}
                </div>
                <button className="add-player-button">
                  <FontAwesomeIcon icon={faPlus} /> Добавить
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 