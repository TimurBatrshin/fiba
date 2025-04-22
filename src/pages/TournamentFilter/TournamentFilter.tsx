import React, { useState, useEffect } from 'react';
import './TournamentFilter.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faChevronUp, 
  faFilter, 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faTrophy,
  faListAlt
} from '@fortawesome/free-solid-svg-icons';
import { tournamentService } from '../../services/TournamentService';
import { TournamentLevel } from '../../interfaces/Tournament';

interface FilterProps {
  onFilter: (filters: FilterState) => void;
}

interface FilterState {
  date: string;
  location: string;
  level: string;
  status?: string;
}

const TournamentFilter: React.FC<FilterProps> = ({ onFilter }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    date: '',
    location: '',
    level: '',
    status: ''
  });
  const [locations, setLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Получаем список доступных локаций при первой загрузке
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        const tournaments = await tournamentService.getAllTournaments();
        if (Array.isArray(tournaments)) {
          // Извлекаем уникальные локации и отфильтровываем пустые
          const uniqueLocations = Array.from(new Set(tournaments
            .map(t => t.location)
            .filter(loc => loc && loc.trim() !== '')
          ));
          setLocations(uniqueLocations);
        }
      } catch (error) {
        console.error('Ошибка при загрузке локаций:', error);
        // При ошибке загрузки используем моковые данные локаций
        const mockLocations = [
          'Москва', 
          'Санкт-Петербург', 
          'Казань', 
          'Екатеринбург', 
          'Сочи', 
          'Новосибирск'
        ];
        setLocations(mockLocations);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLocations();
  }, []);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Создаем копию для отправки на сервер, чтобы не менять оригинальное состояние
    const filterParams = { ...filters };
    
    // Форматируем date для API если она задана
    if (filterParams.date) {
      // API может ожидать определенный формат даты, оставляем как есть
      // так как input type="date" возвращает строку в формате YYYY-MM-DD
      console.log(`Применяем фильтр по дате: ${filterParams.date}`);
    }
    
    // Конвертируем status в формат API, если задан
    if (filterParams.status) {
      // Преобразуем в формат, ожидаемый API
      switch (filterParams.status) {
        case 'registration':
          filterParams.status = 'upcoming';
          break;
        case 'in_progress':
          filterParams.status = 'ongoing';
          break;
        // для completed оставляем как есть
      }
    }
    
    // Логируем отправляемые параметры фильтра
    console.log('Отправка фильтров на сервер:', filterParams);
    
    onFilter(filterParams);
  };

  const handleReset = () => {
    const emptyFilters = {
      date: '',
      location: '',
      level: '',
      status: ''
    };
    setFilters(emptyFilters);
    onFilter(emptyFilters);
  };

  return (
    <div className="filter-container">
      <div className="filter-header" onClick={handleToggle}>
        <h3><FontAwesomeIcon icon={faFilter} /> Фильтр турниров</h3>
        <button className="filter-toggle" aria-label={isExpanded ? 'Свернуть фильтр' : 'Развернуть фильтр'}>
          <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
        </button>
      </div>
      
      <div className={`filter-content ${isExpanded ? 'expanded' : ''}`}>
        <form className="filter-form" onSubmit={handleSubmit}>
          <div className="filter-group">
            <label htmlFor="date" className="filter-label">
              <FontAwesomeIcon icon={faCalendarAlt} /> Дата
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className="filter-control"
              value={filters.date}
              onChange={handleChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="location" className="filter-label">
              <FontAwesomeIcon icon={faMapMarkerAlt} /> Локация
            </label>
            <select
              id="location"
              name="location"
              className="filter-control"
              value={filters.location}
              onChange={handleChange}
            >
              <option value="">Все локации</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="level" className="filter-label">
              <FontAwesomeIcon icon={faTrophy} /> Уровень турнира
            </label>
            <select
              id="level"
              name="level"
              className="filter-control"
              value={filters.level}
              onChange={handleChange}
            >
              <option value="">Все уровни</option>
              <option value="AMATEUR">Любительский</option>
              <option value="PRO">Профессиональный</option>
              <option value="BUSINESS">Бизнес</option>
              <option value="YOUTH">Молодежный</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="status" className="filter-label">
              <FontAwesomeIcon icon={faListAlt} /> Статус
            </label>
            <select
              id="status"
              name="status"
              className="filter-control"
              value={filters.status}
              onChange={handleChange}
            >
              <option value="">Все статусы</option>
              <option value="registration">Регистрация</option>
              <option value="in_progress">В процессе</option>
              <option value="completed">Завершен</option>
            </select>
          </div>
          
          <div className="filter-actions">
            <button 
              type="button" 
              className="btn btn-outline btn-sm" 
              onClick={handleReset}
              disabled={isLoading}
            >
              Сбросить
            </button>
            <button 
              type="submit" 
              className="btn btn-primary btn-sm"
              disabled={isLoading}
            >
              {isLoading ? 'Загрузка...' : 'Применить фильтры'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentFilter;
