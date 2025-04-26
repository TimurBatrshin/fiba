import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./tournaments.css";  // Импортируем стили
import TournamentFilter from '../TournamentFilter/TournamentFilter';
import defaultTournament from '../../assets/images/default-tournament.jpg';
import { tournamentService } from '../../services/TournamentService';
import { Tournament, TournamentStatus } from '../../interfaces/Tournament';
import { features } from '../../config/features';

interface FilterValues {
  date?: string;
  location?: string;
  level?: string;
  status?: string;
}

const Tournaments: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTournaments = async (filters: FilterValues = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Запрос турниров с параметрами:", filters);
      
      // Загружаем турниры в зависимости от фильтров
      let tournamentsData: Tournament[] = [];
      
      try {
        if (filters.status === 'completed') {
          tournamentsData = await tournamentService.getCompletedTournaments();
        } else if (filters.status === 'upcoming') {
          tournamentsData = await tournamentService.getUpcomingTournaments();
        } else if (filters.location && filters.location.trim() !== '') {
          tournamentsData = await tournamentService.getTournaments({ location: filters.location });
        } else {
          tournamentsData = await tournamentService.getAllTournaments();
        }
      } catch (apiError) {
        console.error("API ошибка при загрузке турниров:", apiError);
        // В случае ошибки API используем пустой массив
        tournamentsData = [];
      }
      
      console.log("Получены данные:", tournamentsData);
      
      // Проверка, что мы получили массив
      if (!Array.isArray(tournamentsData)) {
        console.error("Ошибка: данные не являются массивом:", tournamentsData);
        tournamentsData = [];
      }
      
      // Дополнительная фильтрация на клиенте по другим параметрам
      let filteredTournaments = tournamentsData;
      
      if (filters.date) {
        const filterDate = new Date(filters.date);
        if (!isNaN(filterDate.getTime())) { // Проверка валидности даты
          filteredTournaments = filteredTournaments.filter(tournament => {
            try {
              const tournamentDate = new Date(tournament.date);
              return (
                tournamentDate.getFullYear() === filterDate.getFullYear() &&
                tournamentDate.getMonth() === filterDate.getMonth() &&
                tournamentDate.getDate() === filterDate.getDate()
              );
            } catch (error) {
              console.warn("Ошибка при сравнении дат для турнира:", tournament.id);
              return false;
            }
          });
        } else {
          console.warn("Невалидная дата фильтра:", filters.date);
        }
      }
      
      if (filters.level) {
        filteredTournaments = filteredTournaments.filter(tournament => 
          tournament.level === filters.level
        );
      }
      
      setTournaments(filteredTournaments);
    } catch (error) {
      console.error("Глобальная ошибка при загрузке турниров:", error);
      setError("Не удалось загрузить список турниров. Пожалуйста, попробуйте позже.");
      setTournaments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Загружаем турниры при монтировании компонента
  useEffect(() => {
    fetchTournaments();
  }, []);

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) {
        console.warn("Пустая строка даты");
        return "Дата не указана";
      }

      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Некорректная дата:", dateString);
        return "Дата не указана";
      }
      
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (e) {
      console.error("Ошибка форматирования даты:", e, "для значения:", dateString);
      return "Дата не указана";
    }
  };

  // Функция для определения статуса турнира на русском
  const getStatusText = (status: TournamentStatus, registrationOpen?: boolean) => {
    if (status === 'UPCOMING') {
      // По новой логике, если registrationOpen не определено или null, считаем регистрацию открытой
      return registrationOpen !== false ? 'Регистрация открыта' : 'Регистрация закрыта';
    }
    
    switch(status) {
      case 'ONGOING':
        return 'В процессе';
      case 'COMPLETED':
        return 'Завершен';
      case 'CANCELLED':
        return 'Отменен';
      default:
        return 'Неизвестно';
    }
  };

  // Функция для определения класса статуса
  const getStatusClass = (status: TournamentStatus, registrationOpen?: boolean) => {
    if (status === 'UPCOMING') {
      // По новой логике, если registrationOpen не определено или null, считаем регистрацию открытой
      return registrationOpen !== false ? 'status-registration' : 'status-registration-closed';
    }
    
    switch(status) {
      case 'ONGOING':
        return 'status-in-progress';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  };

  // Обработчик ошибки при загрузке изображения
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log("Ошибка загрузки изображения, заменяем на дефолтное");
    e.currentTarget.src = defaultTournament;
    e.currentTarget.onerror = null; // Предотвращаем бесконечный цикл
  };

  return (
    <div className="tournaments-page">
      <div className="tournaments-hero">
        <div className="container">
          <h1 className="page-title">Турниры</h1>
          <p className="page-description">
            Просмотрите актуальные турниры FIBA 3x3 и зарегистрируйте свою команду
          </p>
        </div>
      </div>
      
      <div className="container">
        <div className="tournaments-content">
          {features.enableTournamentFilter && <TournamentFilter onFilter={fetchTournaments} />}
          
          {isLoading ? (
            <div className="tournaments-loading">
              <div className="spinner"></div>
              <p>Загрузка турниров...</p>
            </div>
          ) : error ? (
            <div className="tournaments-error">
              <p>{error}</p>
              <button 
                className="btn btn-primary" 
                onClick={() => fetchTournaments()}
              >
                Попробовать снова
              </button>
            </div>
          ) : (
            <div className="tournaments-grid">
              {tournaments.length > 0 ? (
                tournaments.map((tournament) => {
                  console.log("Создание ссылки на турнир:", tournament.id, typeof tournament.id);
                  return (
                    <Link 
                      to={`/tournament/${tournament.id}`} 
                      key={tournament.id}
                      className={`tournament-card ${tournament.isBusinessTournament ? 'business-tournament' : ''}`}
                      onClick={(e) => {
                        console.log(`Переход на турнир с ID: ${tournament.id}`);
                      }}
                    >
                      <div className="tournament-image">
                        <img 
                          src={tournament.imageUrl || defaultTournament} 
                          alt={tournament.name} 
                          onError={handleImageError}
                        />
                        <div className={`tournament-status ${getStatusClass(tournament.status, tournament.registrationOpen)}`}>
                          {getStatusText(tournament.status, tournament.registrationOpen)}
                        </div>
                        {tournament.isBusinessTournament && (
                          <div className="tournament-sponsor-badge">
                            Спонсорский
                          </div>
                        )}
                      </div>
                      <div className="tournament-info">
                        <h3 className="tournament-name">{tournament.name}</h3>
                        {tournament.isBusinessTournament && tournament.sponsorName && (
                          <div className="tournament-sponsor">
                            <span className="sponsor-label">Спонсор:</span> {tournament.sponsorName}
                          </div>
                        )}
                        <div className="tournament-meta">
                          <div className="meta-item">
                            <i className="icon-calendar"></i>
                            <span>{formatDate(tournament.date)}</span>
                          </div>
                          <div className="meta-item">
                            <i className="icon-location"></i>
                            <span>{tournament.location}</span>
                          </div>
                          <div className="meta-item">
                            <i className="icon-level"></i>
                            <span>{tournament.level}</span>
                          </div>
                          <div className="meta-item">
                            <i className="icon-trophy"></i>
                            <span>{tournament.prizePool}</span>
                          </div>
                          {tournament.businessType && (
                            <div className="meta-item">
                              <i className="icon-business"></i>
                              <span>{tournament.businessType}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="tournaments-empty">
                  <p>На данный момент нет доступных турниров</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tournaments;
