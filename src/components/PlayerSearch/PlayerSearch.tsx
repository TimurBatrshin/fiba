import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faTimes, faCrown } from '@fortawesome/free-solid-svg-icons';
import { playerService, SearchPlayer } from '../../services/PlayerService';
import defaultAvatar from '../../assets/images/default-avatar.png';
import './PlayerSearch.css';
import api from '../../api/client';

export interface PlayerSearchProps {
  onSelectPlayer?: (player: SearchPlayer) => void;
  onRemovePlayer?: (playerId: string) => void;
  selectedPlayers?: SearchPlayer[];
  onSelectedPlayersChange?: (players: SearchPlayer[]) => void;
  maxPlayers?: number;
  showCaptain?: boolean;
  disabled?: boolean;
  hideSelectedPlayersList?: boolean;
}

export const PlayerSearch: React.FC<PlayerSearchProps> = (props) => {
  const {
    onSelectedPlayersChange,
    maxPlayers = 4,
    showCaptain = true,
    disabled = false,
    hideSelectedPlayersList = false,
    // Legacy props
    onSelectPlayer,
    selectedPlayers: externalSelectedPlayers,
    onRemovePlayer
  } = props;

  const isLegacyMode = !!onSelectPlayer && !!onRemovePlayer;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchPlayer[]>([]);
  const [internalSelectedPlayers, setInternalSelectedPlayers] = useState<SearchPlayer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get the right selected players array based on mode
  const selectedPlayers = isLegacyMode ? externalSelectedPlayers || [] : internalSelectedPlayers;

  // Handle updates when external selected players change in legacy mode
  useEffect(() => {
    if (isLegacyMode && externalSelectedPlayers) {
      setInternalSelectedPlayers(externalSelectedPlayers);
    }
  }, [isLegacyMode, externalSelectedPlayers]);

  // Дебаунсированный поиск игроков
  const debouncedSearch = useCallback((query: string) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(async () => {
      if (!query.trim() || query.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        setSearchError(null);
        return;
      }
      
      setIsSearching(true);
      setSearchError(null);
      try {
        // Use direct API client instead of the service
        const response = await api.get<SearchPlayer[]>('/players/search', { 
          params: { query } 
        });
        setSearchResults(response || []);
      } catch (error: any) {
        console.error("Ошибка при поиске игроков:", error);
        setSearchResults([]);
        
        // Обработка различных типов ошибок
        if (error instanceof Error) {
          if (error.message.includes('Unauthorized')) {
            setSearchError('Пожалуйста, войдите в систему для выполнения поиска');
          } else {
            setSearchError(`Ошибка при поиске игроков: ${error.message}`);
          }
        } else {
          setSearchError('Произошла неизвестная ошибка при поиске');
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  // Обработчик поиска игроков
  const handleSearchPlayers = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    try {
      // Use direct API client instead of the service
      const response = await api.get<SearchPlayer[]>('/players/search', { 
        params: { query: searchQuery } 
      });
      setSearchResults(response || []);
    } catch (error: any) {
      console.error("Ошибка при поиске игроков:", error);
      setSearchResults([]);
      
      // Обработка различных типов ошибок
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized')) {
          setSearchError('Пожалуйста, войдите в систему для выполнения поиска');
        } else {
          setSearchError(`Ошибка при поиске игроков: ${error.message}`);
        }
      } else {
        setSearchError('Произошла неизвестная ошибка при поиске');
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Обработчик выбора игрока из результатов поиска
  const handleSelectPlayer = (player: SearchPlayer) => {
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

  const handleRemovePlayer = (playerId: string | number) => {
    if (isLegacyMode && onRemovePlayer) {
      // Legacy mode - call the external handler
      onRemovePlayer(String(playerId));
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
    const value = e.target.value;
    setSearchQuery(value);
    
    // Запускаем дебаунсированный поиск по мере ввода
    debouncedSearch(value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.src !== defaultAvatar) {
      e.currentTarget.src = defaultAvatar;
    }
    e.currentTarget.onerror = null; // Prevent infinite loop
  };

  return (
    <div className={`player-search-container ${disabled ? 'disabled' : ''}`}>
      <div className="search-box">
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Введите имя или email игрока..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearchPlayers()}
            disabled={disabled}
          />
          {searchQuery && (
            <button
              className="clear-search-button"
              onClick={handleClearSearch}
              aria-label="Очистить поиск"
              type="button"
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999'
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        <button 
          className="search-button" 
          onClick={handleSearchPlayers}
          aria-label="Поиск"
          type="button"
          disabled={isSearching || disabled}
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
        <div className="players-count">
          {selectedPlayers.length}/{maxPlayers} игроков
        </div>
      </div>

      {searchError && (
        <div className="search-error">
          <p>{searchError}</p>
        </div>
      )}

      {!hideSelectedPlayersList && (
        <div className="selected-players">
          <h3>Выбранные игроки</h3>
          {selectedPlayers.length === 0 ? (
            <p className="no-players-message">Игроки еще не выбраны</p>
          ) :
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
                          <span className="captain-badge">Капитан</span>
                        )}
                      </span>
                      {player.rating && <span className="player-rating">{player.rating}</span>}
                    </div>
                  </div>
                  <button
                    className="remove-player-button"
                    onClick={() => handleRemovePlayer(player.id)}
                    aria-label="Удалить игрока"
                    type="button"
                    disabled={disabled}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          }
        </div>
      )}

      {isSearching && (
        <div className="search-loading">Поиск игроков...</div>
      )}

      {searchResults.length > 0 && !isSearching && (
        <div className="search-results">
          <h3>Результаты поиска</h3>
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
                    if (disabled) return;
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
                        <span className="result-player-rating">Рейтинг: {player.rating}</span>
                      )}
                    </div>
                  </div>
                  {isSelected ? (
                    <button className="remove-result-button" type="button" disabled={disabled}>Удалить</button>
                  ) : (
                    !isMaxReached && <button className="add-result-button" type="button" disabled={disabled}>Добавить</button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="no-results">Игроки не найдены. Попробуйте изменить запрос.</div>
      )}
    </div>
  );
};