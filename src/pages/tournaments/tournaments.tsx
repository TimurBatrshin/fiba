import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./tournaments.css";  // Импортируем стили
import TournamentFilter from '../TournamentFilter/TournamentFilter';
import defaultTournament from '../../assets/images/default-tournament.jpg';
import { tournamentService } from '../../services/TournamentService';
import { Tournament, TournamentStatus } from '../../interfaces/Tournament';

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
      
      // Загружаем все турниры, затем фильтруем на клиенте
      // В реальном API следует передавать параметры фильтрации на сервер
      let tournamentsData: Tournament[] = [];
      
      if (filters.status === 'completed') {
        tournamentsData = await tournamentService.getCompletedTournaments();
      } else if (filters.status === 'upcoming') {
        tournamentsData = await tournamentService.getUpcomingTournaments();
      } else if (filters.location && filters.location.trim() !== '') {
        tournamentsData = await tournamentService.getTournaments({ location: filters.location });
      } else {
        tournamentsData = await tournamentService.getAllTournaments();
      }
      
      console.log("Получены данные:", tournamentsData);
      
      // Дополнительная фильтрация на клиенте по другим параметрам
      let filteredTournaments = tournamentsData;
      
      if (filters.date) {
        const filterDate = new Date(filters.date);
        filteredTournaments = filteredTournaments.filter(tournament => {
          const tournamentDate = new Date(tournament.date);
          return (
            tournamentDate.getFullYear() === filterDate.getFullYear() &&
            tournamentDate.getMonth() === filterDate.getMonth() &&
            tournamentDate.getDate() === filterDate.getDate()
          );
        });
      }
      
      if (filters.level) {
        filteredTournaments = filteredTournaments.filter(tournament => 
          tournament.level === filters.level
        );
      }
      
      setTournaments(filteredTournaments);
    } catch (error) {
      console.error("Ошибка при загрузке турниров:", error);
      setError("Не удалось загрузить список турниров. Пожалуйста, попробуйте позже.");
      
      // При ошибке загрузки используем моковые данные
      const currentDate = new Date().toISOString();
      const mockTournaments: Tournament[] = [
        {
          id: "1",
          name: "FIBA 3x3 Moscow Open",
          date: new Date().toISOString(),
          startTime: "10:00",
          location: "Москва",
          description: "Открытый турнир по баскетболу 3x3 в Москве",
          status: "UPCOMING",
          level: "AMATEUR",
          imageUrl: "",
          businessType: "COMMUNITY",
          maxTeams: 16,
          entryFee: 2000,
          prizePool: "100 000 ₽",
          isBusinessTournament: false,
          registrationOpen: true,
          createdAt: currentDate,
          updatedAt: currentDate
        },
        {
          id: "2",
          name: "Pro League SPB",
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          startTime: "12:00",
          location: "Санкт-Петербург",
          description: "Профессиональная лига 3x3 в Санкт-Петербурге",
          status: "UPCOMING",
          level: "PRO",
          imageUrl: "",
          businessType: "OFFICIAL",
          maxTeams: 24,
          entryFee: 5000,
          prizePool: "500 000 ₽",
          isBusinessTournament: false,
          registrationOpen: true,
          createdAt: currentDate,
          updatedAt: currentDate
        },
        {
          id: "3",
          name: "Корпоративный турнир Газпром",
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          startTime: "11:00",
          location: "Казань",
          description: "Бизнес турнир для сотрудников Газпром",
          status: "UPCOMING",
          level: "BUSINESS",
          imageUrl: "",
          maxTeams: 12,
          entryFee: 0,
          prizePool: "Ценные призы",
          isBusinessTournament: true,
          sponsorName: "Газпром",
          businessType: "CORPORATE",
          registrationOpen: true,
          createdAt: currentDate,
          updatedAt: currentDate
        }
      ];

      // Применяем фильтры к моковым данным
      let filteredMocks = mockTournaments;
      
      if (filters.location) {
        filteredMocks = filteredMocks.filter(t => 
          t.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      
      if (filters.level) {
        filteredMocks = filteredMocks.filter(t => t.level === filters.level);
      }
      
      if (filters.date) {
        const filterDate = new Date(filters.date);
        filteredMocks = filteredMocks.filter(tournament => {
          const tournamentDate = new Date(tournament.date);
          return (
            tournamentDate.getFullYear() === filterDate.getFullYear() &&
            tournamentDate.getMonth() === filterDate.getMonth() &&
            tournamentDate.getDate() === filterDate.getDate()
          );
        });
      }
      
      setTournaments(filteredMocks);
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
  const getStatusText = (status: TournamentStatus) => {
    switch(status) {
      case 'UPCOMING':
        return 'Регистрация';
      case 'ONGOING':
        return 'В процессе';
      case 'COMPLETED':
        return 'Завершен';
      case 'CANCELLED':
        return 'Отменен';
      default:
        return 'Регистрация';
    }
  };

  // Функция для определения класса статуса
  const getStatusClass = (status: TournamentStatus) => {
    switch(status) {
      case 'UPCOMING':
        return 'status-registration';
      case 'ONGOING':
        return 'status-in-progress';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-registration';
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
          <TournamentFilter onFilter={fetchTournaments} />
          
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
                tournaments.map((tournament) => (
                  <Link 
                    to={`/tournament/${tournament.id}`} 
                    key={tournament.id}
                    className={`tournament-card ${tournament.isBusinessTournament ? 'business-tournament' : ''}`}
                  >
                    <div className="tournament-image">
                      <img 
                        src={tournament.imageUrl || defaultTournament} 
                        alt={tournament.name} 
                        onError={handleImageError}
                      />
                      <div className={`tournament-status ${getStatusClass(tournament.status)}`}>
                        {getStatusText(tournament.status)}
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
                ))
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
