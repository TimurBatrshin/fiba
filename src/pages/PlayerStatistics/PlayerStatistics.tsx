import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  faBasketball, 
  faTrophy, 
  faChartLine, 
  faPercentage, 
  faRankingStar,
  faUsers,
  faArrowTrendUp
} from '@fortawesome/free-solid-svg-icons';
import StatisticsChart from '../../components/charts/StatisticsChart';
import StatCard from '../../components/stats/StatCard';
import { StatisticsService } from '../../services/StatisticsService';
import { 
  PlayerDetailedStats, 
  TournamentPlayerStats, 
  GameStats, 
  PlayerProgress 
} from '../../interfaces/PlayerStatistics';
import './PlayerStatistics.css';
import defaultAvatar from '../../assets/images/default-avatar.png';

const PlayerStatistics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [playerStats, setPlayerStats] = useState<PlayerDetailedStats | null>(null);
  const [tournamentStats, setTournamentStats] = useState<TournamentPlayerStats[]>([]);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        // Получаем данные игрока
        const stats = await StatisticsService.getPlayerDetailedStats(id);
        setPlayerStats(stats);

        // Получаем статистику по турнирам
        const tournamentData = await StatisticsService.getPlayerAllTournamentsStats(id);
        setTournamentStats(tournamentData);

        // Получаем статистику по играм
        const gamesData = await StatisticsService.getPlayerGameStats(id);
        setGameStats(gamesData);

        // Получаем прогресс игрока
        const progressData = await StatisticsService.getPlayerProgress(id);
        setPlayerProgress(progressData);
      } catch (err) {
        console.error('Ошибка при загрузке статистики игрока:', err);
        setError('Не удалось загрузить статистику игрока. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [id]);

  // Расчет процента попаданий
  const calculatePercentage = (made: number, attempted: number): number => {
    if (attempted === 0) return 0;
    return Math.round((made / attempted) * 100);
  };

  // Подготовка данных для графика прогресса рейтинга
  const prepareRatingProgressData = () => {
    if (!playerProgress.length) return { labels: [], datasets: [] };

    return {
      labels: playerProgress.map(item => item.period),
      datasets: [
        {
          label: 'Рейтинг',
          data: playerProgress.map(item => item.rating),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true
        }
      ]
    };
  };

  // Подготовка данных для графика статистики по очкам в играх
  const prepareGamePointsData = () => {
    if (!gameStats.length) return { labels: [], datasets: [] };

    const lastTenGames = [...gameStats].slice(-10);

    return {
      labels: lastTenGames.map(game => game.opponentTeam),
      datasets: [
        {
          label: 'Очки',
          data: lastTenGames.map(game => game.pointsScored),
          backgroundColor: lastTenGames.map(game => 
            game.isWin ? 'rgba(75, 192, 92, 0.8)' : 'rgba(255, 99, 132, 0.8)'
          )
        }
      ]
    };
  };

  // Подготовка данных для графика эффективности бросков
  const prepareShootingData = () => {
    if (!playerStats) return { labels: [], datasets: [] };

    return {
      labels: ['1 очко', '2 очка'],
      datasets: [
        {
          label: 'Процент попаданий',
          data: [
            calculatePercentage(playerStats.onePointsMade, playerStats.onePointsAttempted),
            calculatePercentage(playerStats.twoPointsMade, playerStats.twoPointsAttempted)
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)'
          ]
        }
      ]
    };
  };

  // Подготовка данных для радарного графика всесторонних навыков
  const prepareSkillsRadarData = () => {
    if (!playerStats) return { labels: [], datasets: [] };

    // Расчет нормализованных значений для радарного графика (от 0 до 10)
    const normalizeValue = (value: number, max: number): number => {
      return Math.min(Math.round((value / max) * 10), 10);
    };

    // Максимальные значения для нормализации
    const maxValues = {
      points: 20,
      assists: 5,
      rebounds: 10,
      blocks: 3,
      steals: 5,
      shootingPercentage: 100
    };

    // Расчет процента попаданий общего (комбинированный 1 и 2 очка)
    const totalAttempted = playerStats.onePointsAttempted + playerStats.twoPointsAttempted;
    const totalMade = playerStats.onePointsMade + playerStats.twoPointsMade;
    const shootingPercentage = calculatePercentage(totalMade, totalAttempted);

    return {
      labels: ['Очки', 'Подборы', 'Передачи', 'Блоки', 'Перехваты', 'Броски %'],
      datasets: [
        {
          label: 'Навыки игрока',
          data: [
            normalizeValue(playerStats.pointsPerGame, maxValues.points),
            normalizeValue(playerStats.rebounds / playerStats.gamesPlayed, maxValues.rebounds),
            normalizeValue(playerStats.assists / playerStats.gamesPlayed, maxValues.assists),
            normalizeValue(playerStats.blocks / playerStats.gamesPlayed, maxValues.blocks),
            normalizeValue(playerStats.steals / playerStats.gamesPlayed, maxValues.steals),
            normalizeValue(shootingPercentage, maxValues.shootingPercentage)
          ],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
        }
      ]
    };
  };

  // Рендер основной информации об игроке
  const renderPlayerOverview = () => {
    if (!playerStats) return null;

    const twoPointPercentage = calculatePercentage(
      playerStats.twoPointsMade,
      playerStats.twoPointsAttempted
    );
    
    const onePointPercentage = calculatePercentage(
      playerStats.onePointsMade,
      playerStats.onePointsAttempted
    );

    const winPercentage = playerStats.gamesPlayed > 0 
      ? Math.round((playerStats.wins / playerStats.gamesPlayed) * 100) 
      : 0;

    return (
      <div className="player-overview">
        <div className="stats-row">
          <StatCard 
            title="Рейтинг" 
            value={playerStats.rating} 
            icon={faRankingStar}
            color="#007bff"
          />
          <StatCard 
            title="Очков за игру" 
            value={playerStats.pointsPerGame.toFixed(1)} 
            icon={faBasketball}
            color="#28a745"
          />
          <StatCard 
            title="Процент побед" 
            value={`${winPercentage}%`} 
            icon={faTrophy}
            suffix="%"
            color="#ffc107"
            compareText={`${playerStats.wins} из ${playerStats.gamesPlayed} игр`}
          />
          <StatCard 
            title="Турниров сыграно" 
            value={playerStats.tournamentsPlayed} 
            icon={faUsers}
            color="#dc3545"
          />
        </div>

        <div className="stats-card">
          <h3>Всесторонние навыки игрока</h3>
          <StatisticsChart 
            type="radar"
            labels={prepareSkillsRadarData().labels}
            datasets={prepareSkillsRadarData().datasets}
            title=""
            height={300}
          />
        </div>

        <div className="stats-row">
          <div className="stats-card flex-1">
            <h3>Эффективность бросков</h3>
            <StatisticsChart 
              type="doughnut"
              labels={prepareShootingData().labels}
              datasets={prepareShootingData().datasets}
              title=""
              height={250}
            />
            <div className="shooting-stats">
              <div className="shooting-stat">
                <span className="label">1-очковые</span>
                <span className="value">{playerStats.onePointsMade} / {playerStats.onePointsAttempted}</span>
                <span className="percentage">{onePointPercentage}%</span>
              </div>
              <div className="shooting-stat">
                <span className="label">2-очковые</span>
                <span className="value">{playerStats.twoPointsMade} / {playerStats.twoPointsAttempted}</span>
                <span className="percentage">{twoPointPercentage}%</span>
              </div>
            </div>
          </div>
          <div className="stats-card flex-1">
            <h3>Прогресс рейтинга</h3>
            <StatisticsChart 
              type="line"
              labels={prepareRatingProgressData().labels}
              datasets={prepareRatingProgressData().datasets}
              title=""
              height={250}
            />
          </div>
        </div>

        <div className="stats-card">
          <h3>Очки в последних играх</h3>
          <StatisticsChart 
            type="bar"
            labels={prepareGamePointsData().labels}
            datasets={prepareGamePointsData().datasets}
            title=""
            height={250}
          />
        </div>
      </div>
    );
  };

  // Рендер детальной статистики по играм
  const renderGameStats = () => {
    return (
      <div className="stats-card">
        <h3>Статистика по играм</h3>
        
        {gameStats.length === 0 ? (
          <p className="no-stats">Нет данных о сыгранных играх</p>
        ) : (
          <div className="table-responsive">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Соперник</th>
                  <th>Очки</th>
                  <th>1-очк</th>
                  <th>2-очк</th>
                  <th>Подборы</th>
                  <th>Передачи</th>
                  <th>Перехваты</th>
                  <th>Блоки</th>
                  <th>Потери</th>
                  <th>Фолы</th>
                  <th>Мин</th>
                  <th>Результат</th>
                </tr>
              </thead>
              <tbody>
                {gameStats.map((game) => (
                  <tr key={game.gameId} className={game.isWin ? 'win-row' : 'loss-row'}>
                    <td>{new Date(game.gameDate).toLocaleDateString('ru-RU')}</td>
                    <td>{game.opponentTeam}</td>
                    <td className="highlight">{game.pointsScored}</td>
                    <td>{game.onePointsMade}/{game.onePointsAttempted}</td>
                    <td>{game.twoPointsMade}/{game.twoPointsAttempted}</td>
                    <td>{game.rebounds}</td>
                    <td>{game.assists}</td>
                    <td>{game.steals}</td>
                    <td>{game.blocks}</td>
                    <td>{game.turnovers}</td>
                    <td>{game.personalFouls}</td>
                    <td>{game.minutesPlayed}</td>
                    <td className={`result ${game.isWin ? 'win' : 'loss'}`}>
                      {game.isWin ? 'W' : 'L'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Рендер статистики по турнирам
  const renderTournamentStats = () => {
    return (
      <div className="stats-card">
        <h3>Статистика по турнирам</h3>
        
        {tournamentStats.length === 0 ? (
          <p className="no-stats">Нет данных о сыгранных турнирах</p>
        ) : (
          <div className="table-responsive">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Турнир</th>
                  <th>Дата</th>
                  <th>Игр</th>
                  <th>Побед</th>
                  <th>Очки (всего)</th>
                  <th>Очков за игру</th>
                  <th>1-очк %</th>
                  <th>2-очк %</th>
                  <th>Подборы (всего)</th>
                  <th>Подборов за игру</th>
                </tr>
              </thead>
              <tbody>
                {tournamentStats.map((tournament) => {
                  const onePointPct = calculatePercentage(
                    tournament.onePointsMade, 
                    tournament.onePointsAttempted
                  );
                  const twoPointPct = calculatePercentage(
                    tournament.twoPointsMade, 
                    tournament.twoPointsAttempted
                  );
                  const pointsPerGame = tournament.gamesPlayed > 0 
                    ? (tournament.pointsScored / tournament.gamesPlayed).toFixed(1) 
                    : '0.0';
                  const reboundsPerGame = tournament.gamesPlayed > 0 
                    ? (tournament.rebounds / tournament.gamesPlayed).toFixed(1) 
                    : '0.0';

                  return (
                    <tr key={tournament.tournamentId}>
                      <td>{tournament.tournamentName}</td>
                      <td>{new Date(tournament.date).toLocaleDateString('ru-RU')}</td>
                      <td>{tournament.gamesPlayed}</td>
                      <td>{tournament.wins}</td>
                      <td className="highlight">{tournament.pointsScored}</td>
                      <td>{pointsPerGame}</td>
                      <td>{onePointPct}%</td>
                      <td>{twoPointPct}%</td>
                      <td>{tournament.rebounds}</td>
                      <td>{reboundsPerGame}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Рендер графиков прогресса
  const renderProgressCharts = () => {
    if (!playerProgress.length) {
      return <p className="no-stats">Нет данных о прогрессе игрока</p>;
    }

    return (
      <div className="progress-charts">
        <div className="stats-card">
          <h3>Динамика рейтинга</h3>
          <StatisticsChart 
            type="line"
            labels={playerProgress.map(item => item.period)}
            datasets={[{
              label: 'Рейтинг',
              data: playerProgress.map(item => item.rating),
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              fill: true
            }]}
            title=""
            height={300}
          />
        </div>

        <div className="stats-card">
          <h3>Очки за игру</h3>
          <StatisticsChart 
            type="line"
            labels={playerProgress.map(item => item.period)}
            datasets={[{
              label: 'Очки за игру',
              data: playerProgress.map(item => item.pointsPerGame),
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              fill: true
            }]}
            title=""
            height={300}
          />
        </div>

        <div className="stats-row">
          <div className="stats-card flex-1">
            <h3>Процент попаданий (1 очко)</h3>
            <StatisticsChart 
              type="line"
              labels={playerProgress.map(item => item.period)}
              datasets={[{
                label: 'Процент попаданий 1-очковых',
                data: playerProgress.map(item => item.onePointPercentage),
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.2)',
                fill: true
              }]}
              title=""
              height={250}
            />
          </div>
          <div className="stats-card flex-1">
            <h3>Процент попаданий (2 очка)</h3>
            <StatisticsChart 
              type="line"
              labels={playerProgress.map(item => item.period)}
              datasets={[{
                label: 'Процент попаданий 2-очковых',
                data: playerProgress.map(item => item.twoPointPercentage),
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.2)',
                fill: true
              }]}
              title=""
              height={250}
            />
          </div>
        </div>
      </div>
    );
  };

  // Определяем содержимое активной вкладки
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderPlayerOverview();
      case 'games':
        return renderGameStats();
      case 'tournaments':
        return renderTournamentStats();
      case 'progress':
        return renderProgressCharts();
      default:
        return renderPlayerOverview();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка статистики игрока...</p>
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

  if (!playerStats) {
    return (
      <div className="no-data-container">
        <p>Информация о игроке не найдена</p>
      </div>
    );
  }

  return (
    <div className="player-statistics-page">
      <div className="player-header">
        <div className="player-info">
          <div className="player-avatar">
            <img 
              src={playerStats.photoUrl || defaultAvatar} 
              alt={playerStats.name} 
              onError={(e) => {
                // Обработка ошибки загрузки изображения
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
          </div>
          <div className="player-details">
            <h1>{playerStats.name}</h1>
            {playerStats.teamName && (
              <p className="player-team">Команда: {playerStats.teamName}</p>
            )}
            <div className="player-stats-summary">
              <div className="stat-item">
                <span className="stat-label">Рейтинг</span>
                <span className="stat-value">{playerStats.rating}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Игр</span>
                <span className="stat-value">{playerStats.gamesPlayed}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Очков</span>
                <span className="stat-value">{playerStats.totalPoints}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Очков за игру</span>
                <span className="stat-value">{playerStats.pointsPerGame.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="statistics-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Обзор
        </button>
        <button 
          className={`tab-button ${activeTab === 'games' ? 'active' : ''}`}
          onClick={() => setActiveTab('games')}
        >
          Игры
        </button>
        <button 
          className={`tab-button ${activeTab === 'tournaments' ? 'active' : ''}`}
          onClick={() => setActiveTab('tournaments')}
        >
          Турниры
        </button>
        <button 
          className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          Прогресс
        </button>
      </div>

      <div className="statistics-content">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default PlayerStatistics; 