import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../../config/envConfig';
import ApiService from '../../services/ApiService'; // Import ApiService
import "./tournaments.css";  // Импортируем стили
import TournamentFilter from '../TournamentFilter/TournamentFilter';
import defaultTournament from '../../assets/images/default-tournament.jpg';

interface Tournament {
  id: string;
  name?: string;
  title?: string;
  date: string;
  location: string;
  level: string;
  prize_pool: number;
  status: 'registration' | 'in_progress' | 'completed';
  image_url?: string;
  // Бизнес-поля
  sponsor_name?: string;
  sponsor_logo?: string;
  business_type?: string;
}

interface FilterValues {
  date: string;
  location: string;
  level: string;
}

const Tournaments: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTournaments = async (filters: FilterValues = { date: '', location: '', level: '' }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Фильтруем пустые значения перед отправкой на сервер
      const filteredParams = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      console.log("Запрос турниров с параметрами:", filteredParams);
      
      // Use ApiService instead of direct axios call
      const response = await ApiService.get('/tournaments', { 
        params: filteredParams 
      });
      
      console.log("Получены данные:", response);
      
      // Проверим, что данные корректны
      if (Array.isArray(response)) {
        const processedData = response.map(item => {
          // Нормализуем данные
          return {
            id: item.id || '',
            name: item.name || item.title || 'Турнир без названия',
            title: item.title || item.name || 'Турнир без названия',
            date: item.date || new Date().toISOString(),
            location: item.location || 'Не указано',
            level: item.level || 'Любительский',
            prize_pool: item.prize_pool || 0,
            status: item.status || 'registration',
            image_url: item.image_url || null,
            // Бизнес-поля
            sponsor_name: item.sponsor_name || '',
            sponsor_logo: item.sponsor_logo || '',
            business_type: item.business_type || ''
          };
        });
        
        console.log("Обработанные данные:", processedData);
        setTournaments(processedData);
      } else {
        console.warn("Получен некорректный формат данных с сервера:", response);
        setTournaments([]);
        setError("Получены некорректные данные с сервера.");
      }
    } catch (error) {
      console.error("Ошибка при загрузке турниров:", error);
      setError("Не удалось загрузить список турниров. Пожалуйста, попробуйте позже.");
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
  const getStatusText = (status: string) => {
    switch(status) {
      case 'registration':
        return 'Регистрация';
      case 'in_progress':
        return 'В процессе';
      case 'completed':
        return 'Завершен';
      default:
        return 'Регистрация';
    }
  };

  // Функция для определения класса статуса
  const getStatusClass = (status: string) => {
    switch(status) {
      case 'registration':
        return 'status-registration';
      case 'in_progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
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

  // Получает название турнира из объекта
  const getTournamentName = (tournament: Tournament): string => {
    return tournament.name || tournament.title || "Турнир без названия";
  };

  // Проверяет, является ли турнир бизнес-турниром
  const isBusinessTournament = (tournament: Tournament): boolean => {
    return Boolean(tournament.sponsor_name);
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
                    to={`/fiba/tournament/${tournament.id}`} 
                    key={tournament.id}
                    className={`tournament-card ${isBusinessTournament(tournament) ? 'business-tournament' : ''}`}
                  >
                    <div className="tournament-image">
                      <img 
                        src={tournament.image_url || defaultTournament} 
                        alt={getTournamentName(tournament)} 
                        onError={handleImageError}
                      />
                      <div className={`tournament-status ${getStatusClass(tournament.status)}`}>
                        {getStatusText(tournament.status)}
                      </div>
                      {isBusinessTournament(tournament) && (
                        <div className="tournament-sponsor-badge">
                          Спонсорский
                        </div>
                      )}
                    </div>
                    <div className="tournament-info">
                      <h3 className="tournament-name">{getTournamentName(tournament)}</h3>
                      {isBusinessTournament(tournament) && tournament.sponsor_name && (
                        <div className="tournament-sponsor">
                          <span className="sponsor-label">Спонсор:</span> {tournament.sponsor_name}
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
                          <span>{tournament.prize_pool} ₽</span>
                        </div>
                        {tournament.business_type && (
                          <div className="meta-item">
                            <i className="icon-business"></i>
                            <span>{tournament.business_type}</span>
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
