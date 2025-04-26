import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faTimes, faCrown } from '@fortawesome/free-solid-svg-icons';
import { playerService, SearchPlayer } from '../../services/PlayerService';
import { UserPhoto } from '../../components/UserPhoto/UserPhoto';
import './PlayerSearch.css';
import api from '../../api/client';
import { UserProfile } from '../../interfaces/Auth';

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
        const response = await playerService.searchPlayers(query.trim());
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
      const response = await playerService.searchPlayers(searchQuery.trim());
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
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>

      {/* Результаты поиска */}
      {searchResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Результаты поиска</h3>
          <div className="space-y-2">
            {searchResults.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <UserPhoto
                    photoUrl={player.profile?.photo_url}
                    alt={player.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <span>{player.name}</span>
                </div>
                <button
                  onClick={() => handleSelectPlayer(player)}
                  className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                  disabled={selectedPlayers.some((p) => p.id === player.id)}
                >
                  {selectedPlayers.some((p) => p.id === player.id)
                    ? 'Добавлен'
                    : 'Добавить'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Список выбранных игроков */}
      {!hideSelectedPlayersList && selectedPlayers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Список выбранных игроков</h3>
          <div className="space-y-2">
            {selectedPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="flex items-center space-x-2">
                  <UserPhoto
                    photoUrl={player.profile?.photo_url}
                    alt={player.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <span>{player.name}</span>
                </div>
                <button
                  onClick={() => handleRemovePlayer(player.id)}
                  className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchError && (
        <div className="search-error">
          {searchError}
        </div>
      )}
    </div>
  );
};