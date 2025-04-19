import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faTimes, faCrown } from '@fortawesome/free-solid-svg-icons';
import { searchPlayers } from '../../services/api/tournaments';
import defaultAvatar from '../../assets/images/default-avatar.png';
import './PlayerSearch.css';

export interface Player {
  id: string;
  name: string;
  email?: string;
  photoUrl?: string;
  fullName?: string;
  avatar?: string;
  rating?: number;
}

interface PlayerSearchProps {
  // New props
  onSelectedPlayersChange?: (players: Player[]) => void;
  maxPlayers?: number;
  showCaptain?: boolean;
  // Legacy props
  onSelectPlayer?: (player: Player) => void;
  selectedPlayers?: Player[];
  onRemovePlayer?: (playerId: string) => void;
}

export const PlayerSearch: React.FC<PlayerSearchProps> = (props) => {
  const {
    onSelectedPlayersChange,
    maxPlayers = 4,
    showCaptain = true,
    // Legacy props
    onSelectPlayer,
    selectedPlayers: externalSelectedPlayers,
    onRemovePlayer
  } = props;

  const isLegacyMode = !!onSelectPlayer && !!onRemovePlayer;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [internalSelectedPlayers, setInternalSelectedPlayers] = useState<Player[]>([]);
  
  // Get the right selected players array based on mode
  const selectedPlayers = isLegacyMode ? externalSelectedPlayers || [] : internalSelectedPlayers;

  // Handle updates when external selected players change in legacy mode
  useEffect(() => {
    if (isLegacyMode && externalSelectedPlayers) {
      setInternalSelectedPlayers(externalSelectedPlayers);
    }
  }, [isLegacyMode, externalSelectedPlayers]);

  // Обработчик поиска игроков
  const handleSearchPlayers = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const players = await searchPlayers(searchQuery);
      setSearchResults(players);
    } catch (error) {
      console.error("Ошибка при поиске игроков:", error);
      setSearchResults([]);
    }
  };

  // Обработчик выбора игрока из результатов поиска
  const handleSelectPlayer = (player: Player) => {
    // Проверяем, не выбран ли уже этот игрок
    if (selectedPlayers.some(p => p.id === player.id)) {
      return;
    }
    
    if (isLegacyMode && onSelectPlayer) {
      // Legacy mode - call the external handler
      onSelectPlayer(player);
    } else if (onSelectedPlayersChange) {
      // New mode - update internal state and call the callback
      const newSelectedPlayers = [...internalSelectedPlayers, player];
      setInternalSelectedPlayers(newSelectedPlayers);
      onSelectedPlayersChange(newSelectedPlayers);
    } else {
      // Fallback to just internal state
      setInternalSelectedPlayers([...internalSelectedPlayers, player]);
    }
    
    // Очищаем поиск
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemovePlayer = (playerId: string) => {
    if (isLegacyMode && onRemovePlayer) {
      // Legacy mode - call the external handler
      onRemovePlayer(playerId);
    } else if (onSelectedPlayersChange) {
      // New mode - update internal state and call the callback
      const newSelectedPlayers = internalSelectedPlayers.filter(p => p.id !== playerId);
      setInternalSelectedPlayers(newSelectedPlayers);
      onSelectedPlayersChange(newSelectedPlayers);
    } else {
      // Fallback to just internal state
      setInternalSelectedPlayers(internalSelectedPlayers.filter(p => p.id !== playerId));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.src !== defaultAvatar) {
      e.currentTarget.src = defaultAvatar;
    }
    e.currentTarget.onerror = null; // Prevent infinite loop
  };

  return (
    <div className="player-search-container">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search for a player..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
          onKeyPress={(e) => e.key === 'Enter' && handleSearchPlayers()}
        />
        <button 
          className="search-button" 
          onClick={handleSearchPlayers}
          aria-label="Search"
          type="button"
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
        <div className="players-count">
          {selectedPlayers.length}/{maxPlayers} players
        </div>
      </div>

      <div className="selected-players">
        <h3>Selected Players</h3>
        {selectedPlayers.length === 0 ? (
          <p className="no-players-message">No players selected yet</p>
        ) : (
          <ul className="players-list">
            {selectedPlayers.map((player, index) => (
              <li key={player.id} className="selected-player">
                <div className="player-info">
                  <img 
                    src={player.avatar || player.photoUrl || defaultAvatar} 
                    alt={player.name} 
                    className="player-avatar" 
                    onError={handleImageError}
                  />
                  <div className="player-details">
                    <span className="player-name">
                      {player.name}
                      {showCaptain && index === 0 && (
                        <span className="captain-badge">Captain</span>
                      )}
                    </span>
                    {player.rating && <span className="player-rating">{player.rating}</span>}
                  </div>
                </div>
                <button
                  className="remove-player-button"
                  onClick={() => handleRemovePlayer(player.id)}
                  aria-label="Remove player"
                  type="button"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          <ul className="results-list">
            {searchResults.map((player) => {
              const isSelected = selectedPlayers.some((p) => p.id === player.id);
              const isMaxReached = selectedPlayers.length >= maxPlayers;
              return (
                <li
                  key={player.id}
                  className={`result-item ${isSelected ? 'selected' : ''} ${
                    isMaxReached && !isSelected ? 'disabled' : ''
                  }`}
                  onClick={() => {
                    if (!isSelected && !isMaxReached) {
                      handleSelectPlayer(player);
                    } else if (isSelected) {
                      handleRemovePlayer(player.id);
                    }
                  }}
                >
                  <div className="result-player-info">
                    <img 
                      src={player.avatar || player.photoUrl || defaultAvatar} 
                      alt={player.name} 
                      className="result-player-avatar" 
                      onError={handleImageError}
                    />
                    <div className="result-player-details">
                      <span className="result-player-name">{player.name}</span>
                      {player.rating && (
                        <span className="result-player-rating">{player.rating}</span>
                      )}
                    </div>
                  </div>
                  {isSelected ? (
                    <button className="remove-result-button" type="button">Remove</button>
                  ) : (
                    !isMaxReached && <button className="add-result-button" type="button">Add</button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}; 