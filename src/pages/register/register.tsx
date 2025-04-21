import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserService } from "../../services/UserService";
import "./register.css";
import { API_BASE_URL } from '../../config/envConfig';

interface User {
  id: string;
  username: string;
  fullName: string;
  photoUrl?: string;
}

interface RegisterProps {
  tournamentId: string;
}

const Register: React.FC<RegisterProps> = ({ tournamentId }) => {
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState<string[]>(['', '', '', '']);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([null, null, null, null]);
  const [errors, setErrors] = useState<{ teamName?: string; players?: string[]; }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Обработчик клика вне выпадающего списка
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Функция для поиска пользователей
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await UserService.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Ошибка при поиске пользователей:", error);
      setSearchResults([]);
    }
  };

  // Обработчик ввода в поле поиска
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
    
    setSearchQuery(value);
    setActiveSearchIndex(index);
    setDropdownVisible(true);
    searchUsers(value);
    
    // Сбрасываем ошибку при вводе
    if (errors.players && errors.players[index]) {
      const newPlayerErrors = [...(errors.players || [])];
      newPlayerErrors[index] = '';
      setErrors({ ...errors, players: newPlayerErrors });
    }
  };

  // Выбор пользователя из выпадающего списка
  const handleSelectUser = (user: User) => {
    if (activeSearchIndex !== null) {
      const newPlayers = [...players];
      newPlayers[activeSearchIndex] = user.fullName;
      setPlayers(newPlayers);
      
      const newSelectedUsers = [...selectedUsers];
      newSelectedUsers[activeSearchIndex] = user;
      setSelectedUsers(newSelectedUsers);
      
      setDropdownVisible(false);
      setSearchQuery('');
    }
  };

  const validateForm = () => {
    const newErrors: { teamName?: string; players?: string[]; } = {};
    let isValid = true;

    if (!teamName.trim()) {
      newErrors.teamName = 'Название команды обязательно';
      isValid = false;
    }

    const playerErrors: string[] = [];
    let hasPlayerError = false;

    players.forEach((player, index) => {
      if (!player.trim() || !selectedUsers[index]) {
        playerErrors[index] = `Игрок ${index + 1} должен быть выбран из системы`;
        hasPlayerError = true;
        isValid = false;
      } else {
        playerErrors[index] = '';
      }
    });

    if (hasPlayerError) {
      newErrors.players = playerErrors;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Подготавливаем данные пользователей для отправки
      const playerIds = selectedUsers
        .filter(user => user !== null)
        .map(user => user.id);
      
      const response = await axios.post(`${API_BASE_URL}/tournaments/${tournamentId}/register`, {
        teamName,
        playerIds
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/fiba/tournament/${tournamentId}`);
        }, 2000);
      }
    } catch (error: any) {
      console.error('Ошибка при регистрации команды:', error);
      
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Произошла ошибка при регистрации команды.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page container">
      <div className="register-card card animate-fade-in">
        <div className="register-header">
          <h1>Регистрация команды</h1>
          <p>Заполните информацию о вашей команде для участия в турнире</p>
        </div>
        
        {success ? (
          <div className="success-message">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1954 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Регистрация успешна!</h3>
            <p>Ваша команда успешно зарегистрирована на турнир.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="teamName" className="form-label">Название команды</label>
              <input
                id="teamName"
                type="text"
                className={`form-control ${errors.teamName ? 'is-invalid' : ''}`}
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  if (errors.teamName) {
                    setErrors({ ...errors, teamName: undefined });
                  }
                }}
                placeholder="Введите название вашей команды"
                disabled={isLoading}
              />
              {errors.teamName && <div className="form-error">{errors.teamName}</div>}
            </div>
            
            <div className="players-section">
              <h3>Состав команды</h3>
              <p className="players-info">Укажите игроков (3 основных + 1 запасной). Выберите их из базы данных.</p>
              
              {players.map((player, index) => (
                <div className="form-group" key={index}>
                  <label htmlFor={`player${index}`} className="form-label">
                    {index === 3 ? 'Запасной игрок' : `Игрок ${index + 1}`}
                  </label>
                  <div className="player-input-wrapper">
                    <span className="player-number">{index + 1}</span>
                    <div className="search-dropdown-container">
                      <input
                        id={`player${index}`}
                        type="text"
                        className={`form-control ${errors.players && errors.players[index] ? 'is-invalid' : ''}`}
                        value={player}
                        onChange={(e) => handleSearchInputChange(e, index)}
                        onFocus={() => {
                          setActiveSearchIndex(index);
                          if (player.length >= 2) {
                            setDropdownVisible(true);
                            searchUsers(player);
                          }
                        }}
                        placeholder="Начните вводить имя игрока"
                        disabled={isLoading}
                      />
                      
                      {activeSearchIndex === index && dropdownVisible && (
                        <div className="search-dropdown" ref={dropdownRef}>
                          {searchResults.length > 0 ? (
                            searchResults.map((user) => (
                              <div 
                                key={user.id} 
                                className="dropdown-item"
                                onClick={() => handleSelectUser(user)}
                              >
                                <div className="user-info">
                                  {user.photoUrl && (
                                    <img 
                                      src={user.photoUrl} 
                                      alt={user.fullName} 
                                      className="user-avatar"
                                    />
                                  )}
                                  <div className="user-name">{user.fullName}</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            searchQuery.length >= 2 ? (
                              <div className="no-results">Пользователи не найдены</div>
                            ) : (
                              <div className="search-hint">Введите минимум 2 символа</div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.players && errors.players[index] && (
                    <div className="form-error">{errors.players[index]}</div>
                  )}
                  {selectedUsers[index] && (
                    <div className="selected-user-info">
                      <span className="check-icon">✓</span> Выбран: {selectedUsers[index].fullName}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => navigate(`/fiba/tournament/${tournamentId}`)}
                disabled={isLoading}
              >
                Отмена
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="button-loader">
                    <span className="loader-dot"></span>
                    <span className="loader-dot"></span>
                    <span className="loader-dot"></span>
                  </div>
                ) : "Зарегистрировать команду"}
              </button>
            </div>
            
            <div className="form-info">
              <p>Регистрируясь на турнир, вы соглашаетесь с правилами турнира и кодексом поведения FIBA 3x3.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
