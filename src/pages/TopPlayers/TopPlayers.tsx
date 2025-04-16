import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBasketball,
  faRankingStar 
} from '@fortawesome/free-solid-svg-icons';
import { StatisticsService } from '../../services/StatisticsService';
import { PlayerBasicStats } from '../../interfaces/PlayerStatistics';
import './TopPlayers.css';
import defaultAvatar from '../../assets/images/default-avatar.png';

// Типы статистических категорий
type StatCategory = 'points' | 'rating';

interface CategoryInfo {
  id: StatCategory;
  label: string;
  icon: any;
  color: string;
  description: string;
}

const TopPlayers: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<StatCategory>('points');
  const [topPlayers, setTopPlayers] = useState<PlayerBasicStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Информация о категориях
  const categories: CategoryInfo[] = [
    {
      id: 'points',
      label: 'Очки',
      icon: faBasketball,
      color: '#007bff',
      description: 'Игроки с наибольшим количеством очков в среднем за игру'
    },
    {
      id: 'rating',
      label: 'Рейтинг',
      icon: faRankingStar,
      color: '#e83e8c',
      description: 'Игроки с наивысшим рейтингом на основе очков'
    }
  ];

  // Получение информации о текущей активной категории
  const getCurrentCategory = (): CategoryInfo => {
    return categories.find(cat => cat.id === activeCategory) || categories[0];
  };

  useEffect(() => {
    const fetchTopPlayers = async () => {
      setLoading(true);
      try {
        const players = await StatisticsService.getTopPlayers(activeCategory, 10);
        setTopPlayers(players);
      } catch (err) {
        console.error(`Ошибка при загрузке топ игроков по категории ${activeCategory}:`, err);
        setError('Не удалось загрузить данные о лучших игроках. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopPlayers();
  }, [activeCategory]);

  // Смена активной категории
  const handleCategoryChange = (category: StatCategory) => {
    setActiveCategory(category);
  };

  // Формирование заголовка
  const renderHeader = () => {
    const currentCategory = getCurrentCategory();
    return (
      <div className="top-players-header">
        <h1>
          <FontAwesomeIcon icon={currentCategory.icon} style={{ color: currentCategory.color }} />
          <span>Лучшие игроки: {currentCategory.label}</span>
        </h1>
        <p className="category-description">{currentCategory.description}</p>
      </div>
    );
  };

  // Формирование категорий
  const renderCategories = () => {
    return (
      <div className="stat-categories">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category.id)}
            style={{ 
              '--category-color': category.color, 
              borderColor: activeCategory === category.id ? category.color : 'transparent' 
            } as React.CSSProperties}
          >
            <FontAwesomeIcon icon={category.icon} />
            <span>{category.label}</span>
          </button>
        ))}
      </div>
    );
  };

  // Рендеринг списка игроков
  const renderPlayersList = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Загрузка лучших игроков...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Попробовать снова
          </button>
        </div>
      );
    }

    return (
      <div className="top-players-list">
        {topPlayers.length > 0 ? (
          topPlayers.map((player, index) => (
            <Link 
              to={`/players/${player.id}/statistics`} 
              key={player.id}
              className="player-card"
            >
              <div className="player-rank">
                <span>{index + 1}</span>
              </div>
              <div className="player-avatar">
                <img 
                  src={player.photoUrl || defaultAvatar} 
                  alt={player.name} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultAvatar;
                  }}
                />
              </div>
              <div className="player-info">
                <h3 className="player-name">{player.name}</h3>
                {player.teamName && (
                  <p className="player-team">{player.teamName}</p>
                )}
              </div>
              <div className="player-stat">
                <span className="stat-value">{player.totalPoints}</span>
                <span className="stat-label">Очков</span>
              </div>
              <div className="player-rating">
                <span className="rating-label">Рейтинг</span>
                <span className="rating-value">{player.rating}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="no-data">
            <p>Нет данных о лучших игроках в этой категории</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="top-players-page">
      {renderHeader()}
      {renderCategories()}
      {renderPlayersList()}
    </div>
  );
};

export default TopPlayers; 